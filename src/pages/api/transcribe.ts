import type { APIRoute } from 'astro';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.OPENAI_API_KEY
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('file') as File;

    if (!audioFile) {
      return new Response(JSON.stringify({ error: 'No audio file provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const response = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      prompt: `This is a French language learning exercise where the speaker may switch between English and French. 
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
      
      Example: "Je ne sais pas how to say this en français"
      NOT: "Je ne sais pas comment dire cela en français"`,
      // language: 'fr' // This helps with French phoneme recognition while still allowing English
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