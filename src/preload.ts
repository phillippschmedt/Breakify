// All of the Node.js APIs are available in the preload process.
import { ipcRenderer } from "electron";

// Expose the ipcRenderer to the render process
window.ipcRenderer = ipcRenderer