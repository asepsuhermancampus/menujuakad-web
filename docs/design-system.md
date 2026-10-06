# Design System dan Figma

## Status visual

Figma MCP tersedia dalam sesi fondasi dan panggilan identitas akun berhasil. Belum ada URL file/frame sehingga belum ada observasi layout, token, aset, atau responsive variant dari desain resmi. Identitas akun tidak membuktikan akses setiap file.

Beranda sekarang adalah pengantar sementara yang menerapkan arahan ivory/warm neutral, olive/botanical, tipografi editorial, whitespace, border halus, dan kartu lembut dari master spec. Beranda ini bukan hasil slicing Figma.

## Primitive saat ini

- `Button`: tap target minimal 48px, focus ring, disabled state, default type button.
- `Input`: ukuran sentuh, focus ring, styling aria-invalid. Form nantinya tetap wajib menyediakan label dan pesan error.
- `Card`: surface, border, radius konsisten.
- `Ornament`: aset SVG botanical dari `public/ornaments`, dekoratif tanpa nama aksesibel yang mengganggu.
- Token di `src/app/globals.css`: ivory, surface, olive, ink, muted, border, tipografi body/editorial, dan radius kartu.

Font sistem digunakan sementara agar build tidak membutuhkan download font. Warna dan font akan dipetakan ke token Figma terverifikasi saat URL tersedia. Ornamen saat ini merupakan SVG awal, bukan ekspor aset Figma.

## Workflow implementasi desain

1. Akses frame terkait melalui Figma MCP; catat URL dan node yang berhasil diperiksa.
2. Ambil design context, token, aset, dan screenshot.
3. Petakan komponen desain ke primitive/fitur yang sudah ada.
4. Tentukan perilaku responsive, empty/loading/error/success, serta aksesibilitas.
5. Implementasikan dengan page tipis dan modul terpisah.
6. Bandingkan screenshot desktop/mobile dengan Figma dan catat perbedaan yang belum terselesaikan.
7. Jalankan typecheck, lint, build, dan pengujian interaksi penting.

Jangan mengganti desain resmi berdasarkan perkiraan. Figma MCP hanya dipakai agent untuk pengembangan; aplikasi produksi tidak bergantung padanya.
