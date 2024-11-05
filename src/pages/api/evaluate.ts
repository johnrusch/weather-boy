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
    const { text, language } = JSON.parse(body);

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a ${language === 'spanish' ? 'Spanish' : 'French'} language evaluator. Analyze the following response for:
          1. Percentage of response in ${language === 'spanish' ? 'Spanish' : 'French'} vs other languages
          2. Grammatical correctness
          3. Natural flow and appropriate vocabulary
          4. Overall effectiveness of communication
          
          Score criteria:
          0-3: Mostly/all English or other non-${language === 'spanish' ? 'Spanish' : 'French'} languages
          4-6: Mix of ${language === 'spanish' ? 'Spanish' : 'French'} and English, with basic structures
          7-8: Mostly ${language === 'spanish' ? 'Spanish' : 'French'} with minor errors
          9-10: Natural, fluent ${language === 'spanish' ? 'Spanish' : 'French'} with proper grammar and vocabulary`
        },
        {
          role: "user",
          content: `Evaluate this response: "${text}"`
        }
      ],
      functions: [
        {
          name: "evaluate_response",
          description: `Evaluate a ${language === 'spanish' ? 'Spanish' : 'French'} language response`,
          parameters: {
            type: "object",
            properties: {
              score: {
                type: "number",
                description: "Score from 0-10"
              },
              feedback: {
                type: "string",
                description: "Detailed feedback about the response"
              },
              percentageFrench: {
                type: "number",
                description: `Percentage of response that was in ${language === 'spanish' ? 'Spanish' : 'French'} (0-100)`
              }
            },
            required: ["score", "feedback", "percentageFrench"]
          }
        }
      ],
      function_call: { name: "evaluate_response" }
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