import React, { useState, useEffect, useRef } from 'react';
import { Play, AlertCircle } from 'lucide-react';
import { Prompt, Transcription, SessionSettings, Flashcard } from './types/prompt';
import { getRandomPrompts } from './data/prompts';
import { PromptCard } from './components/PromptCard';
import { Timer } from './components/Timer';
import { RecordingStatus } from './components/RecordingStatus';
import { TranscriptionsList } from './components/TranscriptionsList';
import { SessionSettingsForm } from './components/SessionSettings';
import OpenAI from 'openai';
import FrenchLearningApp from './FrenchLearningApp';

const API_KEY = import.meta.env.OPENAI_API_KEY;

const openai = new OpenAI({
  apiKey: API_KEY,
  dangerouslyAllowBrowser: true
});

const DEFAULT_SETTINGS: SessionSettings = {
  promptCount: 4,
  promptDuration: 5,
};

export default function App() {
  return <FrenchLearningApp />;
}