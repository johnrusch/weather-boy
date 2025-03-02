#!/usr/bin/env tsx

import { spawn } from "child_process";
import minimist from "minimist";

const argv = minimist(process.argv.slice(2));

// Map command line arguments to the test script arguments
const args: string[] = [];

if (argv.id) args.push(`--id=${argv.id}`);
if (argv.language) args.push(`--language=${argv.language}`);
if (argv.text) args.push(`--text=${argv.text}`);
if (argv.list) args.push("--list");
if (argv.help || argv.h) args.push("--help");

// Set API URL based on environment or default to localhost
process.env.API_URL =
  process.env.API_URL || "http://localhost:4321/api/transcribe";

// Run the transcription test script
const childProcess = spawn(
  "tsx",
  ["src/tests/transcription-test.ts", ...args],
  {
    stdio: "inherit",
    env: process.env,
  },
);

childProcess.on("close", (code) => {
  process.exit(code || 0);
});
