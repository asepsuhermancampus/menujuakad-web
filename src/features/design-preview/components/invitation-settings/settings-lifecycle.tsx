"use client";
import { useRef, useState } from "react";
import { LocalPreviewForm } from "@/components/shared/local-preview-form";
import { invitationSettingsFixture } from "../../data/invitation-preview-fixtures";
import styles from "../invitation-customer-preview.module.css";
export function SettingsLifecycle() {
  const dialog = useRef<HTMLDialogElement>(null);
  const confirmationInput = useRef<HTMLInputElement>(null);
  const [action, setAction] = useState<"archive" | "delete">("archive");
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const [archiveUntil, setArchiveUntil] = useState<string>(
    invitationSettingsFixture.exampleArchiveUntil,
  );
  const label = action === "archive" ? "Arsipkan" : "Hapus";
  function openConfirmation(nextAction: "archive" | "delete") {
    setAction(nextAction);
    setConfirmation("");
    dialog.current?.showModal();
    confirmationInput.current?.focus();
  }
  return (
    <section className={styles.card} aria-labelledby="settings-lifecycle-heading">
      <h2 id="settings-lifecycle-heading">Masa Aktif & Arsip Berkas</h2>
      <p>Simulasi siklus hidup undangan; tidak mengubah masa aktif paket atau penyimpanan nyata.</p>
      <div className={styles.inset}>
        <strong>Draf contoh · Belum diterbitkan</strong>
        <p>Masa arsip ilustratif sampai {archiveUntil}.</p>
        <button
          type="button"
          className="button secondary"
          onClick={() => {
            setArchiveUntil("2028-12-12");
            setMessage(
              "Masa arsip contoh diperpanjang lokal. Tidak ada pembelian atau perubahan paket.",
            );
          }}
        >
          Perpanjang Arsip Contoh
        </button>
      </div>
      <h3 className={styles.error}>Tindakan Berbahaya · simulasi lokal</h3>
      <div className={styles.lifecycleRow}>
        <div>
          <strong>Arsipkan Undangan Ini</strong>
          <p>Uji state arsip. Fixture dan undangan nyata tetap utuh.</p>
        </div>
        <button
          type="button"
          className="button secondary"
          onClick={() => openConfirmation("archive")}
        >
          Arsipkan Contoh
        </button>
      </div>
      <div className={`${styles.lifecycleRow} ${styles.dangerRow}`}>
        <div>
          <strong>Hapus Undangan Permanen</strong>
          <p>Hanya simulasi konfirmasi penghapusan. Tidak menghapus data apa pun.</p>
        </div>
        <button
          type="button"
          className={styles.dangerButton}
          onClick={() => openConfirmation("delete")}
        >
          Uji Hapus Contoh
        </button>
      </div>
      <p role="status">{message}</p>
      <dialog ref={dialog} className={styles.dialog} aria-labelledby="lifecycle-dialog-heading">
        <h2 id="lifecycle-dialog-heading">{label} contoh lokal?</h2>
        <p>
          Ketik KONFIRMASI untuk menguji aksi ini. Tidak ada data layanan yang diubah atau dihapus.
        </p>
        <LocalPreviewForm
          className={styles.stack}
          onSubmit={() => {
            if (confirmation !== "KONFIRMASI") return;
            setMessage(
              `${label} contoh dikonfirmasi lokal. Tidak ada data yang berubah di server.`,
            );
            dialog.current?.close();
          }}
        >
          <label>
            Konfirmasi simulasi
            <input
              ref={confirmationInput}
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              autoComplete="off"
            />
          </label>
          <div className={styles.toolbar}>
            <button
              className="button secondary"
              type="button"
              onClick={() => dialog.current?.close()}
            >
              Batal
            </button>
            <button className="button" type="submit" disabled={confirmation !== "KONFIRMASI"}>
              Konfirmasi {label.toLowerCase()} contoh
            </button>
          </div>
        </LocalPreviewForm>
      </dialog>
    </section>
  );
}
