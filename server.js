const express = require('express');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');
const { ContainmentGateway } = require('./safety-engine');
const { loadEnterpriseConfig } = require('./lib/enterprise-config');
const { ReportStore } = require('./lib/report-store');
const { ThreatService } = require('./lib/threat-service');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const NODE_ENV = process.env.NODE_ENV || 'development';
const enterpriseConfig = loadEnterpriseConfig();

app.disable('x-powered-by');
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

const users = [
  {
    id: 1,
    username: 'admin',
    passwordHash: hashPassword(process.env.ADMIN_PASSWORD || 'SecurePass2026!'),
    role: 'Administrator',
    team: 'SOC Leadership',
    name: 'Ava Chen'
  },
  {
    id: 2,
    username: 'analyst',
    passwordHash: hashPassword(process.env.ANALYST_PASSWORD || 'AnalystPass2026!'),
    role: 'Analyst',
    team: 'Detection Engineering',
    name: 'Marcus Lee'
  },
  {
    id: 3,
    username: 'responder',
    passwordHash: hashPassword(process.env.RESPONDER_PASSWORD || 'ResponderPass2026!'),
    role: 'Responder',
    team: 'Incident Response',
    name: 'Nadia Patel'
  }
];

const sessions = new Map();
const containmentGateway = new ContainmentGateway({ scanIntervalMs: 8000 });
containmentGateway.startBackgroundMonitoring();
const reportStore = new ReportStore({
  baseDir: path.resolve(__dirname, enterpriseConfig.dataDir),
  retentionDays: enterpriseConfig.reportRetentionDays
});
const threatService = new ThreatService({ config: enterpriseConfig, store: reportStore });

const assets = [
  { id: 'AS-1001', name: 'Finance Gateway', owner: 'Ops', criticality: 'Critical', department: 'Finance', status: 'Protected', lastSeen: '2 min ago', controls: ['EDR', 'MFA', 'SIEM'] },
  { id: 'AS-1032', name: 'HR Identity Service', owner: 'Identity', criticality: 'High', department: 'HR', status: 'Monitoring', lastSeen: '18 min ago', controls: ['PAM', 'Conditional Access'] },
  { id: 'AS-1178', name: 'Executive Laptop', owner: 'IT', criticality: 'High', department: 'Executive', status: 'At Risk', lastSeen: '7 min ago', controls: ['Defender', 'Disk Encryption'] }
];

const alerts = [
  { id: 'AL-201', title: 'Credential stuffing attempt detected', severity: 'High', source: 'Identity Provider', asset: 'HR Identity Service', observedAt: '2026-07-28T10:18:00Z', status: 'Open', summary: 'Repeated password spray activity observed against a privileged account.' },
  { id: 'AL-202', title: 'Unusual PowerShell execution', severity: 'Medium', source: 'Endpoint', asset: 'Finance Gateway', observedAt: '2026-07-28T10:12:40Z', status: 'Acknowledged', summary: 'A suspicious script executed outside normal business hours.' },
  { id: 'AL-203', title: 'Outbound beaconing pattern', severity: 'Critical', source: 'Network', asset: 'Executive Laptop', observedAt: '2026-07-28T10:03:15Z', status: 'Open', summary: 'Beaconing to a newly observed external destination is under investigation.' }
];

const incidents = [
  { id: 'INC-440', title: 'Possible phishing campaign targeting finance staff', severity: 'High', status: 'Investigating', owner: 'Nadia Patel', sla: '45 min', createdAt: '2026-07-28T09:50:00Z', summary: 'Multiple messages impersonated the finance help desk and contained credential harvesting links.' },
  { id: 'INC-441', title: 'Privileged account lockout spike', severity: 'Medium', status: 'Contained', owner: 'Marcus Lee', sla: '2 hrs', createdAt: '2026-07-28T08:40:00Z', summary: 'A burst of repeated lockout events was contained after enforcing conditional access rules.' }
];

