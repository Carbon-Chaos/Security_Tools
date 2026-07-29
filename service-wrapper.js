const { spawn } = require('child_process');
const path = require('path');

function start() {
  const serverPath = path.join(__dirname, 'server.js');
  const child = spawn(process.execPath, [serverPath], {
    cwd: __dirname,
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: process.env.NODE_ENV || 'production' }
  });

  child.on('exit', (code, signal) => {
    if (signal) {
      console.error(`Monitor exited due to signal ${signal}`);
    } else {
      console.error(`Monitor exited with code ${code}`);
    }

    setTimeout(() => {
      start();
    }, 2000);
  });
}

start();
