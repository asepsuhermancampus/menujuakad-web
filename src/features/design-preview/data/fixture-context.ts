/** Referensi deterministik; preview tidak memakai waktu server atau identitas produksi. */
export const previewContext = Object.freeze({
  mode: "synthetic" as const,
  label: "Data contoh — bukan layanan aktif",
  invitationId: "demo-invitation-01",
  accountId: "demo-account-01",
  now: "2026-10-07T08:00:00.000Z",
});
