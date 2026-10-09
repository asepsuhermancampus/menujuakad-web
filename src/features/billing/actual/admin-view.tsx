import { listAdminPaymentTests } from "@/server/billing/service";
import { formatTestIdr, testStatusLabel } from "./contracts";
import { TestReviewActions } from "./test-review-actions";
import styles from "./billing-actual.module.css";
export async function AdminPaymentTestsView() {
  const requests = await listAdminPaymentTests();
  return (
    <section className="stack">
      <p className="eyebrow">Superadmin · pengujian</p>
      <h1>Review QRIS Pengujian</h1>
      <p>
        Menampilkan maksimal 100 request terbaru dari database. Review manual hanya menetapkan
        status TEST; tidak membuktikan pembayaran, tidak menerbitkan invoice dan tidak mengaktifkan
        undangan.
      </p>
      <p>
        Catatan adalah deklarasi customer, bukan bukti transfer atau verifikasi Mayar. Tidak ada
        rekonsiliasi otomatis, refund atau uploader bukti.
      </p>
      {!requests.length ? (
        <p className="card">Belum ada permintaan pengujian.</p>
      ) : (
        <div className="stack">
          {requests.map((request) => (
            <article className="card stack" key={request.id}>
              <div className="workspace-title">
                <h2>{request.invitationTitle}</h2>
                <span className="badge">{testStatusLabel[request.status]}</span>
              </div>
              <dl className={styles.summary}>
                <div>
                  <dt>ID permintaan</dt>
                  <dd className={styles.identifier}>{request.id}</dd>
                </div>
                <div>
                  <dt>Customer</dt>
                  <dd>{request.customerEmail}</dd>
                </div>
                <div>
                  <dt>Paket / nominal uji</dt>
                  <dd>
                    {request.packageSlug} · {formatTestIdr(request.amountIdr)}
                  </dd>
                </div>
                <div>
                  <dt>Catatan deklarasi customer</dt>
                  <dd>{request.reference || "Tidak ada catatan"}</dd>
                </div>
                <div>
                  <dt>Dibuat</dt>
                  <dd>
                    <time dateTime={request.createdAt}>
                      {new Date(request.createdAt).toLocaleString("id-ID", {
                        timeZone: "Asia/Jakarta",
                      })}{" "}
                      WIB
                    </time>
                  </dd>
                </div>
                {request.reviewedAt && (
                  <div>
                    <dt>Direview manual</dt>
                    <dd>
                      <time dateTime={request.reviewedAt}>
                        {new Date(request.reviewedAt).toLocaleString("id-ID", {
                          timeZone: "Asia/Jakarta",
                        })}{" "}
                        WIB
                      </time>{" "}
                      · reviewer {request.reviewedByUserId || "tidak tersedia"}
                    </dd>
                  </div>
                )}
              </dl>
              {request.status === "REQUESTED" ? (
                <TestReviewActions id={request.id} />
              ) : (
                <p>Keputusan tersimpan; persetujuan/penolakan berikutnya ditolak server.</p>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
