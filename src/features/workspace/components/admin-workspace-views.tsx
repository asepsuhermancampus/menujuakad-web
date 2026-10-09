import Link from "next/link";
import { getAdminUsers, getAdminInvitations } from "@/server/admin/query";
function Pagination({ page, count, path }: { page: number; count: number; path: string }) {
  return (
    <nav className="actions" aria-label="Pagination">
      <span>Halaman {page} · Maksimal 25 data</span>
      {page > 1 && <Link href={`${path}?page=${page - 1}`}>Sebelumnya</Link>}
      {count === 25 && <Link href={`${path}?page=${page + 1}`}>Berikutnya</Link>}
    </nav>
  );
}
export async function AdminUsersView({ page }: { page: number }) {
  const users = await getAdminUsers(page);
  return (
    <section className="stack">
      <h1>Akun Pengujian</h1>
      <p>
        Daftar baca-saja dibatasi whitelist satu superadmin dan sepuluh customer dummy. Hash
        password dan sesi tidak ditampilkan.
      </p>
      <div className="table-scroll">
        <table>
          <caption>Akun database preproduction</caption>
          <thead>
            <tr>
              <th>Email</th>
              <th>Nama</th>
              <th>Peran</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.email}</td>
                <td>{user.name ?? "Belum diisi"}</td>
                <td>{user.role}</td>
                <td>{user.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {users.length === 0 && <p>Belum ada akun pada halaman ini.</p>}
      <Pagination page={page} count={users.length} path="/admin/users" />
    </section>
  );
}
export async function AdminInvitationsView({ page }: { page: number }) {
  const invitations = await getAdminInvitations(page);
  return (
    <section className="stack">
      <h1>Undangan Pengujian</h1>
      <p>
        Data baca-saja milik akun customer pengujian. Akses isi editor tetap pada pemilik; admin
        tidak memperoleh sesi atau kredensial.
      </p>
      <div className="table-scroll">
        <table>
          <caption>Undangan database preproduction</caption>
          <thead>
            <tr>
              <th>Judul</th>
              <th>Pemilik</th>
              <th>Alamat</th>
              <th>Status</th>
              <th>Publikasi</th>
            </tr>
          </thead>
          <tbody>
            {invitations.map((invitation) => (
              <tr key={invitation.id}>
                <td>{invitation.title}</td>
                <td>{invitation.owner.email}</td>
                <td>{invitation.slug}</td>
                <td>{invitation.status}</td>
                <td>{invitation.isPublished ? "Terbit" : "Privat"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {invitations.length === 0 && <p>Belum ada undangan pada halaman ini.</p>}
      <Pagination page={page} count={invitations.length} path="/admin/invitations" />
    </section>
  );
}
