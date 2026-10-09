"use client";
import { useEffect, useState } from "react";
import { useAccountResource } from "../hooks/use-account-resource";
import type { SecurityDto } from "../types/account-contracts";
import { ReauthenticationPanel } from "./reauthentication-panel";
import { PasswordSettings } from "./password-settings";
import { GoogleSettings } from "./google-settings";
import { ContactSettings } from "./contact-settings";
import { SmsOtpSettings } from "./sms-otp-settings";
import { SessionList } from "./session-list";
export function SecuritySettings() {
  const resource = useAccountResource<SecurityDto>("/api/account/security");
  const [revision, setRevision] = useState(0);
  async function refresh() {
    await resource.refresh();
    setRevision((value) => value + 1);
  }
  const [now, setNow] = useState(0);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);
  const security = resource.data;
  const proved = Boolean(
    security?.reauthenticatedUntil &&
    now &&
    new Date(security.reauthenticatedUntil).getTime() > now,
  );
  return (
    <div className="stack">
      <header>
        <p className="eyebrow">AKUN ANDA</p>
        <h1>Keamanan</h1>
        <p className="muted">Metode masuk dan perangkat Anda.</p>
      </header>
      {resource.loading && !security && <p role="status">Memuat keamanan…</p>}
      {resource.error && <p role="alert">{resource.error}</p>}
      {security && (
        <>
          <ReauthenticationPanel security={security} proved={proved} refresh={refresh} />
          <div className="account-security-grid">
            <div className="stack">
              <PasswordSettings security={security} proved={proved} refresh={refresh} />
              <GoogleSettings security={security} proved={proved} refresh={refresh} />
            </div>
            <ContactSettings security={security} proved={proved} refresh={refresh} />
          </div>
          <SmsOtpSettings security={security} proved={proved} refresh={refresh} />
          <SessionList proved={proved} revision={revision} refresh={refresh} />
        </>
      )}
    </div>
  );
}
