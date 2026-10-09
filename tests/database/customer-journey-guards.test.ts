import { execFile } from "node:child_process";
import { promisify } from "node:util";
import {
  chmod,
  link,
  mkdtemp,
  readFile,
  rmdir,
  stat,
  symlink,
  unlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { getCustomerJourneyConfig } from "../../scripts/database/customer-journey-config";
import {
  withCustomerJourneyManifest,
  validateCustomerJourneyManifest,
} from "../../scripts/database/customer-journey-manifest";
const direct =
  "postgresql://owner:private-test-marker@ep-test.us-east-2.aws.neon.tech/menujuakad-preproduction?sslmode=require";
const env = {
  NODE_ENV: "development",
  SEED_ENVIRONMENT: "preproduction",
  SEED_CONFIRMATION: "menujuakad-preproduction:30-customer-journeys",
  DIRECT_URL: direct,
  DATABASE_URL: direct.replace("ep-test.", "ep-test-pooler."),
};
describe("customer journey guard dan manifest privat", () => {
  it("menerima hanya target Neon preproduction berpasangan dan opt-in", () => {
    expect(getCustomerJourneyConfig(env).migrationUrl).toBe(direct);
    for (const override of [
      { NODE_ENV: "production" },
      { SEED_CONFIRMATION: undefined },
      { SEED_ENVIRONMENT: "production" },
      { DIRECT_URL: direct + "&host=evil.test" },
      { DIRECT_URL: direct + "&sslmode=disable" },
      { DIRECT_URL: direct + "#secret" },
      { DIRECT_URL: direct.replace("ep-test.", "ep-other.") },
      {
        DIRECT_URL: direct.replace("menujuakad-preproduction", "production"),
        DATABASE_URL: env.DATABASE_URL.replace("menujuakad-preproduction", "production"),
      },
    ]) {
      expect(() => getCustomerJourneyConfig({ ...env, ...override })).toThrow();
    }
  });
  it("manifest tetap stabil; password unik; menolak malformed, izin terbuka, hardlink/symlink dan file besar", async () => {
    const directory = await mkdtemp(join(tmpdir(), "customer-journey-test-"));
    const external = directory + "-external";
    const path = join(directory, "credentials.json");
    try {
      await withCustomerJourneyManifest(directory, async (manifest) => {
        expect(manifest.accounts).toHaveLength(30);
        expect(new Set(manifest.accounts.map((a) => a.password)).size).toBe(30);
        expect(() =>
          validateCustomerJourneyManifest({ ...manifest, accounts: manifest.accounts.slice(1) }),
        ).toThrow();
        const altered = structuredClone(manifest);
        altered.accounts[0].userId = "other";
        expect(() => validateCustomerJourneyManifest(altered)).toThrow();
        const reused = structuredClone(manifest);
        reused.accounts[0].password = reused.accounts[1].password;
        expect(() => validateCustomerJourneyManifest(reused)).toThrow();
        await expect(withCustomerJourneyManifest(directory, async () => {})).rejects.toThrow();
      });
      const bytes = await readFile(path);
      await withCustomerJourneyManifest(directory, async () => {});
      expect(await readFile(path)).toEqual(bytes);
      expect((await stat(directory)).mode & 0o777).toBe(0o700);
      expect((await stat(path)).mode & 0o777).toBe(0o600);
      await chmod(path, 0o644);
      await expect(withCustomerJourneyManifest(directory, async () => {})).rejects.toThrow();
      await chmod(path, 0o600);
      await link(path, external);
      await expect(withCustomerJourneyManifest(directory, async () => {})).rejects.toThrow();
      await unlink(external);
      await unlink(path);
      await writeFile(path, "malformed", { mode: 0o600 });
      await expect(withCustomerJourneyManifest(directory, async () => {})).rejects.toThrow();
      await writeFile(path, "x".repeat(32769));
      await expect(withCustomerJourneyManifest(directory, async () => {})).rejects.toThrow();
      await unlink(path);
      await writeFile(external, "private", { mode: 0o600 });
      await symlink(external, path);
      await expect(withCustomerJourneyManifest(directory, async () => {})).rejects.toThrow();
      await expect(withCustomerJourneyManifest(process.cwd(), async () => {})).rejects.toThrow();
    } finally {
      await unlink(external).catch(() => {});
      await unlink(path).catch(() => {});
      await rmdir(directory);
    }
  });
  it("CLI default dryrun tanpa credential dan --apply production menolak sebelum koneksi", async () => {
    const execute = promisify(execFile);
    const args = ["--import", "tsx", "scripts/database/seed-customer-journeys.ts"];
    const result = await execute(process.execPath, args, {
      env: { PATH: process.env.PATH, NODE_ENV: "production" },
    });
    expect(result.stdout).toContain("DRY RUN");
    expect(result.stdout).toContain("30");
    expect(result.stdout).toContain("PAYMENT_APPROVED_TEST");
    expect(result.stderr).toBe("");
    await expect(
      execute(process.execPath, [...args, "--apply"], {
        env: { ...env, PATH: process.env.PATH, NODE_ENV: "production" },
      }),
    ).rejects.toMatchObject({
      code: 1,
      stdout: "",
      stderr: expect.not.stringContaining("private-test-marker"),
    });
  }, 15000);
});
