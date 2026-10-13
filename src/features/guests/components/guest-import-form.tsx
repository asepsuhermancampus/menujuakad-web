"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useWorkspaceMutation } from "@/features/workspace/use-workspace-mutation";
import { GUEST_CATEGORY_OPTIONS } from "../lib/guest-domain-labels";

/*
 * Impor massal NYATA: satu nama per baris ("Nama" atau "Nama;KATEGORI").
 * Baris divalidasi di klien untuk pratinjau, lalu seluruh baris valid dikirim
 * sekaligus ke PUT /api/customer/invitations/[id]/guests (satu transaksi).
 */
type Row = { name: string; category: string; valid: boolean; issue: string };

const validCategories = new Set(GUEST_CATEGORY_OPTIONS.map((option) => option.value as string));

export function parseGuestRows(text: string): Row[] {
  const seen = new Set<string>();
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [rawName = "", rawCategory = "FRIEND", ...extra] = line.split(";");
      const name = rawName.trim();
      const category = rawCategory.trim().toUpperCase();
      const key = name.toLocaleLowerCase("id");
      if (!name) return { name: "", category: "FRIEND", valid: false, issue: "Nama kosong" };
      if (name.length > 120)
        return { name, category, valid: false, issue: "Nama melebihi 120 karakter" };
      if (!validCategories.has(category))
        return { name, category, valid: false, issue: "Kategori tidak dikenal" };
      if (extra.length > 0)
        return { name, category, valid: false, issue: "Terlalu banyak kolom" };
      if (seen.has(key)) return { name, category, valid: false, issue: "Duplikat di daftar ini" };
      seen.add(key);
      return { name, category, valid: true, issue: "" };
    });
}

export function GuestImportForm({ invitationId }: { invitationId: string }) {
  const mutation = useWorkspaceMutation();
  const [text, setText] = useState("");
  const [message, setMessage] = useState("");
  const rows = parseGuestRows(text);
  const valid = rows.filter((row) => row.valid);

  function submit() {
    setMessage("");
    void mutation
      .mutate(`/api/customer/invitations/${invitationId}/guests`, "PUT", {
        guests: valid.map((row) => ({
          name: row.name,
          phone: null,
          category: row.category,
          guestCountAllowed: 1,
        })),
      })
      .then(() => {
        if (!mutation.failed) {
          setText("");
          setMessage(`${valid.length} tamu diimpor dan tersimpan di database.`);
        }
      });
  }

  return (
    <details className="card stack">
      <summary>Impor massal (satu nama per baris)</summary>
      <p className="billing-muted">
        Format: <code>Nama</code> atau <code>Nama;KATEGORI</code>. Kategori: FAMILY, FRIEND, WORK,
        VIP, VENDOR, OTHER. Maksimal 500 baris per impor; nama duplikat dilewati otomatis.
      </p>
      <label>
        Daftar tamu
        <textarea
          rows={8}
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={"Budi Santoso;FAMILY\nSiti Aminah;FRIEND"}
        />
      </label>
      {rows.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table>
            <caption className="sr-only">Pratinjau baris impor</caption>
            <thead>
              <tr>
                <th scope="col">Baris</th>
                <th scope="col">Nama</th>
                <th scope="col">Kategori</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={`${row.name}-${index}`}>
                  <td>{index + 1}</td>
                  <td>{row.name || "—"}</td>
                  <td>{row.category}</td>
                  <td>{row.valid ? "Siap diimpor" : row.issue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="billing-muted">
        {valid.length} siap diimpor · {rows.length - valid.length} bermasalah
      </p>
      <div className="actions">
        <Button type="button" disabled={!valid.length || mutation.pending} onClick={submit}>
          {mutation.pending ? "Mengimpor…" : `Impor ${valid.length} Tamu`}
        </Button>
      </div>
      {(message || mutation.message) && (
        <p role={mutation.failed ? "alert" : "status"}>{mutation.failed ? mutation.message : message}</p>
      )}
    </details>
  );
}
