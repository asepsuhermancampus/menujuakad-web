"use client";

import { useMemo, useState } from "react";
import {
  savingsAccountsFixture,
  savingsTargetFixture,
  savingsTotalBalanceIdr,
  type SavingsAccountDto,
} from "@/features/design-preview/data/planner-finance-fixtures";
import { previewContext } from "@/features/design-preview/data/fixture-context";
import {
  PlannerEmpty,
  PlannerModal,
  PlannerShell,
} from "@/features/planner/components/planner-shell";
import {
  formatIdrPlain,
  formatPercent,
  savingsOwnerLabels,
} from "@/features/planner/lib/presentation";

function TransferModal({
  accounts,
  onClose,
}: {
  accounts: readonly SavingsAccountDto[];
  onClose: () => void;
}) {
  const [fromId, setFromId] = useState(accounts[0]?.id ?? "");
  const [toId, setToId] = useState(accounts[1]?.id ?? "");
  const [amount, setAmount] = useState("");
  const from = accounts.find((account) => account.id === fromId);
  const parsedAmount = Number.parseInt(amount.replace(/\D/g, ""), 10) || 0;
  const exceeds = from ? parsedAmount > from.balanceIdr : false;
  const sameAccount = fromId === toId;
  return (
    <PlannerModal title="Transfer antar rekening" onClose={onClose}>
      <div className="planner-form-grid">
        <label>
          Dari rekening
          <select value={fromId} onChange={(event) => setFromId(event.target.value)}>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.label} — {formatIdrPlain(account.balanceIdr)}
              </option>
            ))}
          </select>
        </label>
        <label>
          Ke rekening
          <select value={toId} onChange={(event) => setToId(event.target.value)}>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.label}
              </option>
            ))}
          </select>
        </label>
        <label className="planner-span-2">
          Jumlah (Rp)
          <input
            inputMode="numeric"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="0"
            aria-describedby="transfer-error"
          />
        </label>
        <p className="planner-impact" id="transfer-error" role={exceeds || sameAccount ? "alert" : undefined}>
          {sameAccount
            ? "Rekening asal dan tujuan tidak boleh sama."
            : exceeds
              ? `Jumlah melebihi saldo rekening asal (${formatIdrPlain(from?.balanceIdr ?? 0)}).`
              : `Transfer ${formatIdrPlain(parsedAmount)} dari ${from?.label ?? "—"} ke ${
                  accounts.find((account) => account.id === toId)?.label ?? "—"
                } akan dicatat sebagai contoh. Saldo tidak berubah karena penyimpanan belum aktif.`}
        </p>
      </div>
    </PlannerModal>
  );
}

export function PlannerSavingsView() {
  const [modalOpen, setModalOpen] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [ownerFilter, setOwnerFilter] = useState("ALL");

  const visible = useMemo(
    () =>
      savingsAccountsFixture.filter(
        (account) => ownerFilter === "ALL" || account.owner === ownerFilter,
      ),
    [ownerFilter],
  );

  const progress = savingsTargetFixture.targetIdr
    ? (savingsTotalBalanceIdr / savingsTargetFixture.targetIdr) * 100
    : 0;
  const remaining = Math.max(savingsTargetFixture.targetIdr - savingsTotalBalanceIdr, 0);

  return (
    <PlannerShell title="Tabungan" code="PLN-03" subnav="/dashboard/planner/savings">
      <div className="planner-summary">
        <article>
          <h2>Total saldo semua rekening</h2>
          <strong>{formatIdrPlain(savingsTotalBalanceIdr)}</strong>
          <small>{savingsAccountsFixture.length} rekening contoh</small>
        </article>
        <article>
          <h2>Target dana</h2>
          <strong>{formatIdrPlain(savingsTargetFixture.targetIdr)}</strong>
          <small>Sisa {formatIdrPlain(remaining)} hingga 18 Oktober 2026</small>
        </article>
        <article>
          <h2>Progres</h2>
          <strong>{formatPercent(savingsTotalBalanceIdr, savingsTargetFixture.targetIdr)}</strong>
          <small>Estimasi menabung Rp4.575.000 per bulan (estimasi contoh)</small>
        </article>
      </div>

      <div className="planner-progress" aria-hidden="true" style={{ marginBottom: 24 }}>
        <span style={{ width: `${Math.min(progress, 100).toFixed(2)}%` }} />
      </div>

      <div className="actions" style={{ marginBottom: 20 }}>
        <button type="button" className="button" onClick={() => setModalOpen(true)}>
          Transfer
        </button>
        <button type="button" className="button secondary" onClick={() => setAccountModalOpen(true)}>
          Tambah rekening
        </button>
        <label style={{ marginLeft: "auto" }}>
          Pemilik
          <select value={ownerFilter} onChange={(event) => setOwnerFilter(event.target.value)}>
            <option value="ALL">Semua pemilik</option>
            <option value="SELF">Saya</option>
            <option value="PARTNER">Pasangan</option>
            <option value="SHARED">Bersama</option>
          </select>
        </label>
      </div>

      {visible.length === 0 ? (
        <PlannerEmpty
          message="Belum ada rekening pada filter ini. Tambahkan rekening pertama untuk mulai memantau dana."
          action={{ label: "Tambah rekening", onClick: () => setAccountModalOpen(true) }}
        />
      ) : (
        <div className="planner-list">
          {visible.map((account) => (
            <article className="planner-row" key={account.id}>
              <div>
                <h3>
                  {account.label} · {account.bank}
                </h3>
                <p>
                  {savingsOwnerLabels[account.owner]} · {account.maskedNumber} · {account.notes}
                </p>
              </div>
              <div className="planner-row-actions">
                <strong className="planner-money">{formatIdrPlain(account.balanceIdr)}</strong>
                <button type="button" className="button secondary">
                  Riwayat
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <p className="notice" style={{ marginTop: 20 }}>
        Nomor rekening hanya ditampilkan tersamar. Saldo dan transfer adalah angka contoh; tidak
        terhubung ke bank atau layanan keuangan mana pun.
      </p>

      {modalOpen && <TransferModal accounts={savingsAccountsFixture} onClose={() => setModalOpen(false)} />}
      {accountModalOpen && (
        <PlannerModal title="Tambah rekening (contoh)" onClose={() => setAccountModalOpen(false)}>
          <div className="planner-form-grid">
            <label>
              Nama rekening
              <input placeholder="Contoh: Tabungan Bersama" />
            </label>
            <label>
              Bank
              <select defaultValue="BCA">
                {["BCA", "BRI", "BNI", "Mandiri", "CIMB Niaga", "Blu", "Bank Jago", "SeaBank", "Bank Syariah Indonesia", "Tunai", "Lainnya"].map(
                  (bank) => (
                    <option key={bank}>{bank}</option>
                  ),
                )}
              </select>
            </label>
            <label>
              Pemilik
              <select defaultValue="SHARED">
                <option value="SELF">Saya</option>
                <option value="PARTNER">Pasangan</option>
                <option value="SHARED">Bersama</option>
              </select>
            </label>
            <label>
              Saldo awal (Rp)
              <input inputMode="numeric" placeholder="0" />
            </label>
            <p className="planner-impact">
              Form contoh. Belum ada penyimpanan — data tidak dikirim ke server atau bank. Waktu acuan
              fixture: {previewContext.now.slice(0, 10)}.
            </p>
          </div>
        </PlannerModal>
      )}
    </PlannerShell>
  );
}
