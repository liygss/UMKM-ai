/**
 * Preload script — jembatan aman (contextIsolation) antara renderer dan main.
 */
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('desktop', {
  platform: process.platform,
  version: '1.0.0',
})

contextBridge.exposeInMainWorld('electronAPI', {
  setRemoteUrl: (url) => ipcRenderer.invoke('set-remote-url', url),
  
  // SPT PDF download API
  spt: {
    downloadPdf: (htmlContent) => ipcRenderer.invoke('spt:download-pdf', htmlContent),
  },
})
