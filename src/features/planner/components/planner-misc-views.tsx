"use client";

import Link from "next/link";
import { useState } from "react";
import {
  announcementFixture,
  coupleInvitesFixture,
  coupleMembersFixture,
  engagementFixture,
  moodboardBoardsFixture,
  weddingKitFixture,
  weddingKitOrdersFixture,
  type MoodboardBoardDto,
} from "@/features/design-preview/data/planner-misc-fixtures";
import {
  PlannerEmpty,
  PlannerModal,
  PlannerShell,
} from "@/features/planner/components/planner-shell";
import {
  formatIdrPlain,
  inviteStatusLabels,
  kitOrderStatusLabels,
  moodboardCategoryLabels,
} from "@/features/planner/lib/presentation";

export function PlannerEngagementView() {
  const [active, setActive] = useState(engagementFixture.active);
  const spentRatio = engagementFixture.budgetIdr
    ? (engagementFixture.spentIdr / engagementFixture.budgetIdr) * 100
    : 0;

  return (
    <PlannerShell title="Lamaran" code="PLN-12" subnav="/dashboard/planner/engagement">
      {!active ? (
        <PlannerEmpty
          message="Perencanaan lamaran belum aktif. Aktifkan bila Anda sedang menyiapkan lamaran."
          action={{ label: "Aktifkan (contoh)", onClick: () => setActive(true) }}
        />
      ) : (
        <>
          <div className="planner-summary">
            <article>
              <h2>Anggaran lamaran</h2>
              <strong>{formatIdrPlain(engagementFixture.budgetIdr)}</strong>
              <small>Terpakai {formatIdrPlain(engagementFixture.spentIdr)} (contoh)</small>
            </article>
            <article>
              <h2>Tamu lamaran</h2>
              <strong>{engagementFixture.guestCount}</strong>
              <small>Perkiraan undangan contoh</small>
            </article>
            <article>
              <h2>Tanggal</h2>
              <strong>{engagementFixture.date}</strong>
              <small>{engagementFixture.eventName}</small>
            </article>
          </div>
          <div className="planner-progress" style={{ marginBottom: 24 }} aria-hidden="true">
            <span style={{ width: `${Math.min(spentRatio, 100)}%` }} />
          </div>
          <div className="actions">
            <button type="button" className="button secondary" onClick={() => setActive(false)}>
              Tandai lamaran selesai (contoh)
            </button>
          </div>
        </>
      )}
      <p className="notice" style={{ marginTop: 20 }}>
        Perencanaan lamaran memakai angka contoh. Modul tabungan, anggaran, tugas, dan rundown dapat
        difilter ke konteks Lamaran melalui pemilih konteks acara.
      </p>
    </PlannerShell>
  );
}

