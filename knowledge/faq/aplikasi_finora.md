# Panduan Lengkap Aplikasi Finora

## Tentang Finora

Finora adalah aplikasi pembukuan dan konsultasi pajak berbasis desktop untuk
pelaku UMKM di Indonesia. Aplikasi ini dibangun berdasarkan standar SAK EMKM
(Sistem Akuntansi Keuangan Entitas Mikro, Kecil, dan Menengah) serta dilengkapi
asisten AI (chatbot) yang bisa menjawab pertanyaan seputar akuntansi dan pajak.

Finora berjalan sebagai aplikasi desktop (Electron) dan tersedia untuk:
- **macOS** (file installer: .dmg)
- **Windows** (file installer: .exe / NSIS)
- **Linux** (file installer: .AppImage)

## Fitur Utama Finora

1. **Dashboard** — Ringkasan keuangan real-time (saldo kas/bank, pendapatan, beban, laba/rugi)
2. **Upload Data** — Upload file CSV, XLSX, atau PDF untuk otomatis membuat jurnal
3. **Jurnal Umum** — Pencatatan transaksi manual (debit/kredit) sesuai standar akuntansi
4. **Laporan Keuangan** — Neraca saldo, laporan laba rugi, posisi keuangan (neraca), dan CALK
5. **Daftar Akun** — Pengelolaan chart of accounts sesuai SAK EMKM
6. **Kalkulator Pajak** — Hitung PPh Final UMKM (0,5%) dan PPN (11%/12%)
7. **SPT Tahunan** — Isi formulir SPT 1770/1770S, hitung otomatis, simpan draft, cetak PDF
8. **Chatbot AI** — Asisten AI untuk tanya jawab seputar akuntansi, pajak, dan penggunaan aplikasi
9. **Knowledge Base** — Upload pengetahuan tambahan untuk chatbot (khusus admin)
10. **Feedback** — Kirim komplain, pertanyaan, atau saran ke admin

---

## Cara Login dan Registrasi

### Registrasi Akun Baru
1. Buka aplikasi Finora.
2. Klik tombol **"Daftar"** atau **"Register"** di halaman login.
3. Isi formulir registrasi: nama lengkap, email, dan password.
4. Klik **"Daftar"** untuk membuat akun.
5. Setelah berhasil, kamu akan diarahkan ke halaman login.

### Login
1. Buka aplikasi Finora.
2. Masukkan **email** dan **password** kamu.
3. Klik **"Masuk"** atau **"Login"**.
4. Jika lupa password, klik **"Lupa Password?"** untuk mereset password via email.

---

## Cara Menggunakan Dashboard

Dashboard adalah halaman utama yang menampilkan ringkasan keuangan usaha kamu.

### Melihat Ringkasan Keuangan
1. Setelah login, kamu akan langsung melihat Dashboard.
2. **5 kartu utama** ditampilkan: Saldo Kas, Saldo Bank, Pendapatan Bulan Ini, Beban Bulan Ini, Laba/Rugi Bulan Ini.
3. **3 kartu tahun berjalan**: Total Pendapatan, Total Beban, Laba/Rugi Tahun Berjalan.
4. **Grafik batang** menunjukkan perbandingan Pendapatan vs Beban per bulan.
5. **Grafik pie** menunjukkan komposisi Kas vs Bank.

### Mengubah Periode Laporan
1. Gunakan **date picker** "Dari" dan "Sampai" untuk memilih rentang tanggal.
2. Klik tombol **"Oke"** untuk menerapkan filter.
3. Klik **"Bulan Ini"** untuk langsung ke periode bulan berjalan.
4. Klik **"Otomatis"** untuk menggunakan periode otomatis berdasarkan data terakhir.

### Quick Action
- **"Tanya AI"** — Membuka chatbot untuk bertanya.
- **"Upload File"** — Langsung ke halaman upload.
- **"Jurnal Baru"** — Langsung ke halaman jurnal untuk membuat entri baru.

---

## Cara Upload Data Transaksi

Halaman Upload memungkinkan kamu mengunggah file data transaksi untuk diproses otomatis menjadi jurnal.

