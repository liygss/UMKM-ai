/**
 * Server HTTP kecil untuk mode produksi desktop:
 *   - melayani file statis dari folder frontend/dist (SPA fallback ke index.html)
 *   - mem-proxy semua request /api/* ke backend FastAPI (dengan rewrite /api)
 * Tidak pakai dependency eksternal — hanya modul bawaan Node.js.
 */

const http = require('http')
const fs = require('fs')
const path = require('path')

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.map': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
}

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self' http://127.0.0.1:*; font-src 'self' data:;",
}

/**
 * @param {{distDir: string, backendPort: number}} opts
 * @returns {Promise<{server: import('http').Server, port: number}>}
 */
function startServer({ distDir, backendPort }) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const url = req.url || '/'

      // Proxy API ke backend FastAPI (hapus prefix /api)
      if (url.startsWith('/api/')) {
        const targetPath = url.slice('/api'.length) || '/'

        // Strip incoming security headers that shouldn't be forwarded
        const proxyHeaders = { ...req.headers, host: `127.0.0.1:${backendPort}` }
        delete proxyHeaders['x-content-type-options']
        delete proxyHeaders['x-frame-options']
        delete proxyHeaders['x-xss-protection']
        delete proxyHeaders['referrer-policy']
        delete proxyHeaders['content-security-policy']

        const proxyReq = http.request(
          {
            host: '127.0.0.1',
            port: backendPort,
            path: targetPath,
            method: req.method,
            headers: proxyHeaders,
          },
          (proxyRes) => {
            // Forward backend response headers as-is
            res.writeHead(proxyRes.statusCode || 502, proxyRes.headers)
            proxyRes.pipe(res)
          }
        )
        proxyReq.on('error', () => {
          if (!res.headersSent) {
            res.writeHead(502, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ detail: 'Backend sedang tidak tersedia.' }))
          } else {
            res.end()
          }
        })
        req.pipe(proxyReq)
        return
      }

      // File statis frontend
      const cleanPath = decodeURIComponent(url.split('?')[0])
      let filePath = path.join(distDir, cleanPath === '/' ? 'index.html' : cleanPath)
      const resolvedRoot = path.resolve(distDir)
      if (!path.resolve(filePath).startsWith(resolvedRoot)) {
        res.writeHead(403)
        res.end('forbidden')
        return
      }

      fs.stat(filePath, (statErr, stat) => {
        if (!statErr && stat.isDirectory()) {
          filePath = path.join(filePath, 'index.html')
        }
        fs.readFile(filePath, (readErr, data) => {
          if (readErr || !data) {
            // SPA fallback: semua route non-file kembali ke index.html
            fs.readFile(path.join(distDir, 'index.html'), (idxErr, indexHtml) => {
              if (idxErr || !indexHtml) {
                res.writeHead(404)
                res.end('not found')
                return
              }
              res.writeHead(200, { 'Content-Type': MIME['.html'], ...SECURITY_HEADERS })
              res.end(indexHtml)
            })
            return
          }
          const ext = path.extname(filePath).toLowerCase()
          res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream', ...SECURITY_HEADERS })
          res.end(data)
        })
      })
    })

    server.on('error', reject)
    server.listen(0, '127.0.0.1', () => {
      resolve({ server, port: server.address().port })
    })
  })
}

module.exports = { startServer }
