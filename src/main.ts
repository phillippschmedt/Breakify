import { app, Tray, Menu, BrowserWindow } from "electron";
import * as path from "path";

try {
  require('electron-reloader')(module)
} catch (_) { }  // replace with modern JS

let tray : Tray = null
let backgroundWindow : BrowserWindow= null
let settingsWindow : BrowserWindow = null
let breakWindow : BrowserWindow = null


function createBackgroundWindow() {
  // Create backGroundWindow to keep the app alive
  backgroundWindow = new BrowserWindow({
    show: false,
  });
}

function createSettingsWindow() {
  if (settingsWindow) {
    settingsWindow.show();
    return
  }
  
  // Create the browser window.
  settingsWindow = new BrowserWindow({
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
    width: 800,
    frame: true,
    fullscreen: false,
    autoHideMenuBar: true,
  });

  // and load the index.html of the app.
  settingsWindow.loadFile(path.join(__dirname, "../index.html"));

  // Open the DevTools.
  //mainWindow.webContents.openDevTools();
}

function createTray() {
  tray = new Tray('break.ico')
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Einstellungen', type: 'normal',
      click: function () {
        createSettingsWindow();
      }
    },
    { type: 'separator' },
    {
      label: 'Exit',
      type: 'normal', click: function () {
        app.quit()
      }
    }
  ])
  tray.setToolTip('Breakify - The break reminder app.')
  tray.setContextMenu(contextMenu)
}

app.whenReady().then(() => {
  createBackgroundWindow();
  createTray();

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createBackgroundWindow();
  });
})

app.on("window-all-closed", () => {
  // Stay in tray
});