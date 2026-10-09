import {
  rsvpStatusLabels,
  type GuestPreviewDto,
} from "@/features/design-preview/data/guests-fixtures";
import { guestGroupLabels } from "../lib/guest-labels";

export function GuestTable({ guests }: { guests: readonly GuestPreviewDto[] }) {
  return (
    <div className="business-table guest-table">
      <table role="table">
        <caption>Daftar tamu sintetis</caption>
        <thead role="rowgroup">
          <tr role="row">
            <th role="columnheader" scope="col">
              Nama
            </th>
            <th role="columnheader" scope="col">
              Grup
            </th>
            <th role="columnheader" scope="col">
              Alokasi kursi
            </th>
            <th role="columnheader" scope="col">
              RSVP
            </th>
            <th role="columnheader" scope="col">
              Pengiriman contoh
            </th>
          </tr>
        </thead>
        <tbody role="rowgroup">
          {guests.map((guest) => (
            <tr role="row" key={guest.id}>
              <td role="cell">
                <span className="guest-cell-label" aria-hidden="true">
                  Nama
                </span>
                {guest.displayName}
              </td>
              <td role="cell">
                <span className="guest-cell-label" aria-hidden="true">
                  Grup
                </span>
                {guestGroupLabels[guest.group]}
              </td>
              <td role="cell">
                <span className="guest-cell-label" aria-hidden="true">
                  Alokasi kursi
                </span>
                {guest.partySize} kursi
              </td>
              <td role="cell">
                <span className="guest-cell-label" aria-hidden="true">
                  RSVP
                </span>
                <span className="badge guest-rsvp-badge" data-status={guest.rsvpStatus}>
                  {rsvpStatusLabels[guest.rsvpStatus]}
                </span>
              </td>
              <td role="cell">
                <span className="guest-cell-label" aria-hidden="true">
                  Pengiriman contoh
                </span>
                {guest.deliveryStatus === "NOT_SENT" ? "Belum dikirim" : "Ilustrasi terkirim"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!guests.length && <p className="notice">Tidak ada tamu contoh yang cocok.</p>}
    </div>
  );
}
