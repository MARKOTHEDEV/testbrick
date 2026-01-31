import { useState, useCallback, useRef, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";
const POLLING_INTERVAL = 1000; // Poll every 1 second

// Types matching backend response
export type TestRunStatus = "PENDING" | "RUNNING" | "PASSED" | "FAILED" | "CANCELLED";
export type StepResultStatus = "PENDING" | "RUNNING" | "PASSED" | "FAILED" | "SKIPPED";

export interface StepResult {
  id: string;
  status: StepResultStatus;
  duration: number | null;
  error: string | null;
  screenshotUrl: string | null;
  locatorUsed: string | null;
  testStepId: string;
  stepNumber: number;
  action: string;
  description: string;
}

export interface TestError {
  id: string;
  type: string;
  message: string;
  stack: string | null;
  url: string | null;
  timestamp: string;
  context: unknown;
}

export interface TestRun {
  id: string;
  status: TestRunStatus;
  startedAt: string | null;
  endedAt: string | null;
  videoUrl: string | null;
  shareToken: string | null;
  createdAt: string;
  testFileId: string;
  testFileName?: string;
  progress: number;
  stepResults: StepResult[];
  errors: TestError[];
}

interface TestRunnerState {
  isRunning: boolean;
  currentRun: TestRun | null;
  error: string | null;
}

export function useTestRunner(testId: string) {
  const { getToken } = useAuth();
  const [state, setState] = useState<TestRunnerState>({
    isRunning: false,
    currentRun: null,
    error: null,
  });
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const runIdRef = useRef<string | null>(null);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  /**
   * Fetch with auth token
   */
  const authFetch = useCallback(
    async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
      const token = await getToken();
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `Request failed: ${response.status}`);
      }

      return response.json();
    },
    [getToken]
  );

  /**
   * Poll for test run status
   */
  const pollRunStatus = useCallback(
    async (runId: string) => {
      try {
        const run = await authFetch<TestRun>(`/test-runs/${runId}`);

        setState((prev) => ({
          ...prev,
          currentRun: run,
          isRunning: run.status === "PENDING" || run.status === "RUNNING",
        }));

        // Stop polling if run is complete
        if (
          run.status !== "PENDING" &&
          run.status !== "RUNNING" &&
          pollingRef.current
        ) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
          runIdRef.current = null;
        }
      } catch (error) {
        console.error("[TestRunner] Failed to poll status:", error);
      }
    },
    [authFetch]
  );

  /**
   * Start a test run
   * @param headless - Run in headless mode (default: true)
   */
  const startRun = useCallback(async (headless: boolean = true): Promise<{
    success: boolean;
    error?: string;
  }> => {
    // Don't start if already running
    if (state.isRunning) {
      return { success: false, error: "A test is already running" };
    }

    setState((prev) => ({
      ...prev,
      isRunning: true,
      error: null,
      currentRun: null,
    }));

    try {
      const run = await authFetch<TestRun>(`/test-runs/tests/${testId}/run?headless=${headless}`, {
        method: "POST",
      });

      runIdRef.current = run.id;

      setState((prev) => ({
        ...prev,
        currentRun: run,
      }));

      // Start polling for status updates
      pollingRef.current = setInterval(() => {
        if (runIdRef.current) {
          pollRunStatus(runIdRef.current);
        }
      }, POLLING_INTERVAL);

      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to start test run";

      setState((prev) => ({
        ...prev,
        isRunning: false,
        error: errorMessage,
      }));

      return { success: false, error: errorMessage };
    }
  }, [testId, state.isRunning, authFetch, pollRunStatus]);

  /**
   * Cancel the current test run
   */
  const cancelRun = useCallback(async (): Promise<{
    success: boolean;
    error?: string;
  }> => {
    if (!runIdRef.current) {
      return { success: false, error: "No test run to cancel" };
    }

    try {
      await authFetch(`/test-runs/${runIdRef.current}/cancel`, {
        method: "POST",
      });

      // Stop polling
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }

      setState((prev) => ({
        ...prev,
        isRunning: false,
        currentRun: prev.currentRun
          ? { ...prev.currentRun, status: "CANCELLED" }
          : null,
      }));

      runIdRef.current = null;

      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to cancel test run";

      return { success: false, error: errorMessage };
    }
  }, [authFetch]);

  /**
   * Clear the current run state
   */
  const clearRun = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    runIdRef.current = null;
    setState({
      isRunning: false,
      currentRun: null,
      error: null,
    });
  }, []);

  return {
    isRunning: state.isRunning,
    currentRun: state.currentRun,
    error: state.error,
    progress: state.currentRun?.progress ?? 0,
    stepResults: state.currentRun?.stepResults ?? [],
    startRun,
    cancelRun,
    clearRun,
  };
}
