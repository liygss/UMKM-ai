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
    ringkas: 'Tuliskan identitas persis seperti di NPWP dan KTP. Pertama, pilih dulu formulir yang paling sesuai dengan pekerjaan Anda.',
    langkah: [
      { field: 'Pilih Formulir', cara: 'Pakai 1770S jika Anda karyawan (gaji dari satu atau lebih pemberi kerja). Pakai 1770 jika Anda pengusaha atau punya usaha/pekerjaan bebas.', contoh: '1770S — Karyawan' },
      { field: 'Tahun Pajak', cara: 'Tahun ketika penghasilan diterima — bukan tahun Anda mengisi SPT.', contoh: '2025' },
      { field: 'NPWP', cara: 'Salin nomor dari kartu NPWP Anda, lengkap dengan tanda titik dan strip.', contoh: '01.234.567.8-901.000' },
      { field: 'Nama Wajib Pajak', cara: 'Sama persis dengan KTP/NPWP, gunakan huruf kapital.', contoh: 'BUDI SANTOSO' },
      { field: 'Status Perkawinan', cara: 'KK = kawin dengan kewajiban pajak digabung; HB = harta terpisah; PH = pisah harta; MT = menikah tapi cerai/mati. Pilih yang sesuai akhir tahun pajak.', contoh: 'KK' },
      { field: 'NPWP Istri/Suami', cara: 'Baru diisi jika status Anda HB, PH, atau MT.', contoh: '02.345.678.9-012.345' },
      { field: 'Pembetulan Ke-', cara: 'Tulis 0 untuk laporan pertama kali. Gunakan 1, 2, dst. jika ini SPT perbaikan (pembetulan).', contoh: '0' },
      { field: 'Jenis Usaha / Pekerjaan Utama', cara: 'Jenis usaha Anda (form 1770) atau nama pekerjaan utama Anda (form 1770S).', contoh: 'Karyawan Swasta' },
      { field: 'KLU', cara: 'Kode 5 digit klasifikasi bidang usaha. Tidak perlu hafal — cari daftar resmi DJP.', contoh: '47911' },
      { field: 'No. Telepon / Faksimili', cara: 'Nomor yang bisa dihubungi petugas pajak bila perlu.', contoh: '021-5551234' },
      { field: 'Alamat & Kelurahan/Kecamatan', cara: 'Alamat tempat tinggal Anda saat ini, ditulis lengkap.', contoh: 'Jl. Merdeka No.1 Menteng/Jakarta Pusat' },
    ],
    tips: [
      'Status perkawinan menentukan jumlah penghasilan bebas pajak (PTKP) — pastikan sesuai kondisi akhir tahun pajak, karena berpengaruh pada hasil akhir.',
      'Periksa kembali nomor NPWP Anda, karena nomor yang salah bisa menolak pelaporan.',
    ],
    referensi: 'Induk 1770S / 1770 halaman 1 — bagian identitas.',
  },
  {
    id: 'penghasilan',
    title: 'Penghasilan Kena Pajak',
    ringkas: 'Isi semua penghasilan kena pajak Anda. Untuk pengusaha, angka ini biasanya sudah dikurangi biaya usaha (jadi penghasilan bersih/neto).',
    langkah: [
      { field: 'Metode Penghitungan Usaha', untuk: '1770', cara: 'Pilih Pembukuan jika Anda mencatat laba/rugi sungguhan, atau Pencatatan/Norma jika memakai persentase penghitungan yang disederhanakan.', contoh: 'Pembukuan' },
      { field: 'Peredaran Usaha (1a)', untuk: '1770', cara: 'Total penjualan selama satu tahun pajak.', contoh: '900.000.000' },
      { field: 'HPP (1b)', untuk: '1770', cara: 'Harga pokok penjualan — biaya langsung untuk barang/jasa yang Anda jual.', contoh: '400.000.000' },
      { field: 'Biaya Usaha (1d)', untuk: '1770', cara: 'Biaya operasional yang boleh dikurangkan, misal gaji pegawai, sewa, listrik.', contoh: '150.000.000' },
      { field: 'Penyesuaian Fiskal', untuk: '1770', cara: 'Penyesuaian yang wajib dilakukan karena aturan pajak berbeda dengan catatan akuntansi. Umumnya opsional — bisa diisi 0 dulu.', contoh: '0' },
      { field: 'Penghasilan Pekerjaan', cara: 'Ambil angka dari bukti potong 1721-A1/A2 (yang diberikan pemberi kerja). Isi nama pemberi kerja dan jumlah penghasilannya.', contoh: 'PT Maju Jaya — 200.000.000' },
      { field: 'Dalam Negeri Lainnya', cara: 'Penghasilan lain di luar gaji/usaha, misalnya bunga, sewa, atau royalti (yang belum dipotong final).', contoh: 'Sewa rumah — neto 30.000.000' },
      { field: 'Luar Negeri', cara: 'Penghasilan bersih dari luar negeri. Diisi bila Anda berpenghasilan dari luar Indonesia.', contoh: '0' },
      { field: 'Zakat', cara: 'Zakat atau sumbangan keagamaan yang Anda bayar dan tercatat resmi.', contoh: '5.000.000' },
      { field: 'PPh Final', cara: 'Penghasilan yang dikenakan pajak final (deposito, dividen, sewa) dicatat terpisah di lampiran — tidak dimasukkan ke sini.', contoh: 'Bunga deposito 10.000.000' },
    ],
    tips: [
      'Jangan campur penghasilan yang kena pajak final (bunga deposito, dividen) ke angka induk — tempatnya di lampiran khusus.',
      'Untuk 1770S, penghasilan dari pekerjaan otomatis menjadi angka utama (angka 1).',
      'Siapkan bukti potong 1721-A1/A2 sebagai dasar pengisian bagian ini.',
    ],
    referensi: 'Induk 1770S angka 1–6 / 1770 angka 1–7; Lampiran S-I bagian A & C.',
  },
  {
    id: 'kredit',
    title: 'Kredit Pajak',
    ringkas: 'Kredit pajak adalah pajak yang SUDAH dibayar atau dipotong pihak lain. Ini mengurangi total pajak yang harus Anda bayar.',
    langkah: [
      { field: 'PPh Pasal 24', cara: 'Pajak yang sudah dibayar di luar negeri yang boleh dikreditkan.', contoh: '0' },
      { field: 'Daftar Pemotongan', cara: 'Tambah satu baris untuk setiap bukti potong yang Anda terima (PPh 21/22/23/26). Ikuti angka yang tercantum di bukti potong.', contoh: 'PT Maju Jaya — PPh 21 — 14.000.000' },
      { field: 'PPh 25 Dibayar Sendiri', cara: 'Jumlah angsuran PPh 25 yang sudah Anda setor sendiri (umumnya untuk yang berusaha).', contoh: '30.000.000' },
      { field: 'STP PPh 25', cara: 'Hanya pokok pajak dari Surat Tagihan Pajak PPh 25, tanpa denda/bunga.', contoh: '0' },
    ],
    tips: [
      'Untuk karyawan, PPh 21 yang dipotong pihak kantor biasanya hampir sama dengan total pajak terutang — jadi hasilnya cenderung nihil atau lebih bayar kecil.',
      'Total bukti potong akan tampil sebagai angka kredit pajak di ringkasan akhir.',
    ],
    referensi: 'Induk 1770S angka 12–15 / 1770 angka 15–18; Lampiran S-I bagian C.',
  },
  {
    id: 'harta',
    title: 'Harta & Utang',
    ringkas: 'Catat seluruh harta dan utang Anda per 31 Desember tahun pajak.',
    langkah: [
      { field: 'Harta', cara: 'Tulis kode harta, nama, tahun perolehan, dan harga perolehannya. Contoh umum: rumah, tanah, kendaraan, tabungan.', contoh: '031 Rumah — 800.000.000' },
      { field: 'Utang', cara: 'Tulis kode, nama dan alamat pemberi pinjaman, tahun, serta jumlah utang yang masih tersisa.', contoh: 'Bank ABC — 300.000.000' },
    ],
    tips: [
      'Gunakan kode harta/utang dari daftar resmi DJP (misalnya 031 = tanah dan bangunan).',
      'Hitung sesuai kondisi 31 Desember tahun pajak — bukan saat mengisi.',
    ],
    referensi: 'Lampiran S-II bagian B & C / 1770-IV.',
  },
  {
    id: 'tanggungan',
    title: 'Tanggungan',
    ringkas: 'Daftar anggota keluarga yang menjadi tanggungan Anda. Ini menambah batas penghasilan bebas pajak (PTKP), sehingga bisa mengecilkan pajak.',
    langkah: [
      { field: 'Anggota Keluarga', cara: 'Isi nama, NIK, hubungan, dan pekerjaan setiap tanggungan (misalnya anak yang masih sekolah).', contoh: 'Anak 1 — Anak — Pelajar' },
    ],
    tips: [
      'Tambahan PTKP hanya untuk maksimal 3 tanggungan, sekitar Rp 4,5 juta per orang.',
      'Status kawin (KK) juga memberi tambahan sekitar Rp 4,5 juta untuk pasangan.',
    ],
    referensi: 'Induk 1770S angka 7 / 1770 angka 10; Lampiran S-II bagian D.',
  },
  {
    id: 'permohonan',
    title: 'Permohonan',
    ringkas: 'Pilih cara menangani pajak lebih bayar (kalau ada) dan tentukan besar angsuran PPh 25 tahun berikutnya.',
    langkah: [
      { field: 'Permohonan Lebih Bayar', cara: 'Biarkan kosong jika hasilnya nihil atau kurang bayar. Jika lebih bayar, pilih kompensasi (dipotong dari pajak tahun depan) atau restitusi (uang dikembalikan).', contoh: 'Tidak ada' },
      { field: 'Angsuran PPh 25', cara: 'Umumnya 1/12 dari pajak terutang — dihitung otomatis oleh sistem berdasarkan data Anda.', contoh: '1/12' },
    ],
    tips: [
      'Restitusi hanya dipakai bila terjadi lebih bayar pada hasil akhir.',
      'Kompensasi artinya jumlah lebih bayar diperhitungkan sebagai pembayar pajak tahun berikutnya.',
    ],
    referensi: 'Induk 1770S angka 17–18 / 1770 angka 20–21.',
  },
  {
    id: 'hasil',
    title: 'Hasil & Cetak',
    ringkas: 'Hitung otomatis, periksa ringkasannya (PTKP, PPh Pasal 17, kurang/lebih bayar), lalu simpan draft atau cetak PDF.',
    langkah: [
      { field: 'Hitung & Preview', cara: 'Jalankan perhitungan otomatis berdasarkan data yang sudah diisi.', contoh: 'PPh kurang bayar 550.000 (PPh Pasal 29)' },
      { field: 'Periksa Ringkasan', cara: 'Bandingkan PPh terutang dengan kredit pajak. Untuk karyawan, angkanya harus cocok dengan bukti potong 1721-A1.', contoh: '14.550.000 − 14.000.000 = 550.000' },
      { field: 'Simpan / Cetak', cara: 'Simpan draft untuk dilanjutkan nanti, atau cetak ke PDF lewat browser untuk arsip.', contoh: 'Cetak / Simpan PDF' },
    ],
    tips: [
      'Jika ada kurang bayar (PPh Pasal 29), bayar dulu sebelum batas pelaporan SPT (31 Maret).',
      'Ini hanya alat bantu isian — sebaiknya konfirmasi dengan konsultan pajak sebelum melapor resmi.',
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
