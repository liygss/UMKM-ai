export const setupHints = {
  1: [
    {
      target: '[data-hint="company-name"]',
      placement: 'bottom',
      text: 'Isi nama usaha kamu di sini — misalnya "Toko Berkah Jaya". Ini jadi nama utama di semua laporan.',
      emotion: 'buddy-happy',
    },
    {
      target: '[data-hint="business-type"]',
      placement: 'bottom',
      text: 'Pilih jenis badan usaha yang sesuai. UMKM dapat kemudahan pajak, lho!',
      emotion: 'buddy-thinking',
    },
    {
      target: '[data-hint="business-field"]',
      placement: 'bottom',
      text: 'Tulis bidang usaha — contoh: "Perdagangan retail", "Jasa konsultasi". Ini bantu AI kasih saran yang lebih tepat.',
      emotion: 'buddy-happy',
    },
    {
      target: '[data-hint="coa-section"]',
      placement: 'top',
      text: 'Pilih template COA yang paling cocok. Nggak perlu bikin manual — tinggal pilih dan jadi!',
      emotion: 'buddy-thinking',
    },
    {
      target: '[data-hint="btn-next-1"]',
      placement: 'top',
      text: 'Klik "Lanjutkan" kalau sudah selesai isi data usaha. Hampir sampai!',
      emotion: 'buddy-happy',
    },
  ],
  2: [
    {
      target: '[data-hint="chat-input"]',
      placement: 'top',
      text: 'Ketik transaksimu di sini dalam bahasa sehari-hari. Nanti aku ubah jurnalnya otomatis!',
      emotion: 'buddy-happy',
    },
    {
      target: '[data-hint="chat-examples"]',
      placement: 'top',
      text: 'Coba klik salah satu contoh transaksi di atas buat langsung merasakan alurnya.',
      emotion: 'buddy-thinking',
    },
    {
      target: '[data-hint="save-journal"]',
      placement: 'top',
      text: 'Setelah cek pratinjau jurnalnya, klik "Simpan Jurnal" untuk menyimpan ke pembukuan.',
      emotion: 'buddy-happy',
    },
  ],
  3: [
    {
      target: '[data-hint="upload-zone"]',
      placement: 'bottom',
      text: 'Punya data transaksi di Excel? Seret & lepas file ke sini, atau klik untuk memilih.',
      emotion: 'buddy-thinking',
    },
    {
      target: '[data-hint="upload-list"]',
      targetFallback: '[data-hint="btn-finish"]',
      placement: 'top',
      text: 'Status file akan otomatis update. Pastikan semua "Berhasil" sebelum lanjut.',
      emotion: 'buddy-happy',
    },
    {
      target: '[data-hint="btn-finish"]',
      placement: 'top',
      text: 'Semua sudah siap! Klik "Masuk ke Dashboard" untuk mulai pakai Finora.',
      emotion: 'buddy-happy',
    },
  ],
}
