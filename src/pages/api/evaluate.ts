import type { APIRoute } from 'astro';
import OpenAI from 'openai';

const API_KEY = import.meta.env.OPENAI_API_KEY;

const openai = new OpenAI({
  apiKey: API_KEY,
  dangerouslyAllowBrowser: true
});

const getLevelSpecificPrompt = (levelId: number) => {
  const basePrompt = `You are a French language teacher evaluating a student's spoken response. 
  Analyze the following aspects:
  1. Pronunciation and accent (30 points)
  2. Grammar and sentence structure (30 points)
  3. Vocabulary usage and appropriateness (20 points)
  4. Response relevance to prompt (20 points)`;

  switch (levelId) {
    case 1:
      return `${basePrompt}
      For Level 1 (Basic Introductions), focus on:
      - Basic pronunciation of common French sounds
      - Simple present tense usage
      - Essential vocabulary for introductions
      - Clear communication of basic information`;
    case 2:
      return `${basePrompt}
      For Level 2 (Home and Family), focus on:
      - Accurate pronunciation of family-related terms
      - Possessive adjectives and basic descriptions
      - Family and home-related vocabulary
      - Logical flow of family descriptions`;
    default:
      return basePrompt;
  }
};

const functions = [
  {
    name: "evaluate_french_response",
    description: "Evaluate a French language response",
    parameters: {
      type: "object",
      properties: {
        score: {
          type: "number",
          description: "Overall score (0-100)"
        },
        feedback: {
          type: "string",
          description: "Constructive feedback for the student"
        },
        percentageFrench: {
          type: "number",
          description: "Percentage of response that was in French (0-100)"
        },
        promptRelevance: {
          type: "string",
          description: "How relevant the response was to the prompt (High/Medium/Low)"
        },
        details: {
          type: "object",
          properties: {
            pronunciation: {
              type: "number",
              description: "Pronunciation score (0-30)"
            },
            grammar: {
              type: "number",
              description: "Grammar score (0-30)"
            },
            vocabulary: {
              type: "number",
              description: "Vocabulary score (0-20)"
            },
            relevance: {
              type: "number",
              description: "Relevance score (0-20)"
            }
          },
          required: ["pronunciation", "grammar", "vocabulary", "relevance"]
        }
      },
      required: ["score", "feedback", "percentageFrench", "promptRelevance", "details"]
    }
  }
];

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.text();
    const { transcription, prompt, mode, levelId } = JSON.parse(body);

    if (!transcription || !prompt) {
      return new Response(JSON.stringify({ error: 'Missing transcription or prompt' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const evaluationPrompt = mode === 'campaign'
      ? getLevelSpecificPrompt(levelId)
      : `You are a French language teacher evaluating a student's spoken response.
         Analyze the response for accuracy, fluency, and relevance.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { 
          role: "system", 
          content: evaluationPrompt
        },
        {
          role: "user",
          content: `Prompt: ${prompt}\nStudent's response: ${transcription}\n\nProvide a detailed evaluation with specific scores for each category and constructive feedback. Include the percentage of the response that was in French and how relevant it was to the prompt.`
        }
      ],
      functions,
      function_call: { name: "evaluate_french_response" }
    });

    const functionCall = response.choices[0].message.function_call;
    if (!functionCall || !functionCall.arguments) {
      throw new Error('Failed to get evaluation');
    }

    const evaluation = JSON.parse(functionCall.arguments);
    return new Response(JSON.stringify(evaluation), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in evaluation:', error);
    return new Response(JSON.stringify({ error: 'Failed to evaluate response' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}