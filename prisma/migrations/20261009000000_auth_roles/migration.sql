-- PostgreSQL mengharuskan enum baru committed sebelum dipakai default/data.
-- Dipisahkan dari migrasi berikutnya; tanpa mengubah nilai CUSTOMER existing.
ALTER TYPE "UserRole" ADD VALUE 'CLIENT';
ALTER TYPE "UserRole" ADD VALUE 'VENDOR';
