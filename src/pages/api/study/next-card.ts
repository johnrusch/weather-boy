import type { APIRoute } from "astro";
import { connectDB } from "../../../lib/db";
import { Flashcard } from "../../../models/flashcard";

export const GET: APIRoute = async ({ request, locals }) => {
  try {
    const auth = locals.auth();
    if (!auth.userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    await connectDB();

    // Get current date
    const now = new Date();

    // Find cards that are due for review in this order:
    // 1. Cards that have never been reviewed
    // 2. Cards that are overdue
    // 3. Cards that are due today
    const dueCards = await Flashcard.aggregate([
      {
        $match: {
          userId: auth.userId,
          $or: [
            { nextReviewDate: { $exists: false } }, // Never reviewed
            { nextReviewDate: { $lte: now } }, // Due or overdue
          ],
        },
      },
      {
        $addFields: {
          priority: {
            $switch: {
              branches: [
                // Never reviewed cards get highest priority
                { case: { $eq: ["$reviewCount", 0] }, then: 3 },
                // Overdue cards get second priority
                {
                  case: {
                    $lt: [
                      "$nextReviewDate",
                      new Date(now.getTime() - 24 * 60 * 60 * 1000),
                    ],
                  },
                  then: 2,
                },
                // Due today cards get third priority
                { case: { $lte: ["$nextReviewDate", now] }, then: 1 },
              ],
              default: 0,
            },
          },
        },
      },
      { $sort: { priority: -1, nextReviewDate: 1 } },
      { $limit: 1 },
    ]);

    if (dueCards.length === 0) {
      return new Response(
        JSON.stringify({
          card: null,
          remainingCount: 0,
        }),
        { status: 200 },
      );
    }

    // Get count of remaining due cards
    const remainingCount = await Flashcard.countDocuments({
      userId: auth.userId,
      $or: [
        { nextReviewDate: { $exists: false } },
        { nextReviewDate: { $lte: now } },
      ],
    });

    return new Response(
      JSON.stringify({
        card: dueCards[0],
        remainingCount: remainingCount - 1,
      }),
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching next card:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch next card" }),
      { status: 500 },
    );
  }
};
