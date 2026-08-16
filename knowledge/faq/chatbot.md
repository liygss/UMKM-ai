# FAQ: Chatbot Aplikasi Ini

## Q: Apakah chatbot ini bisa menjawab semua pertanyaan pajak/akuntansi?
Chatbot ini menjawab **berdasarkan dokumen** yang ada di basis
pengetahuan (folder `knowledge/`) dan data transaksimu sendiri — bukan
dari "ingatan bebas" model AI. Kalau suatu topik tidak ada dokumennya,
chatbot akan bilang terus terang informasinya tidak tersedia, bukan
mengarang jawaban.

## Q: Kenapa chatbot kadang bilang "tidak menemukan informasi"?
Karena sistem RAG (Retrieval-Augmented Generation) yang dipakai memang
dirancang untuk **tidak menebak** kalau tidak ada dokumen relevan yang
ditemukan lewat pencarian — ini fitur keamanan supaya chatbot tidak
memberi informasi pajak/akuntansi yang salah/mengarang.

## Q: Bisakah chatbot menjawab pertanyaan soal data usaha saya sendiri?
Ya. Chatbot bisa mengambil konteks dari data transaksi yang sudah kamu
upload/input (lewat pipeline ingestion yang mengubah data jadi dokumen
yang bisa dicari), digabung dengan pengetahuan umum akuntansi/pajak dari
`knowledge/`.

## Q: Apakah percakapan dengan chatbot tersimpan?
Ya, disimpan per sesi (`session_id`) supaya chatbot "ingat" konteks
percakapan sebelumnya dalam sesi yang sama — tapi hanya beberapa pesan
terakhir yang dibawa sebagai konteks untuk menjaga performa.

## Q: Apakah jawaban chatbot bisa dijadikan dasar keputusan pajak resmi?
**Tidak sepenuhnya.** Chatbot ini adalah alat bantu untuk memahami
konsep dan melihat data usahamu lebih cepat — untuk keputusan resmi
(pelaporan SPT, sengketa pajak, dll), tetap perlu verifikasi ke
konsultan pajak/akuntan bersertifikat atau sumber resmi DJP.

## Q: Bagaimana cara chatbot menentukan sumber mana yang dipakai untuk menjawab?
Sistem mencari dokumen paling relevan secara semantik (vector search) ke
seluruh `knowledge/`, lalu menyaring ulang (rerank) hasil pencarian
tersebut, dan menampilkannya sebagai `sources` di jawaban supaya kamu
bisa lihat sendiri dokumen mana yang jadi rujukan.
