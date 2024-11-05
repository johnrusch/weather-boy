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
          content: `You are a French language teacher creating flashcards. 
          For each response, you will receive:
          1. The original response
          2. An evaluator's feedback with corrections and suggestions
          
          Create flashcards that:
          1. Use the corrected/improved phrases from the evaluator's feedback when available
          2. Avoid phrases marked as unnatural or incorrect
          3. Include both simple and complex grammatical structures
          4. Focus on useful, conversational French
          5. Prioritize natural, idiomatic expressions
          
          When the evaluator suggests better alternatives, use those for the flashcards instead of the original phrases.`
        },
        {
          role: "user",
          content: `Create French-English flashcard pairs from this content, prioritizing corrected phrases from the evaluator's feedback: ${text}`
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
                      description: "The French phrase (using corrected versions when available)"
                    },
                    english: {
                      type: "string",
                      description: "The English translation"
                    }
                  },
                  required: ["french", "english"]
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