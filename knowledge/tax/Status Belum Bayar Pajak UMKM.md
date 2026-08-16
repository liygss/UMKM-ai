# Status Belum Bayar Pajak UMKM

## Pengertian

Status **Belum Bayar** digunakan apabila terdapat pajak terutang yang belum dibayar sama sekali dan tanggal jatuh tempo pembayaran telah terlewati.

Status ini berlaku apabila tidak terdapat persetujuan angsuran, penundaan pembayaran, relaksasi, atau fasilitas resmi lain yang mengubah kewajiban pembayaran.

## Logika Penentuan Status

Status `BELUM_BAYAR` ditetapkan apabila seluruh kondisi berikut terpenuhi:

1. pajak terutang lebih besar dari nol;
2. pembayaran terverifikasi sama dengan nol;
3. tanggal saat ini telah melewati tanggal jatuh tempo;
4. tidak terdapat bukti pembayaran yang sedang menunggu verifikasi;
5. tidak terdapat persetujuan angsuran atau penundaan pembayaran; dan
6. tidak terdapat fasilitas atau ketentuan resmi yang mengubah tanggal jatuh tempo.

**Rumus logika:**

`Pajak terutang > 0`

`Pembayaran terverifikasi = 0`

`Tanggal saat ini > tanggal jatuh tempo`

`Tidak ada angsuran, penundaan, atau fasilitas resmi`

**Hasil:**

`Status = BELUM_BAYAR`

## Informasi yang Ditampilkan

Ketika status `BELUM_BAYAR` ditetapkan, sistem menampilkan:

- jenis pajak;
- masa atau tahun pajak;
- jumlah pokok pajak terutang;
- saldo pajak yang belum dibayar;
- tanggal jatuh tempo;
- jumlah hari keterlambatan;
- estimasi sanksi bunga;
- tarif bunga resmi yang digunakan;
- periode berlakunya tarif bunga;
- dasar pasal pengenaan sanksi;
- panduan pembayaran; dan
- panduan koreksi apabila terdapat kesalahan jenis pajak atau masa pajak.

## Perhitungan Saldo Pajak

**Rumus saldo:**

`Saldo pajak = pajak terutang − pembayaran terverifikasi`

Untuk status `BELUM_BAYAR`, pembayaran terverifikasi bernilai nol sehingga:

`Saldo pajak = pajak terutang`

## Estimasi Sanksi Bunga

Estimasi sanksi bunga dihitung dengan rumus:

`Estimasi bunga = saldo pajak × tarif bunga per bulan × jumlah bulan keterlambatan`

Tarif bunga harus menggunakan tarif resmi yang berlaku berdasarkan jenis sanksi, dasar pasal, dan periode penghitungan.

Bagian dari satu bulan dapat dihitung sebagai satu bulan penuh sesuai ketentuan perpajakan yang berlaku.

Estimasi bunga yang ditampilkan oleh sistem bukan merupakan nilai tagihan resmi apabila belum diterbitkan Surat Tagihan Pajak atau dokumen resmi lainnya oleh Direktorat Jenderal Pajak.

## Status Alternatif

| Status | Kondisi |
|---|---|
| `MENUNGGU_VERIFIKASI` | Bukti pembayaran tersedia, tetapi NTPN atau data pembayaran belum berhasil diverifikasi. |
| `SALAH_PEMBAYARAN` | Pembayaran tercatat pada jenis pajak, kode setoran, atau masa pajak yang tidak sesuai. |
| `KURANG_BAYAR` | Pembayaran telah dilakukan sebagian, tetapi jumlahnya lebih kecil daripada pajak terutang. |
| `DALAM_ANGSURAN` | Terdapat persetujuan resmi untuk membayar pajak secara angsuran. |
| `DALAM_PENUNDAAN` | Terdapat persetujuan resmi untuk menunda pembayaran pajak. |
| `BELUM_JATUH_TEMPO` | Pajak belum dibayar, tetapi tanggal jatuh tempo belum terlewati. |
| `LUNAS` | Pembayaran terverifikasi sama dengan atau lebih besar daripada pajak terutang. |

## Prioritas Penentuan Status

Sistem menentukan status dengan urutan pemeriksaan berikut:

1. periksa persetujuan angsuran atau penundaan;
2. periksa keberadaan bukti pembayaran yang belum terverifikasi;
3. periksa kesesuaian jenis pajak, kode setoran, dan masa pajak;
4. bandingkan pembayaran terverifikasi dengan pajak terutang;
5. periksa tanggal jatuh tempo; dan
6. tetapkan status akhir.

## Aturan Keputusan

- Gunakan status `LUNAS` apabila pembayaran terverifikasi sama dengan atau lebih besar daripada pajak terutang.
- Gunakan status `KURANG_BAYAR` apabila pembayaran terverifikasi lebih besar dari nol, tetapi lebih kecil daripada pajak terutang.
- Gunakan status `BELUM_BAYAR` apabila belum terdapat pembayaran terverifikasi dan tanggal jatuh tempo telah terlewati.
- Gunakan status `BELUM_JATUH_TEMPO` apabila belum terdapat pembayaran dan tanggal jatuh tempo belum terlewati.
- Gunakan status `MENUNGGU_VERIFIKASI` apabila bukti pembayaran tersedia, tetapi NTPN belum dapat dicocokkan.
- Gunakan status `SALAH_PEMBAYARAN` apabila pembayaran dilakukan untuk jenis atau masa pajak yang berbeda.
- Gunakan status `DALAM_ANGSURAN` atau `DALAM_PENUNDAAN` hanya apabila terdapat persetujuan resmi.

## Peringatan Sistem

Sistem tidak boleh langsung menetapkan status `BELUM_BAYAR` hanya karena pembayaran belum ditemukan.

Sebelum menetapkan status, sistem harus memeriksa:

- NTPN;
- bukti penerimaan negara;
- kode akun pajak;
- kode jenis setoran;
- masa pajak;
- tahun pajak;
- nominal pembayaran;
- tanggal pembayaran;
- bukti permohonan atau persetujuan angsuran;
- bukti penundaan pembayaran; dan
- relaksasi atau ketentuan resmi yang berlaku.

## Kata Kunci

umkm, status belum bayar, belum bayar pajak, label belum bayar, aturan internal aplikasi, business rule, pajak terutang, saldo pajak, saldo belum dibayar, jatuh tempo terlewati, pajak terlambat dibayar, keterlambatan pajak, jumlah hari keterlambatan, pokok pajak, sanksi bunga, estimasi bunga pajak, tarif bunga periodik, pembayaran terverifikasi, ntpn, salah pembayaran, salah jenis pajak, salah masa pajak, kurang bayar, pembayaran sebagian, menunggu verifikasi, angsuran pajak, penundaan pembayaran, persetujuan angsuran, persetujuan penundaan, belum jatuh tempo, lunas, panduan pembayaran, koreksi pembayaran