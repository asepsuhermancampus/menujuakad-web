import type { PackagePreviewDto } from "@/features/design-preview/data/fixtures";
import { formatIdr } from "../../lib/presentation";

export function PackageCard({
  plan,
  selected,
  onSelect,
}: {
  plan: PackagePreviewDto;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <article className={`billing-package ${plan.recommended ? "billing-recommended" : ""}`}>
      {plan.recommended && <span className="billing-ribbon">☆ Rekomendasi contoh</span>}
      <span className="badge">{selected ? "Pilihan lokal" : "Paket contoh"}</span>
      <h2>{plan.name}</h2>
      <p className="billing-muted">Ruang untuk merangkai kisah dan menyambut tamu.</p>
      <p className="billing-price">{formatIdr(plan.amountIdr)}</p>
      <p>{plan.priceLabel}</p>
      <ul>
        {plan.features.map((feature) => (
          <li key={feature}>{feature}</li>
        ))}
        <li>{plan.guestLimit} tamu contoh</li>
        <li>{plan.galleryLimit} foto contoh</li>
      </ul>
      <button type="button" className="button" aria-pressed={selected} onClick={onSelect}>
        Pilih {plan.name}
      </button>
    </article>
  );
}
