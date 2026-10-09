"use client";
import { LocalPreviewForm } from "@/components/shared/local-preview-form";
import Link from "next/link";
import { templatesFixture } from "@/features/design-preview/data/fixtures";
import { InvitationMedia } from "@/components/shared/invitation-media";
import { useInvitationWizard } from "../../hooks/use-invitation-wizard";
export function InvitationWizard() {
  const wizard = useInvitationWizard();
  const template = templatesFixture.find((item) => item.id === wizard.template)!;
  return (
    <>
      <p className="eyebrow">SEBUAH AWAL YANG INDAH</p>
      <h1>Buat Undangan Baru</h1>
      <ol className="wizard-steps">
        {["Desain", "Pasangan", "Acara", "Sapaan", "Tinjau"].map((label, index) => (
          <li className={index + 1 === wizard.step ? "active" : ""} key={label}>
            {index + 1}. {label}
          </li>
        ))}
      </ol>
      <div className="wizard-layout">
        <LocalPreviewForm
          className="card stack"
          onSubmit={(e) => {
            e.preventDefault();
            if (wizard.step === 5) wizard.finish();
            else wizard.next();
          }}
        >
          {wizard.step === 1 && (
            <>
              <h2>Pilih Desain Kalian</h2>
              <div className="stack">
                {templatesFixture.map((item) => (
                  <label key={item.id} className="card">
                    <span className="check">
                      <input
                        type="radio"
                        name="template"
                        checked={wizard.template === item.id}
                        onChange={() => wizard.setTemplate(item.id)}
                      />
                      {item.name}
                    </span>
                    <p>{item.description}</p>
                  </label>
                ))}
              </div>
            </>
          )}
          {wizard.step === 2 && (
            <>
              <h2>Profil Pasangan</h2>
              <div className="grid-two">
                <label>
                  Nama pasangan pertama
                  <input
                    required
                    value={wizard.names.one}
                    onChange={(e) => wizard.setNames({ ...wizard.names, one: e.target.value })}
                  />
                </label>
                <label>
                  Nama pasangan kedua
                  <input
                    required
                    value={wizard.names.two}
                    onChange={(e) => wizard.setNames({ ...wizard.names, two: e.target.value })}
                  />
                </label>
              </div>
              <p>Urutan nama mengikuti urutan pasangan yang kalian isi.</p>
            </>
          )}
          {wizard.step === 3 && (
            <>
              <h2>Jadwal & Lokasi Acara</h2>
              <label>
                Tanggal pernikahan
                <input
                  type="date"
                  required
                  value={wizard.names.date}
                  onChange={(e) => wizard.setNames({ ...wizard.names, date: e.target.value })}
                />
              </label>
              <label>
                Tempat acara contoh
                <input
                  required
                  value={wizard.names.venue}
                  onChange={(e) => wizard.setNames({ ...wizard.names, venue: e.target.value })}
                />
              </label>
            </>
          )}
          {wizard.step === 4 && (
            <>
              <h2>Sapaan untuk Tamu</h2>
              <label>
                Kalimat pembuka contoh
                <textarea
                  value={wizard.names.greeting}
                  onChange={(e) => wizard.setNames({ ...wizard.names, greeting: e.target.value })}
                />
              </label>
              <p className="notice">
                Foto asli belum tersedia. Media preview merupakan ilustrasi aman.
              </p>
            </>
          )}
          {wizard.step === 5 && (
            <>
              <h2>Tinjau Draft Contoh</h2>
              <p>
                {wizard.names.one} & {wizard.names.two}
              </p>
              <p>
                {wizard.names.date} · {template.name}
              </p>
              <p className="notice">
                Simulasi ini tidak membuat resource, order, atau undangan nyata.
              </p>
              <Link href="/preview-ui/edt-01">Buka editor data contoh →</Link>
            </>
          )}
          <div className="actions">
            {wizard.step > 1 && (
              <button
                className="button secondary"
                type="button"
                onClick={() => wizard.setStep(wizard.step - 1)}
              >
                Kembali
              </button>
            )}
            <button className="button" type="submit">
              {wizard.step === 5 ? "Tinjau draft lokal" : "Lanjutkan"}
            </button>
          </div>
          {wizard.message && <p role="status">{wizard.message}</p>}
        </LocalPreviewForm>
        <aside className="card wizard-paper">
          <p className="eyebrow">PAPER PREVIEW · DATA CONTOH</p>
          <h2>
            {wizard.names.one} & {wizard.names.two}
          </h2>
          <InvitationMedia kind={template.category} />
          <p>{wizard.names.date}</p>
          <p>{wizard.names.venue}</p>
          <p>{wizard.names.greeting}</p>
          <small>{template.name}</small>
        </aside>
      </div>
    </>
  );
}
