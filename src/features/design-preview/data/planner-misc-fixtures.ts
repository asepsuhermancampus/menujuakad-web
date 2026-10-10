import { previewContext } from "./fixture-context";
import type { EventContext } from "./planner-finance-fixtures";

/**
 * Fixture modul seserahan, persyaratan nikah, lamaran, moodboard, wedding kit,
 * dan pasangan. Semua entri sintetis; tidak membuktikan pembelian, unggahan
 * dokumen, undangan pasangan terkirim, atau produk digital nyata.
 */

export type SeserahanStatus = "NOT_BOUGHT" | "BOUGHT" | "PREPARED";

export type SeserahanItemDto = Readonly<{
  id: string;
  name: string;
  category: "SESERAHAN_WANITA" | "SESERAHAN_PRIA" | "HANTARAN_LAMARAN";
  estimateIdr: number;
  status: SeserahanStatus;
  note: string;
}>;

export const seserahanFixture: readonly SeserahanItemDto[] = [
  {
    id: "demo-ses-01",
    name: "Perhiasan seserahan",
    category: "SESERAHAN_WANITA",
    estimateIdr: 2_500_000,
    status: "BOUGHT",
    note: "Sudah dibeli",
  },
  {
    id: "demo-ses-02",
    name: "Kain batik premium",
    category: "SESERAHAN_WANITA",
    estimateIdr: 800_000,
    status: "PREPARED",
    note: "Sudah disiapkan",
  },
  {
    id: "demo-ses-03",
    name: "Perlengkapan ibadah",
    category: "SESERAHAN_WANITA",
    estimateIdr: 500_000,
    status: "PREPARED",
    note: "Sudah disiapkan",
  },
  {
    id: "demo-ses-04",
    name: "Jam tangan",
    category: "SESERAHAN_PRIA",
    estimateIdr: 1_200_000,
    status: "NOT_BOUGHT",
    note: "Cari model klasik",
  },
  {
    id: "demo-ses-05",
    name: "Sepatu kulit",
    category: "SESERAHAN_PRIA",
    estimateIdr: 600_000,
    status: "NOT_BOUGHT",
    note: "",
  },
  {
    id: "demo-ses-06",
    name: "Hantaran buah & kue",
    category: "HANTARAN_LAMARAN",
    estimateIdr: 400_000,
    status: "NOT_BOUGHT",
    note: "Untuk acara lamaran",
  },
] as const;

export const seserahanTotalEstimateIdr = seserahanFixture.reduce(
  (sum, item) => sum + item.estimateIdr,
  0,
);

export type RequirementDto = Readonly<{
  id: string;
  name: string;
  done: boolean;
  dueDate: string | null;
  note: string;
  attachmentLabel: string | null;
}>;

export const requirementsFixture: readonly RequirementDto[] = [
  {
    id: "demo-req-01",
    name: "Kartu tanda penduduk (KTP)",
    done: true,
    dueDate: "2026-09-30",
    note: "Fotokopi 3 lembar",
    attachmentLabel: "ktp-contoh.pdf",
  },
  {
    id: "demo-req-02",
    name: "Kartu keluarga (KK)",
    done: true,
    dueDate: "2026-09-30",
    note: "Fotokopi 2 lembar",
    attachmentLabel: "kk-contoh.pdf",
  },
  {
    id: "demo-req-03",
    name: "Akta kelahiran",
    done: true,
    dueDate: "2026-09-30",
    note: "",
    attachmentLabel: null,
  },
  {
    id: "demo-req-04",
    name: "Surat izin orang tua",
    done: false,
    dueDate: "2026-10-12",
    note: "Perlu tanda tangan kedua orang tua",
    attachmentLabel: null,
  },
  {
    id: "demo-req-05",
    name: "Buku nikah",
    done: false,
    dueDate: null,
    note: "Diambil di KUA setempat",
    attachmentLabel: null,
  },
  {
    id: "demo-req-06",
    name: "Hasil tes kesehatan",
    done: false,
    dueDate: "2026-10-20",
    note: "Jadwalkan di puskesmas",
    attachmentLabel: null,
  },
] as const;

export type EngagementDto = Readonly<{
  active: boolean;
  eventName: string;
  date: string;
  budgetIdr: number;
  spentIdr: number;
  guestCount: number;
}>;

export const engagementFixture: EngagementDto = {
  active: true,
  eventName: "Lamaran — data contoh",
  date: "2026-12-20",
  budgetIdr: 8_000_000,
  spentIdr: 2_400_000,
  guestCount: 40,
};

export type MoodboardItemDto = Readonly<{
  id: string;
  title: string;
  category: "DEKORASI" | "BUSANA" | "UNDANGAN" | "KUE" | "FOTOGRAFI";
  ratio: "3:4";
}>;

export type MoodboardBoardDto = Readonly<{
  id: string;
  name: string;
  items: readonly MoodboardItemDto[];
}>;

