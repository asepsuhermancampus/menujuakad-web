import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { describe, expect, it } from "vitest";

const execute = promisify(execFile);
describe("CLI seed auth menolak production sebelum koneksi", () => {
  it("exit1 generik tanpa URL/password/error provider pada output", async () => {
    let rejected = false;
    try {
      await execute(
        process.execPath,
        ["--import", "tsx", "scripts/database/seed-auth-preproduction.ts"],
        {
          env: {
            ...process.env,
            NODE_ENV: "production",
            SEED_ENVIRONMENT: "preproduction",
            SEED_CONFIRMATION: "menujuakad-preproduction:11-dummy-accounts",
            DATABASE_URL:
              "postgresql://owner:cli-private-marker@ep-fake-pooler.us-east-2.aws.neon.tech/menujuakad-preproduction?sslmode=require",
            DIRECT_URL:
              "postgresql://owner:cli-private-marker@ep-fake.us-east-2.aws.neon.tech/menujuakad-preproduction?sslmode=require",
          },
        },
      );
    } catch (error) {
      rejected = true;
      const result = error as { code: number; stdout: string; stderr: string };
      expect(result.code).toBe(1);
      expect(result.stdout).toBe("");
      expect(result.stderr).toContain("Seed auth gagal.");
      expect((result.stderr + result.stdout).includes("cli-private-marker")).toBe(false);
      expect((result.stderr + result.stdout).includes("postgresql://")).toBe(false);
    }
    expect(rejected).toBe(true);
  }, 15000);
});
