#!/usr/bin/env node
/**
 * Bundle skills into dist/ at build time.
 * This ensures skills are embedded in the compiled output for deployment.
 */

import { cpSync, existsSync, rmSync } from "fs";
import { resolve } from "path";

const SOURCE = resolve("..", "skills");  // Skills are in parent directory
const DEST = resolve("dist/skills");

console.log(`Bundling skills from ${SOURCE} to ${DEST}...`);

// Clean destination if exists
if (existsSync(DEST)) {
  rmSync(DEST, { recursive: true, force: true });
}

// Copy skills directory recursively
cpSync(SOURCE, DEST, { recursive: true });

console.log("Skills bundled successfully into dist/skills");