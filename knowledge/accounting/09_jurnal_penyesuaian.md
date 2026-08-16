# Jurnal Penyesuaian (Adjusting Entries)

## Kenapa Perlu Penyesuaian?

Di akhir periode, ada beberapa hal yang **sudah terjadi secara ekonomi**
tapi **belum tercatat** lewat transaksi harian biasa. Kalau tidak
disesuaikan, Laporan Laba Rugi dan Laporan Posisi Keuangan akan salah
saji (tidak mencerminkan kondisi sebenarnya).

## Empat Jenis Penyesuaian yang Paling Umum di UMKM

### 1. Perlengkapan yang Terpakai
Perlengkapan (alat tulis, kemasan, dll) dicatat sebagai Aset saat dibeli,
tapi seiring waktu terpakai habis dan menjadi Beban.
```
(D) Beban Perlengkapan     xxx
    (K) Perlengkapan           xxx
```

### 2. Penyusutan Aset Tetap
Aset tetap (peralatan, kendaraan) kehilangan nilai seiring waktu
pemakaian. Lihat detail perhitungan di `23_penyusutan.md`.
```
(D) Beban Penyusutan              xxx
    (K) Akumulasi Penyusutan          xxx
```

### 3. Beban Dibayar di Muka yang Sudah Jadi Beban
Contoh: sewa toko dibayar untuk 1 tahun sekaligus. Setiap bulan, porsi
yang "sudah terpakai" dipindah dari Aset ke Beban.
```
(D) Beban Sewa                    xxx
    (K) Sewa Dibayar di Muka           xxx
```

### 4. Pendapatan Diterima di Muka yang Sudah Jadi Pendapatan
Contoh: terima uang muka jasa yang baru sebagian dikerjakan.
```
(D) Pendapatan Diterima di Muka   xxx
    (K) Pendapatan                    xxx
```

## Kapan Dicatat?

Biasanya di **akhir periode pelaporan** (akhir bulan/akhir tahun),
sebelum menyusun laporan keuangan periode tersebut — bukan di tengah
periode berjalan.

## Dampak Kalau Dilewatkan

- Laba bisa **overstated** (kelihatan lebih untung dari sebenarnya) kalau
  beban yang seharusnya diakui belum dicatat.
- Aset bisa **overstated** kalau perlengkapan/aset tetap yang sudah
  "termakan" nilainya belum disesuaikan.

Di aplikasi ini, jurnal penyesuaian dicatat dengan cara yang sama seperti
jurnal umum biasa, hanya ditandai `jenis: PENYESUAIAN` supaya bisa
dibedakan asal-usulnya kalau perlu ditelusuri, dan tersedia endpoint
khusus untuk dua template paling umum: perlengkapan terpakai & penyusutan.
