import { execFile } from "node:child_process";
import { mkdtemp, mkdir, readFile, cp, writeFile, symlink, access, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { afterEach, describe, expect, it } from "vitest";

const execute = promisify(execFile);
const temporary: string[] = [];
async function fixture() {
  const root = await mkdtemp(join(tmpdir(), "menujuakad-package-test-"));
  temporary.push(root);
  await mkdir(join(root, "scripts"));
  await mkdir(join(root, "public"));
  await mkdir(join(root, ".next/static"), { recursive: true });
  await mkdir(join(root, ".next/standalone/nested"), { recursive: true });
  await cp("scripts/prepare-standalone.mjs", join(root, "scripts/prepare-standalone.mjs"));
  await writeFile(join(root, ".env"), "source-private-marker");
  await writeFile(join(root, "public/asset.txt"), "public-asset");
  await writeFile(join(root, ".next/static/asset.txt"), "static-asset");
  return root;
}
afterEach(async () => {
  for (const root of temporary.splice(0)) await rm(root, { recursive: true });
});

describe("standalone preparation protects environment sources", () => {
  it("removes copied environments recursively and remains idempotent", async () => {
    const root = await fixture();
    const files = [".env", ".env.production", "nested/.env.local", "nested/.env.example"];
    for (const file of files) await writeFile(join(root, ".next/standalone", file), "copy-marker");
    for (let run = 0; run < 2; run++)
      await execute(process.execPath, [join(root, "scripts/prepare-standalone.mjs")]);
    for (const file of files)
      await expect(access(join(root, ".next/standalone", file))).rejects.toThrow();
    expect(await readFile(join(root, ".env"), "utf8")).toBe("source-private-marker");
    expect(await readFile(join(root, ".next/standalone/public/asset.txt"), "utf8")).toBe(
      "public-asset",
    );
    expect(await readFile(join(root, ".next/standalone/.next/static/asset.txt"), "utf8")).toBe(
      "static-asset",
    );
  });

  it("unlinks an environment symlink without touching its source", async () => {
    const root = await fixture();
    await symlink(join(root, ".env"), join(root, ".next/standalone/.env"));
    await execute(process.execPath, [join(root, "scripts/prepare-standalone.mjs")]);
    await expect(access(join(root, ".next/standalone/.env"))).rejects.toThrow();
    expect(await readFile(join(root, ".env"), "utf8")).toBe("source-private-marker");
  });

  it("rejects an external directory symlink before copying assets", async () => {
    const root = await fixture();
    await symlink(root, join(root, ".next/standalone/public"));
    await expect(
      execute(process.execPath, [join(root, "scripts/prepare-standalone.mjs")]),
    ).rejects.toThrow();
    expect(await readFile(join(root, ".env"), "utf8")).toBe("source-private-marker");
    await expect(access(join(root, "asset.txt"))).rejects.toThrow();
  });

  it("rejects a symlink replacing the standalone root", async () => {
    const root = await fixture();
    await rm(join(root, ".next/standalone"), { recursive: true });
    await symlink(root, join(root, ".next/standalone"));
    await expect(
      execute(process.execPath, [join(root, "scripts/prepare-standalone.mjs")]),
    ).rejects.toThrow();
    expect(await readFile(join(root, ".env"), "utf8")).toBe("source-private-marker");
  });

  it("keeps the independent packaging guard rejecting a reintroduced environment", async () => {
    const root = await fixture();
    await execute(process.execPath, [join(root, "scripts/prepare-standalone.mjs")]);
    await mkdir(join(root, "deploy/scripts"), { recursive: true });
    await cp(
      "deploy/scripts/package-standalone.sh",
      join(root, "deploy/scripts/package-standalone.sh"),
    );
    await writeFile(join(root, ".next/standalone/server.js"), "console.log('fixture')");
    await writeFile(join(root, ".next/standalone/.next/BUILD_ID"), "fixture-build");
    await writeFile(join(root, ".next/standalone/.env"), "reintroduced-marker");
    const outside = await mkdtemp(join(tmpdir(), "menujuakad-package-target-"));
    temporary.push(outside);
    await expect(
      execute("bash", [
        join(root, "deploy/scripts/package-standalone.sh"),
        join(outside, "release.tar.gz"),
      ]),
    ).rejects.toMatchObject({
      code: 1,
      stderr: expect.stringContaining("Artifact ditolak"),
    });
    await expect(access(join(outside, "release.tar.gz"))).rejects.toThrow();
  });
});
