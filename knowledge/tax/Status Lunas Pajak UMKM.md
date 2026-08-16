# Status Lunas Pajak UMKM

## Pengertian

Status **Lunas** menunjukkan bahwa pembayaran pajak untuk jenis pajak, masa pajak, dan tahun pajak tertentu telah diverifikasi serta memenuhi jumlah pajak yang terutang.

Status `LUNAS` hanya menggambarkan pemenuhan kewajiban pembayaran. Status ini tidak otomatis berarti SPT atau laporan pajak telah disampaikan.

## Syarat Minimum

Status `LUNAS` dapat ditetapkan apabila seluruh persyaratan berikut terpenuhi:

- NTPN atau Bukti Penerimaan Negara dapat diverifikasi;
- NPWP, NIK, atau identitas pembayar sesuai;
- jenis pajak sesuai;
- kode jenis setoran sesuai;
- masa pajak dan tahun pajak sesuai;
- jumlah pembayaran terverifikasi sama dengan atau lebih besar daripada pajak terutang;
- status pembayaran dinyatakan valid;
- tidak terdapat pembatalan pembayaran; dan
- tidak terdapat koreksi pembayaran yang belum diselesaikan.

## Logika Penentuan Status

Status `LUNAS` ditetapkan apabila:

1. pembayaran terverifikasi sama dengan atau lebih besar daripada pajak terutang;
2. identitas Wajib Pajak atau pembayar sesuai;
3. jenis pajak, kode jenis setoran, masa pajak, dan tahun pajak sesuai;
4. pembayaran berstatus valid;
5. tidak terdapat pembatalan atau koreksi pembayaran yang belum selesai; dan
6. pembayaran telah dialokasikan pada kewajiban pajak yang dinilai.

**Rumus logika:**

`Pembayaran terverifikasi >= pajak terutang`

`Identitas pembayar sesuai`

`Jenis pajak dan kode jenis setoran sesuai`

`Masa pajak dan tahun pajak sesuai`

`Status pembayaran valid`

**Hasil:**

`Status = LUNAS`

## Perhitungan Saldo

**Rumus saldo pajak:**

`Saldo pajak = pajak terutang − pembayaran terverifikasi`

Ketentuan hasil:

- apabila saldo pajak lebih besar dari nol, status belum dapat dinyatakan `LUNAS`;
- apabila saldo pajak sama dengan nol, status dapat dinyatakan `LUNAS`; dan
- apabila saldo pajak kurang dari nol, status pembayaran dapat dinyatakan `LUNAS`, tetapi terdapat selisih lebih bayar yang harus ditinjau.

## Pemisahan Status

| Status | Makna |
|---|---|
| `LUNAS_BAYAR` | Pembayaran telah terverifikasi dan sesuai dengan kewajiban pajak yang dinilai. |
| `SUDAH_LAPOR` | SPT atau laporan pajak telah disampaikan dan memperoleh bukti penerimaan. |
| `SELESAI` | Kewajiban pembayaran dan pelaporan yang dipersyaratkan telah terpenuhi. |
| `POTENSI_LEBIH_BAYAR` | Pembayaran terverifikasi lebih besar daripada pajak terutang dan selisihnya perlu ditinjau. |

## Informasi yang Ditampilkan

Ketika status `LUNAS` ditetapkan, sistem menampilkan:

- jenis pajak;
- kode akun pajak;
- kode jenis setoran;
- masa pajak;
- tahun pajak;
- jumlah pajak terutang;
- jumlah pembayaran terverifikasi;
- tanggal pembayaran;
- NTPN;
- nomor Bukti Penerimaan Negara;
- saldo kewajiban;
- status pelaporan;
- nomor Bukti Penerimaan Elektronik jika sudah dilaporkan; dan
- keterangan mengenai kelebihan pembayaran apabila ada.

## Validasi Pembayaran

Sebelum menetapkan status `LUNAS`, sistem harus memeriksa:

