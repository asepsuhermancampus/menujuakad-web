/** Dataset sintetis mandiri; slug katalog internal bukan katalog komersial. */
export const journeyTemplate = {
  id: "menujuakad-seed-preproduction-template",
  slug: "seed-preproduction-internal",
};
export const journeyDistribution = {
  LOGIN_ONLY: 6,
  PROFILE_ONLY: 6,
  TEMPLATE_SELECTED: 6,
  EDITOR_PARTIAL: 6,
  PAYMENT_REQUESTED: 3,
  PAYMENT_APPROVED_TEST: 2,
  PAYMENT_REJECTED: 1,
} as const;
export type JourneyStage = keyof typeof journeyDistribution;
const stages = Object.entries(journeyDistribution).flatMap(([stage, count]) =>
  Array<JourneyStage>(count).fill(stage as JourneyStage),
);
const names = [
  "Aruna",
  "Bima",
  "Citra",
  "Damar",
  "Elina",
  "Farhan",
  "Gita",
  "Hendra",
  "Intan",
  "Jaya",
  "Kirana",
  "Laras",
  "Maya",
  "Nanda",
  "Oriana",
  "Putra",
  "Qila",
  "Raka",
  "Sari",
  "Tara",
  "Utama",
  "Vina",
  "Wira",
  "Yara",
  "Zahra",
  "Aditya",
  "Belinda",
  "Cahya",
  "Dian",
  "Eka",
];
export const customerJourneys = stages.map((stage, index) => {
  const sequence = String(index + 1).padStart(2, "0");
  const invitationId = `menujuakad-journey-${sequence}-invitation`;
  const date = `2027-${String(1 + Math.floor(index / 5)).padStart(2, "0")}-${String(10 + (index % 15)).padStart(2, "0")}`;
  const fullEditor = index >= 24;
  const groom = `TEST — ${names[index]} Contoh ${sequence}`;
  const bride = `TEST — Pasangan ${names[(index + 7) % 30]} ${sequence}`;
  return {
    sequence,
    stage,
    userId: `menujuakad-journey-${sequence}-customer`,
    email: `journey${sequence}@menujuakad.test`,
    invitationId,
    name: stage === "LOGIN_ONLY" ? null : `TEST — ${names[index]} Customer ${sequence}`,
    // Tidak ada nomor telepon yang dapat digunakan menghubungi orang nyata.
    phone: null,
    verified: index % 3 !== 0,
    invitation:
      index < 12
        ? undefined
        : {
            templateId: journeyTemplate.id,
            title: `TEST — ${names[index]} & Pasangan ${sequence}`,
            slug: `test-journey-${sequence}-${names[index].toLowerCase()}`,
            weddingDate: stage === "TEMPLATE_SELECTED" ? null : date,
            timezone: ["Asia/Jakarta", "Asia/Makassar", "Asia/Jayapura"][index % 3],
          },
    couple:
      index < 18
        ? undefined
        : {
            groomFullName: groom,
            groomNickname: names[index],
            groomParents: fullEditor ? "TEST — Keluarga Contoh A" : "",
            groomBio: fullEditor ? "Biografi sintetis untuk pengujian editor." : "",
            brideFullName: fullEditor ? bride : "",
            brideNickname: fullEditor ? names[(index + 7) % 30] : "",
            brideParents: fullEditor ? "TEST — Keluarga Contoh B" : "",
            brideBio: fullEditor ? "Biografi sintetis untuk pengujian." : "",
          },
    sections:
      index < 18
        ? []
        : [
            {
              type: "COVER",
              config: {
                heading: `TEST — Pernikahan ${sequence}`,
                message: index % 2 ? "Contoh undangan; bukan acara nyata." : "",
              },
            },
            ...(index % 2 === 0 || fullEditor
              ? [
                  {
                    type: "EVENT",
                    config: {
                      name: "TEST — Akad Contoh",
                      date,
                      time: index % 2 ? "15:30" : "09:00",
                      venue: "TEST — Ruang Acara Sintetis",
                      address: "Alamat contoh untuk pengujian; bukan lokasi acara nyata.",
                    },
                  },
                ]
              : []),
            ...(index % 3 === 0 || fullEditor
              ? [
                  {
                    type: "STORY",
                    config: { text: `TEST — Cerita pasangan contoh ${sequence}. Data sintetis.` },
                  },
                ]
              : []),
            ...(fullEditor
              ? [{ type: "RSVP", config: { enabled: index % 2 === 0, deadline: date } }]
              : []),
          ],
    payment:
      index < 24
        ? undefined
        : {
            status:
              stage === "PAYMENT_APPROVED_TEST"
                ? "APPROVED_TEST"
                : stage === "PAYMENT_REJECTED"
                  ? "REJECTED"
                  : "REQUESTED",
            amountIdr: [1000, 2000, 3000][index % 3],
            packageSlug: ["TEST_BASIC", "TEST_STANDARD", "TEST_PLUS"][index % 3],
          },
  };
});
export type CustomerJourney = (typeof customerJourneys)[number];
