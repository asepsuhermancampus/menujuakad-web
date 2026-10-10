import type { SVGProps } from "react";

/*
 * Ikon garis untuk area workspace (customer, admin, planner).
 *
 * Sumber desain memakai Material Symbols Outlined, tetapi font ikon eksternal
 * tidak boleh dimuat dari CDN pada aplikasi ini (CSP, privasi, dan bobot
 * muat). Karena itu ikon digambar lokal sebagai SVG 24×24, stroke 1.8 px,
 * mengikuti bahasa visual Material Symbols Outlined yang dipakai desain:
 * geometri sederhana, sudut membulat, tanpa isian padat.
 *
 * Semua ikon mewarisi `currentColor` dan `size` (default 20 px, sama dengan
 * ukuran ikon pada desain) sehingga warna mengikuti token tema.
 */

export type IconName =
  | "savings"
  | "wallet"
  | "receipt"
  | "checklist"
  | "schedule"
  | "storefront"
  | "gift"
  | "task"
  | "palette"
  | "inventory"
  | "grid"
  | "add-circle"
  | "add-task"
  | "task-alt"
  | "event-repeat"
  | "error"
  | "payments"
  | "arrow-forward"
  | "chevron-right"
  | "notifications"
  | "favorite"
  | "search"
  | "download"
  | "upload"
  | "edit"
  | "delete"
  | "visibility"
  | "shield"
  | "group"
  | "content"
  | "monitor"
  | "settings"
  | "backup"
  | "sparkle";

const paths: Record<IconName, string> = {
  savings:
    "M3 12c0-4 2-7 6-7 2 0 3 1 4 2 1-1 2-2 4-2 4 0 6 3 6 7v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM8 15h.01M16 15h.01",
  wallet: "M3 8a3 3 0 0 1 3-3h11a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3zM3 8h18M16 13h2",
  receipt: "M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6",
  checklist: "M4 6h2v2H4zM9 7h11M4 12h2v2H4zM9 13h11M4 18h2v2H4zM9 19h11",
  schedule:
    "M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM4 10h16M9 4v4M15 4v4M12 14v3l2 1",
  storefront: "M4 9h16v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1zM4 9l1.5-5h13L20 9M9 20v-6h6v6",
  gift: "M4 11h16v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1zM3 7h18v4H3zM12 7v14M12 7S9.5 3 7.5 4.2 8.8 7 12 7c3.2 0 4.7-1.6 2.7-2.8S12 7 12 7",
  task: "M8 6h11M8 12h11M8 18h11M3 6h2v2H3zM3 12h2v2H3zM3 18h2v2H3z",
  palette:
    "M12 3a9 9 0 1 0 0 18h1a2 2 0 0 0 0-4h-1a2 2 0 0 1 0-4h4a5 5 0 0 0 5-5c0-3-4-5-9-5zM7.5 9h.01M11 6.5h.01M15.5 8h.01",
  inventory: "M3 7l9-4 9 4v10l-9 4-9-4zM3 7l9 4 9-4M12 11v10",
  grid: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  "add-circle": "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 8v8M8 12h8",
  "add-task": "M4 6h2v2H4zM9 7h11M4 12h2v2H4zM9 13h7M16 16h5M18.5 13.5v5",
  "task-alt": "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM8.5 12.5l2.5 2.5 4.5-5",
  "event-repeat":
    "M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM4 11h16M8 3v4M16 3v4M9 16h6l-2-2M15 16l-2 2",
  error: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 8v5M12 16h.01",
  payments: "M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM3 10h18M7 15h3",
  "arrow-forward": "M5 12h14M13 6l6 6-6 6",
  "chevron-right": "M9 6l6 6-6 6",
  notifications: "M18 8a6 6 0 1 0-12 0c0 7-2 8-2 8h16s-2-1-2-8M10.5 21a2 2 0 0 0 3 0",
  favorite: "M12 20s-7-4.5-7-9.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 7 3.5c0 5-7 9.5-7 9.5z",
  search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4",
  download: "M12 4v11M8 11l4 4 4-4M5 20h14",
  upload: "M12 20V9M8 13l4-4 4 4M5 4h14",
  edit: "M4 20h4l10-10-4-4L4 16zM14 6l4 4",
  delete: "M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13M10 11v6M14 11v6",
  visibility: "M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  shield: "M12 3l7 3v6c0 4-3 7.5-7 9-4-1.5-7-5-7-9V6zM9 12l2 2 4-4",
  group:
    "M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM2 20c0-3.5 3-6 7-6s7 2.5 7 6M17 11a3 3 0 1 0 0-6M18 14c2.5.5 4 2.5 4 5",
  content: "M5 4h14v16H5zM8 8h8M8 12h8M8 16h5",
  monitor: "M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM8 21h8M12 16v5",
  settings:
    "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2v.2a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-3-1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0-1.2-2.9H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.2-3l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 2.9-1.2V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 2.9 1.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0 1.2 2.9h.2a2 2 0 1 1 0 4h-.2a1.7 1.7 0 0 0-1.5 1z",
  backup:
    "M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM8 9h8M8 13h8M8 17h5",
  sparkle:
    "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM18.5 16l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z",
};

export function Icon({
  name,
  size = 20,
  className,
  ...rest
}: { name: IconName; size?: number } & Omit<SVGProps<SVGSVGElement>, "name">) {
  return (
    <svg
      className={className ? `icon ${className}` : "icon"}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      <path d={paths[name]} />
    </svg>
  );
}
