export function MonitoringControls({
  query,
  onQuery,
  status,
  onStatus,
  options,
  onReset,
  label,
}: {
  query: string;
  onQuery: (value: string) => void;
  status: string;
  onStatus: (value: string) => void;
  options: readonly { value: string; label: string }[];
  onReset: () => void;
  label: string;
}) {
  return (
    <section className="billing-panel billing-filters" aria-label={`Filter ${label}`}>
      <label>
        Cari ID {label}
        <input
          type="search"
          aria-label={`Cari ID ${label}`}
          value={query}
          placeholder="Cari pada data contoh…"
          onChange={(event) => onQuery(event.target.value)}
        />
      </label>
      <label>
        Status {label}
        <select
          aria-label={`Status ${label}`}
          value={status}
          onChange={(event) => onStatus(event.target.value)}
        >
          <option value="ALL">Semua status</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <button type="button" className="button secondary" onClick={onReset}>
        Reset filter
      </button>
      <small>Provider belum terhubung · filter lokal</small>
    </section>
  );
}
export function MonitoringPagination({
  page,
  pages,
  total,
  onPage,
}: {
  page: number;
  pages: number;
  total: number;
  onPage: (value: number) => void;
}) {
  return (
    <nav className="billing-pagination" aria-label="Navigasi hasil contoh">
      <span>
        {total} hasil contoh · Halaman {page} dari {pages}
      </span>
      <button
        type="button"
        className="button secondary"
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
      >
        Sebelumnya
      </button>
      <button
        type="button"
        className="button secondary"
        disabled={page >= pages}
        onClick={() => onPage(page + 1)}
      >
        Selanjutnya
      </button>
    </nav>
  );
}
export function MonitoringMetrics({
  items,
}: {
  items: readonly { label: string; value: string | number }[];
}) {
  return (
    <div className="billing-metrics">
      {items.map((item) => (
        <article className="billing-panel" key={item.label}>
          <p className="billing-eyebrow">{item.label}</p>
          <p className="billing-metric-value">{item.value}</p>
          <small>Data sintetis · bukan telemetry produksi</small>
        </article>
      ))}
    </div>
  );
}
