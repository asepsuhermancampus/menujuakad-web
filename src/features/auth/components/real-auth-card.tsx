import type { ReactNode } from "react";
export function RealAuthCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="auth-wrap">
      <section className="auth-card auth-card-compact">
        <header className="auth-head">
          <span className="auth-mark" aria-hidden="true" />
          <h1>{title}</h1>
          {description && <p className="muted">{description}</p>}
        </header>
        {children}
      </section>
    </div>
  );
}