### Format File yang Didukung
- **CSV** (.csv)
- **XLSX** (.xlsx) atau **XLS** (.xls)
- **PDF** (.pdf) — data transaksi akan masuk ke jurnal; dokumen peraturan akan masuk ke knowledge base chatbot
- **Ukuran maksimal:** 25 MB

### Langkah Upload
1. Buka halaman **Upload** dari menu sidebar.
2. **Drag and drop** file ke area upload, atau klik **"Pilih File"** untuk memilih dari komputer.
3. File akan terupload dan mulai diproses secara otomatis.
4. **Status pemrosesan** ditampilkan secara real-time:
   - **Menunggu** — File sudah diunggah, menunggu diproses.
   - **Diproses** — Sedang diekstrak dan dinormalisasi.
   - **Berhasil** — Data sudah masuk ke jurnal dan dashboard.
   - **Gagal** — Terjadi error, cek pesan error yang ditampilkan.
5. Setelah semua file selesai diproses, klik **"Lihat Dashboard"** untuk melihat ringkasan keuangan terbaru.

### Menghapus File
- Klik ikon **tempat sampah** di samping file untuk menghapus satu file.
- Klik **"Hapus Semua Data"** untuk menghapus seluruh data (hati-hati, ini tidak bisa dibatalkan).

---

## Cara Membuat Jurnal Transaksi

Jurnal Umum digunakan untuk mencatat transaksi keuangan secara manual.

### Langkah Membuat Jurnal Baru
1. Buka halaman **Jurnal** dari menu sidebar.
2. Klik tombol **"Buat Jurnal"**.
3. Isi informasi header:
   - **No. Bukti** — Nomor bukti transaksi (contoh: "JV-001").
   - **Tanggal** — Tanggal transaksi.
   - **Deskripsi** — Keterangan singkat transaksi.
4. Tambahkan **baris detail jurnal**:
   - Pilih **Kode Akun** dari dropdown (contoh: Kas, Pendapatan, Beban Gaji).
   - Masukkan jumlah **Debit** atau **Kredit** (hanya isi salah satu).
   - Isi **Keterangan** untuk baris detail (opsional).
5. Klik **"+ Tambah Baris"** untuk menambah baris detail lain.
6. Pastikan **Total Debit = Total Kredit** (indikator hijau "Balance" akan muncul).
7. Klik **"Simpan Jurnal"**.

### Tips
- Setiap transaksi harus seimbang (total debit = total kredit).
- Jurnal yang sudah disimpan akan langsung muncul di daftar dan mempengaruhi dashboard.

---

## Cara Melihat Laporan Keuangan

Halaman Laporan menyediakan 4 jenis laporan keuangan sesuai SAK EMKM.

### Jenis Laporan
1. **Neraca Saldo (Trial Balance)** — Daftar semua akun dengan saldo debit/kredit.
2. **Laba Rugi (Income Statement)** — Pendapatan, HPP, beban operasional, dan laba bersih.
3. **Posisi Keuangan (Balance Sheet)** — Aset, liabilitas, dan modal.
4. **CALK (Catatan Atas Laporan Keuangan)** — Kebijakan akuntansi dan rincian.

### Melihat Laporan
1. Buka halaman **Laporan** dari menu sidebar.
2. Pilih jenis laporan melalui **tab** di bagian atas.
3. Atur **tanggal laporan** menggunakan date picker.
4. Untuk Laporan Laba Rugi, kamu bisa mengatur **rentang tanggal** (dari — sampai).
5. Klik **"Hari Ini"** untuk melihat laporan per tanggal hari ini.

### Export Laporan
- Klik **"PDF (Semua)"** untuk mencetak/menyimpan semua laporan sebagai PDF.
- Klik **"Excel (Semua)"** untuk mengunduh semua laporan dalam format XLSX.
- Klik **"CSV (Semua)"** untuk mengunduh semua laporan dalam format CSV.

---

## Cara Mengelola Daftar Akun (Chart of Accounts)

Daftar Akun berisi seluruh akun yang digunakan dalam pembukuan sesuai SAK EMKM.

