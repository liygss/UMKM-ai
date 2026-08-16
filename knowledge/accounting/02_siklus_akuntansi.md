# Siklus Akuntansi

Siklus akuntansi adalah tahapan berurutan yang dilakukan berulang setiap
periode (biasanya bulanan atau tahunan) untuk mengubah transaksi mentah
jadi laporan keuangan.

## Tahapan Siklus Akuntansi

1. **Identifikasi transaksi** — kumpulkan bukti transaksi (nota, kuitansi,
   invoice, bukti transfer).
2. **Jurnal Umum** — catat setiap transaksi dalam bentuk debit/kredit
   (lihat `06_jurnal_umum.md`).
3. **Buku Besar (Posting)** — pindahkan/kelompokkan jurnal per akun
   (lihat `07_buku_besar.md`).
4. **Neraca Saldo** — daftar saldo semua akun untuk mengecek total debit
   = total kredit (lihat `08_neraca_saldo.md`).
5. **Jurnal Penyesuaian** — catat hal yang belum tercatat di akhir periode:
   penyusutan, perlengkapan terpakai, beban/pendapatan yang masih perlu
   diakui (lihat `09_jurnal_penyesuaian.md`).
6. **Neraca Lajur (opsional)** — kertas kerja untuk mempermudah penyusunan
   laporan dari neraca saldo yang sudah disesuaikan (lihat `10_neraca_lajur.md`).
7. **Laporan Keuangan** — susun Laporan Laba Rugi, Laporan Posisi
   Keuangan, Laporan Perubahan Modal, dan (kalau perlu) Laporan Arus Kas.
8. **Jurnal Penutup** — nolkan akun pendapatan & beban di akhir periode,
   pindahkan laba/rugi ke Modal, supaya periode berikutnya mulai dari nol
   lagi khusus untuk akun pendapatan/beban.

## Kenapa Urutannya Penting?

Setiap tahap bergantung pada tahap sebelumnya. Kalau jurnal umum salah,
buku besar ikut salah, neraca saldo tidak akan balance, dan laporan
keuangan di ujung jadi tidak bisa dipercaya. Karena itu validasi paling
penting justru di tahap paling awal: **memastikan setiap jurnal balance
(total debit = total kredit) sebelum lanjut ke tahap berikutnya.**

## Siklus di Aplikasi Ini

Aplikasi ini mengotomatiskan tahap 2–7: kamu tinggal input jurnal (atau
upload data transaksi), sistem yang menghitung buku besar, neraca saldo,
sampai laporan keuangan secara otomatis dan selalu konsisten dengan
jurnal yang sudah diinput.
