/**
 * Panduan pengisian SPT Tahunan PPh Orang Pribadi (1770 & 1770S)
 * + contoh data untuk demo interaktif di halaman SPT.
 *
 * Id langkah disinkronkan dengan seksi pada SptPage:
 * identitas, penghasilan, kredit, harta, tanggungan, permohonan, hasil.
 */

export const GUIDE_STEPS = [
  {
    id: 'identitas',
    title: 'Identitas Wajib Pajak',
    ringkas: 'Pilih formulir yang sesuai, lalu isi identitas persis seperti di NPWP/KTP.',
    langkah: [
      { field: 'Pilih Formulir', cara: '1770S untuk karyawan (penghasilan dari 1/lebih pemberi kerja). 1770 untuk pengusaha / pekerjaan bebas.', contoh: '1770S — Karyawan' },
      { field: 'Tahun Pajak', cara: 'Tahun pajak yang dilaporkan (bukan tahun pengisian).', contoh: '2025' },
      { field: 'NPWP', cara: 'Sesuai kartu NPWP dengan format 00.000.000.0-000.000.', contoh: '01.234.567.8-901.000' },
      { field: 'Nama Wajib Pajak', cara: 'Sesuai KTP/NPWP, gunakan huruf kapital.', contoh: 'BUDI SANTOSO' },
      { field: 'Status Perkawinan', cara: 'KK (kawin, kewajiban pajak gabung), HB, PH, atau MT.', contoh: 'KK' },
      { field: 'NPWP Istri/Suami', cara: 'Wajib diisi untuk status HB/PH/MT.', contoh: '02.345.678.9-012.345' },
      { field: 'Pembetulan Ke-', cara: '0 bila lapor pertama kali; 1/2/dst untuk SPT pembetulan.', contoh: '0' },
      { field: 'Jenis Usaha / Pekerjaan Utama', cara: 'Jenis usaha (1770) atau pekerjaan utama (1770S).', contoh: 'Karyawan Swasta' },
      { field: 'KLU', cara: 'Klasifikasi Lapangan Usaha 5 digit.', contoh: '00000' },
      { field: 'No. Telepon / Faksimili', cara: 'Nomor yang dapat dihubungi.', contoh: '021-5551234' },
      { field: 'Alamat & Kelurahan/Kecamatan', cara: 'Alamat tempat tinggal lengkap.', contoh: 'Jl. Merdeka No.1 Jakarta' },
    ],
    tips: [
      'Status perkawinan menentukan PTKP (Induk angka 7) — pastikan sesuai kondisi akhir tahun pajak.',
      'Nomor urut & kode cabang NPWP harus konsisten di seluruh lampiran.',
    ],
    referensi: 'Induk 1770S / 1770 halaman 1 — bagian identitas.',
  },
  {
    id: 'penghasilan',
    title: 'Penghasilan Neto',
    ringkas: 'Masukkan semua penghasilan neto kena pajak. Penghasilan final dicatat terpisah di lampiran, bukan di induk.',
    langkah: [
      { field: 'Metode Penghitungan Usaha', untuk: '1770', cara: 'Pilih Pembukuan (laba/rugi sesungguhnya) atau Pencatatan/Norma.', contoh: 'Pembukuan' },
      { field: 'Peredaran Usaha (1a)', untuk: '1770', cara: 'Total penjualan satu tahun pajak.', contoh: '900.000.000' },
      { field: 'HPP (1b)', untuk: '1770', cara: 'Harga pokok penjualan.', contoh: '400.000.000' },
      { field: 'Biaya Usaha (1d)', untuk: '1770', cara: 'Biaya operasional yang dapat dibebankan.', contoh: '150.000.000' },
      { field: 'Penyesuaian Fiskal', untuk: '1770', cara: 'Koreksi fiskal positif/negatif bila ada (opsional).', contoh: '0' },
      { field: 'Penghasilan Pekerjaan', cara: 'Nilai dari Formulir 1721-A1/A2; isi nama + NPWP pemberi kerja dan penghasilan neto.', contoh: 'PT Maju Jaya — 200.000.000' },
      { field: 'Dalam Negeri Lainnya', cara: 'Penghasilan non-final di luar pekerjaan/usaha (bunga, sewa, royalti).', contoh: 'Sewa rumah — neto 30.000.000' },
      { field: 'Luar Negeri', cara: 'Penghasilan neto luar negeri (dasar kredit PPh 24).', contoh: '0' },
      { field: 'Zakat', cara: 'Zakat / sumbangan keagamaan wajib yang dibayar.', contoh: '5.000.000' },
      { field: 'PPh Final', cara: 'Penghasilan final (deposito, dividen, sewa) masuk Lampiran II bagian A — bukan neto induk.', contoh: 'Bunga deposito 10.000.000' },
    ],
    tips: [
      'Jangan memasukkan penghasilan final ke angka 1–3 induk; itu dicatat di Lampiran S-II bagian A.',
      'Pada 1770S, neto pekerjaan menjadi angka 1 induk secara otomatis.',
      'Siapkan bukti potong 1721-A1/A2 sebagai dasar pengisian angka 1.',
    ],
    referensi: 'Induk 1770S angka 1–6 / 1770 angka 1–7; Lampiran S-I bagian A & C.',
  },
  {
    id: 'kredit',
    title: 'Kredit Pajak',
    ringkas: 'PPh yang sudah dipotong pihak lain atau dibayar sendiri — mengurangi PPh terutang.',
    langkah: [
      { field: 'PPh Pasal 24', cara: 'Kredit pajak luar negeri (Induk 1770 angka 13 / 1770S angka 10).', contoh: '0' },
      { field: 'Daftar Pemotongan', cara: 'Tambahkan satu baris per bukti potong PPh 21/22/23/26/DTP.', contoh: 'PT Maju Jaya — PPh 21 — 14.000.000' },
      { field: 'PPh 25 Dibayar Sendiri', cara: 'Total angsuran PPh 25 yang sudah disetor (biasanya untuk pengusaha).', contoh: '30.000.000' },
      { field: 'STP PPh 25', cara: 'Hanya pokok pajak Surat Tagihan Pajak.', contoh: '0' },
    ],
    tips: [
      'Untuk karyawan, kredit PPh 21 dari 1721-A1 biasanya hampir sama dengan PPh terutang.',
      'Total daftar bukti potong akan tampil sebagai angka 12 (1770S) / 15 (1770) di induk.',
    ],
    referensi: 'Induk 1770S angka 12–15 / 1770 angka 15–18; Lampiran S-I bagian C.',
  },
  {
    id: 'harta',
    title: 'Harta & Utang',
    ringkas: 'Daftar harta dan utang per 31 Desember tahun pajak (Lampiran S-II bagian B/C atau Lampiran IV).',
    langkah: [
      { field: 'Harta', cara: 'Kode harta, nama, tahun perolehan, dan harga perolehan.', contoh: '031 Rumah — 800.000.000' },
      { field: 'Utang', cara: 'Kode, nama + alamat pemberi pinjaman, tahun, dan jumlah utang.', contoh: 'Bank ABC — 300.000.000' },
    ],
    tips: [
      'Gunakan kode harta/utang sesuai daftar resmi DJP (mis. 031 tanah/bangunan).',
      'Isi sesuai kondisi 31 Desember tahun pajak.',
    ],
    referensi: 'Lampiran S-II bagian B & C / 1770-IV.',
  },
  {
    id: 'tanggungan',
    title: 'Tanggungan',
    ringkas: 'Daftar anggota keluarga yang menjadi tanggungan — dasar perhitungan PTKP.',
    langkah: [
      { field: 'Anggota Keluarga', cara: 'Isi nama, NIK, hubungan, dan pekerjaan setiap tanggungan.', contoh: 'Anak 1 — Anak — Pelajar' },
    ],
    tips: [
      'PTKP tambahan maksimal 3 tanggungan (Rp 4,5 juta/orang).',
      'Status KK memberi tambahan Rp 4,5 juta untuk pasangan.',
    ],
    referensi: 'Induk 1770S angka 7 / 1770 angka 10; Lampiran S-II bagian D.',
  },
  {
    id: 'permohonan',
    title: 'Permohonan',
    ringkas: 'Perlakuan lebih bayar dan cara menghitung angsuran PPh 25 tahun berikutnya.',
    langkah: [
      { field: 'Permohonan Lebih Bayar', cara: 'Kosongkan bila nihil/kurang bayar; pilih kompensasi atau restitusi (SKPPKP 17C/17D) bila lebih bayar.', contoh: 'Tidak ada' },
      { field: 'Angsuran PPh 25', cara: '1/12 × angka 16 (1770) / angka 13a (1770S), atau perhitungan tersendiri.', contoh: '1/12' },
    ],
    tips: [
      'Restitusi hanya relevan bila terjadi lebih bayar (angka 19b / 16b).',
      'Kompensasi = lebih bayar diperhitungkan dengan utang pajak tahun berikutnya.',
    ],
    referensi: 'Induk 1770S angka 17–18 / 1770 angka 20–21.',
  },
  {
    id: 'hasil',
    title: 'Hasil & Cetak',
    ringkas: 'Hitung otomatis, periksa ringkasan (PTKP, PPh Pasal 17, kurang/lebih bayar), lalu simpan draft atau cetak PDF.',
    langkah: [
      { field: 'Hitung & Preview', cara: 'Jalankan perhitungan otomatis berdasarkan data yang diisi.', contoh: 'PPh kurang bayar 550.000 (PPh Pasal 29)' },
      { field: 'Periksa Ringkasan', cara: 'Bandingkan PPh terutang vs kredit pajak; untuk karyawan harus sama dengan nilai di 1721-A1.', contoh: '14.550.000 − 14.000.000 = 550.000' },
      { field: 'Simpan / Cetak', cara: 'Simpan draft untuk dilanjutkan, atau cetak ke PDF melalui browser.', contoh: 'Cetak / Simpan PDF' },
    ],
    tips: [
      'Kurang bayar (PPh Pasal 29) wajib dibayar sebelum batas pelaporan SPT (31 Maret).',
      'Dokumen ini alat bantu isian — validasi dengan konsultan pajak sebelum melapor resmi.',
    ],
    referensi: 'Hasil perhitungan seluruh formulir 1770S/1770.',
  },
]

