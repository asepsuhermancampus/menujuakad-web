"use client";
import Link from "next/link";
import { useState } from "react";
import { LocalPreviewForm } from "@/components/shared/local-preview-form";
import { invitationSettingsFixture } from "../data/invitation-preview-fixtures";
import { validatePreviewSlug, validPreviewPasscode } from "../lib/invitation-settings-preview";
import { SettingsDomain } from "./invitation-settings/settings-domain";
import { SettingsCalendar } from "./invitation-settings/settings-calendar";
import { SettingsPrivacy } from "./invitation-settings/settings-privacy";
import { SettingsLifecycle } from "./invitation-settings/settings-lifecycle";
import styles from "./invitation-customer-preview.module.css";
export function InvitationSettingsPreview() {
  const [slug, setSlug] = useState<string>(invitationSettingsFixture.slug);
  const [timeZone, setTimeZone] = useState<string>(invitationSettingsFixture.timeZone);
  const [locale, setLocale] = useState<string>(invitationSettingsFixture.calendarLocale);
  const [noindex, setNoindex] = useState(true);
  const [moderation, setModeration] = useState(true);
  const [passcodeEnabled, setPasscodeEnabled] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [message, setMessage] = useState("");
  const slugError = validatePreviewSlug(slug);
  const passcodeValid = !passcodeEnabled || validPreviewPasscode(passcode);
  return (
    <div className={`${styles.settings} ${styles.stack}`}>
      <nav aria-label="Navigasi pengaturan" className={styles.toolbar}>
        <Link href="/preview-ui/cus-04">Ringkasan Undangan</Link>
        <span>/ Pengaturan</span>
        <Link className="button secondary" href="/preview-ui/cus-05">
          Pratinjau Undangan
        </Link>
      </nav>
      <p className="eyebrow">KONFIGURASI & HAK AKSES · DATA CONTOH</p>
      <LocalPreviewForm
        className={styles.stack}
        onSubmit={() => {
          if (slugError || !passcodeValid) {
            setMessage("Periksa format slug dan PIN uji sebelum menyimpan contoh.");
            return;
          }
          setMessage(
            "Perubahan contoh diterapkan lokal sampai halaman dimuat ulang. Tidak tersimpan di database.",
          );
        }}
      >
        <header className={styles.heading}>
          <div>
            <h1>Pengaturan Undangan</h1>
            <p>Kelola alamat tautan, zona waktu, privasi, dan masa aktif berkas contoh.</p>
          </div>
          <button className="button" type="submit">
            Simpan Perubahan Contoh
          </button>
        </header>
        <p className="notice" role="status">
          {message || "Belum disimpan. Semua pengaturan hanya lokal; tidak ada autosave database."}
        </p>
        <SettingsDomain slug={slug} onChange={setSlug} error={slugError} />
        <SettingsCalendar
          timeZone={timeZone}
          locale={locale}
          onTimeZone={setTimeZone}
          onLocale={setLocale}
        />
        <SettingsPrivacy
          passcodeEnabled={passcodeEnabled}
          passcode={passcode}
          noindex={noindex}
          moderation={moderation}
          onPasscodeEnabled={setPasscodeEnabled}
          onPasscode={setPasscode}
          onNoindex={setNoindex}
          onModeration={setModeration}
        />
        {!passcodeValid && (
          <p className={styles.error} role="alert">
            PIN uji harus berisi tepat 4 digit.
          </p>
        )}
      </LocalPreviewForm>
      <SettingsLifecycle />
    </div>
  );
}
