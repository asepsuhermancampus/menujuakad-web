import Image from "next/image";
import { clsx } from "clsx";

export function Ornament({ className }: { className?: string }) {
  return (
    <Image
      src="/ornaments/botanical-sprig.svg"
      width={240}
      height={240}
      alt=""
      aria-hidden="true"
      className={clsx("ornament", className)}
    />
  );
}
