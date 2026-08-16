\# Status Bebas Pajak UMKM



\## Pengertian



Status \*\*Bebas Pajak\*\* menunjukkan bahwa pajak terutang untuk jenis pajak, transaksi, dan periode tertentu adalah sebesar Rp0 karena terdapat pengecualian, fasilitas, atau pembebasan yang telah diverifikasi.



Status `BEBAS\_PAJAK` tidak berarti Wajib Pajak bebas dari seluruh kewajiban perpajakan. Kewajiban pencatatan, penyimpanan dokumen, pemotongan, pemungutan, atau pelaporan pajak tertentu dapat tetap berlaku.



\## Kondisi yang Dapat Menghasilkan Status



Status `BEBAS\_PAJAK` dapat digunakan apabila salah satu kondisi berikut telah diverifikasi:



\- Wajib Pajak orang pribadi yang menggunakan PPh Final UMKM memiliki omzet usaha kumulatif yang belum melebihi batas Rp500 juta dalam satu tahun pajak;

\- penghasilan yang diterima termasuk bukan objek pajak berdasarkan ketentuan yang berlaku;

\- terdapat fasilitas pembebasan pajak yang sah;

\- terdapat Surat Keterangan Bebas atau SKB yang valid untuk transaksi terkait; atau

\- hasil penghitungan pajak tertentu adalah nihil setelah seluruh data yang diperlukan dinyatakan lengkap.



\## Logika Penentuan Status



Status `BEBAS\_PAJAK` ditetapkan apabila seluruh persyaratan berikut terpenuhi:



1\. identitas Wajib Pajak telah diketahui;

2\. bentuk Wajib Pajak telah diketahui;

3\. jenis pajak, jenis penghasilan, transaksi, dan periode pajak telah ditentukan;

4\. data yang menjadi dasar penghitungan telah lengkap;

5\. dasar hukum pengecualian, fasilitas, atau pembebasan telah diidentifikasi;

6\. kondisi pengecualian atau pembebasan telah diverifikasi;

7\. pajak terutang untuk kewajiban yang dinilai sama dengan Rp0; dan

8\. tidak terdapat data lain yang menunjukkan adanya pajak terutang.



\*\*Rumus logika:\*\*



`Data lengkap = YA`



`Fasilitas atau pengecualian valid = YA`



`Pajak terutang = Rp0`



\*\*Hasil:\*\*



`Status = BEBAS\_PAJAK`



\## Format Label



Status harus ditampilkan secara spesifik berdasarkan jenis pajak dan periode yang dinilai.



\*\*Format:\*\*



`Bebas Pajak untuk \[jenis pajak] \[masa atau tahun pajak]`



\*\*Contoh:\*\*



`Bebas Pajak untuk PPh Final UMKM Tahun Pajak 2026`



Label tidak boleh hanya menampilkan kata \*\*Bebas Pajak\*\* tanpa menjelaskan ruang lingkup kewajiban yang dinilai.



\## Ketentuan Omzet Rp500 Juta



Fasilitas omzet sampai dengan Rp500 juta dalam satu tahun pajak berlaku untuk Wajib Pajak orang pribadi yang memenuhi ketentuan penggunaan PPh Final UMKM.



Dalam menerapkan fasilitas tersebut, sistem harus:



1\. mengumpulkan omzet dari seluruh kegiatan usaha;

2\. menggabungkan omzet dari kas, rekening bank, marketplace, cabang, dan kanal lainnya;

3\. mengeliminasi transfer internal yang bukan merupakan omzet;

4\. menghitung omzet secara kumulatif sejak awal tahun pajak;

5\. memastikan penghasilan berasal dari kegiatan usaha yang memenuhi ketentuan PPh Final UMKM; dan

6\. menghitung pajak atas bagian omzet yang telah melewati batas fasilitas.



Status bebas pajak hanya berlaku atas bagian omzet yang memperoleh fasilitas. Status tersebut tidak otomatis berlaku untuk penghasilan lain.