export const moodboardBoardsFixture: readonly MoodboardBoardDto[] = [
  {
    id: "demo-mood-01",
    name: "Dekorasi Rustic",
    items: [
      { id: "demo-mood-i01", title: "Referensi dekorasi 1", category: "DEKORASI", ratio: "3:4" },
      { id: "demo-mood-i02", title: "Referensi dekorasi 2", category: "DEKORASI", ratio: "3:4" },
      { id: "demo-mood-i03", title: "Referensi dekorasi 3", category: "DEKORASI", ratio: "3:4" },
      { id: "demo-mood-i04", title: "Referensi dekorasi 4", category: "DEKORASI", ratio: "3:4" },
      { id: "demo-mood-i05", title: "Referensi dekorasi 5", category: "DEKORASI", ratio: "3:4" },
      { id: "demo-mood-i06", title: "Referensi dekorasi 6", category: "DEKORASI", ratio: "3:4" },
    ],
  },
  {
    id: "demo-mood-02",
    name: "Busana",
    items: [
      { id: "demo-mood-i07", title: "Referensi busana 1", category: "BUSANA", ratio: "3:4" },
      { id: "demo-mood-i08", title: "Referensi busana 2", category: "BUSANA", ratio: "3:4" },
      { id: "demo-mood-i09", title: "Referensi busana 3", category: "BUSANA", ratio: "3:4" },
      { id: "demo-mood-i10", title: "Referensi busana 4", category: "BUSANA", ratio: "3:4" },
    ],
  },
] as const;

export type WeddingKitProductDto = Readonly<{
  id: string;
  slug: string;
  name: string;
  summary: string;
  priceIdr: number;
  format: "spreadsheet" | "moodboard" | "checklist";
  contents: readonly string[];
}>;

export const weddingKitFixture: readonly WeddingKitProductDto[] = [
  {
    id: "demo-kit-01",
    slug: "checklist-persiapan",
    name: "Checklist Persiapan Pernikahan",
    summary: "Daftar periksa persiapan dari 12 bulan hingga hari-H.",
    priceIdr: 29_000,
    format: "spreadsheet",
    contents: ["Checklist 12 bulan", "Kolom PIC dan tenggat", "Contoh pengisian"],
  },
  {
    id: "demo-kit-02",
    slug: "panduan-seserahan",
    name: "Panduan Seserahan & Hantaran",
    summary: "Daftar item seserahan dan hantaran beserta estimasi harga.",
    priceIdr: 19_000,
    format: "spreadsheet",
    contents: ["Daftar item seserahan pria & wanita", "Estimasi harga", "Link pembelian contoh"],
  },
  {
    id: "demo-kit-03",
    slug: "moodboard-dekorasi",
    name: "Moodboard Dekorasi Referensi",
    summary: "Kumpulan referensi dekorasi untuk diskusi dengan vendor.",
    priceIdr: 49_000,
    format: "moodboard",
    contents: ["6 papan referensi", "Catatan area dekorasi", "Panduan diskusi vendor"],
  },
  {
    id: "demo-kit-04",
    slug: "timeline-hari-h",
    name: "Timeline Hari-H",
    summary: "Susunan acara hari-H siap disesuaikan.",
    priceIdr: 29_000,
    format: "spreadsheet",
    contents: ["Timeline per jam", "Kolom PIC", "Catatan logistik"],
  },
] as const;

export type WeddingKitOrderDto = Readonly<{
  id: string;
  productName: string;
  orderedAt: string;
  status: "PENDING_PAYMENT_EXAMPLE" | "COMPLETED_EXAMPLE";
}>;

export const weddingKitOrdersFixture: readonly WeddingKitOrderDto[] = [
  {
    id: "demo-order-01",
    productName: "Timeline Hari-H",
    orderedAt: "2026-10-03",
    status: "COMPLETED_EXAMPLE",
  },
] as const;

export type CoupleMemberDto = Readonly<{
  id: string;
  name: string;
  maskedEmail: string;
  role: "OWNER" | "PARTNER";
}>;

export const coupleMembersFixture: readonly CoupleMemberDto[] = [
  { id: "demo-member-01", name: "Asep", maskedEmail: "a•••@contoh.invalid", role: "OWNER" },
] as const;

export type CoupleInviteDto = Readonly<{
  id: string;
  invitedLabel: string;
  sentAt: string;
  expiresInDays: number;
  status: "PENDING" | "ACCEPTED" | "EXPIRED";
}>;

export const coupleInvitesFixture: readonly CoupleInviteDto[] = [] as const;

export type AnnouncementDto = Readonly<{
  version: number;
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  active: boolean;
}>;

export const announcementFixture: AnnouncementDto = {
  version: 1,
  title: "Perencanaan pernikahan kini tersedia",
  body: "Kelola tabungan, anggaran, tugas, dan rundown dalam satu tempat. Data yang terlihat adalah contoh.",
  ctaLabel: "Buka Perencanaan",
  ctaHref: "/dashboard/planner",
  active: false,
};

export const plannerMiscContext = {
  workspaceId: previewContext.workspaceId,
  eventContexts: ["WEDDING", "ENGAGEMENT"] as readonly EventContext[],
} as const;
