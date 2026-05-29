const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const net = require('net');

let mainWindow;
let backendProcess;

function startBackend() {
  const backendCwd = path.join(__dirname, '..', 'backend');
  backendProcess = spawn('node', ['src/index.js'], {
    cwd: backendCwd,
  });

  backendProcess.stdout.on('data', (data) => {
    console.log(data.toString());
  });

  backendProcess.stderr.on('data', (data) => {
    console.error(data.toString());
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
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    title: 'Evidence Inventory',
    webPreferences: {
      contextIsolation: true
    }
  });

  mainWindow.loadURL('http://localhost:5173');
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
