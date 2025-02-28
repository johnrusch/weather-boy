import type { APIRoute } from 'astro';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.OPENAI_API_KEY
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.text();
    const { text, language = 'french' } = JSON.parse(body);

    if (!text || typeof text !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing or invalid text' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const getSystemPrompt = (lang: string) => {
      if (lang === 'spanish') {
        return `You are a Spanish language teacher creating flashcards from student responses. Your goal is to create practical, conversational flashcards that focus on short, natural phrases (3-9 words).

Key Rules:
1. Keep ALL phrases between 3-9 words
2. Focus on natural, conversational expressions
3. Prioritize high-frequency, practical phrases
4. Make corrections brief and memorable

Create exactly 5 flashcards based on the student's Spanish response:
- 2 flashcards correcting grammar or pronunciation errors (type: "correction")
- 2 flashcards with alternative ways to express the same ideas (type: "variation")
- 1 flashcard with a useful translation of a key phrase (type: "translation")

Format each flashcard as:
{
  "targetLanguage": "Spanish phrase (3-9 words)",
  "english": "English translation",
  "type": "correction/variation/translation",
  "originalText": "Original text being corrected" (only for correction-type cards)
}`;
      } else {
        return `You are a French language teacher creating flashcards from student responses. Your goal is to create practical, conversational flashcards that focus on short, natural phrases (3-9 words).

Key Rules:
1. Keep ALL phrases between 3-9 words
2. Focus on natural, conversational expressions
3. Prioritize high-frequency, practical phrases
4. Make corrections brief and memorable

Create exactly 5 flashcards based on the student's French response:
- 2 flashcards correcting grammar or pronunciation errors (type: "correction")
- 2 flashcards with alternative ways to express the same ideas (type: "variation")
- 1 flashcard with a useful translation of a key phrase (type: "translation")

Format each flashcard as:
{
  "targetLanguage": "French phrase (3-9 words)",
  "english": "English translation",
  "type": "correction/variation/translation",
  "originalText": "Original text being corrected" (only for correction-type cards)
}`;
      }
    };

    const functions = [
      {
        name: "create_flashcards",
        description: `Create flashcards based on the student's ${language} response`,
        parameters: {
          type: "object",
          properties: {
            flashcards: {
              type: "array",
              description: "Array of flashcards",
              items: {
                type: "object",
                properties: {
                  targetLanguage: {
                    type: "string",
                    description: `${language} phrase (3-9 words)`
                  },
                  english: {
                    type: "string",
                    description: "English translation"
                  },
                  type: {
                    type: "string",
                    enum: ["correction", "translation", "variation"],
                    description: "Type of flashcard"
                  },
                  originalText: {
                    type: "string",
                    description: "Original text being corrected (only for correction-type cards)"
                  }
                },
                required: ["targetLanguage", "english", "type"]
              }
            }
          },
          required: ["flashcards"]
        }
      }
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: getSystemPrompt(language)
        },
        {
          role: "user",
          content: text
        }
      ],
      functions: functions,
      function_call: { name: "create_flashcards" }
    });

    const functionCall = response.choices[0].message.function_call;
    
    if (!functionCall) {
      throw new Error('Failed to generate flashcards');
    }
    
    const parsedResponse = JSON.parse(functionCall.arguments);
    
    return new Response(JSON.stringify(parsedResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("Error generating flashcards:", error);
    return new Response(JSON.stringify({ error: "Failed to generate flashcards" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
};