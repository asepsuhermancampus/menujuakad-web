/**
 * Fixture modul admin operasional (kelola pengguna, upgrade, konten, QRIS,
 * audit). Semua entri sintetis; tidak membuktikan aksi terhadap database
 * nyata, pengiriman email, atau penerbitan konten produksi.
 */

export type AdminUserRowDto = Readonly<{
  id: string;
  name: string;
  maskedEmail: string;
  role: "CLIENT" | "SUPERADMIN";
  status: "ACTIVE" | "SUSPENDED";
  registeredAt: string;
  accessLabel: string;
}>;

export const adminUsersFixture: readonly AdminUserRowDto[] = [
  {
    id: "demo-au-01",
    name: "Asep",
    maskedEmail: "a•••@contoh.invalid",
    role: "CLIENT",
    status: "ACTIVE",
    registeredAt: "2026-08-12",
    accessLabel: "Lifetime aktif",
  },
  {
    id: "demo-au-02",
    name: "Kirana",
    maskedEmail: "k•••@contoh.invalid",
    role: "CLIENT",
    status: "ACTIVE",
    registeredAt: "2026-08-12",
    accessLabel: "Lifetime aktif",
  },
  {
    id: "demo-au-03",
    name: "Pengguna Contoh 03",
    maskedEmail: "u0•••@contoh.invalid",
    role: "CLIENT",
    status: "ACTIVE",
    registeredAt: "2026-08-20",
    accessLabel: "Belum aktif",
  },
  {
    id: "demo-au-04",
    name: "Pengguna Contoh 04",
    maskedEmail: "u0•••@contoh.invalid",
    role: "CLIENT",
    status: "ACTIVE",
    registeredAt: "2026-09-01",
    accessLabel: "Upgrade menunggu",
  },
  {
    id: "demo-au-05",
    name: "Pengguna Contoh 05",
    maskedEmail: "u0•••@contoh.invalid",
    role: "CLIENT",
    status: "SUSPENDED",
    registeredAt: "2026-09-05",
    accessLabel: "Ditangguhkan",
  },
] as const;

export type AdminUpgradeRowDto = Readonly<{
  id: string;
  userName: string;
  fromPackage: string;
  toPackage: string;
  requestedAt: string;
  proofLabel: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
}>;

export const adminUpgradesFixture: readonly AdminUpgradeRowDto[] = [
  {
    id: "demo-up-01",
    userName: "Pengguna Contoh 04",
    fromPackage: "Dasar",
    toPackage: "Premium",
    requestedAt: "2026-10-06",
    proofLabel: "bukti-contoh-01",
    status: "PENDING",
  },
  {
    id: "demo-up-02",
    userName: "Pengguna Contoh 06",
    fromPackage: "Dasar",
    toPackage: "Premium",
    requestedAt: "2026-10-05",
    proofLabel: "bukti-contoh-02",
    status: "PENDING",
  },
  {
    id: "demo-up-03",
    userName: "Pengguna Contoh 07",
    fromPackage: "Premium",
    toPackage: "Premium Plus",
    requestedAt: "2026-10-04",
    proofLabel: "bukti-contoh-03",
    status: "PENDING",
  },
] as const;

export type AdminContentSectionDto = Readonly<{
  key: "BRAND" | "LANDING" | "PRICING" | "FAQ" | "ANNOUNCEMENT";
  label: string;
  draftSavedAt: string | null;
  publishedAt: string | null;
}>;

export const adminContentSectionsFixture: readonly AdminContentSectionDto[] = [
  { key: "BRAND", label: "Brand", draftSavedAt: "2026-10-06", publishedAt: "2026-10-05" },
  { key: "LANDING", label: "Landing", draftSavedAt: null, publishedAt: "2026-10-01" },
  { key: "PRICING", label: "Pricing", draftSavedAt: null, publishedAt: "2026-10-01" },
  { key: "FAQ", label: "FAQ", draftSavedAt: null, publishedAt: "2026-10-01" },
  { key: "ANNOUNCEMENT", label: "Pengumuman", draftSavedAt: null, publishedAt: null },
] as const;

export type AdminPaymentSettingDto = Readonly<{
  qrisLabel: string | null;
  accounts: readonly Readonly<{
    id: string;
    bank: string;
    maskedNumber: string;
    holder: string;
    active: boolean;
  }>[];
  adminWhatsapp: string;
  messageTemplate: string;
}>;

export const adminPaymentSettingFixture: AdminPaymentSettingDto = {
  qrisLabel: null,
  accounts: [
    {
      id: "demo-pa-01",
      bank: "BCA",
      maskedNumber: "••••4821",
      holder: "Penerima Contoh",
      active: true,
    },
  ],
  adminWhatsapp: "kontak-contoh-admin",
  messageTemplate: "Halo Admin, saya ingin mengonfirmasi pembayaran.",
};

export type AdminAuditRowDto = Readonly<{
  id: string;
  at: string;
  actor: string;
  action: string;
  target: string;
  reason: string;
  result: "SUCCESS" | "FAILED";
}>;

export const adminAuditFixture: readonly AdminAuditRowDto[] = [
  {
    id: "demo-log-01",
    at: "2026-10-07 09:12",
    actor: "superadmin-contoh",
    action: "Aktivasi lifetime",
    target: "Pengguna Contoh 03",
    reason: "Permintaan dukungan",
    result: "SUCCESS",
  },
  {
    id: "demo-log-02",
    at: "2026-10-07 08:40",
    actor: "superadmin-contoh",
    action: "Setujui upgrade",
    target: "Pengguna Contoh 04",
    reason: "Bukti pembayaran sesuai",
    result: "SUCCESS",
  },
  {
    id: "demo-log-03",
    at: "2026-10-06 16:20",
    actor: "superadmin-contoh",
    action: "Reset akses",
    target: "Pengguna Contoh 08",
    reason: "Pengembalian dana",
    result: "SUCCESS",
  },
  {
    id: "demo-log-04",
    at: "2026-10-06 11:05",
    actor: "superadmin-contoh",
    action: "Terbitkan konten",
    target: "Landing",
    reason: "Perbaikan teks hero",
    result: "SUCCESS",
  },
  {
    id: "demo-log-05",
    at: "2026-10-05 14:30",
    actor: "superadmin-contoh",
    action: "Hapus pengguna",
    target: "Pengguna Contoh 09",
    reason: "Akun duplikat",
    result: "FAILED",
  },
] as const;

export const adminFixtureSummary = {
  activeUsers: 10,
  pendingUpgrades: 3,
  pendingPaymentTests: 2,
  activeAnnouncements: 0,
} as const;
