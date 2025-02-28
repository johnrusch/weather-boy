import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB, isOffline } from '../../lib/db';
import { CampaignFlashcard } from '../../models/CampaignFlashcard';
import { UserProgress } from '../../models/UserProgress';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!req.session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { method } = req;
  const connected = await connectDB();

  if (!connected || isOffline()) {
    console.log('Running in offline mode');
  }

  switch (method) {
    case 'GET':
      try {
        const { levelId } = req.query;
        if (!levelId) {
          return res.status(400).json({ error: 'Level ID is required' });
        }

        const flashcards = await CampaignFlashcard.find({
          userId: req.session.user.id,
          levelId: Number(levelId),
        }).sort({ nextReviewDate: 1 });

        return res.status(200).json(flashcards);
      } catch (error) {
        console.error('Error fetching flashcards:', error);
        return res.status(500).json({ error: 'Failed to fetch flashcards' });
      }

    case 'POST':
      try {
        const { levelId, flashcards } = req.body;
        
        if (!levelId || !flashcards || !Array.isArray(flashcards)) {
          return res.status(400).json({ error: 'Invalid request body' });
        }

        if (!connected || isOffline()) {
          console.log('Returning flashcards in offline mode (not saved to DB)');
          return res.status(200).json({ 
            message: 'Running in offline mode - flashcards generated but not saved',
            flashcards 
          });
        }

        const createdFlashcards = await CampaignFlashcard.create(
          flashcards.map(card => ({
            ...card,
            userId: req.session.user.id,
            levelId,
          }))
        );

        // Update user progress to track generated flashcards
        await UserProgress.findOneAndUpdate(
          { userId: req.session.user.id },
          {
            $push: {
              'campaignProgress.levelAttempts': {
                levelId,
                date: new Date(),
                flashcardsGenerated: createdFlashcards.map(card => card._id),
              }
            }
          }
        );

        return res.status(201).json(createdFlashcards);
      } catch (error) {
        console.error('Error creating flashcards:', error);
        return res.status(500).json({ error: 'Failed to create flashcards' });
      }

    case 'PUT':
      try {
        const { flashcardId } = req.query;
        const { mastered, reviewed } = req.body;

        if (!flashcardId) {
          return res.status(400).json({ error: 'Flashcard ID is required' });
        }

        const flashcard = await CampaignFlashcard.findOne({
          _id: flashcardId,
          userId: req.session.user.id,
        });

        if (!flashcard) {
          return res.status(404).json({ error: 'Flashcard not found' });
        }

        if (reviewed) {
          flashcard.reviewCount += 1;
          flashcard.lastReviewed = new Date();
          flashcard.calculateNextReview();
        }

        if (mastered !== undefined) {
          flashcard.mastered = mastered;
        }

        if (!connected || isOffline()) {
          console.log('Not saving flashcard update in offline mode');
          return res.status(200).json({ 
            message: 'Running in offline mode - flashcard updated but not saved',
            flashcard 
          });
        }

        await flashcard.save();

        // Check if user can now attempt the level
        const userProgress = await UserProgress.findOne({ userId: req.session.user.id });
        const canAttempt = await userProgress.canAttemptLevel(flashcard.levelId);

        return res.status(200).json({ flashcard, canAttemptLevel: canAttempt });
      } catch (error) {
        console.error('Error updating flashcard:', error);
        return res.status(500).json({ error: 'Failed to update flashcard' });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT']);
      return res.status(405).json({ error: `Method ${method} Not Allowed` });
  }
}
