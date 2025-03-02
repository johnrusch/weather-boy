import minimist from 'minimist';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Ensure fetch is available in Node.js
if (!globalThis.fetch) {
  console.log('Using node-fetch polyfill');
  // This would require: npm install node-fetch
  // const fetch = await import('node-fetch');
  // globalThis.fetch = fetch.default;
} else {
  console.log('Using native fetch API');
}

// Get the directory name using fileURLToPath
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface TranscriptionTestCase {
  id: string;
  language: 'french' | 'spanish';
  description: string;
  audioFile: string; // Path to the audio file
  expectedContent: {
    preservedEnglish?: string[]; // English phrases that should be preserved
    preservedTargetLanguage?: string[]; // Target language phrases that should be preserved
    shouldNotTranslate?: string[]; // Phrases that should not be translated
  };
}

// Configure test cases
const testCases: TranscriptionTestCase[] = [
  {
    id: 'french-code-switching-1',
    language: 'french',
    description: 'French with code-switching to English',
    audioFile: 'samples/french-code-switching-1.mp3',
    expectedContent: {
      preservedEnglish: ['I don\'t know how to say', 'excuse me'],
      preservedTargetLanguage: ['Je voudrais', 'au restaurant'],
      shouldNotTranslate: ['I don\'t know how to say']
    }
  },
  {
    id: 'spanish-code-switching-1',
    language: 'spanish',
    description: 'Spanish with code-switching to English',
    audioFile: 'samples/spanish-code-switching-1.mp3',
    expectedContent: {
      preservedEnglish: ['I can\'t remember', 'how to say'],
      preservedTargetLanguage: ['Quiero ir', 'con mis amigos'],
      shouldNotTranslate: ['I can\'t remember']
    }
  },
  {
    id: 'french-vocabulary-gaps-1',
    language: 'french',
    description: 'French with English words for unknown vocabulary',
    audioFile: 'samples/french-vocabulary-gaps-1.mp3',
    expectedContent: {
      preservedEnglish: ['museum', 'paintings', 'abstract'],
      preservedTargetLanguage: ['J\'ai visité le', 'd\'art moderne', 'je ne comprends pas'],
      shouldNotTranslate: ['museum', 'paintings', 'abstract']
    }
  },
  {
    id: 'spanish-vocabulary-gaps-1',
    language: 'spanish',
    description: 'Spanish with English words for unknown vocabulary',
    audioFile: 'samples/spanish-vocabulary-gaps-1.mp3',
    expectedContent: {
      preservedEnglish: ['museum', 'paintings', 'abstract'],
      preservedTargetLanguage: ['Ayer visité el', 'de arte moderno', 'pero no entiendo'],
      shouldNotTranslate: ['museum', 'paintings', 'abstract']
    }
  }
];

