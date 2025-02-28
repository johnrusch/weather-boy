import type { APIRoute } from 'astro';
import OpenAI from 'openai';

const API_KEY = import.meta.env.OPENAI_API_KEY;

const openai = new OpenAI({
  apiKey: API_KEY,
  dangerouslyAllowBrowser: true
});

const getLanguageSpecificPrompt = (language: string, levelId: number) => {
  // Base prompt for French
  const frenchBasePrompt = `You are a French language teacher evaluating a student's spoken response. 
  Analyze the following aspects:
  1. Pronunciation and accent (30 points)
  2. Grammar and sentence structure (30 points)
  3. Vocabulary usage and appropriateness (20 points)
  4. Response relevance to prompt (20 points)`;
  
  // Base prompt for Spanish
  const spanishBasePrompt = `You are a Spanish language teacher evaluating a student's spoken response. 
  Analyze the following aspects:
  1. Pronunciation and accent (30 points)
  2. Grammar and sentence structure (30 points)
  3. Vocabulary usage and appropriateness (20 points)
  4. Response relevance to prompt (20 points)`;
  
  // Select the appropriate base prompt
  const basePrompt = language === 'spanish' ? spanishBasePrompt : frenchBasePrompt;

  // For French
  if (language === 'french') {
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
  } 
  // For Spanish
  else if (language === 'spanish') {
    switch (levelId) {
      case 1:
        return `${basePrompt}
        For Level 1 (Basic Introductions), focus on:
        - Basic pronunciation of common Spanish sounds
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
  }
  
  return basePrompt;
};

const functions = [
  {
    name: "evaluate_language_response",
    description: "Evaluate a language response",
    parameters: {
      type: "object",
      properties: {
        score: {
          type: "number",
          description: "Overall score (0-100)"
        },
        feedback: {
          type: "string",
          description: "Specific feedback for the student's response"
        },
        percentageTargetLanguage: {
          type: "number",
          description: "Estimated percentage of response that was in the target language (0-100)"
        },
        promptRelevance: {
          type: "string",
          description: "Assessment of how relevant the response was to the prompt (highly relevant, somewhat relevant, not relevant)"
        }
      },
      required: ["score", "feedback", "percentageTargetLanguage", "promptRelevance"]
    }
  }
];

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { transcription, promptText, language = 'french', levelId = 0 } = body;

    const systemPrompt = getLanguageSpecificPrompt(language, levelId);

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: `Prompt: ${promptText}\nStudent's Response: ${transcription}`
        }
      ],
      functions: functions,
      function_call: { name: "evaluate_language_response" }
    });

    const functionCall = response.choices[0].message.function_call;
    
    if (!functionCall) {
      return new Response(JSON.stringify({ error: "No function call in response" }), {
        status: 500,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }

    const evaluationResult = JSON.parse(functionCall.arguments);
    
    return new Response(JSON.stringify(evaluationResult), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("Error evaluating response:", error);
    return new Response(JSON.stringify({ error: "Failed to evaluate response" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
};