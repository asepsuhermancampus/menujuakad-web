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

/** Semua 64 varian sumber, termasuk dua desktop yang hanya punya metadata. */
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

/** Whitelist 53 kode; variants menyimpan seluruh sumber tanpa menduplikasi URL layar. */
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
  { code: "CUS-05", reason: "Preview undangan belum ditemukan di snapshot Stitch." },
  { code: "CUS-06", reason: "Pengaturan undangan belum ditemukan di snapshot Stitch." },
]);
