import { invitationFixture, type EditorPreviewDto } from "@/features/design-preview/data/fixtures";
export type EditorDraft = Record<string, string>;
/** Salinan nilai sederhana; tidak menyimpan sesi atau menulis fixture bersama. */
export function createEditorDraft(fixture: EditorPreviewDto): EditorDraft {
  return {
    coverMode: "TYPE_FOCUS",
    coverTypography: "DISPLAY",
    coverOverlay: "55",
    coverColor: "#322b25",
    musicTrack: "Piano Ilustratif",
    musicPlaying: "false",
    musicVolume: "45",
    musicLoop: "true",
    musicAutoplay: "false",
    videoProvider: "URL",
    videoRatio: "16:9",
    videoPoster: "Ilustrasi poster",
    countdownStyle: "CLASSIC",
    countdownZeroText: "Hari bahagia telah tiba (contoh)",
    liveProvider: "YOUTUBE",
    liveSchedule: "2026-12-12T09:00",
    liveAccess: "PUBLIC_EXAMPLE",
    filterName: "Filter Kenangan Contoh",
    title: fixture.cover.title,
    subtitle: fixture.cover.subtitle,
    partnerOne: invitationFixture.partnerOne,
    partnerTwo: invitationFixture.partnerTwo,
    familyOne: "Keluarga Contoh",
    familyTwo: "Keluarga Contoh",
    storyTitle: invitationFixture.story[0].title,
    storyBody: invitationFixture.story[0].body,
    storyDate: "2022-06-15",
    eventTitle: "Akad Nikah",
    eventDate: "2026-12-12",
    eventTime: "09:00",
    venue: "Gedung Acara Contoh",
    address: "Lokasi ilustrasi",
    rsvpEnabled: "true",
    allowMaybe: "true",
    maxParty: String(fixture.rsvp.maxPartySize),
    deadline: "2026-12-01",
    musicEnabled: "false",
    musicTitle: fixture.music.title,
    dressTitle: fixture.dressCode.title,
    dressNotes: fixture.dressCode.notes,
    videoEnabled: "false",
    videoUrl: "",
    countdownEnabled: "true",
    countdownDate: "2026-12-12T09:00",
    liveEnabled: "false",
    liveUrl: "",
    hashtag: fixture.hashtag,
    filterUrl: "",
    filterEnabled: "false",
  };
}
export function updateEditorDraft(draft: EditorDraft, field: string, value: string): EditorDraft {
  return { ...draft, [field]: value };
}
export function validateEditorDraft(draft: EditorDraft): string[] {
  const errors: string[] = [];
  if (!draft.title.trim()) errors.push("Judul sampul wajib diisi.");
  for (const field of ["videoUrl", "liveUrl", "filterUrl"]) {
    if (!draft[field]) continue;
    try {
      if (new URL(draft[field]).protocol !== "https:")
        errors.push("URL media harus menggunakan HTTPS.");
    } catch {
      errors.push("URL media harus menggunakan HTTPS.");
    }
  }
  if (
    !Number.isInteger(Number(draft.maxParty)) ||
    Number(draft.maxParty) < 1 ||
    Number(draft.maxParty) > 10
  )
    errors.push("Jumlah tamu harus antara 1 dan 10.");
  return [...new Set(errors)];
}
