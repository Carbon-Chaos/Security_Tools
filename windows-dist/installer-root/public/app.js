let currentUser = null;
let activeView = 'overview';

function setView(view) {
  activeView = view;
  document.querySelectorAll('.nav-btn').forEach((button) => {
    button.classList.toggle('active', button.dataset.view === view);
  });

  document.querySelectorAll('.view-panel').forEach((panel) => {
    panel.classList.toggle('hidden', panel.id !== `${view}-view`);
  });
}

function showLogin() {
  document.getElementById('login-view').classList.remove('hidden');
  document.getElementById('app-shell').classList.add('hidden');
}

function showApp() {
  document.getElementById('login-view').classList.add('hidden');
  document.getElementById('app-shell').classList.remove('hidden');
  document.getElementById('welcome-title').textContent = `Welcome, ${currentUser.name}`;
  document.getElementById('user-badge').textContent = `${currentUser.role} · ${currentUser.team}`;
}

async function request(path, options = {}) {
  const headers = {
    ...(options.headers || {}),
    'Content-Type': 'application/json'
  };

  if (currentUser?.token) {
    headers['x-session-token'] = currentUser.token;
  }

  const response = await fetch(path, { ...options, headers });
  if (response.status === 401) {
    currentUser = null;
    showLogin();
    return null;
  }
  return response.json();
}

async function bootstrap() {
  const session = await fetch('/api/auth/me', {
    headers: { 'x-session-token': localStorage.getItem('sessionToken') || '' }
  });

  if (session.ok) {
    const payload = await session.json();
    currentUser = { ...payload.user, token: localStorage.getItem('sessionToken') || '' };
    showApp();
    renderAll();
    return;
  }

  showLogin();
}

function updateContainmentBanner(status) {
  const banner = document.getElementById('containment-banner');
  if (!banner) return;

  if (status?.containmentActive) {
    banner.classList.remove('hidden');
    banner.textContent = 'Containment is active: links and downloads are blocked until the gateway is reset.';
    return;
  }

  banner.classList.remove('hidden');
  banner.textContent = 'Background monitoring is active: suspicious behavior is being inspected in real time.';
}

