import { publicPageMetadata } from "@/config/seo";
export const metadata = publicPageMetadata(
  "/templates",
  "Katalog Desain Undangan",
  "Jelajahi katalog desain undangan pernikahan digital Menuju Akad. Tinjau ilustrasi template dan demo dengan data contoh sebelum memilih gaya kalian.",
);
import { TemplateCatalog } from "@/features/templates/components/template-catalog";
export default function Page() {
  return (
    <main id="main">
      <TemplateCatalog />
    </main>
  );
}
