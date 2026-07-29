const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class ReportStore {
  constructor(options) {
    this.baseDir = options.baseDir;
    this.retentionDays = options.retentionDays;
    this.reportsFile = path.join(this.baseDir, 'threat-reports.ndjson');
    this.auditFile = path.join(this.baseDir, 'audit-log.ndjson');

    fs.mkdirSync(this.baseDir, { recursive: true });
    if (!fs.existsSync(this.reportsFile)) fs.writeFileSync(this.reportsFile, '', 'utf8');
    if (!fs.existsSync(this.auditFile)) fs.writeFileSync(this.auditFile, '', 'utf8');
  }

  writeAudit(entry) {
    const record = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      ...entry
    };

    fs.appendFileSync(this.auditFile, `${JSON.stringify(record)}\n`, 'utf8');
    return record;
  }

  saveReport(reportType, report, metadata = {}) {
    const record = {
      id: crypto.randomUUID(),
      reportType,
      createdAt: new Date().toISOString(),
      metadata,
      report
    };

    fs.appendFileSync(this.reportsFile, `${JSON.stringify(record)}\n`, 'utf8');
    return record;
  }

  listReports(limit = 50) {
    const records = this._readRecords(this.reportsFile);
    return records.slice(-limit).reverse().map((item) => ({
      id: item.id,
      reportType: item.reportType,
      createdAt: item.createdAt,
      metadata: item.metadata
    }));
  }

  getReport(id) {
    const records = this._readRecords(this.reportsFile);
    return records.find((item) => item.id === id) || null;
  }

  pruneExpired() {
    const cutoff = Date.now() - this.retentionDays * 24 * 60 * 60 * 1000;
    const records = this._readRecords(this.reportsFile);
    const kept = records.filter((record) => {
      const ts = Date.parse(record.createdAt);
      return Number.isFinite(ts) && ts >= cutoff;
    });

    const lines = kept.map((item) => JSON.stringify(item)).join('\n');
    fs.writeFileSync(this.reportsFile, `${lines}${lines ? '\n' : ''}`, 'utf8');

    return {
      before: records.length,
      after: kept.length,
      removed: records.length - kept.length
    };
  }

  _readRecords(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    return content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter(Boolean);
  }
}

module.exports = {
  ReportStore
};