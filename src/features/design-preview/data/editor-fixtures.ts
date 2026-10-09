import { invitationFixture } from "./invitations-fixtures";

export type EditorSection =
  | "cover"
  | "couple"
  | "story"
  | "event"
  | "gallery"
  | "rsvp"
  | "publish-check"
  | "music"
  | "dress-code"
  | "video"
  | "countdown"
  | "live-stream"
  | "hashtag"
  | "location"
  | "verse"
  | "rundown"
  | "protocol"
  | "contact"
  | "colophon";
export type EditorCheckDto = Readonly<{
  id: string;
  label: string;
  status: "COMPLETE" | "INCOMPLETE";
  section: EditorSection;
}>;
export type GalleryItemDto = Readonly<{
  id: string;
  label: string;
  status: "READY" | "ERROR";
  sizeBytes: number;
}>;
export type EditorPreviewDto = Readonly<{
  invitationId: string;
  saveState: "SAVED" | "UNSAVED";
  cover: Readonly<{ title: string; subtitle: string }>;
  gallery: readonly GalleryItemDto[];
  galleryQuota: Readonly<{ used: number; limit: number; maxFileBytes: number }>;
  rsvp: Readonly<{ enabled: boolean; allowMaybe: boolean; maxPartySize: number; deadline: string }>;
  music: Readonly<{ enabled: boolean; title: string; artistLabel: string }>;
  dressCode: Readonly<{ title: string; notes: string; colors: readonly string[] }>;
  video: Readonly<{ enabled: boolean; placeholderLabel: string }>;
  countdown: Readonly<{ enabled: boolean; target: string }>;
  liveStream: Readonly<{ enabled: boolean; platformLabel: string }>;
  hashtag: string;
  publishChecks: readonly EditorCheckDto[];
  /** Section baru EDT-15..20: nilai contoh, tidak mengirim ke peta/penyimpanan nyata. */
  location: Readonly<{
    venueName: string;
    addressLabel: string;
    mapLinkLabel: string;
    showMap: boolean;
  }>;
  verse: Readonly<{
    enabled: boolean;
    sourceLabel: string;
    text: string;
    translationLabel: string;
  }>;
  rundown: Readonly<{
    items: readonly Readonly<{ id: string; timeLabel: string; title: string; note: string }>[];
  }>;
  protocol: Readonly<{
    enabled: boolean;
    healthNote: string;
    dressNote: string;
    parkingNote: string;
  }>;
  contact: Readonly<{
    contacts: readonly Readonly<{ id: string; roleLabel: string; nameLabel: string }>[];
  }>;
  colophon: Readonly<{
    enabled: boolean;
    creditLabel: string;
    note: string;
  }>;
}>;

