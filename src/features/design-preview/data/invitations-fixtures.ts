import { previewContext } from "./fixture-context";

/** Lifecycle produk; publikasi berada pada isPublished, bukan status ini. */
export type InvitationStatus =
  "DRAFT" | "PENDING_PAYMENT" | "ACTIVE" | "EXPIRING_SOON" | "EXPIRED" | "SUSPENDED" | "ARCHIVED";
export type TemplatePreviewDto = Readonly<{
  id: string;
  slug: string;
  name: string;
  category: "EDITORIAL" | "BOTANICAL" | "MINIMAL";
  description: string;
  colors: readonly string[];
  featured: boolean;
}>;
export type InvitationEventDto = Readonly<{
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  venue: string;
  addressLabel: string;
}>;
export type InvitationPreviewDto = Readonly<{
  id: string;
  slug: string;
  title: string;
  partnerOne: string;
  partnerTwo: string;
  status: InvitationStatus;
  isPublished: boolean;
  templateId: string;
  eventDate: string;
  updatedAt: string;
  guestLabel: string;
  events: readonly InvitationEventDto[];
  story: readonly Readonly<{ id: string; date: string; title: string; body: string }>[];
}>;

export const templatesFixture: readonly TemplatePreviewDto[] = [
  {
    id: "demo-template-01",
    slug: "serenade-no-1",
    name: "Serenade No. 1",
    category: "EDITORIAL",
    description: "Tipografi editorial dan aksen emas yang tenang.",
    colors: ["#FAF7F1", "#B59A5B", "#2A2723"],
    featured: true,
  },
  {
    id: "demo-template-02",
    slug: "botanical-garden",
    name: "Botanical Garden",
    category: "BOTANICAL",
    description: "Nuansa taman untuk cerita hari istimewa.",
    colors: ["#F7F5EE", "#68765D", "#C1AB81"],
    featured: false,
  },
  {
    id: "demo-template-03",
    slug: "timeless-vow",
    name: "Timeless Vow",
    category: "MINIMAL",
    description: "Komposisi sederhana dengan ruang yang lapang.",
    colors: ["#FBFAF8", "#A5998A", "#35302B"],
    featured: false,
  },
];

export const invitationFixture: InvitationPreviewDto = {
  id: previewContext.invitationId,
  slug: "sarah-dimas-contoh",
  title: "Sarah & Dimas",
  partnerOne: "Sarah Contoh",
  partnerTwo: "Dimas Contoh",
  status: "DRAFT",
  isPublished: false,
  templateId: "demo-template-01",
  eventDate: "2026-12-12T02:00:00.000Z",
  updatedAt: "2026-10-07T07:30:00.000Z",
  guestLabel: "Tamu Contoh 001",
  events: [
    {
      id: "demo-event-01",
      title: "Akad Nikah",
      startsAt: "2026-12-12T02:00:00.000Z",
      endsAt: "2026-12-12T03:00:00.000Z",
      venue: "Gedung Acara Contoh",
      addressLabel: "Lokasi ilustrasi, bukan alamat acara nyata",
    },
    {
      id: "demo-event-02",
      title: "Resepsi",
      startsAt: "2026-12-12T04:00:00.000Z",
      endsAt: "2026-12-12T07:00:00.000Z",
      venue: "Gedung Acara Contoh",
      addressLabel: "Lokasi ilustrasi, bukan alamat acara nyata",
    },
  ],
  story: [
    {
      id: "demo-story-01",
      date: "2022-06-15",
      title: "Awal pertemuan",
      body: "Cerita contoh tentang pertemuan yang sederhana dan berkesan.",
    },
    {
      id: "demo-story-02",
      date: "2025-08-17",
      title: "Sebuah janji",
      body: "Kami memilih melangkah bersama menuju hari yang dinantikan.",
    },
  ],
};
/** Lifecycle ACTIVE tidak otomatis membuat undangan dipublikasikan. */
export const activeUnpublishedInvitationFixture: InvitationPreviewDto = {
  ...invitationFixture,
  id: "demo-invitation-02",
  slug: "undangan-aktif-belum-terbit-contoh",
  title: "Undangan aktif belum terbit (contoh)",
  status: "ACTIVE",
  isPublished: false,
};
export const invitationsFixture: readonly InvitationPreviewDto[] = [
  invitationFixture,
  activeUnpublishedInvitationFixture,
];
