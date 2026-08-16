# Contoh Transaksi Umum UMKM dan Jurnalnya

Kumpulan contoh jurnal untuk transaksi yang paling sering terjadi di
usaha kecil-menengah. Kode akun mengacu ke `datasets/coa.csv`.

## 1. Setoran Modal Awal Pemilik (tunai Rp10.000.000)
```
(D) Kas (1-1000)                10.000.000
    (K) Modal Pemilik (3-1000)       10.000.000
```

## 2. Beli Perlengkapan Tunai (Rp1.000.000)
```
(D) Perlengkapan (1-1400)        1.000.000
    (K) Kas (1-1000)                   1.000.000
```

## 3. Beli Barang Dagang Secara Kredit (Rp5.000.000)
```
(D) Persediaan Barang Dagang (1-1300)  5.000.000
    (K) Utang Usaha (2-1000)                 5.000.000
```

## 4. Penjualan Tunai (harga jual Rp2.000.000, HPP Rp1.200.000)
```
(D) Kas (1-1000)                 2.000.000
    (K) Pendapatan Penjualan (4-1000)   2.000.000

(D) Harga Pokok Penjualan (5-1000)  1.200.000
    (K) Persediaan Barang Dagang (1-1300)  1.200.000
```

## 5. Penjualan Kredit (belum dibayar pelanggan, Rp1.500.000)
```
(D) Piutang Usaha (1-1200)        1.500.000
    (K) Pendapatan Penjualan (4-1000)   1.500.000
```

## 6. Terima Pelunasan Piutang dari Pelanggan (Rp1.500.000)
```
(D) Kas (1-1000)                  1.500.000
    (K) Piutang Usaha (1-1200)          1.500.000
```

## 7. Bayar Gaji Karyawan (Rp3.000.000)
```
(D) Beban Gaji (5-2000)           3.000.000
    (K) Kas (1-1000)                    3.000.000
```

## 8. Bayar Sewa Toko Bulanan (Rp800.000)
```
(D) Beban Sewa (5-2100)             800.000
    (K) Kas (1-1000)                      800.000
```

## 9. Bayar Utang Usaha ke Supplier (Rp2.000.000)
```
(D) Utang Usaha (2-1000)          2.000.000
    (K) Kas (1-1000)                    2.000.000
```

## 10. Pemilik Ambil Uang Usaha untuk Pribadi/Prive (Rp500.000)
```
(D) Prive (3-2000)                  500.000
    (K) Kas (1-1000)                      500.000
```

## 11. Terima Pinjaman Bank Jangka Pendek (Rp10.000.000)
```
(D) Kas (1-1000)                 10.000.000
    (K) Utang Bank Jangka Pendek (2-1100)   10.000.000
```

## 12. Beli Peralatan Tunai (Rp8.000.000)
```
(D) Peralatan (1-2000)            8.000.000
    (K) Kas (1-1000)                    8.000.000
```

Lihat juga `datasets/contoh_transaksi.csv` dan `datasets/contoh_jurnal.csv`
untuk versi tabular yang bisa langsung dipakai sebagai data uji/contoh.
