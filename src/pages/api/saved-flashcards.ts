import type { APIRoute } from 'astro';
import { getAuth } from '@clerk/backend';
import { SavedFlashcard } from '../../db/schema';
import mongoose from 'mongoose';

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || '');

export const POST: APIRoute = async ({ request }) => {
  try {
    const { userId } = await getAuth(request);
    if (!userId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { flashcard, tags = [] } = await request.json();

    const savedFlashcard = new SavedFlashcard({
      userId,
      flashcard,
      tags
    });

    await savedFlashcard.save();

    return new Response(JSON.stringify(savedFlashcard), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to save flashcard' }), { status: 500 });
  }
};

export const GET: APIRoute = async ({ request }) => {
  try {
    const { userId } = await getAuth(request);
    if (!userId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const url = new URL(request.url);
    const tag = url.searchParams.get('tag');
    const favorite = url.searchParams.get('favorite');

    let query: any = { userId };
    if (tag) query['tags'] = tag;
    if (favorite === 'true') query['favorite'] = true;

    const flashcards = await SavedFlashcard.find(query).sort({ savedAt: -1 });
    return new Response(JSON.stringify(flashcards), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch flashcards' }), { status: 500 });
  }
}; 