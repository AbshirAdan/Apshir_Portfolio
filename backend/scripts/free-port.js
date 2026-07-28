/**
 * Frees the configured port before starting the dev server (Windows-friendly).
 * Prevents EADDRINUSE when a previous node/nodemon instance is still running.
 */
const { execSync } = require('child_process');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const port = String(process.env.PORT || 5000);

function freePortWin32(targetPort) {
  try {
    const output = execSync(`netstat -ano | findstr ":${targetPort}"`, { encoding: 'utf8' });
    const pids = new Set();

    for (const line of output.split('\n')) {
      if (!line.includes('LISTENING')) continue;
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && /^\d+$/.test(pid)) pids.add(pid);
    }

    for (const pid of pids) {
      try {
        execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
        console.log(`[Port] Freed port ${targetPort} (stopped PID ${pid})`);
      } catch {
        // Process may have already exited
      }
    }
  } catch {
    // No process on port — nothing to do
  }
}

function freePortUnix(targetPort) {
  try {
    const output = execSync(`lsof -ti :${targetPort}`, { encoding: 'utf8' });
    for (const pid of output.trim().split('\n').filter(Boolean)) {
      try {
        process.kill(Number(pid), 'SIGTERM');
        console.log(`[Port] Freed port ${targetPort} (stopped PID ${pid})`);
      } catch {
        // ignore
      }
    }
  } catch {
    // Port not in use
  }
}

if (process.platform === 'win32') {
  freePortWin32(port);
} else {
  freePortUnix(port);
}
