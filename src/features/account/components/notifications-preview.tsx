"use client";
import { useNotificationsPreview } from "../hooks/use-notifications-preview";
export function NotificationsPreview() {
  const state = useNotificationsPreview();
  const filtered = state.notifications.filter((item) => state.filter === "ALL" || !item.read);
  return (
    <>
      <div className="workspace-title">
        <div>
          <p className="eyebrow">KABAR UNTUK KALIAN</p>
          <h1>Notifikasi</h1>
          <p>Ringkasan aktivitas pada data contoh.</p>
        </div>
        <button className="button secondary" onClick={() => state.mark()}>
          Tandai semua dibaca lokal
        </button>
      </div>
      <div className="tabs">
        {[
          ["ALL", "Semua"],
          ["UNREAD", "Belum Dibaca"],
        ].map(([id, label]) => (
          <button key={id} aria-pressed={state.filter === id} onClick={() => state.setFilter(id)}>
            {label}
          </button>
        ))}
      </div>
      <div className="notifications-layout">
        <section className="section">
          <article className="card">
            {filtered.map((item) => (
              <div className="notification-card" key={item.id}>
                <div className="section-heading">
                  <h3>{item.title}</h3>
                  <span className="badge">{item.read ? "Dibaca" : "Baru"}</span>
                </div>
                <p>{item.description}</p>
                {!item.read && (
                  <button className="button secondary" onClick={() => state.mark(item.id)}>
                    Tandai dibaca
                  </button>
                )}
              </div>
            ))}
            {!filtered.length && <p role="status">Semua notifikasi contoh sudah dibaca.</p>}
          </article>
        </section>
        <article className="card stack">
          <h2>Preferensi Notifikasi</h2>
          {[
            ["invitationUpdates", "Pembaruan undangan"],
            ["rsvpUpdates", "Respons RSVP"],
            ["billingUpdates", "Informasi billing"],
            ["emailUpdates", "Email contoh"],
          ].map(([key, label]) => (
            <label className="check" key={key}>
              <input
                type="checkbox"
                checked={state.preferences[key]}
                onChange={(e) => state.togglePreference(key, e.target.checked)}
              />
              {label}
            </label>
          ))}
        </article>
      </div>
      {state.message && (
        <p className="local-message" role="status">
          {state.message}
        </p>
      )}
    </>
  );
}
