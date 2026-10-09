"use client";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import type { BillingDraft } from "./contracts";
import { formatTestIdr, qrisWarning } from "./contracts";
import { useBillingMutation } from "./use-billing-mutation";
import styles from "./billing-actual.module.css";
export function TestRequestForm({
  drafts,
  packages,
}: {
  drafts: BillingDraft[];
  packages: readonly { slug: string; name: string; amountIdr: number }[];
}) {
  const mutation = useBillingMutation();
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    void mutation.mutate("/api/billing/test-requests", "POST", {
      invitationId: data.get("invitationId"),
      packageSlug: data.get("packageSlug"),
      reference: data.get("reference") || undefined,
    });
  }
  return (
    <form className="card stack" onSubmit={submit}>
      <fieldset className="stack" disabled={mutation.pending}>
        <legend>Permintaan QRIS pengujian</legend>
        <label>
          Draft privat milik Anda
          <select name="invitationId" required>
            {drafts.map((draft) => (
              <option key={draft.id} value={draft.id}>
                {draft.title}
              </option>
            ))}
          </select>
        </label>
        <fieldset className="stack">
          <legend>Pilih nominal uji, bukan paket komersial</legend>
          <div className={styles.packages}>
            {packages.map((item, index) => (
              <label className={`card ${styles.package}`} key={item.slug}>
                <input
                  type="radio"
                  name="packageSlug"
                  value={item.slug}
                  defaultChecked={index === 0}
                  required
                />
                <span>
                  <strong>{item.name}</strong>
                  <span className={styles.amount}>{formatTestIdr(item.amountIdr)}</span>
                  <small>Nominal uji · tanpa fitur atau masa aktif berbayar</small>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <label>
          Catatan pengujian (opsional)
          <input
            name="reference"
            maxLength={160}
            placeholder="Deklarasi Anda, bukan bukti pembayaran"
          />
        </label>
        <p className={styles.warning}>{qrisWarning}</p>
        <label className={styles.consent}>
          <input type="checkbox" required />
          <span>
            Saya memahami risiko dana nyata dan bahwa persetujuan manual hanya untuk pengujian.
          </span>
        </label>
        <p>
          Request tersimpan untuk review admin. Tidak ada pemeriksaan saldo, invoice, webhook atau
          penerbitan undangan. Satu request pending per draft; submit berulang membuka request yang
          sama.
        </p>
        <Button type="submit">{mutation.pending ? "Menyimpan…" : "Buat permintaan uji"}</Button>
      </fieldset>
      {mutation.message && <p role={mutation.failed ? "alert" : "status"}>{mutation.message}</p>}
    </form>
  );
}
