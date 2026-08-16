# Debit dan Kredit

## Konsep Dasar

Debit dan kredit **bukan** berarti "tambah" dan "kurang" secara universal
— artinya tergantung kategori akunnya. Ini yang paling sering bikin
bingung pemula.

## Aturan Saldo Normal

| Kategori Akun | Saldo Normal | Debit Berarti | Kredit Berarti |
|---|---|---|---|
| Aset | Debit | Bertambah | Berkurang |
| Beban | Debit | Bertambah | Berkurang |
| Liabilitas | Kredit | Berkurang | Bertambah |
| Modal | Kredit | Berkurang | Bertambah |
| Pendapatan | Kredit | Berkurang | Bertambah |

Cara gampang mengingat: **ASET dan BEBAN "senang" di-debit** (debit
menambah saldonya), sisanya (**Liabilitas, Modal, Pendapatan**) **"senang"
di-kredit**.

## Aturan Emas Double-Entry

Setiap transaksi harus dicatat minimal di **dua akun**, dan:
```
TOTAL DEBIT = TOTAL KREDIT
```
di setiap jurnal, tanpa kecuali. Kalau tidak sama, jurnalnya pasti salah
(lihat validasi otomatis di `06_jurnal_umum.md`).

## Contoh Penerapan

**Transaksi**: Terima pembayaran tunai dari penjualan Rp1.000.000

- Kas (Aset) bertambah → **Debit** Rp1.000.000
- Pendapatan Penjualan (Pendapatan) bertambah → **Kredit** Rp1.000.000

**Transaksi**: Bayar utang usaha Rp500.000 tunai

- Utang Usaha (Liabilitas) berkurang → **Debit** Rp500.000
- Kas (Aset) berkurang → **Kredit** Rp500.000

## Kesalahan Umum Pemula

1. Menganggap debit selalu "uang masuk" — salah, tergantung akunnya.
2. Lupa bahwa mengurangi Liabilitas/Modal/Pendapatan dicatat di **debit**,
   bukan kredit.
3. Hanya mencatat satu sisi transaksi (tidak berpasangan) — ini akan
   langsung ditolak sistem karena jurnal tidak balance.