1. validitas NTPN;
2. validitas Bukti Penerimaan Negara;
3. kesesuaian NPWP atau NIK;
4. kesesuaian identitas pembayar;
5. kesesuaian kode akun pajak;
6. kesesuaian kode jenis setoran;
7. kesesuaian masa pajak;
8. kesesuaian tahun pajak;
9. kesesuaian nominal pembayaran;
10. status pembatalan pembayaran;
11. status pemindahbukuan atau koreksi pembayaran; dan
12. hasil rekonsiliasi dengan pajak terutang.

## Aturan Penentuan Status

- Gunakan status `LUNAS_BAYAR` apabila pembayaran telah terverifikasi dan sesuai dengan kewajiban pajak.
- Gunakan status `SUDAH_LAPOR` apabila SPT telah memperoleh Bukti Penerimaan Elektronik atau bukti penerimaan lain yang sah.
- Gunakan status `SELESAI` apabila kewajiban pembayaran dan pelaporan telah dipenuhi.
- Gunakan status `POTENSI_LEBIH_BAYAR` apabila pembayaran lebih besar daripada pajak terutang.
- Gunakan status `MENUNGGU_VERIFIKASI` apabila bukti pembayaran tersedia, tetapi NTPN belum dapat diverifikasi.
- Gunakan status `SALAH_PEMBAYARAN` apabila jenis pajak, kode setoran, masa pajak, atau tahun pajak tidak sesuai.
- Gunakan status `KURANG_BAYAR` apabila pembayaran terverifikasi lebih kecil daripada pajak terutang.
- Jangan menetapkan status `SELESAI` hanya berdasarkan pembayaran apabila kewajiban pelaporan masih belum dipenuhi.

## Contoh Logika Status

| Kondisi | Status |
|---|---|
| Pajak terutang Rp1.000.000 dan pembayaran valid Rp1.000.000 | `LUNAS_BAYAR` |
| Pembayaran telah lunas dan SPT telah memperoleh BPE | `SELESAI` |
| Pajak terutang Rp1.000.000 dan pembayaran valid Rp1.200.000 | `POTENSI_LEBIH_BAYAR` |
| Pajak terutang Rp1.000.000 dan pembayaran valid Rp700.000 | `KURANG_BAYAR` |
| Bukti transfer tersedia tetapi NTPN belum cocok | `MENUNGGU_VERIFIKASI` |
| Pembayaran masuk ke masa pajak yang berbeda | `SALAH_PEMBAYARAN` |

## Peringatan Sistem

Bukti transfer bank saja belum cukup untuk menetapkan status `LUNAS`. Pembayaran harus dapat dicocokkan dengan NTPN, Bukti Penerimaan Negara, identitas Wajib Pajak, jenis pajak, kode jenis setoran, masa pajak, tahun pajak, dan nominal kewajiban.

Status `LUNAS` tidak otomatis berarti kewajiban pelaporan telah selesai. Sistem harus memisahkan validasi pembayaran dan validasi penyampaian SPT.

## Sumber Hukum

- Undang-Undang Ketentuan Umum dan Tata Cara Perpajakan beserta perubahannya.
- Peraturan Menteri Keuangan Nomor 81 Tahun 2024 beserta perubahan atau ketentuan pelaksanaannya.
- Ketentuan Direktorat Jenderal Pajak mengenai pembayaran, penyetoran, pelaporan, Bukti Penerimaan Negara, dan Bukti Penerimaan Elektronik.

## Kata Kunci

umkm, status lunas, lunas pajak, label lunas, aturan internal aplikasi, business rule, status pembayaran pajak, pembayaran terverifikasi, ntpn, nomor transaksi penerimaan negara, bukti penerimaan negara, bpn, npwp, nik, identitas pembayar, jenis pajak, kode akun pajak, kode jenis setoran, masa pajak, tahun pajak, jumlah pembayaran, pajak terutang, pembayaran sesuai, validasi pembayaran, verifikasi pembayaran, koreksi pembayaran, pembatalan pembayaran, pemindahbukuan, lunas bayar, sudah lapor, status selesai, bukti penerimaan elektronik, bpe, spt sudah dilaporkan, kelebihan pembayaran, potensi lebih bayar, rekonsiliasi pembayaran, bukti transfer bank, pmk 81 tahun 2024