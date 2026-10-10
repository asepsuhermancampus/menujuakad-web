import type {
  PreviewAudience,
  PreviewScreen,
  PreviewScreenVariant,
  SourceScreenTuple,
} from "../types";
import { accSources } from "./sources/acc";
import { admSources } from "./sources/adm";
import { autSources } from "./sources/aut";
import { cusSources } from "./sources/cus";
import { dsSources } from "./sources/ds";
import { edtSources } from "./sources/edt";
import { errSources } from "./sources/err";
import { gstSources } from "./sources/gst";
import { invSources } from "./sources/inv";
import { plnSources } from "./sources/pln";
import { pubSources } from "./sources/pub";
import { supSources } from "./sources/sup";

function toRecords(
  rows: readonly SourceScreenTuple[],
  audience: PreviewAudience,
): readonly PreviewScreenVariant[] {
  return rows.map(
    ([
      id,
      code,
      title,
      logicalRoute,
      state,
      device,
      sourceStatus,
      width,
      height,
      visualInspected,
    ]) =>
      Object.freeze({
        id,
        code,
        title,
        audience,
        logicalRoute,
        state,
        device,
        sourceStatus,
        width,
        height,
        visualInspected,
      }),
  );
}

/** Seluruh varian sumber Stitch (snapshot 10 Oktober 2026, tema Horizon). */
export const screenRecords: readonly PreviewScreenVariant[] = Object.freeze([
  ...toRecords(accSources, "customer"),
  ...toRecords(admSources, "admin"),
  ...toRecords(autSources, "auth"),
  ...toRecords(cusSources, "customer"),
  ...toRecords(dsSources, "reference"),
  ...toRecords(edtSources, "customer"),
  ...toRecords(errSources, "public"),
  ...toRecords(gstSources, "customer"),
  ...toRecords(invSources, "invitation"),
  ...toRecords(plnSources, "customer"),
  ...toRecords(pubSources, "public"),
  ...toRecords(supSources, "customer"),
]);

/** Pilih screenshot terlebih dahulu, state default, lalu desktop; tidak mengubah metadata varian. */
function primaryVariant(variants: readonly PreviewScreenVariant[]): PreviewScreenVariant {
  const priority = (variant: PreviewScreenVariant) =>
    (variant.sourceStatus === "screenshot" ? 100 : 0) +
    (variant.state.startsWith("Default") ? 10 : 0) +
    (variant.device === "DESKTOP" ? 2 : variant.device === "TABLET" ? 1 : 0);
  return variants.reduce((best, candidate) =>
    priority(candidate) > priority(best) ? candidate : best,
  );
}

const groups = new Map<string, PreviewScreenVariant[]>();
for (const record of screenRecords) {
  const variants = groups.get(record.code) ?? [];
  variants.push(record);
  groups.set(record.code, variants);
}

/** Whitelist 55 kode; variants menyimpan seluruh sumber tanpa menduplikasi URL layar. */
export const previewScreens: readonly PreviewScreen[] = Object.freeze(
  Array.from(groups.values(), (variants) =>
    Object.freeze({
      ...primaryVariant(variants),
      variants: Object.freeze(variants),
    }),
  ),
);
const screenByCode = new Map(previewScreens.map((screen) => [screen.code, screen]));
const variantById = new Map(screenRecords.map((record) => [record.id, record]));

/** Menerima kode ASCII huruf besar/kecil; tidak mendecode URL atau membangun path/dynamic import. */
export function getPreviewScreen(code: string): PreviewScreen | undefined {
  if (!/^[A-Za-z]{2,3}-\d{2,3}$/.test(code)) return undefined;
  return screenByCode.get(code.toUpperCase());
}

/** Opsional untuk selector state/perangkat; ID harus ada di snapshot statis. */
export function getPreviewVariant(id: string): PreviewScreenVariant | undefined {
  return variantById.get(id);
}

export const previewSourceGaps = Object.freeze([
  { code: "CUS-01", reason: "Screenshot desktop belum valid; referensi mobile/tablet tersedia." },
  { code: "CUS-02", reason: "Screenshot desktop belum valid; metadata saja." },
]);

/*
 * Navigasi Preview Studio: urutan kode per domain agar pengguna dapat berjalan
 * maju/mundur tanpa kembali ke galeri. Domain mengikuti awalan kode (PUB, EDT, dst.).
 */
const domainScreens = new Map<string, string[]>();
for (const screen of [...previewScreens].sort((a, b) => a.code.localeCompare(b.code))) {
  const domain = screen.code.split("-")[0];
  domainScreens.set(domain, [...(domainScreens.get(domain) ?? []), screen.code]);
}

/** Layar sebelum/sesudah dalam domain yang sama; undefined pada ujung urutan. */
export function getPreviewNeighbors(code: string): Readonly<{
  previous?: string;
  next?: string;
  domain: string;
  index: number;
  total: number;
}> {
  const domain = code.toUpperCase().split("-")[0];
  const list = domainScreens.get(domain) ?? [];
  const index = list.indexOf(code.toUpperCase());
  return Object.freeze({
    previous: index > 0 ? list[index - 1] : undefined,
    next: index >= 0 && index < list.length - 1 ? list[index + 1] : undefined,
    domain,
    index: index >= 0 ? index + 1 : 0,
    total: list.length,
  });
}
