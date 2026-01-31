import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/clerk-react";

// Chrome extension types for communication
declare const chrome: {
  runtime: {
    sendMessage: (
      extensionId: string,
      message: unknown,
      callback: (response: unknown) => void
    ) => void;
    lastError?: { message: string };
  };
} | undefined;

// Extension ID - replace with actual ID after publishing to Chrome Web Store
// For development, use the ID shown in chrome://extensions
const EXTENSION_ID = import.meta.env.VITE_EXTENSION_ID || "";

interface RecordingState {
  isRecording: boolean;
  testId: string | null;
  testName: string | null;
}

interface ExtensionResponse {
  installed?: boolean;
  version?: string;
  isRecording?: boolean;
  success?: boolean;
  error?: string;
  tabId?: number;
}

export function useRecorder() {
  const { getToken } = useAuth();
  const [isExtensionInstalled, setIsExtensionInstalled] = useState<boolean | null>(null);
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    testId: null,
    testName: null,
  });
  const [isChecking, setIsChecking] = useState(true);

  /**
   * Check if extension is installed by sending a ping
   */
  const checkExtension = useCallback(async (): Promise<boolean> => {
    if (!EXTENSION_ID) {
      console.warn("[TestBloc] Extension ID not configured");
      setIsExtensionInstalled(false);
      setIsChecking(false);
      return false;
    }

    try {
      const response = await sendMessageToExtension<ExtensionResponse>({
        type: "PING",
      });

      const installed = response?.installed === true;
      setIsExtensionInstalled(installed);

      if (installed && response?.isRecording) {
        setRecordingState({
          isRecording: true,
          testId: null,
          testName: null,
        });
      }

      return installed;
    } catch (error) {
      console.log("[TestBloc] Extension not detected:", error);
      setIsExtensionInstalled(false);
      return false;
    } finally {
      setIsChecking(false);
    }
  }, []);

  /**
   * Send message to extension
   */
  async function sendMessageToExtension<T>(message: unknown): Promise<T> {
    return new Promise((resolve, reject) => {
      if (typeof chrome === "undefined" || !chrome?.runtime?.sendMessage) {
        reject(new Error("Chrome runtime not available"));
        return;
      }

      chrome.runtime.sendMessage(EXTENSION_ID, message, (response: unknown) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        resolve(response as T);
      });
    });
  }

  /**
   * Start recording for a test
   */
  const startRecording = useCallback(
    async (config: {
      testId: string;
      testName: string;
      baseUrl: string;
    }): Promise<{ success: boolean; error?: string }> => {
      try {
        // Get auth token
        const token = await getToken();
        if (!token) {
          return { success: false, error: "Not authenticated" };
        }

        const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

        const response = await sendMessageToExtension<ExtensionResponse>({
          type: "START_RECORDING",
          payload: {
            testId: config.testId,
            testName: config.testName,
            baseUrl: config.baseUrl,
            authToken: token,
            apiBaseUrl,
          },
        });

        if (response?.success) {
          setRecordingState({
            isRecording: true,
            testId: config.testId,
            testName: config.testName,
          });
          return { success: true };
        }

        return {
          success: false,
          error: response?.error || "Failed to start recording",
        };
      } catch (error) {
        console.error("[TestBloc] Failed to start recording:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
    [getToken]
  );

  /**
   * Stop current recording
   */
  const stopRecording = useCallback(async (): Promise<{ success: boolean }> => {
    try {
      const response = await sendMessageToExtension<ExtensionResponse>({
        type: "STOP_RECORDING",
      });

      setRecordingState({
        isRecording: false,
        testId: null,
        testName: null,
      });

      return { success: response?.success ?? true };
    } catch (error) {
      console.error("[TestBloc] Failed to stop recording:", error);
      // Still reset state even if message failed
      setRecordingState({
        isRecording: false,
        testId: null,
        testName: null,
      });
      return { success: false };
    }
  }, []);

  /**
   * Get current recording state from extension
   */
  const getRecordingState = useCallback(async () => {
    try {
      const response = await sendMessageToExtension<RecordingState & ExtensionResponse>({
        type: "GET_RECORDING_STATE",
      });

      if (response) {
        setRecordingState({
          isRecording: response.isRecording ?? false,
          testId: response.testId ?? null,
          testName: response.testName ?? null,
        });
      }
    } catch (error) {
      console.log("[TestBloc] Could not get recording state:", error);
    }
  }, []);

  // Check extension on mount
  useEffect(() => {
    checkExtension();
  }, [checkExtension]);

  // Poll extension state while recording to detect external stops
  useEffect(() => {
    if (!recordingState.isRecording || !isExtensionInstalled) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await sendMessageToExtension<RecordingState & ExtensionResponse>({
          type: "GET_RECORDING_STATE",
        });

        // If extension says not recording but our state says recording, sync up
        if (response && !response.isRecording && recordingState.isRecording) {
          setRecordingState({
            isRecording: false,
            testId: null,
            testName: null,
          });
        }
      } catch {
        // Extension might be unavailable, ignore
      }
    }, 1000); // Poll every second

    return () => clearInterval(pollInterval);
  }, [recordingState.isRecording, isExtensionInstalled]);

  return {
    isExtensionInstalled,
    isChecking,
    recordingState,
    startRecording,
    stopRecording,
    checkExtension,
    getRecordingState,
  };
}

/**
 * Get the Chrome Web Store URL for the extension
 */
export function getExtensionStoreUrl(): string {
  // Replace with actual Chrome Web Store URL when published
  return EXTENSION_ID
    ? `https://chrome.google.com/webstore/detail/${EXTENSION_ID}`
    : "https://chrome.google.com/webstore/category/extensions";
}
