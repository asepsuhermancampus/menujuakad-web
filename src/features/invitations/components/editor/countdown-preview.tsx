import type { EditorDraft } from "../../lib/editor-draft";
import { countdownDuration } from "../../lib/countdown";
export function CountdownPreview({ draft }: { draft: EditorDraft }) {
  const duration = countdownDuration(draft.countdownDate);
  return (
    <div
      className={`duration-preview duration-${draft.countdownStyle.toLowerCase()}`}
      data-countdown-style={draft.countdownStyle}
    >
      <h2>Menuju Hari Bahagia</h2>
      {duration.state === "INVALID" ? (
        <p>Tanggal acuan belum valid.</p>
      ) : duration.state === "REACHED" ? (
        <p>{draft.countdownZeroText}</p>
      ) : (
        <div className="duration-parts" aria-label="Durasi contoh deterministik">
          {[
            [duration.days, "Hari"],
            [duration.hours, "Jam"],
            [duration.minutes, "Menit"],
            [duration.seconds, "Detik"],
          ].map(([value, label]) => (
            <span key={label}>
              <strong>{value}</strong> {label}
            </span>
          ))}
        </div>
      )}
      <small>Clock contoh tetap: 7 Oktober 2026, 15.00 WIB.</small>
      <p>{draft.countdownDate.replace("T", " · ")} WIB</p>
      <small>
        {draft.countdownEnabled === "true"
          ? "Tampil pada simulasi"
          : "Disembunyikan pada pengaturan contoh"}
      </small>
    </div>
  );
}
