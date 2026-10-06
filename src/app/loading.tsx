export default function Loading() {
  return (
    <main className="status-page container" role="status" aria-live="polite">
      <p>Sedang menyiapkan halaman untuk kalian…</p>
      <div className="loading-line" aria-hidden="true" />
    </main>
  );
}
