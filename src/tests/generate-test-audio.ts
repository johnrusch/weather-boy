#!/usr/bin/env tsx

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import minimist from 'minimist';
import OpenAI from 'openai';

// Get the directory name using fileURLToPath
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface TestAudioSpec {
  id: string;
  language: 'french' | 'spanish';
  description: string;
  text: string;
  voice: string;
}

// Define test audio specifications
const testAudioSpecs: TestAudioSpec[] = [
  {
    id: 'french-code-switching-1',
    language: 'french',
    description: 'French with code-switching to English',
    text: 'Je voudrais réserver une table au restaurant, mais I don\'t know how to say "excuse me" en français.',
    voice: 'alloy', // TTS-1 supports: alloy, echo, fable, onyx, nova, and shimmer
  },
  {
    id: 'spanish-code-switching-1',
    language: 'spanish',
    description: 'Spanish with code-switching to English',
    text: 'Quiero ir al cine con mis amigos, pero I can\'t remember how do you say "movie tickets" en español.',
    voice: 'alloy',
  },
  {
    id: 'french-vocabulary-gaps-1',
    language: 'french',
    description: 'French with English words for unknown vocabulary',
    text: 'J\'ai visité le museum d\'art moderne. J\'ai beaucoup aimé les paintings, mais je ne comprends pas l\'art abstract.',
    voice: 'alloy',
  },
  {
    id: 'spanish-vocabulary-gaps-1',
    language: 'spanish',
    description: 'Spanish with English words for unknown vocabulary',
    text: 'Ayer, visité el museum de arte moderno. Me gustaron mucho las paintings, pero no entiendo el arte abstract.',
    voice: 'alloy',
  }
];

async function generateAudio(spec: TestAudioSpec): Promise<void> {
  console.log(`Generating audio for: ${spec.id} - ${spec.description}`);
  
  // Create samples directory if it doesn't exist
  const samplesDir = path.resolve(__dirname, 'samples');
  if (!fs.existsSync(samplesDir)) {
    fs.mkdirSync(samplesDir, { recursive: true });
  }
  
  // Output file path
  const outputPath = path.join(samplesDir, `${spec.id}.mp3`);
  
  try {
    // Generate speech using OpenAI TTS API
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: spec.voice,
      input: spec.text,
    });
    
    // Convert to buffer and save to file
    const buffer = Buffer.from(await mp3.arrayBuffer());
    fs.writeFileSync(outputPath, buffer);
    
    console.log(`✅ Audio saved to: ${outputPath}`);
  } catch (error) {
    console.error(`❌ Error generating audio for ${spec.id}:`, error);
  }
}

async function main() {
  const argv = minimist(process.argv.slice(2));
  
  // Handle command line arguments
  if (argv.help || argv.h) {
    console.log(`
Usage:
  npm run generate-test-audio [options]

Options:
  --id=<test-id>            Generate audio for a specific test by ID
  --language=<language>     Generate audio for a specific language (french|spanish)
  --list                    List all available test audio specifications
  --text=<text>             Generate custom audio with the provided text
  --voice=<voice>           Voice to use (default: alloy, options: alloy, echo, fable, onyx, nova, shimmer)
  --language=<lang>         Language for custom text (required with --text, options: french, spanish)
  --help, -h                Show this help message
`);
    return;
  }
  
  if (argv.list) {
    console.log('Available test audio specifications:');
    testAudioSpecs.forEach(spec => {
      console.log(`- ${spec.id}: ${spec.description} (${spec.language})`);
      console.log(`  Text: "${spec.text}"`);
    });
    return;
  }
  
  // Validate OPENAI_API_KEY
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ Error: OPENAI_API_KEY environment variable is not set.');
    console.error('Please set your OpenAI API key as an environment variable:');
    console.error('export OPENAI_API_KEY=your_api_key_here');
    return;
  }
  
  // Generate audio for a specific test by ID
  if (argv.id) {
    const spec = testAudioSpecs.find(spec => spec.id === argv.id);
    if (spec) {
      await generateAudio(spec);
    } else {
      console.error(`Test spec with ID "${argv.id}" not found.`);
    }
    return;
  }
  
  // Generate audio for a specific language
  if (argv.language && !argv.text) {
    const language = argv.language.toLowerCase();
    if (language !== 'french' && language !== 'spanish') {
      console.error(`Invalid language: ${language}. Must be "french" or "spanish".`);
      return;
    }
    
    const languageSpecs = testAudioSpecs.filter(spec => spec.language === language);
    if (languageSpecs.length === 0) {
      console.error(`No test specs found for language: ${language}`);
      return;
    }
    
    for (const spec of languageSpecs) {
      await generateAudio(spec);
    }
    return;
  }
  
  // Generate custom audio with provided text
  if (argv.text) {
    const language = (argv.language || '').toLowerCase();
    if (language !== 'french' && language !== 'spanish') {
      console.error(`Invalid or missing language: ${language}. Must specify --language=french or --language=spanish with custom text.`);
      return;
    }
    
    const voice = (argv.voice || 'alloy').toLowerCase();
    const validVoices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
    if (!validVoices.includes(voice)) {
      console.error(`Invalid voice: ${voice}. Must be one of: ${validVoices.join(', ')}`);
      return;
    }
    
    const customSpec: TestAudioSpec = {
      id: `custom-${language}-${Date.now()}`,
      language: language as 'french' | 'spanish',
      description: 'Custom generated audio',
      text: argv.text,
      voice,
    };
    
    await generateAudio(customSpec);
    return;
  }
  
  // Generate all test audio if no specific options provided
  console.log('Generating all test audio files...');
  for (const spec of testAudioSpecs) {
    await generateAudio(spec);
  }
}

main().catch(error => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
