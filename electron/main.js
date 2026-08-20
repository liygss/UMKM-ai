/**
 * Electron main process.
 *
 * Alur saat app dibuka:
 *   1. Pilih port kosong untuk backend FastAPI.
 *   2. Jalankan backend (produksi: binary PyInstaller; dev: python venv).
 *      Semua folder data diarahkan ke userData supaya aman & portable.
 *   3. Mode produksi: jalankan server statis + proxy /api -> backend.
 *   4. Buka jendela BrowserWindow.
 *
 * API key Ollama Cloud (Opsi A — milik kalian) dibaca dari:
 *   - userData/config.json   (ditulis lewat halaman Settings / build)
 *   - lalu fallback ke resources/credentials.json (di-bundle saat build)
 */

const { app, BrowserWindow, shell, dialog } = require('electron')
const path = require('path')
const fs = require('fs')
const crypto = require('crypto')
const net = require('net')
const { spawn } = require('child_process')
const { ipcMain } = require('electron')
const { startServer } = require('./server')

const isDev = process.argv.includes('--dev')

// Cegah crash dari EPIPE atau error tak terduga saat app dibuka dari Finder.
process.stdout?.on?.('error', () => {})
process.stderr?.on?.('error', () => {})
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err)
})

// ---------------------------------------------------------------------------
// IPC — remote mode URL saving
// ---------------------------------------------------------------------------
ipcMain.handle('set-remote-url', async (_event, url) => {
  const cfgPath = path.join(userDataDir(), 'config.json')
  let cfg = {}
  try { cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf-8')) } catch {}
  cfg.remoteUrl = url
  fs.writeFileSync(cfgPath, JSON.stringify(cfg, null, 2))
  return true
})

let backendProc = null
let staticServer = null
let mainWindow = null
let backendPort = null
let remoteMode = false

const VITE_DEV_URL = 'http://localhost:5173'

// ---------------------------------------------------------------------------
// Util
// ---------------------------------------------------------------------------
function getFreePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer()
    srv.listen(0, '127.0.0.1', () => {
      const port = srv.address().port
      srv.close(() => resolve(port))
    })
    srv.on('error', reject)
  })
}

function userDataDir() {
  return app.getPath('userData')
}

function loadCredentials() {
  // 1) config.json di userData (bisa diisi lewat UI/Settings)
  const cfgPath = path.join(userDataDir(), 'config.json')
  let cfg = {}
  if (fs.existsSync(cfgPath)) {
    try {
      cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf-8'))
    } catch (err) {
      console.error('Gagal membaca config.json:', err)
    }
  }

  // 2) credentials.json yang di-bundle (Opsi A — key milik kalian)
  let creds = {}
  try {
    const credPath = isDev
      ? path.join(__dirname, 'credentials.json')
      : path.join(process.resourcesPath, 'credentials.json')
    if (fs.existsSync(credPath)) {
      creds = JSON.parse(fs.readFileSync(credPath, 'utf-8'))
    }
  } catch (err) {
    console.error('Gagal membaca credentials.json:', err)
  }

  if (!cfg.secretKey) cfg.secretKey = crypto.randomBytes(32).toString('hex')
  if (!cfg.ollamaApiKey) cfg.ollamaApiKey = creds.ollamaApiKey || process.env.OLLAMA_API_KEY || ''
  if (!cfg.ollamaModel) cfg.ollamaModel = creds.ollamaModel || process.env.OLLAMA_MODEL || 'gpt-oss:120b'

  try {
    fs.writeFileSync(cfgPath, JSON.stringify(cfg, null, 2))
  } catch (err) {
    console.error('Gagal menyimpan config.json:', err)
  }
  return cfg
}

// ---------------------------------------------------------------------------
// Backend
// ---------------------------------------------------------------------------
function resolveBackendCommand() {
  if (isDev) {
    const backendDir = path.join(__dirname, '..', 'backend')
    const py =
      process.platform === 'win32'
        ? path.join(backendDir, 'venv', 'Scripts', 'python.exe')
        : path.join(backendDir, 'venv', 'bin', 'python')
    const python = fs.existsSync(py) ? py : 'python3'
    return {
      cmd: python,
      args: ['-m', 'uvicorn', 'app.main:app', '--host', '127.0.0.1', '--port', String(backendPort)],
      cwd: backendDir,
    }
  }
  const exe =
    process.platform === 'win32'
      ? path.join(process.resourcesPath, 'backend', 'backend.exe')
      : path.join(process.resourcesPath, 'backend', 'backend')
  return {
    cmd: exe,
    args: ['--host', '127.0.0.1', '--port', String(backendPort)],
    cwd: process.resourcesPath,
  }
}

