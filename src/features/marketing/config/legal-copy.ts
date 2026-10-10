/*
 * Naskah dokumen hukum mengikuti struktur PUB-10/11 (Horizon Modern Style):
 * enam bagian bernomor dengan daftar isi, ringkasan, dan sub-poin.
 *
 * Klaim pada desain sumber (PT Menuju Akad Nusantara, PCI-DSS Level 1,
 * TLS 1.3 + AES-256, "zero-monetization", versi v2.4-ID) BELUM resmi.
 * Naskah di bawah menjelaskan status pratinjau secara jujur dan TIDAK boleh
 * diganti dengan klaim hukum yang belum ditetapkan.
 */

export type LegalSection = Readonly<{
  title: string;
  body: string;
  points?: readonly string[];
}>;

export const terms: readonly LegalSection[] = [
  {
    title: "Ringkasan & Definisi Layanan",
    body: "Dokumen ini menjelaskan ketentuan penggunaan pratinjau Menuju Akad. Nama badan usaha, dasar kontraktual, dan perjanjian komersial belum ditetapkan; naskah final akan diterbitkan sebelum layanan dibuka.",
    points: [
      "Pengguna terdaftar — calon mempelai atau perwakilan sah yang mengelola undangan digital.",
      "Penerima undangan (tamu) — pihak yang menerima tautan untuk memberi konfirmasi kehadiran dan ucapan.",
      "Pratinjau — versi uji yang menampilkan data contoh tanpa transaksi atau penerbitan undangan.",
    ],
  },
  {
    title: "Perlindungan Data Tamu & Kontak",
    body: "Rancangan kebijakan menempatkan daftar kontak dan data tamu sebagai data yang tidak diperjualbelikan. Implementasi teknisnya belum diverifikasi pada lingkungan produksi.",
    points: [
      "Nomor kontak tamu hanya untuk pengiriman undangan atas perintah pasangan; tidak untuk iklan pihak ketiga.",
      "Data RSVP dan buku tamu direncanakan tersimpan terpisah dan dapat diekspor atau dihapus pemilik undangan.",
      "Pengamanan saluran dan penyimpanan akan ditetapkan bersama kebijakan final; jangan menganggap jaminan enkripsi sudah berlaku.",
    ],
  },
  {
    title: "Keamanan Pembayaran & Transaksi",
    body: "Pembayaran komersial belum aktif. Harga dan paket pada pratinjau adalah ilustrasi, dan QRIS statis hanya tersedia untuk pengujian setelah login akun uji.",
    points: [
      "Persetujuan pengujian (TEST) bukan status pembayaran (PAID) dan tidak memberi hak paket atau penerbitan.",
      "Integrasi penyedia pembayaran belum aktif; tidak ada dana yang diproses melalui pratinjau ini.",
      "Standar kepatuhan pembayaran akan ditetapkan bersama penyedia sebelum transaksi dibuka.",
    ],
  },
  {
    title: "Hak Cipta & Kepemilikan Konten",
    body: "Materi pada pratinjau memakai aset contoh dan data sintetis. Ketentuan lisensi karya pengguna belum ditetapkan.",
    points: [
      "Pengguna bertanggung jawab memastikan foto, musik, dan materi yang diunggah tidak melanggar hak pihak lain.",
      "Ketentuan lisensi desain, template, dan karya pasangan akan dicantumkan pada dokumen final.",
    ],
  },
  {
    title: "Masa Aktif & Penyimpanan Media",
    body: "Kebijakan masa aktif undangan, penyimpanan media, dan retensi data belum ditetapkan. Undangan pada pratinjau tidak diterbitkan sehingga tidak ada masa aktif yang berjalan.",
    points: [
      "Durasi paket dan opsi perpanjangan masih dalam perencanaan.",
      "Kebijakan penghapusan media dan ekspor data akan diumumkan bersama peluncuran layanan.",
    ],
  },
  {
    title: "Kebijakan Pembatalan & Pengembalian",
    body: "Kebijakan pembatalan, pengembalian dana, dan sengketa belum ditetapkan karena layanan komersial belum beroperasi.",
    points: [
      "Tidak ada transaksi komersial yang dapat dibatalkan atau dikembalikan pada versi pratinjau.",
      "Ketentuan final akan mengikuti peraturan perlindungan konsumen yang berlaku.",
    ],
  },
];

export const privacy: readonly LegalSection[] = [
  {
    title: "Ringkasan & Definisi Layanan",
    body: "Dokumen ini menjelaskan bagaimana pratinjau Menuju Akad menangani data selama masa pengujian. Dasar pemrosesan, retensi, dan hak pengguna akan ditetapkan pada kebijakan final.",
    points: [
      "Pengguna terdaftar — pemilik akun uji yang disediakan tim.",
      "Data pratinjau — informasi sintetis yang dipakai untuk memeriksa tampilan.",
    ],
  },
  {
    title: "Perlindungan Data Tamu & Kontak",
    body: "Data tamu pada pratinjau berasal dari fixture sintetis, bukan data orang nyata. Jangan memasukkan data tamu asli ke form simulasi.",
    points: [
      "Pratinjau tidak menyimpan respons RSVP atau daftar tamu yang Anda ketik.",
      "Rancangan kebijakan melarang penjualan atau penyewaan data kontak kepada pihak ketiga.",
    ],
  },
  {
    title: "Keamanan Transaksi & Pembayaran",
    body: "Pratinjau tidak memproses pembayaran. QRIS statis hanya untuk pengujian internal setelah login akun uji dan tidak menerima dana.",
    points: [
      "Jangan memasukkan informasi rekening atau kartu pada form simulasi mana pun.",
      "Standar keamanan pembayaran akan ditetapkan bersama penyedia resmi sebelum transaksi dibuka.",
    ],
  },
  {
    title: "Hak Cipta & Kepemilikan Konten",
    body: "Aset yang tampil pada pratinjau adalah contoh. Hak atas karya yang Anda unggah tetap milik Anda; ketentuan lisensinya akan dicantumkan pada dokumen final.",
    points: ["Jangan mengunggah materi yang bukan milik Anda atau yang melanggar hak pihak lain."],
  },
  {
    title: "Masa Aktif & Penyimpanan Data",
    body: "Perubahan pada pratinjau tidak menjadi catatan akun permanen. Draft dari workspace akun uji dapat tersimpan di server preproduction.",
    points: [
      "Data akun uji diproses untuk autentikasi pada lingkungan preproduction.",
      "Kebijakan retensi dan penghapusan data akan diumumkan sebelum layanan dibuka.",
    ],
  },
  {
    title: "Kebijakan Final & Kanal Kontak",
    body: "Dokumen ini masih draf pratinjau. Audit teknis dan retensi penyedia hosting belum selesai.",
    points: [
      "Kanal kontak resmi untuk permintaan data akan diumumkan sebelum layanan komersial aktif.",
      "Dasar pemrosesan dan hak pengguna akan mengikuti peraturan pelindungan data yang berlaku.",
    ],
  },
];