export function PlannerMoodboardView() {
  const [boards, setBoards] = useState<readonly MoodboardBoardDto[]>(moodboardBoardsFixture);
  const [activeBoard, setActiveBoard] = useState(moodboardBoardsFixture[0]?.id ?? "");
  const [boardModalOpen, setBoardModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [searchCategory, setSearchCategory] = useState("DEKORASI");

  const board = boards.find((item) => item.id === activeBoard);
  const searchResults = moodboardBoardsFixture
    .flatMap((item) => item.items)
    .filter((item) => item.category === searchCategory)
    .slice(0, 4);

  return (
    <PlannerShell title="Moodboard" code="PLN-13" subnav="/dashboard/planner/moodboard">
      <div className="actions" style={{ marginBottom: 20 }}>
        <button type="button" className="button" onClick={() => setBoardModalOpen(true)}>
          Papan baru
        </button>
        <span className="planner-badge">Katalog contoh</span>
      </div>

      {boards.length === 0 ? (
        <PlannerEmpty
          message="Papan masih kosong. Simpan referensi pertama."
          action={{ label: "Papan baru", onClick: () => setBoardModalOpen(true) }}
        />
      ) : (
        <>
          <div className="actions" style={{ marginBottom: 16 }}>
            {boards.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`button ${item.id === activeBoard ? "" : "secondary"}`}
                aria-pressed={item.id === activeBoard}
                onClick={() => setActiveBoard(item.id)}
              >
                {item.name} ({item.items.length})
              </button>
            ))}
            <button
              type="button"
              className="button ghost"
              onClick={() => {
                setBoards((previous) => previous.filter((item) => item.id !== activeBoard));
                setActiveBoard("");
              }}
              disabled={!activeBoard}
            >
              Hapus papan
            </button>
          </div>

          {board && (
            <div className="planner-grid-cards">
              {board.items.map((item) => (
                <article className="planner-card" key={item.id}>
                  <div className="planner-placeholder" role="img" aria-label={`${item.title} (placeholder)`}>
                    {item.title}
                  </div>
                  <p>{moodboardCategoryLabels[item.category]} · rasio {item.ratio}</p>
                </article>
              ))}
            </div>
          )}
        </>
      )}

      <section className="planner-group" style={{ marginTop: 28 }}>
        <h2>Pencarian inspirasi (contoh)</h2>
        <div className="actions" style={{ marginBottom: 12 }}>
          <label>
            Kategori
            <select value={searchCategory} onChange={(event) => setSearchCategory(event.target.value)}>
              {Object.entries(moodboardCategoryLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Kata kunci
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Contoh: rustic" />
          </label>
        </div>
        {searchResults.length === 0 ? (
          <PlannerEmpty message="Tidak ada hasil pada kategori ini." />
        ) : (
          <div className="planner-grid-cards">
            {searchResults.map((item) => (
              <article className="planner-card" key={`search-${item.id}`}>
                <div className="planner-placeholder" role="img" aria-label={`${item.title} (placeholder)`}>
                  {item.title}
                </div>
                <button
                  type="button"
                  className="button secondary"
                  onClick={() =>
                    setBoards((previous) =>
                      previous.map((entry) =>
                        entry.id === activeBoard
                          ? {
                              ...entry,
                              items: [
                                ...entry.items,
                                { ...item, id: `${item.id}-copy-${entry.items.length}` },
                              ],
                            }
                          : entry,
                      ),
                    )
                  }
                  disabled={!activeBoard}
                >
                  Simpan ke papan
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      <p className="notice">
        Gambar adalah placeholder; katalog contoh tidak memuat foto pihak ketiga.
      </p>

      {boardModalOpen && (
        <PlannerModal title="Papan baru (contoh)" onClose={() => setBoardModalOpen(false)}>
          <div className="planner-form-grid">
            <label className="planner-span-2">
              Nama papan
              <input placeholder="Contoh: Dekorasi Rustic" />
            </label>
            <p className="planner-impact">Form contoh; belum ada penyimpanan.</p>
          </div>
        </PlannerModal>
      )}
    </PlannerShell>
  );
}

export function PlannerWeddingKitView() {
  const [detailId, setDetailId] = useState<string | null>(null);
  const detail = weddingKitFixture.find((product) => product.id === detailId);

  return (
    <PlannerShell title="Wedding Kit" code="PLN-14" subnav="/dashboard/planner/wedding-kit">
      <p className="notice">Produk contoh — pembayaran belum aktif.</p>
      <div className="planner-grid-cards">
        {weddingKitFixture.map((product) => (
          <article className="planner-card" key={product.id}>
            <h3>{product.name}</h3>
            <p>{product.summary}</p>
            <strong>{formatIdrPlain(product.priceIdr)}</strong>
            <span className="planner-badge">{product.format}</span>
            <button type="button" className="button secondary" onClick={() => setDetailId(product.id)}>
              Lihat detail
            </button>
          </article>
        ))}
      </div>

      <section className="planner-group" style={{ marginTop: 28 }}>
        <h2>Riwayat pembelian (contoh)</h2>
        {weddingKitOrdersFixture.length === 0 ? (
          <PlannerEmpty message="Belum ada pembelian produk." />
        ) : (
          <div className="business-table">
            <table>
              <caption>Riwayat pembelian produk digital (data contoh)</caption>
              <thead>
                <tr>
                  <th scope="col">Produk</th>
                  <th scope="col">Tanggal</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {weddingKitOrdersFixture.map((order) => (
                  <tr key={order.id}>
                    <td>{order.productName}</td>
                    <td>{order.orderedAt}</td>
                    <td>{kitOrderStatusLabels[order.status]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="notice">
        Katalog dan riwayat adalah contoh; tidak ada transaksi atau berkas yang dikirim.
      </p>

      {detail && (
        <PlannerModal title={detail.name} onClose={() => setDetailId(null)}>
          <p>{detail.summary}</p>
          <ul>
            {detail.contents.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <p>
            Harga contoh: <strong>{formatIdrPlain(detail.priceIdr)}</strong>
          </p>
          <p className="notice">Pembelian belum aktif; tombol ini tidak membuat pesanan.</p>
          <div className="planner-modal-actions">
            <button type="button" className="button" disabled>
              Beli (belum aktif)
            </button>
          </div>
        </PlannerModal>
      )}
    </PlannerShell>
  );
}

export function PlannerCoupleView() {
  const [members] = useState(coupleMembersFixture);
  const [invites, setInvites] = useState(coupleInvitesFixture);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const full = members.length >= 2;

  return (
    <PlannerShell title="Pasangan" code="PLN-15" subnav="/dashboard/planner/couple">
      <div className="planner-summary">
        <article>
          <h2>Anggota workspace</h2>
          <strong>
            {members.length}/2
          </strong>
          <small>Maksimal dua anggota</small>
        </article>
        <article>
          <h2>Undangan aktif</h2>
          <strong>{invites.filter((invite) => invite.status === "PENDING").length}</strong>
          <small>Satu undangan aktif pada satu waktu</small>
        </article>
        <article>
          <h2>Status sinkronisasi</h2>
          <strong>Belum aktif</strong>
          <small>Penyimpanan bersama belum tersedia</small>
        </article>
      </div>

      <div className="planner-list" style={{ marginBottom: 24 }}>
        {members.map((member) => (
          <article className="planner-member" key={member.id}>
            <span className="planner-member-initials" aria-hidden="true">
              {member.name.slice(0, 1)}
            </span>
            <div style={{ flex: 1 }}>
              <strong>{member.name}</strong>
              <p style={{ margin: 0, fontSize: 12, color: "var(--color-taupe)" }}>
                {member.maskedEmail} · {member.role === "OWNER" ? "Pemilik" : "Pasangan"}
              </p>
            </div>
          </article>
        ))}
      </div>

      {full ? (
        <p className="notice" role="status">
          Workspace sudah berisi 2 anggota. Keluarkan anggota sebelum mengundang yang lain.
        </p>
      ) : (
        <div className="actions" style={{ marginBottom: 20 }}>
          <button type="button" className="button" onClick={() => setInviteOpen(true)}>
            Undang pasangan
          </button>
        </div>
      )}

      <section className="planner-group">
        <h2>Riwayat undangan</h2>
        {invites.length === 0 ? (
          <PlannerEmpty message="Belum ada undangan pasangan. Undang pasangan untuk mulai bekerja bersama." />
        ) : (
          <div className="planner-list">
            {invites.map((invite) => (
              <article className="planner-row" key={invite.id}>
                <div>
                  <h3>{invite.invitedLabel}</h3>
                  <p>
                    Dikirim {invite.sentAt} · kedaluwarsa dalam {invite.expiresInDays} hari
                  </p>
                </div>
                <div className="planner-row-actions">
                  <span className="planner-badge">{inviteStatusLabels[invite.status]}</span>
                  <button
                    type="button"
                    className="button secondary"
                    onClick={() => setCopied(true)}
                  >
                    Salin tautan
                  </button>
                  <button
                    type="button"
                    className="button ghost"
                    onClick={() =>
                      setInvites((previous) => previous.filter((item) => item.id !== invite.id))
                    }
                  >
                    Batalkan
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {copied && (
        <p className="notice" role="status">
          Tautan contoh disalin (tidak ada tautan nyata; belum ada pengiriman).
        </p>
      )}

      {inviteOpen && (
        <PlannerModal title="Undang pasangan (contoh)" onClose={() => setInviteOpen(false)}>
          <div className="planner-form-grid">
            <label className="planner-span-2">
              Nama pasangan
              <input placeholder="Contoh: Kirana" />
            </label>
            <p className="planner-impact">
              Form contoh. Undangan tidak dikirim dan tautan tidak dibuat; integrasi email/undangan
              belum aktif.
            </p>
          </div>
          <div className="planner-modal-actions">
            <button
              type="button"
              className="button"
              onClick={() => {
                setInvites([
                  {
                    id: "demo-invite-01",
                    invitedLabel: "Kirana (contoh)",
                    sentAt: "2026-10-07",
                    expiresInDays: 7,
                    status: "PENDING",
                  },
                ]);
                setInviteOpen(false);
              }}
            >
              Buat undangan (contoh)
            </button>
          </div>
        </PlannerModal>
      )}
    </PlannerShell>
  );
}

export function PlannerOnboardingView() {
  const [step, setStep] = useState(1);
  const [finished, setFinished] = useState(false);

  return (
    <PlannerShell title="Onboarding" code="PLN-16" subnav="/dashboard/planner/onboarding">
      {finished ? (
        <div className="planner-empty">
          <p>Workspace siap. Mulai dari menyusun anggaran.</p>
          <Link className="button" href="/dashboard/planner/budget">
            Buka Anggaran
          </Link>
        </div>
      ) : (
        <>
          <div className="planner-wizard-steps" aria-label="Langkah onboarding">
            {[1, 2, 3].map((value) => (
              <span key={value} data-active={step === value}>
                Langkah {value}
              </span>
            ))}
          </div>
          <div className="planner-form-grid">
            {step === 1 && (
              <>
                <label>
                  Nama kamu
                  <input placeholder="Contoh: Asep" />
                </label>
                <label>
                  Nama pasangan
                  <input placeholder="Contoh: Kirana" />
                </label>
              </>
            )}
            {step === 2 && (
              <>
                <label>
                  Tanggal pernikahan
                  <input type="date" defaultValue="2026-10-18" />
                </label>
                <label>
                  Zona waktu
                  <select defaultValue="Asia/Jakarta">
                    <option>Asia/Jakarta</option>
                    <option>Asia/Makassar</option>
                    <option>Asia/Jayapura</option>
                  </select>
                </label>
              </>
            )}
            {step === 3 && (
              <>
                <label>
                  Target dana (Rp)
                  <input inputMode="numeric" defaultValue="85000000" />
                </label>
                <label>
                  Mata uang
                  <input value="IDR (terkunci)" readOnly />
                </label>
              </>
            )}
            <p className="planner-impact">
              Langkah contoh; data tidak disimpan. Setelah selesai, halaman mengarah ke modul
              Anggaran sebagai langkah berikutnya.
            </p>
          </div>
          <div className="actions">
            <button
              type="button"
              className="button secondary"
              onClick={() => setStep((value) => Math.max(1, value - 1))}
              disabled={step === 1}
            >
              Kembali
            </button>
            {step < 3 ? (
              <button type="button" className="button" onClick={() => setStep((value) => value + 1)}>
                Lanjut
              </button>
            ) : (
              <button type="button" className="button" onClick={() => setFinished(true)}>
                Selesai
              </button>
            )}
          </div>
        </>
      )}
      <p className="notice">
        Onboarding ini contoh alur. Persentase progres dan target dana belum dihitung server.
      </p>
    </PlannerShell>
  );
}

export function PlannerAnnouncementModal() {
  const [open, setOpen] = useState(true);
  if (!announcementFixture.active || !open) return null;
  return (
    <PlannerModal title={announcementFixture.title} onClose={() => setOpen(false)}>
      <div
        className="planner-placeholder"
        style={{ aspectRatio: "16 / 9" }}
        role="img"
        aria-label="Gambar pengumuman (placeholder)"
      >
        Gambar pengumuman (placeholder)
      </div>
      <p>{announcementFixture.body}</p>
      <div className="planner-modal-actions">
        <a className="button" href={announcementFixture.ctaHref}>
          {announcementFixture.ctaLabel}
        </a>
      </div>
    </PlannerModal>
  );
}
