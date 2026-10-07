/** Metadata UI publik; tidak menyatakan autentikasi atau fitur backend tersedia. */
export type PreviewAudience = "public" | "auth" | "customer" | "admin" | "invitation" | "reference";
export type PreviewDevice = "DESKTOP" | "MOBILE" | "TABLET";
export type PreviewSourceStatus = "screenshot" | "metadata-only" | "reconstruction";
export type PreviewScreenVariant = Readonly<{
  id: string;
  code: string;
  title: string;
  audience: PreviewAudience;
  logicalRoute: string;
  state: string;
  device: PreviewDevice;
  sourceStatus: PreviewSourceStatus;
  width: number;
  height: number;
  visualInspected: boolean;
}>;

/** Satu kode layar, varian utama dan seluruh varian sumber terdaftar. */
export type PreviewScreen = PreviewScreenVariant &
  Readonly<{
    variants: readonly PreviewScreenVariant[];
  }>;

/** Tuple snapshot build-time, tanpa URL ekspor, path lokal, atau data provider. */
export type SourceScreenTuple = readonly [
  id: string,
  code: string,
  title: string,
  logicalRoute: string,
  state: string,
  device: PreviewDevice,
  sourceStatus: PreviewSourceStatus,
  width: number,
  height: number,
  visualInspected: boolean,
];
