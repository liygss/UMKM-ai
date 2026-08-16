# Warning Deadline Pajak UMKM

## Tenggat Umum yang Dipantau

| Kewajiban | Tenggat Umum |
|---|---|
| Pembayaran PPh Masa tertentu | Tanggal 15 bulan berikutnya. |
| Pelaporan SPT Masa PPh | Tanggal 20 bulan berikutnya. |
| SPT Masa PPN | Akhir bulan berikutnya; pembayaran mengikuti ketentuan sebelum pelaporan. |
| SPT Tahunan Orang Pribadi | Paling lama 3 bulan setelah akhir tahun pajak. |
| SPT Tahunan Badan | Paling lama 4 bulan setelah akhir tahun pajak. |
| PPh Pasal 29 | Dibayar sebelum SPT Tahunan disampaikan. |

## Tingkat Pengingat

| Waktu | Label |
|---|---|
| 14 hari sebelum | Persiapan |
| 7 hari sebelum | Pengingat |
| 3 hari sebelum | Penting |
| 1 hari sebelum | Mendesak |
| Hari jatuh tempo | Jatuh tempo hari ini |
| Setelah jatuh tempo | Terlambat |

## Aturan Kalender Dinamis

Sistem harus menerapkan aturan berikut:

- memeriksa hari Sabtu, Minggu, hari libur nasional, cuti bersama, dan ketentuan penyesuaian ke hari kerja berikutnya;
- memeriksa relaksasi atau pengumuman resmi Direktorat Jenderal Pajak untuk periode tertentu;
- membedakan perubahan tanggal jatuh tempo resmi dengan kebijakan penghapusan sanksi karena keduanya tidak selalu memiliki akibat hukum yang sama; dan
- menyimpan sumber, tanggal berlaku, jenis pajak, serta tanggal pembaruan pada dataset deadline.

## Data Minimum Reminder

Data minimum yang diperlukan untuk membuat pengingat meliputi:

- NPWP atau NIK;
- jenis Wajib Pajak;
- jenis pajak;
- masa pajak;
- status Pengusaha Kena Pajak atau PKP;
- status sebagai pemotong atau pemungut pajak;
- tanggal transaksi atau pembayaran penghasilan apabila relevan;
- status pembayaran terakhir; dan
- status pelaporan terakhir.

## Aturan Penentuan Reminder

Sistem menentukan status pengingat berdasarkan selisih antara tanggal saat ini dan tanggal jatuh tempo:

- gunakan label **Persiapan** pada 14 hari sebelum jatuh tempo;
- gunakan label **Pengingat** pada 7 hari sebelum jatuh tempo;
- gunakan label **Penting** pada 3 hari sebelum jatuh tempo;
- gunakan label **Mendesak** pada 1 hari sebelum jatuh tempo;
- gunakan label **Jatuh tempo hari ini** pada tanggal jatuh tempo; dan
- gunakan label **Terlambat** apabila tanggal jatuh tempo telah terlewati dan kewajiban belum diselesaikan.

## Aturan Validasi Deadline

Sebelum menampilkan tanggal jatuh tempo, sistem harus:

1. mengidentifikasi jenis pajak dan masa pajak;
2. menentukan tanggal jatuh tempo dasar;
3. memeriksa hari libur, akhir pekan, dan cuti bersama;
4. memeriksa pengumuman atau relaksasi resmi dari DJP;
5. membedakan relaksasi pelaporan, relaksasi pembayaran, dan penghapusan sanksi;
6. menampilkan sumber dan tanggal pembaruan informasi; dan
7. memberikan peringatan apabila data deadline belum diperbarui.

## Kata Kunci

umkm, deadline pajak, warning deadline, pengingat pajak, reminder pajak, kalender pajak, aturan internal aplikasi, business rule, jatuh tempo pembayaran, jatuh tempo pelaporan, pembayaran pph masa, spt masa pph, spt masa ppn, pembayaran ppn, spt tahunan orang pribadi, spt tahunan badan, pph pasal 29, tanggal 15 bulan berikutnya, tanggal 20 bulan berikutnya, akhir bulan berikutnya, tiga bulan setelah akhir tahun pajak, empat bulan setelah akhir tahun pajak, bayar sebelum lapor spt, pengingat 14 hari, pengingat 7 hari, pengingat 3 hari, pengingat 1 hari, jatuh tempo hari ini, status terlambat, kalender dinamis, hari sabtu, hari minggu, hari libur nasional, cuti bersama, hari kerja berikutnya, relaksasi pajak, penghapusan sanksi, pengumuman djp, tenggat bayar, tenggat lapor, dataset deadline, masa pajak, status pkp, pemotong pajak, pemungut pajak