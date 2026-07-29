module.exports = [
  {
    actor: 'Lazarus Group (DPRK-linked, heuristic)',
    confidenceWeight: 20,
    indicators: [
      'hwp',
      'rundll32',
      'regsvr32',
      'powershell -enc',
      'fast flux'
    ]
  },
  {
    actor: 'APT29 / Cozy Bear (RU-linked, heuristic)',
    confidenceWeight: 18,
    indicators: [
      'wscript',
      'scheduled task',
      'token theft',
      'outlook',
      'living off the land'
    ]
  },
  {
    actor: 'APT28 / Fancy Bear (RU-linked, heuristic)',
    confidenceWeight: 17,
    indicators: [
      'winword',
      'eqnedt32',
      'credential dump',
      'mimikatz',
      'dropper'
    ]
  },
  {
    actor: 'Sandworm (RU-linked, heuristic)',
    confidenceWeight: 22,
    indicators: [
      'ics',
      'modbus',
      'wiper',
      'disk overwrite',
      'scheduled task'
    ]
  },
  {
    actor: 'Unknown / commodity actor',
    confidenceWeight: 8,
    indicators: [
      'powershell',
      'base64',
      'http://',
      '.ru',
      'stealer'
    ]
  }
];