const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { ReportStore } = require('../lib/report-store');
const { ThreatService } = require('../lib/threat-service');

function makeService() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'threat-service-'));
  const store = new ReportStore({ baseDir: tempDir, retentionDays: 30 });
  const service = new ThreatService({
    config: {
      threatMaxEvents: 100,
      threatMaxFiles: 3,
      threatMaxFileSizeBytes: 1024 * 1024,
      reportRetentionDays: 30,
      dataDir: tempDir
    },
    store
  });

  return { service, tempDir };
}

test('threat service saves intrusion report with metadata', async () => {
  const { service } = makeService();

  const saved = await service.analyzeIntrusion(
    {
      events: [
        {
          eventType: 'auth_failure',
          sourceIp: '10.0.0.22',
          headers: { 'x-forwarded-for': '91.240.118.172, 10.0.0.22' }
        }
      ]
    },
    { username: 'analyst' }
  );

  assert.equal(saved.reportType, 'intrusion');
  assert.equal(saved.metadata.requestedBy, 'analyst');

  const listed = service.listReports(10, { username: 'analyst' });
  assert.equal(listed.length, 1);
  assert.equal(listed[0].id, saved.id);
});

test('threat service decodes base64 malware files and saves report', () => {
  const { service } = makeService();

  const script = Buffer.from('Invoke-Expression "test"\n', 'utf8').toString('base64');
  const saved = service.analyzeMalware(
    {
      files: [{ name: 'bad.ps1', contentBase64: script }]
    },
    { username: 'responder' }
  );

  assert.equal(saved.reportType, 'malware');
  assert.equal(saved.report.findings.length, 1);
});

test('threat service enforces maximum file count', () => {
  const { service } = makeService();
  const sample = Buffer.from('x', 'utf8').toString('base64');

  assert.throws(() => {
    service.analyzeMalware({
      files: [
        { name: 'a.ps1', contentBase64: sample },
        { name: 'b.ps1', contentBase64: sample },
        { name: 'c.ps1', contentBase64: sample },
        { name: 'd.ps1', contentBase64: sample }
      ]
    });
  }, /THREAT_MAX_FILES/);
});