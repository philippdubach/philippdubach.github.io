import { access, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

export const REQUIRED_NODE_RANGE = ">=24.19.0 <25";
export const REQUIRED_WRANGLER_VERSION = "4.129.0";
export const REQUIRED_WORKSPACES = [
  "shared",
  "security-headers",
  "goatcounter-worker",
  "build-trigger",
  "bluesky worker",
  "twitter worker",
];
export const WORKER_WORKSPACES = REQUIRED_WORKSPACES.filter((workspace) => workspace !== "shared");
export const DRY_RUN_CHECK = "wrangler deploy --dry-run --outdir .wrangler/dry-run";

function supportsNode(version) {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version);
  if (!match) return false;

  const [major, minor] = match.slice(1).map(Number);
  return major === 24 && minor >= 19;
}

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

function validationError(errors) {
  if (errors.length === 1) return new Error(errors[0]);
  return new Error(`Toolchain validation failed:\n${errors.map((error) => `- ${error}`).join("\n")}`);
}

export async function validateToolchain({
  rootDir = fileURLToPath(new URL("..", import.meta.url)),
  nodeVersion = process.versions.node,
} = {}) {
  const errors = [];
  if (!supportsNode(nodeVersion)) {
    errors.push(`Node ${nodeVersion} is outside the required range ${REQUIRED_NODE_RANGE}.`);
  }

  const rootManifest = await readJson(join(rootDir, "package.json"));
  const wranglerVersion = rootManifest.devDependencies?.wrangler;
  if (wranglerVersion !== REQUIRED_WRANGLER_VERSION) {
    errors.push(
      `Root devDependency "wrangler" must be pinned to exactly ${REQUIRED_WRANGLER_VERSION}; found "${wranglerVersion ?? "missing"}".`,
    );
  }

  for (const workspace of REQUIRED_WORKSPACES) {
    if (!rootManifest.workspaces?.includes(workspace)) {
      errors.push(`Missing required workspace "${workspace}".`);
    }
  }

  if (!(await exists(join(rootDir, "package-lock.json")))) {
    errors.push("Missing committed root lockfile package-lock.json.");
  }

  for (const workspace of REQUIRED_WORKSPACES) {
    const manifestPath = join(rootDir, workspace, "package.json");
    if (!(await exists(manifestPath))) {
      errors.push(`Missing workspace manifest "${workspace}/package.json".`);
      continue;
    }

    const manifest = await readJson(manifestPath);
    const childWrangler = manifest.dependencies?.wrangler ?? manifest.devDependencies?.wrangler;
    if (childWrangler !== undefined) {
      errors.push(
        `Workspace "${workspace}" must not declare Wrangler; use the root pin ${REQUIRED_WRANGLER_VERSION}.`,
      );
    }

    if (WORKER_WORKSPACES.includes(workspace) && manifest.scripts?.check !== DRY_RUN_CHECK) {
      errors.push(`Workspace "${workspace}" must provide the Wrangler dry-run check script.`);
    }
  }

  if (errors.length > 0) throw validationError(errors);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  validateToolchain().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
