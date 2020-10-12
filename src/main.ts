import { app, Tray, Menu, BrowserWindow, ipcMain } from "electron";
import * as path from "path";
import { Break, Schedule, createBreakScheduler, BreakScheduler } from "./BreakScheduler"
import { AppSettings, loadSettings } from "./settings-loader";

try {
  require('electron-reloader')(module)
} catch (_) { }  // TODO: replace with modern JS

let tray: Tray
let backgroundWindow: BrowserWindow
let settingsWindow: BrowserWindow
let breakWindow: BrowserWindow
let breakScheduler: BreakScheduler
let settings: AppSettings | undefined

declare global {
  interface Window {
    ipcRenderer: Electron.IpcRenderer
  }
}

// Setup a Background Window. Keeps the app running in tray
function createBackgroundWindow() {
  backgroundWindow = new BrowserWindow({
    show: false,
  });
}

// Setup BreakWindow
function createBreaksWindow(duration: number) {
  if (!breakWindow) {
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

    // Remove menu (and reload hotkey) on windows
    breakWindow.removeMenu()

    // TODO: Test if this is really needed for mac
    // Remove menu (and reload hotkey) on mac
    breakWindow.setMenu(Menu.buildFromTemplate([]))
  }

  breakWindow.loadFile(path.join(__dirname, "../src/pages/break.html"));

  //breakWindow.webContents.openDevTools();

  // Wait for page to finish load before we can send data
  breakWindow.webContents.on('did-finish-load', () => {
    breakWindow.webContents.send('ipc_startbreak', duration)

    // Show window when we are done with all rendering. Looks more fluid.
    breakWindow.show()
  })
}

function closeBreaksWindow() {
  breakWindow?.hide()
}
// TODO: Implement settings dialog
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
  if (!tray) {
    tray = new Tray(path.join(__dirname, '../assets/break.ico'))
  }

  // TODO: Set Time to next breaks in tooltip?
  tray.setToolTip('Breakify - The break reminder app.')

  updateTray();
}


// Used to dynamically update the tray window. Note: Electron forces us to create a new menu every time we want to change it. 
function updateTray() {
  let contextMenu = Menu.buildFromTemplate([
    {
      label: 'Take next break', type: 'normal',
      click: function () {
        breakScheduler.skipToNextBreak();
      }
    },
    { type: 'separator' },
    {
      label: breakScheduler?.isRunning() ? 'Pause Breaks' : 'Resume Breaks', type: 'normal',
      click: function () {
        if (breakScheduler.isRunning()) {
          breakScheduler.stopScheduler();
        } else {
          breakScheduler.startScheduler();
        }

      }
    },
    { type: 'separator' },
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
  tray.setContextMenu(contextMenu)
}

app.whenReady().then(() => {
  // TODO: Clean the initialization up
  settings = loadSettings()
  createBackgroundWindow();
  createTray();

  // TODO: How do we handle the case when the config file got deleted?
  if (!settings) {
    console.log("Could not load config. Exiting app")
    app.quit()
    return
  }

  // Run the BreakScheduler
  breakScheduler = createBreakScheduler(
    settings.schedule,
    // Called when a break starts
    function startBreakcallback(duration: number) {
      updateTray();
      createBreaksWindow(duration)
    },
    // Called when a break ends
    function stopBreakcallback() {
      // Only close the break window when the autoFinishBreak config is enabled.
      if (settings?.autoFinishBreak) {
        closeBreaksWindow()
      }
      updateTray();
    },
    // Called when the scheduler is started
    function schedulerStartedCallback() {
      updateTray();
    },
    // Called when the scheduler is stopped
    function schedulerStoppedCallback() {
      updateTray();
      closeBreaksWindow();
    },
    settings.autoFinishBreak
  )

  breakScheduler.startScheduler()
  updateTray();

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


// Better exception handling / Will log to console instead of displaying eror dialog.
process.on('uncaughtException', error => {
	// Replace code below to display a prettier window
	console.error('Exception:', error); 
	app.exit(1);
});
