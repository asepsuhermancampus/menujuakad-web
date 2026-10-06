# Audit Awal Repository Menuju Akad

## Temuan 7 Oktober 2026

| Area         | Kondisi sebelum perubahan                                                                                                             |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| Stack        | Hanya `MENUJU_AKAD_AGENT_MASTER_SPEC.txt` v1.0, 3.726 baris; belum ada package/config aplikasi. Node environment 22.23.1, npm 10.9.8. |
| Routes       | Tidak ada.                                                                                                                            |
| Components   | Tidak ada.                                                                                                                            |
| Database     | Tidak ada schema, URL, atau koneksi proyek yang diverifikasi.                                                                         |
| Auth         | Tidak ada.                                                                                                                            |
| Payment      | Tidak ada.                                                                                                                            |
| Deployment   | Tidak ada konfigurasi deployment dalam folder target; VPS/DNS aktual belum diaudit.                                                   |
| Figma MCP    | Tool tersedia dan panggilan whoami berhasil; URL desain belum diberikan.                                                              |
| Git          | Folder belum merupakan repository Git; belum ada remote/riwayat yang diubah.                                                          |
| Konteks lain | `/home/ubuntu/HariKita-Web` ada sebagai workspace terpisah; `/home/ubuntu/MenujuAkad.com` tidak ditemukan. Tidak diubah.              |

## Gap dan risiko

Fondasi aplikasi belum tersedia; scaffold baru diperlukan sesuai instruksi master spec untuk repository kosong. Risiko refactor kode lama tidak ada pada target ini. Risiko utama ialah memilih folder/database yang keliru, mengarang desain Figma, mencampur Prisma major version, dan menganggap hasil mock/lokal sebagai verifikasi layanan nyata.

## Increment yang dipilih

Scaffold Next.js/TypeScript → panduan dan progres → primitive desain sementara → schema Prisma 7 + adapter Neon → migrasi SQL awal/seed → health + slug validation → pengujian. Auth dan fitur produk berikutnya dikerjakan setelah fondasi tervalidasi. Versi Prisma stabil 7.10.0 dipilih dengan sengaja; dist-tag latest saat audit menunjuk v8 release candidate sehingga tidak diambil otomatis.

Hasil implementasi aktual serta keterbatasan disimpan dalam `00-progres-proyek.md`, bukan ditumpuk sebagai audit baru pada file ini.
