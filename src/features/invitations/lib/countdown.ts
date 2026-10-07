import { previewContext } from "@/features/design-preview/data/fixtures";
export type CountdownDuration = {
  state: "WAITING" | "REACHED" | "INVALID";
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};
/** Waktu input WIB; clock fixture tetap agar tampilan contoh tidak bergeser antar-render. */
export function countdownDuration(target: string): CountdownDuration {
  const empty = { days: 0, hours: 0, minutes: 0, seconds: 0 };
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(target)) return { ...empty, state: "INVALID" };
  const targetMs = Date.parse(`${target}:00+07:00`);
  if (
    !Number.isFinite(targetMs) ||
    new Date(targetMs + 7 * 3600000).toISOString().slice(0, 16) !== target
  )
    return { ...empty, state: "INVALID" };
  const total = Math.max(0, Math.floor((targetMs - Date.parse(previewContext.now)) / 1000));
  return {
    state: total ? "WAITING" : "REACHED",
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}