export const CONTOH_1770S = {
  identitas: {
    npwp: '01.234.567.8-901.000', nama: 'BUDI SANTOSO', pekerjaan_utama: 'Karyawan Swasta',
    klu: '00000', no_telepon: '021-5551234', no_faks: '021-5551235', status_kawin: 'KK',
    npwp_pasangan: '', alamat: 'Jl. Merdeka No.1 Jakarta', kelurahan_kecamatan: 'Menteng/Jakarta Pusat',
    pembetulan_ke: 0, tahun_pajak: 2025, jenis_form: '1770S',
  },
  penghasilan: {
    metode: 'pembukuan',
    usaha: {
      peredaran_usaha: 0, hpp: 0, laba_rugi_bruto: 0, biaya_usaha: 0,
      penghasilan_neto_komersial: 0, penyesuaian_positif: {}, jumlah_penyesuaian_positif: 0,
      penyesuaian_negatif: {}, jumlah_penyesuaian_negatif: 0,
    },
    usaha_pencatatan: { jenis_usaha: '', norma_persen: 0, peredaran_usaha: 0 },
    pekerjaan: [{ nama_pemberi_kerja: 'PT Maju Jaya', npwp_pemberi_kerja: '03.456.789.0-123.000', penghasilan_neto: 200000000 }],
    dalam_negeri_lainnya: [],
    bukan_objek: [{ jenis: 'Warisan', jumlah: 50000000 }],
    luar_negeri: 0, zakat: 0, kompensasi_kerugian: 0, pengembalian_pph_24: 0,
    final: [{ jenis: 'Bunga deposito', dasar_pengenaan: 10000000, pph_terutang: 200000 }],
  },
  kredit_pajak: {
    dalam_negeri: 0,
    pemotongan: [{ nama: 'PT Maju Jaya', npwp: '03.456.789.0-123.000', no_bukti: '21-12345', tanggal: '2026-01-15', jenis: '21', jumlah: 14000000 }],
    pph_dibayar_sendiri_25: 0, stp_pph_25: 0,
  },
  harta: [
    { kode: '031', nama: 'Rumah', tahun_perolehan: 2018, harga_perolehan: 800000000, keterangan: 'Tempat tinggal' },
    { kode: '017', nama: 'Mobil', tahun_perolehan: 2020, harga_perolehan: 200000000, keterangan: 'Kendaraan' },
  ],
  utang: [{ kode: '211', nama_pemberi: 'Bank ABC', alamat_pemberi: 'Jakarta', tahun_peminjaman: 2019, jumlah: 300000000 }],
  tanggungan: [{ nama: 'Anak 1', nik: '3171010101010001', hubungan: 'Anak', pekerjaan: 'Pelajar' }],
  permohonan: { restitusi: '', angsuran_25: '1_12' },
}