### Melihat Daftar Akun
1. Buka halaman **Akun** dari menu sidebar.
2. Semua akun ditampilkan dalam tabel: Kode, Nama Akun, Kategori, Saldo Normal, Saldo.
3. Gunakan **filter kategori** (Semua, Aset, Liabilitas, Modal, Pendapatan, Beban) untuk menyaring.
4. Gunakan **kolom pencarian** untuk mencari akun berdasarkan kode atau nama.

### Menambah Akun Baru
1. Klik tombol **"Tambah Akun"**.
2. Isi form:
   - **Kode Akun** — Kode unik akun (contoh: "1-1100").
   - **Nama Akun** — Nama akun (contoh: "Kas").
   - **Kategori** — Pilih: Aset, Liabilitas, Modal, Pendapatan, atau Beban.
   - **Saldo Normal** — DEBIT atau KREDIT.
   - **Sub Kategori** — Kategori lebih detail (opsional, contoh: "Kas & Bank").
3. Klik **"Simpan Akun"**.

---

## Cara Menggunakan Kalkulator Pajak

Halaman Pajak menyediakan kalkulator untuk menghitung kewajiban pajak UMKM.

### Hitung PPh Final UMKM
1. Buka halaman **Pajak** dari menu sidebar.
2. Di bagian **PPh Final UMKM**:
   - Pilih **Tipe Wajib Pajak**: Orang Pribadi atau Badan/PT/CV.
   - Masukkan **Omzet Bulan Ini** (pendapatan kotor bulan berjalan).
   - Masukkan **Omzet Kumulatif Sebelumnya** (total omzet dari Januari sampai bulan lalu, opsional).
3. Klik **"Hitung PPh Final"**.
4. Hasil ditampilkan: omzet kena pajak, tarif 0,5%, dan PPh Final terutang.
5. **Catatan**: Orang pribadi dengan omzet di bawah Rp 500 juta/tahun bebas PPh Final. Maksimum omzet kena PPh Final adalah Rp 4,8 miliar/tahun.

### Hitung PPN (VAT)
1. Di bagian **PPN**:
   - Masukkan **Nilai Transaksi**.
   - Centang **"Sudah termasuk PPN"** jika harga yang dimasukkan sudah termasuk PPN.
   - Centang **"Barang mewah (12%)"** jika barang kena PPnBM.
2. Klik **"Hitung PPN"**.
3. Hasil ditampilkan: dasar pengenaan pajak, tarif (11% atau 12%), PPN terutang, dan harga termasuk PPN.

---

## Cara Mengisi SPT Tahunan

Halaman SPT membantu kamu mengisi formulir SPT Tahunan PPh Orang Pribadi (1770 atau 1770S).

### Pilih Jenis Formulir
- **1770** — Untuk pengusaha/wirausaha/pekerja bebas dengan beberapa sumber penghasilan.
- **1770S** — Untuk karyawan/pegawai dengan satu atau lebih pemberi kerja.

### Langkah Pengisian
1. Buka halaman **SPT** dari menu sidebar.
2. Pilih jenis formulir (**1770** atau **1770S**) di sidebar.
3. Isi setiap bagian secara berurutan:
   - **Identitas WP** — NPWP, nama, status kawin, alamat, jenis usaha, pekerjaan.
   - **Penghasilan** — Pilih metode: Pembukuan atau Pencatatan. Isi data penghasilan usaha, penghasilan dari pekerjaan, penghasilan lainnya, dan PPh Final.
   - **Kredit Pajak** — Isi PPh 24, PPh 25 yang sudah dibayar, dan bukti potong/pemungutan.
   - **Harta & Utang** — Daftar harta yang dimiliki dan utang yang masih ada.
   - **Tanggungan** — Data tanggungan (nama, NIK, hubungan keluarga).
   - **Permohonan** — Pilih opsi restitusi atau angsuran PPh 25.
4. Buka bagian **"Hasil & Cetak"**.
5. Klik **"Hitung & Preview"** untuk melihat perhitungan otomatis.
6. **Simpan Draft** untuk menyimpan data sementara (bisa dilanjutkan nanti).
7. **Cetak / Simpan PDF** untuk mencetak formulir SPT yang sudah jadi.

