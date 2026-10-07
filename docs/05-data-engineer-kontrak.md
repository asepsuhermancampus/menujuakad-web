# Kontrak Data Preview Slicing Menuju Akad

Tanggal: 7 Oktober 2026. **Status: DTO, registry dan fixture sintetis tersedia serta teruji lokal.** Lingkup worker hanya `src/features/design-preview/types.ts`, `src/features/design-preview/data/*` dan dokumen ini. Tidak ada perubahan database, migrasi, sesi, provider, route, deployment, commit atau push.

## Sumber, keputusan dan kelengkapan

Role data engineer, AGENTS aplikasi, master spec, progres/changelog kedua folder, rencana PM 03 dan inventaris UI/UX 01 dibaca. Metadata diambil dari manifest Stitch proyek `12559574101879777472`, snapshot 2026-10-07; pembacaan ini bukan inspeksi visual tambahan. Lampiran prompt TXT tidak dimasukkan sebagai layar.

- `screenRecords`: **64 record varian sumber**, masing-masing ID unik; 62 berstatus `screenshot`, dua `metadata-only`.
- `previewScreens`: **53 kode unik**, setiap kode mempunyai satu varian utama dan daftar `variants` lengkap. Total panjang daftar varian tetap 64, bukan 64 route produk.
- Metadata-only: desktop CUS-01 dan CUS-02. CUS-01 memilih referensi tablet yang valid sebagai varian utama; desktop tetap tersimpan dan tidak diberi status screenshot. CUS-02 tetap metadata-only.
- Pemilihan utama berurutan: screenshot valid, state berawalan `Default`, kemudian desktop/tablet/mobile. INV-01 utama bukan state token tidak valid; CUS-08 utama bukan state expired. Urutan asli varian dalam satu kode dipertahankan.
- CUS-05/06 belum ditemukan; dicatat di `previewSourceGaps` dan **tidak** dimasukkan whitelist sumber. Bila UI pelengkap dibuat kemudian, statusnya harus `reconstruction`, dengan keputusan integrasi eksplisit dan pengujian sendiri.
- PUB-05 adalah `/pricing`, PUB-06 `/how-it-works`, PUB-07 `/faq`, PUB-08 `/contact`, PUB-09 `/about`, PUB-10 `/terms`, PUB-11 `/privacy`. ERR mempunyai logical route boundary; DS mempunyai `referensi internal`, keduanya bukan URL produksi.

Snapshot metadata aplikasi disimpan per prefix di `data/sources/{acc,adm,aut,cus,ds,edt,err,gst,inv,pub,sup}.ts`. File ini hanya berisi ID/kode/judul/rute/state/perangkat/dimensi/status/flag inspeksi. URL download, source token, path screenshot lokal dan HTML tidak disalin. Runtime/build tidak membaca folder rancangan; sumber PNG tetap di rancangan untuk inspeksi pelaksana UI.

## Antarmuka registry yang dikunci

Import metadata dari `@/features/design-preview/data/screens`; import tipe dari `@/features/design-preview/types`.

```ts
export type PreviewAudience = "public" | "auth" | "customer" | "admin" | "invitation" | "reference";
export type PreviewDevice = "DESKTOP" | "MOBILE" | "TABLET";
export type PreviewSourceStatus = "screenshot" | "metadata-only" | "reconstruction";

// PreviewScreenVariant bersifat readonly:
// id, code, title, audience, logicalRoute, state, device, sourceStatus,
// width, height (number), visualInspected (boolean).
export type PreviewScreen = PreviewScreenVariant &
  Readonly<{
    variants: readonly PreviewScreenVariant[];
  }>;

export const screenRecords: readonly PreviewScreenVariant[];
export const previewScreens: readonly PreviewScreen[];
export function getPreviewScreen(code: string): PreviewScreen | undefined;
export function getPreviewVariant(id: string): PreviewScreenVariant | undefined;
```

