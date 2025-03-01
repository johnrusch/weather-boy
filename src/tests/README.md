# Flashcard Generation Testing Suite

This directory contains a comprehensive testing suite for the flashcard generation functionality of the language learning application. The suite allows you to test the flashcard generation API independently from the rest of the application.

## Contents

- **Unit Tests**: Automated tests for the flashcard generation API endpoint
- **Integration Tests**: Tools to test the API with various language samples
- **Analysis Tools**: Utilities to analyze and visualize test results

## Testing Approach

The testing suite focuses on testing the flashcard generation capabilities with various language inputs, ranging from perfectly correct to highly incorrect language samples. This approach allows us to:

1. Verify that the API correctly identifies language errors
2. Ensure appropriate corrections are generated
3. Test the variety and quality of flashcards produced
4. Evaluate the system's handling of mixed language inputs
5. Test how the system handles code-switching between the target language and English

## Getting Started

### Prerequisites

Make sure you have the required dependencies:

```bash
npm install
```

### Running Unit Tests

To run the API unit tests:

```bash
npm test src/pages/api/__tests__/flashcards.test.ts
```

### Running Integration Tests

To test the flashcard generation with predefined language samples:

```bash
# Test all language samples
npm run flashcard-tests -- --all

# Test only French samples
npm run flashcard-tests -- --language=french

# Test only Spanish samples
npm run flashcard-tests -- --language=spanish
```

### Testing with Custom Text

To test the flashcard generation with your own custom text:

```bash
# Test with French text
npm run test-custom-flashcards -- --text="Je vais au cinéma demain" --language=french

# Test with Spanish text
npm run test-custom-flashcards -- --text="Voy al cine mañana" --language=spanish
```

### Analyzing Test Results

After running tests, you can analyze the results:

```bash
# Analyze the most recent test results
npm run analyze-flashcards

# Analyze a specific results file
npm run analyze-flashcards -- --file=src/tests/results/flashcard-test-results-2025-03-01T12-34-56-789Z.json
```

## Test Cases

### French Test Cases

1. **french-perfect**: Perfectly correct French text
2. **french-minor-errors**: French with minor grammatical errors (gender agreement, prepositions)
3. **french-major-errors**: French with major grammatical errors (elision, conjugation)
4. **french-mixed-languages**: French with some English words mixed in
5. **french-beginner**: Beginner-level French with various translation errors
6. **french-fill-gaps**: French sentences where English words are used to fill vocabulary gaps
7. **french-code-switching**: Natural code-switching between French and English in a conversation

### Spanish Test Cases

1. **spanish-perfect**: Perfectly correct Spanish text
2. **spanish-minor-errors**: Spanish with minor grammatical errors (prepositions, articles)
3. **spanish-major-errors**: Spanish with major grammatical errors (verb usage, gender agreement)
4. **spanish-mixed-languages**: Spanish with some English words mixed in
5. **spanish-beginner**: Beginner-level Spanish with various translation errors
6. **spanish-fill-gaps**: Spanish sentences where English words are used to fill vocabulary gaps
7. **spanish-code-switching**: Natural code-switching between Spanish and English in a conversation

### Code-Switching Scenarios

The test suite specifically addresses the common scenario where language learners mix their native language (English) with the target language when they don't know certain vocabulary or expressions. These test cases are designed to evaluate how well the flashcard generation system:

1. Identifies English words in target language contexts
2. Suggests appropriate translations for the English words
3. Creates useful flashcards for vocabulary gaps
4. Handles natural code-switching in conversation

These scenarios are particularly important for beginner and intermediate learners who often need to use their native language to fill knowledge gaps.

The test suite includes predefined test cases for both French and Spanish:

- **Perfect language usage**: Grammatically correct sentences
- **Minor errors**: Sentences with small grammatical issues
- **Major errors**: Sentences with significant grammatical problems
- **Mixed language**: Target language mixed with English words
- **Beginner level**: Simple sentences with typical beginner mistakes

## Extending the Test Suite

### Adding New Test Cases

To add more test cases, modify the arrays in `flashcard-generator-test.ts`:

```typescript
// Add a new French test case
const newFrenchTestCase: TestCase = {
  id: 'french-custom',
  language: 'french',
  description: 'Custom French test case',
  text: 'Your French text here',
  expectedIssues: ['list', 'of', 'expected', 'issues']
};

frenchTestCases.push(newFrenchTestCase);
```

### Customizing Analysis

The analysis tool can be extended by modifying `analyze-flashcard-results.ts` to include additional metrics or visualizations.

## Test Results

Test results are saved in the `src/tests/results` directory with timestamps. Each result file contains:

- Test case details
- Generated flashcards
- Success/failure status
- Error information (if applicable)

The results can be used to track improvements in the flashcard generation system over time.

## Future Improvements

Potential improvements to the testing suite:

- Automated comparison of results against expected outputs
- Performance benchmarking
- UI for viewing and comparing test results
- Integration with CI/CD pipeline
