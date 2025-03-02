#!/usr/bin/env node

/**
 * Command-line tool to run flashcard generator tests
 *
 * Usage:
 *   npm run flashcard-tests -- --language=french
 *   npm run flashcard-tests -- --language=spanish
 *   npm run flashcard-tests -- --all
 */

import { runLanguageTests, runAllTests } from "./flashcard-generator-test";
import { installFetch } from "./setup";

// Ensure fetch is available
installFetch();

async function main() {
  const args = process.argv.slice(2);
  const languageArg = args.find((arg) => arg.startsWith("--language="));
  const allArg = args.includes("--all");

  let resultsFile: string;

  if (allArg) {
    console.log("Running all flashcard generation tests...");
    resultsFile = await runAllTests();
  } else if (languageArg) {
    const language = languageArg.split("=")[1] as "french" | "spanish";
    if (language !== "french" && language !== "spanish") {
      console.error('Error: Language must be either "french" or "spanish"');
      process.exit(1);
    }

    console.log(`Running ${language} flashcard generation tests...`);
    resultsFile = await runLanguageTests(language);
  } else {
    console.log("Usage:");
    console.log("  npm run flashcard-tests -- --language=french");
    console.log("  npm run flashcard-tests -- --language=spanish");
    console.log("  npm run flashcard-tests -- --all");
    process.exit(0);
  }

  console.log(`Tests completed! Results saved to: ${resultsFile}`);
}

main().catch((error) => {
  console.error("Error running tests:", error);
  process.exit(1);
});
