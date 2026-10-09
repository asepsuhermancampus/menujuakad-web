"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { authRequest } from "@/features/auth/lib/auth-client";
import { useAuthRequest } from "@/features/auth/hooks/use-auth-request";
import { useAccountResource } from "../hooks/use-account-resource";
import type { ProfileDto } from "../types/account-contracts";
export function ProfileForm() {
  const resource = useAccountResource<ProfileDto>("/api/account/profile");
  const state = useAuthRequest();
  const profile = resource.data;
  return (
    <div className="stack">
      <header>
        <p className="eyebrow">AKUN ANDA</p>
        <h1>Profil</h1>
        <p className="muted">Informasi pribadi dan kontak Anda.</p>
      </header>
      {resource.loading && <p role="status">Memuat profil…</p>}
      {resource.error && <p role="alert">{resource.error}</p>}
      {profile && (
        <>
          <section className="card stack">
            <form
              className="stack"
              method="post"
              onSubmit={(e) => {
                e.preventDefault();
                const name = String(new FormData(e.currentTarget).get("name") ?? "").trim();
                if (!name) {
                  state.setMessage("Masukkan nama lengkap.");
                  return;
                }
                void state.run(async () => {
                  await authRequest("/api/account/profile", "PATCH", { name });
                  await resource.refresh();
                  state.setSuccess("Profil disimpan.");
                });
              }}
            >
              <fieldset
                className="auth-fields stack"
                disabled={!state.ready || state.pending || state.rateLimited}
              >
                <label>
                  Nama lengkap
                  <input
                    key={profile.name}
                    name="name"
                    defaultValue={profile.name ?? ""}
                    autoComplete="name"
                    maxLength={100}
                    required
                  />
                </label>
                <Button type="submit" disabled={!state.ready || state.pending || state.rateLimited}>
                  {state.pending ? "Menyimpan…" : "Simpan perubahan"}
                </Button>
              </fieldset>
            </form>
            {state.message && <p role={state.failed ? "alert" : "status"}>{state.message}</p>}
          </section>
          <section className="card stack">
            <h2>Kontak</h2>
            <p>
              Email: <strong>{profile.email ?? "Belum ditambahkan"}</strong>
              {profile.email && (
                <small> · {profile.emailVerified ? "Terverifikasi" : "Belum terverifikasi"}</small>
              )}
            </p>
            <p>
              Telepon: <strong>{profile.phone ?? "Belum ditambahkan"}</strong>
              {profile.phone && (
                <small> · {profile.phoneVerified ? "Terverifikasi" : "Belum terverifikasi"}</small>
              )}
            </p>
            <Link href="/account/security">Kelola kontak & metode masuk</Link>
          </section>
        </>
      )}
    </div>
  );
}
