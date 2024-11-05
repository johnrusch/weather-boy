import type { APIRoute } from 'astro';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.OPENAI_API_KEY
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const { text } = await request.json();

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a French language teacher. Create flashcards from the given text. If the text is in English, translate it to French. If it's in French, provide the English translation. Focus on common conversational phrases and vocabulary. Each flashcard should be a maximum of 6-7 words. Extract as many useful phrases as possible from the text, but keep them natural and conversational."
        },
        {
          role: "user",
          content: `Generate French language flashcards from this text: ${text}`
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
                      description: "The French phrase or word"
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
      const { flashcards } = JSON.parse(functionCall.arguments);
      return new Response(JSON.stringify({ flashcards }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    throw new Error('Failed to generate flashcards');
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to generate flashcards' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}