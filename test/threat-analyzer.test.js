const test = require('node:test');
const assert = require('node:assert/strict');
const { analyzeIntrusion } = require('../tools/threat-analyzer/intrusion');
const { analyzeMalwareInputs } = require('../tools/threat-analyzer/malware');

test('intrusion analyzer reconstructs hop chain and source', async () => {
  const report = await analyzeIntrusion([
    {
      eventType: 'auth_failure',
      sourceIp: '10.0.0.15',
      headers: {
        'x-forwarded-for': '185.220.101.42, 10.0.0.15'
      }
    }
  ]);

  assert.equal(report.stats.totalEvents, 1);
  assert.equal(report.events[0].source, '185.220.101.42');
  assert.equal(report.events[0].obfuscationHops, 1);
});

test('malware analyzer supports in-memory files', () => {
  const payload = Buffer.from('powershell -enc AAAA\nschtasks /create /tn evil\n', 'utf8');
  const report = analyzeMalwareInputs([{ name: 'loader.ps1', buffer: payload }]);

  assert.equal(report.totals.scannedFiles, 1);
  assert.equal(report.findings[0].fileType, 'Script');
  assert.ok(report.findings[0].behavior.persistence.length >= 1);
});