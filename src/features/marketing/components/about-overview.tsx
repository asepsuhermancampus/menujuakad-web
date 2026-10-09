import { FloralArt } from "@/components/shared/floral-art";
import { CallToAction } from "@/features/marketing/components/call-to-action";
export function AboutOverview() {
  return (
    <section>
      <section className="container section cta">
        <p className="eyebrow">TENTANG MENUJU AKAD</p>
        <h1>
          Mengembalikan Kesakralan
          <br />
          dalam Setiap Detil Digital
        </h1>
        <p>Ruang yang tenang untuk membagikan cerita dan merayakan sebuah awal.</p>
      </section>
      <section className="container section grid-three">
        {[
          ["Kehangatan", "Undangan yang terasa dekat dan personal."],
          ["Kerapian", "Informasi penting dalam komposisi yang mudah dibaca."],
          ["Makna", "Setiap detail membantu menyampaikan cerita kalian."],
        ].map(([t, p]) => (
          <article className="card" key={t}>
            <h2>{t}</h2>
            <p>{p}</p>
          </article>
        ))}
      </section>
      <section className="container section grid-two">
        <div>
          <p className="eyebrow">FILOSOFI DESAIN</p>
          <h2>
            Quiet Luxury,
            <br />
            Cerita yang Personal
          </h2>
          <p>
            Tipografi editorial, ruang yang lapang, dan aksen ivory serta emas menjadi dasar
            pengalaman Menuju Akad.
          </p>
        </div>
        <FloralArt />
      </section>
      <CallToAction />
    </section>
  );
}
