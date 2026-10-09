const messages: Record<string, string> = {
  google_failed: "Google belum dapat dikonfirmasi. Silakan coba lagi.",
  google_conflict: "Masuk dengan metode yang biasa digunakan, lalu hubungkan Google di pengaturan.",
  google_unavailable: "Google belum tersedia.",
  session_required: "Masuk kembali untuk melanjutkan.",
  reauth_required: "Konfirmasi identitas sebelum menghubungkan Google.",
  rate_limited: "Terlalu banyak percobaan. Coba lagi nanti.",
};
export function OAuthFeedback({ code }: { code?: string }) {
  const message = code ? messages[code.toLowerCase()] : undefined;
  return message ? (
    <p role="alert" className="local-message">
      {message}
    </p>
  ) : null;
}
