import { previewContext } from "./fixture-context";

/**
 * Fixture modul keuangan perencanaan (tabungan, anggaran, pengeluaran).
 * Semua angka sintetis; tidak membuktikan saldo bank nyata, transfer, atau
 * pencatatan keuangan sungguhan. Nominal selalu integer rupiah.
 */

export type EventContext = "WEDDING" | "ENGAGEMENT";

export type SavingsAccountDto = Readonly<{
  id: string;
  label: string;
  bank: string;
  owner: "SELF" | "PARTNER" | "SHARED";
  maskedNumber: string;
  balanceIdr: number;
  notes: string;
}>;

export type SavingsTargetDto = Readonly<{
  targetIdr: number;
  targetDate: string;
  note: string;
}>;

export const savingsAccountsFixture: readonly SavingsAccountDto[] = [
  {
    id: "demo-acc-01",
    label: "Tabungan Bersama",
    bank: "BCA",
    owner: "SHARED",
    maskedNumber: "••••4821",
    balanceIdr: 42_500_000,
    notes: "Rekening utama untuk pembayaran vendor",
  },
  {
    id: "demo-acc-02",
    label: "Tabungan Asep",
    bank: "Bank Jago",
    owner: "SELF",
    maskedNumber: "••••7734",
    balanceIdr: 8_750_000,
    notes: "Sisihan bulanan",
  },
  {
    id: "demo-acc-03",
    label: "Tabungan Kirana",
    bank: "SeaBank",
    owner: "PARTNER",
    maskedNumber: "••••1102",
    balanceIdr: 6_300_000,
    notes: "Dana busana & rias",
  },
] as const;

export const savingsTargetFixture: SavingsTargetDto = {
  targetIdr: 85_000_000,
  targetDate: "2026-10-18",
  note: "Target dana pernikahan",
};

export const savingsTotalBalanceIdr = savingsAccountsFixture.reduce(
  (sum, account) => sum + account.balanceIdr,
  0,
);

export type BudgetCategoryDto = Readonly<{
  id: string;
  name: string;
  budgetIdr: number;
  actualIdr: number;
  eventContext: EventContext;
}>;

export const budgetCategoriesFixture: readonly BudgetCategoryDto[] = [
  {
    id: "demo-bud-01",
    name: "Venue & Katering",
    budgetIdr: 45_000_000,
    actualIdr: 38_500_000,
    eventContext: "WEDDING",
  },
  {
    id: "demo-bud-02",
    name: "Dekorasi",
    budgetIdr: 12_000_000,
    actualIdr: 12_400_000,
    eventContext: "WEDDING",
  },
  {
    id: "demo-bud-03",
    name: "Busana & Rias",
    budgetIdr: 8_000_000,
    actualIdr: 5_200_000,
    eventContext: "WEDDING",
  },
  {
    id: "demo-bud-04",
    name: "Dokumentasi",
    budgetIdr: 7_000_000,
    actualIdr: 4_000_000,
    eventContext: "WEDDING",
  },
  {
    id: "demo-bud-05",
    name: "Undangan & Cetak",
    budgetIdr: 3_000_000,
    actualIdr: 1_850_000,
    eventContext: "WEDDING",
  },
  {
    id: "demo-bud-06",
    name: "Seserahan",
    budgetIdr: 6_000_000,
    actualIdr: 2_300_000,
    eventContext: "WEDDING",
  },
  {
    id: "demo-bud-07",
    name: "Lain-lain",
    budgetIdr: 4_000_000,
    actualIdr: 900_000,
    eventContext: "WEDDING",
  },
] as const;

export const budgetTotalIdr = budgetCategoriesFixture.reduce(
  (sum, category) => sum + category.budgetIdr,
  0,
);
export const budgetActualTotalIdr = budgetCategoriesFixture.reduce(
  (sum, category) => sum + category.actualIdr,
  0,
);

export type BudgetStatus = "SAFE" | "NEAR_LIMIT" | "OVER_BUDGET";

/** Status anggaran dihitung dari rasio aktual/anggaran; bukan data tersimpan. */
export function budgetStatus(category: BudgetCategoryDto): BudgetStatus {
  if (category.actualIdr > category.budgetIdr) return "OVER_BUDGET";
  if (category.budgetIdr > 0 && category.actualIdr / category.budgetIdr >= 0.85)
    return "NEAR_LIMIT";
  return "SAFE";
}

export type ExpenseDto = Readonly<{
  id: string;
  date: string;
  description: string;
  categoryId: string;
  accountId: string;
  amountIdr: number;
  eventContext: EventContext;
  note: string;
}>;

export const expensesFixture: readonly ExpenseDto[] = [
  {
    id: "demo-exp-01",
    date: "2026-10-08",
    description: "DP dekorasi pelaminan",
    categoryId: "demo-bud-02",
    accountId: "demo-acc-01",
    amountIdr: 6_000_000,
    eventContext: "WEDDING",
    note: "Termin 1 dari 2",
  },
  {
    id: "demo-exp-02",
    date: "2026-10-06",
    description: "Cicilan katering termin 2",
    categoryId: "demo-bud-01",
    accountId: "demo-acc-01",
    amountIdr: 12_500_000,
    eventContext: "WEDDING",
    note: "Sisa 1 termin lagi",
  },
  {
    id: "demo-exp-03",
    date: "2026-10-04",
    description: "Sewa gaun pengantin",
    categoryId: "demo-bud-03",
    accountId: "demo-acc-02",
    amountIdr: 3_200_000,
    eventContext: "WEDDING",
    note: "Termasuk fitting 2 kali",
  },
  {
    id: "demo-exp-04",
    date: "2026-10-02",
    description: "Cetak undangan fisik",
    categoryId: "demo-bud-05",
    accountId: "demo-acc-03",
    amountIdr: 1_850_000,
    eventContext: "WEDDING",
    note: "200 lembar",
  },
  {
    id: "demo-exp-05",
    date: "2026-10-01",
    description: "Fotografer — DP",
    categoryId: "demo-bud-04",
    accountId: "demo-acc-01",
    amountIdr: 4_000_000,
    eventContext: "WEDDING",
    note: "Termin 1 dari 2",
  },
] as const;

export const expensesThisMonthIdr = expensesFixture.reduce(
  (sum, expense) => sum + expense.amountIdr,
  0,
);

export const financeFixtureContext = {
  workspaceId: previewContext.workspaceId,
  currency: "IDR",
} as const;
