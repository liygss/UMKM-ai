export const TOUR_STORAGE_PREFIX = 'finora_tour_seen_'

export const tourSteps = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    description:
      'Ringkasan kinerja keuangan Anda: pendapatan, beban, laba/rugi, komposisi kas & bank, serta grafik bulanan. Pilih bulan di kanan atas untuk melihat data periode tertentu.',
    target: 'a[href="/dashboard"]',
    placement: 'right',
  },
  {
    id: 'insight',
    title: 'Insight AI',
    description:
      'Di halaman Dashboard ada ringkasan otomatis kondisi usaha Anda oleh AI — lengkap dengan poin yang perlu diperhatikan dan saran aksi. Diperbarui sesuai periode yang dipilih.',
    infoOnly: true,
  },
  {
    id: 'piutang-utang',
    title: 'Ringkasan Piutang & Utang',
    description:
      'Pantau tagihan yang harus ditagih ke pelanggan (piutang) dan kewajiban yang harus dibayar (utang usaha, pajak, maupun bank) dalam satu tempat di Dashboard.',
    infoOnly: true,
  },
  {
    id: 'search',
    title: 'Pencarian Cepat (⌘K)',
    description:
      'Kotak pencarian di header untuk navigasi cepat ke menu atau fitur tanpa harus klik sidebar. Aktifkannya dengan pintasan keyboard ⌘K (Ctrl+K di Windows).',
    target: '[data-tour="header-search"]',
    placement: 'bottom',
  },
  {
    id: 'notif',
    title: 'Notifikasi',
    description:
      'Lonceng di header menampilkan notifikasi penting, seperti pesan dari admin atau pengingat aktivitas akun Anda.',
    target: 'button[aria-label="Notifikasi"]',
    placement: 'bottom',
  },
  {
    id: 'theme',
    title: 'Mode Gelap / Terang',
    description:
      'Klik ikon ini untuk beralih antara mode gelap dan terang. Pilihan Anda disimpan otomatis di peramban masing-masing.',
    target: '[data-tour="theme-toggle"]',
    placement: 'bottom',
  },
  {
    id: 'chatbot',
    title: 'Asisten Finora (Chatbot)',
    description:
      'Tombol biru di pojok kanan bawah membuka asisten AI. Tanyakan akuntansi atau pajak kapan saja, misalnya cara mencatat transaksi atau aturan pajak.',
    target: '[data-tour="chatbot-fab"]',
    placement: 'left',
  },
  {
    id: 'akun',
    title: 'Akun (COA)',
    description:
      'Kelola daftar akun atau Chart of Accounts (COA) — aset, kewajiban, modal, pendapatan, dan beban. Buat akun baru atau edit akun yang sudah ada di sini.',
    target: 'a[href="/akun"]',
    placement: 'right',
    navTo: '/akun',
  },
  {
    id: 'jurnal',
    title: 'Jurnal Umum',
    description:
      'Semua transaksi tercatat di sini. Anda bisa menambah jurnal manual, melihat riwayat, dan memeriksa saldo debit/kredit setiap transaksi.',
    target: 'a[href="/jurnal"]',
    placement: 'right',
    navTo: '/jurnal',
  },
  {
    id: 'laporan',
    title: 'Laporan Keuangan',
    description:
      'Cetak laporan standar: Neraca, Laba/Rugi, dan Laporan Arus Kas. Pilih periode lalu unduh atau lihat laporannya.',
    target: 'a[href="/laporan"]',
    placement: 'right',
    navTo: '/laporan',
  },
  {
    id: 'upload',
    title: 'Upload File',
    description:
      'Import transaksi dari file Excel (.xlsx / .xls). Sistem membaca semua sheet dan otomatis membuat jurnal dari datanya untuk Anda.',
    target: 'a[href="/upload"]',
    placement: 'right',
    navTo: '/upload',
  },
  {
    id: 'pajak',
    title: 'Kalkulator Pajak',
    description:
      'Hitung PPh 21, PPN, atau pajak UMKM (final 0,5%) secara cepat berdasarkan nominal yang Anda masukkan.',
    target: 'a[href="/pajak"]',
    placement: 'right',
    navTo: '/pajak',
  },
  {
    id: 'spt',
    title: 'SPT Tahunan (1770 / 1770S)',
    description:
      'Susun laporan SPT Tahunan PPh Orang Pribadi. Isi data penghasilan dan beban, lalu unduh PDF yang siap dilaporkan.',
    target: 'a[href="/spt"]',
    placement: 'right',
    navTo: '/spt',
  },
  {
    id: 'demo',
    title: 'Lihat Demo',
    description:
      'Jelajahi contoh lengkap aplikasi dengan data percobaan. Berguna untuk memahami alur kerja sebelum mengisi data asli Anda.',
    infoOnly: true,
  },
]
