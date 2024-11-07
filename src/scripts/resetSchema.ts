import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

async function resetSchema() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI not found in environment variables');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri);
    console.log('Connected successfully');

    console.log('Dropping SavedFlashcard collection...');
    await mongoose.connection.db.dropCollection('savedflashcards');
    console.log('Collection dropped successfully');

  } catch (error) {
    if ((error as any).code === 26) {
      console.log('Collection does not exist, nothing to drop');
    } else {
      console.error('Error:', error);
    }
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

resetSchema().catch(console.error); 