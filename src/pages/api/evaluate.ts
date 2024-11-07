import type { APIRoute } from 'astro';
import OpenAI from 'openai';

const API_KEY = import.meta.env.OPENAI_API_KEY;

const openai = new OpenAI({
  apiKey: API_KEY,
  dangerouslyAllowBrowser: true
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.text();
    const { text, prompt } = JSON.parse(body);

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a French language evaluator. For each response, consider:

          1. Relevance to Prompt (30% of score):
          - How well the response addresses the given prompt
          - Depth and thoughtfulness of the answer
          - Appropriate level of detail

          2. Language Usage (70% of score):
          - Percentage of response in French vs other languages
          - Grammatical correctness
          - Natural flow and appropriate vocabulary
          - Overall effectiveness of communication
          
          Score criteria:
          0-3: Mostly English or minimal French, and/or doesn't address prompt
          4-6: Mix of French and English, basic French structures, partially addresses prompt
          7-8: Mostly French with minor errors, good response to prompt
          9-10: Natural, fluent French with proper grammar, excellent response to prompt`
        },
        {
          role: "user",
          content: `Evaluate this response to the prompt: "${prompt}"

Response: "${text}"`
        }
      ],
      functions: [
        {
          name: "evaluate_french_response",
          description: "Evaluate a French language response",
          parameters: {
            type: "object",
            properties: {
              score: {
                type: "number",
                description: "Overall score from 0-10"
              },
              feedback: {
                type: "string",
                description: "Detailed feedback about both language use and response to prompt"
              },
              percentageFrench: {
                type: "number",
                description: "Percentage of response that was in French (0-100)"
              },
              promptRelevance: {
                type: "string",
                description: "How well the response addresses the prompt"
              }
            },
            required: ["score", "feedback", "percentageFrench", "promptRelevance"]
          }
        }
      ],
      function_call: { name: "evaluate_french_response" }
    });

    const functionCall = response.choices[0].message.function_call;
    if (functionCall && functionCall.arguments) {
      return new Response(functionCall.arguments, {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    throw new Error('Failed to get evaluation');
  } catch (error) {
    console.error('Error in evaluation:', error);
    return new Response(JSON.stringify({ error: 'Failed to evaluate response' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 