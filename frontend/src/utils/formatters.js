const IDR = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })
const NUM = new Intl.NumberFormat('id-ID')

export function formatRupiah(val) {
  return IDR.format(val ?? 0)
}

export function formatRupiahCompact(val) {
  const v = val ?? 0
  const abs = Math.abs(v)
  const sign = v < 0 ? '-' : ''
  if (abs >= 1e12) return `${sign}Rp ${(abs / 1e12).toLocaleString('id-ID', { maximumFractionDigits: 1 })} triliun`
  if (abs >= 1e9) return `${sign}Rp ${(abs / 1e9).toLocaleString('id-ID', { maximumFractionDigits: 1 })} miliar`
  if (abs >= 1e6) return `${sign}Rp ${(abs / 1e6).toLocaleString('id-ID', { maximumFractionDigits: 1 })} juta`
  if (abs >= 1e3) return `${sign}Rp ${(abs / 1e3).toLocaleString('id-ID', { maximumFractionDigits: 1 })} ribu`
  return `${sign}Rp ${abs.toLocaleString('id-ID')}`
}

export function formatNumber(val) {
  return NUM.format(val ?? 0)
}

export function formatDate(val) {
  if (!val) return '-'
  return new Date(val).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatDateTime(val) {
  if (!val) return '-'
  return new Date(val).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
