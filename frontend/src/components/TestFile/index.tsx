import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Play, MoreHorizontal, Share2, Circle, Square, Loader2, ChevronDown, Monitor, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import TestFileStoryMode from "./TestFileStoryMode";
import TestFileBlockMode from "./TestFileBlockMode";
import ShareModal from "./ShareModal";
import InstallExtensionModal from "@/components/InstallExtensionModal";
import { useRecorder } from "@/hooks/useRecorder";
import { useTestRunner, type StepResult } from "@/hooks/useTestRunner";
import { useProjectOptional } from "@/contexts/ProjectContext";
import type { TestStep as ApiTestStep } from "@/pages/dashboard/test-file-detail";

// Display format for steps (used by StoryMode and BlockMode)
export interface TestStep {
  id: string;
  stepNumber: number;
  text: string;
  expectedResult: string;
  screenshot: string | null;
  status: "passed" | "failed" | "pending";
  action?: string;
  value?: string | null;
}

// Convert API step to display format
function convertApiStepToDisplay(step: ApiTestStep): TestStep {
  return {
    id: step.id,
    stepNumber: step.stepNumber,
    text: step.description,
    expectedResult: step.value || "",
    screenshot: step.elementScreenshot,
    status: "pending", // Steps are pending until a test run executes them
    action: step.action,
    value: step.value,
  };
}

interface TestFileProps {
  testId: string;
  fileName?: string;
  initialSteps?: ApiTestStep[];
  onRefresh?: () => Promise<void>;
}

const POLLING_INTERVAL = 2000; // Poll every 2 seconds during recording

