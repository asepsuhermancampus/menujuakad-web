import type { GuestPreviewDto } from "@/features/design-preview/data/guests-fixtures";

export const guestGroupLabels: Readonly<Record<GuestPreviewDto["group"], string>> = {
  FAMILY: "Keluarga",
  FRIENDS: "Teman",
  COLLEAGUES: "Rekan kerja",
};
