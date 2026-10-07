import { FaqSection } from "@/features/marketing/components/faq-section";
export default function Page() {
  return (
    <main id="main">
      <section className="container section">
        <h1>Pusat Pertanyaan</h1>
      </section>
      <FaqSection searchable />
    </main>
  );
}
