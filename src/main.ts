import { app, Tray, Menu, BrowserWindow, ipcMain } from "electron";
import * as path from "path";
import { Break, Schedule, createBreakScheduler, BreakScheduler } from "./BreakScheduler"

try {
  require('electron-reloader')(module)
} catch (_) { }  // replace with modern JS

let tray: Tray
let backgroundWindow: BrowserWindow
let settingsWindow: BrowserWindow
let breakWindow: BrowserWindow
let breakScheduler: BreakScheduler

// Setup a Background Window. Keeps the app running in tray
function createBackgroundWindow() {
  backgroundWindow = new BrowserWindow({
    show: false,
  });
}

// Setup BreakWindow
function createBreaksWindow(duration: number) {
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

  breakWindow.webContents.openDevTools();

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
  tray = new Tray(path.join(__dirname, '../assets/break.ico'))
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Settings', type: 'normal',
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

  let schedule: Schedule = {
    shortBreak: { interval: 3, duration: 5, active: true },
    mediumBreak: { interval: 12, duration: 10, active: true },
    longBreak: { interval: 45, duration: 5, active: false },
  }

  let breakTimerConfig = {
    schedule: schedule,
    autoFinishBreak: false,
  }

  breakScheduler = createBreakScheduler(
    breakTimerConfig.schedule,
    function startBreakcallback(duration: number) {
      createBreaksWindow(duration)
    },
    function stopBreakcallback() {

      // Only close the break window when the autoFinishBreak config is enabled.
      if (breakTimerConfig.autoFinishBreak) {
        closeBreaksWindow()
      }
    },
    breakTimerConfig.autoFinishBreak
  )

  breakScheduler.startScheduler()

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createBackgroundWindow();
  });
})

app.on("window-all-closed", () => {
  // Stay in tray
});


ipcMain.on('finishBreakButtonClicked', (event, arg) => {
  closeBreaksWindow();
  breakScheduler.restartScheduler();
})