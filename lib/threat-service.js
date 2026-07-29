const path = require('path');
const { analyzeIntrusion } = require('../tools/threat-analyzer/intrusion');
const { analyzeMalwareInputs } = require('../tools/threat-analyzer/malware');

class ThreatService {
  constructor(options) {
    this.config = options.config;
    this.store = options.store;
  }

  async analyzeIntrusion(payload, actor = {}) {
    const events = payload && Array.isArray(payload.events) ? payload.events : null;
    if (!events) {
      throw this._badRequest('events must be an array.');
    }

    if (events.length > this.config.threatMaxEvents) {
      throw this._badRequest(`events exceeds THREAT_MAX_EVENTS (${this.config.threatMaxEvents}).`);
    }

    const report = await analyzeIntrusion(events);
    const saved = this.store.saveReport('intrusion', report, {
      eventCount: events.length,
      requestedBy: actor.username || 'unknown',
      sourceIp: actor.sourceIp || null
    });

    this.store.writeAudit({
      action: 'threat.intrusion.analyze',
      actor,
      reportId: saved.id,
      eventCount: events.length
    });

    return saved;
  }

  analyzeMalware(payload, actor = {}) {
    const files = payload && Array.isArray(payload.files) ? payload.files : null;
    if (!files) {
      throw this._badRequest('files must be an array.');
    }

    if (files.length > this.config.threatMaxFiles) {
      throw this._badRequest(`files exceeds THREAT_MAX_FILES (${this.config.threatMaxFiles}).`);
    }

    const parsedInputs = files.map((item, idx) => {
      if (!item || typeof item !== 'object') {
        throw this._badRequest(`files[${idx}] must be an object.`);
      }

      const name = String(item.name || '').trim();
      if (!name) {
        throw this._badRequest(`files[${idx}].name is required.`);
      }

      const contentBase64 = item.contentBase64;
      if (!contentBase64 || typeof contentBase64 !== 'string') {
        throw this._badRequest(`files[${idx}].contentBase64 is required.`);
      }

      const buffer = Buffer.from(contentBase64, 'base64');
      if (!buffer.length) {
        throw this._badRequest(`files[${idx}] content could not be decoded.`);
      }

      if (buffer.length > this.config.threatMaxFileSizeBytes) {
        throw this._badRequest(`files[${idx}] exceeds THREAT_MAX_FILE_SIZE_BYTES (${this.config.threatMaxFileSizeBytes}).`);
      }

      return { name: path.basename(name), buffer };
    });

    const report = analyzeMalwareInputs(parsedInputs);
    const saved = this.store.saveReport('malware', report, {
      fileCount: parsedInputs.length,
      requestedBy: actor.username || 'unknown',
      sourceIp: actor.sourceIp || null
    });

    this.store.writeAudit({
      action: 'threat.malware.analyze',
      actor,
      reportId: saved.id,
      fileCount: parsedInputs.length
    });

    return saved;
  }

  listReports(limit, actor = {}) {
    const cappedLimit = Math.min(Math.max(Number(limit) || 25, 1), 200);
    const reports = this.store.listReports(cappedLimit);

    this.store.writeAudit({
      action: 'threat.reports.list',
      actor,
      count: reports.length,
      limit: cappedLimit
    });

    return reports;
  }

  getReport(id, actor = {}) {
    const report = this.store.getReport(id);

    this.store.writeAudit({
      action: 'threat.reports.get',
      actor,
      reportId: id,
      found: Boolean(report)
    });

    return report;
  }

  prune(actor = { username: 'system' }) {
    const result = this.store.pruneExpired();
    this.store.writeAudit({
      action: 'threat.reports.prune',
      actor,
      ...result
    });

    return result;
  }

  _badRequest(message) {
    const error = new Error(message);
    error.statusCode = 400;
    return error;
  }
}

module.exports = {
  ThreatService
};