import Link from "next/link";
import { createElement } from "react";
import {
  listCustomerTestRequests,
  listCustomerBillingDrafts,
  getCustomerTestRequest,
} from "@/server/billing/service";
import { testingPackages } from "@/server/billing/catalog";
import { formatTestIdr, qrisWarning, testStatusLabel } from "./contracts";
import type { TestRequestDto } from "./contracts";
import { TestRequestForm } from "./test-request-form";
import styles from "./billing-actual.module.css";
function RequestSummary({ request }: { request: TestRequestDto }) {
  return (
    <dl className={styles.summary}>
      <div>
        <dt>Nominal uji</dt>
        <dd>{formatTestIdr(request.amountIdr)}</dd>
      </div>
      <div>
        <dt>Undangan privat</dt>
        <dd>{request.invitationTitle}</dd>
      </div>
      <div>
        <dt>Paket pengujian</dt>
        <dd>{request.packageSlug}</dd>
      </div>
      <div>
        <dt>Dibuat</dt>
        <dd>
          <time dateTime={request.createdAt}>
            {new Date(request.createdAt).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })} WIB
          </time>
        </dd>
      </div>
      <div>
        <dt>Catatan deklarasi customer</dt>
        <dd>{request.reference || "Tidak ada catatan"}</dd>
      </div>
      {request.reviewedAt && (
        <div>
          <dt>Review manual</dt>
          <dd>
            <time dateTime={request.reviewedAt}>
              {new Date(request.reviewedAt).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })}{" "}
              WIB
            </time>
          </dd>
        </div>
      )}
    </dl>
  );
}
export async function CustomerBillingView() {
  const requests = await listCustomerTestRequests();
  return (
    <section className="stack">
      <div className="workspace-title">
        <div>
          <p className="eyebrow">Workspace pengujian</p>
          <h1>Tagihan Uji</h1>
        </div>
        <Link className="button" href="/dashboard/billing/packages">
          Pilih nominal uji
        </Link>
      </div>
      <p>
        Riwayat dari database akun Anda, maksimal 100 request terbaru. Status ini hanya status
        pengujian; persetujuan tidak mengaktifkan undangan.
      </p>
      {!requests.length ? (
        <p className="card">
          Belum ada permintaan uji. Pilih nominal dan draft privat untuk memulai pengujian.
        </p>
      ) : (
        <div className="grid-two">
          {requests.map((request) => (
            <article className="card stack" key={request.id}>
              <h2>{request.invitationTitle}</h2>
              <span className="badge">{testStatusLabel[request.status]}</span>
              <p>
                {formatTestIdr(request.amountIdr)} · {request.packageSlug}
              </p>
              <Link href={`/dashboard/billing/checkout/${encodeURIComponent(request.id)}`}>
                Buka detail permintaan uji
              </Link>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
export async function TestingPackagesView() {
  const drafts = await listCustomerBillingDrafts();
  return (
    <section className="stack">
      <Link href="/dashboard/billing">← Riwayat tagihan uji</Link>
      <h1>Pilih Nominal Pengujian</h1>
      <p>
        Rp1.000, Rp2.000 dan Rp3.000 adalah nominal uji yang ditetapkan server. Tidak memberikan
        entitlement komersial, fitur premium atau masa aktif.
      </p>
      {drafts.length ? (
        <TestRequestForm drafts={drafts} packages={testingPackages} />
      ) : (
        <div className="card stack">
          <p>
            Buat draft privat terlebih dahulu. Hanya draft milik Anda yang belum diterbitkan dapat
            dipakai.
          </p>
          <Link href="/dashboard/invitations/new">Buat draft privat</Link>
        </div>
      )}
    </section>
  );
}
export async function TestingCheckoutView({ id }: { id: string }) {
  const request = await getCustomerTestRequest(id);
  return (
    <section className="stack">
      <Link href="/dashboard/billing">← Riwayat tagihan uji</Link>
      <h1>Detail QRIS Pengujian</h1>
      <span className="badge">{testStatusLabel[request.status]}</span>
      <p>
        Persetujuan uji tidak membuktikan dana diterima dan tidak mengaktifkan undangan. Tidak ada
        verifikasi otomatis, invoice atau Mayar aktif.
      </p>
      <div className={styles.checkout}>
        <article className="card stack">
          <h2>
            {request.status === "REQUESTED"
              ? "QRIS statis milik pengelola"
              : "Keputusan pengujian tersimpan"}
          </h2>
          {request.status === "REQUESTED" ? (
            <>
              <p className={styles.warning}>{qrisWarning}</p>
              {createElement("img", {
                src: "/api/billing/testing-qris",
                alt: "QRIS statis pengujian; pemindaian dapat memindahkan dana nyata",
                width: 668,
                height: 664,
                className: styles.qris,
                loading: "eager",
              })}
              <ol>
                <li>Jika melanjutkan pengujian, periksa penerima di aplikasi bank Anda.</li>
                <li>
                  Masukkan nominal uji {formatTestIdr(request.amountIdr)}. QRIS statis tidak
                  menautkan transfer secara otomatis ke request ini.
                </li>
                <li>
                  Jangan mengirim ulang dana ketika menunggu review. Catatan Anda adalah deklarasi,
                  bukan bukti provider.
                </li>
              </ol>
              <p>
                Review admin dilakukan manual. Muat ulang halaman untuk membaca status terbaru dari
                database; tidak ada polling atau pemeriksaan saldo otomatis.
              </p>
            </>
          ) : (
            <>
              <p>
                QRIS disembunyikan agar detail riwayat tidak mengarahkan transfer ulang. Keputusan
                akhir tidak dapat ditimpa.
              </p>
              <Link href="/dashboard/billing/packages">Buat permintaan uji baru</Link>
              <p>Permintaan baru menyimpan riwayat lama dan tidak mengembalikan dana.</p>
            </>
          )}
        </article>
        <aside className="card stack">
          <h2>Ringkasan permintaan uji</h2>
          <p className={styles.identifier}>ID: {request.id}</p>
          <RequestSummary request={request} />
          <Link href={`/dashboard/invitations/${encodeURIComponent(request.invitationId)}`}>
            Kembali ke draft privat
          </Link>
        </aside>
      </div>
    </section>
  );
}
