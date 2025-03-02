import mongoose from "mongoose";
import type { CampaignProgress } from "../types/campaign";

const UserProgressSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  campaignProgress: {
    currentLevel: {
      type: Number,
      default: 1,
    },
    completedLevels: [
      {
        type: Number,
      },
    ],
    bestScores: {
      type: Map,
      of: Number,
      default: new Map(),
    },
    levelAttempts: [
      {
        levelId: Number,
        date: Date,
        score: Number,
        flashcardsGenerated: [
          { type: mongoose.Schema.Types.ObjectId, ref: "CampaignFlashcard" },
        ],
      },
    ],
    flashcardRequirements: {
      type: Map,
      of: {
        requiredReviewCount: Number,
        lastFailedAttempt: Date,
      },
      default: new Map(),
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update timestamps on save
UserProgressSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Method to check if user can attempt a level
UserProgressSchema.methods.canAttemptLevel = async function (levelId: number) {
  const flashcardReq = this.campaignProgress.flashcardRequirements.get(levelId);

  // If no flashcard requirements, user can attempt
  if (!flashcardReq) return true;

  // If user failed recently, check if they've reviewed enough flashcards
  if (flashcardReq.lastFailedAttempt) {
    const { CampaignFlashcard } = require("./CampaignFlashcard");
    const reviewedCount = await CampaignFlashcard.countDocuments({
      userId: this.userId,
      levelId,
      reviewCount: { $gte: flashcardReq.requiredReviewCount },
    });

    // User needs to review all flashcards from their last failed attempt
    const totalFlashcards = await CampaignFlashcard.countDocuments({
      userId: this.userId,
      levelId,
      createdAt: { $lte: flashcardReq.lastFailedAttempt },
    });

    return reviewedCount >= totalFlashcards;
  }

  return true;
};

export const UserProgress =
  mongoose.models.UserProgress ||
  mongoose.model("UserProgress", UserProgressSchema);
