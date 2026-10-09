"use client";
import Link from "next/link";
import { useState } from "react";
import { invitationFixture } from "../data/invitations-fixtures";
import { previewGuestOptions, previewViewports } from "../data/invitation-preview-fixtures";
import { InvitationPreviewFrame } from "./invitation-preview-frame";
import { InvitationReadinessInspector } from "./invitation-readiness-inspector";
import styles from "./invitation-customer-preview.module.css";
export function InvitationCustomerPreview() {
  const [viewport, setViewport] = useState<(typeof previewViewports)[number]>(previewViewports[0]);
  const [zoom, setZoom] = useState(100);
  const [guestId, setGuestId] = useState<string>(previewGuestOptions[0].id);
  const [partySize, setPartySize] = useState(2);
  const [message, setMessage] = useState("");
  const guest =
    previewGuestOptions.find((option) => option.id === guestId) ?? previewGuestOptions[0];
  async function copyTestLink() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/preview-ui/cus-05`);
      setMessage(
        "Tautan halaman uji disalin. Pilihan tamu dan kuota hanya lokal, tidak ikut dalam tautan.",
      );
    } catch {
      setMessage(
        "Salin alamat halaman ini melalui bilah alamat browser. Tautan hanya membuka preview contoh.",
      );
    }
  }
  return (
    <main id="main" className={styles.preview}>
      <header className={styles.previewToolbar}>
        <Link className="button secondary" href="/preview-ui/cus-04">
          ← Ringkasan
        </Link>
        <Link href="/preview-ui/edt-01">Studio Editor</Link>
        <div>
          <h1>{invitationFixture.title} — Pratinjau Undangan</h1>
          <small>Stasioneri digital · data contoh</small>
        </div>
        <div className={styles.deviceChoices} role="group" aria-label="Lebar perangkat simulasi">
          {previewViewports.map((option) => (
            <button
              type="button"
              key={option.id}
              aria-pressed={viewport.id === option.id}
              onClick={() => setViewport(option)}
            >
              {option.label}
              <small>({option.width}px)</small>
            </button>
          ))}
        </div>
        <label className={styles.zoom}>
          Zoom
          <select value={zoom} onChange={(event) => setZoom(Number(event.target.value))}>
            {[50, 75, 100, 125].map((value) => (
              <option key={value} value={value}>
                {value}%
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="button secondary" onClick={copyTestLink}>
          Salin Tautan Uji
        </button>
        <Link className={`button ${styles.goldButton}`} href="/preview-ui/cus-07">
          Lihat Paket Contoh
        </Link>
      </header>
      <div className={styles.readinessBar}>
        <span>1 konfigurasi tertunda: batas waktu RSVP</span>
        <span>Draf contoh · belum disimpan ke layanan</span>
      </div>
      <p role="status" className={styles.copyStatus}>
        {message}
      </p>
      <div className={styles.previewBody}>
        <section className={styles.stage} aria-label="Kanvas uji undangan">
          <p className={styles.stageHint}>
            Mode interaksi aktif · lebar kontainer {viewport.width}px · zoom {zoom}%
          </p>
          <p className={styles.hint}>
            Gulir kanvas bila lebar simulasi melebihi layar. Ini uji reflow kontainer, bukan
            emulator perangkat.
          </p>
          <div
            className={styles.stageScroll}
            tabIndex={0}
            aria-label="Kanvas perangkat dapat digulir"
          >
            <InvitationPreviewFrame
              width={viewport.width}
              zoom={zoom}
              guestName={guest.displayName}
              partySize={partySize}
            />
          </div>
          <p className={styles.hint}>
            Watermark draf tetap terlihat. Preview ini tidak menerbitkan undangan.
          </p>
        </section>
        <InvitationReadinessInspector
          guestId={guestId}
          partySize={partySize}
          onGuest={(value) => {
            setGuestId(value);
            setPartySize(1);
          }}
          onParty={setPartySize}
        />
      </div>
    </main>
  );
}
