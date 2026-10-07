import { previewContext } from "./fixture-context";

export type AccountPreviewDto = Readonly<{
  id: string;
  displayName: string;
  email: string;
  authMethodLabel: string;
  emailVerified: false;
  avatarInitials: string;
}>;
export type NotificationPreviewDto = Readonly<{
  id: string;
  title: string;
  description: string;
  read: boolean;
  category: "INVITATION" | "RSVP" | "BILLING";
  createdAt: string;
}>;
export type SupportTicketPreviewDto = Readonly<{
  id: string;
  subject: string;
  category: "DESIGN" | "BILLING" | "ACCOUNT";
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED";
  createdAt: string;
  updatedAt: string;
  messages: readonly Readonly<{
    id: string;
    author: "CUSTOMER_EXAMPLE" | "SUPPORT_EXAMPLE";
    body: string;
    createdAt: string;
  }>[];
}>;
export const accountFixture: AccountPreviewDto = {
  id: previewContext.accountId,
  displayName: "Akun Contoh",
  email: "akun@example.invalid",
  authMethodLabel: "Tampilan metode masuk, belum terhubung",
  emailVerified: false,
  avatarInitials: "AC",
};
export const notificationsFixture: readonly NotificationPreviewDto[] = [
  {
    id: "demo-notification-01",
    title: "Respons tamu contoh",
    description: "Tamu Contoh 001 memilih hadir pada data pratinjau.",
    read: false,
    category: "RSVP",
    createdAt: "2026-10-06T08:00:00.000Z",
  },
  {
    id: "demo-notification-02",
    title: "Periksa undangan",
    description: "Ada bagian contoh yang dapat ditinjau pada editor.",
    read: true,
    category: "INVITATION",
    createdAt: "2026-10-06T07:00:00.000Z",
  },
  {
    id: "demo-notification-03",
    title: "Order contoh kedaluwarsa",
    description: "Tidak ada tagihan atau transaksi nyata.",
    read: true,
    category: "BILLING",
    createdAt: "2026-10-06T08:00:00.000Z",
  },
];
export const notificationPreferencesFixture = {
  invitationUpdates: true,
  rsvpUpdates: true,
  billingUpdates: true,
  emailUpdates: false,
} as const;
export const supportFixture: readonly SupportTicketPreviewDto[] = [
  {
    id: "demo-ticket-01",
    subject: "Bantuan tata letak galeri contoh",
    category: "DESIGN",
    status: "IN_PROGRESS",
    createdAt: "2026-10-06T05:00:00.000Z",
    updatedAt: "2026-10-06T06:00:00.000Z",
    messages: [
      {
        id: "demo-message-01",
        author: "CUSTOMER_EXAMPLE",
        body: "Bagaimana mengatur galeri pada pratinjau?",
        createdAt: "2026-10-06T05:00:00.000Z",
      },
      {
        id: "demo-message-02",
        author: "SUPPORT_EXAMPLE",
        body: "Balasan contoh: tinjau bagian Galeri pada editor.",
        createdAt: "2026-10-06T06:00:00.000Z",
      },
    ],
  },
  {
    id: "demo-ticket-02",
    subject: "Pertanyaan paket contoh",
    category: "BILLING",
    status: "OPEN",
    createdAt: "2026-10-07T06:00:00.000Z",
    updatedAt: "2026-10-07T06:00:00.000Z",
    messages: [],
  },
];