export const editorSections: readonly Readonly<{ id: EditorSection; label: string }>[] = [
  { id: "cover", label: "Sampul" },
  { id: "couple", label: "Pasangan" },
  { id: "story", label: "Kisah cinta" },
  { id: "verse", label: "Ayat & mukadimah" },
  { id: "event", label: "Acara" },
  { id: "location", label: "Lokasi & peta" },
  { id: "rundown", label: "Susunan acara" },
  { id: "protocol", label: "Protokol acara" },
  { id: "gallery", label: "Galeri" },
  { id: "rsvp", label: "RSVP" },
  { id: "music", label: "Musik latar" },
  { id: "dress-code", label: "Panduan tamu" },
  { id: "video", label: "Video" },
  { id: "countdown", label: "Hitung mundur" },
  { id: "live-stream", label: "Siaran langsung" },
  { id: "hashtag", label: "Tagar" },
  { id: "contact", label: "Kontak narahubung" },
  { id: "colophon", label: "Kolofon & kredit" },
  { id: "publish-check", label: "Periksa & terbitkan" },
];
export const editorFixture: EditorPreviewDto = {
  invitationId: invitationFixture.id,
  saveState: "SAVED",
  cover: {
    title: invitationFixture.title,
    subtitle: "Dengan penuh kebahagiaan, kami mengundang Anda.",
  },
  gallery: [
    { id: "demo-gallery-01", label: "Ilustrasi pasangan 1", status: "READY", sizeBytes: 180000 },
    { id: "demo-gallery-02", label: "Ilustrasi pasangan 2", status: "READY", sizeBytes: 210000 },
  ],
  galleryQuota: { used: 2, limit: 20, maxFileBytes: 5000000 },
  rsvp: { enabled: true, allowMaybe: true, maxPartySize: 2, deadline: "2026-12-01T16:59:59.000Z" },
  music: {
    enabled: false,
    title: "Musik contoh",
    artistLabel: "Tidak ada audio berlisensi yang diunggah",
  },
  dressCode: {
    title: "Warna yang kami sukai",
    notes: "Panduan warna ilustratif; silakan pilih pakaian yang nyaman.",
    colors: ["#E8DCCB", "#BBA988", "#68765D"],
  },
  video: { enabled: false, placeholderLabel: "Pratinjau video contoh" },
  countdown: { enabled: true, target: invitationFixture.eventDate },
  liveStream: { enabled: false, platformLabel: "Siaran contoh belum terhubung" },
  hashtag: "#SarahDimasContoh",
  location: {
    venueName: "Balai Kartini Contoh",
    addressLabel: "Jl. Gatot Subroto Contoh No. 1, Jakarta",
    mapLinkLabel: "Tautan peta contoh (belum aktif)",
    showMap: true,
  },
  verse: {
    enabled: true,
    sourceLabel: "Kutipan contoh",
    text: "Dan di antara tanda-tanda kebesaran-Nya, Dia menciptakan pasangan untukmu.",
    translationLabel: "Terjemahan contoh; bukan rujukan resmi.",
  },
  rundown: {
    items: [
      { id: "demo-rundown-01", timeLabel: "08.00", title: "Persiapan & registrasi", note: "Ilustrasi" },
      { id: "demo-rundown-02", timeLabel: "09.00", title: "Prosesi akad", note: "Ilustrasi" },
      { id: "demo-rundown-03", timeLabel: "11.00", title: "Resepsi", note: "Ilustrasi" },
    ],
  },
  protocol: {
    enabled: true,
    healthNote: "Protokol kesehatan contoh; bukan instruksi resmi.",
    dressNote: "Panduan berpakaian contoh.",
    parkingNote: "Informasi parkir contoh.",
  },
  contact: {
    contacts: [
      { id: "demo-contact-01", roleLabel: "Narahubung keluarga", nameLabel: "Kontak contoh 1" },
      { id: "demo-contact-02", roleLabel: "Concierge acara", nameLabel: "Kontak contoh 2" },
    ],
  },
  colophon: {
    enabled: true,
    creditLabel: "Desain & pengembangan contoh",
    note: "Kolofon ilustratif; bukan kredit produksi final.",
  },
  publishChecks: [
    { id: "demo-check-01", label: "Data pasangan", status: "COMPLETE", section: "couple" },
    { id: "demo-check-02", label: "Jadwal acara", status: "COMPLETE", section: "event" },
    { id: "demo-check-03", label: "Galeri", status: "COMPLETE", section: "gallery" },
    { id: "demo-check-04", label: "Tinjau RSVP", status: "INCOMPLETE", section: "rsvp" },
  ],
};
/** State error terpisah; tidak menulis ke gallery utama atau mengunggah file. */
export const galleryErrorFixture = {
  ...editorFixture,
  gallery: [
    ...editorFixture.gallery,
    {
      id: "demo-gallery-error",
      label: "Berkas contoh terlalu besar",
      status: "ERROR" as const,
      sizeBytes: 6000000,
    },
  ],
  galleryQuota: { used: 20, limit: 20, maxFileBytes: 5000000 },
} satisfies EditorPreviewDto;