`getPreviewScreen` menerima kode ASCII persis seperti `PUB-01` atau `pub-01`; tidak trim, tidak decode URL, tidak membangun nama file/dynamic import dan tidak menerima query/path. `__proto__`, `constructor`, kode unknown, traversal dan kode dengan query menghasilkan `undefined`. Penyimpanan memakai Map, bukan lookup properti objek dari input user. `getPreviewVariant` hanya menemukan ID snapshot yang terdaftar. Resolver varian tidak menjalankan provider maupun memuat aset.

`previewScreens`, `screenRecords`, metadata record, screen utama dan daftar varian dibekukan agar UI tidak mengubah registry. `audience` hanya kategori UI; tidak memberikan hak customer atau SUPERADMIN. `logicalRoute` merupakan handoff dokumentasi, bukan target yang aman untuk navigasi preview. Pelaksana wajib membuat tautan ke `/preview-ui/<code>` dan memilih view melalui map statis. Untuk selector state/perangkat, pastikan ID hasil `getPreviewVariant` mempunyai `code` yang sama dengan screen aktif sebelum komposisi.

Kontrak komposisi fullstack tetap `DesignPreviewView({ screen }: { screen: PreviewScreen })`; field lama rencana PM dipertahankan dan metadata tambahan tidak merusak consumer minimal.

## Export fixture dan props untuk pelaksana UI

Import fixture/DTO aman dari barrel **`@/features/design-preview/data/fixtures`**. Barrel 10 baris; tidak mempunyai logika bisnis, import server, fetch atau mutation. Record readonly TypeScript; komponen interaktif membuat salinan state lokal dan tidak mengubah fixture modul.

