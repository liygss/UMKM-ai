# Buku Besar (General Ledger)

## Definisi

Buku Besar mengelompokkan seluruh transaksi dari Jurnal Umum berdasarkan
**akunnya masing-masing**, sehingga bisa dilihat mutasi dan saldo akhir
per akun secara individual. Kalau Jurnal Umum disusun kronologis lintas
akun, Buku Besar disusun per-akun lintas waktu.

## Format Standar (per akun)

Contoh Buku Besar akun **Kas**:

| Tanggal | No. Bukti | Deskripsi | Debit | Kredit | Saldo |
|---|---|---|---|---|---|
| 2026-07-01 | JU-0001 | Setoran modal awal | 10.000.000 | | 10.000.000 |
| 2026-07-02 | JU-0002 | Beli perlengkapan tunai | | 1.000.000 | 9.000.000 |
| 2026-07-05 | JU-0003 | Penjualan tunai | 3.000.000 | | 12.000.000 |

Kolom **Saldo** adalah saldo berjalan (running balance) — dihitung ulang
setiap ada transaksi baru pada akun tersebut.

## Cara Menghitung Saldo Berjalan

Tergantung saldo normal akun (lihat `05_debit_kredit.md`):
- Akun bersaldo normal **Debit** (Aset, Beban): `saldo += debit - kredit`
- Akun bersaldo normal **Kredit** (Liabilitas, Modal, Pendapatan): `saldo += kredit - debit`

## Proses "Posting"

Memindahkan data dari Jurnal Umum ke Buku Besar disebut **posting**.
Di pembukuan manual, ini dilakukan satu per satu dan rawan salah tulis
angka. Di aplikasi ini, Buku Besar **dihitung otomatis** dari data Jurnal
Umum setiap kali diminta — jadi tidak ada risiko "lupa posting" atau
angka Buku Besar tidak sinkron dengan jurnal aslinya.

## Kegunaan Buku Besar

1. Melihat riwayat lengkap satu akun tertentu (mis. "kemana saja uang
   kas keluar bulan ini?").
2. Dasar penyusunan Neraca Saldo (total semua saldo akhir per akun).
3. Menelusuri kesalahan — kalau neraca saldo tidak balance, cek buku
   besar akun mana yang janggal.
