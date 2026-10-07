import type { ReactNode } from "react";
export function AuthCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="auth-wrap">
      <section className="auth-card">
        <p className="eyebrow">MENUJU AKAD · AKUN ANDA</p>
        <h1>{title}</h1>
        <p className="muted">{description}</p>
        <p className="notice">Tampilan contoh. Autentikasi dan pengiriman email belum terhubung.</p>
        {children}
      </section>
    </div>
  );
}
