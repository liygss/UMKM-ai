# FAQ: Dashboard Aplikasi

## Q: Angka di dashboard diambil dari mana?
Semua angka di dashboard (saldo kas & bank, pendapatan/beban bulan ini,
laba/rugi berjalan) dihitung **langsung** dari jurnal yang sudah kamu
input — bukan angka yang diinput manual terpisah. Kalau kamu input
jurnal baru, dashboard otomatis ter-update saat dibuka lagi.

## Q: Kenapa "pendapatan bulan ini" di dashboard beda dengan total di Laporan Laba Rugi?
Dashboard menghitung pendapatan **khusus bulan berjalan saja** (dari
tanggal 1 bulan ini sampai hari ini), sedangkan kalau kamu buka Laporan
Laba Rugi tanpa filter tanggal, itu menghitung **kumulatif sejak awal**
data jurnal kamu. Gunakan filter `tanggal_per` di Laporan Laba Rugi
untuk membandingkan periode yang sama.

## Q: Apa arti "jumlah transaksi bulan ini" di dashboard?
Jumlah jurnal (header) yang tanggalnya jatuh di bulan berjalan — bukan
jumlah baris debit/kredit individual, tapi jumlah transaksi/jurnal
sebagai satu kesatuan.

## Q: Saldo kas di dashboard kok beda dengan uang tunai fisik yang saya pegang?
Kemungkinan ada transaksi yang belum dicatat (mis. pengeluaran kecil
yang lupa diinput), atau ada selisih fisik (uang hilang/lebih) yang
belum direkonsiliasi. Lakukan pengecekan fisik kas secara berkala dan
catat selisihnya sebagai penyesuaian kalau memang ada perbedaan riil.

## Q: Bisakah saya lihat dashboard untuk tanggal yang sudah lewat?
Ya, endpoint dashboard menerima parameter `tanggal_per` untuk melihat
kondisi kumulatif s/d tanggal tertentu di masa lalu — berguna untuk
membandingkan kondisi keuangan antar periode.
