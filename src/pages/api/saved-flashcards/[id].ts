import type { APIRoute } from 'astro';
import { connectDB } from '../../../lib/db';
import { Flashcard } from '../../../models/flashcard';

export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    const auth = locals.auth();
    if (!auth.userId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    await connectDB();

    // Find the flashcard and ensure it belongs to the user
    const flashcard = await Flashcard.findOne({ 
      _id: params.id,
      userId: auth.userId 
    });

    if (!flashcard) {
      return new Response(JSON.stringify({ error: 'Flashcard not found' }), { status: 404 });
    }

    // Delete the flashcard
    await Flashcard.deleteOne({ _id: params.id });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Error deleting flashcard:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete flashcard' }), { status: 500 });
  }
}; 