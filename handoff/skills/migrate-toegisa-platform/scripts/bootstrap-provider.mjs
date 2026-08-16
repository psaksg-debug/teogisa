#!/usr/bin/env node
import { constants, promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
const projectArg = args.find((arg) => !arg.startsWith("--"));
const providerArg = args.find((arg, index) => index > args.indexOf(projectArg) && !arg.startsWith("--"));
const force = args.includes("--force");
const providers = {
  claude: { template: "CLAUDE.md.template", output: "CLAUDE.md" },
  gemini: { template: "GEMINI.md.template", output: "GEMINI.md" },
  generic: { template: "AGENTS.md.template", output: "AGENTS.md" },
};

function fail(message) {
  console.error(message);
  process.exit(2);
}

if (!projectArg || !providerArg || !(providerArg in providers)) {
  fail("usage: bootstrap-provider.mjs <project-root> <claude|gemini|generic> [--force]");
}

const projectRootInput = path.resolve(projectArg);
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const skillRoot = await fs.realpath(path.resolve(scriptDir, ".."));
const selection = providers[providerArg];
const templatePath = path.join(skillRoot, "assets", selection.template);

try {
  const stat = await fs.stat(projectRootInput);
  if (!stat.isDirectory()) fail(`project root is not a directory: ${projectRootInput}`);
} catch {
  fail(`project root does not exist: ${projectRootInput}`);
}
const projectRoot = await fs.realpath(projectRootInput);
const outputPath = path.join(projectRoot, selection.output);

if (!force) {
  try {
    await fs.access(outputPath, constants.F_OK);
    fail(`refusing to overwrite existing file: ${outputPath}; rerun with --force only after reviewing it`);
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
}

let relativeSkillDir = path.relative(projectRoot, skillRoot) || ".";
relativeSkillDir = relativeSkillDir.split(path.sep).join("/");
const relativeSkillPath = path.posix.join(relativeSkillDir, "SKILL.md");
const template = await fs.readFile(templatePath, "utf8");
const rendered = template
  .replaceAll("{{TOEGISA_SKILL_PATH}}", relativeSkillPath)
  .replaceAll("{{TOEGISA_SKILL_DIR}}", relativeSkillDir);

if (/\{\{TOEGISA_SKILL_(?:PATH|DIR)\}\}/.test(rendered)) {
  fail(`unresolved template placeholder in ${templatePath}`);
}

await fs.writeFile(outputPath, rendered, { encoding: "utf8", flag: force ? "w" : "wx" });
console.log(JSON.stringify({ provider: providerArg, output: outputPath, skill: relativeSkillPath }));
