import type { ReactNode } from "react";
import { PlannerDashboardView } from "./planner-dashboard-view";
import { PlannerSavingsView } from "./planner-savings-view";
import { PlannerBudgetView } from "./planner-budget-view";
import { PlannerExpensesView } from "./planner-expenses-view";
import { PlannerTasksView } from "./planner-tasks-view";
import { PlannerRundownView } from "./planner-rundown-view";
import { PlannerVendorsView } from "./planner-vendors-view";
import {
  PlannerRequirementsView,
  PlannerSeserahanView,
} from "./planner-seserahan-requirements-view";
import { PlannerAnnouncementView } from "./planner-announcement-view";
import {
  PlannerCoupleView,
  PlannerEngagementView,
  PlannerMoodboardView,
  PlannerOnboardingView,
  PlannerWeddingKitView,
} from "./planner-misc-views";

/**
 * Pemetaan segmen path modul perencanaan ke komponen tampilan.
 * Dipisahkan dari page agar file route tetap tipis dan daftar modul
 * dapat diuji tanpa merender Next.js page.
 */
const plannerScreens: Readonly<Record<string, () => ReactNode>> = {
  savings: () => <PlannerSavingsView />,
  budget: () => <PlannerBudgetView />,
  expenses: () => <PlannerExpensesView />,
  tasks: () => <PlannerTasksView />,
  rundown: () => <PlannerRundownView />,
  vendors: () => <PlannerVendorsView />,
  seserahan: () => <PlannerSeserahanView />,
  requirements: () => <PlannerRequirementsView />,
  engagement: () => <PlannerEngagementView />,
  moodboard: () => <PlannerMoodboardView />,
  "wedding-kit": () => <PlannerWeddingKitView />,
  couple: () => <PlannerCoupleView />,
  onboarding: () => <PlannerOnboardingView />,
  announcements: () => <PlannerAnnouncementView />,
};

/**
 * Mengembalikan node untuk path perencanaan, `null` bila bukan area planner,
 * atau `false` bila path planner tidak dikenal (pemanggil memutuskan 404).
 */
export function resolvePlannerRoute(path: string[]): ReactNode | null | false {
  if (path[0] !== "planner") return null;
  if (path.length === 1) return <PlannerDashboardView />;
  if (path.length === 2) {
    const screen = plannerScreens[path[1]];
    return screen ? screen() : false;
  }
  return false;
}

export const plannerRouteKeys = Object.keys(plannerScreens);