\## Penghasilan Bukan Objek Pajak



Status `BEBAS\_PAJAK` dapat digunakan apabila penghasilan telah diverifikasi sebagai bukan objek pajak.



Sistem harus mencatat:



\- jenis penghasilan;

\- nilai penghasilan;

\- pihak pemberi penghasilan;

\- tanggal penerimaan;

\- dokumen pendukung;

\- dasar hukum; dan

\- kewajiban pelaporan yang tetap berlaku.



Penghasilan bukan objek pajak tidak selalu dapat diabaikan dalam SPT Tahunan. Penghasilan tersebut dapat tetap perlu dicantumkan pada bagian yang sesuai.



\## Surat Keterangan Bebas



Status berdasarkan Surat Keterangan Bebas hanya dapat digunakan apabila:



\- SKB diterbitkan oleh otoritas yang berwenang;

\- identitas Wajib Pajak sesuai;

\- jenis pajak sesuai;

\- transaksi yang dinilai termasuk dalam ruang lingkup SKB;

\- masa berlaku SKB belum berakhir;

\- dokumen dapat diverifikasi; dan

\- tidak terdapat pembatalan atau perubahan terhadap SKB.



\## Informasi yang Ditampilkan



Ketika status `BEBAS\_PAJAK` ditetapkan, sistem menampilkan:



\- identitas Wajib Pajak;

\- bentuk Wajib Pajak;

\- jenis pajak;

\- jenis penghasilan atau transaksi;

\- masa atau tahun pajak;

\- dasar pengenaan pajak;

\- nilai pajak terutang sebesar Rp0;

\- alasan pemberian status;

\- dasar hukum;

\- nomor dan masa berlaku SKB apabila relevan;

\- dokumen pendukung;

\- kewajiban pencatatan;

\- kewajiban penyimpanan bukti; dan

\- kewajiban pelaporan yang masih berlaku.



\## Pesan Wajib



> Bebas membayar pajak tidak selalu berarti bebas melaporkan pajak. Wajib Pajak dapat tetap memiliki kewajiban untuk mencatat omzet, menyimpan dokumen, menyampaikan SPT Tahunan, atau memenuhi kewajiban perpajakan lainnya.



\## Jangan Gunakan Status Bebas Pajak Apabila



Status `BEBAS\_PAJAK` tidak boleh digunakan apabila:



\- data omzet belum lengkap;

\- omzet hanya diperoleh dari satu rekening, marketplace, atau kanal penjualan;

\- bentuk Wajib Pajak belum diketahui;

\- jenis penghasilan belum dapat ditentukan;

\- penghasilan diduga berasal dari pekerjaan bebas atau profesi;

\- penghasilan dapat termasuk penghasilan final lainnya;

\- fasilitas atau dasar pengecualian belum dapat diverifikasi;

\- Surat Keterangan Bebas telah kedaluwarsa;

\- Surat Keterangan Bebas belum diverifikasi;

\- penghitungan pajak belum dilakukan;

\- bukti pembayaran tidak ditemukan;

\- pembayaran masih menunggu verifikasi; atau

\- terdapat pajak terutang yang belum dibayar.



Tidak ditemukannya pembayaran bukan merupakan dasar untuk menetapkan status `BEBAS\_PAJAK`.



\## Status Alternatif



| Status | Kondisi |

|---|---|

| `BEBAS\_PAJAK` | Pajak terutang sebesar Rp0 karena fasilitas, pengecualian, atau pembebasan yang telah diverifikasi. |

| `NIHIL` | Hasil penghitungan pajak sebesar Rp0 tanpa menggunakan fasilitas pembebasan tertentu. |

| `WAJIB\_BAYAR` | Terdapat pajak terutang dan tanggal jatuh tempo belum terlewati. |

| `BELUM\_BAYAR` | Terdapat pajak terutang yang belum dibayar dan tanggal jatuh tempo telah terlewati. |

| `KURANG\_BAYAR` | Pembayaran telah dilakukan sebagian, tetapi masih terdapat saldo pajak. |

