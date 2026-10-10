import { previewContext } from "./fixture-context";
import type { EventContext } from "./planner-finance-fixtures";

/**
 * Fixture modul pekerjaan (tugas, rundown) dan vendor.
 * Semua entri sintetis; tidak membuktikan vendor nyata, pembayaran vendor,
 * atau jadwal acara yang telah dikonfirmasi.
 */

export type TaskStatus = "PENDING" | "DONE";
export type TaskPic = "SELF" | "PARTNER" | "SHARED";

export type TaskDto = Readonly<{
  id: string;
  title: string;
  pic: TaskPic;
  dueDate: string;
  status: TaskStatus;
  eventContext: EventContext;
  note: string;
}>;

export const tasksFixture: readonly TaskDto[] = [
  {
    id: "demo-task-01",
    title: "Latihan jalan (gladi)",
    pic: "SELF",
    dueDate: "2026-10-06",
    status: "PENDING",
    eventContext: "WEDDING",
    note: "Terlambat 1 hari dari jadwal contoh",
  },
  {
    id: "demo-task-02",
    title: "Konfirmasi jumlah tamu ke katering",
    pic: "SHARED",
    dueDate: "2026-10-07",
    status: "PENDING",
    eventContext: "WEDDING",
    note: "Termasuk tamu tambahan",
  },
  {
    id: "demo-task-03",
    title: "Final fitting gaun",
    pic: "PARTNER",
    dueDate: "2026-10-15",
    status: "PENDING",
    eventContext: "WEDDING",
    note: "Bawa sepatu yang akan dipakai",
  },
  {
    id: "demo-task-04",
    title: "Bayar pelunasan venue",
    pic: "SHARED",
    dueDate: "2026-10-16",
    status: "PENDING",
    eventContext: "WEDDING",
    note: "Sisa Rp12.500.000",
  },
  {
    id: "demo-task-05",
    title: "Cetak kartu meja",
    pic: "SELF",
    dueDate: "2026-10-17",
    status: "PENDING",
    eventContext: "WEDDING",
    note: "Sesuaikan daftar tamu final",
  },
  {
    id: "demo-task-06",
    title: "Siapkan mahar",
    pic: "PARTNER",
    dueDate: "2026-10-17",
    status: "PENDING",
    eventContext: "WEDDING",
    note: "",
  },
  {
    id: "demo-task-07",
    title: "Konfirmasi rundown MC",
    pic: "SHARED",
    dueDate: "2026-10-05",
    status: "DONE",
    eventContext: "WEDDING",
    note: "Selesai",
  },
  {
    id: "demo-task-08",
    title: "Kirim undangan digital",
    pic: "SHARED",
    dueDate: "2026-10-01",
    status: "DONE",
    eventContext: "WEDDING",
    note: "Selesai",
  },
] as const;

export type RundownItemDto = Readonly<{
  id: string;
  startTime: string;
  endTime: string;
  title: string;
  pic: TaskPic;
  eventContext: EventContext;
  note: string;
}>;

export const rundownFixture: readonly RundownItemDto[] = [
  {
    id: "demo-run-01",
    startTime: "06:00",
    endTime: "07:30",
    title: "Persiapan pengantin",
    pic: "SHARED",
    eventContext: "WEDDING",
    note: "Rias dan busana",
  },
  {
    id: "demo-run-02",
    startTime: "08:00",
    endTime: "09:00",
    title: "Prosesi akad",
    pic: "SHARED",
    eventContext: "WEDDING",
    note: "Ruang utama",
  },
  {
    id: "demo-run-03",
    startTime: "09:30",
    endTime: "10:30",
    title: "Resepsi dibuka",
    pic: "SHARED",
    eventContext: "WEDDING",
    note: "Penerimaan tamu",
  },
  {
    id: "demo-run-04",
    startTime: "11:00",
    endTime: "12:30",
    title: "Makan siang & hiburan",
    pic: "SHARED",
    eventContext: "WEDDING",
    note: "Pengisi acara",
  },
  {
    id: "demo-run-05",
    startTime: "13:00",
    endTime: "13:30",
    title: "Foto keluarga",
    pic: "PARTNER",
    eventContext: "WEDDING",
    note: "Daftar keluarga sudah disiapkan",
  },
  {
    id: "demo-run-06",
    startTime: "14:00",
    endTime: "14:30",
    title: "Penutup",
    pic: "SHARED",
    eventContext: "WEDDING",
    note: "Ucapan terima kasih",
  },
] as const;

export type VendorPaymentStatus = "UNPAID" | "PARTIAL" | "PAID";

export type VendorDto = Readonly<{
  id: string;
  name: string;
  category: string;
  contact: string;
  totalIdr: number;
  paidIdr: number;
  status: VendorPaymentStatus;
  eventContext: EventContext;
  note: string;
}>;

export const vendorsFixture: readonly VendorDto[] = [
  {
    id: "demo-ven-01",
    name: "Venue Seruni",
    category: "Venue",
    contact: "kontak-contoh-01",
    totalIdr: 45_000_000,
    paidIdr: 32_500_000,
    status: "PARTIAL",
    eventContext: "WEDDING",
    note: "Sisa 1 termin",
  },
  {
    id: "demo-ven-02",
    name: "Dekor Rembulan",
    category: "Dekorasi",
    contact: "kontak-contoh-02",
    totalIdr: 12_000_000,
    paidIdr: 6_000_000,
    status: "PARTIAL",
    eventContext: "WEDDING",
    note: "DP 50%",
  },
  {
    id: "demo-ven-03",
    name: "Cahaya Foto",
    category: "Dokumentasi",
    contact: "kontak-contoh-03",
    totalIdr: 7_000_000,
    paidIdr: 7_000_000,
    status: "PAID",
    eventContext: "WEDDING",
    note: "Lunas",
  },
  {
    id: "demo-ven-04",
    name: "Rias Ayu",
    category: "Busana & Rias",
    contact: "kontak-contoh-04",
    totalIdr: 8_000_000,
    paidIdr: 0,
    status: "UNPAID",
    eventContext: "WEDDING",
    note: "Belum ada pembayaran",
  },
] as const;

export type MarketplaceVendorDto = Readonly<{
  id: string;
  name: string;
  category: string;
  city: string;
  priceBand: "<5jt" | "5-10jt" | "10-25jt" | "25-50jt" | "50-100jt" | ">100jt";
  ratingLabel: string;
}>;

export const marketplaceVendorsFixture: readonly MarketplaceVendorDto[] = [
  {
    id: "demo-mkt-01",
    name: "Vendor Contoh Dekorasi 01",
    category: "Dekorasi",
    city: "Bandung",
    priceBand: "10-25jt",
    ratingLabel: "4,8 (contoh)",
  },
  {
    id: "demo-mkt-02",
    name: "Vendor Contoh Katering 01",
    category: "Katering",
    city: "Jakarta",
    priceBand: "25-50jt",
    ratingLabel: "4,7 (contoh)",
  },
  {
    id: "demo-mkt-03",
    name: "Vendor Contoh Fotografi 01",
    category: "Dokumentasi",
    city: "Surabaya",
    priceBand: "5-10jt",
    ratingLabel: "4,9 (contoh)",
  },
  {
    id: "demo-mkt-04",
    name: "Vendor Contoh Busana 01",
    category: "Busana & Rias",
    city: "Yogyakarta",
    priceBand: "5-10jt",
    ratingLabel: "4,6 (contoh)",
  },
] as const;

export const workFixtureContext = {
  workspaceId: previewContext.workspaceId,
} as const;
