import type { APIRoute } from 'astro';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.OPENAI_API_KEY
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.text();
    const { text } = JSON.parse(body);

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a French language teacher creating flashcards from a student's response. 
          The response will contain:
          1. Attempted French phrases (which may need correction)
          2. English phrases (which the student wants to know how to say in French)
          3. Mixed language expressions
          
          Rules for creating flashcards:
          1. For English phrases (type: "translation"):
             - Create natural French translations
             - Focus on how a native speaker would express the idea
             - Include the most common/useful way to say it
          
          2. For attempted French phrases (type: "correction"):
             - Identify and fix grammatical errors
             - Correct word choice and structure
             - Include the original attempt for reference
             - Show proper French phrasing
          
          3. For variations (type: "variation"):
             - Provide alternative ways to express similar ideas
             - Include common expressions and idioms
             - Show different grammatical structures
             - Keep related to the original context
          
          Keep all phrases between 2-8 words for easy learning.
          
          Examples:
          1. Translation:
             English: "my alter ego would be"
             French: "mon alter ego serait"
          
          2. Correction:
             Original: "j'ai le pouvoir à remarquer"
             Corrected: "j'ai le pouvoir de remarquer"
             Also: "je peux remarquer"
          
          3. Variation:
             Context: "where I see a square"
             Variations: 
               - "où je vois un carré"
               - "quand j'aperçois un carré"
               - "lorsque je remarque un carré"`
        },
        {
          role: "user",
          content: `Create flashcards from this response, providing corrections and translations: ${text}`
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
                    originalText: {
                      type: "string",
                      description: "The original text being corrected (for correction type only)"
                    }
                  },
                  required: ["french", "english", "type"]
                }
              }
            },
            required: ["flashcards"]
          }
        }
      ],
      function_call: { name: "create_flashcards" }
    });

    const functionCall = response.choices[0].message.function_call;
    if (functionCall && functionCall.arguments) {
      return new Response(functionCall.arguments, {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    throw new Error('Failed to generate flashcards');
  } catch (error) {
    console.error('Error generating flashcards:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate flashcards' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}