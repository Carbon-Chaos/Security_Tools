#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const saveDir = path.join(__dirname, 'data');
const saveFile = path.join(saveDir, 'fake-hacking-game-save.json');

const hosts = {
  alpha: {
    ip: '10.10.40.11',
    os: 'NebulaOS 4.2',
    services: ['22/ssh', '80/http', '3306/mysql'],
    vuln: {
      scanHint: 'Outdated CMS detected on /admin (version banner leaked).',
      enumHint: 'CMS changelog references CVE-FAKE-2026-1201 template injection.',
      exploit: 'template_injection',
      shell: 'www-data',
      privescHint: 'Sudo policy allows image-optimizer script with wildcard.',
      privesc: 'sudo_wildcard_escape'
    },
    flag: 'ALPHA-ROOT-9F2D'
  },
  beta: {
    ip: '10.10.40.12',
    os: 'Orion Linux 8',
    services: ['21/ftp', '445/smb', '8080/http-alt'],
    vuln: {
      scanHint: 'Anonymous FTP write is enabled.',
      enumHint: 'Backup task executes scripts from /incoming without validation.',
      exploit: 'ftp_backup_dropper',
      shell: 'backup',
      privescHint: 'Kernel build is vulnerable to dirtypipe-like local escalation.',
      privesc: 'dirtypipe_variant'
    },
    flag: 'BETA-ROOT-C31A'
  },
  gamma: {
    ip: '10.10.40.13',
    os: 'Helios Server 3',
    services: ['443/https', '6379/redis', '9000/api'],
    vuln: {
      scanHint: 'Redis is exposed without auth on internal interface.',
      enumHint: 'Application worker loads jobs from Redis keys with eval mode.',
      exploit: 'redis_job_injection',
      shell: 'appsvc',
      privescHint: 'Container runtime socket is mounted with rw access.',
      privesc: 'docker_socket_escape'
    },
    flag: 'GAMMA-ROOT-77BD'
  }
};

function defaultState() {
  return {
    currentHost: null,
    scanned: {},
    enumerated: {},
    shell: {},
    root: {},
    flags: {}
  };
}

function loadState() {
  try {
    if (fs.existsSync(saveFile)) {
      return JSON.parse(fs.readFileSync(saveFile, 'utf8'));
    }
  } catch (err) {
    console.error('Save file is corrupted. Starting new run.');
  }
  return defaultState();
}

function saveState(state) {
  fs.mkdirSync(saveDir, { recursive: true });
  fs.writeFileSync(saveFile, JSON.stringify(state, null, 2));
}

function resetState() {
  if (fs.existsSync(saveFile)) {
    fs.unlinkSync(saveFile);
  }
}

function promptPrefix(state) {
  const host = state.currentHost ? `@${state.currentHost}` : '';
  return `player${host}> `;
}

function showBanner() {
  console.log('============================================');
  console.log(' Carbon Chaos: Fake Network Breach Game');
  console.log('============================================');
  console.log('Goal: Gain root on all fake hosts and capture every flag.');
  console.log('Everything is simulated locally. No real network activity.');
  console.log('Type "help" to list commands.\n');
}

function showHelp() {
  console.log('Commands:');
  console.log('  help                              Show this help text');
  console.log('  hosts                             List fake target machines');
  console.log('  target <host>                     Select target (alpha|beta|gamma)');
  console.log('  scan                              Scan selected host');
  console.log('  enum                              Enumerate selected host');
  console.log('  exploit <technique>               Attempt remote exploit');
  console.log('  privesc <technique>               Attempt local privilege escalation');
  console.log('  status                            Show progress');
  console.log('  reset                             Reset game progress');
  console.log('  exit                              Quit game');
}

function listHosts() {
  console.log('Fake hosts:');
  for (const [name, host] of Object.entries(hosts)) {
    console.log(`  - ${name}: ${host.ip} (${host.os})`);
  }
}

