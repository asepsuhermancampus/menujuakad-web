"use client";
import { useRef, useState } from "react";
import type { GalleryItemDto } from "@/features/design-preview/data/fixtures";
import { galleryUsed } from "../lib/gallery-quota";
export function useGalleryPreview(
  initial: readonly GalleryItemDto[],
  limit: number,
  sourceUsed: number,
) {
  const [items, setItems] = useState(initial);
  const [message, setMessage] = useState("");
  const sequence = useRef(initial.length);
  const used = galleryUsed(initial, items, sourceUsed);
  const addExample = () => {
    if (used >= limit) {
      setMessage("Kuota galeri contoh tercapai. Tidak ada berkas yang diunggah.");
      return;
    }
    sequence.current += 1;
    const id = `local-gallery-${sequence.current}`;
    setItems((previous) => [
      ...previous,
      {
        id,
        label: `Ilustrasi lokal ${previous.length + 1}`,
        status: "READY",
        sizeBytes: 120000,
      },
    ]);
    setMessage("Ilustrasi contoh ditambahkan lokal. Tidak ada unggahan.");
  };
  return {
    items,
    used,
    message,
    addExample,
    remove: (id: string) => setItems((previous) => previous.filter((item) => item.id !== id)),
  };
}