async function transcribeAudioFile(filePath: string, language: 'french' | 'spanish'): Promise<string> {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Audio file not found: ${filePath}`);
    }
    
    const audioFile = fs.readFileSync(filePath);
    const audioBlob = new Blob([audioFile]);
    
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.mp3');
    formData.append('language', language);
    
    // Determine API URL (local or production)
    const apiUrl = process.env.API_URL || 'http://localhost:4321/api/transcribe';
    
    console.log(`Connecting to API at: ${apiUrl}`);
    const response = await fetch(apiUrl, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`API error (${response.status}): ${errorData}`);
    }
    
    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error('Transcription error:', error);
    throw error;
  }
}

function analyzeTranscription(transcription: string, testCase: TranscriptionTestCase): {
  passed: boolean;
  results: Record<string, any>;
} {
  const results: Record<string, any> = {
    preservedEnglishPhrases: [],
    missingEnglishPhrases: [],
    preservedTargetLanguagePhrases: [],
    missingTargetLanguagePhrases: [],
    incorrectlyTranslatedPhrases: [],
  };
  
  // Check if English phrases are preserved
  if (testCase.expectedContent.preservedEnglish) {
    for (const phrase of testCase.expectedContent.preservedEnglish) {
      if (transcription.toLowerCase().includes(phrase.toLowerCase())) {
        results.preservedEnglishPhrases.push(phrase);
      } else {
        results.missingEnglishPhrases.push(phrase);
      }
    }
  }
  
  // Check if target language phrases are preserved
  if (testCase.expectedContent.preservedTargetLanguage) {
    for (const phrase of testCase.expectedContent.preservedTargetLanguage) {
      if (transcription.toLowerCase().includes(phrase.toLowerCase())) {
        results.preservedTargetLanguagePhrases.push(phrase);
      } else {
        results.missingTargetLanguagePhrases.push(phrase);
      }
    }
  }
  
  // Check for phrases that should not be translated
  if (testCase.expectedContent.shouldNotTranslate) {
    for (const phrase of testCase.expectedContent.shouldNotTranslate) {
      if (!transcription.toLowerCase().includes(phrase.toLowerCase())) {
        // If the phrase is missing, it might have been translated
        results.incorrectlyTranslatedPhrases.push(phrase);
      }
    }
  }
  
  // Determine if test passed
  const passed = (
    results.missingEnglishPhrases.length === 0 &&
    results.missingTargetLanguagePhrases.length === 0 &&
    results.incorrectlyTranslatedPhrases.length === 0
  );
  
  return { passed, results };
}

async function runTest(testCase: TranscriptionTestCase): Promise<void> {
  console.log(`\nRunning test: ${testCase.id} - ${testCase.description}`);
  console.log(`Language: ${testCase.language}`);
  
  try {
    // Resolve the audio file path
    const audioFilePath = path.resolve(__dirname, testCase.audioFile);
    console.log(`Audio file: ${audioFilePath}`);
    
    // Transcribe the audio
    const transcription = await transcribeAudioFile(audioFilePath, testCase.language);
    console.log(`\nTranscription result: "${transcription}"`);
    
    // Analyze the transcription
    const { passed, results } = analyzeTranscription(transcription, testCase);
    
    // Display results
    console.log('\nTest Results:');
    console.log(`Passed: ${passed ? '✅ YES' : '❌ NO'}`);
    
    if (results.preservedEnglishPhrases.length > 0) {
      console.log('✅ Preserved English phrases:', results.preservedEnglishPhrases);
    }
    
    if (results.missingEnglishPhrases.length > 0) {
      console.log('❌ Missing English phrases:', results.missingEnglishPhrases);
    }
    
    if (results.preservedTargetLanguagePhrases.length > 0) {
      console.log('✅ Preserved target language phrases:', results.preservedTargetLanguagePhrases);
    }
    
    if (results.missingTargetLanguagePhrases.length > 0) {
      console.log('❌ Missing target language phrases:', results.missingTargetLanguagePhrases);
    }
    
    if (results.incorrectlyTranslatedPhrases.length > 0) {
      console.log('❌ Incorrectly translated phrases:', results.incorrectlyTranslatedPhrases);
    }
    
    // Save results to a file
    const resultsDir = path.resolve(__dirname, 'results');
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const resultsFilePath = path.join(
      resultsDir,
      `transcription-test-${testCase.id}-${timestamp}.json`
    );
    
    fs.writeFileSync(
      resultsFilePath,
      JSON.stringify({
        testCase,
        transcription,
        analysis: { passed, results },
      }, null, 2)
    );
    
    console.log(`Results saved to ${resultsFilePath}`);
    
  } catch (error) {
    console.error(`Test failed: ${error}`);
  }
}

async function runCustomTest(text: string, language: 'french' | 'spanish'): Promise<void> {
  console.log(`\nRunning custom transcription test`);
  console.log(`Language: ${language}`);
  console.log(`Input text: "${text}"`);
  
  try {
    // Create a custom test case
    const customTestCase: TranscriptionTestCase = {
      id: 'custom-test',
      language,
      description: 'Custom transcription test',
      audioFile: '', // Not used for custom tests
      expectedContent: {} // Not used for custom tests
    };
    
    // TODO: For custom tests, you would need to convert text to speech
    // This would require a Text-to-Speech service or pre-recorded audio files
    console.log("NOTE: Custom text testing requires text-to-speech functionality which is not implemented here.");
    console.log("Please use one of the predefined test cases for now.");
    
  } catch (error) {
    console.error(`Custom test failed: ${error}`);
  }
}

async function main() {
  const argv = minimist(process.argv.slice(2));
  
  // Create the samples directory if it doesn't exist
  const samplesDir = path.resolve(__dirname, 'samples');
  if (!fs.existsSync(samplesDir)) {
    fs.mkdirSync(samplesDir, { recursive: true });
    console.log(`Created samples directory at ${samplesDir}`);
    console.log(`Please add audio samples to this directory before running tests.`);
  }
  
  // Handle command line arguments
  if (argv.help || argv.h) {
    console.log(`
Usage:
  npm run test-transcription [options]

Options:
  --id=<test-id>          Run a specific test by ID
  --language=<language>   Run all tests for a specific language (french|spanish)
  --text=<text>           Run a custom test with the provided text (requires TTS)
  --list                  List all available tests
  --help, -h              Show this help message
`);
    return;
  }
  
  if (argv.list) {
    console.log('Available tests:');
    testCases.forEach(test => {
      console.log(`- ${test.id}: ${test.description} (${test.language})`);
    });
    return;
  }
  
  // Run a specific test by ID
  if (argv.id) {
    const testCase = testCases.find(test => test.id === argv.id);
    if (testCase) {
      await runTest(testCase);
    } else {
      console.error(`Test with ID "${argv.id}" not found.`);
    }
    return;
  }
  
  // Run tests for a specific language
  if (argv.language && !argv.text) {
    const language = argv.language.toLowerCase();
    if (language !== 'french' && language !== 'spanish') {
      console.error(`Invalid language: ${language}. Must be "french" or "spanish".`);
      return;
    }
    
    const languageTests = testCases.filter(test => test.language === language);
    if (languageTests.length === 0) {
      console.error(`No tests found for language: ${language}`);
      return;
    }
    
    for (const testCase of languageTests) {
      await runTest(testCase);
    }
    return;
  }
  
  // Run a custom test with provided text
  if (argv.text) {
    const language = (argv.language || 'french').toLowerCase();
    if (language !== 'french' && language !== 'spanish') {
      console.error(`Invalid language: ${language}. Must be "french" or "spanish".`);
      return;
    }
    
    await runCustomTest(argv.text, language as 'french' | 'spanish');
    return;
  }
  
  // Run all tests if no specific options provided
  console.log('Running all transcription tests...');
  for (const testCase of testCases) {
    await runTest(testCase);
  }
}

main().catch(error => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
