const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const net = require('net');

const isDev = !app.isPackaged;

let backendProcess;

function startBackend() {
  const backendCwd = isDev
    ? path.join(__dirname, '..', 'backend')
    : path.join(process.resourcesPath, 'backend');
  console.log('[Backend] cwd:', backendCwd);
  console.log('[Backend] isDev:', isDev);
  console.log('[Backend] resourcesPath:', process.resourcesPath);
  backendProcess = spawn('node', ['src/index.js'], {
    cwd: backendCwd,
    env: {
      ...process.env,
      ELECTRON_RESOURCES_PATH: isDev ? '' : process.resourcesPath,
    },
  });

  backendProcess.stdout.on('data', (data) => {
    console.log(data.toString());
  });

  backendProcess.stderr.on('data', (data) => {
    console.error(data.toString());
    const logPath = path.join(app.getPath('userData'), 'error.log');
    fs.appendFileSync(logPath, data.toString());
  });
}

function waitForPort(port, timeout = 15000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const tryConnect = () => {
      const socket = net.createConnection({ port, host: '127.0.0.1' });

      socket.on('connect', () => {
        socket.end();
        resolve();
      });

      socket.on('error', () => {
        socket.destroy();
        if (Date.now() - startTime >= timeout) {
          reject(new Error(`Timeout waiting for port ${port}`));
        } else {
          setTimeout(tryConnect, 500);
        }
      });
    };

    tryConnect();
  });
}

function createWindow() {
  console.log('[Window] cargando desde:', isDev ? 'vite' : path.join(process.resourcesPath, 'frontend', 'dist', 'index.html'));

  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    title: 'Evidence Inventory',
    webPreferences: {
      contextIsolation: true
    }
  });

  win.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('[Window] Error al cargar:', errorCode, errorDescription);
    const logPath = path.join(app.getPath('userData'), 'error.log');
    fs.appendFileSync(logPath, `Window load error: ${errorCode} ${errorDescription}\n`);
  });

  if (isDev) {
    win.loadURL('http://localhost:5173');
  } else {
    win.loadFile(
      path.join(process.resourcesPath, 'frontend', 'dist', 'index.html')
    );
  }
}

app.whenReady().then(async () => {
  startBackend();
  await waitForPort(3001);
  createWindow();
});

app.on('before-quit', () => {
  if (backendProcess) {
    backendProcess.kill();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