| Export nilai                                                  | Tipe/field utama                                                                                                                                        | Konsumen dan tanggung jawab                                                                  |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `previewContext`                                              | mode `synthetic`, label, `invitationId`, `accountId`, `now` ISO tetap                                                                                   | Banner dan waktu contoh deterministik; bukan sesi atau jam produksi                          |
| `templatesFixture`                                            | `readonly TemplatePreviewDto[]`: id, slug, name, category, description, colors, featured                                                                | Katalog/detail/demo; warna bukan URL foto atau aset berlisensi                               |
| `invitationFixture`, `invitationsFixture`                     | `InvitationPreviewDto`: id, slug, title, partnerOne/Two, status, templateId, eventDate, updatedAt, guestLabel, events, story                            | Overview, wizard, cover/opened undangan contoh; status utama DRAFT                           |
| `editorFixture`, `galleryErrorFixture`                        | `EditorPreviewDto`: invitationId, saveState, cover, gallery, galleryQuota, rsvp, music, dressCode, video, countdown, liveStream, hashtag, publishChecks | Semua section editor; galeri error/kuota adalah state ilustratif terpisah                    |
| `editorSections`                                              | daftar id `EditorSection` dan label                                                                                                                     | Navigasi 13 section; EDT-01 shell, EDT-02–14 section; query `publish-check` konsisten sumber |
| `guestsFixture`, `emptyGuestsFixture`                         | `readonly GuestPreviewDto[]`: id, invitationId, displayName, group, rsvpStatus, partySize, deliveryStatus, respondedAt                                  | Tabel/filter tamu dan empty state; tidak punya nomor/email/token tamu                        |
| `guestImportFixture`                                          | `readonly GuestImportRowDto[]`: rowNumber, displayName, group, status, issue                                                                            | Tiga baris VALID/DUPLICATE/INVALID untuk preview impor lokal                                 |
| `rsvpFixture`, `rsvpStatusLabels`                             | `RsvpSummaryDto`; label enum ATTENDING/DECLINING/MAYBE/PENDING                                                                                          | Ringkasan RSVP; ragu bukan belum menjawab                                                    |
| `wishesFixture`                                               | `readonly WishPreviewDto[]`: id, invitationId, guestId/Label, message, VISIBLE/HIDDEN, createdAt                                                        | Buku doa dan contoh moderasi lokal                                                           |
| `giftsFixture`, `giftSettingsFixture`                         | `readonly GiftPreviewDto[]`; konfigurasi enabled=false, accountNumber/shippingAddress/paymentQr=null                                                    | Amplop/hadiah; DECLARED adalah laporan contoh, bukan transfer bank terverifikasi             |
| `analyticsFixture`                                            | `AnalyticsPreviewDto`: invitationId, period, pageViews, uniqueVisitors, rsvp, visibleWishes, declaredEnvelopeAmountIdr, daily, sources                  | Grafik dan statistik contoh dengan satu semantik per indikator                               |
| `packagesFixture`                                             | `readonly PackagePreviewDto[]`: id, name, amountIdr, IDR, priceLabel, recommended, guestLimit, galleryLimit, features                                   | Pilihan paket; semua harga dan kuota contoh, belum keputusan komersial                       |
| `ordersFixture`, `pendingOrderFixture`, `expiredOrderFixture` | `OrderPreviewDto`: id, accountId, invitationId, packageId, amountIdr, currency, status, createdAt, expiresAt, paidAt, synthetic=true                    | Checkout default/expired dan monitoring admin; waktu tetap, bukan instrumen payment          |
| `webhooksFixture`                                             | `readonly WebhookPreviewDto[]`: id, orderId, eventType, status, receivedAt, attempts, summary                                                           | Rekonsiliasi contoh PROCESSED/DUPLICATE/FAILED; tidak ada payload/signature/endpoint nyata   |
| `billingFixture`, `paymentStatusLabels`                       | `BillingPreviewDto`: mode, label, paymentInstrument=null, packages, orders, webhooks                                                                    | Container billing; PAID hanya visual transaksi sintetis dan tidak memberi entitlement        |
| `accountFixture`                                              | `AccountPreviewDto`: id, displayName, email, authMethodLabel, emailVerified=false, avatarInitials                                                       | Profil/login visual; email `.invalid`, tidak membentuk VerifiedSession                       |
| `notificationsFixture`, `notificationPreferencesFixture`      | `NotificationPreviewDto[]`; preferensi boolean                                                                                                          | Inbox/preferensi lokal; tidak mengirim email atau notifikasi asli                            |
| `supportFixture`                                              | `readonly SupportTicketPreviewDto[]`: id, subject, category, status, createdAt, updatedAt, messages                                                     | Tiket OPEN/IN_PROGRESS dan balasan fiktif; form hanya state UI                               |

Contoh props yang konsisten untuk komponen domain:

```ts
import type {
  GuestPreviewDto,
  OrderPreviewDto,
  AnalyticsPreviewDto,
} from "@/features/design-preview/data/fixtures";

type GuestsProps = { guests: readonly GuestPreviewDto[] };
type CheckoutProps = { order: OrderPreviewDto };
type AnalyticsProps = { analytics: AnalyticsPreviewDto };
```

Callback interaksi dimiliki UI, bersifat lokal dan tidak menambahkan handler provider ke DTO. UI menerima array readonly, mencetak label contoh, dan memformat nominal/tanggal untuk Bahasa Indonesia pada layer presentasi. Placeholder media tidak diubah menjadi URL arbitrary atau akun bank yang dapat dipakai pembayaran.

## Semantik, konsistensi dan privasi

