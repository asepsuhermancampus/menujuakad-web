import Image from "next/image";
export function FloralArt({ className = "" }: { className?: string }) {
  return (
    <div className={`floral-art ${className}`}>
      <Image
        className="ornament"
        src="/ornaments/ivory-bouquet.svg"
        width={360}
        height={400}
        alt="Ilustrasi rangkaian bunga ivory dan emas"
        priority
      />
    </div>
  );
}
