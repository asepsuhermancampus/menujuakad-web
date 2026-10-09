export type AuthMode =
  "login" | "register" | "forgot-password" | "reset-password" | "verify-email" | "conflict";
export const authCopy: Record<AuthMode, readonly [string, string, string]> = {
  login: [
    "Simulasi Masuk Akun",
    "Form ini hanya simulasi. Gunakan halaman /login untuk masuk dengan akun uji yang disediakan.",
    "Tinjau form masuk",
  ],
  register: [
    "Simulasi Pendaftaran",
    "Pendaftaran publik belum tersedia. Form contoh ini tidak membuat akun.",
    "Tinjau pendaftaran",
  ],
  "forgot-password": [
    "Pemulihan Kata Sandi",
    "Pemulihan belum tersedia. Masukkan email contoh untuk meninjau simulasi ini.",
    "Tinjau permintaan pemulihan",
  ],
  "reset-password": [
    "Atur Kata Sandi Baru",
    "Form ini tidak mengubah kata sandi akun. Gunakan kata sandi contoh untuk simulasi.",
    "Tinjau kata sandi baru",
  ],
  "verify-email": [
    "Pratinjau Verifikasi Email",
    "Simulasi ini tidak mengirim email. Verifikasi email belum tersedia untuk akun uji.",
    "Tinjau pengiriman ulang",
  ],
  conflict: [
    "Akun Ditemukan dengan Metode Berbeda",
    "Contoh konflik akun yang menggunakan metode masuk berbeda.",
    "Tinjau metode sebelumnya",
  ],
};
