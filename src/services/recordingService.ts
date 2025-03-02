/**
 * Recording Service
 * Centralizes audio recording functionality for the language learning application
 */

export interface AudioRecording {
  blob: Blob;
  promptIndex: number;
}

export interface RecordingSession {
  mediaRecorder: MediaRecorder | null;
  audioChunks: Blob[];
  isRecording: boolean;
}

// Initialize a new recording session
export function createRecordingSession(): RecordingSession {
  return {
    mediaRecorder: null,
    audioChunks: [],
    isRecording: false,
  };
}

/**
 * Starts a new audio recording session
 * @returns Promise that resolves when recording has started
 */
export async function startRecording(
  session: RecordingSession,
  onStatusChange?: (isRecording: boolean) => void,
): Promise<RecordingSession> {
  try {
    // Get microphone access
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    // Create new MediaRecorder instance
    const mediaRecorder = new MediaRecorder(stream);
    const audioChunks: Blob[] = [];

    // Set up data handler
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };

    // Start recording
    mediaRecorder.start();
    console.log("Recording started");

    // Update session object
    const updatedSession: RecordingSession = {
      mediaRecorder,
      audioChunks,
      isRecording: true,
    };

    // Call status change callback if provided
    if (onStatusChange) {
      onStatusChange(true);
    }

    return updatedSession;
  } catch (error) {
    console.error("Failed to start recording:", error);
    throw new Error(
      "Failed to access microphone. Please ensure microphone permissions are granted.",
    );
  }
}

/**
 * Stops the current recording session
 * @returns Promise that resolves with the audio blob once recording has stopped
 */
export async function stopRecording(
  session: RecordingSession,
  promptIndex: number,
  onStatusChange?: (isRecording: boolean) => void,
): Promise<AudioRecording> {
  if (!session.mediaRecorder || !session.isRecording) {
    throw new Error("No active recording to stop");
  }

  return new Promise<AudioRecording>((resolve, reject) => {
    try {
      console.log(`Stopping recording for prompt ${promptIndex + 1}`);

      // Set up event handler for when recording stops
      session.mediaRecorder!.onstop = () => {
        // Create a blob from the recorded audio chunks
        const audioBlob = new Blob(session.audioChunks, {
          type: "audio/webm",
        });

        console.log(`Created audio blob for prompt ${promptIndex + 1}:`, {
          size: audioBlob.size,
          type: audioBlob.type,
        });

        // Stop all audio tracks
        session
          .mediaRecorder!.stream.getTracks()
          .forEach((track) => track.stop());

        // Call status change callback if provided
        if (onStatusChange) {
          onStatusChange(false);
        }

        // Resolve with the recording data
        resolve({
          blob: audioBlob,
          promptIndex,
        });
      };

      // Stop the media recorder
      session.mediaRecorder!.stop();
    } catch (error) {
      console.error("Error stopping recording:", error);
      reject(error);
    }
  });
}

/**
 * Validates recording permission
 * @returns Promise that resolves with a boolean indicating if permission is granted
 */
export async function checkRecordingPermission(): Promise<boolean> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    // Stop all tracks to release the microphone
    stream.getTracks().forEach((track) => track.stop());

    return true;
  } catch (error) {
    console.error("Microphone permission error:", error);
    return false;
  }
}

/**
 * Creates an audio URL from a blob for playback
 */
export function createAudioUrl(blob: Blob): string {
  return URL.createObjectURL(blob);
}

/**
 * Releases an audio URL created by createAudioUrl
 */
export function releaseAudioUrl(url: string): void {
  URL.revokeObjectURL(url);
}
