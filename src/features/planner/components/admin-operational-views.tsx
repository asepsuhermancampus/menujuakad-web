"use client";

import Link from "next/link";
import { useState } from "react";
import {
  adminAuditFixture,
  adminContentSectionsFixture,
  adminPaymentSettingFixture,
  adminUpgradesFixture,
  adminUsersFixture,
  type AdminUserRowDto,
} from "@/features/design-preview/data/planner-admin-fixtures";
import {
  AdminPageHeader,
  AdminStatCard,
} from "@/components/admin/admin-page-header";
import { PlannerEmpty, PlannerModal, PlannerTabs } from "@/features/planner/components/planner-shell";
import { auditResultLabels, upgradeStatusLabels } from "@/features/planner/lib/presentation";

/**
 * Tampilan operasional admin. Semua aksi destruktif memerlukan konfirmasi
 * eksplisit; belum ada mutasi database sehingga hasilnya hanya state lokal.
 */

function ConfirmDeleteModal({
  user,
  onClose,
  onConfirm,
}: {
  user: AdminUserRowDto;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [typed, setTyped] = useState("");
  const [reason, setReason] = useState("");
  const matches = typed.trim() === user.name;

  return (
    <PlannerModal title="Hapus pengguna" onClose={onClose}>
      <p role="alert">
        Tindakan ini permanen. Ketik nama pengguna untuk mengonfirmasi.
      </p>
      <div className="planner-form-grid">
        <label className="planner-span-2">
          Nama pengguna: {user.name}
          <input value={typed} onChange={(event) => setTyped(event.target.value)} />
        </label>
        <label className="planner-span-2">
          Alasan (wajib)
          <input value={reason} onChange={(event) => setReason(event.target.value)} />
        </label>
        <p className="planner-impact">
          Konfirmasi contoh: {matches ? "nama cocok" : "nama belum cocok"}. Alasan wajib diisi untuk
          audit. Belum ada penghapusan nyata pada database.
        </p>
      </div>
      <div className="planner-modal-actions">
        <button
          type="button"
          className="button"
          disabled={!matches || reason.trim().length === 0}
          onClick={() => onConfirm(reason)}
        >
          Hapus (contoh)
        </button>
      </div>
    </PlannerModal>
  );
}

export function AdminUserManagementView() {
  const [users, setUsers] = useState(adminUsersFixture);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<AdminUserRowDto | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [bulkConfirm, setBulkConfirm] = useState<"activate" | "delete" | null>(null);

  const rows = users.filter(
    (user) =>
      (statusFilter === "ALL" || user.status === statusFilter) &&
      (query.trim() === "" || user.name.toLowerCase().includes(query.trim().toLowerCase())),
  );

  function toggle(id: string) {
    setSelected((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <section className="planner-shell stack">
      <AdminPageHeader
        title="Kelola Pengguna"
        code="ADM-03"
        breadcrumb="Manajemen Pengguna & Pasangan"
        lead="Kelola hak akses, status langganan, kuota pernikahan aktif, dan investigasi akun pengguna pada data contoh."
      />
      <p className="notice">
        Tabel contoh. Aktivasi, reset, dan penghapusan belum mengubah database; semua aksi destruktif
        wajib konfirmasi dan tercatat pada audit.
      </p>

      <div className="admin-stat-grid">
        <AdminStatCard
          label="Total akun pengguna"
          value={`${users.length} Akun`}
          note="Data contoh"
          hint={`${users.filter((user) => user.status === "ACTIVE").length} aktif`}
          icon="group"
          tone="primary"
        />
        <AdminStatCard
          label="Menunggu tindakan"
          value={`${users.filter((user) => user.status !== "ACTIVE").length} Akun`}
          note="Perlu verifikasi"
          hint="Konflik hak milik & status akun"
          icon="shield"
          tone="secondary"
        />
        <AdminStatCard
          label="Hasil filter"
          value={`${rows.length} Baris`}
          note="Setelah pencarian & filter"
          hint={statusFilter === "ALL" ? "Semua status" : statusFilter}
          icon="content"
          tone="tertiary"
        />
      </div>

      {notice && (
        <p className="notice" role="status">
          {notice}
        </p>
      )}

      <div className="actions" style={{ marginBottom: 16 }}>
        <label>
          Cari nama
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nama pengguna" />
        </label>
        <label>
          Status
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="ALL">Semua status</option>
            <option value="ACTIVE">Aktif</option>
            <option value="SUSPENDED">Ditangguhkan</option>
          </select>
        </label>
      </div>

      <div className="actions" style={{ marginBottom: 16 }}>
        <button
          type="button"
          className="button secondary"
          disabled={selected.size === 0}
          onClick={() => setBulkConfirm("activate")}
        >
          Aktivasi massal ({selected.size})
        </button>
        <button
          type="button"
          className="button secondary"
          disabled={selected.size === 0}
          onClick={() => setBulkConfirm("delete")}
        >
          Hapus massal ({selected.size})
        </button>
      </div>

      {rows.length === 0 ? (
        <PlannerEmpty message="Tidak ada pengguna pada filter ini." />
      ) : (
        <div className="business-table">
          <table>
            <caption>Pengguna (data contoh)</caption>
            <thead>
              <tr>
                <th scope="col">Pilih</th>
                <th scope="col">Nama</th>
                <th scope="col">Email</th>
                <th scope="col">Peran</th>
                <th scope="col">Status</th>
                <th scope="col">Akses</th>
                <th scope="col">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((user) => (
                <tr key={user.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selected.has(user.id)}
                      onChange={() => toggle(user.id)}
                      aria-label={`Pilih ${user.name}`}
                    />
                  </td>
                  <td>{user.name}</td>
                  <td>{user.maskedEmail}</td>
                  <td>{user.role === "SUPERADMIN" ? "Superadmin" : "Klien"}</td>
                  <td>
                    <span className="planner-badge" data-tone={user.status === "ACTIVE" ? "success" : "danger"}>
                      {user.status === "ACTIVE" ? "✓ Aktif" : "! Ditangguhkan"}
                    </span>
                  </td>
                  <td>{user.accessLabel}</td>
                  <td>
                    <div className="planner-row-actions">
                      <button
                        type="button"
                        className="button ghost"
                        onClick={() => setNotice(`Aktivasi lifetime untuk ${user.name} dicatat (contoh).`)}
                      >
                        Aktifkan
                      </button>
                      <button
                        type="button"
                        className="button ghost"
                        onClick={() => setNotice(`Reset akses untuk ${user.name} dicatat (contoh).`)}
                      >
                        Reset
                      </button>
                      <button type="button" className="button ghost" onClick={() => setDeleteTarget(user)}>
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {deleteTarget && (
        <ConfirmDeleteModal
          user={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={(reason) => {
            setUsers((previous) => previous.filter((user) => user.id !== deleteTarget.id));
            setNotice(`Penghapusan ${deleteTarget.name} dicatat (contoh) dengan alasan: ${reason}.`);
            setDeleteTarget(null);
          }}
        />
      )}

      {bulkConfirm && (
        <PlannerModal
          title={bulkConfirm === "activate" ? "Aktivasi massal" : "Hapus massal"}
          onClose={() => setBulkConfirm(null)}
        >
          <p>
            {bulkConfirm === "activate"
              ? `${selected.size} pengguna akan diaktifkan lifetime (contoh).`
              : `Tindakan ini permanen. ${selected.size} pengguna akan dihapus (contoh).`}
          </p>
          <p className="planner-impact">
            Konfirmasi massal memerlukan alasan pada implementasi nyata; saat ini hanya mencatat
            niat pada tampilan.
          </p>
          <div className="planner-modal-actions">
            <button
              type="button"
              className="button"
              onClick={() => {
                setNotice(
                  bulkConfirm === "activate"
                    ? `Aktivasi massal ${selected.size} pengguna dicatat (contoh).`
                    : `Hapus massal ${selected.size} pengguna dicatat (contoh).`,
                );
                if (bulkConfirm === "delete") {
                  setUsers((previous) => previous.filter((user) => !selected.has(user.id)));
                }
                setSelected(new Set());
                setBulkConfirm(null);
              }}
            >
              Lanjutkan (contoh)
            </button>
          </div>
        </PlannerModal>
      )}
    </section>
  );
}

export function AdminUpgradeRequestsView() {
  const [rows, setRows] = useState(adminUpgradesFixture);
  const [notice, setNotice] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);

  return (
    <section className="planner-shell stack">
      <AdminPageHeader
        title="Persetujuan Upgrade"
        breadcrumb="Antrian Upgrade"
        lead="Antrian permintaan peningkatan paket beserta bukti dan status email pada data contoh."
      />
      <p className="notice">
        Antrian contoh. Persetujuan belum mengubah akses nyata dan email belum dikirim; status email
        ditampilkan terpisah dari keputusan.
      </p>

      {notice && (
        <p className="notice" role="status">
          {notice}
        </p>
      )}

      {rows.length === 0 ? (
        <PlannerEmpty message="Tidak ada permintaan upgrade pada antrian." />
      ) : (
        <div className="business-table">
          <table>
            <caption>Antrian upgrade (data contoh)</caption>
            <thead>
              <tr>
                <th scope="col">Pengguna</th>
                <th scope="col">Paket</th>
                <th scope="col">Diminta</th>
                <th scope="col">Bukti</th>
                <th scope="col">Status</th>
                <th scope="col">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.userName}</td>
                  <td>
                    {row.fromPackage} → {row.toPackage}
                  </td>
                  <td>{row.requestedAt}</td>
                  <td>{row.proofLabel}</td>
                  <td>
                    <span
                      className="planner-badge"
                      data-tone={row.status === "APPROVED" ? "success" : row.status === "REJECTED" ? "danger" : "default"}
                    >
                      {upgradeStatusLabels[row.status]}
                    </span>
                  </td>
                  <td>
                    <div className="planner-row-actions">
                      <button
                        type="button"
                        className="button ghost"
                        onClick={() => {
                          setRows((previous) =>
                            previous.map((item) =>
                              item.id === row.id ? { ...item, status: "APPROVED" } : item,
                            ),
                          );
                          setNotice(
                            `Upgrade ${row.userName} disetujui. Email pemberitahuan tertunda (belum ada provider email).`,
                          );
                        }}
                      >
                        Setujui
                      </button>
                      <button type="button" className="button ghost" onClick={() => setRejectTarget(row.id)}>
                        Tolak
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {rejectTarget && (
        <PlannerModal title="Tolak permintaan upgrade" onClose={() => setRejectTarget(null)}>
          <div className="planner-form-grid">
            <label className="planner-span-2">
              Alasan penolakan (wajib)
              <input placeholder="Contoh: bukti pembayaran tidak sesuai" />
            </label>
            <p className="planner-impact">Penolakan memerlukan alasan dan tercatat pada audit.</p>
          </div>
          <div className="planner-modal-actions">
            <button
              type="button"
              className="button"
              onClick={() => {
                setRows((previous) =>
                  previous.map((item) =>
                    item.id === rejectTarget ? { ...item, status: "REJECTED" } : item,
                  ),
                );
                setNotice("Permintaan upgrade ditolak (contoh).");
                setRejectTarget(null);
              }}
            >
              Tolak (contoh)
            </button>
          </div>
        </PlannerModal>
      )}
    </section>
  );
}

export function AdminContentView() {
  const [active, setActive] = useState("BRAND");
  const [notice, setNotice] = useState<string | null>(null);

  const section = adminContentSectionsFixture.find((item) => item.key === active);

  return (
    <section className="planner-shell stack">
      <AdminPageHeader
        title="Kelola Konten"
        code="ADM-05"
        breadcrumb="Konten & Moderasi"
        lead="Editor bagian halaman publik beserta riwayat draf dan publikasi pada data contoh."
      />
      <p className="notice">
        Editor konten contoh. Simpan draf dan terbitkan belum mengubah halaman publik; publikasi
        nyata memerlukan backend konten.
      </p>

      <PlannerTabs
        tabs={adminContentSectionsFixture.map((item) => ({ key: item.key, label: item.label }))}
        active={active}
        onChange={setActive}
      />

      <div className="planner-form-grid">
        {active === "BRAND" && (
          <>
            <label>
              Nama aplikasi
              <input defaultValue="Menuju Akad" />
            </label>
            <label>
              Tagline
              <input defaultValue="Undangan untuk hari kalian." />
            </label>
            <label>
              Warna utama
              <input defaultValue="#5F3ADD" />
            </label>
            <label>
              Logo (URL)
              <input placeholder="Belum ada berkas" />
            </label>
          </>
        )}
        {active === "LANDING" && (
          <>
            <label className="planner-span-2">
              Judul hero
              <input defaultValue="Undangan untuk hari kalian." />
            </label>
            <label className="planner-span-2">
              Deskripsi hero
              <textarea rows={3} defaultValue="Pilih desain, isi acara, lalu bagikan." />
            </label>
            <label>
              Tampilkan bagian fitur
              <select defaultValue="on">
                <option value="on">Aktif</option>
                <option value="off">Nonaktif</option>
              </select>
            </label>
            <label>
              Tampilkan bagian harga
              <select defaultValue="off">
                <option value="on">Aktif</option>
                <option value="off">Nonaktif</option>
              </select>
            </label>
          </>
        )}
        {active === "PRICING" && (
          <>
            <label>
              Nama paket
              <input defaultValue="Premium" />
            </label>
            <label>
              Harga (Rp)
              <input inputMode="numeric" defaultValue="149000" />
            </label>
            <p className="planner-impact planner-span-2">
              Harga contoh; jangan diterbitkan sebagai penawaran sebelum harga resmi ditetapkan.
            </p>
          </>
        )}
        {active === "FAQ" && (
          <label className="planner-span-2">
            Daftar tanya-jawab
            <textarea rows={6} defaultValue={"Q: Bagaimana cara mulai?\nA: Pilih desain lalu isi data acara."} />
          </label>
        )}
        {active === "ANNOUNCEMENT" && (
          <>
            <label className="planner-span-2">
              Judul pengumuman
              <input defaultValue="Perencanaan pernikahan kini tersedia" />
            </label>
            <label className="planner-span-2">
              Isi
              <textarea rows={3} defaultValue="Kelola tabungan, anggaran, tugas, dan rundown." />
            </label>
            <label>
              Aktif
              <select defaultValue="off">
                <option value="on">Aktif</option>
                <option value="off">Nonaktif</option>
              </select>
            </label>
          </>
        )}
      </div>

      <div className="actions">
        <button
          type="button"
          className="button secondary"
          onClick={() => setNotice(`Draf ${section?.label} disimpan (contoh).`)}
        >
          Simpan draf
        </button>
        <button
          type="button"
          className="button"
          onClick={() => setNotice(`Perubahan ${section?.label} diterbitkan (contoh).`)}
        >
          Terbitkan
        </button>
      </div>

      {notice && (
        <p className="notice" role="status">
          {notice}
        </p>
      )}

      <section className="planner-group">
        <h2>Riwayat versi (contoh)</h2>
        <div className="business-table">
          <table>
            <caption>Status draf dan publikasi per bagian</caption>
            <thead>
              <tr>
                <th scope="col">Bagian</th>
                <th scope="col">Draf terakhir</th>
                <th scope="col">Terbit terakhir</th>
              </tr>
            </thead>
            <tbody>
              {adminContentSectionsFixture.map((item) => (
                <tr key={item.key}>
                  <td>{item.label}</td>
                  <td>{item.draftSavedAt ?? "Belum ada draf"}</td>
                  <td>{item.publishedAt ?? "Belum diterbitkan"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}

export function AdminPaymentSettingsView() {
  const [notice, setNotice] = useState<string | null>(null);
  const [qrisAdded, setQrisAdded] = useState(false);

  return (
    <section className="planner-shell stack">
      <AdminPageHeader
        title="QRIS & Rekening"
        code="ADM-07"
        breadcrumb="Pengaturan Platform & Gateway"
        lead="Pengaturan kanal pembayaran statis dan rekening penerima pada data contoh."
      />
      <p className="notice">
        Pengaturan contoh. QRIS statis diberi label contoh dan tidak dapat dipakai untuk pembayaran;
        rekening ditampilkan tersamar.
      </p>

      <section className="planner-group">
        <h2>Gambar QRIS</h2>
        {adminPaymentSettingFixture.qrisLabel || qrisAdded ? (
          <div className="planner-card" style={{ maxWidth: 320 }}>
            <div className="planner-placeholder" style={{ aspectRatio: "1 / 1" }} role="img" aria-label="QRIS contoh">
              QRIS contoh — tidak untuk pembayaran
            </div>
            <span className="planner-badge" data-tone="warning">
              ! Contoh desain — tidak untuk pembayaran
            </span>
          </div>
        ) : (
          <PlannerEmpty
            message="Belum ada gambar QRIS. Unggah QRIS statis untuk ditampilkan pada checkout contoh."
            action={{ label: "Unggah QRIS (contoh)", onClick: () => setQrisAdded(true) }}
          />
        )}
      </section>

      <section className="planner-group">
        <h2>Rekening penerima</h2>
        <div className="business-table">
          <table>
            <caption>Rekening bank (data contoh, tersamar)</caption>
            <thead>
              <tr>
                <th scope="col">Bank</th>
                <th scope="col">Nomor</th>
                <th scope="col">Pemilik</th>
                <th scope="col">Aktif</th>
              </tr>
            </thead>
            <tbody>
              {adminPaymentSettingFixture.accounts.map((account) => (
                <tr key={account.id}>
                  <td>{account.bank}</td>
                  <td>{account.maskedNumber}</td>
                  <td>{account.holder}</td>
                  <td>{account.active ? "Aktif" : "Nonaktif"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="planner-form-grid">
        <label>
          Nomor WhatsApp admin
          <input defaultValue={adminPaymentSettingFixture.adminWhatsapp} />
        </label>
        <label className="planner-span-2">
          Template pesan konfirmasi
          <textarea rows={2} defaultValue={adminPaymentSettingFixture.messageTemplate} />
        </label>
      </div>

      <div className="actions">
        <button type="button" className="button" onClick={() => setNotice("Pengaturan disimpan (contoh).")}>
          Simpan
        </button>
      </div>

      {notice && (
        <p className="notice" role="status">
          {notice}
        </p>
      )}
    </section>
  );
}

export function AdminAuditView() {
  const [actionFilter, setActionFilter] = useState("ALL");
  const rows = adminAuditFixture.filter(
    (row) => actionFilter === "ALL" || row.action === actionFilter,
  );
  const actions = Array.from(new Set(adminAuditFixture.map((row) => row.action)));

  return (
    <section className="planner-shell stack">
      <AdminPageHeader
        title="Audit Log"
        code="ADM-06"
        breadcrumb="Audit Log Sistem & Keamanan"
        lead="Riwayat aksi admin hanya-baca; tidak tersedia penghapusan entri."
      />
      <p className="notice">
        Catatan audit hanya-baca. Tidak ada tombol hapus; entri dibuat oleh aksi admin pada
        implementasi nyata.
      </p>

      <div className="admin-stat-grid">
        <AdminStatCard
          label="Total catatan audit"
          value={`${adminAuditFixture.length} Entri`}
          note="Data contoh"
          hint="Seluruh aksi admin tercatat"
          icon="monitor"
          tone="primary"
        />
        <AdminStatCard
          label="Berhasil"
          value={`${adminAuditFixture.filter((row) => row.result === "SUCCESS").length} Entri`}
          note="Hasil aksi"
          hint="Tanpa galat pada data contoh"
          icon="task-alt"
          tone="tertiary"
        />
        <AdminStatCard
          label="Perlu peninjauan"
          value={`${adminAuditFixture.filter((row) => row.result !== "SUCCESS").length} Entri`}
          note="Hasil tidak berhasil"
          hint="Tidak ada penghapusan entri"
          icon="error"
          tone="danger"
        />
      </div>

      <div className="actions" style={{ marginBottom: 16 }}>
        <label>
          Aksi
          <select value={actionFilter} onChange={(event) => setActionFilter(event.target.value)}>
            <option value="ALL">Semua aksi</option>
            {actions.map((action) => (
              <option key={action} value={action}>
                {action}
              </option>
            ))}
          </select>
        </label>
      </div>

      {rows.length === 0 ? (
        <PlannerEmpty message="Belum ada catatan audit pada periode ini." />
      ) : (
        <div className="business-table">
          <table>
            <caption>Riwayat aksi admin (data contoh)</caption>
            <thead>
              <tr>
                <th scope="col">Waktu</th>
                <th scope="col">Aktor</th>
                <th scope="col">Aksi</th>
                <th scope="col">Target</th>
                <th scope="col">Alasan</th>
                <th scope="col">Hasil</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.at}</td>
                  <td>{row.actor}</td>
                  <td>{row.action}</td>
                  <td>{row.target}</td>
                  <td>{row.reason}</td>
                  <td>
                    <span className="planner-badge" data-tone={row.result === "SUCCESS" ? "success" : "danger"}>
                      {row.result === "SUCCESS" ? "✓" : "!"} {auditResultLabels[row.result]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export function AdminLandingPreviewView() {
  return (
    <section className="planner-shell stack">
      <AdminPageHeader
        title="Pratinjau Landing"
        breadcrumb="Pratinjau Halaman Publik"
        lead="Pratinjau draf beranda publik dengan konten contoh; tidak diindeks."
      />
      <p className="notice" role="status">
        DRAF — belum diterbitkan. Pratinjau memakai konten contoh; tidak diindeks.
      </p>
      <article className="planner-card">
        <p className="eyebrow">CONTOH HERO</p>
        <h2>Undangan untuk hari kalian.</h2>
        <p>Pilih desain, isi acara, lalu bagikan. Tamu mudah menemukan lokasi dan memberi kabar kehadiran.</p>
        <div className="actions">
          <span className="button">Lihat desain (contoh)</span>
          <span className="button secondary">Buka contoh undangan (contoh)</span>
        </div>
      </article>
      <div className="actions">
        <Link className="button secondary" href="/admin/content">
          Kembali ke Kelola Konten
        </Link>
      </div>
    </section>
  );
}
