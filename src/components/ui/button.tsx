import type { ButtonHTMLAttributes } from "react";
import { clsx } from "clsx";

export function buttonClassName(className?: string) {
  return clsx("button", className);
}

export function Button({
  className,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type={type} className={buttonClassName(className)} {...props} />;
}
