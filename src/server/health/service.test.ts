import { describe, expect, it, vi } from "vitest";
import { checkHealth } from "./service";

describe("kesiapan aplikasi", () => {
  it("tidak membuat koneksi ketika database belum dikonfigurasi", async () => {
    const pingDatabase = vi.fn();
    expect(await checkHealth({ isDatabaseConfigured: () => false, pingDatabase })).toEqual({
      status: "not_ready",
      checks: { application: "ok", database: "not_configured" },
    });
    expect(pingDatabase).not.toHaveBeenCalled();
  });

  it("menyatakan siap hanya setelah probe database berhasil", async () => {
    const pingDatabase = vi.fn().mockResolvedValue(undefined);
    expect(await checkHealth({ isDatabaseConfigured: () => true, pingDatabase })).toEqual({
      status: "ok",
      checks: { application: "ok", database: "ok" },
    });
    expect(pingDatabase).toHaveBeenCalledOnce();
  });

  it("menyembunyikan detail kesalahan koneksi dan kredensial", async () => {
    const report = await checkHealth({
      isDatabaseConfigured: () => true,
      pingDatabase: async () => {
        throw new Error("postgres://user:secret@private-host/db");
      },
    });
    expect(report).toEqual({
      status: "not_ready",
      checks: { application: "ok", database: "unavailable" },
    });
    expect(JSON.stringify(report)).not.toContain("secret");
  });

  it("menangani konfigurasi tidak valid sebagai kondisi belum siap", async () => {
    expect(
      await checkHealth({
        isDatabaseConfigured: () => {
          throw new Error("invalid configuration");
        },
        pingDatabase: vi.fn(),
      }),
    ).toEqual({ status: "not_ready", checks: { application: "ok", database: "unavailable" } });
  });
});
