import type { APIRoute } from 'astro';
import { connectDB } from '../../lib/db';
import { UserProgress } from '../../models/UserProgress';

export const GET: APIRoute = async ({ request }) => {
  await connectDB();
  const userId = 'test-user'; // For now, we'll use a default test user

  try {
    const userProgress = await UserProgress.findOne({ userId });
    if (!userProgress) {
      return new Response(JSON.stringify({ error: 'User progress not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Initialize campaign progress if needed
    if (!userProgress.campaignProgress) {
      userProgress.campaignProgress = {
        currentLevel: 1,
        completedLevels: [],
        bestScores: new Map(),
      };
      await userProgress.save();
    }

    // Return only the necessary data
    return new Response(JSON.stringify({
      campaignProgress: {
        currentLevel: userProgress.campaignProgress.currentLevel,
        completedLevels: userProgress.campaignProgress.completedLevels,
        bestScores: Object.fromEntries(userProgress.campaignProgress.bestScores),
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching user progress:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch user progress' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  await connectDB();
  const userId = 'test-user'; // For now, we'll use a default test user

  try {
    const existingProgress = await UserProgress.findOne({ userId });
    if (existingProgress) {
      return new Response(JSON.stringify({ error: 'User progress already exists' }), {
        status: 409,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const newProgress = await UserProgress.create({
      userId,
      campaignProgress: {
        currentLevel: 1,
        completedLevels: [],
        bestScores: new Map(),
      },
    });

    // Return only the necessary data
    return new Response(JSON.stringify({
      userId: newProgress.userId,
      campaignProgress: {
        currentLevel: newProgress.campaignProgress.currentLevel,
        completedLevels: newProgress.campaignProgress.completedLevels,
        bestScores: Object.fromEntries(newProgress.campaignProgress.bestScores),
      }
    }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error creating user progress:', error);
    return new Response(JSON.stringify({ error: 'Failed to create user progress' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};

export const PUT: APIRoute = async ({ request }) => {
  await connectDB();
  const userId = 'test-user'; // For now, we'll use a default test user

  try {
    const body = await request.json();
    const { levelId, score } = body;

    if (typeof levelId !== 'number' || typeof score !== 'number') {
      return new Response(JSON.stringify({ error: 'Invalid levelId or score' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const userProgress = await UserProgress.findOne({ userId });

    if (!userProgress) {
      return new Response(JSON.stringify({ error: 'User progress not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Initialize bestScores if it doesn't exist
    if (!userProgress.campaignProgress.bestScores) {
      userProgress.campaignProgress.bestScores = new Map();
    }

    // Update best score if the new score is higher
    const levelIdStr = levelId.toString();
    const currentBestScore = userProgress.campaignProgress.bestScores.get(levelIdStr) || 0;
    if (score > currentBestScore) {
      userProgress.campaignProgress.bestScores.set(levelIdStr, score);
    }

    // Initialize completedLevels if it doesn't exist
    if (!userProgress.campaignProgress.completedLevels) {
      userProgress.campaignProgress.completedLevels = [];
    }

    // Update completed levels if not already completed and score meets requirement
    const PASSING_SCORE = 70;
    if (score >= PASSING_SCORE && !userProgress.campaignProgress.completedLevels.includes(levelId)) {
      userProgress.campaignProgress.completedLevels.push(levelId);
      
      // Update current level if this was the current level
      if (levelId === userProgress.campaignProgress.currentLevel) {
        userProgress.campaignProgress.currentLevel = levelId + 1;
      }
    }

    await userProgress.save();

    // Return only the necessary data
    return new Response(JSON.stringify({
      campaignProgress: {
        currentLevel: userProgress.campaignProgress.currentLevel,
        completedLevels: userProgress.campaignProgress.completedLevels,
        bestScores: Object.fromEntries(userProgress.campaignProgress.bestScores),
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error updating user progress:', error);
    return new Response(JSON.stringify({ error: 'Failed to update user progress' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};
