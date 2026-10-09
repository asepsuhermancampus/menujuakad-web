"use client";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { authRequest } from "@/features/auth/lib/auth-client";
import { useAuthRequest } from "@/features/auth/hooks/use-auth-request";
import { useAccountResource } from "../hooks/use-account-resource";
import type { ProfileDto, SecurityDto } from "../types/account-contracts";
export function ContactRemoval({
  security,
  proved,
  refresh,
}: {
  security: SecurityDto;
  proved: boolean;
  refresh: () => Promise<void>;
}) {
  const resource = useAccountResource<ProfileDto>("/api/account/profile");
  const state = useAuthRequest();
  const refreshProfile = resource.refresh;
  useEffect(() => {
    void refreshProfile();
  }, [security, refreshProfile]);
  async function remove(channel: "email" | "phone") {
    if (!proved) return;
    await authRequest(`/api/account/${channel}/unlink`, "POST", {});
    await resource.refresh();
    await refresh();
    state.setSuccess("Kontak dilepas.");
  }
  return (
    <div className="stack">
      {resource.error && <p role="alert">{resource.error}</p>}
      {resource.data?.email && (
        <div className="stack">
          <small>
            Email: {resource.data.email} ·{" "}
            {security.emailVerified ? "Terverifikasi" : "Belum terverifikasi"}
          </small>
          <Button
            type="button"
            className="outline"
            disabled={
              !state.ready ||
              state.pending ||
              state.rateLimited ||
              !proved ||
              !(security.googleLinked || (security.hasPassword && security.phoneVerified))
            }
            onClick={() => void state.run(() => remove("email"))}
          >
            Lepas email
          </Button>
        </div>
      )}
      {resource.data?.phone && (
        <div className="stack">
          <small>
            Telepon: {resource.data.phone} ·{" "}
            {security.phoneVerified ? "Terverifikasi" : "Belum terverifikasi"}
          </small>
          <Button
            type="button"
            className="outline"
            disabled={
              !state.ready ||
              state.pending ||
              state.rateLimited ||
              !proved ||
              !(security.googleLinked || (security.hasPassword && security.emailVerified))
            }
            onClick={() => void state.run(() => remove("phone"))}
          >
            Lepas telepon
          </Button>
        </div>
      )}
      {!security.googleLinked &&
        (!security.hasPassword || !(security.emailVerified && security.phoneVerified)) && (
          <small className="muted">Metode terakhir tetap dipertahankan.</small>
        )}
      {state.message && <p role={state.failed ? "alert" : "status"}>{state.message}</p>}
    </div>
  );
}