export const CONTOH_1770 = {
  identitas: {
    npwp: '01.234.567.8-901.000', nama: 'BUDI SANTOSO', jenis_usaha: 'Toko Sembako',
    pekerjaan_utama: 'Wiraswasta', klu: '47911', no_telepon: '021-5551234', no_faks: '021-5551235',
    status_kawin: 'KK', npwp_pasangan: '02.345.678.9-012.345', alamat: 'Jl. Merdeka No.1 Jakarta',
    kelurahan_kecamatan: 'Menteng/Jakarta Pusat', pembetulan_ke: 0, tahun_pajak: 2025, jenis_form: '1770',
  },
  penghasilan: {
    metode: 'pembukuan',
    usaha: { peredaran_usaha: 900000000, hpp: 400000000, laba_rugi_bruto: 0, biaya_usaha: 150000000, penghasilan_neto_komersial: 0 },
    usaha_pencatatan: { jenis_usaha: '', norma_persen: 0, peredaran_usaha: 0 },
    pekerjaan: [],
    dalam_negeri_lainnya: [{ jenis: 'Sewa rumah', penghasilan_bruto: 36000000, penghasilan_neto: 30000000 }],
    bukan_objek: [{ jenis: 'Warisan', jumlah: 50000000 }],
    luar_negeri: 0, zakat: 5000000, kompensasi_kerugian: 0, pengembalian_pph_24: 0,
    final: [{ jenis: 'Bunga deposito', dasar_pengenaan: 10000000, pph_terutang: 200000 }],
  },
  kredit_pajak: {
    dalam_negeri: 0, pemotongan: [], pph_dibayar_sendiri_25: 30000000, stp_pph_25: 0,
  },
  harta: [
    { kode: '031', nama: 'Rumah', tahun_perolehan: 2018, harga_perolehan: 800000000, keterangan: 'Tempat tinggal' },
    { kode: '017', nama: 'Mobil', tahun_perolehan: 2020, harga_perolehan: 200000000, keterangan: 'Kendaraan' },
  ],
  utang: [{ kode: '211', nama_pemberi: 'Bank ABC', alamat_pemberi: 'Jakarta', tahun_peminjaman: 2019, jumlah: 300000000 }],
  tanggungan: [
    { nama: 'Anak 1', nik: '3171010101010001', hubungan: 'Anak', pekerjaan: 'Pelajar' },
    { nama: 'Anak 2', nik: '3171010101010002', hubungan: 'Anak', pekerjaan: 'Pelajar' },
  ],
  permohonan: { restitusi: '', angsuran_25: '1_12' },
}

export function contohData(formType) {
  return formType === '1770S' ? CONTOH_1770S : CONTOH_1770
}
