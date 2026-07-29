const {
  extractIpsFromText,
  isIp,
  isPrivateOrReserved,
  normalizeIp,
  parseForwardedHeader,
  reverseLookup,
  unique
} = require('./utils');

const CHAIN_KEYS = [
  'x-forwarded-for',
  'x-real-ip',
  'cf-connecting-ip',
  'true-client-ip',
  'forwarded',
  'via'
];

function ipFromKnownFields(event) {
  const keys = ['sourceIp', 'srcIp', 'clientIp', 'remoteIp', 'ip'];
  for (const key of keys) {
    const candidate = normalizeIp(event[key]);
    if (candidate) return candidate;
  }
  return null;
}

function flattenHeaders(event) {
  const headers = event.headers && typeof event.headers === 'object' ? event.headers : {};
  const normalized = {};

  for (const [key, value] of Object.entries(headers)) {
    normalized[key.toLowerCase()] = typeof value === 'string' ? value : String(value);
  }

  for (const key of CHAIN_KEYS) {
    if (event[key] && !normalized[key]) {
      normalized[key] = String(event[key]);
    }
  }

  return normalized;
}

function inferHopChain(event) {
  const headers = flattenHeaders(event);
  const chain = [];

  const direct = ipFromKnownFields(event);
  if (direct) chain.push(direct);

  if (headers['x-forwarded-for']) {
    for (const part of headers['x-forwarded-for'].split(',')) {
      const ip = normalizeIp(part);
      if (ip) chain.push(ip);
    }
  }

  if (headers.forwarded) {
    chain.push(...parseForwardedHeader(headers.forwarded));
  }

  for (const key of ['x-real-ip', 'cf-connecting-ip', 'true-client-ip']) {
    const ip = normalizeIp(headers[key]);
    if (ip) chain.push(ip);
  }

  if (headers.via) {
    chain.push(...extractIpsFromText(headers.via));
  }

  const normalizedChain = unique(chain);
  const publicCandidates = normalizedChain.filter((ip) => !isPrivateOrReserved(ip));

  let suspectedOrigin = publicCandidates.length ? publicCandidates[0] : normalizedChain[0] || null;
  if (!suspectedOrigin && event.message) {
    const extracted = extractIpsFromText(event.message).filter((ip) => !isPrivateOrReserved(ip));
    suspectedOrigin = extracted[0] || null;
  }

  const obfuscationHops = Math.max(0, normalizedChain.length - 1);
  const confidence = Math.min(100, 30 + normalizedChain.length * 12 + (publicCandidates.length ? 20 : 0));

  return {
    chain: normalizedChain,
    suspectedOrigin,
    obfuscationHops,
    confidence
  };
}

function buildSystemContext(event) {
  const sys = event.system && typeof event.system === 'object' ? event.system : {};
  return {
    hostname: sys.hostname || event.hostname || null,
    os: sys.os || event.os || null,
    user: sys.user || event.user || null,
    process: sys.process || event.process || null,
    pid: sys.pid || event.pid || null,
    commandLine: sys.commandLine || event.commandLine || null
  };
}

async function analyzeEvent(event, index) {
  const hop = inferHopChain(event);
  const ptr = hop.suspectedOrigin ? await reverseLookup(hop.suspectedOrigin) : [];

  return {
    index,
    timestamp: event.timestamp || event.time || null,
    eventType: event.eventType || event.type || 'unknown',
    action: event.action || null,
    destination: event.destinationIp || event.dstIp || null,
    source: hop.suspectedOrigin,
    sourcePtr: ptr,
    hopChain: hop.chain,
    obfuscationHops: hop.obfuscationHops,
    attributionConfidence: hop.confidence,
    systemContext: buildSystemContext(event),
    rawSummary: event.message || event.summary || null
  };
}

async function analyzeIntrusion(logs) {
  if (!Array.isArray(logs)) {
    throw new Error('Intrusion analyzer expects an array of log objects.');
  }

  const details = [];
  for (let index = 0; index < logs.length; index += 1) {
    details.push(await analyzeEvent(logs[index], index));
  }

  const uniqueOrigins = unique(details.map((item) => item.source).filter(Boolean));
  const riskyEvents = details.filter((event) => event.obfuscationHops > 1 || event.attributionConfidence >= 70);

  return {
    generatedAt: new Date().toISOString(),
    stats: {
      totalEvents: logs.length,
      uniqueOrigins: uniqueOrigins.length,
      riskyEvents: riskyEvents.length,
      averageObfuscationHops: details.length
        ? Number((details.reduce((sum, item) => sum + item.obfuscationHops, 0) / details.length).toFixed(2))
        : 0
    },
    origins: uniqueOrigins,
    events: details
  };
}

module.exports = {
  analyzeIntrusion
};