| `MENUNGGU\_VERIFIKASI` | Dokumen atau bukti pembayaran tersedia, tetapi belum dapat diverifikasi. |

| `PERLU\_TINJAUAN` | Data atau dasar hukum belum cukup untuk menentukan status. |



\## Prioritas Penentuan Status



Sistem menentukan status dengan urutan berikut:



1\. identifikasi bentuk Wajib Pajak;

2\. identifikasi jenis penghasilan dan jenis pajak;

3\. periksa kelengkapan data;

4\. hitung dasar pengenaan pajak;

5\. periksa fasilitas atau pengecualian yang berlaku;

6\. verifikasi Surat Keterangan Bebas apabila ada;

7\. hitung pajak terutang;

8\. tentukan kewajiban pembayaran;

9\. tentukan kewajiban pelaporan; dan

10\. tetapkan status akhir.



\## Aturan Keputusan



\- Gunakan status `BEBAS\_PAJAK` apabila pajak terutang sebesar Rp0 karena fasilitas, pengecualian, atau pembebasan yang sah.

\- Gunakan status `NIHIL` apabila hasil penghitungan pajak sebesar Rp0 tanpa fasilitas pembebasan tertentu.

\- Gunakan status `PERLU\_TINJAUAN` apabila data atau dokumen belum lengkap.

\- Gunakan status `WAJIB\_BAYAR` apabila terdapat pajak terutang dan belum jatuh tempo.

\- Gunakan status `BELUM\_BAYAR` apabila pajak terutang belum dibayar dan jatuh tempo telah terlewati.

\- Jangan menetapkan status `BEBAS\_PAJAK` hanya karena tidak ditemukan pembayaran pajak.

\- Jangan menerapkan fasilitas omzet Rp500 juta kepada Wajib Pajak badan.

\- Jangan menerapkan fasilitas PPh Final UMKM terhadap penghasilan yang tidak memenuhi persyaratan.



\## Contoh Kondisi



| Kondisi | Status |

|---|---|

| Orang pribadi memiliki omzet usaha kumulatif Rp400 juta dan memenuhi ketentuan PPh Final UMKM | `BEBAS\_PAJAK` untuk PPh Final UMKM atas omzet yang memperoleh fasilitas |

| Orang pribadi memiliki omzet kumulatif Rp650 juta | Fasilitas hanya diperhitungkan sesuai batas yang berlaku; bagian yang melebihi batas perlu dihitung pajaknya |

| Penghasilan telah diverifikasi sebagai bukan objek pajak | `BEBAS\_PAJAK` untuk penghasilan tersebut |

| SKB masih berlaku dan sesuai dengan transaksi | `BEBAS\_PAJAK` untuk transaksi yang tercakup dalam SKB |

| Hasil penghitungan PPh Pasal 21 adalah Rp0 setelah data lengkap | `NIHIL` |

| Data omzet belum lengkap | `PERLU\_TINJAUAN` |

| Pajak belum dihitung dan tidak ditemukan pembayaran | Tidak dapat ditetapkan sebagai `BEBAS\_PAJAK` |



\## Kata Kunci



umkm, status bebas pajak, bebas pajak, label bebas pajak, aturan internal aplikasi, business rule, status pajak internal, pajak terutang nol, pajak nihil, bebas bayar, tidak bebas lapor, wajib pajak orang pribadi, pph final umkm, omzet kumulatif 500 juta, fasilitas omzet 500 juta, bukan objek pajak, pengecualian pajak, pembebasan pajak, surat keterangan bebas, skb, pph pasal 21 nihil, data pajak lengkap, verifikasi pembebasan, jenis pajak, masa pajak, periode pajak, pencatatan omzet, penyimpanan bukti, kewajiban spt tahunan, data omzet belum lengkap, pekerjaan bebas, penghasilan final lain, surat pembebasan kedaluwarsa, pajak terutang, status nihil, status perlu tinjauan

