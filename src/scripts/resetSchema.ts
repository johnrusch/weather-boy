import mongoose from "mongoose";
import * as dotenv from "dotenv";

dotenv.config();

async function resetSchema() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error("MONGODB_URI not found in environment variables");
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(uri);
    console.log("Connected successfully");

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error("Failed to get database connection");
    }

    console.log("Dropping flashcard collection...");
    try {
      await db.dropCollection("flashcard");
      console.log("Collection dropped successfully");
    } catch (err: any) {
      if (err.code === 26) {
        console.log("Collection does not exist, nothing to drop");
      } else {
        throw err;
      }
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

resetSchema().catch(console.error);
