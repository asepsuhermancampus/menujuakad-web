"use client";

import { useMemo, useState } from "react";
import {
  budgetCategoriesFixture,
  expensesFixture,
  expensesThisMonthIdr,
  savingsAccountsFixture,
} from "@/features/design-preview/data/planner-finance-fixtures";
import { previewContext } from "@/features/design-preview/data/fixture-context";
import {
  PlannerEmpty,
  PlannerModal,
  PlannerShell,
} from "@/features/planner/components/planner-shell";
import { formatIdrPlain } from "@/features/planner/lib/presentation";

function ExpenseForm({ onClose }: { onClose: () => void }) {
  const [categoryId, setCategoryId] = useState(budgetCategoriesFixture[0]?.id ?? "");
  const [accountId, setAccountId] = useState(savingsAccountsFixture[0]?.id ?? "");
  const [amount, setAmount] = useState("");

  const category = budgetCategoriesFixture.find((item) => item.id === categoryId);
  const account = savingsAccountsFixture.find((item) => item.id === accountId);
  const parsed = Number.parseInt(amount.replace(/\D/g, ""), 10) || 0;

  return (
    <PlannerModal title="Catat pengeluaran (contoh)" onClose={onClose}>
      <div className="planner-form-grid">
        <label>
          Tanggal
          <input type="date" defaultValue={previewContext.now.slice(0, 10)} />
        </label>
        <label>
          Jumlah (Rp)
          <input
            inputMode="numeric"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="0"
          />
        </label>
        <label className="planner-span-2">
          Deskripsi
          <input placeholder="Contoh: DP dekorasi pelaminan" />
        </label>
        <label>
          Kategori anggaran
          <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
            {budgetCategoriesFixture.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Rekening
          <select value={accountId} onChange={(event) => setAccountId(event.target.value)}>
            {savingsAccountsFixture.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label} — {item.bank}
              </option>
            ))}
          </select>
        </label>
        <p className="planner-impact">
          Saldo {account?.label ?? "—"} berkurang {formatIdrPlain(parsed)}; anggaran{" "}
          {category?.name ?? "—"} terpakai {formatIdrPlain((category?.actualIdr ?? 0) + parsed)} dari{" "}
          {formatIdrPlain(category?.budgetIdr ?? 0)}. Angka ini perhitungan contoh dan tidak
          disimpan.
        </p>
      </div>
    </PlannerModal>
  );
}

export function PlannerExpensesView() {
  const [formOpen, setFormOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [accountFilter, setAccountFilter] = useState("ALL");

  const rows = useMemo(
    () =>
      expensesFixture.filter(
        (expense) =>
          (categoryFilter === "ALL" || expense.categoryId === categoryFilter) &&
          (accountFilter === "ALL" || expense.accountId === accountFilter),
      ),
    [categoryFilter, accountFilter],
  );

  const averagePerDay = Math.round(expensesThisMonthIdr / 8);

  return (
    <PlannerShell title="Pengeluaran" code="PLN-05" subnav="/dashboard/planner/expenses">
      <div className="planner-summary">
        <article>
          <h2>Pengeluaran bulan ini</h2>
          <strong>{formatIdrPlain(expensesThisMonthIdr)}</strong>
          <small>Oktober 2026 (contoh)</small>
        </article>
        <article>
          <h2>Rata-rata per hari</h2>
          <strong>{formatIdrPlain(averagePerDay)}</strong>
          <small>Perhitungan contoh dari 8 hari berjalan</small>
        </article>
        <article>
          <h2>Jumlah transaksi</h2>
          <strong>{expensesFixture.length}</strong>
          <small>Seluruhnya contoh</small>
        </article>
      </div>

      <div className="actions" style={{ marginBottom: 20 }}>
        <button type="button" className="button" onClick={() => setFormOpen(true)}>
          Catat pengeluaran
        </button>
        <label>
          Kategori
          <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
            <option value="ALL">Semua kategori</option>
            {budgetCategoriesFixture.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Rekening
          <select value={accountFilter} onChange={(event) => setAccountFilter(event.target.value)}>
            <option value="ALL">Semua rekening</option>
            {savingsAccountsFixture.map((account) => (
              <option key={account.id} value={account.id}>
                {account.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {rows.length === 0 ? (
        <PlannerEmpty
          message="Belum ada pengeluaran pada filter ini. Mulai catat pengeluaran pertama."
          action={{ label: "Catat pengeluaran", onClick: () => setFormOpen(true) }}
        />
      ) : (
        <div className="business-table">
          <table>
            <caption>Catatan pengeluaran (data contoh)</caption>
            <thead>
              <tr>
                <th scope="col">Tanggal</th>
                <th scope="col">Deskripsi</th>
                <th scope="col">Kategori</th>
                <th scope="col">Rekening</th>
                <th scope="col">Jumlah</th>
                <th scope="col">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((expense) => {
                const category = budgetCategoriesFixture.find(
                  (item) => item.id === expense.categoryId,
                );
                const account = savingsAccountsFixture.find((item) => item.id === expense.accountId);
                const overBudget =
                  category !== undefined && category.actualIdr > category.budgetIdr;
                return (
                  <tr key={expense.id} aria-label={overBudget ? "Kategori melewati anggaran" : undefined}>
                    <td>{expense.date}</td>
                    <td>{expense.description}</td>
                    <td>{category?.name ?? "—"}</td>
                    <td>{account?.label ?? "—"}</td>
                    <td className="planner-money">{formatIdrPlain(expense.amountIdr)}</td>
                    <td>
                      <button type="button" className="button ghost" aria-label={`Ubah ${expense.description}`}>
                        Ubah
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="notice" style={{ marginTop: 20 }}>
        Semua baris adalah contoh. Pengeluaran nyata belum tersimpan dan belum memengaruhi saldo
        rekening.
      </p>

      {formOpen && <ExpenseForm onClose={() => setFormOpen(false)} />}
    </PlannerShell>
  );
}
