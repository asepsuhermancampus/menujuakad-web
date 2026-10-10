/*
 * Modul ini sengaja TIDAK memakai "use client": ia dipanggil dari Server
 * Component (design-preview-view). Fungsi predikatnya murni (hanya membaca
 * peta kode) sehingga aman dievaluasi di server, sementara komponen anak yang
 * dirender tetap Client Component miliknya sendiri.
 */
import { resolvePlannerRoute } from "@/features/planner/components/planner-routes";

/*
 * Pemetaan kode layar perencanaan Stitch (PLN-*) ke komponen tampilan yang
 * sudah di-slicing. Tujuannya agar Preview Studio menampilkan layar asli,
 * bukan placeholder handoff.
 *
 * Pemetaan hanya berisi kode yang komponennya benar-benar ada. Kode tanpa
 * padanan mengembalikan `null` sehingga pemanggil memakai placeholder —
 * lebih jujur daripada menampilkan layar yang salah.
 */
const plannerPaths: Readonly<Record<string, string[]>> = {
  "PLN-01": ["planner"],
  "PLN-02": ["planner"],
  "PLN-03": ["planner", "savings"],
  "PLN-04": ["planner", "budget"],
  "PLN-05": ["planner", "expenses"],
  "PLN-06": ["planner", "tasks"],
  "PLN-07": ["planner", "rundown"],
  "PLN-08": ["planner", "vendors"],
  "PLN-10": ["planner", "seserahan"],
  "PLN-11": ["planner", "requirements"],
  "PLN-12": ["planner", "engagement"],
  "PLN-13": ["planner", "moodboard"],
  "PLN-14": ["planner", "wedding-kit"],
  "PLN-15": ["planner", "couple"],
  "PLN-16": ["planner", "onboarding"],
  "PLN-17": ["planner", "announcements"],
};

export function hasPlannerPreview(code: string): boolean {
  return Object.hasOwn(plannerPaths, code);
}

export function PlannerPreviewView({ code }: { code: string }) {
  const path = plannerPaths[code];
  if (!path) return null;
  const node = resolvePlannerRoute(path);
  return node ? <>{node}</> : null;
}
