import type { APIRoute } from 'astro';
import { connectDB } from '../../lib/db';
import { Flashcard } from '../../models/flashcard';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const auth = locals.auth();
    if (!auth.userId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const body = await request.text();
    const { flashcards, tags = [] } = JSON.parse(body);

    // Connect to MongoDB using our utility
    await connectDB();

    // Save each flashcard, checking for duplicates
    const savedFlashcards = await Promise.all(
      flashcards.map(async (flashcard: any) => {
        // Check if this flashcard already exists for this user
        const existingCard = await Flashcard.findOne({
          userId: auth.userId,
          french: flashcard.french,
          english: flashcard.english,
          type: flashcard.type
        });

        if (existingCard) {
          return {
            ...existingCard.toObject(),
            alreadyExists: true
          };
        }

        // If no duplicate found, save the new flashcard
        const savedCard = await new Flashcard({
          userId: auth.userId,
          french: flashcard.french,
          english: flashcard.english,
          type: flashcard.type,
          originalText: flashcard.originalText,
          tags
        }).save();

        return {
          ...savedCard.toObject(),
          alreadyExists: false
        };
      })
    );

    // Count new and duplicate cards
    const newCards = savedFlashcards.filter(card => !card.alreadyExists);
    const duplicates = savedFlashcards.filter(card => card.alreadyExists);

    return new Response(JSON.stringify({
      savedFlashcards,
      summary: {
        newCards: newCards.length,
        duplicates: duplicates.length
      }
    }), { status: 200 });

  } catch (error) {
    console.error('Error saving flashcards:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to save flashcards',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), { status: 500 });
  }
};

export const GET: APIRoute = async ({ request, locals }) => {
  try {
    const auth = locals.auth();
    if (!auth.userId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const url = new URL(request.url);
    const tag = url.searchParams.get('tag');
    const favorite = url.searchParams.get('favorite');

    // Connect to MongoDB using our utility
    await connectDB();

    let query: any = { userId: auth.userId };
    if (tag) query['tags'] = tag;
    if (favorite === 'true') query['favorite'] = true;

    const flashcards = await Flashcard.find(query).sort({ savedAt: -1 });
    return new Response(JSON.stringify(flashcards), { status: 200 });
  } catch (error) {
    console.error('Error fetching flashcards:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch flashcards' }), { status: 500 });
  }
}; 