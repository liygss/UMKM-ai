# Neraca Saldo (Trial Balance)

## Definisi

Neraca Saldo adalah daftar seluruh akun beserta saldo akhirnya pada
tanggal tertentu, disusun untuk memastikan **total debit = total kredit**
sebelum melangkah ke penyusunan laporan keuangan.

## Format Standar

| Kode Akun | Nama Akun | Debit | Kredit |
|---|---|---|---|
| 1-1000 | Kas | 12.000.000 | |
| 1-1400 | Perlengkapan | 1.000.000 | |
| 3-1000 | Modal Pemilik | | 10.000.000 |
| 4-1000 | Pendapatan Penjualan | | 3.000.000 |
| **Total** | | **13.000.000** | **13.000.000** |

## Kenapa Harus Balance?

Karena setiap transaksi dicatat berpasangan (lihat
`03_persamaan_akuntansi.md`), secara matematis total debit dan kredit
di seluruh sistem **harus** selalu sama. Kalau tidak balance, itu tanda
pasti ada kesalahan di suatu tempat — entah salah input jumlah, salah
sisi debit/kredit, atau ada baris jurnal yang lupa dicatat.

## Neraca Saldo Ini Bukan Laporan Final

Penting dipahami: Neraca Saldo **bukan** Laporan Posisi Keuangan.
Neraca Saldo hanya alat cek internal sebelum laporan keuangan disusun —
belum memisahkan mana akun yang masuk Laporan Laba Rugi (Pendapatan,
Beban) dan mana yang masuk Laporan Posisi Keuangan (Aset, Liabilitas,
Modal).

## Kalau Neraca Saldo Tidak Balance, Cek Ini

1. Apakah ada jurnal yang jumlah debit dan kreditnya tidak sama (harusnya
   sudah tertolak sistem saat input, tapi cek ulang kalau ragu)?
2. Apakah ada baris detail jurnal yang salah kode akunnya (tercatat ke
   akun yang salah, sehingga saldo dua akun jadi salah dua-duanya)?
3. Apakah semua jurnal periode ini sudah diinput semua (tidak ada yang
   tertinggal/belum disimpan)?

Di aplikasi ini, karena validasi balance dilakukan **di setiap jurnal
saat diinput**, Neraca Saldo yang dihasilkan sistem akan selalu balance
secara otomatis — kalau tidak balance, kemungkinan besar ada bug atau
data yang dimodifikasi di luar aplikasi.
