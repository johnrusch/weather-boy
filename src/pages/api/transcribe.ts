import type { APIRoute } from 'astro';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.OPENAI_API_KEY
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('file') as File;
    const language = formData.get('language') as string || 'french';

    if (!audioFile) {
      return new Response(JSON.stringify({ error: 'No audio file provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create language-specific prompt
    const languageName = language === 'spanish' ? 'Spanish' : 'French';
    
    const response = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      prompt: `This is a ${languageName} language learning exercise where the speaker may switch between English and ${languageName}. 
      Please transcribe exactly what you hear, preserving:
      1. All code-switching between languages
      2. Any grammatical mistakes or non-standard usage
      3. The original language choice for each phrase
      4. Hesitations and filler words in either language
      
      Do not:
      1. Correct mistakes
      2. Translate anything
      3. Standardize the language usage
      4. Remove code-switching
      
      Example: "Je ne sais pas how to say this en français" (for French)
      OR: "No sé how to say this en español" (for Spanish)`,
    });

    return new Response(JSON.stringify({ text: response.text }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to transcribe audio' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}