/**
 * Extract a human-readable error message from an Axios error.
 * Handles FastAPI's validation errors (422 detail array) and
 * plain HTTPException strings.
 */
export function extractError(err, fallback = 'Terjadi kesalahan') {
  const raw = err?.response?.data?.detail
  if (typeof raw === 'string') return raw
  if (Array.isArray(raw) && raw.length > 0) {
    return raw.map((e) => e.msg).join('; ')
  }
  return fallback
}
