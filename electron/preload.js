/**
 * Preload script — jembatan aman (contextIsolation) antara renderer dan main.
 * Menyediakan API aman untuk komunikasi IPC (remote mode) dan info platform.
 */
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('desktop', {
  platform: process.platform,
  version: '1.0.0',
})

contextBridge.exposeInMainWorld('electronAPI', {
  setRemoteUrl: (url) => ipcRenderer.invoke('set-remote-url', url),
})
