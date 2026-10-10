/**
 * Utilitas presentasi modul perencanaan. Fungsi murni tanpa akses server,
 * sehingga dapat dipakai komponen customer maupun admin.
 */

export function formatIdrPlain(value: number): string {
  const sign = value < 0 ? "-" : "";
  const digits = Math.abs(Math.trunc(value)).toString();
  return `${sign}Rp${digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
}

export function formatPercent(value: number, total: number): string {
  if (total <= 0) return "—";
  return `${((value / total) * 100).toFixed(1).replace(".", ",")}%`;
}

export function formatCount(value: number, total: number): string {
  return `${value}/${total}`;
}

export const eventContextLabels = {
  WEDDING: "Pernikahan",
  ENGAGEMENT: "Lamaran",
} as const;

export const picLabels = {
  SELF: "Saya",
  PARTNER: "Pasangan",
  SHARED: "Bersama",
} as const;

export const savingsOwnerLabels = {
  SELF: "Saya",
  PARTNER: "Pasangan",
  SHARED: "Bersama",
} as const;

export const vendorStatusLabels = {
  UNPAID: "Belum dibayar",
  PARTIAL: "DP sebagian",
  PAID: "Lunas",
} as const;

export const seserahanStatusLabels = {
  NOT_BOUGHT: "Belum dibeli",
  BOUGHT: "Sudah dibeli",
  PREPARED: "Sudah disiapkan",
} as const;

export const seserahanCategoryLabels = {
  SESERAHAN_WANITA: "Seserahan Wanita",
  SESERAHAN_PRIA: "Seserahan Pria",
  HANTARAN_LAMARAN: "Hantaran Lamaran",
} as const;

export const moodboardCategoryLabels = {
  DEKORASI: "Dekorasi",
  BUSANA: "Busana",
  UNDANGAN: "Undangan",
  KUE: "Kue",
  FOTOGRAFI: "Fotografi",
} as const;

export const budgetStatusLabels = {
  SAFE: "Aman",
  NEAR_LIMIT: "Mendekati batas",
  OVER_BUDGET: "Lewat batas",
} as const;

export const inviteStatusLabels = {
  PENDING: "Menunggu",
  ACCEPTED: "Diterima",
  EXPIRED: "Kedaluwarsa",
  REVOKED: "Dibatalkan",
} as const;

export const kitOrderStatusLabels = {
  PENDING_PAYMENT_EXAMPLE: "Menunggu pembayaran (contoh)",
  COMPLETED_EXAMPLE: "Selesai (contoh)",
  PENDING_PAYMENT: "Menunggu pembayaran",
  PAID: "Dibayar",
  FULFILLED: "Selesai",
  CANCELLED: "Dibatalkan",
} as const;

export const upgradeStatusLabels = {
  PENDING: "Menunggu",
  APPROVED: "Disetujui",
  REJECTED: "Ditolak",
} as const;

export const auditResultLabels = {
  SUCCESS: "Berhasil",
  FAILED: "Gagal",
} as const;

/** Selisih hari antara tanggal target dan waktu acuan; negatif berarti lewat. */
export function daysUntil(targetIso: string, nowIso: string): number {
  const target = Date.parse(`${targetIso}T00:00:00.000Z`);
  const now = Date.parse(`${nowIso.slice(0, 10)}T00:00:00.000Z`);
  return Math.round((target - now) / 86_400_000);
}

export function daysLabel(days: number): string {
  if (days === 0) return "Hari ini";
  if (days > 0) return `${days} hari lagi`;
  return `Terlambat ${Math.abs(days)} hari`;
}

/** Rekening hanya ditampilkan tersamar; nomor penuh tidak pernah masuk UI. */
export function maskAccountNumber(value: string | null | undefined): string {
  if (!value) return "••••";
  const digits = value.replace(/\D/g, "");
  return digits.length >= 4 ? `••••${digits.slice(-4)}` : "••••";
}
