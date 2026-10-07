import Link from "next/link";
import { Brand } from "@/components/shared/brand";
export function CustomerHeader() {
  return (
    <header className="workspace-header">
      <Brand />
      <span className="badge">Sarah & Dimas · Akun Contoh</span>
      <Link className="button secondary" href="/preview-ui/inv-01">
        Pratinjau Undangan
      </Link>
    </header>
  );
}
