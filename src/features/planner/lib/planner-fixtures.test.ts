import { describe, expect, it } from "vitest";
import {
  budgetActualTotalIdr,
  budgetCategoriesFixture,
  budgetStatus,
  budgetTotalIdr,
  expensesFixture,
  expensesThisMonthIdr,
  savingsAccountsFixture,
  savingsTargetFixture,
  savingsTotalBalanceIdr,
} from "@/features/design-preview/data/planner-finance-fixtures";
import {
  marketplaceVendorsFixture,
  rundownFixture,
  tasksFixture,
  vendorsFixture,
} from "@/features/design-preview/data/planner-work-fixtures";
import {
  engagementFixture,
  moodboardBoardsFixture,
  requirementsFixture,
  seserahanFixture,
  seserahanTotalEstimateIdr,
  weddingKitFixture,
} from "@/features/design-preview/data/planner-misc-fixtures";
import { adminAuditFixture, adminUpgradesFixture } from "@/features/design-preview/data/planner-admin-fixtures";
import {
  daysLabel,
  daysUntil,
  formatIdrPlain,
  formatPercent,
  maskAccountNumber,
} from "@/features/planner/lib/presentation";

/*
 * Kontrak fixture modul perencanaan: memastikan angka konsisten dengan brief
 * Stitch gelombang 2 (bagian 08) dan tidak ada nilai negatif/desimal.
 */
describe("fixture perencanaan", () => {
  it("tabungan konsisten dengan brief", () => {
    expect(savingsAccountsFixture).toHaveLength(3);
    expect(savingsTotalBalanceIdr).toBe(57_550_000);
    expect(savingsTargetFixture.targetIdr).toBe(85_000_000);
    expect(formatPercent(savingsTotalBalanceIdr, savingsTargetFixture.targetIdr)).toBe("67,7%");
  });

  it("anggaran konsisten dan hanya dekorasi lewat batas", () => {
    expect(budgetTotalIdr).toBe(85_000_000);
    expect(budgetActualTotalIdr).toBe(65_150_000);
    const over = budgetCategoriesFixture.filter(
      (category) => budgetStatus(category) === "OVER_BUDGET",
    );
    expect(over.map((category) => category.name)).toEqual(["Dekorasi"]);
  });

  it("pengeluaran bulan ini sesuai brief", () => {
    expect(expensesFixture).toHaveLength(5);
    expect(expensesThisMonthIdr).toBe(27_550_000);
  });

  it("tugas, rundown, dan vendor konsisten", () => {
    expect(tasksFixture.filter((task) => task.status === "DONE")).toHaveLength(2);
    expect(tasksFixture.filter((task) => task.status === "PENDING")).toHaveLength(6);
    expect(rundownFixture).toHaveLength(6);
    expect(vendorsFixture.filter((vendor) => vendor.status === "PAID")).toHaveLength(1);
    expect(marketplaceVendorsFixture.length).toBeGreaterThan(0);
  });

  it("seserahan, persyaratan, lamaran, dan moodboard konsisten", () => {
    expect(seserahanFixture).toHaveLength(6);
    expect(seserahanTotalEstimateIdr).toBe(6_000_000);
    expect(seserahanFixture.filter((item) => item.status !== "NOT_BOUGHT")).toHaveLength(3);
    expect(requirementsFixture).toHaveLength(6);
    expect(requirementsFixture.filter((item) => item.done)).toHaveLength(3);
    expect(engagementFixture.budgetIdr).toBe(8_000_000);
    expect(moodboardBoardsFixture.map((board) => board.items.length)).toEqual([6, 4]);
  });

  it("wedding kit memuat empat produk contoh", () => {
    expect(weddingKitFixture).toHaveLength(4);
    expect(weddingKitFixture.every((product) => product.priceIdr > 0)).toBe(true);
  });

  it("admin fixtures memuat antrian dan audit contoh", () => {
    expect(adminAuditFixture).toHaveLength(5);
    expect(adminUpgradesFixture.filter((row) => row.status === "PENDING")).toHaveLength(3);
  });

  it("tidak ada nominal negatif atau desimal pada fixture keuangan", () => {
    const amounts = [
      ...savingsAccountsFixture.map((account) => account.balanceIdr),
      ...budgetCategoriesFixture.flatMap((category) => [category.budgetIdr, category.actualIdr]),
      ...expensesFixture.map((expense) => expense.amountIdr),
      ...vendorsFixture.flatMap((vendor) => [vendor.totalIdr, vendor.paidIdr]),
      ...seserahanFixture.map((item) => item.estimateIdr),
    ];
    for (const amount of amounts) {
      expect(Number.isInteger(amount)).toBe(true);
      expect(amount).toBeGreaterThanOrEqual(0);
    }
  });
});

describe("utilitas presentasi planner", () => {
  it("format rupiah memakai pemisah titik tanpa desimal", () => {
    expect(formatIdrPlain(57_550_000)).toBe("Rp57.550.000");
    expect(formatIdrPlain(0)).toBe("Rp0");
    expect(formatIdrPlain(-1_500)).toBe("-Rp1.500");
  });

  it("persentase aman saat total nol", () => {
    expect(formatPercent(10, 0)).toBe("—");
    expect(formatPercent(1, 4)).toBe("25,0%");
  });

  it("selisih hari dan label terlambat", () => {
    expect(daysUntil("2026-10-10", "2026-10-07T08:00:00.000Z")).toBe(3);
    expect(daysLabel(-2)).toBe("Terlambat 2 hari");
    expect(daysLabel(0)).toBe("Hari ini");
    expect(daysLabel(5)).toBe("5 hari lagi");
  });

  it("nomor rekening selalu tersamar", () => {
    expect(maskAccountNumber("1234567890")).toBe("••••7890");
    expect(maskAccountNumber("12")).toBe("••••");
    expect(maskAccountNumber(null)).toBe("••••");
  });
});
