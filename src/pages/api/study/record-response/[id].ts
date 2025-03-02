import type { APIRoute } from "astro";
import { connectDB } from "../../../../lib/db";
import { Flashcard } from "../../../../models/flashcard";
import { calculateNextReview } from "../../../../lib/spaced-repetition";

export const POST: APIRoute = async ({ request, locals, params }) => {
  try {
    const auth = locals.auth();
    if (!auth.userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const cardId = params.id;
    if (!cardId) {
      return new Response(JSON.stringify({ error: "Card ID is required" }), {
        status: 400,
      });
    }

    const body = await request.text();
    const { response } = JSON.parse(body);

    await connectDB();

    // Find the card and its associated prompt
    const card = await Flashcard.findOne({
      _id: cardId,
      userId: auth.userId,
    });

    if (!card) {
      return new Response(JSON.stringify({ error: "Card not found" }), {
        status: 404,
      });
    }

    // Calculate next review using spaced repetition algorithm
    const { nextReviewDate, interval, easeFactor } = calculateNextReview(
      card,
      response,
    );

    // Update the card with new review data
    await Flashcard.updateOne(
      { _id: cardId },
      {
        $set: {
          lastReviewed: new Date(),
          nextReviewDate,
          interval,
          easeFactor,
          confidence: response,
          reviewCount: (card.reviewCount || 0) + 1,
        },
      },
    );

    return new Response(
      JSON.stringify({
        success: true,
        nextReview: nextReviewDate,
      }),
      { status: 200 },
    );
  } catch (error) {
    console.error("Error recording response:", error);
    return new Response(
      JSON.stringify({ error: "Failed to record response" }),
      { status: 500 },
    );
  }
};
