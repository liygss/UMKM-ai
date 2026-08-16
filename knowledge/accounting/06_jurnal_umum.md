# Jurnal Umum

## Definisi

Jurnal Umum adalah catatan kronologis (berurutan sesuai tanggal) dari
semua transaksi keuangan usaha, dalam bentuk pasangan debit dan kredit.
Ini adalah **titik masuk pertama** semua transaksi ke sistem akuntansi.

## Format Standar

| Tanggal | No. Bukti | Deskripsi | Akun | Debit | Kredit |
|---|---|---|---|---|---|
| 2026-07-01 | JU-0001 | Setoran modal awal | Kas | 10.000.000 | |
| | | | Modal Pemilik | | 10.000.000 |

## Elemen Wajib Satu Jurnal

1. **Tanggal transaksi** — kapan transaksi benar-benar terjadi (bukan
   kapan dicatat, kalau berbeda).
2. **Nomor bukti** — referensi unik ke bukti fisik/digital transaksi
   (nota, invoice, bukti transfer). Wajib unik per jurnal di aplikasi ini.
3. **Deskripsi** — penjelasan singkat transaksi apa.
4. **Minimal 2 baris detail** — satu atau lebih akun di-debit, satu atau
   lebih akun di-kredit, dengan **total debit harus sama dengan total
   kredit**.

## Langkah Menyusun Jurnal

1. Identifikasi akun apa saja yang terpengaruh transaksi ini.
2. Tentukan kategori tiap akun (Aset/Liabilitas/Modal/Pendapatan/Beban).
3. Tentukan apakah akun itu bertambah atau berkurang.
4. Terapkan aturan debit-kredit (lihat `05_debit_kredit.md`) untuk
   menentukan sisi pencatatannya.
5. Pastikan total debit = total kredit sebelum disimpan.

## Contoh Transaksi Umum UMKM

- **Penjualan tunai**: Debit Kas, Kredit Pendapatan Penjualan
- **Penjualan kredit (belum dibayar)**: Debit Piutang Usaha, Kredit Pendapatan Penjualan
- **Beli barang dagang tunai**: Debit Persediaan, Kredit Kas
- **Bayar gaji karyawan**: Debit Beban Gaji, Kredit Kas
- **Pemilik ambil uang usaha untuk pribadi**: Debit Prive, Kredit Kas

Lihat `24_contoh_transaksi.md` untuk contoh lebih lengkap dan
`25_mapping_akun.md` untuk panduan cepat memilih akun yang tepat.

## Validasi Otomatis di Aplikasi Ini

Sistem menolak jurnal yang: (1) total debit ≠ total kredit, (2) kode akun
tidak ditemukan di Chart of Accounts, atau (3) nomor bukti sudah dipakai
sebelumnya — supaya kesalahan tertangkap sedini mungkin, sebelum menjalar
ke buku besar dan laporan keuangan.
