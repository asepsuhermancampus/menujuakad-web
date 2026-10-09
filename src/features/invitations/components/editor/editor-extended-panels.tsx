"use client";
import type { EditorPreviewDto } from "@/features/design-preview/data/fixtures";
import { EditorField, EditorToggle, type EditorFieldProps } from "./editor-field";

/*
 * Panel editor EDT-15..20 (lokasi, ayat, rundown, protokol, kontak, kolofon).
 * Semua nilai hanya fixture lokal; tidak menghubungi peta, penyimpanan, atau
 * layanan pihak ketiga. Label "contoh" wajib tampil agar tidak diklaim aktif.
 * Panel ini menerima `fixture` untuk data terstruktur (rundown/kontak) yang
 * tidak disimpan pada EditorDraft bertipe Record<string, string>.
 */
type ExtendedPanelProps = EditorFieldProps & { fixture: EditorPreviewDto };

export function LocationPanel(props: ExtendedPanelProps) {
  return (
    <>
      <h1>Lokasi & Peta Digital</h1>
      <p>Tandai tempat acara dengan jelas untuk tamu.</p>
      <article className="card stack">
        <h2>Detail Lokasi</h2>
        <EditorField {...props} name="locationVenue" label="Nama tempat (contoh)" />
        <EditorField {...props} name="locationAddress" label="Alamat contoh" />
        <EditorToggle {...props} name="locationShowMap" label="Tampilkan peta contoh" />
        <p className="notice">
          Peta, geocoding, dan tautan arah belum terhubung; nilai ini hanya contoh tata letak.
        </p>
      </article>
      <article className="card stack">
        <h2>Pratinjau Peta</h2>
        <div className="gallery-placeholder">
          <small>Slot peta ilustratif · tanpa embed penyedia peta</small>
        </div>
        <EditorField {...props} name="locationMapLabel" label="Label tautan peta contoh" />
      </article>
    </>
  );
}

export function VersePanel(props: ExtendedPanelProps) {
  return (
    <>
      <h1>Ayat Suci & Mukadimah</h1>
      <p>Buka undangan dengan kutipan yang bermakna.</p>
      <article className="card stack">
        <h2>Kutipan</h2>
        <EditorToggle {...props} name="verseEnabled" label="Tampilkan bagian ayat contoh" />
        <EditorField {...props} name="verseSource" label="Sumber kutipan (contoh)" />
        <EditorField {...props} name="verseText" label="Teks kutipan contoh" multiline />
        <EditorField {...props} name="verseTranslation" label="Label terjemahan contoh" />
        <p className="notice">
          Teks ini contoh editorial; verifikasi rujukan sebelum dipakai pada undangan nyata.
        </p>
      </article>
    </>
  );
}

export function RundownPanel(props: ExtendedPanelProps) {
  return (
    <>
      <h1>Susunan Acara & Rundown</h1>
      <p>Susun urutan acara agar tamu mengikuti alurnya.</p>
      <article className="card stack">
        <h2>Urutan Contoh</h2>
        <ul>
          {props.fixture.rundown.items.map((item) => (
            <li key={item.id}>
              <strong>{item.timeLabel}</strong> · {item.title} <small>({item.note})</small>
            </li>
          ))}
        </ul>
        <p className="notice">
          Rundown ini fixture lokal; pengurutan tersimpan hanya selama sesi preview.
        </p>
      </article>
    </>
  );
}

export function ProtocolPanel(props: ExtendedPanelProps) {
  return (
    <>
      <h1>Protokol Acara & Info Tambahan</h1>
      <p>Sampaikan informasi penting tanpa membuat tamu bingung.</p>
      <article className="card stack">
        <h2>Catatan Protokol</h2>
        <EditorToggle {...props} name="protocolEnabled" label="Tampilkan bagian protokol contoh" />
        <EditorField {...props} name="protocolHealth" label="Catatan kesehatan contoh" />
        <EditorField {...props} name="protocolDress" label="Catatan berpakaian contoh" />
        <EditorField {...props} name="protocolParking" label="Catatan parkir contoh" />
        <p className="notice">
          Protokol ini ilustrasi; bukan instruksi resmi penyelenggara atau venue.
        </p>
      </article>
    </>
  );
}

export function ContactPanel(props: ExtendedPanelProps) {
  return (
    <>
      <h1>Kontak Narahubung & Concierge</h1>
      <p>Beri tamu jalur bantuan yang jelas.</p>
      <article className="card stack">
        <h2>Daftar Kontak Contoh</h2>
        <ul>
          {props.fixture.contact.contacts.map((contact) => (
            <li key={contact.id}>
              <strong>{contact.roleLabel}</strong> · {contact.nameLabel}
            </li>
          ))}
        </ul>
        <p className="notice">
          Nomor telepon, email, dan tautan WhatsApp tidak disertakan pada preview sintetis.
        </p>
      </article>
    </>
  );
}

export function ColophonPanel(props: ExtendedPanelProps) {
  return (
    <>
      <h1>Kolofon & Kredit Desain</h1>
      <p>Tutup undangan dengan kredit yang pantas.</p>
      <article className="card stack">
        <h2>Kredit</h2>
        <EditorToggle {...props} name="colophonEnabled" label="Tampilkan bagian kolofon contoh" />
        <EditorField {...props} name="colophonCredit" label="Label kredit contoh" />
        <EditorField {...props} name="colophonNote" label="Catatan kolofon contoh" multiline />
        <p className="notice">
          Kredit ini contoh editorial; bukan kredit produksi final atau lisensi aset.
        </p>
      </article>
    </>
  );
}
