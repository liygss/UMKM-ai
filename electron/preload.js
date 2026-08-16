/**
 * Preload script — jembatan aman (contextIsolation) antara renderer dan main.
 * Untuk sekarang tidak mengekspos apa pun; placeholder untuk fitur IPC
 * (mis. membaca/menulis config API key dari halaman Settings).
 */
const { contextBridge } = require('electron')

contextBridge.exposeInMainWorld('desktop', {
  platform: process.platform,
  version: '1.0.0',
})
