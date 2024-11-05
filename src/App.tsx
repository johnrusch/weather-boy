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

const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

const openai = new OpenAI({
  apiKey: API_KEY,
  dangerouslyAllowBrowser: true
});

const DEFAULT_SETTINGS: SessionSettings = {
  promptCount: 4,
  promptDuration: 5,
};

export default function App() {
  const [settings, setSettings] = useState<SessionSettings>(DEFAULT_SETTINGS);
  const [selectedPrompts, setSelectedPrompts] = useState<Prompt[]>([]);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(-1);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number>();

  const generateFlashcards = async (transcription: string): Promise<Flashcard[]> => {
    if (!API_KEY) {
      setError('OpenAI API key is not configured. Please check your environment variables.');
      return [];
    }

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a French language teacher. Create flashcards from the given text. If the text is in English, translate it to French. If it's in French, provide the English translation. Focus on common conversational phrases and vocabulary. Each flashcard should be a maximum of 6-7 words. Extract as many useful phrases as possible from the text, but keep them natural and conversational."
          },
          {
            role: "user",
            content: `Generate French language flashcards from this text: ${transcription}`
          }
        ],
        functions: [
          {
            name: "create_flashcards",
            description: "Create French-English flashcard pairs",
            parameters: {
              type: "object",
              properties: {
                flashcards: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      french: {
                        type: "string",
                        description: "The French phrase or word"
                      },
                      english: {
                        type: "string",
                        description: "The English translation"
                      }
                    },
                    required: ["french", "english"]
                  }
                }
              },
              required: ["flashcards"]
            }
          }
        ],
        function_call: { name: "create_flashcards" }
      });

      const functionCall = response.choices[0].message.function_call;
      if (functionCall && functionCall.arguments) {
        const { flashcards } = JSON.parse(functionCall.arguments);
        return flashcards;
      }
      return [];
    } catch (error) {
      console.error('Error generating flashcards:', error);
      setError('Failed to generate flashcards. Please check your API key configuration.');
      return [];
    }
  };

  const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
    if (!API_KEY) {
      setError('OpenAI API key is not configured. Please check your environment variables.');
      return '';
    }

    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');
      formData.append('model', 'whisper-1');

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.text;
    } catch (error) {
      console.error('Error transcribing audio:', error);
      setError('Failed to transcribe audio. Please check your API key configuration.');
      return '';
    }
  };

  const startRecording = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError('Failed to access microphone. Please ensure microphone permissions are granted.');
    }
  };

  const stopRecording = async () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());

      await new Promise<void>((resolve) => {
        if (mediaRecorderRef.current) {
          mediaRecorderRef.current.onstop = async () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            const transcription = await transcribeAudio(audioBlob);
            const flashcards = await generateFlashcards(transcription);

            setTranscriptions(prev => [...prev, {
              text: transcription,
              prompt: selectedPrompts[currentPromptIndex],
              timestamp: new Date().toISOString(),
              flashcards: flashcards
            }]);

            resolve();
          };
        }
      });

      setIsRecording(false);
    }
  };

  const startPromptSession = () => {
    setError(null);
    if (!API_KEY) {
      setError('OpenAI API key is not configured. Please check your environment variables.');
      return;
    }
    
    const prompts = getRandomPrompts(settings.promptCount).map(prompt => ({
      ...prompt,
      duration: settings.promptDuration * 60
    }));
    setSelectedPrompts(prompts);
    setCurrentPromptIndex(0);
    setTimeLeft(prompts[0].duration);
    startRecording();
  };

  useEffect(() => {
    if (timeLeft > 0 && currentPromptIndex >= 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            if (currentPromptIndex < selectedPrompts.length - 1) {
              stopRecording();
              setCurrentPromptIndex(currentPromptIndex + 1);
              startRecording();
              return selectedPrompts[currentPromptIndex + 1].duration;
            } else {
              stopRecording();
              setCurrentPromptIndex(-1);
              return 0;
            }
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timerRef.current);
    }
  }, [timeLeft, currentPromptIndex, selectedPrompts]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            French Language Practice Session
          </h1>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {currentPromptIndex === -1 ? (
            <div className="text-center">
              {transcriptions.length === 0 && (
                <SessionSettingsForm
                  settings={settings}
                  onSettingsChange={setSettings}
                />
              )}
              <p className="text-gray-600 mb-8">
                Ready to practice French? You'll receive {settings.promptCount} random prompts,
                with {settings.promptDuration} minutes for each response. Your responses will be automatically
                transcribed and turned into flashcards.
              </p>
              <button
                onClick={startPromptSession}
                className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg
                         hover:bg-indigo-700 transition-colors gap-2"
              >
                <Play size={20} />
                Start Session
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <PromptCard
                prompt={selectedPrompts[currentPromptIndex]}
                currentIndex={currentPromptIndex}
                totalPrompts={selectedPrompts.length}
              />

              <div className="flex items-center justify-center gap-8">
                <Timer timeLeft={timeLeft} />
                <RecordingStatus isRecording={isRecording} />
              </div>

              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 transition-all duration-1000"
                  style={{
                    width: `${(timeLeft / selectedPrompts[currentPromptIndex].duration) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}

          {transcriptions.length > 0 && currentPromptIndex === -1 && (
            <TranscriptionsList transcriptions={transcriptions} />
          )}
        </div>
      </div>
    </div>
  );
}