import mongoose from "mongoose";

const CampaignFlashcardSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  levelId: {
    type: Number,
    required: true,
    index: true,
  },
  promptId: {
    type: String,
    required: true,
  },
  front: {
    type: String,
    required: true,
  },
  back: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["correction", "translation", "variation"],
    required: true,
  },
  context: {
    type: String,
    required: true,
  },
  mastered: {
    type: Boolean,
    default: false,
  },
  lastReviewed: {
    type: Date,
  },
  reviewCount: {
    type: Number,
    default: 0,
  },
  nextReviewDate: {
    type: Date,
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

// Add index for efficient querying of user's level-specific flashcards
CampaignFlashcardSchema.index({ userId: 1, levelId: 1 });

// Update timestamps on save
CampaignFlashcardSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Calculate next review date using spaced repetition
CampaignFlashcardSchema.methods.calculateNextReview = function () {
  // Simple spaced repetition algorithm:
  // Review intervals: 1 day, 3 days, 7 days, 14 days, 30 days
  const intervals = [1, 3, 7, 14, 30];
  const reviewCount = Math.min(this.reviewCount, intervals.length - 1);
  const daysToAdd = intervals[reviewCount];

  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + daysToAdd);
  this.nextReviewDate = nextDate;
};

export const CampaignFlashcard =
  mongoose.models.CampaignFlashcard ||
  mongoose.model("CampaignFlashcard", CampaignFlashcardSchema);
