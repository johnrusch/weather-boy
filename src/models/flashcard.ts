import mongoose from "mongoose";

interface ValidatorProps {
  value: any;
  path: string;
}

// Define the schema without promptId
const FlashcardSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: [true, "User ID is required"],
      validate: {
        validator: function (v: string) {
          console.log("Validating userId:", v);
          return v.length > 0;
        },
        message: (props: ValidatorProps) =>
          `${props.value} is not a valid userId`,
      },
    },
    targetLanguage: {
      type: String,
      required: [true, "Target language text is required"],
      validate: {
        validator: function (v: string) {
          console.log("Validating targetLanguage:", v);
          return v.length > 0;
        },
        message: (props: ValidatorProps) =>
          `${props.value} is not a valid text`,
      },
    },
    english: {
      type: String,
      required: [true, "English translation is required"],
      validate: {
        validator: function (v: string) {
          console.log("Validating english:", v);
          return v.length > 0;
        },
        message: (props: ValidatorProps) =>
          `${props.value} is not a valid english translation`,
      },
    },
    type: {
      type: String,
      enum: {
        values: ["correction", "variation", "translation", "other"],
        message: "{VALUE} is not a valid flashcard type",
      },
      required: [true, "Flashcard type is required"],
      validate: {
        validator: function (v: string) {
          console.log("Validating type:", v);
          return ["correction", "variation", "translation", "other"].includes(
            v,
          );
        },
        message: (props: ValidatorProps) =>
          `${props.value} is not a valid flashcard type`,
      },
    },
    language: {
      type: String,
      enum: ["french", "spanish"],
      default: "french",
      required: [true, "Language is required"],
    },
    originalText: String,
    savedAt: { type: Date, default: Date.now },
    tags: [String],
    favorite: { type: Boolean, default: false },
    mastered: { type: Boolean, default: false },
    promptId: String,
    // For backward compatibility, alias french to targetLanguage
    french: {
      type: String,
      get: function () {
        return this.targetLanguage;
      },
      set: function (value: string) {
        this.targetLanguage = value;
        return value;
      },
    },
  },
  {
    toJSON: { getters: true, virtuals: true },
    toObject: { getters: true, virtuals: true },
  },
);

// Create indexes
FlashcardSchema.index({ userId: 1 });
FlashcardSchema.index({ tags: 1 });
FlashcardSchema.index({ favorite: 1 });
FlashcardSchema.index({ mastered: 1 });

// Add middleware to log document creation
FlashcardSchema.pre("save", function (next) {
  console.log("Pre-save middleware:", {
    userId: this.userId,
    targetLanguage: this.targetLanguage,
    english: this.english,
    type: this.type,
  });
  next();
});

// Create and export the model
export const Flashcard =
  mongoose.models.flashcard || mongoose.model("flashcard", FlashcardSchema);
