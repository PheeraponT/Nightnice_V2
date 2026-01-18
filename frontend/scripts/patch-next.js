#!/usr/bin/env node

/**
 * Patch for Next.js generateBuildId bug with Node.js 22
 * This fixes the "generate is not a function" error during build
 * https://github.com/vercel/next.js/issues/XXXXX
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(
  __dirname,
  '../node_modules/next/dist/build/generate-build-id.js'
);

if (!fs.existsSync(filePath)) {
  console.log('Next.js not installed yet, skipping patch.');
  process.exit(0);
}

let content = fs.readFileSync(filePath, 'utf8');

const oldCode = 'let buildId = await generate();';
const newCode = "let buildId = typeof generate === 'function' ? await generate() : null;";

if (content.includes(newCode)) {
  console.log('Next.js generateBuildId already patched.');
  process.exit(0);
}

if (content.includes(oldCode)) {
  content = content.replace(oldCode, newCode);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Next.js generateBuildId patched successfully.');
} else {
  console.log('Warning: Could not find code to patch in generate-build-id.js');
}
