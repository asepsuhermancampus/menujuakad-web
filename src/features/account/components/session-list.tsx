"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { authRequest } from "@/features/auth/lib/auth-client";
import { useAuthRequest } from "@/features/auth/hooks/use-auth-request";
import { useAccountResource } from "../hooks/use-account-resource";
import type { SessionDto } from "../types/account-contracts";
function date(value: string | null) {
  if (!value) return "—";
  const time = new Date(value);
  return Number.isNaN(time.getTime()) ? "—" : time.toLocaleString("id-ID");
}
export function SessionList({
  proved,
  revision = 0,
  refresh,
}: {
  proved: boolean;
  revision?: number;
  refresh: () => Promise<void>;
}) {
  const router = useRouter();
  const resource = useAccountResource<{ sessions: SessionDto[] }>("/api/account/sessions");
  const state = useAuthRequest();
  const refreshSessions = resource.refresh;
  useEffect(() => {
    if (revision) void refreshSessions();
  }, [revision, refreshSessions]);
  async function reload() {
    await resource.refresh();
    await refresh();
  }
  return (
    <section className="card stack">
      <h2>Perangkat & sesi</h2>
      {resource.loading && <p role="status">Memuat sesi…</p>}
      {resource.error && <p role="alert">{resource.error}</p>}
      {resource.data?.sessions.map((session) => (
        <article className="account-session stack" key={session.id}>
          <strong>
            {session.deviceLabel || "Perangkat"}
            {session.current ? " · Saat ini" : ""}
          </strong>
          <small className="muted">
            Aktif: {date(session.lastSeenAt)} · Berakhir: {date(session.expiresAt)}
          </small>
          <Button
            type="button"
            className="outline"
            disabled={
              !state.ready || state.pending || state.rateLimited || (!session.current && !proved)
            }
            onClick={() =>
              void state.run(async () => {
                if (!session.current && !proved) return;
                await authRequest(
                  `/api/account/sessions/${encodeURIComponent(session.id)}`,
                  "DELETE",
                );
                if (session.current) {
                  router.replace("/login");
                  router.refresh();
                } else await reload();
              })
            }
          >
            {session.current ? "Keluar dari perangkat ini" : "Akhiri sesi"}
          </Button>
        </article>
      ))}
      <Button
        type="button"
        className="outline"
        disabled={
          !state.ready ||
          state.pending ||
          state.rateLimited ||
          !proved ||
          !resource.data?.sessions.some((s) => !s.current)
        }
        onClick={() =>
          void state.run(async () => {
            if (!proved) return;
            await authRequest("/api/account/sessions/revoke-others", "POST", {});
            await reload();
            state.setSuccess("Sesi lain telah diakhiri.");
          })
        }
      >
        Keluar dari perangkat lain
      </Button>
      {state.message && <p role={state.failed ? "alert" : "status"}>{state.message}</p>}
    </section>
  );
}
