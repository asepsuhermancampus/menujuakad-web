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
  | "hashtag";
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
}>;

export const editorSections: readonly Readonly<{ id: EditorSection; label: string }>[] = [
  { id: "cover", label: "Cover" },
  { id: "couple", label: "Pasangan" },
  { id: "story", label: "Kisah cinta" },
  { id: "event", label: "Acara" },
  { id: "gallery", label: "Galeri" },
  { id: "rsvp", label: "RSVP" },
  { id: "music", label: "Musik latar" },
  { id: "dress-code", label: "Panduan tamu" },
  { id: "video", label: "Video" },
  { id: "countdown", label: "Hitung mundur" },
  { id: "live-stream", label: "Siaran langsung" },
  { id: "hashtag", label: "Tagar" },
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
