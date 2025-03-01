#!/usr/bin/env node

/**
 * Analyze and visualize flashcard generation test results
 * 
 * Usage:
 *   npm run analyze-flashcards -- --file=src/tests/results/flashcard-test-results-2025-03-01T12-34-56-789Z.json
 */

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import type { TestResult, TestResults } from './types';

function loadResults(filePath?: string): TestResults {
  const resultsDir = join(process.cwd(), 'src/tests/results');
  
  // If no file path provided, use the most recent results file
  if (!filePath) {
    const files = readdirSync(resultsDir)
      .filter(file => file.startsWith('flashcard-test-results-'))
      .sort()
      .reverse();
    
    if (files.length === 0) {
      throw new Error('No test result files found');
    }
    
    filePath = join(resultsDir, files[0]);
    console.log(`Using most recent results file: ${filePath}`);
  }
  
  // Load the file
  try {
    const fileContent = readFileSync(filePath, 'utf8');
    return JSON.parse(fileContent) as TestResults;
  } catch (error) {
    console.error(`Error loading results file ${filePath}:`, error);
    throw error;
  }
}

function analyzeResults(results: TestResults) {
  const { timestamp, results: testResults } = results;
  
  console.log('\n======================================');
  console.log(`Flashcard Generation Test Results`);
  console.log(`Timestamp: ${new Date(timestamp).toLocaleString()}`);
  console.log('======================================\n');
  
  // Success rate
  const totalTests = testResults.length;
  const successfulTests = testResults.filter(r => r.success).length;
  const successRate = (successfulTests / totalTests) * 100;
  
  console.log(`Success Rate: ${successRate.toFixed(2)}% (${successfulTests}/${totalTests})\n`);
  
  // Group by language
  const frenchResults = testResults.filter(r => r.testCase.language === 'french');
  const spanishResults = testResults.filter(r => r.testCase.language === 'spanish');
  
  console.log(`French Tests: ${frenchResults.length}`);
  console.log(`Spanish Tests: ${spanishResults.length}\n`);
  
  // Analyze flashcard types
  let totalFlashcards = 0;
  let correctionCards = 0;
  let variationCards = 0;
  let translationCards = 0;
  
  testResults.forEach(result => {
    if (result.success && result.result?.flashcards) {
      totalFlashcards += result.result.flashcards.length;
      
      result.result.flashcards.forEach(card => {
        if (card.type === 'correction') correctionCards++;
        if (card.type === 'variation') variationCards++;
        if (card.type === 'translation') translationCards++;
      });
    }
  });
  
  console.log('Flashcard Type Distribution:');
  console.log(`- Corrections: ${correctionCards} (${((correctionCards / totalFlashcards) * 100).toFixed(2)}%)`);
  console.log(`- Variations: ${variationCards} (${((variationCards / totalFlashcards) * 100).toFixed(2)}%)`);
  console.log(`- Translations: ${translationCards} (${((translationCards / totalFlashcards) * 100).toFixed(2)}%)`);
  console.log(`- Total Flashcards: ${totalFlashcards}\n`);
  
  // Detailed results by test case
  console.log('Detailed Results by Test Case:');
  console.log('-----------------------------\n');
  
  testResults.forEach((result, index) => {
    const { testCase, success } = result;
    
    console.log(`${index + 1}. [${success ? 'SUCCESS' : 'FAILURE'}] ${testCase.id} - ${testCase.description}`);
    
    if (!success) {
      console.log(`   Error: ${result.error}`);
    } else if (result.result?.flashcards) {
      // Count card types for this test case
      const cards = result.result.flashcards;
      const corrections = cards.filter(c => c.type === 'correction').length;
      const variations = cards.filter(c => c.type === 'variation').length;
      const translations = cards.filter(c => c.type === 'translation').length;
      
      console.log(`   Generated ${cards.length} flashcards: ${corrections} corrections, ${variations} variations, ${translations} translations`);
      
      // If the test case had expected issues, check if they were addressed
      if (testCase.expectedIssues && testCase.expectedIssues.length > 0) {
        const correctionTexts = cards
          .filter(c => c.type === 'correction' && c.originalText)
          .map(c => ({ original: c.originalText, correction: c.targetLanguage }));
        
        console.log(`   Expected issues: ${testCase.expectedIssues.join(', ')}`);
        console.log(`   Corrections made:`);
        correctionTexts.forEach((corr, i) => {
          console.log(`     ${i + 1}. "${corr.original}" → "${corr.correction}"`);
        });
      }
    }
    
    console.log(''); // Empty line between test cases
  });
}

async function main() {
  try {
    const args = process.argv.slice(2);
    const fileArg = args.find(arg => arg.startsWith('--file='));
    
    let filePath: string | undefined;
    if (fileArg) {
      filePath = fileArg.split('=')[1];
    }
    
    const results = loadResults(filePath);
    analyzeResults(results);
  } catch (error) {
    console.error('Error analyzing results:', error);
    process.exit(1);
  }
}

main().catch(console.error);
