# Status Wajib Bayar Pajak UMKM

## Pengertian

Status **Wajib Bayar** digunakan apabila terdapat pajak yang masih harus dibayar dan tanggal jatuh tempo pembayaran belum terlewati.

Status ini menunjukkan bahwa Wajib Pajak masih memiliki kesempatan untuk melakukan pembayaran sebelum dikenai status keterlambatan.

## Logika Penentuan Status

Status `WAJIB_BAYAR` ditetapkan apabila seluruh kondisi berikut terpenuhi:

1. pajak terutang lebih besar dari nol;
2. pembayaran terverifikasi lebih kecil daripada pajak terutang;
3. tanggal saat ini belum melewati tanggal jatuh tempo;
4. tidak terdapat fasilitas pembebasan atau pengecualian yang sah;
5. tidak terdapat persetujuan angsuran atau penundaan yang mengubah kewajiban; dan
6. tidak terdapat bukti pembayaran yang masih menunggu verifikasi.

**Rumus logika:**

`Pajak terutang > 0`

`Pembayaran terverifikasi < pajak terutang`

`Tanggal saat ini <= tanggal jatuh tempo`

`Tidak ada fasilitas pembebasan yang valid`

**Hasil:**

`Status = WAJIB_BAYAR`

## Perhitungan Saldo Pajak

**Rumus saldo:**

`Saldo pajak = pajak terutang − pembayaran terverifikasi`

Ketentuan hasil:

- apabila pembayaran terverifikasi sama dengan nol, seluruh pajak terutang masih harus dibayar;
- apabila pembayaran telah dilakukan sebagian, saldo yang belum dibayar tetap berstatus `WAJIB_BAYAR` selama jatuh tempo belum terlewati;
- apabila pembayaran terverifikasi sama dengan atau lebih besar daripada pajak terutang, status diubah menjadi `LUNAS_BAYAR`; dan
- apabila tanggal jatuh tempo telah terlewati, status harus dievaluasi menjadi `BELUM_BAYAR` atau `KURANG_BAYAR`.

## Data yang Ditampilkan

Ketika status `WAJIB_BAYAR` ditetapkan, sistem menampilkan:

- jenis pajak;
- masa pajak;
- tahun pajak;
- dasar pengenaan pajak;
- tarif pajak;
- rumus penghitungan;
- jumlah pajak terutang;
- jumlah pembayaran terverifikasi;
- saldo pajak yang masih harus dibayar;
- tanggal jatuh tempo;
- jumlah hari menuju jatuh tempo;
- sumber aturan mengenai jatuh tempo;
- Kode Akun Pajak atau KAP;
- Kode Jenis Setoran atau KJS;
- ID billing, apabila telah dibuat dan masih berlaku; dan
- panduan pembayaran.

## Status Alternatif

| Status | Kondisi |
|---|---|
| `WAJIB_BAYAR` | Masih terdapat saldo pajak dan tanggal jatuh tempo belum terlewati. |
| `MENUNGGU_VERIFIKASI` | Bukti pembayaran tersedia, tetapi NTPN atau data pembayaran belum dapat diverifikasi. |
| `LUNAS_BAYAR` | Pembayaran terverifikasi sama dengan atau lebih besar daripada pajak terutang. |
| `BELUM_BAYAR` | Belum ada pembayaran dan tanggal jatuh tempo telah terlewati. |
| `KURANG_BAYAR` | Telah dilakukan pembayaran sebagian, tetapi masih terdapat saldo setelah jatuh tempo. |
| `DALAM_ANGSURAN` | Terdapat persetujuan resmi untuk membayar secara angsuran. |
| `DALAM_PENUNDAAN` | Terdapat persetujuan resmi untuk menunda pembayaran. |
| `DIBEBASKAN` | Terdapat fasilitas pembebasan yang sah atas kewajiban pembayaran. |

## Prioritas Penentuan Status

Sistem menentukan status dengan urutan berikut:

1. periksa fasilitas pembebasan atau pengecualian;
2. periksa persetujuan angsuran atau penundaan;
3. periksa bukti pembayaran yang masih menunggu verifikasi;
4. cocokkan pembayaran dengan identitas, jenis pajak, masa pajak, dan tahun pajak;
5. hitung saldo pajak;
6. periksa tanggal jatuh tempo; dan
7. tetapkan status akhir.

