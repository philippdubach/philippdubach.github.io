import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  REQUIRED_WRANGLER_VERSION,
  REQUIRED_WORKSPACES,
  validateToolchain,
} from "../scripts/validate-toolchain.mjs";

const validRootManifest = {
  name: "social-automation",
  private: true,
  engines: { node: ">=24.19.0 <25" },
  workspaces: REQUIRED_WORKSPACES,
  devDependencies: { wrangler: REQUIRED_WRANGLER_VERSION },
};

const validWorkerManifest = {
  private: true,
  scripts: {
    check: "wrangler deploy --dry-run --outdir .wrangler/dry-run",
  },
};

async function makeWorkspace({ root = {}, workers = {}, lockfile = true } = {}) {
  const rootDir = await mkdtemp(join(tmpdir(), "validate-toolchain-"));
  const manifest = {
    ...validRootManifest,
    ...root,
    engines: { ...validRootManifest.engines, ...root.engines },
    devDependencies: { ...validRootManifest.devDependencies, ...root.devDependencies },
  };

  await writeFile(join(rootDir, "package.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  if (lockfile) await writeFile(join(rootDir, "package-lock.json"), "{}\n");

  for (const workspace of REQUIRED_WORKSPACES) {
    const workerManifest = { ...validWorkerManifest, ...workers[workspace] };
    const workspaceDir = join(rootDir, workspace);
    await mkdir(workspaceDir, { recursive: true });
    await writeFile(join(workspaceDir, "package.json"), `${JSON.stringify(workerManifest, null, 2)}\n`);
  }

  return rootDir;
}

test("rejects Node versions below the supported range", async () => {
  const rootDir = await makeWorkspace();

  await assert.rejects(
    validateToolchain({ rootDir, nodeVersion: "24.18.9" }),
    { message: "Node 24.18.9 is outside the required range >=24.19.0 <25." },
  );
});

test("rejects Node versions at or above 25", async () => {
  const rootDir = await makeWorkspace();

  await assert.rejects(
    validateToolchain({ rootDir, nodeVersion: "25.0.0" }),
    { message: "Node 25.0.0 is outside the required range >=24.19.0 <25." },
  );
});

test("rejects a ranged Wrangler version", async () => {
  const rootDir = await makeWorkspace({
    root: { devDependencies: { wrangler: "^4.127.1" } },
  });

  await assert.rejects(
    validateToolchain({ rootDir, nodeVersion: "24.19.0" }),
    { message: `Root devDependency "wrangler" must be pinned to exactly ${REQUIRED_WRANGLER_VERSION}; found "^4.127.1".` },
  );
});

test("rejects a required workspace omitted from the root manifest", async () => {
  const rootDir = await makeWorkspace({
    root: { workspaces: REQUIRED_WORKSPACES.filter((workspace) => workspace !== "build-trigger") },
  });

  await assert.rejects(
    validateToolchain({ rootDir, nodeVersion: "24.19.0" }),
    { message: 'Missing required workspace "build-trigger".' },
  );
});

test("rejects a missing committed root lockfile", async () => {
  const rootDir = await makeWorkspace({ lockfile: false });

  await assert.rejects(
    validateToolchain({ rootDir, nodeVersion: "24.19.0" }),
    { message: "Missing committed root lockfile package-lock.json." },
  );
});

test("reports every independent workspace contract violation", async () => {
  const rootDir = await makeWorkspace({
    lockfile: false,
    root: { devDependencies: { wrangler: "~4.127.1" } },
    workers: { "security-headers": { scripts: {} } },
  });

  await assert.rejects(
    validateToolchain({ rootDir, nodeVersion: "24.19.0" }),
    {
      message: [
        "Toolchain validation failed:",
        `- Root devDependency "wrangler" must be pinned to exactly ${REQUIRED_WRANGLER_VERSION}; found "~4.127.1".`,
        "- Missing committed root lockfile package-lock.json.",
        '- Workspace "security-headers" must provide the Wrangler dry-run check script.',
      ].join("\n"),
    },
  );
});

test("rejects a Worker without the root Wrangler dry-run interface", async () => {
  const rootDir = await makeWorkspace({
    workers: { "security-headers": { scripts: {} } },
  });

  await assert.rejects(
    validateToolchain({ rootDir, nodeVersion: "24.19.0" }),
    { message: 'Workspace "security-headers" must provide the Wrangler dry-run check script.' },
  );
});

test("accepts the reproducible workspace contract", async () => {
  const rootDir = await makeWorkspace();

  await assert.doesNotReject(validateToolchain({ rootDir, nodeVersion: "24.19.0" }));
});
