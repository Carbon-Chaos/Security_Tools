const test = require('node:test');
const assert = require('node:assert/strict');
const { ContainmentGateway } = require('../safety-engine');

test('allows a safe link through the gateway', () => {
  const gateway = new ContainmentGateway();

  const result = gateway.evaluateAction({
    type: 'link',
    target: 'https://example.com/security-update'
  });

  assert.equal(result.allowed, true);
  assert.equal(result.blocked, false);
  assert.equal(gateway.isContainmentActive, false);
});

test('blocks a suspicious download and disables further actions until reset', () => {
  const gateway = new ContainmentGateway();

  const blocked = gateway.evaluateAction({
    type: 'download',
    filename: 'payload.exe',
    size: 1024 * 1024
  });

  assert.equal(blocked.allowed, false);
  assert.equal(blocked.blocked, true);
  assert.equal(gateway.isContainmentActive, true);

  const followUp = gateway.evaluateAction({
    type: 'link',
    target: 'https://example.com/next-step'
  });

  assert.equal(followUp.allowed, false);
  assert.match(followUp.reason, /Containment mode is active/i);
});
