#!/usr/bin/env node
/**
 * Membuat credentials.json sebelum build desktop.
 *
 * Opsi A (key milik kalian): isi lewat env saat build:
 *   OLLAMA_API_KEY=sk-xxx OLLAMA_MODEL=gpt-oss:120b npm run build
 *
 * File credentials.json TIDAK ikut di-commit ke git (lihat .gitignore).
 * Kalau env kosong, dibuat file kosong -> user bisa isi key lewat Settings.
 */
const fs = require('fs')
const path = require('path')

const outPath = path.join(__dirname, '..', 'credentials.json')

const credentials = {
  ollamaApiKey: process.env.OLLAMA_API_KEY || '',
  ollamaModel: process.env.OLLAMA_MODEL || 'gpt-oss:120b',
  embeddingProvider: process.env.EMBEDDING_PROVIDER || 'fastembed',
  embeddingModel:
    process.env.EMBEDDING_MODEL ||
    'sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2',
  embeddingApiKey: process.env.EMBEDDING_API_KEY || '',
}

fs.writeFileSync(outPath, JSON.stringify(credentials, null, 2))
console.log(`credentials.json ditulis ke ${outPath}`)
if (!credentials.ollamaApiKey) {
  console.warn(
    'Peringatan: OLLAMA_API_KEY kosong. Isi env saat build, atau user harus mengisi key via Settings.'
  )
}
