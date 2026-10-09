import { previewCalendarDate } from "../../lib/invitation-settings-preview";
import styles from "../invitation-customer-preview.module.css";
export function SettingsCalendar({
  timeZone,
  locale,
  onTimeZone,
  onLocale,
}: {
  timeZone: string;
  locale: string;
  onTimeZone: (value: string) => void;
  onLocale: (value: string) => void;
}) {
  return (
    <section className={styles.card} aria-labelledby="settings-calendar-heading">
      <h2 id="settings-calendar-heading">Zona Waktu & Format Kalender</h2>
      <p>
        Format tanggal ilustratif untuk kalender digital. Tidak membuat undangan Google Calendar
        atau iCal nyata.
      </p>
      <div className={styles.twoColumns}>
        <label>
          Zona Waktu Prosesi
          <select value={timeZone} onChange={(event) => onTimeZone(event.target.value)}>
            <option value="Asia/Jakarta">WIB · UTC+7</option>
            <option value="Asia/Makassar">WITA · UTC+8</option>
            <option value="Asia/Jayapura">WIT · UTC+9</option>
          </select>
          <small>Tanggal contoh: 12 Desember 2026.</small>
        </label>
        <fieldset className={styles.choiceGroup}>
          <legend>Format Tanggal & Nomenklatur</legend>
          {[
            ["id-ID", "Format Indonesia Baku"],
            ["en-US", "Format Internasional"],
          ].map(([value, title]) => (
            <label className={styles.radioChoice} key={value}>
              <input
                type="radio"
                name="calendar-format"
                value={value}
                checked={locale === value}
                onChange={() => onLocale(value)}
              />
              <span>
                <strong>{title}</strong>
                <small>{previewCalendarDate(timeZone, value)}</small>
              </span>
            </label>
          ))}
        </fieldset>
      </div>
    </section>
  );
}
