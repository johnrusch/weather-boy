import mongoose from 'mongoose';

interface ValidatorProps {
  value: any;
  path: string;
}

// Define the schema without promptId
const FlashcardSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: [true, 'User ID is required'],
    validate: {
      validator: function(v: string) {
        console.log('Validating userId:', v);
        return v.length > 0;
      },
      message: (props: ValidatorProps) => `${props.value} is not a valid userId`
    }
  },
  french: { 
    type: String, 
    required: [true, 'French text is required'],
    validate: {
      validator: function(v: string) {
        console.log('Validating french:', v);
        return v.length > 0;
      },
      message: (props: ValidatorProps) => `${props.value} is not a valid french text`
    }
  },
  english: { 
    type: String, 
    required: [true, 'English text is required'],
    validate: {
      validator: function(v: string) {
        console.log('Validating english:', v);
        return v.length > 0;
      },
      message: (props: ValidatorProps) => `${props.value} is not a valid english text`
    }
  },
  type: { 
    type: String, 
    enum: {
      values: ['correction', 'translation', 'variation'],
      message: '{VALUE} is not a supported type'
    },
    required: [true, 'Type is required'],
    validate: {
      validator: function(v: string) {
        console.log('Validating type:', v);
        return ['correction', 'translation', 'variation'].includes(v);
      },
      message: (props: ValidatorProps) => `${props.value} is not a valid type`
    }
  },
  originalText: String,
  savedAt: { type: Date, default: Date.now },
  tags: [String],
  favorite: { type: Boolean, default: false },
  lastReviewed: { type: Date },
  nextReviewDate: { type: Date },
  reviewCount: { type: Number, default: 0 },
  easeFactor: { type: Number, default: 2.5 },
  interval: { type: Number, default: 1 },
  confidence: { 
    type: String, 
    enum: ['again', 'hard', 'good', 'easy'],
    default: 'good'
  }
});

// Add middleware to log document creation
FlashcardSchema.pre('save', function(next) {
  console.log('Pre-save middleware:', {
    userId: this.userId,
    french: this.french,
    english: this.english,
    type: this.type
  });
  next();
});

// Create and export the model
export const Flashcard = mongoose.models.flashcard || mongoose.model('flashcard', FlashcardSchema);