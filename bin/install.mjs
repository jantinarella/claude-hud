#!/usr/bin/env node

import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from "fs";
import { execSync } from "child_process";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { homedir } from "os";

const __dirname = dirname(fileURLToPath(import.meta.url));
const claudeDir = join(homedir(), ".claude");
const settingsPath = join(claudeDir, "settings.json");
const scriptDest = join(claudeDir, "statusline-command.sh");
const scriptSrc = join(__dirname, "..", "statusline-command.sh");

const bold = (s) => `\x1b[1m${s}\x1b[0m`;
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const yellow = (s) => `\x1b[33m${s}\x1b[0m`;
const red = (s) => `\x1b[31m${s}\x1b[0m`;

// Handle --uninstall flag
const uninstall = process.argv.includes("--uninstall");

if (uninstall) {
  console.log(bold("\nUninstalling claude-hud...\n"));

  if (existsSync(settingsPath)) {
    const settings = JSON.parse(readFileSync(settingsPath, "utf8"));
    if (settings.statusLine) {
      delete settings.statusLine;
      writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + "\n");
      console.log(green("✓") + " Removed statusLine from settings.json");
    }
  }

  const cacheFile = join(claudeDir, "ccusage-cache.json");
  for (const f of [scriptDest, cacheFile]) {
    if (existsSync(f)) {
      const { unlinkSync } = await import("fs");
      unlinkSync(f);
      console.log(green("✓") + ` Removed ${f}`);
    }
  }

  console.log(green("\nDone! Restart Claude Code to apply.\n"));
  process.exit(0);
}

// --- Install ---
console.log(bold("\nInstalling claude-hud...\n"));

// 1. Ensure ~/.claude exists
mkdirSync(claudeDir, { recursive: true });

// 2. Check for ccusage
try {
  execSync("which ccusage", { stdio: "ignore" });
  console.log(green("✓") + " ccusage found");
} catch {
  console.log(yellow("⚠") + " ccusage not found globally, installing...");
  try {
    execSync("npm install -g ccusage", { stdio: "inherit" });
    console.log(green("✓") + " ccusage installed");
  } catch {
    console.log(red("✗") + " Failed to install ccusage. Install manually: npm install -g ccusage");
  }
}

// 3. Check for jq
try {
  execSync("which jq", { stdio: "ignore" });
  console.log(green("✓") + " jq found");
} catch {
  console.log(red("✗") + " jq is required but not found. Install it:");
  console.log("    macOS: brew install jq");
  console.log("    Linux: sudo apt install jq");
  process.exit(1);
}

// 4. Copy statusline script
copyFileSync(scriptSrc, scriptDest);
execSync(`chmod +x "${scriptDest}"`);
console.log(green("✓") + ` Installed statusline script to ${scriptDest}`);

// 5. Patch settings.json
let settings = {};
if (existsSync(settingsPath)) {
  settings = JSON.parse(readFileSync(settingsPath, "utf8"));
}

const statusLineConfig = {
  type: "command",
  command: `bash ${scriptDest}`,
  padding: 0,
};

if (settings.statusLine) {
  console.log(yellow("⚠") + " Existing statusLine config found, overwriting");
}

settings.statusLine = statusLineConfig;
writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + "\n");
console.log(green("✓") + " Updated settings.json");

console.log(green("\nDone! Restart Claude Code to see your new status line.\n"));
