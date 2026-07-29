#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { analyzeIntrusion } = require('./intrusion');
const { analyzeMalware } = require('./malware');

function printHelp() {
  console.log(`\nThreat Analyzer\n\nUsage:\n  node tools/threat-analyzer/cli.js intrusion --input <logs.json> [--output <report.json>]\n  node tools/threat-analyzer/cli.js malware --file <sample.bin> [--file <sample2.bin> ...] [--output <report.json>]\n\nNotes:\n  - intrusion input must be a JSON array of events.\n  - malware accepts one or more files.\n`);
}

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) {
      args._.push(token);
      continue;
    }

    const key = token.slice(2);
    const value = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : true;

    if (value !== true) i += 1;

    if (key === 'file') {
      if (!args.file) args.file = [];
      args.file.push(value);
    } else {
      args[key] = value;
    }
  }
  return args;
}

function writeOutput(outputPath, data) {
  const json = JSON.stringify(data, null, 2);
  if (!outputPath) {
    console.log(json);
    return;
  }

  const fullPath = path.resolve(outputPath);
  fs.writeFileSync(fullPath, `${json}\n`, 'utf8');
  console.log(`Report written to ${fullPath}`);
}

async function run() {
  const args = parseArgs(process.argv.slice(2));
  const mode = args._[0];

  if (!mode || args.help || args.h) {
    printHelp();
    process.exit(0);
  }

  if (mode === 'intrusion') {
    if (!args.input) {
      throw new Error('Missing --input for intrusion mode.');
    }

    const inputPath = path.resolve(args.input);
    const raw = fs.readFileSync(inputPath, 'utf8');
    const logs = JSON.parse(raw);
    const report = await analyzeIntrusion(logs);
    writeOutput(args.output, report);
    return;
  }

  if (mode === 'malware') {
    const files = args.file || [];
    if (!files.length) {
      throw new Error('Provide at least one --file for malware mode.');
    }

    const report = analyzeMalware(files);
    writeOutput(args.output, report);
    return;
  }

  throw new Error(`Unknown mode: ${mode}`);
}

run().catch((error) => {
  console.error('Threat analyzer failed:', error.message);
  process.exit(1);
});