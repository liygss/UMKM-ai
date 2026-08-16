# Panduan Cepat: Mapping Transaksi ke Akun

Tabel referensi cepat untuk menentukan akun apa yang dipakai untuk jenis
transaksi/kata kunci tertentu. Berguna untuk kategorisasi otomatis saat
transaksi diimpor dari file csv/xlsx (lihat `services/ingestion/`).

## Kata Kunci → Akun yang Kemungkinan Terlibat

| Kata Kunci Transaksi | Kemungkinan Akun Debit | Kemungkinan Akun Kredit |
|---|---|---|
| "setoran modal", "modal awal" | Kas/Bank | Modal Pemilik |
| "penjualan", "jual", "omzet" | Kas/Bank/Piutang | Pendapatan Penjualan |
| "jasa", "servis", "konsultasi" | Kas/Bank/Piutang | Pendapatan Jasa |
| "beli barang dagang", "restock", "stok" | Persediaan Barang Dagang | Kas/Bank/Utang Usaha |
| "gaji", "upah", "THR" | Beban Gaji | Kas/Bank |
| "sewa toko", "sewa kantor", "sewa gudang" | Beban Sewa | Kas/Bank |
| "listrik", "air", "pulsa", "internet", "telepon" | Beban Listrik, Air, dan Telepon | Kas/Bank |
| "beli perlengkapan", "atk", "kemasan" | Perlengkapan | Kas/Bank |
| "beli peralatan", "beli mesin" | Peralatan | Kas/Bank |
| "beli kendaraan" | Kendaraan | Kas/Bank |
| "bayar utang", "cicilan supplier" | Utang Usaha | Kas/Bank |
| "pinjaman bank", "kredit modal kerja" | Kas/Bank | Utang Bank |
| "prive", "ambil pribadi", "tarik tunai pemilik" | Prive | Kas/Bank |
| "bayar pajak", "setor pajak" | Utang Pajak / Beban Pajak | Kas/Bank |
| "penyusutan" | Beban Penyusutan | Akumulasi Penyusutan |

## Catatan Penting

Tabel ini adalah **titik awal**, bukan aturan mutlak — konteks transaksi
tetap perlu diperhatikan. Contoh: "beli perlengkapan" untuk dijual
kembali (bukan dipakai sendiri) sebenarnya harusnya masuk **Persediaan**,
bukan **Perlengkapan**.

## Ambiguitas yang Sering Terjadi

- **"Beli barang" bisa berarti Persediaan (dijual lagi) ATAU Perlengkapan
  (dipakai sendiri)** — tergantung jenis usahanya.
- **"Transfer" bisa berarti macam-macam** — pelunasan piutang, pembayaran
  utang, setoran modal, atau bahkan prive — perlu deskripsi tambahan
  untuk menentukan akun yang tepat, tidak bisa ditentukan hanya dari kata
  "transfer" saja.

Kalau ragu, sebaiknya minta konfirmasi pengguna dulu daripada menebak,
terutama untuk transaksi dengan nominal besar.
