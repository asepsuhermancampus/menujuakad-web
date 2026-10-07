export type AuthMode =
  "login" | "register" | "forgot-password" | "reset-password" | "verify-email" | "conflict";
export const authCopy: Record<AuthMode, readonly [string, string, string]> = {
  login: [
    "Selamat Datang Kembali",
    "Masuk untuk melanjutkan cerita hari bahagia kalian.",
    "Tinjau form masuk",
  ],
  register: [
    "Mulai Merancang Hari Bahagia",
    "Satu undangan yang personal untuk satu cerita istimewa.",
    "Tinjau pendaftaran",
  ],
  "forgot-password": [
    "Pemulihan Kata Sandi",
    "Masukkan email contoh untuk meninjau form pemulihan.",
    "Tinjau permintaan pemulihan",
  ],
  "reset-password": [
    "Atur Kata Sandi Baru",
    "Gunakan kata sandi contoh saat meninjau formulir ini.",
    "Tinjau kata sandi baru",
  ],
  "verify-email": [
    "Periksa Kotak Masuk Email Anda",
    "Verifikasi email diperlukan sebelum menggunakan akun.",
    "Tinjau pengiriman ulang",
  ],
  conflict: [
    "Akun Ditemukan dengan Metode Berbeda",
    "Contoh konflik akun yang menggunakan metode masuk berbeda.",
    "Tinjau metode sebelumnya",
  ],
};
