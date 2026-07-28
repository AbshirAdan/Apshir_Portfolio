/**
 * Frees Vite dev ports (5173–5176) before starting frontend dev server.
 */
const { execSync } = require('child_process');

const ports = ['5173', '5174', '5175', '5176'];

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
        // ignore
      }
    }
  } catch {
    // Port not in use
  }
}

if (process.platform === 'win32') {
  for (const port of ports) freePortWin32(port);
}
