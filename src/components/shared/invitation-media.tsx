import { FloralArt } from "./floral-art";
export type InvitationMediaKind = "EDITORIAL" | "BOTANICAL" | "MINIMAL";
/** Slot media eksplisit: ilustrasi lokal, bukan foto pasangan atau aset raster Stitch. */
export function InvitationMedia({
  kind = "EDITORIAL",
  portrait = false,
}: {
  kind?: InvitationMediaKind;
  portrait?: boolean;
}) {
  if (kind === "BOTANICAL") return <FloralArt />;
  return (
    <figure
      className={`invitation-media media-${kind.toLowerCase()} ${portrait ? "media-portrait" : ""}`}
      aria-label="Slot media ilustratif, foto pasangan belum tersedia"
    >
      <div className="media-composition" aria-hidden="true">
        {kind === "MINIMAL" ? (
          <span className="media-monogram">S · D</span>
        ) : (
          <>
            <span className="media-arch">S</span>
            <span className="media-arch">D</span>
          </>
        )}
      </div>
      <figcaption>
        {kind === "MINIMAL" ? "Monogram ilustrasi" : "Foto pasangan belum disediakan · ilustrasi"}
      </figcaption>
    </figure>
  );
}
