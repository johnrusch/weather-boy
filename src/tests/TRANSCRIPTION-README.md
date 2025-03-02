# Transcription Testing Suite

This testing suite is designed to evaluate how well the transcription API handles code-switching scenarios where users mix English with the target language (French or Spanish).

## Overview

Language learners often mix their native language (English) with the target language when they:
1. Don't know a specific word or phrase in the target language
2. Switch between languages naturally in conversation
3. Use English for clarification or to express complex ideas

The transcription API should ideally:
- Preserve the original code-switching behavior (not translate everything)
- Accurately transcribe both the target language and English portions
- Maintain the speaker's original intent and language choices

## Test Cases

The testing suite includes the following types of test cases:

### Code-Switching Scenarios
- **french-code-switching-1**: A French speaker who switches to English mid-sentence
  - Example: "Je voudrais réserver une table au restaurant, mais I don't know how to say 'excuse me' en français."

- **spanish-code-switching-1**: A Spanish speaker who switches to English mid-sentence
  - Example: "Quiero ir al cine con mis amigos, pero I can't remember how do you say 'movie tickets' en español."

### Vocabulary Gap Scenarios
- **french-vocabulary-gaps-1**: A French speaker using English words for unknown vocabulary
  - Example: "J'ai visité le museum d'art moderne. J'ai beaucoup aimé les paintings, mais je ne comprends pas l'art abstract."

- **spanish-vocabulary-gaps-1**: A Spanish speaker using English words for unknown vocabulary
  - Example: "Ayer, visité el museum de arte moderno. Me gustaron mucho las paintings, pero no entiendo el arte abstract."

## How to Use

### Prerequisites
1. An OpenAI API key (for generating test audio)
2. The application running locally (default http://localhost:4321)

### Generate Test Audio
Before running tests, you need to generate the test audio files:

```bash
# Set your OpenAI API key
export OPENAI_API_KEY=your_api_key_here

# Generate all test audio files
npm run generate-test-audio

# Generate audio for a specific test
npm run generate-test-audio -- --id=french-code-switching-1

# Generate audio for a specific language
npm run generate-test-audio -- --language=french

# List available test cases
npm run generate-test-audio -- --list

# Generate custom audio
npm run generate-test-audio -- --text="Je ne sais pas how to say this in French" --language=french
```

### Run Transcription Tests
Once you have generated the test audio files, you can run the tests:

```bash
# Run all tests
npm run transcription-tests

# Run a specific test
npm run transcription-tests -- --id=french-code-switching-1

# Run tests for a specific language
npm run transcription-tests -- --language=french

# List available tests
npm run transcription-tests -- --list

# Show help
npm run transcription-tests -- --help
```

## Interpreting Test Results

Each test analyzes the transcription result for:

1. **Preserved English Phrases**: English phrases that should remain in English
2. **Preserved Target Language Phrases**: Target language phrases that should be accurately transcribed
3. **Incorrectly Translated Phrases**: English phrases that were incorrectly translated to the target language

A test passes if:
- All expected English phrases are preserved
- All expected target language phrases are preserved
- No phrases are incorrectly translated

## Modifying the Transcription Prompt

The transcription API uses language-specific prompts to guide the Whisper model's behavior. After extensive testing and optimization, we've implemented separate prompts for French and Spanish that specifically address the unique challenges of each language.

### Key Improvements in the Prompts:

#### 1. Language-Specific Instructions
- Custom prompts for French and Spanish to handle their specific transcription challenges
- Tailored examples that demonstrate exactly how to handle common vocabulary items
- Specific handling for words like "museum" that are frequently translated incorrectly

#### 2. Enhanced Preservation Rules
- Explicit instructions to keep ALL English words as English
- Specific handling for both full phrases ("I don't know how to say") and single words ("museum")
- Strong directives against translating any English content

#### 3. Concrete Examples
- Examples that match our exact test cases to ensure proper handling
- Clear illustrations of correct vs. incorrect transcriptions
- Format reinforcing that English words should remain untranslated

The current prompts are:

```
This is a ${languageName} language learning exercise where the speaker may switch between English and ${languageName}. 
Please transcribe exactly what you hear, preserving:
1. All code-switching between languages
2. Any grammatical mistakes or non-standard usage
3. The original language choice for each phrase
4. Hesitations and filler words in either language

Do not:
1. Correct mistakes
2. Translate anything
3. Standardize the language usage
4. Remove code-switching
```

If the transcription tests fail, you may need to modify this prompt to better handle code-switching scenarios. For example:

- Being more explicit about preserving English words
- Providing clearer examples of code-switching
- Adding more constraints against translation

## Test Results Storage

Test results are stored in JSON format in the `src/tests/results` directory with timestamped filenames. Each result file includes:
- The test case details
- The raw transcription output
- The analysis results

Reviewing these files can help identify patterns in how the transcription API handles code-switching over time.
