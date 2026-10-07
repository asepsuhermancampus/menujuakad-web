"use client";
import { useSyncExternalStore, type FormEventHandler, type FormHTMLAttributes } from "react";
const subscribe = () => () => undefined;
const clientReady = () => true;
const serverReady = () => false;
type Props = Omit<FormHTMLAttributes<HTMLFormElement>, "action" | "method" | "onSubmit"> & {
  onSubmit: FormEventHandler<HTMLFormElement>;
};
/** Kontrol SSR tidak aktif sampai handler React lokal terpasang. */
export function LocalPreviewForm({ children, onSubmit, ...props }: Props) {
  const ready = useSyncExternalStore(subscribe, clientReady, serverReady);
  return (
    <form
      {...props}
      data-preview-ready={ready}
      onSubmit={(event) => {
        event.preventDefault();
        if (ready) onSubmit(event);
      }}
    >
      <fieldset className="local-preview-fields" disabled={!ready}>
        {children}
      </fieldset>
      {!ready && (
        <p className="notice local-preview-waiting">
          Formulir contoh menunggu JavaScript aktif. Tidak ada data yang dikirim.
        </p>
      )}
    </form>
  );
}
