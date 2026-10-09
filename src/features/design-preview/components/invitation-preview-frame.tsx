"use client";
import { useState } from "react";
import { InvitationSections } from "@/features/invitations/components/invitation/invitation-sections";
import { invitationFixture } from "../data/invitations-fixtures";
import styles from "./invitation-customer-preview.module.css";
/** Konten undangan shared; lebar kontainer menguji reflow, bukan emulasi hardware/browser. */
export function InvitationPreviewFrame({
  width,
  zoom,
  guestName,
  partySize,
}: {
  width: number;
  zoom: number;
  guestName: string;
  partySize: number;
}) {
  const [opened, setOpened] = useState(false);
  return (
    <div
      className={styles.frameSizer}
      style={{ width: (width * zoom) / 100, height: (740 * zoom) / 100 }}
    >
      <div className={styles.deviceFrame} style={{ width, transform: `scale(${zoom / 100})` }}>
        <div className={styles.deviceBar}>
          <span>09:41 · contoh</span>
          <span aria-hidden="true">● ▰</span>
        </div>
        <div className={styles.frameScroll} tabIndex={0} aria-label="Area gulir undangan contoh">
          <p className={styles.watermark}>PRATINJAU DRAF · DATA CONTOH</p>
          {!opened ? (
            <section className={styles.cover}>
              <p className="eyebrow">THE WEDDING OF</p>
              <span className={styles.monogram} aria-hidden="true">
                S & D
              </span>
              <h2>
                {invitationFixture.partnerOne}
                <span>&</span>
                {invitationFixture.partnerTwo}
              </h2>
              <p>“Dua hati, satu janji dalam ikatan suci pernikahan.”</p>
              <div className={styles.guestEnvelope}>
                <small>Kepada Yth. Tamu Undangan</small>
                <h3>{guestName}</h3>
                <span className="badge">Kuota uji: {partySize} orang · simulasi</span>
              </div>
              <button type="button" className="button" onClick={() => setOpened(true)}>
                Buka Undangan
              </button>
            </section>
          ) : (
            <>
              <button type="button" className="button secondary" onClick={() => setOpened(false)}>
                Kembali ke Sampul
              </button>
              <article className={`invitation-document ${styles.frameDocument}`}>
                <InvitationSections />
              </article>
            </>
          )}
          {!opened && (
            <section className={styles.cover}>
              <p className="eyebrow">WAKTU & LOKASI</p>
              <h2>Akad & Resepsi</h2>
              {invitationFixture.events.map((event) => (
                <article className={styles.inset} key={event.id}>
                  <h3>{event.title}</h3>
                  <p>{event.venue}</p>
                  <small>{event.addressLabel}</small>
                </article>
              ))}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