function status(state) {
  const total = Object.keys(hosts).length;
  const rooted = Object.keys(state.root).length;
  const flags = Object.keys(state.flags).length;
  console.log(`Progress: rooted ${rooted}/${total}, flags ${flags}/${total}`);
  for (const name of Object.keys(hosts)) {
    const scanned = state.scanned[name] ? 'scan' : '--';
    const enumd = state.enumerated[name] ? 'enum' : '--';
    const shell = state.shell[name] ? 'shell' : '--';
    const root = state.root[name] ? 'root' : '--';
    console.log(`  ${name}: ${scanned} ${enumd} ${shell} ${root}`);
  }
}

function maybeWin(state) {
  if (Object.keys(state.flags).length === Object.keys(hosts).length) {
    console.log('\n*** MISSION COMPLETE ***');
    console.log('You captured every root flag in the simulated environment.');
    console.log('Run "reset" to replay with the same map.\n');
  }
}

function run() {
  showBanner();
  let state = loadState();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true
  });

  function loop() {
    rl.question(promptPrefix(state), (line) => {
      const input = line.trim();
      if (!input) {
        return loop();
      }

      const [cmd, ...args] = input.split(/\s+/);

      try {
        switch (cmd.toLowerCase()) {
          case 'help':
            showHelp();
            break;
          case 'hosts':
            listHosts();
            break;
          case 'target': {
            const hostName = (args[0] || '').toLowerCase();
            if (!hosts[hostName]) {
              console.log('Unknown host. Use: target alpha|beta|gamma');
              break;
            }
            state.currentHost = hostName;
            saveState(state);
            console.log(`Target selected: ${hostName} (${hosts[hostName].ip})`);
            break;
          }
          case 'scan': {
            if (!state.currentHost) {
              console.log('Select a target first: target alpha|beta|gamma');
              break;
            }
            const host = hosts[state.currentHost];
            state.scanned[state.currentHost] = true;
            saveState(state);
            console.log(`Open services on ${state.currentHost}: ${host.services.join(', ')}`);
            console.log(`Hint: ${host.vuln.scanHint}`);
            break;
          }
          case 'enum': {
            if (!state.currentHost) {
              console.log('Select a target first: target alpha|beta|gamma');
              break;
            }
            if (!state.scanned[state.currentHost]) {
              console.log('Scan first, then enumerate.');
              break;
            }
            const host = hosts[state.currentHost];
            state.enumerated[state.currentHost] = true;
            saveState(state);
            console.log(`Enumeration result: ${host.vuln.enumHint}`);
            break;
          }
          case 'exploit': {
            if (!state.currentHost) {
              console.log('Select a target first: target alpha|beta|gamma');
              break;
            }
            if (!state.enumerated[state.currentHost]) {
              console.log('Enumerate first to discover a viable exploit path.');
              break;
            }
            const technique = (args[0] || '').toLowerCase();
            const host = hosts[state.currentHost];
            if (technique !== host.vuln.exploit) {
              console.log('Exploit failed. Try another technique based on enum hints.');
              break;
            }
            state.shell[state.currentHost] = true;
            saveState(state);
            console.log(`Exploit succeeded. Shell obtained as ${host.vuln.shell}.`);
            console.log(`PrivEsc hint: ${host.vuln.privescHint}`);
            break;
          }
          case 'privesc': {
            if (!state.currentHost) {
              console.log('Select a target first: target alpha|beta|gamma');
              break;
            }
            if (!state.shell[state.currentHost]) {
              console.log('You need a user shell first.');
              break;
            }
            const technique = (args[0] || '').toLowerCase();
            const host = hosts[state.currentHost];
            if (technique !== host.vuln.privesc) {
              console.log('Privilege escalation failed. Try another local technique.');
              break;
            }
            state.root[state.currentHost] = true;
            state.flags[state.currentHost] = host.flag;
            saveState(state);
            console.log(`Root access gained on ${state.currentHost}.`);
            console.log(`Flag captured: ${host.flag}`);
            maybeWin(state);
            break;
          }
          case 'status':
            status(state);
            break;
          case 'reset':
            resetState();
            state = defaultState();
            console.log('Game progress reset.');
            break;
          case 'exit':
          case 'quit':
            rl.close();
            return;
          default:
            console.log('Unknown command. Type "help".');
            break;
        }
      } catch (err) {
        console.log(`Error: ${err.message}`);
      }

      loop();
    });
  }

  loop();

  rl.on('close', () => {
    console.log('Session ended.');
    process.exit(0);
  });
}

run();