const playbooks = [
  { id: 'PB-01', name: 'Phishing Containment', objective: 'Contain phishing emails and reset impacted credentials.', owner: 'Incident Response', duration: '20 min' },
  { id: 'PB-02', name: 'Credential Spray Triage', objective: 'Validate suspicious logins and block IP ranges.', owner: 'Detection Engineering', duration: '35 min' },
  { id: 'PB-03', name: 'Malware Beacon Investigation', objective: 'Investigate suspicious outbound communication and isolate host.', owner: 'SOC', duration: '45 min' }
];

function makeToken() {
  return crypto.randomUUID();
}

function getSessionUser(req) {
  const token = req.headers['x-session-token'];
  if (!token) return null;

  const session = sessions.get(token);
  if (!session) return null;

  if (Date.now() > session.expiresAt) {
    sessions.delete(token);
    return null;
  }

  return session.user;
}

function authMiddleware(req, res, next) {
  const user = getSessionUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  req.user = user;
  next();
}

function requireRole(allowedRoles) {
  return (req, res, next) => {
    const role = req.user.role;
    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ error: 'Insufficient privileges.' });
    }
    next();
  };
}

function getClientIp(req) {
  const xff = req.headers['x-forwarded-for'];
  if (typeof xff === 'string' && xff.trim()) {
    return xff.split(',')[0].trim();
  }

  return req.ip || req.socket?.remoteAddress || null;
}

function requireThreatRole(req, res, next) {
  return requireRole(['Administrator', 'Analyst', 'Responder'])(req, res, next);
}

function errorResponder(error, req, res) {
  const status = error.statusCode || 500;
  const payload = {
    error: status >= 500 ? 'Internal server error.' : error.message
  };

  if (status >= 500) {
    console.error('Threat API error:', error);
  }

  return res.status(status).json(payload);
}

app.get('/api/auth/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const suppliedHash = hashPassword(password || '');
  const user = users.find((candidate) => candidate.username === username && candidate.passwordHash === suppliedHash);

  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password.' });
  }

  const token = makeToken();
  sessions.set(token, { user, expiresAt: Date.now() + 1000 * 60 * 60 * 10 });

  return res.json({ token, user });
});

app.post('/api/auth/logout', authMiddleware, (req, res) => {
  const token = req.headers['x-session-token'];
  if (token) {
    sessions.delete(token);
  }
  return res.json({ success: true });
});

app.get('/api/dashboard', authMiddleware, (req, res) => {
  const criticalAlerts = alerts.filter((alert) => alert.severity === 'Critical').length;
  const openIncidents = incidents.filter((incident) => incident.status !== 'Resolved').length;

  res.json({
    summary: {
      monitoredAssets: assets.length,
      criticalAlerts,
      openIncidents,
      meanTimeToContain: '14 min',
      complianceScore: 92
    },
    recentAlerts: alerts.slice(0, 3),
    activeIncidents: incidents.filter((incident) => incident.status !== 'Resolved').slice(0, 2),
    operationsNote: 'The environment is operating within expected thresholds. One critical beaconing event remains under active review.'
  });
});

app.get('/api/assets', authMiddleware, (req, res) => {
  res.json(assets);
});

app.get('/api/alerts', authMiddleware, (req, res) => {
  res.json(alerts);
});

app.get('/api/incidents', authMiddleware, (req, res) => {
  res.json(incidents);
});

app.get('/api/playbooks', authMiddleware, (req, res) => {
  res.json(playbooks);
});

app.get('/healthz', (req, res) => {
  res.json({ status: 'ok', environment: NODE_ENV, uptimeSeconds: Math.round(process.uptime()) });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', environment: NODE_ENV, uptimeSeconds: Math.round(process.uptime()) });
});

app.get('/api/safety/status', authMiddleware, (req, res) => {
  res.json(containmentGateway.getStatus());
});

app.post('/api/safety/evaluate', authMiddleware, (req, res) => {
  const result = containmentGateway.evaluateAction(req.body);
  const status = {
    allowed: result.allowed,
    blocked: result.blocked,
    reason: result.reason,
    containmentActive: containmentGateway.isContainmentActive,
    alert: result.alert
  };

  if (!result.allowed) {
    alerts.unshift({
      id: result.alert.id,
      title: 'Containment action blocked',
      severity: 'High',
      source: 'Safety Gateway',
      asset: 'User workstation',
      observedAt: new Date().toISOString(),
      status: 'Open',
      summary: result.reason
    });
  }

  res.json(status);
});

