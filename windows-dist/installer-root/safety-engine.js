class ContainmentGateway {
  constructor(options = {}) {
    this.isContainmentActive = false;
    this.alerts = [];
    this.monitoringEnabled = options.monitoringEnabled !== false;
    this.scanIntervalMs = options.scanIntervalMs || 7000;
    this.scanHistory = [];
    this.lastScanAt = null;
    this.monitorTimer = null;
    this.monitorQueue = [];
    this.monitorSequence = 0;
  }

  startBackgroundMonitoring() {
    if (this.monitorTimer) {
      return;
    }

    this.monitoringEnabled = true;
    this.monitorTimer = setInterval(() => {
      this.scanNextActivity();
    }, this.scanIntervalMs);
  }

  stopBackgroundMonitoring() {
    if (this.monitorTimer) {
      clearInterval(this.monitorTimer);
      this.monitorTimer = null;
    }

    this.monitoringEnabled = false;
  }

  enqueueAction(action) {
    this.monitorQueue.push(action);
    return this.monitorQueue.length;
  }

  scanNextActivity() {
    const action = this.monitorQueue.shift() || this._nextDefaultAction();
    if (!action) {
      return null;
    }

    const result = this.evaluateAction(action);
    this.lastScanAt = new Date().toISOString();
    this.scanHistory.push({ scannedAt: this.lastScanAt, action, allowed: result.allowed, reason: result.reason });
    if (this.scanHistory.length > 20) {
      this.scanHistory = this.scanHistory.slice(-20);
    }

    return result;
  }

  scanBatch(actions) {
    const results = actions.map((action) => this.evaluateAction(action));
    this.lastScanAt = new Date().toISOString();
    this.scanHistory.push({ scannedAt: this.lastScanAt, actions, results });
    if (this.scanHistory.length > 20) {
      this.scanHistory = this.scanHistory.slice(-20);
    }

    return results;
  }

  getStatus() {
    return {
      containmentActive: this.isContainmentActive,
      alerts: this.alerts.slice(-5),
      monitoringEnabled: this.monitoringEnabled,
      lastScanAt: this.lastScanAt,
      queuedActions: this.monitorQueue.length
    };
  }

  evaluateAction(action) {
    if (this.isContainmentActive) {
      const alert = this._createAlert('Containment mode is active. User actions are blocked until the incident is cleared.', action);
      this.alerts.push(alert);
      return {
        allowed: false,
        blocked: true,
        reason: alert.reason,
        alert
      };
    }

    const policyResult = this._evaluatePolicy(action);
    if (!policyResult.allowed) {
      this.isContainmentActive = true;
      const alert = this._createAlert(policyResult.reason, action);
      this.alerts.push(alert);
      return {
        allowed: false,
        blocked: true,
        reason: alert.reason,
        alert
      };
    }

    return {
      allowed: true,
      blocked: false,
      reason: 'Action passed inspection.',
      alert: null
    };
  }

  resetContainment() {
    this.isContainmentActive = false;
    this.alerts = [];
  }

  _nextDefaultAction() {
    const defaults = [
      { type: 'link', target: 'https://example.com/approved' },
      { type: 'download', filename: 'monthly-report.pdf', size: 512 * 1024 },
      { type: 'download', filename: 'payload.exe', size: 1024 * 1024 },
      { type: 'link', target: 'javascript:alert("x")' }
    ];

    const action = defaults[this.monitorSequence % defaults.length];
    this.monitorSequence += 1;
    return action;
  }

  _evaluatePolicy(action) {
    if (action.type === 'download') {
      if (action.filename?.toLowerCase().endsWith('.exe')) {
        return { allowed: false, reason: 'Executable download blocked because it is not approved for this environment.' };
      }

      if (action.size && action.size > 5 * 1024 * 1024) {
        return { allowed: false, reason: 'Download blocked because it exceeds the approved size threshold.' };
      }

      if (action.filename?.toLowerCase().includes('payload')) {
        return { allowed: false, reason: 'Download blocked because the filename matches a known suspicious pattern.' };
      }
    }

    if (action.type === 'link') {
      const target = action.target || '';
      const suspicious = /javascript:|data:|file:|\\x|<script/i;
      if (suspicious.test(target)) {
        return { allowed: false, reason: 'Link blocked because the target contains a suspicious protocol or script payload.' };
      }
    }

    return { allowed: true, reason: 'Action passed inspection.' };
  }

  _createAlert(reason, action) {
    return {
      id: `SEC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      reason,
      action,
      createdAt: new Date().toISOString()
    };
  }
}

module.exports = { ContainmentGateway };