/**
 * Test Custom Flashcard Generation
 *
 * This script allows you to quickly test the flashcard generation API
 * with custom text input without going through the full app workflow.
 *
 * Usage:
 *   npm run test-custom-flashcards -- --text="Je suis allé au marché" --language=french
 */

import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import type { Flashcard } from "./types";
import { installFetch } from "./setup";

// Ensure fetch is available
installFetch();

async function testFlashcardGeneration(
  text: string,
  language: "french" | "spanish",
): Promise<Flashcard[]> {
  try {
    console.log(`Testing flashcard generation for language: ${language}`);
    console.log(`Input text: "${text}"`);

    const API_URL = "http://localhost:4322/api/flashcards";
    console.log(`Connecting to API at: ${API_URL}`);

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, language }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result.flashcards || [];
  } catch (error) {
    console.error("Error generating flashcards:", error);
    throw error;
  }
}

function saveResults(text: string, language: string, flashcards: Flashcard[]) {
  // Create directory if it doesn't exist
  const resultDir = join(process.cwd(), "src/tests/results");
  if (!existsSync(resultDir)) {
    mkdirSync(resultDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = join(resultDir, `custom-test-${language}-${timestamp}.json`);

  writeFileSync(
    filename,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        language,
        inputText: text,
        flashcards,
      },
      null,
      2,
    ),
  );

  console.log(`Results saved to ${filename}`);
  return filename;
}

function printFlashcards(flashcards: Flashcard[]) {
  if (flashcards.length === 0) {
    console.log("No flashcards generated.");
    return;
  }

  console.log("\nGenerated Flashcards:");
  console.log("===================\n");

  flashcards.forEach((card, index) => {
    console.log(`${index + 1}. [${card.type.toUpperCase()}]`);
    console.log(`   ${card.targetLanguage}`);
    console.log(`   ${card.english}`);

    if (card.originalText) {
      console.log(`   Original: "${card.originalText}"`);
    }

    console.log(""); // Empty line between cards
  });

  // Summary by type
  const correctionCards = flashcards.filter(
    (c) => c.type === "correction",
  ).length;
  const variationCards = flashcards.filter(
    (c) => c.type === "variation",
  ).length;
  const translationCards = flashcards.filter(
    (c) => c.type === "translation",
  ).length;

  console.log("Summary:");
  console.log(`- Total: ${flashcards.length} flashcards`);
  console.log(`- Corrections: ${correctionCards}`);
  console.log(`- Variations: ${variationCards}`);
  console.log(`- Translations: ${translationCards}`);
}

async function main() {
  try {
    const args = process.argv.slice(2);
    const textArg = args.find((arg) => arg.startsWith("--text="));
    const languageArg = args.find((arg) => arg.startsWith("--language="));

    if (!textArg) {
      console.error("Error: --text parameter is required");
      console.log(
        'Usage: npm run test-custom-flashcards -- --text="Your text here" --language=french',
      );
      process.exit(1);
    }

    const text = textArg.split("=")[1].replace(/^"|"$/g, ""); // Remove quotes if present
    const language = (languageArg?.split("=")[1] || "french") as
      | "french"
      | "spanish";

    if (language !== "french" && language !== "spanish") {
      console.error('Error: language must be either "french" or "spanish"');
      process.exit(1);
    }

    // Generate flashcards
    const flashcards = await testFlashcardGeneration(text, language);

    // Print results to console
    printFlashcards(flashcards);

    // Save results to file
    saveResults(text, language, flashcards);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

// Run the main function
main().catch(console.error);
