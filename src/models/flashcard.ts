import mongoose from 'mongoose';

// Define the schema
const FlashcardSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  french: { type: String, required: true },
  english: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['correction', 'translation', 'variation'],
    required: true 
  },
  originalText: String,
  savedAt: { type: Date, default: Date.now },
  tags: [String],
  favorite: { type: Boolean, default: false }
});

// Create and export the model with the collection name 'flashcard'
export const Flashcard = mongoose.models.flashcard || mongoose.model('flashcard', FlashcardSchema); 