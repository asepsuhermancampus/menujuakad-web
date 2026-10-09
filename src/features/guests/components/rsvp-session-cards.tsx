import { rsvpSessionFixtures } from "@/features/design-preview/data/rsvp-session-fixtures";
import styles from "../rsvp-preview.module.css";
export function RsvpSessionCards() {
  return (
    <section aria-labelledby="session-attendance-heading">
      <div className={styles.sectionHeading}>
        <div>
          <h2 id="session-attendance-heading">Distribusi Kehadiran Sesi Acara</h2>
          <p>
            Alokasi dan kapasitas sintetis. Satu tamu dapat mengikuti dua sesi; jangan menjumlahkan
            sesi sebagai tamu unik.
          </p>
        </div>
        <span className="badge">Orang contoh · bukan terverifikasi</span>
      </div>
      <div className={styles.twoColumns}>
        {rsvpSessionFixtures.map((session, index) => {
          const people = session.attendees.reduce((sum, attendee) => sum + attendee.partySize, 0);
          const percent = Math.round((people / session.exampleCapacity) * 100);
          return (
            <article className={`card ${styles.sessionCard}`} key={session.eventId}>
              <header className={styles.sectionHeading}>
                <div>
                  <p className="eyebrow">SESI {String(index + 1).padStart(2, "0")} · CONTOH</p>
                  <h3>{session.title}</h3>
                </div>
                <span className="badge">{percent}% terisi · simulasi</span>
              </header>
              <p>
                {session.timeLabel} · Kapasitas contoh: {session.exampleCapacity} orang
              </p>
              <div className={styles.capacity}>
                <strong>{people} orang pada sesi</strong>
                <span>Sisa {session.exampleCapacity - people} tempat contoh</span>
              </div>
              <progress
                value={people}
                max={session.exampleCapacity}
                aria-label={`Kapasitas contoh ${session.title}`}
              />
              <div className={styles.inset}>
                <strong>{index === 0 ? "Alokasi Sesi Akad" : "Alokasi Sesi Resepsi"}</strong>
                <p>
                  {index === 0
                    ? "24 tamu hadir pertama dialokasikan pada sesi akad contoh."
                    : "Semua 68 tamu berstatus hadir dialokasikan pada resepsi contoh."}{" "}
                  Tidak mengatur kursi atau konsumsi nyata.
                </p>
              </div>
              <dl className={styles.details}>
                <div>
                  <dt>Kontak contoh di sesi</dt>
                  <dd>{session.attendees.length}</dd>
                </div>
                <div>
                  <dt>Party size fixture</dt>
                  <dd>1 orang per kontak</dd>
                </div>
              </dl>
            </article>
          );
        })}
      </div>
    </section>
  );
}
