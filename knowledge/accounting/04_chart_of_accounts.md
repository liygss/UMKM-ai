# Chart of Accounts (Daftar Akun)

## Apa itu Chart of Accounts (COA)?

COA adalah daftar semua akun yang dipakai suatu usaha untuk mencatat
transaksi keuangannya — semacam "kategori" pengelompokan uang masuk,
uang keluar, aset yang dimiliki, dan utang yang harus dibayar.

## Lima Kategori Utama Akun

| Kategori | Definisi Singkat | Contoh |
|---|---|---|
| Aset | Sumber daya yang dimiliki usaha | Kas, Bank, Piutang, Persediaan, Peralatan |
| Liabilitas | Kewajiban/utang usaha ke pihak lain | Utang Usaha, Utang Bank |
| Modal | Hak pemilik atas usaha | Modal Pemilik, Prive, Laba Ditahan |
| Pendapatan | Penghasilan dari kegiatan usaha | Pendapatan Penjualan, Pendapatan Jasa |
| Beban | Pengorbanan untuk menghasilkan pendapatan | Beban Gaji, Beban Sewa, HPP |

## Konvensi Penomoran Kode Akun (dipakai di aplikasi ini)

- `1-xxxx` → Aset (mis. `1-1000` Kas, `1-1400` Perlengkapan)
- `2-xxxx` → Liabilitas (mis. `2-1000` Utang Usaha)
- `3-xxxx` → Modal (mis. `3-1000` Modal Pemilik)
- `4-xxxx` → Pendapatan (mis. `4-1000` Pendapatan Penjualan)
- `5-xxxx` → Beban (mis. `5-2000` Beban Gaji); khusus `5-1xxx` dipakai
  untuk Harga Pokok Penjualan (HPP) supaya bisa dibedakan dari beban
  operasional saat menyusun Laporan Laba Rugi.

Digit kedua/ketiga biasanya menandakan sub-kategori (mis. Aset Lancar
vs Aset Tetap), dan digit terakhir untuk akun spesifik.

## Tips Menyusun COA untuk UMKM

1. Jangan terlalu detail di awal — mulai dari akun yang benar-benar
   dipakai, tambah belakangan kalau memang perlu.
2. Pisahkan akun Kas dan Bank meskipun sama-sama "uang usaha" — memudahkan
   rekonsiliasi dengan mutasi rekening bank.
3. Kalau usaha dagang, pisahkan Persediaan (aset) dari Harga Pokok
   Penjualan (beban) — dua akun berbeda dengan tujuan berbeda.
4. Akun kontra (mis. Akumulasi Penyusutan) tetap dikelompokkan di
   kategori Aset walau saldo normalnya kredit — lihat `23_penyusutan.md`.

## Daftar Akun Default Aplikasi Ini

Lihat `datasets/coa.csv` untuk daftar lengkap 27 akun default yang sudah
disiapkan (bisa ditambah sesuai kebutuhan usaha masing-masing).
