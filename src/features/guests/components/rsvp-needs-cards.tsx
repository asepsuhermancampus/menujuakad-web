import { guestNeedsFixture } from "@/features/design-preview/data/rsvp-session-fixtures";
import styles from "../rsvp-preview.module.css";
export function RsvpNeedsCards() {
  return (
    <section aria-labelledby="guest-needs-heading">
      <h2 id="guest-needs-heading">Catatan Khusus & Preferensi Tamu</h2>
      <p>Kebutuhan agregat buatan untuk ilustrasi logistik.</p>
      <div className={styles.twoColumns}>
        {guestNeedsFixture.map((need) => (
          <article className={`card ${styles.needsCard}`} key={need.id}>
            <header className={styles.sectionHeading}>
              <h3>{need.title}</h3>
              <span className="badge">{need.label}</span>
            </header>
            <div className={styles.inset}>
              <strong>{need.count} kebutuhan sintetis</strong>
              <p>{need.description}</p>
            </div>
            <small>
              Detail tamu, kondisi kesehatan, dan lokasi kursi tidak tersedia pada preview.
            </small>
          </article>
        ))}
      </div>
    </section>
  );
}
