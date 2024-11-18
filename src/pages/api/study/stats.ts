import type { APIRoute } from 'astro';
import { connectDB } from '../../../lib/db';
import { Flashcard } from '../../../models/flashcard';

export const GET: APIRoute = async ({ request, locals }) => {
  try {
    const auth = locals.auth();
    if (!auth.userId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    await connectDB();

    // Get today's date at midnight for accurate daily count
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get cards reviewed today
    const todayCount = await Flashcard.countDocuments({
      userId: auth.userId,
      lastReviewed: { $gte: today }
    });

    // Get total reviews
    const totalReviewed = await Flashcard.aggregate([
      { $match: { userId: auth.userId } },
      { $group: { _id: null, total: { $sum: '$reviewCount' } } }
    ]);

    // Get mastered cards (cards with interval > 30 days)
    const masteredCount = await Flashcard.countDocuments({
      userId: auth.userId,
      interval: { $gt: 30 }
    });

    // Calculate streak
    const streakData = await Flashcard.aggregate([
      { 
        $match: { 
          userId: auth.userId,
          lastReviewed: { $exists: true }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$lastReviewed'
            }
          }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    // Calculate streak days
    let streakDays = 0;
    const now = new Date();
    let currentDate = new Date(now.setHours(0, 0, 0, 0));
    
    for (const day of streakData) {
      const reviewDate = new Date(day._id);
      const diffDays = Math.floor((currentDate.getTime() - reviewDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 1) {
        streakDays++;
        currentDate = reviewDate;
      } else {
        break;
      }
    }

    return new Response(JSON.stringify({
      todayCount,
      streakDays,
      totalReviewed: totalReviewed[0]?.total || 0,
      masteredCount
    }), { status: 200 });

  } catch (error) {
    console.error('Error fetching study stats:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch study stats' }), { status: 500 });
  }
}; 