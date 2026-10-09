import Link from "next/link";
export function CustomerBottomNavigation() {
  return (
    <nav className="customer-bottom-nav" aria-label="Navigasi dashboard mobile">
      {[
        ["cus-01", "Beranda"],
        ["cus-02", "Undangan"],
        ["acc-02", "Notifikasi"],
        ["acc-01", "Akun"],
      ].map(([code, label]) => (
        <Link
          key={code}
          href={`/preview-ui/${code}`}
          aria-current={code === "cus-01" ? "page" : undefined}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
