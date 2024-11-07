import React, { useState, useEffect, useRef } from 'react';
import { Play, AlertCircle, Loader2, SkipForward } from 'lucide-react';
import type { Prompt, Transcription, SessionSettings } from '../types/prompt';
import { getRandomPrompts } from '../data/prompts';
import { PromptCard } from './PromptCard';
import { Timer } from './Timer';
import { RecordingStatus } from './RecordingStatus';
import { TranscriptionsList } from './TranscriptionsList';
import { SessionSettingsForm } from './SessionSettings';
import { FlashcardsList } from './FlashcardsList';

const DEFAULT_SETTINGS: SessionSettings = {
  promptCount: 4,
  promptDuration: 5,
};

export default function FrenchLearningApp() {
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState<'idle' | 'transcribing' | 'evaluating' | 'generating'>('idle');
  const [audioRecordings, setAudioRecordings] = useState<{ blob: Blob; promptIndex: number }[]>([]);
  const expectedRecordingsRef = useRef<number>(0);

  const generateFlashcards = async (transcription: string) => {
    try {
      const response = await fetch('/api/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: transcription }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate flashcards');
      }

      const data = await response.json();
      return data.flashcards;
    } catch (error) {
      setError('Failed to generate flashcards');
      return [];
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to transcribe audio');
      }

      const data = await response.json();
      return data.text;
    } catch (error) {
      setError('Failed to transcribe audio');
      return '';
    }
  };

  const startRecording = async () => {
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
      setError('Failed to access microphone. Please ensure microphone permissions are granted.');
    }
  };

  const stopRecording = async () => {
    if (mediaRecorderRef.current && isRecording) {
      console.log(`Stopping recording for prompt ${currentPromptIndex + 1}`);
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());

      return new Promise<void>((resolve) => {
        if (mediaRecorderRef.current) {
          mediaRecorderRef.current.onstop = () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            console.log(`Created audio blob for prompt ${currentPromptIndex + 1}:`, {
              size: audioBlob.size,
              type: audioBlob.type
            });
            
            setAudioRecordings(prev => {
              const newRecordings = [...prev, { 
                blob: audioBlob, 
                promptIndex: currentPromptIndex 
              }];
              console.log('Updated audio recordings:', newRecordings);
              
              if (currentPromptIndex === selectedPrompts.length - 1) {
                console.log('Last recording added, total recordings:', newRecordings.length);
                if (newRecordings.length === expectedRecordingsRef.current) {
                  setTimeout(() => {
                    setCurrentPromptIndex(-1);
                    processAllRecordings(newRecordings);
                  }, 100);
                }
              }
              
              return newRecordings;
            });
            
            setIsRecording(false);
            setTimeout(resolve, 50);
          };
        }
      });
    }
    return Promise.resolve();
  };

  const startPromptSession = () => {
    setError(null);
    const prompts = getRandomPrompts(settings.promptCount).map(prompt => ({
      ...prompt,
      duration: settings.promptDuration * 60
    }));
    expectedRecordingsRef.current = prompts.length;
    setSelectedPrompts(prompts);
    setCurrentPromptIndex(0);
    setTimeLeft(prompts[0].duration);
    setAudioRecordings([]);
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
              return 0;
            }
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timerRef.current);
    }
  }, [timeLeft, currentPromptIndex, selectedPrompts]);

  const processAllRecordings = async (recordings: { blob: Blob; promptIndex: number }[]) => {
    setIsProcessing(true);
    const allTranscriptions: { 
      text: string; 
      promptIndex: number;
      evaluation?: {
        score: number;
        feedback: string;
        percentageFrench: number;
      }
    }[] = [];
    
    try {
      console.log('Starting to process recordings...');
      console.log(`Number of recordings to process: ${recordings.length}`);
      
      // First, transcribe and evaluate all recordings
      for (let i = 0; i < recordings.length; i++) {
        const recording = recordings[i];
        console.log(`Processing recording ${i + 1}/${recordings.length} for prompt ${recording.promptIndex + 1}`);
        
        setProcessingStage('transcribing');
        const transcription = await transcribeAudio(recording.blob);
        console.log(`Transcription ${i + 1} result:`, transcription);
        
        setProcessingStage('evaluating');
        const evaluation = await evaluateResponse(
          transcription, 
          selectedPrompts[recording.promptIndex].text
        );
        console.log(`Evaluation ${i + 1} result:`, evaluation);
        
        allTranscriptions.push({
          text: transcription,
          promptIndex: recording.promptIndex,
          evaluation: evaluation
        });
      }

      // Then generate flashcards from just the transcriptions
      setProcessingStage('generating');
      const combinedText = allTranscriptions
        .map(t => t.text)
        .join('\n\n');
      
      const flashcards = await generateFlashcards(combinedText);

      // Create transcription entries with evaluations
      allTranscriptions.forEach(({ text, promptIndex, evaluation }) => {
        setTranscriptions(prev => [...prev, {
          text,
          prompt: selectedPrompts[promptIndex],
          timestamp: new Date().toISOString(),
          flashcards,
          evaluation
        }]);
      });

    } catch (error) {
      console.error('Error during processing:', error);
      setError('Failed to process recordings');
    } finally {
      setIsProcessing(false);
      setProcessingStage('idle');
      setAudioRecordings([]);
    }
  };

  const handleNextPrompt = async () => {
    clearInterval(timerRef.current);
    await stopRecording();
    
    if (currentPromptIndex < selectedPrompts.length - 1) {
      setCurrentPromptIndex(currentPromptIndex + 1);
      setTimeLeft(selectedPrompts[currentPromptIndex + 1].duration);
      startRecording();
    } else {
      setCurrentPromptIndex(-1);
      setTimeLeft(0);
    }
  };

  const evaluateResponse = async (transcription: string, prompt: string) => {
    try {
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: transcription,
          prompt: prompt 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to evaluate response');
      }

      return await response.json();
    } catch (error) {
      setError('Failed to evaluate response');
      throw error;
    }
  };

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

              <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
                <div
                  className="h-full bg-indigo-600 transition-all duration-1000"
                  style={{
                    width: `${(timeLeft / selectedPrompts[currentPromptIndex].duration) * 100}%`,
                  }}
                />
              </div>

              <div className="flex justify-center">
                <button
                  onClick={handleNextPrompt}
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg
                           hover:bg-indigo-700 transition-colors gap-2"
                >
                  <SkipForward size={20} />
                  {currentPromptIndex === selectedPrompts.length - 1 ? 'Finish Session' : 'Next Prompt'}
                </button>
              </div>
            </div>
          )}

          {transcriptions.length > 0 && currentPromptIndex === -1 && (
            <div className="space-y-8">
              <TranscriptionsList transcriptions={transcriptions} />

              {transcriptions[0]?.flashcards && (
                <div className="mt-8 pt-8 border-t">
                  <FlashcardsList flashcards={transcriptions[0].flashcards} />
                </div>
              )}
            </div>
          )}

          {isProcessing && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white p-8 rounded-lg shadow-xl flex flex-col items-center max-w-md w-full mx-4">
                <Loader2 className="animate-spin text-indigo-600 mb-4" size={32} />
                <p className="text-gray-900 font-semibold text-lg mb-2">
                  {processingStage === 'transcribing' && 'Converting Recordings to Text'}
                  {processingStage === 'evaluating' && 'Evaluating Your French Responses'}
                  {processingStage === 'generating' && 'Creating Your Flashcard Set'}
                </p>
                <p className="text-gray-600 text-center">
                  {processingStage === 'transcribing' && 
                    'This usually takes a few moments per recording...'
                  }
                  {processingStage === 'evaluating' && 
                    'Analyzing your language use and providing feedback...'
                  }
                  {processingStage === 'generating' && 
                    'Creating personalized flashcards from your responses...'
                  }
                </p>
                <div className="mt-4 w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                    style={{
                      width: processingStage === 'transcribing' ? '33%' 
                            : processingStage === 'evaluating' ? '66%' 
                            : '90%'
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}