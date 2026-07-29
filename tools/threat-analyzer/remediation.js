function buildRemediationPlan(finding) {
  const actions = [];

  actions.push('Isolate affected host from production network immediately.');
  actions.push('Preserve forensic artifacts: memory image, process list, and timeline logs.');

  if (finding.networkIndicators.urls.length || finding.networkIndicators.ips.length) {
    actions.push('Block malicious domains/IPs in DNS, proxy, firewall, and EDR policies.');
  }

  if (finding.behavior.persistence.length) {
    actions.push('Remove persistence mechanisms (scheduled tasks, run keys, startup scripts).');
  }

  if (finding.behavior.credentialAccess.length) {
    actions.push('Rotate passwords, invalidate active tokens, and force MFA re-registration for impacted identities.');
  }

  if (finding.behavior.execution.length) {
    actions.push('Block abused interpreters and LOLBins via allowlist policy where feasible.');
  }

  if (finding.fileType === 'PE') {
    actions.push('Quarantine binary and run enterprise AV/EDR full scan on neighboring hosts.');
  }

  if (finding.fileType === 'Script') {
    actions.push('Review scripts in source control and remove injected commands from startup, login, and automation jobs.');
  }

  actions.push('Create detections from extracted IOCs and behavior signatures, then backtest over 30 days of telemetry.');

  return actions;
}

function buildRepairSuggestions(finding) {
  const suggestions = [];

  if (finding.fileType === 'Script' && finding.scriptBreakdown.suspiciousLines.length) {
    suggestions.push({
      summary: 'Manual script repair candidate',
      detail: 'Remove suspicious command lines and re-run unit/integration validation before redeployment.',
      suspiciousLines: finding.scriptBreakdown.suspiciousLines
    });
  }

  if (finding.behavior.persistence.length) {
    suggestions.push({
      summary: 'Persistence cleanup',
      detail: 'Delete attacker-created scheduled tasks, services, run keys, and startup links discovered during triage.'
    });
  }

  if (!suggestions.length) {
    suggestions.push({
      summary: 'No direct code repair inferred',
      detail: 'Focus on containment, eradication, and host rebuild from a known-good image.'
    });
  }

  return suggestions;
}

module.exports = {
  buildRemediationPlan,
  buildRepairSuggestions
};