### Tips
- Klik **"Muat data contoh"** di sidebar untuk memuat data tutorial.
- Draft yang disimpan bisa dimuat kembali kapan saja dari daftar draft di sidebar.

---

## Cara Menggunakan Chatbot (Asisten AI)

Chatbot Finora bisa menjawab pertanyaan seputar:
- **Akuntansi dan pembukuan** (jurnal, neraca, laporan keuangan, SAK EMKM)
- **Perpajakan** (PPh Final, PPN, SPT, NPWP, tarif pajak)
- **Penggunaan aplikasi Finora** (cara pakai fitur, navigasi halaman, upload data, dll)
- **Data keuangan kamu** (saldo, laba rugi, transaksi terakhir)

### Cara Menggunakan
1. Klik ikon chatbot di pojok kanan bawah (floating button) atau buka halaman **Chatbot** dari sidebar.
2. Ketik pertanyaan di kolom input.
3. Tekan **Enter** atau klik tombol **kirim**.
4. Asisten AI akan menjawab berdasarkan pengetahuan yang tersedia dan data keuangan kamu.
5. Kamu bisa melanjutkan percakapan (chatbot ingat konteks dalam satu sesi).
6. Klik tombol **refresh** untuk memulai percakapan baru.

### Contoh Pertanyaan yang Bisa Ditanyakan
- "Apa itu SAK EMKM?"
- "Cara membuat jurnal penjualan?"
- "Berapa tarif PPh Final UMKM?"
- "Berapa laba bersih bulan ini?"
- "Cara upload data transaksi?"
- "Fitur apa saja yang ada di Finora?"
- "Apa fungsi halaman laporan?"
- "Bagaimana cara mengisi SPT?"

---

## Cara Mengelola Knowledge Base (Admin)

Halaman Knowledge Base memungkinkan admin mengelola pengetahuan yang digunakan chatbot.

### Menambah Pengetahuan Baru
1. Buka halaman **Knowledge** dari menu sidebar (hanya admin yang bisa mengakses).
2. Klik **"Tambah Knowledge"**.
3. Isi form:
   - **Judul** — Judul dokumen pengetahuan.
   - **Kategori** — Pilih: Umum, Akuntansi, Pajak, SAK EMKM, Peraturan, atau FAQ.
   - **Konten Pengetahuan** — Tulis konten dalam format Markdown. Gunakan heading (##, ###) untuk struktur yang rapi.
4. Klik **"Simpan & Proses"**.
5. Dokumen akan diproses (di-chunk dan di-embed) untuk digunakan oleh chatbot.

### Menghapus Pengetahuan
- Klik ikon **tempat sampah** di samping item untuk menghapus pengetahuan.

---

## Cara Mengirim Feedback

1. Buka halaman **Feedback** dari menu sidebar.
2. Pilih **kategori feedback**: Komplain, Pertanyaan, Saran, atau Lainnya.
3. Isi **Subjek** (ringkasan masalah atau saran).
4. Isi **Pesan** (penjelasan lengkap).
5. Klik **"Kirim Feedback"**.
6. Admin akan melihat dan merespon feedback kamu. Kamu bisa melihat riwayat dan balasan admin di halaman yang sama.

---

## Tips Umum
- **Data otomatis ter-update**: Setelah upload file atau membuat jurnal, dashboard dan laporan akan otomatis ter-update.
- **Chatbot bukan pengganti konsultan**: Jawaban chatbot bersifat membantu untuk pemahaman, bukan keputusan resmi perpajakan. Untuk keputusan resmi, tetap verifikasi ke pajak.go.id atau konsultan pajak/akuntan bersertifikat.
- **Simpan draft SPT**: Sebelum mengisi SPT resmi, gunakan fitur draft untuk berlatih dan memastikan data sudah benar.
- **Gunakan keyboard shortcut**: Finora mendukung aksesibilitas keyboard untuk navigasi yang lebih cepat.
