import { app, Tray, Menu, BrowserWindow } from "electron";
import * as path from "path";
import breakScheduler from "./BreakScheduler"


try {
  require('electron-reloader')(module)
} catch (_) { }  // replace with modern JS

let tray: Tray = null
let backgroundWindow: BrowserWindow = null
let settingsWindow: BrowserWindow = null
let breakWindow: BrowserWindow = null

// Setup a Background Window. Keeps the app running in tray
function createBackgroundWindow() {
  backgroundWindow = new BrowserWindow({
    show: false,
  });
}

// Setup BreakWindow
function createBreaksWindow(duration : number) {
  if (breakWindow) {
    breakWindow.show()
    breakWindow.webContents.send('duration', duration);
    return
  }

  breakWindow = new BrowserWindow({
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
    width: 800,
    frame: false,
    fullscreen: false,
    autoHideMenuBar: true,
    show: false,
  });

  // and load the index.html of the app.
  breakWindow.loadFile(path.join(__dirname, "../src/pages/break.html"));

  //breakWindow.webContents.openDevTools();

  // Wait for page to finish load before we can send data
  breakWindow.webContents.on('did-finish-load', () => {
    breakWindow.webContents.send('duration', duration)

    // Show window when we are done with all rendering. Looks more fluid.
    breakWindow.show()
 })


}

function closeBreaksWindow() {
  breakWindow.hide()
}

// Setup the SettingsWindow
function createSettingsWindow() {
  if (settingsWindow) {
    settingsWindow.show();
    return
  }

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
  settingsWindow.loadFile(path.join(__dirname, "../src/pages/settings.html"));

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

  // Run the BreakScheduler
  breakScheduler.startScheduler()
  breakScheduler.startBreakFunction = (duration) => {
    console.log("Create callback")
    createBreaksWindow(duration)
  }

  breakScheduler.stopBreakFunction = () => {
    console.log("Close callback")
    closeBreaksWindow()
  }


  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createBackgroundWindow();
  });
})

app.on("window-all-closed", () => {
  // Stay in tray
});