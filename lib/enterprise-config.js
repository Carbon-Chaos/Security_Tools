const DEFAULTS = {
  threatMaxEvents: 5000,
  threatMaxFiles: 20,
  threatMaxFileSizeBytes: 5 * 1024 * 1024,
  reportRetentionDays: 30,
  dataDir: 'data'
};

function readNumber(name, fallback, min, max) {
  const raw = process.env[name];
  if (!raw) return fallback;

  const value = Number(raw);
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new Error(`${name} must be a number between ${min} and ${max}.`);
  }

  return Math.floor(value);
}

function loadEnterpriseConfig() {
  return {
    threatMaxEvents: readNumber('THREAT_MAX_EVENTS', DEFAULTS.threatMaxEvents, 100, 25000),
    threatMaxFiles: readNumber('THREAT_MAX_FILES', DEFAULTS.threatMaxFiles, 1, 250),
    threatMaxFileSizeBytes: readNumber('THREAT_MAX_FILE_SIZE_BYTES', DEFAULTS.threatMaxFileSizeBytes, 1024, 100 * 1024 * 1024),
    reportRetentionDays: readNumber('REPORT_RETENTION_DAYS', DEFAULTS.reportRetentionDays, 1, 365),
    dataDir: process.env.DATA_DIR || DEFAULTS.dataDir
  };
}

module.exports = {
  loadEnterpriseConfig
};