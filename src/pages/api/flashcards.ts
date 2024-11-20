import type { APIRoute } from 'astro';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.OPENAI_API_KEY
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.text();
    const { text } = JSON.parse(body);

    if (!text || typeof text !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing or invalid text' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a French language teacher creating flashcards from student responses. Your goal is to create practical, conversational flashcards that focus on short, natural phrases (3-9 words).

Key Rules:
1. Keep ALL phrases between 3-9 words
2. Focus on natural, conversational expressions
3. Prioritize high-frequency, practical phrases
4. Make corrections brief and memorable

Create 5 types of flashcards:

1. Corrections (if needed):
   - Fix errors concisely
   - Show the natural way to express the idea
   Example:
   Wrong: "Je suis allé au le magasin"
   Right: "Je suis allé au magasin"

2. Alternative Expressions:
   - Show different ways to express the same idea
   - Keep variations natural and common
   Example:
   Original: "Je voudrais un café"
   Variations: "Je prendrais un café"

3. Key Phrases:
   - Extract useful phrases from the prompt
   - Focus on everyday expressions
   Example:
   "Comment allez-vous aujourd'hui?"

4. Related Expressions:
   - Add common phrases in the same context
   - Keep them practical and frequent
   Example:
   Context: Ordering coffee
   Related: "Un café crème, s'il vous plaît"

5. Essential Vocabulary:
   - Include key words in short phrases
   - Show common usage
   Example:
   Word: café
   Phrase: "On va prendre un café?"

Remember:
- EVERY phrase must be 3-9 words
- Focus on natural conversation
- Prioritize high-frequency expressions
- Keep it simple and practical`
        },
        {
          role: "user",
          content: text
        }
      ],
      functions: [
        {
          name: "create_flashcards",
          description: "Create French-English flashcard pairs",
          parameters: {
            type: "object",
            properties: {
              flashcards: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    french: {
                      type: "string",
                      description: "The French phrase"
                    },
                    english: {
                      type: "string",
                      description: "The English translation"
                    },
                    type: {
                      type: "string",
                      enum: ["correction", "translation", "variation"],
                      description: "The type of flashcard"
                    },
                    notes: {
                      type: "string",
                      description: "Optional notes about usage, pronunciation, or context"
                    }
                  },
                  required: ["french", "english", "type"]
                },
                minItems: 5
              }
            },
            required: ["flashcards"]
          }
        }
      ],
      function_call: { name: "create_flashcards" }
    });

    const functionCall = response.choices[0].message.function_call;
    if (!functionCall || !functionCall.arguments) {
      console.error('No function call or arguments in response:', response);
      throw new Error('Failed to generate flashcards - no function call data');
    }

    let parsedArgs;
    try {
      parsedArgs = JSON.parse(functionCall.arguments);
      console.log('Parsed flashcard arguments:', parsedArgs);
    } catch (parseError) {
      console.error('Failed to parse function call arguments:', functionCall.arguments);
      console.error('Parse error:', parseError);
      throw new Error('Failed to parse flashcard data');
    }

    if (!parsedArgs.flashcards || !Array.isArray(parsedArgs.flashcards)) {
      console.error('Invalid flashcards format:', parsedArgs);
      throw new Error('Invalid flashcards format');
    }

    // Validate and clean each flashcard
    const validatedFlashcards = parsedArgs.flashcards
      .map(card => {
        if (!card || typeof card !== 'object') return null;
        
        // Convert fields to strings and trim
        const french = String(card.french || '').trim();
        const english = String(card.english || '').trim();
        const type = String(card.type || 'translation').trim();
        
        // Validate word count
        const wordCount = french.split(/\s+/).length;
        if (wordCount < 3 || wordCount > 9) {
          console.log(`Skipping card with ${wordCount} words:`, card);
          return null;
        }

        return {
          french,
          english,
          type: ['correction', 'translation', 'variation'].includes(type) ? type : 'translation',
          notes: card.notes ? String(card.notes).trim() : undefined
        };
      })
      .filter(card => card && card.french && card.english);

    if (validatedFlashcards.length === 0) {
      console.warn('No valid flashcards after validation');
      // Return a minimal set of valid flashcards
      return new Response(JSON.stringify({
        flashcards: [{
          french: text.split('\n')[0].trim(),
          english: "Practice this phrase",
          type: "translation"
        }]
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('Returning validated flashcards:', validatedFlashcards);
    return new Response(JSON.stringify({ flashcards: validatedFlashcards }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error generating flashcards:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate flashcards' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}