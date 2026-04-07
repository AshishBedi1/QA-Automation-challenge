'use strict';

const { spawn } = require('child_process');
const fs = require('fs');
const http = require('http');
const net = require('net');
const path = require('path');
const kill = require('tree-kill');

const rootDir = path.resolve(__dirname, '..');

/**
 * Use explicit IPv4 loopback for readiness + Playwright. Node often resolves
 * "localhost" to 127.0.0.1 while Vite may only listen on ::1 unless bound to
 * all interfaces — we start Vite with --host 0.0.0.0 and probe 127.0.0.1.
 * Override: E2E_PROBE_HOST (e.g. localhost) if your environment requires it.
 */
const loopback =
  process.env.E2E_PROBE_HOST && process.env.E2E_PROBE_HOST.length > 0
    ? process.env.E2E_PROBE_HOST
    : '127.0.0.1';

function httpOrigin(host, port) {
  if (host.includes(':') && !host.includes('.')) {
    return `http://[${host}]:${port}`;
  }
  return `http://${host}:${port}`;
}

function getFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(0, () => {
      const addr = server.address();
      const port = typeof addr === 'object' && addr ? addr.port : null;
      server.close((err) => {
        if (err) reject(err);
        else if (port == null) reject(new Error('Could not allocate port'));
        else resolve(port);
      });
    });
    server.on('error', reject);
  });
}

function waitForOk(url, { intervalMs = 500, timeoutMs = 60000 } = {}) {
  const deadline = Date.now() + timeoutMs;
  return new Promise((resolve, reject) => {
    const tick = () => {
      if (Date.now() > deadline) {
        reject(new Error(`Timeout waiting for ${url}`));
        return;
      }
      const req = http.get(url, { timeout: Math.min(intervalMs, 5000) }, (res) => {
        res.resume();
        if (res.statusCode >= 200 && res.statusCode < 400) {
          resolve();
        } else {
          setTimeout(tick, intervalMs);
        }
      });
      req.on('error', () => setTimeout(tick, intervalMs));
      req.on('timeout', () => {
        req.destroy();
        setTimeout(tick, intervalMs);
      });
    };
    tick();
  });
}

async function main() {
  const dataDir = path.join(rootDir, 'data');
  const dbPath = path.join(dataDir, 'app.db');
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }

  const apiPort = await getFreePort();
  let uiPort = await getFreePort();
  if (uiPort === apiPort) {
    uiPort = await getFreePort();
  }

  let serverProc;
  let clientProc;

  const cleanup = () => {
    if (clientProc && clientProc.pid && !clientProc.killed) {
      try {
        kill(clientProc.pid, 'SIGTERM');
      } catch (_) {
        /* ignore */
      }
    }
    if (serverProc && serverProc.pid && !serverProc.killed) {
      try {
        kill(serverProc.pid, 'SIGTERM');
      } catch (_) {
        /* ignore */
      }
    }
  };

  const onSignal = () => {
    cleanup();
    process.exit(130);
  };
  process.on('SIGINT', onSignal);
  process.on('SIGTERM', onSignal);

  let exitCode = 1;

  try {
    console.log('Starting API server…');
    serverProc = spawn('npm', ['run', 'dev', '-w', 'server'], {
      cwd: rootDir,
      env: { ...process.env, PORT: String(apiPort) },
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });

    const apiReadyUrl = `${httpOrigin(loopback, apiPort)}/api/health`;
    console.log('Waiting for API readiness:', apiReadyUrl);
    await waitForOk(apiReadyUrl, { timeoutMs: 120000 });
    console.log('API ready.');

    console.log('Starting Vite dev server…');
    const clientEnv = {
      ...process.env,
      API_PORT: String(apiPort),
    };
    clientProc = spawn(
      'npm',
      [
        'run',
        'dev',
        '-w',
        'client',
        '--',
        '--port',
        String(uiPort),
        '--strictPort',
        '--host',
        '0.0.0.0',
      ],
      {
        cwd: rootDir,
        env: clientEnv,
        stdio: 'inherit',
        shell: process.platform === 'win32',
      },
    );

    const uiReadyUrl = `${httpOrigin(loopback, uiPort)}/`;
    console.log('Waiting for UI readiness:', uiReadyUrl);
    await waitForOk(uiReadyUrl, { timeoutMs: 600000 });
    console.log('UI ready.');

    const baseUrl = httpOrigin(loopback, uiPort);
    console.log('Running Playwright with BASE_URL=' + baseUrl);

    exitCode = await new Promise((resolve) => {
      const pw = spawn('npx', ['playwright', 'test'], {
        cwd: rootDir,
        env: {
          ...process.env,
          BASE_URL: baseUrl,
          API_PORT: String(apiPort),
        },
        stdio: 'inherit',
        shell: process.platform === 'win32',
      });
      pw.on('close', (code) => resolve(code === null ? 1 : code));
      pw.on('error', (err) => {
        console.error(err);
        resolve(1);
      });
    });
  } finally {
    cleanup();
    await new Promise((r) => setTimeout(r, 400));
  }

  process.exit(exitCode);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
