/**
 * Flashcard Generator Integration Test Utility
 * 
 * This utility allows for testing the flashcard generation endpoint 
 * with various language samples to evaluate the quality of generated flashcards.
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import type { TestCase, TestResult } from './types';
import { installFetch } from './setup';

// Ensure fetch is available
installFetch();

// French test cases with varying levels of correctness
const frenchTestCases: TestCase[] = [
  {
    id: 'french-perfect',
    language: 'french',
    description: 'Perfectly correct French',
    text: 'Bonjour, je m\'appelle Marie. J\'habite à Paris depuis cinq ans. J\'aime beaucoup la cuisine française, surtout les croissants et le café au lait le matin. Le week-end, je visite souvent les musées ou je me promène dans les jardins.'
  },
  {
    id: 'french-minor-errors',
    language: 'french',
    description: 'French with minor grammatical errors',
    text: 'Bonjour, je m\'appelle Pierre. J\'habite à Paris depuis cinq années. J\'aime beaucoup le cuisine française, surtout les croissants et le café avec lait le matin. Le week-end, je visite souvent des musées ou je me promène dans les jardins.',
    expectedIssues: ['gender agreement', 'preposition usage']
  },
  {
    id: 'french-major-errors',
    language: 'french',
    description: 'French with major grammatical errors',
    text: 'Bonjour, je m\'appelle Jean. Je habite à Paris depuis cinq ans. Je aime beaucoup la cuisine français, surtout le croissants et la café au lait le matin. Dans le week-end, je visiter souvent les musées ou je promène dans les jardins.',
    expectedIssues: ['elision missing', 'gender agreement', 'verb conjugation', 'preposition usage']
  },
  {
    id: 'french-mixed-languages',
    language: 'french',
    description: 'French mixed with English words',
    text: 'Bonjour, je m\'appelle Sophie. J\'habite à Paris since five years. J\'aime beaucoup la cuisine française, especially les croissants et le café au lait in the morning. Le weekend, je visit souvent les museums ou je me promène in the gardens.',
    expectedIssues: ['English words', 'verb conjugation']
  },
  {
    id: 'french-beginner',
    language: 'french',
    description: 'Beginner-level French with translation errors',
    text: 'Je suis aller à le magasin hier. J\'ai acheter du pain et du lait. Le pain était très bon mais le lait était mauvais. Je ne aime pas le lait mauvais.',
    expectedIssues: ['verb form', 'preposition contraction', 'verb conjugation', 'elision missing']
  },
  {
    id: 'french-fill-gaps',
    language: 'french',
    description: 'French with English words to fill vocabulary gaps',
    text: 'Hier, j\'ai visité le museum d\'art moderne. J\'ai beaucoup aimé les paintings, mais je ne comprends pas l\'art abstract. Après, je suis allé au restaurant pour dinner. J\'ai commandé une salad et un steak.',
    expectedIssues: ['English vocabulary substitution', 'missing French terms']
  },
  {
    id: 'french-code-switching',
    language: 'french',
    description: 'Natural code-switching between French and English',
    text: 'Je veux acheter une nouvelle voiture but I don\'t know which model to choose. J\'aime les Peugeot mais they are expensive. Maybe je devrais louer a car instead of buying one.',
    expectedIssues: ['code-switching', 'sentence structure mixing']
  }
];

// Spanish test cases with varying levels of correctness
const spanishTestCases: TestCase[] = [
  {
    id: 'spanish-perfect',
    language: 'spanish',
    description: 'Perfectly correct Spanish',
    text: 'Hola, me llamo Carlos. Vivo en Madrid desde hace cinco años. Me gusta mucho la cocina española, especialmente la paella y el gazpacho en verano. Los fines de semana, a menudo visito museos o paseo por los parques.'
  },
  {
    id: 'spanish-minor-errors',
    language: 'spanish',
    description: 'Spanish with minor grammatical errors',
    text: 'Hola, me llamo Ana. Vivo en Madrid desde cinco años. Me gusta mucho la cocina española, especialmente la paella y el gazpacho en el verano. Los fines de semana, a menudo visito a museos o paseo en los parques.',
    expectedIssues: ['preposition usage', 'article usage']
  },
  {
    id: 'spanish-major-errors',
    language: 'spanish',
    description: 'Spanish with major grammatical errors',
    text: 'Hola, yo llamo Miguel. Yo vivo en Madrid desde hace cinco año. Me gusta mucho el cocina español, especialmente el paella y la gazpacho en verano. Los fin de semana, a menudo yo visitar museos o yo pasear por los parques.',
    expectedIssues: ['reflexive verb usage', 'unnecessary subject pronoun', 'gender agreement', 'singular/plural agreement', 'verb conjugation']
  },
  {
    id: 'spanish-mixed-languages',
    language: 'spanish',
    description: 'Spanish mixed with English words',
    text: 'Hola, me llamo Laura. Vivo en Madrid since five years. Me gusta mucho la cocina española, especially la paella y el gazpacho in the summer. Los weekends, a menudo visit museos o paseo in the parks.',
    expectedIssues: ['English words', 'verb conjugation']
  },
  {
    id: 'spanish-beginner',
    language: 'spanish',
    description: 'Beginner-level Spanish with translation errors',
    text: 'Yo fue a la tienda ayer. Yo compré pan y leche. El pan estaba muy bueno pero la leche estaba malo. Yo no gusto leche malo.',
    expectedIssues: ['verb conjugation', 'gender agreement', 'verb-pronoun construction']
  },
  {
    id: 'spanish-fill-gaps',
    language: 'spanish',
    description: 'Spanish with English words to fill vocabulary gaps',
    text: 'Ayer, visité el museum de arte moderno. Me gustaron mucho las paintings, pero no entiendo el arte abstract. Después, fui a un restaurante para dinner. Pedí una salad y un steak.',
    expectedIssues: ['English vocabulary substitution', 'missing Spanish terms']
  },
  {
    id: 'spanish-code-switching',
    language: 'spanish',
    description: 'Natural code-switching between Spanish and English',
    text: 'Quiero comprar un nuevo coche but I don\'t know which model to choose. Me gustan los Seat pero they are expensive. Tal vez debería rent a car instead of buying one.',
    expectedIssues: ['code-switching', 'sentence structure mixing']
  }
];

// Combined test cases
const allTestCases: TestCase[] = [...frenchTestCases, ...spanishTestCases];

// Function to test the flashcard generation endpoint
async function testFlashcardGeneration(testCase: TestCase): Promise<any> {
  try {
    console.log(`Testing case: ${testCase.id} - ${testCase.description}`);
    
    const API_URL = 'http://localhost:4322/api/flashcards';
    console.log(`Connecting to API at: ${API_URL}`);
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: testCase.text,
        language: testCase.language
      })
    });
    
    if (!response.ok) {
      console.error(`Error with test case ${testCase.id}: ${response.statusText}`);
      return { success: false, error: response.statusText };
    }
    
    const result = await response.json();
    return {
      success: true,
      testCase,
      result
    };
  } catch (error) {
    console.error(`Error testing case ${testCase.id}:`, error);
    return { success: false, testCase, error };
  }
}

// Function to save results to a file
function saveResults(results: any[]) {
  // Create directory if it doesn't exist
  const resultDir = join(process.cwd(), 'src/tests/results');
  if (!existsSync(resultDir)) {
    mkdirSync(resultDir, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = join(resultDir, `flashcard-test-results-${timestamp}.json`);
  
  writeFileSync(
    filename,
    JSON.stringify({
      timestamp: new Date().toISOString(),
      results
    }, null, 2)
  );
  
  console.log(`Results saved to ${filename}`);
  return filename;
}

// Function to run tests for a specific language
async function runLanguageTests(language: 'french' | 'spanish') {
  const testCases = allTestCases.filter(tc => tc.language === language);
  const results = [];
  
  console.log(`Running ${testCases.length} ${language} test cases...`);
  
  for (const testCase of testCases) {
    const result = await testFlashcardGeneration(testCase);
    results.push(result);
  }
  
  return saveResults(results);
}

// Function to run all tests
async function runAllTests() {
  const results = [];
  
  console.log(`Running all ${allTestCases.length} test cases...`);
  
  for (const testCase of allTestCases) {
    const result = await testFlashcardGeneration(testCase);
    results.push(result);
  }
  
  return saveResults(results);
}

// For manually running the tests
// Uncomment the relevant line to run tests:
// runLanguageTests('french').then(console.log);
// runLanguageTests('spanish').then(console.log);
// runAllTests().then(console.log);

// Export the functions and test cases for use in other modules
export {
  testFlashcardGeneration,
  runLanguageTests,
  runAllTests,
  frenchTestCases,
  spanishTestCases,
  allTestCases
};