- Semua ID fixture berawalan `demo-`; referensi invitation/account/guest/package/order antarfile konsisten. Nama tamu bernomor `Tamu Contoh 001`–`120`; akun `Akun Contoh`, email `akun@example.invalid`. Nama pasangan memiliki penanda Contoh; venue/alamat hanya label ilustratif.
- Nominal berupa integer IDR dalam rupiah, bukan floating point atau nominal terformat. Harga contoh Essential/Signature/Premium 99.000/149.000/249.000 rupiah; seluruh order contoh memakai Signature 149.000. Gift fisik nominal 0, bukan nilai taksiran transaksi.
- Tanggal waktu memakai ISO 8601 UTC; tanggal kisah dan bucket harian memakai ISO kalender `YYYY-MM-DD`. Waktu acuan 2026-10-07T08:00:00.000Z agar screenshot/test stabil. Checkout yang ditampilkan default harus memakai waktu contoh tersebut, bukan menyatakan tagihan nyata masih aktif menurut jam browser.
- Tamu 120: ATTENDING 68, DECLINING 20, MAYBE 12, PENDING 20. Persentase hadir **57%**, pembulatan 68/120, bukan 68 dibagi hanya tamu yang telah menjawab. `partySize` seluruh fixture 1 agar hitungan orang dan guest record tidak bertentangan; dukungan party lebih besar kelak memerlukan indikator terpisah.
- Statistik RSVP dihitung dari `guestsFixture`, jumlah ucapan terlihat dari status VISIBLE, total amplop yang dilaporkan dari ENVELOPE. Nilainya 2 ucapan terlihat dan 400.000 rupiah **deklarasi contoh**, bukan uang diterima.
- Analitik pageViews 420 adalah jumlah bucket harian; uniqueVisitors periode 180 merupakan himpunan periode contoh, bukan penjumlahan unique harian. Sumber 110+50+20=180; kunjungan harian dapat bertumpang tindih antarhari. Data bukan hasil telemetry produksi.
- `SENT_EXAMPLE` tidak berarti WhatsApp/email terkirim. Event webhook `PAYMENT_PAID_EXAMPLE`, status PAID dan timestamp paidAt adalah contoh visual, bukan bukti Mayar. Tidak ada QRIS, rekening, NMID, token/link pembayaran, raw webhook payload, password, cookie, session atau kredensial provider.
- Tidak ada perubahan Prisma/model/index/pipeline persistensi. Untuk cakupan ini, alur data adalah metadata sumber → snapshot statis aplikasi → registry whitelist/DTO sintetis → UI presentasional. Normalisasi preview tidak menjadi rancangan ulang schema produksi; ownership dan guard operasi kelak tetap tanggung jawab server.

## Validasi dan batas hasil

Siklus pengujian: import modul belum ada gagal; setelah export skeleton tersedia, empat test benar-benar gagal pada registry kosong, status sumber kosong, identitas kosong dan ringkasan RSVP kosong. Implementasi kemudian membuat keempatnya lulus, tanpa mock provider.

| Pemeriksaan                                                                        | Hasil                                                                                                              |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `npm test -- src/features/design-preview/data/fixtures.test.ts`                    | 1 file, **4 test lulus**                                                                                           |
| `npm run typecheck`                                                                | Prisma Client 7.10.0 ter-generate, TypeScript **exit 0**                                                           |
| `npx eslint src/features/design-preview/types.ts src/features/design-preview/data` | **exit 0**, tidak ada temuan                                                                                       |
| `npm test`                                                                         | **7 file, 178 test lulus** pada working tree saat validasi; termasuk perubahan security worker yang sudah tersedia |
| Ukuran file                                                                        | `types.ts` 37, registry 111, barrel 10; file terbesar 185 baris (source EDT); seluruh file ownership <200 baris    |

Test menangkap hilangnya whitelist, lookup prototype/path/query, kehilangan varian, klaim screenshot palsu, default expired/token tidak valid, referensi fixture putus, ID duplikat, nominal noninteger/tanggal tidak valid, serta penggabungan MAYBE dengan PENDING.

**Belum diuji worker ini:** build/E2E/visual semua layar/deployment; instruksi task tidak menjalankan build. Tidak ada koneksi Neon/auth/Mayar atau verifikasi produksi. Fullstack mengintegrasikan resolver statis dan label/noindex preview; payment/business memakai DTO ini; QA menguji UI dan akses pada hasil integrasi. Progres/changelog lintas ownership diperbarui koordinator berdasarkan laporan ini.