function backendEnv(cfg) {
  const dataDir = path.join(userDataDir(), 'data')
  return {
    ...process.env,
    DATA_DIR: dataDir,
    SQLITE_PATH: path.join(dataDir, 'ai_accounting.db'),
    QDRANT_LOCAL_PATH: path.join(dataDir, 'qdrant'),
    UPLOAD_DIR: path.join(dataDir, 'uploads'),
    MARKDOWN_DIR: path.join(dataDir, 'markdown'),
    CHUNKS_DIR: path.join(dataDir, 'chunks'),
    EMBEDDINGS_DIR: path.join(dataDir, 'embeddings'),
    LOG_DIR: path.join(userDataDir(), 'logs'),
    KNOWLEDGE_DIR: isDev
      ? path.join(__dirname, '..', 'knowledge')
      : path.join(process.resourcesPath, 'knowledge'),
    OLLAMA_BASE_URL: 'https://ollama.com',
    OLLAMA_API_KEY: cfg.ollamaApiKey || '',
    OLLAMA_MODEL: cfg.ollamaModel || 'gpt-oss:120b',
    EMBEDDING_PROVIDER: cfg.embeddingProvider || 'fastembed',
    EMBEDDING_MODEL:
      cfg.embeddingModel || 'sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2',
    EMBEDDING_API_KEY: cfg.embeddingApiKey || '',
    SECRET_KEY: cfg.secretKey || '',
    DEBUG: 'False',
    ENV: 'production',
    PATH: process.env.PATH,
  }
}

async function startBackend(cfg) {
  const { cmd, args, cwd } = resolveBackendCommand()
  console.log('Backend command:', cmd, args.join(' '))

  backendProc = spawn(cmd, args, {
    cwd,
    env: backendEnv(cfg),
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  // Safe write — saat app dibuka dari Finder, process.stdout/stderr bisa
  // berupa broken pipe (EPIPE). Tangani supaya tidak crash.
  const safeWrite = (stream, prefix, data) => {
    try {
      if (stream.writable && !stream.destroyed) stream.write(`${prefix} ${data}`)
    } catch { /* EPIPE dari Finder — abaikan */ }
  }
  backendProc.stdout.on('data', (d) => safeWrite(process.stdout, '[backend]', d))
  backendProc.stderr.on('data', (d) => safeWrite(process.stderr, '[backend]', d))
  backendProc.on('exit', (code) => {
    console.log(`Backend process exit code: ${code}`)
    backendProc = null
  })

  // Tunggu sampai backend siap (health check)
  for (let i = 0; i < 60; i++) {
    if (backendProc === null || backendProc.exitCode !== null) {
      throw new Error('Backend gagal dijalankan.')
    }
    try {
      const res = await fetch(`http://127.0.0.1:${backendPort}/health`)
      if (res.ok) {
        console.log('Backend siap di http://127.0.0.1:' + backendPort)
        return
      }
    } catch {
      // belum siap
    }
    await new Promise((r) => setTimeout(r, 500))
  }
  throw new Error('Backend tidak merespons dalam batas waktu.')
}

// ---------------------------------------------------------------------------
// Window
// ---------------------------------------------------------------------------
function createWindow(url) {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'AI Accounting RAG',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })
  mainWindow.loadURL(url)

  // Handle window.open — biarkan iframe (about:blank / blob:) lewat,
  // arahkan link eksternal ke browser default.
  mainWindow.webContents.setWindowOpenHandler(({ url: target }) => {
    // about:blank & blob: = iframe internal (PDF print) — izinkan
    if (target === 'about:blank' || target.startsWith('blob:')) {
      return { action: 'allow' }
    }
    shell.openExternal(target)
    return { action: 'deny' }
  })

  // Handle download (Excel, CSV, dll) — tampilkan dialog save
  mainWindow.webContents.session.on('will-download', (event, item, webContents) => {
    const defaultPath = path.join(app.getPath('downloads'), item.getFilename())
    item.setSavePath(defaultPath)
    item.on('done', (e, state) => {
      if (state === 'completed') {
        console.log('Download selesai:', defaultPath)
      } else {
        console.log('Download gagal:', state)
      }
    })
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// ---------------------------------------------------------------------------
// Lifecycle
// ---------------------------------------------------------------------------
async function main() {
  const cfg = loadCredentials()

  // Coba jalankan backend lokal (mode normal / full desktop app).
  // Kalau binary backend tidak ada (client build tanpa PyInstaller),
  // masuk mode remote — app jadi thin client yang connect ke server.
  let backendStarted = false
  try {
    backendPort = await getFreePort()
    await startBackend(cfg)
    backendStarted = true
    console.log('Backend lokal berhasil dijalankan.')
  } catch (err) {
    console.log('Backend lokal tidak tersedia — mode remote:', err.message)
    remoteMode = true
  }

  let windowUrl
  if (isDev) {
    windowUrl = VITE_DEV_URL
  } else if (backendStarted) {
    // Mode normal: serve frontend statis + proxy ke backend lokal
    const distDir = path.join(process.resourcesPath, 'frontend')
    staticServer = await startServer({ distDir, backendPort })
    windowUrl = `http://127.0.0.1:${staticServer.port}`
  } else {
    // Mode remote: cek config untuk URL tersimpan
    const savedUrl = cfg.remoteUrl || ''
    if (savedUrl) {
      console.log('Menggunakan URL remote tersimpan:', savedUrl)
      windowUrl = savedUrl
    } else {
      // Tampilkan halaman setup untuk input URL
      const setupPath = isDev
        ? path.join(__dirname, 'remote-setup.html')
        : path.join(app.getAppPath(), 'remote-setup.html')
      windowUrl = `file://${setupPath}`
    }
  }

  createWindow(windowUrl)
}

app.whenReady().then(main)

app.on('window-all-closed', () => {
  app.quit()
})

app.on('before-quit', () => {
  if (staticServer && staticServer.server) {
    try {
      staticServer.server.close()
    } catch {
      /* noop */
    }
  }
  if (backendProc) {
    backendProc.kill()
  }
})
