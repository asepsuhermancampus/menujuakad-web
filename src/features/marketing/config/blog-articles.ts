/*
 * Whitelist artikel blog contoh. Data sintetis untuk peninjauan tata letak;
 * belum ada CMS, penulis nyata, atau penerbitan konten final.
 */
export type BlogArticle = Readonly<{
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  readLabel: string;
  sections: readonly Readonly<{ heading: string; body: string }>[];
  points?: readonly string[];
  closing: string;
}>;

export const blogArticles: readonly BlogArticle[] = [
  {
    slug: "panduan-menyusun-rundown-akad",
    category: "Perencanaan",
    title: "Menyusun Rundown Akad yang Tenang",
    excerpt:
      "Urutan acara yang rapi membantu keluarga dan tamu mengikuti momen tanpa terburu-buru.",
    readLabel: "6 menit baca",
    sections: [
      {
        heading: "Mengapa rundown membantu",
        body: "Rundown bukan sekadar daftar jam. Ia membantu keluarga besar, vendor, dan tamu memahami kapan setiap momen berlangsung, sehingga tidak ada yang perlu terburu-buru.",
      },
      {
        heading: "Contoh kerangka sederhana",
        body: "Persiapan dan registrasi, prosesi akad, sesi foto keluarga, lalu resepsi. Setiap bagian diberi satu tujuan jelas agar tamu tidak merasa menunggu tanpa arah.",
      },
    ],
    points: [
      "Mulai dari momen paling sakral, lalu beri ruang jeda sebelum resepsi.",
      "Sisakan waktu cadangan 15 menit untuk setiap blok utama.",
      "Tulis nama penanggung jawab untuk tiap segmen, bukan hanya jamnya.",
    ],
    closing:
      "Artikel ini pratinjau tata letak editorial. Saran operasional, tautan rujukan, dan penulis nyata belum tersedia.",
  },
  {
    slug: "memilih-palet-undangan",
    category: "Desain",
    title: "Memilih Palet Warna untuk Undangan Digital",
    excerpt: "Ivory, beige, dan emas bekerja baik karena memberi ruang pada foto dan tipografi.",
    readLabel: "5 menit baca",
    sections: [
      {
        heading: "Mulai dari suasana, bukan warna",
        body: "Tentukan suasana yang ingin dihadirkan lebih dahulu: tenang, hangat, atau formal. Palet mengikuti suasana, bukan sebaliknya.",
      },
      {
        heading: "Batasi jumlah warna",
        body: "Dua warna netral dan satu aksen biasanya cukup. Terlalu banyak warna membuat hierarki informasi sulit dibaca di layar kecil.",
      },
    ],
    points: [
      "Gunakan warna aksen hanya untuk hal penting, seperti tombol utama.",
      "Pastikan kontras teks kecil tetap terbaca di latar terang.",
      "Uji palet pada layar ponsel sebelum memutuskan.",
    ],
    closing:
      "Panduan ini ilustrasi editorial untuk peninjauan tata letak; bukan konsultasi desain final.",
  },
  {
    slug: "etika-mengundang-tamu-digital",
    category: "Etiket",
    title: "Etika Mengundang Tamu Lewat Undangan Digital",
    excerpt: "Kapan sebaiknya mengirim tautan, dan bagaimana menyapa tamu dengan hormat.",
    readLabel: "4 menit baca",
    sections: [
      {
        heading: "Waktu pengiriman",
        body: "Kirim undangan setelah tanggal dan lokasi pasti, umumnya empat sampai enam minggu sebelum acara. Pengingat singkat dapat dikirim mendekati hari acara.",
      },
      {
        heading: "Cara menyapa",
        body: "Gunakan nama yang benar dan hindari pesan massal tanpa sapaan. Satu pesan personal lebih dihargai daripada banyak pesan seragam.",
      },
    ],
    points: [
      "Sertakan tautan RSVP yang jelas dan batas waktunya.",
      "Hindari mengirim tautan di grup tanpa menyebut nama tamu.",
      "Sediakan satu narahubung untuk pertanyaan.",
    ],
    closing:
      "Artikel ini contoh editorial. Kebijakan komunikasi final mengikuti keputusan penyelenggara.",
  },
];

const bySlug = new Map(blogArticles.map((article) => [article.slug, article]));

export function getBlogArticle(slug: string): BlogArticle | undefined {
  if (!/^[a-z0-9-]{3,80}$/.test(slug)) return undefined;
  return bySlug.get(slug);
}
