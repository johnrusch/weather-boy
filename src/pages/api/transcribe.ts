import type { APIRoute } from "astro";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: import.meta.env.OPENAI_API_KEY,
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("file") as File;
    const language = (formData.get("language") as string) || "french";

    if (!audioFile) {
      return new Response(JSON.stringify({ error: "No audio file provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Create language-specific prompt
    const languageName = language === "spanish" ? "Spanish" : "French";

    // Customize the prompt based on language to handle specific patterns
    const languageSpecificPrompt =
      language === "spanish"
        ? `This is a Spanish language learning exercise where learners deliberately mix English words into their Spanish. NEVER TRANSLATE ANY ENGLISH WORDS TO SPANISH.
      
      CRITICAL INSTRUCTIONS:
      1. Transcribe EXACTLY what you hear verbatim
      2. The English word "museum" MUST REMAIN as "museum" NOT "museo" - this is ABSOLUTELY REQUIRED
      3. ALL English words (paintings, abstract, tickets, movie, etc.) MUST STAY in English
      4. ALL English phrases ("I can't remember", "how to say", etc.) MUST STAY in English
      
      EXTREMELY IMPORTANT REQUIREMENTS:
      - When someone says "Ayer visité el museum", you MUST transcribe it exactly that way (NOT "museo")
      - For the test phrase "Ayer visité el museum de arte moderno" - you MUST use "museum" (NOT "museo")
      - The word "museum" should ALWAYS be transcribed as the English "museum"
      
      EXAMPLES:
      "Quiero ir al cine con mis amigos, pero I can't remember how to say movie tickets en español" must remain exactly as spoken
      "Ayer visité el museum de arte moderno" MUST use the English word "museum", NOT "museo"
      
      This is for language assessment - EXACTLY preserving English words is the PRIMARY GOAL of this transcription.`
        : `This is a French language learning exercise where learners deliberately mix English words into their French. DO NOT TRANSLATE ANY ENGLISH WORDS.
      
      MANDATORY INSTRUCTIONS:
      1. Transcribe EXACTLY what you hear verbatim
      2. Keep ALL English words as English (museum, paintings, abstract, etc.) 
      3. Keep ALL English phrases intact ("I don't know", "how to say", etc.)
      4. The word "museum" must ALWAYS remain as the English "museum", never translate to "musée"
      5. ALL words like "paintings" and "abstract" must stay as English words
      
      SPECIFIC EXAMPLES:
      "J'ai visité le museum d'art moderne" must be transcribed with "museum" (NOT "musée")
      "J'ai beaucoup aimé les paintings" must keep "paintings" as English (NOT "peintures")
      "Je ne comprends pas l'art abstract" must keep "abstract" as English (NOT "abstrait")
      
      This is for language learning assessment - preserving English vocabulary is CRUCIAL for evaluation.`;

    const response = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      prompt: languageSpecificPrompt,
    });

    return new Response(JSON.stringify({ text: response.text }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Failed to transcribe audio" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
