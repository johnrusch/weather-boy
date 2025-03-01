import React, { useState, useEffect, useRef } from "react";
import { Play, AlertCircle, Loader2, SkipForward, Trophy } from "lucide-react";
import type { Prompt, Transcription, SessionSettings } from "../types/prompt";
import type { CampaignState } from "../types/campaign";
import { getRandomPromptsByLanguage } from "../data/prompts";
import { getInitialCampaignState, initialCampaignLevels, getCampaignLevelForLanguage } from "../data/campaignLevels";
import { PromptCard } from "./PromptCard";
import { Timer } from "./Timer";
import { RecordingStatus } from "./RecordingStatus";
import { TranscriptionsList } from "./TranscriptionsList";
import { SessionSettingsForm } from "./SessionSettings";
import { FlashcardsList } from "./FlashcardsList";
import { CampaignFlashcardReview } from "./CampaignFlashcardReview";
import { useLanguage } from "../contexts/LanguageContext";

const DEFAULT_SETTINGS: SessionSettings = {
  promptCount: 4,
  promptDuration: 5,
  // Don't store language in settings anymore - always use from context
};

export default function LanguageLearningApp() {
  // Get language from context
  const { language: contextLanguage, setLanguage: setContextLanguage } = useLanguage();
  
  console.log("LanguageLearningApp: Current language from context:", contextLanguage);
  console.log("LanguageLearningApp: localStorage value:", typeof window !== 'undefined' ? localStorage.getItem('preferredLanguage') : null);
  
  // Initialize settings with the defaults (no language included)
  const [settings, setSettings] = useState<SessionSettings>(DEFAULT_SETTINGS);

  const [selectedPrompts, setSelectedPrompts] = useState<Prompt[]>([]);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(-1);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"campaign" | "free" | "selection">("selection");
  const [campaignState, setCampaignState] = useState<CampaignState>(getInitialCampaignState());
  const [isLoading, setIsLoading] = useState(false);
  const [showFlashcardReview, setShowFlashcardReview] = useState(false);
  const [selectedLevelId, setSelectedLevelId] = useState<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number>();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState<
    "idle" | "transcribing" | "evaluating" | "generating"
  >("idle");
  const [audioRecordings, setAudioRecordings] = useState<
    { blob: Blob; promptIndex: number }[]
  >([]);
  const expectedRecordingsRef = useRef<number>(0);

  const generateFlashcards = async (transcription: string, language: string) => {
    try {
      const response = await fetch("/api/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: transcription, language }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate flashcards");
      }

      const data = await response.json();
      console.log("Flashcard API response:", data);
      return data;
    } catch (error) {
      console.error("Failed to generate flashcards:", error);
      setError("Failed to generate flashcards");
      throw error;
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append("file", audioBlob, "audio.webm");
      formData.append("language", contextLanguage);

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to transcribe audio");
      }

      const data = await response.json();
      return data.text;
    } catch (error) {
      setError("Failed to transcribe audio");
      return "";
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
      setError(
        "Failed to access microphone. Please ensure microphone permissions are granted."
      );
    }
  };

  const stopRecording = async () => {
    if (mediaRecorderRef.current && isRecording) {
      console.log(`Stopping recording for prompt ${currentPromptIndex + 1}`);
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());

      return new Promise<void>((resolve) => {
        if (mediaRecorderRef.current) {
          mediaRecorderRef.current.onstop = () => {
            const audioBlob = new Blob(audioChunksRef.current, {
              type: "audio/webm",
            });
            console.log(
              `Created audio blob for prompt ${currentPromptIndex + 1}:`,
              {
                size: audioBlob.size,
                type: audioBlob.type,
              }
            );

            setAudioRecordings((prev) => {
              const newRecordings = [
                ...prev,
                {
                  blob: audioBlob,
                  promptIndex: currentPromptIndex,
                },
              ];
              console.log("Updated audio recordings:", newRecordings);
              console.log("Expected recordings:", expectedRecordingsRef.current);

              return newRecordings;
            });

            setIsRecording(false);
            resolve();
          };
        } else {
          resolve();
        }
      });
    }
    return Promise.resolve();
  };

  const startPromptSession = async () => {
    setMode("free");
    setError(null);
    setTranscriptions([]);
    setIsProcessing(false);
    setAudioRecordings([]);
    
    // Always use the language from context for consistency
    console.log("Starting free practice session with language:", contextLanguage);
    
    try {
      // Use the language-specific function with language from context
      const prompts = await getRandomPromptsByLanguage(contextLanguage, settings.promptCount);
      
      // Override the duration of each prompt with the user setting (convert minutes to seconds)
      const promptsWithCorrectDuration = prompts.map(prompt => ({
        ...prompt,
        language: contextLanguage, // Ensure language is consistent with context
        duration: settings.promptDuration * 60 // Convert minutes to seconds
      }));
      
      expectedRecordingsRef.current = promptsWithCorrectDuration.length;
      setSelectedPrompts(promptsWithCorrectDuration);
      console.log("Selected prompts:", promptsWithCorrectDuration);
      setCurrentPromptIndex(0);
      setTimeLeft(promptsWithCorrectDuration[0].duration);
      startRecording();
    } catch (error) {
      console.error("Error getting prompts:", error);
      setError("Failed to load prompts");
    }
  };

  const handleStartLevel = async (levelId: number) => {
    try {
      // Try to get existing progress
      let response = await fetch(`/api/progress`);
      let data;
      
      // If no progress exists, create initial progress
      if (response.status === 404) {
        response = await fetch(`/api/progress`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create initial progress');
        }
      } else if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch progress');
      }

      data = await response.json();
      const userProgress = data.campaignProgress;
      
      const flashcardReq = userProgress.flashcardRequirements?.[levelId];
      if (flashcardReq?.lastFailedAttempt) {
        setSelectedLevelId(levelId);
        setShowFlashcardReview(true);
        return;
      }

      // If no flashcard review needed, start the level
      startCampaignLevel(levelId);
    } catch (error) {
      console.error('Error handling level start:', error);
      setError(error instanceof Error ? error.message : 'Failed to start level. Please try again.');
    }
  };

  const handleFlashcardReviewComplete = (canAttemptLevel: boolean) => {
    setShowFlashcardReview(false);
    if (canAttemptLevel && selectedLevelId) {
      startCampaignLevel(selectedLevelId);
    } else {
      setError('Please complete the flashcard review before attempting this level again.');
    }
  };

  const startCampaignLevel = (levelId: number) => {
    const level = campaignState.levels.find(l => l.id === levelId);
    if (!level) return;

    console.log("Starting campaign level with prompts:", level.prompts);
    
    // Apply the selected language from context to the campaign prompts and adjust durations
    const promptsWithSettings = level.prompts.map(prompt => ({
      ...prompt,
      language: contextLanguage, // Use language from context
      duration: settings.promptDuration * 60 // Convert minutes to seconds
    }));
    
    expectedRecordingsRef.current = promptsWithSettings.length;
    setSelectedPrompts(promptsWithSettings);
    setCurrentPromptIndex(0);
    setTimeLeft(promptsWithSettings[0].duration);
    setTranscriptions([]);
    setAudioRecordings([]); // Clear any previous recordings
    setMode('campaign');
    startRecording();
  };

  const updateCampaignProgress = async (levelId: number, score: number) => {
    try {
      const response = await fetch('/api/progress', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ levelId, score }),
      });

      if (!response.ok) {
        throw new Error('Failed to update progress');
      }

      const data = await response.json();
      setCampaignState(prev => ({
        ...prev,
        progress: data.campaignProgress,
        levels: prev.levels.map(level => ({
          ...level,
          isUnlocked: level.id === 1 || data.campaignProgress.completedLevels.includes(level.id - 1),
          bestScore: data.campaignProgress.bestScores[level.id],
        })),
      }));
    } catch (error) {
      console.error('Error updating progress:', error);
      setError('Failed to update progress');
    }
  };

  const handleCampaignLevelComplete = async (score: number) => {
    setIsProcessing(false);
    setProcessingStage("idle");
    
    const currentLevel = campaignState.levels[campaignState.progress.currentLevel - 1];
    const isLevelPassed = score >= currentLevel.requiredScore;
    const isBestScore = !currentLevel.bestScore || score > currentLevel.bestScore;
    
    // Update local campaign state
    const updatedLevels = campaignState.levels.map(level => {
      if (level.id === currentLevel.id) {
        return {
          ...level,
          bestScore: isBestScore ? score : level.bestScore,
        };
      }
      if (isLevelPassed && level.id === currentLevel.id + 1) {
        return {
          ...level,
          isUnlocked: true,
        };
      }
      return level;
    });

    const updatedProgress = {
      ...campaignState.progress,
      completedLevels: isLevelPassed 
        ? [...new Set([...campaignState.progress.completedLevels, currentLevel.id])]
        : campaignState.progress.completedLevels,
      bestScores: {
        ...campaignState.progress.bestScores,
        [currentLevel.id]: isBestScore ? score : (campaignState.progress.bestScores[currentLevel.id] || 0),
      },
    };

    setCampaignState({
      levels: updatedLevels,
      progress: updatedProgress,
    });

    // Save progress to database
    try {
      await updateCampaignProgress(currentLevel.id, score);
    } catch (error) {
      console.error('Failed to save progress:', error);
      setError('Failed to save progress. Please try again.');
    }

    // Show completion message
    setError(
      isLevelPassed
        ? `Congratulations! You passed Level ${currentLevel.id} with a score of ${score}%!${
            isBestScore ? ' This is your new best score!' : ''
          }`
        : `You scored ${score}%. You need ${currentLevel.requiredScore}% to pass this level. Try again!`
    );
  };

  const handleEvaluateResponse = async (transcription: string, promptIndex: number) => {
    setProcessingStage("evaluating");
    try {
      const response = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcription,
          prompt: selectedPrompts[promptIndex].text,
          mode,
          levelId: mode === "campaign" ? campaignState.progress.currentLevel : undefined,
          language: contextLanguage
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to evaluate response");
      }

      const evaluation = await response.json();
      return evaluation;
    } catch (error) {
      console.error("Evaluation error:", error);
      setError("Failed to evaluate response. Please try again.");
      setProcessingStage("idle");
      throw error;
    }
  };

  const processAllRecordings = async () => {
    if (audioRecordings.length === 0) {
      return;
    }
    
    setIsProcessing(true);
    setProcessingStage("transcribing");
    
    const newTranscriptions: Transcription[] = [];
    
    console.log(`Processing ${audioRecordings.length} recordings with language: ${contextLanguage}`);
    
    // Process each recording
    for (const recording of audioRecordings) {
      try {
        // Step 1: Transcribe audio
        const transcriptionText = await transcribeAudio(recording.blob);
        
        // Step 2: Get evaluation
        setProcessingStage("evaluating");
        const currentPrompt = selectedPrompts[recording.promptIndex];
        const evalResponse = await fetch("/api/evaluate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transcription: transcriptionText,
            promptText: currentPrompt.text,
            language: contextLanguage, // Always use the context language
            levelId: mode === "campaign" ? campaignState.progress.currentLevel : 0
          }),
        });
        
        if (!evalResponse.ok) {
          throw new Error("Evaluation failed");
        }
        
        const evaluation = await evalResponse.json();
        
        // Step 3: Generate flashcards
        setProcessingStage("generating");
        const flashcardsResponse = await fetch("/api/flashcards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            text: transcriptionText, 
            language: contextLanguage // Always use the context language
          }),
        });
        
        if (!flashcardsResponse.ok) {
          throw new Error("Flashcard generation failed");
        }
        
        const flashcardsData = await flashcardsResponse.json();
        
        // Create the transcription object
        newTranscriptions.push({
          text: transcriptionText,
          prompt: currentPrompt,
          timestamp: new Date().toISOString(),
          flashcards: flashcardsData.flashcards,
          evaluation
        });
        
      } catch (error) {
        console.error("Error processing recording:", error);
        setError("Failed to process recording");
      }
    }
    
    // Update state with all transcriptions
    setTranscriptions(prev => [...prev, ...newTranscriptions]);
    setIsProcessing(false);
    setProcessingStage("idle");
    setAudioRecordings([]);
  };

  const handleNextPrompt = async () => {
    console.log(`Handling next prompt. Current index: ${currentPromptIndex}, Total prompts: ${selectedPrompts.length}`);
    clearInterval(timerRef.current);
    await stopRecording();

    if (currentPromptIndex < selectedPrompts.length - 1) {
      const nextIndex = currentPromptIndex + 1;
      console.log(`Moving to next prompt ${nextIndex + 1}`);
      setCurrentPromptIndex(nextIndex);
      setTimeLeft(selectedPrompts[nextIndex].duration);
      startRecording();
    } else {
      // This is the last prompt
      console.log("Finished last prompt, preparing to process recordings");
      setCurrentPromptIndex(-1);
      setTimeLeft(0);
      
      // Wait a moment for the last recording to be added
      setTimeout(() => {
        setAudioRecordings(prev => {
          console.log(`Checking recordings. Expected: ${expectedRecordingsRef.current}, Got: ${prev.length}`);
          console.log("Current recordings:", prev.map(r => ({ promptIndex: r.promptIndex, size: r.blob.size })));
          
          if (prev.length === expectedRecordingsRef.current) {
            console.log("Processing all recordings");
            processAllRecordings();
          } else {
            console.warn(`Missing recordings. Expected: ${expectedRecordingsRef.current}, Got: ${prev.length}`);
            setError("Some recordings were not properly saved. Please try again.");
          }
          return prev;
        });
      }, 500); // Give more time for the last recording to be processed
    }
  };

  const evaluateResponse = async (transcription: string, prompt: string) => {
    try {
      const response = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: transcription,
          prompt: prompt,
          language: contextLanguage
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to evaluate response");
      }

      return await response.json();
    } catch (error) {
      setError("Failed to evaluate response");
      throw error;
    }
  };

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await fetch('/api/progress');
        if (!response.ok) {
          throw new Error('Failed to fetch progress');
        }
        const data = await response.json();
        setCampaignState(prev => ({
          ...prev,
          progress: data.campaignProgress,
          levels: prev.levels.map(level => ({
            ...level,
            isUnlocked: level.id === 1 || data.campaignProgress.completedLevels.includes(level.id - 1),
            bestScore: data.campaignProgress.bestScores[level.id],
          })),
        }));
      } catch (error) {
        console.error('Error fetching progress:', error);
        setError('Failed to load progress');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProgress();
  }, []);

  useEffect(() => {
    if (timeLeft > 0 && currentPromptIndex >= 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
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

  useEffect(() => {
    setCampaignState(prev => ({
      ...prev,
      levels: getCampaignLevelForLanguage(initialCampaignLevels, contextLanguage)
    }));

    // If we have transcriptions, don't refresh prompts during an active session
    if (currentPromptIndex === -1 && transcriptions.length === 0) {
      // Reset selected prompts if we're not in the middle of a session
      setSelectedPrompts([]);
    }
  }, [contextLanguage, currentPromptIndex, transcriptions.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Language Learning Practice Session
          </h1>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
          ) : showFlashcardReview && selectedLevelId ? (
            <CampaignFlashcardReview
              levelId={selectedLevelId}
              onComplete={handleFlashcardReviewComplete}
            />
          ) : mode === "selection" ? (
            <div className="space-y-6 text-center">
              <h2 className="text-2xl font-semibold text-gray-700">Choose Your Practice Mode</h2>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setMode("campaign")}
                  className="p-6 border-2 border-indigo-200 rounded-xl hover:border-indigo-400 transition-colors"
                >
                  <Trophy className="mx-auto mb-3 text-indigo-600" size={24} />
                  <h3 className="font-semibold text-gray-800">Campaign Mode</h3>
                  <p className="text-sm text-gray-600 mt-2">Progress through structured levels</p>
                </button>
                <button
                  onClick={() => setMode("free")}
                  className="p-6 border-2 border-indigo-200 rounded-xl hover:border-indigo-400 transition-colors"
                >
                  <Play className="mx-auto mb-3 text-indigo-600" size={24} />
                  <h3 className="font-semibold text-gray-800">Free Practice</h3>
                  <p className="text-sm text-gray-600 mt-2">Customize your practice session</p>
                </button>
              </div>
            </div>
          ) : mode === "campaign" && currentPromptIndex === -1 ? (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-700 text-center">Campaign Mode</h2>
              {isLoading ? (
                <div className="flex justify-center">
                  <Loader2 className="animate-spin text-indigo-600" size={32} />
                </div>
              ) : (
                <div className="grid gap-4">
                  {campaignState.levels.map((level) => (
                    <div
                      key={level.id}
                      className={`p-4 border-2 rounded-xl ${
                        level.isUnlocked ? 'border-indigo-200' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold text-gray-800">{level.name}</h3>
                          <p className="text-sm text-gray-600">{level.description}</p>
                          {level.bestScore && (
                            <div className="mt-1">
                              <span className="text-sm text-indigo-600">
                                Best Score: {level.bestScore}%
                              </span>
                              {level.bestScore >= level.requiredScore && (
                                <span className="ml-2 text-green-600">✓ Completed</span>
                              )}
                            </div>
                          )}
                        </div>
                        {level.isUnlocked ? (
                          <button
                            onClick={() => handleStartLevel(level.id)}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                          >
                            {level.bestScore ? 'Retry Level' : 'Start Level'}
                          </button>
                        ) : (
                          <div className="text-sm text-gray-500">
                            <span>🔒 Complete previous level</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <button
                onClick={() => setMode("selection")}
                className="mt-4 text-indigo-600 hover:text-indigo-700"
              >
                ← Change Practice Mode
              </button>
            </div>
          ) : mode === "free" && currentPromptIndex === -1 ? (
            <div className="text-center">
              {transcriptions.length === 0 && (
                <SessionSettingsForm
                  settings={settings}
                  onSettingsChange={setSettings}
                />
              )}
              <p className="text-gray-600 mb-8">
                Ready to practice {contextLanguage}? You'll receive {settings.promptCount}{" "}
                random prompts, with {settings.promptDuration} minutes for each
                response.
              </p>
              <div className="space-y-4">
                <button
                  onClick={startPromptSession}
                  className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg
                           hover:bg-indigo-700 transition-colors gap-2"
                >
                  <Play size={20} />
                  Start Session
                </button>
                <div>
                  <button
                    onClick={() => setMode("selection")}
                    className="text-indigo-600 hover:text-indigo-700"
                  >
                    ← Change Practice Mode
                  </button>
                </div>
              </div>
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
                    width: `${
                      (timeLeft /
                        selectedPrompts[currentPromptIndex].duration) *
                      100
                    }%`,
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
                  {currentPromptIndex === selectedPrompts.length - 1
                    ? "Finish Session"
                    : "Next Prompt"}
                </button>
              </div>
            </div>
          )}

          {transcriptions.length > 0 && currentPromptIndex === -1 && (
            <div className="space-y-8">
              <TranscriptionsList transcriptions={transcriptions} />

              {transcriptions[0]?.flashcards && (
                <div className="mt-8 pt-8 border-t">
                  <FlashcardsList 
                    flashcards={transcriptions[0].flashcards} 
                    language={transcriptions[0].prompt.language || contextLanguage}
                  />
                </div>
              )}
            </div>
          )}

          {isProcessing && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white p-8 rounded-lg shadow-xl flex flex-col items-center max-w-md w-full mx-4">
                <Loader2
                  className="animate-spin text-indigo-600 mb-4"
                  size={32}
                />
                <p className="text-gray-900 font-semibold text-lg mb-2">
                  {processingStage === "transcribing" &&
                    "Converting Recordings to Text"}
                  {processingStage === "evaluating" &&
                    "Evaluating Your Responses"}
                  {processingStage === "generating" &&
                    "Creating Your Flashcard Set"}
                </p>
                <p className="text-gray-600 text-center">
                  {processingStage === "transcribing" &&
                    "This usually takes a few moments per recording..."}
                  {processingStage === "evaluating" &&
                    "Analyzing your language use and providing feedback..."}
                  {processingStage === "generating" &&
                    "Creating personalized flashcards from your responses..."}
                </p>
                <div className="mt-4 w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                    style={{
                      width:
                        processingStage === "transcribing"
                          ? "33%"
                          : processingStage === "evaluating"
                          ? "66%"
                          : "90%",
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
