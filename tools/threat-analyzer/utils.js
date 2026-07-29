const net = require('net');
const dns = require('dns').promises;

const IPV4_TOKEN = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
const URL_TOKEN = /https?:\/\/[^\s"'<>]+/gi;

function isIp(value) {
  return net.isIP(value) !== 0;
}

function normalizeIp(value) {
  if (!value || typeof value !== 'string') return null;
  const cleaned = value
    .trim()
    .replace(/^for=/i, '')
    .replace(/^"|"$/g, '')
    .replace(/^\[|\]$/g, '')
    .replace(/:\d+$/, '');

  return isIp(cleaned) ? cleaned : null;
}

function isPrivateOrReserved(ip) {
  if (!isIp(ip)) return false;
  if (ip.includes(':')) {
    const normalized = ip.toLowerCase();
    return (
      normalized === '::1' ||
      normalized.startsWith('fc') ||
      normalized.startsWith('fd') ||
      normalized.startsWith('fe80') ||
      normalized.startsWith('::ffff:127.')
    );
  }

  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part) || part > 255)) return true;

  const [a, b] = parts;
  return (
    a === 10 ||
    a === 127 ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 169 && b === 254) ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 192 && b === 0) ||
    (a === 192 && b === 88) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224
  );
}

function unique(items) {
  return [...new Set(items)];
}

function extractIpsFromText(text) {
  if (!text || typeof text !== 'string') return [];
  const raw = text.match(IPV4_TOKEN) || [];
  return unique(raw.filter((item) => isIp(item)));
}

function extractUrlsFromText(text) {
  if (!text || typeof text !== 'string') return [];
  const raw = text.match(URL_TOKEN) || [];
  return unique(raw);
}

function parseForwardedHeader(forwardedValue) {
  if (!forwardedValue || typeof forwardedValue !== 'string') return [];

  const parts = forwardedValue.split(',');
  const ips = [];

  for (const part of parts) {
    const directives = part.split(';');
    for (const directive of directives) {
      const [key, value] = directive.split('=');
      if (!key || !value) continue;
      if (key.trim().toLowerCase() !== 'for') continue;

      const ip = normalizeIp(value.trim());
      if (ip) ips.push(ip);
    }
  }

  return unique(ips);
}

async function reverseLookup(ip, timeoutMs = 1200) {
  if (!isIp(ip) || isPrivateOrReserved(ip)) {
    return [];
  }

  const timeoutPromise = new Promise((resolve) => {
    setTimeout(() => resolve([]), timeoutMs);
  });

  const lookupPromise = dns
    .reverse(ip)
    .then((hosts) => hosts || [])
    .catch(() => []);

  return Promise.race([lookupPromise, timeoutPromise]);
}

module.exports = {
  extractIpsFromText,
  extractUrlsFromText,
  isIp,
  isPrivateOrReserved,
  normalizeIp,
  parseForwardedHeader,
  reverseLookup,
  unique
};