const TestFile = ({
  testId,
  fileName = "Test File",
  initialSteps = [],
  onRefresh,
}: TestFileProps) => {
  const navigate = useNavigate();
  const projectContext = useProjectOptional();
  const {
    isExtensionInstalled,
    isChecking,
    recordingState,
    startRecording,
    stopRecording,
    checkExtension,
  } = useRecorder();
  const {
    isRunning,
    currentRun,
    progress,
    stepResults,
    startRun,
    cancelRun,
  } = useTestRunner(testId);

  const [activeMode, setActiveMode] = useState<"story" | "block">("story");
  const [steps, setSteps] = useState<TestStep[]>(
    initialSteps.map(convertApiStepToDisplay)
  );
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isStartingRecording, setIsStartingRecording] = useState(false);
  const [runHeadless, setRunHeadless] = useState(true);
  const [isRunDropdownOpen, setIsRunDropdownOpen] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const runDropdownRef = useRef<HTMLDivElement>(null);

  const isRecordingThisTest = recordingState.isRecording && recordingState.testId === testId;

  // Helper to get step result by step ID
  const getStepResult = (stepId: string): StepResult | undefined => {
    return stepResults.find((r: StepResult) => r.testStepId === stepId);
  };

  // Helper to convert step result status to display status
  const getStepStatus = (stepId: string): "passed" | "failed" | "pending" => {
    const result = getStepResult(stepId);
    if (!result) return "pending";
    if (result.status === "PASSED") return "passed";
    if (result.status === "FAILED") return "failed";
    return "pending";
  };

  // Merge step results with steps for display
  const stepsWithResults = steps.map((step) => {
    const result = currentRun ? getStepResult(step.id) : undefined;
    return {
      ...step,
      status: currentRun ? getStepStatus(step.id) : step.status,
      // Use screenshot from run result if available, otherwise use recorded screenshot
      screenshot: result?.screenshotUrl ?? step.screenshot,
    };
  });

  // Update steps when initialSteps changes
  useEffect(() => {
    setSteps(initialSteps.map(convertApiStepToDisplay));
  }, [initialSteps]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (runDropdownRef.current && !runDropdownRef.current.contains(event.target as Node)) {
        setIsRunDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Start/stop polling when recording state changes
  useEffect(() => {
    if (isRecordingThisTest && onRefresh) {
      // Start polling
      pollingRef.current = setInterval(async () => {
        await onRefresh();
      }, POLLING_INTERVAL);
    } else {
      // Stop polling
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [isRecordingThisTest, onRefresh]);

  const handleRecordClick = async () => {
    // Check if extension is installed
    if (!isExtensionInstalled) {
      setIsInstallModalOpen(true);
      return;
    }

    // If already recording this test, stop it
    if (isRecordingThisTest) {
      await stopRecording();
      // Refresh to get final steps
      if (onRefresh) {
        await onRefresh();
      }
      return;
    }

    // Get baseUrl from project context
    const baseUrl = projectContext?.selectedProject?.baseUrl;
    if (!baseUrl) {
      console.error("No project baseUrl available");
      return;
    }

    setIsStartingRecording(true);
    try {
      const result = await startRecording({
        testId,
        testName: fileName,
        baseUrl,
      });

      if (!result.success) {
        console.error("Failed to start recording:", result.error);
      }
    } finally {
      setIsStartingRecording(false);
    }
  };

  const handleRetryExtensionCheck = async () => {
    const installed = await checkExtension();
    if (installed) {
      setIsInstallModalOpen(false);
    }
  };

  const handleRunClick = async (headless?: boolean) => {
    if (isRunning) {
      await cancelRun();
    } else {
      await startRun(headless ?? runHeadless);
      setIsRunDropdownOpen(false);
    }
  };

  const handleUpdateStep = (
    stepId: string,
    field: "text" | "expectedResult",
    value: string,
  ) => {
    setSteps((prev) =>
      prev.map((step) =>
        step.id === stepId ? { ...step, [field]: value } : step,
      ),
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Recording Banner */}
      {isRecordingThisTest && (
        <div className="bg-red-500 text-white px-6 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-white animate-pulse" />
            <span className="font-medium">Recording in progress</span>
            <span className="text-red-100">• {steps.length} steps captured</span>
          </div>
          <button
            onClick={handleRecordClick}
            className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-sm font-medium transition-colors"
          >
            Stop Recording
          </button>
        </div>
      )}

      {/* Running Banner */}
      {isRunning && (
        <div className="bg-primary text-white px-6 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Loader2 className="size-4 animate-spin" />
            <span className="font-medium">Test running...</span>
            <span className="text-primary-foreground/70">• {progress}% complete</span>
          </div>
          <button
            onClick={handleRunClick}
            className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-sm font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-white">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center size-9 rounded-lg hover:bg-[#f9f9f9] transition-colors"
          >
            <ArrowLeft className="size-5 text-[#667085]" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-[#1f2937]">{fileName}</h1>
            <p className="text-sm text-[#667085]">
              {steps.length} steps
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Record Button */}
          <button
            onClick={handleRecordClick}
            disabled={isChecking || isStartingRecording || (recordingState.isRecording && !isRecordingThisTest)}
            className={`flex items-center gap-2 h-10 px-4 rounded-lg transition-colors font-medium ${
              isRecordingThisTest
                ? "bg-red-500 text-white hover:bg-red-600"
                : "border border-border bg-white text-[#1f2937] hover:bg-[#f9f9f9]"
            } ${
              (isChecking || isStartingRecording || (recordingState.isRecording && !isRecordingThisTest))
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            {isRecordingThisTest ? (
              <>
                <Square className="size-4" fill="currentColor" />
                <span>Stop Recording</span>
              </>
            ) : (
              <>
                <Circle className="size-4 text-red-500" fill="currentColor" />
                <span>{isStartingRecording ? "Starting..." : "Record"}</span>
              </>
            )}
          </button>

          {/* Run Button with Dropdown */}
          <div className="relative" ref={runDropdownRef}>
            <div className="flex">
              <button
                onClick={() => handleRunClick()}
                disabled={steps.length === 0 || isRecordingThisTest}
                className={`flex items-center gap-2 h-10 px-4 rounded-l-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  isRunning
                    ? "bg-orange-500 text-white hover:bg-orange-600"
                    : "bg-primary text-white hover:bg-primary/90"
                }`}
              >
                {isRunning ? (
                  <>
                    <Square className="size-4" fill="currentColor" />
                    <span className="font-medium">Stop ({progress}%)</span>
                  </>
                ) : (
                  <>
                    <Play className="size-4" fill="currentColor" />
                    <span className="font-medium">Run {runHeadless ? "" : "(Browser)"}</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setIsRunDropdownOpen(!isRunDropdownOpen)}
                disabled={steps.length === 0 || isRecordingThisTest || isRunning}
                className={`flex items-center justify-center h-10 px-2 rounded-r-lg border-l border-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  isRunning
                    ? "bg-orange-500 text-white"
                    : "bg-primary text-white hover:bg-primary/90"
                }`}
              >
                <ChevronDown className="size-4" />
              </button>
            </div>

            {/* Dropdown Menu */}
            {isRunDropdownOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-border py-1 z-50">
                <button
                  onClick={() => {
                    setRunHeadless(true);
                    handleRunClick(true);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-[#f9f9f9] transition-colors"
                >
                  <Monitor className="size-4 text-[#667085]" />
                  <div>
                    <div className="font-medium text-[#1f2937]">Run Headless</div>
                    <div className="text-xs text-[#667085]">Fast, no browser window</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setRunHeadless(false);
                    handleRunClick(false);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-[#f9f9f9] transition-colors"
                >
                  <Eye className="size-4 text-[#667085]" />
                  <div>
                    <div className="font-medium text-[#1f2937]">Run with Browser</div>
                    <div className="text-xs text-[#667085]">Watch test execute</div>
                  </div>
                </button>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="flex items-center gap-2 h-10 px-4 border border-border bg-white text-[#1f2937] rounded-lg hover:bg-[#f9f9f9] transition-colors"
          >
            <Share2 className="size-4 text-[#667085]" />
            <span className="font-medium">Share Test</span>
          </button>

          {/* More Options */}
          <button className="flex items-center justify-center size-10 rounded-lg hover:bg-[#f9f9f9] transition-colors">
            <MoreHorizontal className="size-5 text-[#667085]" />
          </button>
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="px-6 py-3 border-b border-border bg-white">
        <div className="inline-flex items-center p-1 bg-[#f4f4f5] rounded-lg">
          <button
            onClick={() => setActiveMode("story")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeMode === "story"
                ? "bg-white text-[#1f2937] shadow-sm"
                : "text-[#667085] hover:text-[#1f2937]"
            }`}
          >
            Story Mode
          </button>
          <button
            onClick={() => setActiveMode("block")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeMode === "block"
                ? "bg-white text-[#1f2937] shadow-sm"
                : "text-[#667085] hover:text-[#1f2937]"
            }`}
          >
            Block Mode
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-[#fafafa] p-6">
        {steps.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-[#f4f4f5] rounded-full flex items-center justify-center mb-4">
              <Circle className="size-8 text-[#667085]" />
            </div>
            <h3 className="text-lg font-medium text-[#1f2937] mb-2">
              No steps recorded yet
            </h3>
            <p className="text-[#667085] mb-6 max-w-md">
              Click the "Record" button to start capturing browser interactions.
              Your actions will appear here as test steps.
            </p>
            <button
              onClick={handleRecordClick}
              disabled={isChecking || isStartingRecording}
              className="flex items-center gap-2 h-10 px-6 border border-border bg-white text-[#1f2937] rounded-lg hover:bg-[#f9f9f9] transition-colors font-medium"
            >
              <Circle className="size-4 text-red-500" fill="currentColor" />
              <span>Start Recording</span>
            </button>
          </div>
        ) : activeMode === "story" ? (
          <TestFileStoryMode steps={stepsWithResults} onUpdateStep={handleUpdateStep} />
        ) : (
          <TestFileBlockMode steps={stepsWithResults} />
        )}
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        testName={fileName}
      />

      {/* Install Extension Modal */}
      <InstallExtensionModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        onRetryCheck={handleRetryExtensionCheck}
      />
    </div>
  );
};

export default TestFile;
