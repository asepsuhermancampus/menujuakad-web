"use client";
import { useId, useState } from "react";
export function PasswordField({
  name = "password",
  label = "Kata sandi",
  newPassword = false,
}: {
  name?: string;
  label?: string;
  newPassword?: boolean;
}) {
  const [show, setShow] = useState(false);
  const id = useId();
  return (
    <div className="stack auth-password-field">
      <label htmlFor={id}>
        {label}
        <input
          id={id}
          name={name}
          type={show ? "text" : "password"}
          required
          minLength={newPassword ? 12 : 1}
          maxLength={256}
          autoComplete={newPassword ? "new-password" : "current-password"}
          aria-describedby={newPassword ? `${id}-hint` : undefined}
        />
      </label>
      {newPassword && (
        <small id={`${id}-hint`} className="muted">
          Minimal 12 karakter.
        </small>
      )}
      <label className="check auth-show-password">
        <input
          type="checkbox"
          checked={show}
          onChange={(e) => setShow(e.target.checked)}
          aria-controls={id}
        />
        Tampilkan {label.toLowerCase()}
      </label>
    </div>
  );
}