## Aturan Keputusan

- Gunakan status `WAJIB_BAYAR` apabila masih terdapat saldo pajak dan tanggal jatuh tempo belum terlewati.
- Gunakan status `MENUNGGU_VERIFIKASI` apabila bukti pembayaran tersedia, tetapi belum berhasil diverifikasi.
- Gunakan status `LUNAS_BAYAR` apabila pembayaran terverifikasi telah memenuhi jumlah pajak terutang.
- Gunakan status `BELUM_BAYAR` apabila belum terdapat pembayaran dan jatuh tempo telah terlewati.
- Gunakan status `KURANG_BAYAR` apabila pembayaran telah dilakukan sebagian, tetapi masih terdapat saldo setelah jatuh tempo.
- Gunakan status `DALAM_ANGSURAN` atau `DALAM_PENUNDAAN` hanya apabila terdapat persetujuan resmi.
- Gunakan status `DIBEBASKAN` hanya apabila fasilitas pembebasan dapat dibuktikan dan masih berlaku.

## Contoh Pesan

> PPh Final UMKM Masa Juni 2026 sebesar Rp300.000 masih harus dibayar. Tanggal jatuh tempo belum terlewati. Periksa kode billing dan lakukan pembayaran sebelum tanggal jatuh tempo yang ditampilkan.

## Contoh Kondisi

| Kondisi | Status |
|---|---|
| Pajak terutang Rp300.000, belum dibayar, dan belum jatuh tempo | `WAJIB_BAYAR` |
| Pajak terutang Rp300.000, telah dibayar Rp100.000, dan belum jatuh tempo | `WAJIB_BAYAR` |
| Pajak terutang Rp300.000 dan pembayaran valid Rp300.000 | `LUNAS_BAYAR` |
| Bukti pembayaran tersedia, tetapi NTPN belum sesuai | `MENUNGGU_VERIFIKASI` |
| Pajak belum dibayar dan jatuh tempo telah terlewati | `BELUM_BAYAR` |
| Pajak dibayar sebagian dan jatuh tempo telah terlewati | `KURANG_BAYAR` |

## Peringatan Sistem

Sistem tidak boleh menetapkan status `WAJIB_BAYAR` sebelum memastikan:

- jumlah pajak terutang;
- jumlah pembayaran terverifikasi;
- tanggal jatuh tempo yang berlaku;
- jenis pajak;
- masa pajak;
- tahun pajak;
- KAP dan KJS;
- status ID billing;
- fasilitas pembebasan;
- persetujuan angsuran atau penundaan; dan
- keberadaan bukti pembayaran yang masih menunggu verifikasi.

Kode billing yang telah kedaluwarsa harus dibuat kembali sebelum pembayaran dilakukan.

## Sumber Hukum

- Undang-Undang Ketentuan Umum dan Tata Cara Perpajakan beserta perubahannya.
- Peraturan Menteri Keuangan Nomor 81 Tahun 2024 beserta perubahan atau ketentuan pelaksanaannya.
- Ketentuan Direktorat Jenderal Pajak mengenai pembayaran, penyetoran, kode billing, Kode Akun Pajak, dan Kode Jenis Setoran.

## Kata Kunci

umkm, status wajib bayar, wajib bayar pajak, label wajib bayar, aturan internal aplikasi, business rule, status pajak internal, pajak terutang, saldo pajak, saldo belum dibayar, pembayaran terverifikasi, jatuh tempo belum terlewati, tanggal jatuh tempo, dasar pengenaan pajak, tarif pajak, rumus pajak, jenis pajak, masa pajak, tahun pajak, jumlah pajak terutang, jumlah pembayaran, kode billing, id billing, kap, kjs, kode akun pajak, kode jenis setoran, panduan pembayaran, pph final umkm, menunggu verifikasi, bukti pembayaran belum terverifikasi, deadline pajak, batas waktu pembayaran, pembayaran sebagian, belum bayar, kurang bayar, lunas bayar, angsuran pajak, penundaan pembayaran, pembebasan pajak, pmk 81 tahun 2024