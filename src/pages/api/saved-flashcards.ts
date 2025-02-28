import type { APIRoute } from 'astro';
import { connectDB, isOffline } from '../../lib/db';
import { Flashcard } from '../../models/flashcard';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const auth = locals.auth();
    if (!auth.userId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const connected = await connectDB();
    if (!connected || isOffline()) {
      console.log('Returning error in offline mode');
      return new Response(JSON.stringify({
        error: 'Running in offline mode - flashcards not saved',
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    const body = await request.text();
    const { flashcards, tags = [], promptId = null } = JSON.parse(body);

    console.log('Received request body:', { flashcards, tags, promptId });
    console.log('User ID:', auth.userId);

    const savedFlashcards = await Promise.all(
      flashcards.map(async (flashcard: any) => {
        console.log('Processing flashcard:', flashcard);

        const existingCard = await Flashcard.findOne({
          userId: auth.userId,
          french: flashcard.french,
          english: flashcard.english,
          type: flashcard.type
        });

        if (existingCard) {
          console.log('Found existing card:', existingCard);
          return {
            ...existingCard.toObject(),
            alreadyExists: true
          };
        }

        const newCard = new Flashcard({
          userId: auth.userId,
          french: flashcard.french,
          english: flashcard.english,
          type: flashcard.type,
          originalText: flashcard.originalText,
          promptId: promptId,
          tags
        });

        console.log('Created new card document:', newCard);
        const savedCard = await newCard.save();
        console.log('Successfully saved card:', savedCard);

        return {
          ...savedCard.toObject(),
          alreadyExists: false
        };
      })
    );

    const newCards = savedFlashcards.filter(card => !card.alreadyExists);
    const duplicates = savedFlashcards.filter(card => card.alreadyExists);

    console.log('Operation summary:', {
      totalCards: savedFlashcards.length,
      newCards: newCards.length,
      duplicates: duplicates.length
    });

    return new Response(JSON.stringify({
      savedFlashcards,
      summary: {
        newCards: newCards.length,
        duplicates: duplicates.length
      }
    }), { status: 200 });

  } catch (error) {
    console.error('Error saving flashcards:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
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

    const connected = await connectDB();
    if (!connected || isOffline()) {
      console.log('Returning empty flashcards in offline mode');
      return new Response(JSON.stringify({
        message: 'Running in offline mode',
        flashcards: []
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    const url = new URL(request.url);
    const tag = url.searchParams.get('tag');
    const favorite = url.searchParams.get('favorite');

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