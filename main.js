const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    icon: path.join(__dirname, 'assets/logo.png'),  // Path to your logo
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // mainWindow.loadURL(`file://${path.join(__dirname, 'dist/demo/browser/index.html')}`);
  // mainWindow.loadURL('http://localhost:4200');
  mainWindow.loadURL('https://mnymgr.netlify.app/');

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

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