app.post('/api/safety/reset', authMiddleware, requireRole(['Administrator']), (req, res) => {
  containmentGateway.resetContainment();
  return res.json({ success: true, containmentActive: containmentGateway.isContainmentActive });
});

app.post('/api/alerts/:id/acknowledge', authMiddleware, (req, res) => {
  const alert = alerts.find((entry) => entry.id === req.params.id);
  if (!alert) {
    return res.status(404).json({ error: 'Alert not found.' });
  }

  alert.status = 'Acknowledged';
  alert.acknowledgedBy = req.user.name;
  alert.acknowledgedAt = new Date().toISOString();

  return res.json(alert);
});

app.post('/api/incidents/:id/status', authMiddleware, requireRole(['Administrator', 'Responder']), (req, res) => {
  const incident = incidents.find((entry) => entry.id === req.params.id);
  if (!incident) {
    return res.status(404).json({ error: 'Incident not found.' });
  }

  incident.status = req.body.status || incident.status;
  incident.owner = req.body.owner || incident.owner;
  return res.json(incident);
});

app.post('/api/incidents', authMiddleware, requireRole(['Administrator', 'Responder']), (req, res) => {
  const incident = {
    id: `INC-${Date.now().toString().slice(-4)}`,
    title: req.body.title,
    severity: req.body.severity || 'Medium',
    status: 'New',
    owner: req.user.name,
    sla: req.body.sla || '60 min',
    createdAt: new Date().toISOString(),
    summary: req.body.summary || 'New incident entered from the console.'
  };

  incidents.unshift(incident);
  return res.json(incident);
});

app.post('/api/threat/intrusion/analyze', authMiddleware, requireThreatRole, async (req, res) => {
  try {
    const report = await threatService.analyzeIntrusion(req.body, {
      username: req.user.username,
      role: req.user.role,
      sourceIp: getClientIp(req)
    });

    return res.json(report);
  } catch (error) {
    return errorResponder(error, req, res);
  }
});

app.post('/api/threat/malware/analyze', authMiddleware, requireThreatRole, (req, res) => {
  try {
    const report = threatService.analyzeMalware(req.body, {
      username: req.user.username,
      role: req.user.role,
      sourceIp: getClientIp(req)
    });

    return res.json(report);
  } catch (error) {
    return errorResponder(error, req, res);
  }
});

app.get('/api/threat/reports', authMiddleware, requireThreatRole, (req, res) => {
  try {
    const reports = threatService.listReports(req.query.limit, {
      username: req.user.username,
      role: req.user.role,
      sourceIp: getClientIp(req)
    });

    return res.json(reports);
  } catch (error) {
    return errorResponder(error, req, res);
  }
});

app.get('/api/threat/reports/:id', authMiddleware, requireThreatRole, (req, res) => {
  try {
    const report = threatService.getReport(req.params.id, {
      username: req.user.username,
      role: req.user.role,
      sourceIp: getClientIp(req)
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found.' });
    }

    return res.json(report);
  } catch (error) {
    return errorResponder(error, req, res);
  }
});

app.post('/api/threat/reports/prune', authMiddleware, requireRole(['Administrator']), (req, res) => {
  try {
    const result = threatService.prune({
      username: req.user.username,
      role: req.user.role,
      sourceIp: getClientIp(req)
    });

    return res.json(result);
  } catch (error) {
    return errorResponder(error, req, res);
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const server = app.listen(PORT, HOST, () => {
  console.log(`[${NODE_ENV}] Security operations console listening on http://${HOST}:${PORT}`);
});

server.on('error', (error) => {
  console.error('Server startup failed:', error);
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => process.exit(0));
});

setInterval(() => {
  try {
    const result = threatService.prune({ username: 'system-pruner', role: 'System' });
    if (result.removed > 0) {
      console.log(`Pruned ${result.removed} expired threat reports`);
    }
  } catch (error) {
    console.error('Report pruning failed:', error.message);
  }
}, 6 * 60 * 60 * 1000);