async function renderAll() {
  const overview = document.getElementById('overview-view');
  const assetsView = document.getElementById('assets-view');
  const alertsView = document.getElementById('alerts-view');
  const incidentsView = document.getElementById('incidents-view');
  const playbooksView = document.getElementById('playbooks-view');
  const safetyView = document.getElementById('safety-view');

  const dashboard = await request('/api/dashboard');
  const assets = await request('/api/assets');
  const alerts = await request('/api/alerts');
  const incidents = await request('/api/incidents');
  const playbooks = await request('/api/playbooks');

  overview.innerHTML = `
    <div class="grid">
      <article class="card">
        <h3>Monitored assets</h3>
        <p class="metric">${dashboard.summary.monitoredAssets}</p>
        <p class="small">Protected endpoints and services under active monitoring.</p>
      </article>
      <article class="card">
        <h3>Critical alerts</h3>
        <p class="metric">${dashboard.summary.criticalAlerts}</p>
        <p class="small">High-priority detections requiring immediate review.</p>
      </article>
      <article class="card">
        <h3>Open incidents</h3>
        <p class="metric">${dashboard.summary.openIncidents}</p>
        <p class="small">Cases with active investigation or containment steps.</p>
      </article>
      <article class="card">
        <h3>Compliance score</h3>
        <p class="metric">${dashboard.summary.complianceScore}%</p>
        <p class="small">Operational readiness and policy adherence.</p>
      </article>
    </div>
    <div class="grid">
      <article class="card">
        <h3>Latest alerts</h3>
        ${dashboard.recentAlerts.map((alert) => `<div class="list-item"><span class="badge ${alert.severity.toLowerCase()}">${alert.severity}</span><strong>${alert.title}</strong><div class="small">${alert.asset} · ${alert.status}</div></div>`).join('')}
      </article>
      <article class="card">
        <h3>Active incidents</h3>
        ${dashboard.activeIncidents.map((incident) => `<div class="list-item"><strong>${incident.title}</strong><div class="small">${incident.status} · SLA ${incident.sla}</div></div>`).join('')}
      </article>
    </div>
    <article class="card">
      <h3>Operations note</h3>
      <p>${dashboard.operationsNote}</p>
    </article>
  `;

  assetsView.innerHTML = `
    <article class="card">
      <h3>Asset inventory</h3>
      <table class="table">
        <thead>
          <tr><th>Name</th><th>ID</th><th>Owner</th><th>Criticality</th><th>Status</th><th>Controls</th></tr>
        </thead>
        <tbody>
          ${assets.map((asset) => `<tr><td>${asset.name}</td><td>${asset.id}</td><td>${asset.owner}</td><td><span class="badge ${asset.criticality.toLowerCase()}">${asset.criticality}</span></td><td>${asset.status}</td><td>${asset.controls.join(', ')}</td></tr>`).join('')}
        </tbody>
      </table>
    </article>
  `;

  alertsView.innerHTML = `
    <article class="card">
      <h3>Alert queue</h3>
      ${alerts.map((alert) => `
        <div class="list-item">
          <span class="badge ${alert.severity.toLowerCase()}">${alert.severity}</span>
          <strong>${alert.title}</strong>
          <div class="small">${alert.asset} · ${alert.source} · ${alert.status}</div>
          <p>${alert.summary}</p>
          ${alert.status === 'Open' ? `<button class="action-btn" data-alert-id="${alert.id}">Acknowledge</button>` : ''}
        </div>
      `).join('')}
    </article>
  `;

  incidentsView.innerHTML = `
    <article class="card">
      <h3>Incident management</h3>
      <div class="inline-form">
        <input id="new-incident-title" placeholder="Incident title" />
        <input id="new-incident-summary" placeholder="Summary" />
        <select id="new-incident-severity">
          <option value="Medium">Medium</option>
          <option value="High">High</option>
          <option value="Critical">Critical</option>
        </select>
        <button class="action-btn" id="create-incident-btn">Create incident</button>
      </div>
      ${incidents.map((incident) => `
        <div class="list-item">
          <strong>${incident.title}</strong>
          <div class="small">${incident.severity} · ${incident.status} · Owner ${incident.owner}</div>
          <p>${incident.summary}</p>
          <div class="inline-form">
            <select data-incident-id="${incident.id}" class="incident-status-select">
              <option value="Investigating" ${incident.status === 'Investigating' ? 'selected' : ''}>Investigating</option>
              <option value="Contained" ${incident.status === 'Contained' ? 'selected' : ''}>Contained</option>
              <option value="Resolved" ${incident.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
            </select>
            <button class="action-btn update-incident-btn" data-incident-id="${incident.id}">Update</button>
          </div>
        </div>
      `).join('')}
    </article>
  `;

  playbooksView.innerHTML = `
    <article class="card">
      <h3>Response playbooks</h3>
      ${playbooks.map((playbook) => `
        <div class="list-item">
          <strong>${playbook.name}</strong>
          <div class="small">Owner ${playbook.owner} · Duration ${playbook.duration}</div>
          <p>${playbook.objective}</p>
        </div>
      `).join('')}
    </article>
  `;

  const safetyStatus = await request('/api/safety/status');
  updateContainmentBanner(safetyStatus);
  safetyView.innerHTML = `
    <article class="card">
      <h3>Containment gateway</h3>
      <p>Background safety checks inspect links and downloads before they reach the primary system.</p>
      <div class="inline-form">
        <button class="action-btn" id="test-link-btn">Test safe link</button>
        <button class="action-btn" id="test-download-btn">Test suspicious download</button>
        <button class="secondary-btn" id="reset-gateway-btn">Reset containment</button>
      </div>
      <p><strong>Status:</strong> ${safetyStatus.containmentActive ? 'Blocked' : 'Active'}</p>
      <p><strong>Background monitor:</strong> ${safetyStatus.monitoringEnabled ? 'Enabled' : 'Disabled'}</p>
      <p><strong>Last scan:</strong> ${safetyStatus.lastScanAt || 'Waiting for first scan'}</p>
      <div class="list-item">
        <strong>Latest alerts</strong>
        ${safetyStatus.alerts.length ? safetyStatus.alerts.map((alert) => `<div class="small">${alert.reason}</div>`).join('') : '<div class="small">No safety alerts yet.</div>'}
      </div>
    </article>
  `;

  document.getElementById('test-link-btn').addEventListener('click', async () => {
    const result = await request('/api/safety/evaluate', {
      method: 'POST',
      body: JSON.stringify({ type: 'link', target: 'https://example.com/security-update' })
    });
    alert(result.allowed ? 'Link allowed after inspection.' : `Blocked: ${result.reason}`);
    renderAll();
  });

  document.getElementById('test-download-btn').addEventListener('click', async () => {
    const result = await request('/api/safety/evaluate', {
      method: 'POST',
      body: JSON.stringify({ type: 'download', filename: 'payload.exe', size: 1024 * 1024 })
    });
    alert(result.allowed ? 'Download allowed after inspection.' : `Blocked: ${result.reason}`);
    renderAll();
  });

  document.getElementById('reset-gateway-btn').addEventListener('click', async () => {
    await request('/api/safety/reset', { method: 'POST' });
    renderAll();
  });

  document.querySelectorAll('[data-alert-id]').forEach((button) => {
    button.addEventListener('click', async () => {
      const alertId = button.getAttribute('data-alert-id');
      await request(`/api/alerts/${alertId}/acknowledge`, { method: 'POST' });
      renderAll();
    });
  });

  document.querySelectorAll('.update-incident-btn').forEach((button) => {
    button.addEventListener('click', async () => {
      const incidentId = button.getAttribute('data-incident-id');
      const select = document.querySelector(`.incident-status-select[data-incident-id="${incidentId}"]`);
      await request(`/api/incidents/${incidentId}/status`, {
        method: 'POST',
        body: JSON.stringify({ status: select.value })
      });
      renderAll();
    });
  });

  document.getElementById('create-incident-btn').addEventListener('click', async () => {
    const title = document.getElementById('new-incident-title').value;
    const summary = document.getElementById('new-incident-summary').value;
    const severity = document.getElementById('new-incident-severity').value;
    if (!title || !summary) return;

    await request('/api/incidents', {
      method: 'POST',
      body: JSON.stringify({ title, summary, severity })
    });
    renderAll();
  });
}

async function login(username, password) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const payload = await response.json();
  if (!response.ok) {
    alert(payload.error || 'Unable to sign in.');
    return;
  }

  currentUser = { ...payload.user, token: payload.token };
  localStorage.setItem('sessionToken', payload.token);
  showApp();
  renderAll();
}

async function logout() {
  if (currentUser?.token) {
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: { 'x-session-token': currentUser.token }
    });
  }

  localStorage.removeItem('sessionToken');
  currentUser = null;
  showLogin();
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('login-form').addEventListener('submit', (event) => {
    event.preventDefault();
    login(document.getElementById('username').value, document.getElementById('password').value);
  });

  document.getElementById('logout-btn').addEventListener('click', logout);

  document.querySelectorAll('.nav-btn').forEach((button) => {
    button.addEventListener('click', () => setView(button.dataset.view));
  });

  bootstrap();
});
