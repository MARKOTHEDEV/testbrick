import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Eye,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Terminal,
  Globe,
  RotateCcw,
  X,
  Download,
  ExternalLink,
  Clock,
  Calendar,
  Loader2,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

// Types matching backend response
type StepResultStatus = "PENDING" | "RUNNING" | "PASSED" | "FAILED" | "SKIPPED";
type TestRunStatus = "PENDING" | "RUNNING" | "PASSED" | "FAILED" | "CANCELLED";
type TestErrorType =
  | "CONSOLE_ERROR"
  | "NETWORK_ERROR"
  | "ASSERTION_ERROR"
  | "TIMEOUT_ERROR"
  | "ELEMENT_NOT_FOUND"
  | "OTHER";

interface StepResult {
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

interface TestError {
  id: string;
  type: TestErrorType;
  message: string;
  stack: string | null;
  url: string | null;
  timestamp: string;
  context: unknown;
}

interface NetworkRequest {
  id: string;
  method: string;
  url: string;
  status: number | null;
  statusText: string | null;
  resourceType: string;
  duration: number | null;
  requestSize: number | null;
  responseSize: number | null;
  failed: boolean;
  errorText: string | null;
  timestamp: string;
}

interface TestRunData {
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
  networkRequests: NetworkRequest[];
}

// Screenshot Drawer Component
const ScreenshotDrawer = ({
  isOpen,
  onClose,
  screenshot,
}: {
  isOpen: boolean;
  onClose: () => void;
  screenshot: { url: string | null; stepNumber: number; action: string } | null;
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !screenshot) return null;

  const handleDownload = () => {
    if (!screenshot.url) return;
    const link = document.createElement("a");
    link.href = screenshot.url;
    link.download = `step-${screenshot.stepNumber}-screenshot.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenNewTab = () => {
    if (!screenshot.url) return;
    window.open(screenshot.url, "_blank");
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />
      <div className="fixed top-0 right-0 h-full w-[500px] bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h3 className="text-base font-semibold text-[#1f2937]">
              Step {screenshot.stepNumber} Screenshot
            </h3>
            <p className="text-sm text-[#667085] mt-0.5">{screenshot.action}</p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center size-9 rounded-lg hover:bg-[#f4f4f5] text-[#667085] transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {screenshot.url && (
          <div className="flex items-center gap-2 px-6 py-3 border-b border-border bg-[#f9fafb]">
            <button
              onClick={handleOpenNewTab}
              className="flex items-center justify-center size-8 rounded-md hover:bg-white text-[#667085] transition-colors"
            >
              <ExternalLink className="size-4" />
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center justify-center size-8 rounded-md hover:bg-white text-[#667085] transition-colors"
            >
              <Download className="size-4" />
            </button>
          </div>
        )}

        <div className="flex-1 overflow-auto p-6 bg-[#f4f4f5]">
          <div className="bg-white rounded-lg border border-border shadow-sm overflow-hidden">
            {screenshot.url ? (
              <img
                src={screenshot.url}
                alt={`Screenshot of step ${screenshot.stepNumber}`}
                className="w-full h-auto"
              />
            ) : (
              <div className="aspect-video bg-gradient-to-br from-[#f9fafb] to-[#f4f4f5] flex items-center justify-center">
                <div className="text-center">
                  <div className="size-16 mx-auto mb-4 rounded-xl bg-[#f4f4f5] flex items-center justify-center">
                    <svg
                      className="size-8 text-[#9ca3af]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm text-[#6b7280]">No screenshot available</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#9ca3af]">
              Captured during test execution
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-[#667085] hover:text-[#1f2937] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// Video Player Component
const VideoPlayer = ({ videoUrl }: { videoUrl: string | null }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds) || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handlePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current || isDragging) return;
    const current = videoRef.current.currentTime;
    setCurrentTime(current);

    const effectiveDur = getEffectiveDuration();
    if (effectiveDur > 0) {
      setProgress((current / effectiveDur) * 100);
      // Update duration if we didn't have it before
      if (duration === 0) {
        setDuration(effectiveDur);
      }
    }
  };

  // Called when video data is being loaded - useful to get seekable ranges
  const handleProgress = () => {
    if (!videoRef.current || duration > 0) return;
    const effectiveDur = getEffectiveDuration();
    if (effectiveDur > 0) {
      setDuration(effectiveDur);
    }
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    const dur = videoRef.current.duration;
    if (isFinite(dur) && dur > 0) {
      setDuration(dur);
    }
  };

  // Also try to get duration when video can play
  const handleCanPlay = () => {
    if (!videoRef.current) return;
    const dur = videoRef.current.duration;
    if (isFinite(dur) && dur > 0 && duration === 0) {
      setDuration(dur);
    }
  };

  // Update duration when it changes (WebM files may update duration during playback)
  const handleDurationChange = () => {
    if (!videoRef.current) return;
    const dur = videoRef.current.duration;
    if (isFinite(dur) && dur > 0) {
      setDuration(dur);
    }
  };

  // Get the effective duration - use seekable range for WebM with Infinity duration
  const getEffectiveDuration = (): number => {
    if (!videoRef.current) return 0;

    // Try the standard duration first
    const dur = videoRef.current.duration;
    if (isFinite(dur) && dur > 0) {
      return dur;
    }

    // Fallback: use seekable ranges (works for WebM with Infinity duration)
    const seekable = videoRef.current.seekable;
    if (seekable.length > 0) {
      return seekable.end(seekable.length - 1);
    }

    // Last fallback: use buffered ranges
    const buffered = videoRef.current.buffered;
    if (buffered.length > 0) {
      return buffered.end(buffered.length - 1);
    }

    return 0;
  };

  const seekToPercent = (percent: number) => {
    if (!videoRef.current) return;
    const effectiveDur = getEffectiveDuration();
    if (effectiveDur <= 0) return;

    const clampedPercent = Math.max(0, Math.min(1, percent));
    const newTime = clampedPercent * effectiveDur;

    videoRef.current.currentTime = newTime;
    setProgress(clampedPercent * 100);
    setCurrentTime(newTime);

    // Update duration state if we found a valid one
    if (duration === 0 && effectiveDur > 0) {
      setDuration(effectiveDur);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    seekToPercent(percent);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    handleProgressClick(e);
  };

  // Handle mouse move and mouse up for dragging
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!progressBarRef.current) return;
      const rect = progressBarRef.current.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      seekToPercent(percent);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const handleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  const handleMuteToggle = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  };

  if (!videoUrl) {
    return (
      <div className="bg-[#1f2937] rounded-xl overflow-hidden">
        <div className="aspect-video bg-black flex items-center justify-center">
          <div className="text-center">
            <div className="size-16 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
              <Play className="size-6 text-white/60" />
            </div>
            <p className="text-white/60 text-sm">No video recording available</p>
            <p className="text-white/40 text-xs mt-1">Run the test to generate a recording</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1f2937] rounded-xl overflow-hidden">
      <div className="aspect-video bg-black relative">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-contain"
          preload="auto"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onCanPlay={handleCanPlay}
          onDurationChange={handleDurationChange}
          onProgress={handleProgress}
          onEnded={handleEnded}
          onClick={handlePlayPause}
          muted={isMuted}
        />

        {/* Play overlay when paused */}
        {!isPlaying && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
            onClick={handlePlayPause}
          >
            <div className="size-20 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
              <Play className="size-8 text-white ml-1" />
            </div>
          </div>
        )}
      </div>

      <div className="px-4 py-3 flex items-center gap-4 bg-[#111827]">
        <button
          onClick={handlePlayPause}
          className="flex items-center justify-center size-8 rounded-md hover:bg-white/10 text-white transition-colors"
        >
          {isPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
        </button>

        <div className="flex-1 flex items-center gap-3">
          <span className="text-xs text-white/60 font-mono w-10">{formatTime(currentTime)}</span>
          <div
            ref={progressBarRef}
            className="flex-1 h-2 bg-white/20 rounded-full cursor-pointer group"
            onClick={handleProgressClick}
            onMouseDown={handleMouseDown}
          >
            <div
              className="h-full bg-[#6e0699] rounded-full relative transition-all"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 size-3 bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
          <span className="text-xs text-white/60 font-mono w-10">{formatTime(duration)}</span>
        </div>

        <button
          onClick={handleMuteToggle}
          className="flex items-center justify-center size-8 rounded-md hover:bg-white/10 text-white transition-colors"
        >
          {isMuted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
        </button>

        <button
          onClick={handleFullscreen}
          className="flex items-center justify-center size-8 rounded-md hover:bg-white/10 text-white transition-colors"
        >
          <Maximize className="size-4" />
        </button>
      </div>
    </div>
  );
};

// Verify Fix Modal
const VerifyFixModal = ({
  isOpen,
  onClose,
  onConfirm,
  testName,
  isRunning,
  progress,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  testName: string;
  isRunning: boolean;
  progress: number;
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="size-12 mx-auto mb-4 rounded-full bg-[#6e0699]/10 flex items-center justify-center">
              <RotateCcw
                className={`size-6 text-[#6e0699] ${isRunning ? "animate-spin" : ""}`}
              />
            </div>
            <h3 className="text-lg font-semibold text-[#1f2937] text-center">
              {isRunning ? "Running Test..." : "Verify Fix"}
            </h3>
            <p className="text-sm text-[#667085] text-center mt-2">
              {isRunning
                ? "Please wait while we re-run the test to verify your fix."
                : `This will re-run "${testName}" to verify that the issue has been fixed.`}
            </p>
          </div>

          {!isRunning && (
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-[#667085] bg-[#f4f4f5] rounded-lg hover:bg-[#e5e5e5] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-[#6e0699] rounded-lg hover:bg-[#5a0580] transition-colors"
              >
                Run Test
              </button>
            </div>
          )}

          {isRunning && (
            <div className="px-6 pb-6">
              <div className="h-2 bg-[#f4f4f5] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#6e0699] rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-center text-[#667085] mt-2">{progress}% complete</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// Format date
const formatDate = (dateString: string | null) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Calculate duration
const formatDuration = (startedAt: string | null, endedAt: string | null) => {
  if (!startedAt || !endedAt) return "N/A";
  const start = new Date(startedAt).getTime();
  const end = new Date(endedAt).getTime();
  const durationMs = end - start;
  const seconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const TestSharePage = () => {
  const { shareToken } = useParams<{ shareToken: string }>();
  const [testData, setTestData] = useState<TestRunData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedScreenshot, setSelectedScreenshot] = useState<{
    url: string | null;
    stepNumber: number;
    action: string;
  } | null>(null);
  const [isErrorsExpanded, setIsErrorsExpanded] = useState(false);
  const [activeErrorTab, setActiveErrorTab] = useState<"console" | "network">("console");
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyProgress, setVerifyProgress] = useState(0);

  // Fetch test run data
  useEffect(() => {
    const fetchData = async () => {
      if (!shareToken) {
        setError("Invalid share link");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/test-runs/share/${shareToken}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Test run not found");
          }
          throw new Error("Failed to load test results");
        }
        const data = await response.json();
        setTestData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load test results");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [shareToken]);

  // Poll for updates if verifying
  useEffect(() => {
    if (!isVerifying || !testData?.shareToken) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/test-runs/share/${testData.shareToken}`);
        if (response.ok) {
          const data = await response.json();
          setTestData(data);
          setVerifyProgress(data.progress);

          if (data.status !== "PENDING" && data.status !== "RUNNING") {
            setIsVerifying(false);
            setIsVerifyModalOpen(false);
          }
        }
      } catch (err) {
        console.error("Failed to poll status:", err);
      }
    }, 1000);

    return () => clearInterval(pollInterval);
  }, [isVerifying, testData?.shareToken]);

  const handleVerifyFix = async () => {
    if (!shareToken) return;

    setIsVerifying(true);
    setVerifyProgress(0);

    try {
      const response = await fetch(`${API_BASE_URL}/test-runs/share/${shareToken}/verify`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to start verification");
      }

      const newRun = await response.json();
      // Update to the new run's shareToken for polling
      setTestData(newRun);
    } catch (err) {
      console.error("Failed to verify fix:", err);
      setIsVerifying(false);
      setIsVerifyModalOpen(false);
      alert("Failed to start verification. Please try again.");
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="size-10 text-[#6e0699] animate-spin mx-auto mb-4" />
          <p className="text-[#667085]">Loading test results...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !testData) {
    return (
      <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center">
        <div className="text-center">
          <div className="size-16 mx-auto mb-4 rounded-full bg-[#fee2e2] flex items-center justify-center">
            <XCircle className="size-8 text-[#dc2626]" />
          </div>
          <h1 className="text-xl font-semibold text-[#1f2937] mb-2">
            {error || "Test not found"}
          </h1>
          <p className="text-[#667085]">
            This share link may have expired or is invalid.
          </p>
        </div>
      </div>
    );
  }

  const passedSteps = testData.stepResults.filter((s) => s.status === "PASSED").length;
  const failedSteps = testData.stepResults.filter((s) => s.status === "FAILED").length;
  const consoleErrors = testData.errors.filter((e) => e.type === "CONSOLE_ERROR");
  const networkRequests = testData.networkRequests || [];
  const failedRequests = networkRequests.filter((r) => r.failed || (r.status && r.status >= 400));
  const hasErrors = testData.errors.length > 0;
  const hasNetworkActivity = networkRequests.length > 0;

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Logo */}
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-lg bg-[#6e0699] flex items-center justify-center">
                  <span className="text-white font-bold text-sm">TB</span>
                </div>
                <span className="font-semibold text-[#1f2937]">TestBloc</span>
              </div>
              <div className="h-6 w-px bg-border" />
              <div>
                <h1 className="text-base font-semibold text-[#1f2937]">
                  {testData.testFileName || "Test Run"}
                </h1>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="flex items-center gap-1 text-xs text-[#667085]">
                    <Calendar className="size-3" />
                    {formatDate(testData.createdAt)}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-[#667085]">
                    <Clock className="size-3" />
                    {formatDuration(testData.startedAt, testData.endedAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Status & Verify Fix Button */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f4f4f5]">
                <span className="flex items-center gap-1 text-xs font-medium text-[#16a34a]">
                  <CheckCircle2 className="size-3" />
                  {passedSteps} passed
                </span>
                <span className="text-[#d1d5db]">•</span>
                <span className="flex items-center gap-1 text-xs font-medium text-[#dc2626]">
                  <XCircle className="size-3" />
                  {failedSteps} failed
                </span>
              </div>

              <button
                onClick={() => setIsVerifyModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#6e0699] rounded-lg hover:bg-[#5a0580] transition-colors shadow-sm"
              >
                <RotateCcw className="size-4" />
                Verify Fix
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Video Section */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-[#1f2937] mb-4">Test Recording</h2>
          <VideoPlayer videoUrl={testData.videoUrl} />
        </section>

        {/* Steps Table */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-[#1f2937] mb-4">
            Test Steps ({testData.stepResults.length})
          </h2>
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-[60px_1fr_1fr_100px_100px] bg-[#f9fafb] border-b border-border">
              <div className="px-4 py-3 text-xs font-semibold text-[#667085] uppercase tracking-wider">
                Step
              </div>
              <div className="px-4 py-3 text-xs font-semibold text-[#667085] uppercase tracking-wider">
                Action
              </div>
              <div className="px-4 py-3 text-xs font-semibold text-[#667085] uppercase tracking-wider">
                Description
              </div>
              <div className="px-4 py-3 text-xs font-semibold text-[#667085] uppercase tracking-wider text-center">
                Screenshot
              </div>
              <div className="px-4 py-3 text-xs font-semibold text-[#667085] uppercase tracking-wider text-center">
                Status
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-border">
              {testData.stepResults.map((step) => (
                <div
                  key={step.id}
                  className="grid grid-cols-[60px_1fr_1fr_100px_100px] hover:bg-[#f9f9f9]/50 transition-colors"
                >
                  <div className="px-4 py-4 flex items-center">
                    <span className="text-sm font-medium text-[#1f2937]">
                      {step.stepNumber}
                    </span>
                  </div>
                  <div className="px-4 py-4 flex items-center">
                    <span className="inline-flex px-2 py-0.5 text-xs font-medium bg-[#f4f4f5] text-[#667085] rounded">
                      {step.action}
                    </span>
                  </div>
                  <div className="px-4 py-4 flex items-center">
                    <span className="text-sm text-[#667085]">{step.description}</span>
                  </div>
                  <div className="px-4 py-4 flex items-center justify-center">
                    <button
                      onClick={() =>
                        setSelectedScreenshot({
                          url: step.screenshotUrl,
                          stepNumber: step.stepNumber,
                          action: step.description,
                        })
                      }
                      className="flex items-center justify-center size-8 rounded-lg hover:bg-[#f4f4f5] text-[#667085] transition-colors"
                    >
                      <Eye className="size-4" />
                    </button>
                  </div>
                  <div className="px-4 py-4 flex items-center justify-center">
                    {step.status === "PASSED" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-[#16a34a] bg-[#dcfce7] rounded-full">
                        <CheckCircle2 className="size-3" />
                        Passed
                      </span>
                    ) : step.status === "FAILED" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-[#dc2626] bg-[#fee2e2] rounded-full">
                        <XCircle className="size-3" />
                        Failed
                      </span>
                    ) : step.status === "SKIPPED" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-[#667085] bg-[#f4f4f5] rounded-full">
                        Skipped
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-[#667085] bg-[#f4f4f5] rounded-full">
                        Pending
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Error & Network Details (Conditional) */}
        {(hasErrors || hasNetworkActivity) && (
          <section>
            <button
              onClick={() => setIsErrorsExpanded(!isErrorsExpanded)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-colors ${
                hasErrors
                  ? "bg-[#fef3cd] border border-[#ffc107] hover:bg-[#fff3cd]"
                  : "bg-[#f4f4f5] border border-[#e5e5e5] hover:bg-[#ebebeb]"
              }`}
            >
              <div className="flex items-center gap-3">
                {hasErrors ? (
                  <AlertTriangle className="size-5 text-[#856404]" />
                ) : (
                  <Globe className="size-5 text-[#667085]" />
                )}
                <span className={`text-sm font-medium ${hasErrors ? "text-[#856404]" : "text-[#667085]"}`}>
                  {hasErrors
                    ? `${testData.errors.length} error${testData.errors.length !== 1 ? "s" : ""} detected`
                    : `${networkRequests.length} network request${networkRequests.length !== 1 ? "s" : ""} captured`}
                </span>
              </div>
              {isErrorsExpanded ? (
                <ChevronUp className={`size-5 ${hasErrors ? "text-[#856404]" : "text-[#667085]"}`} />
              ) : (
                <ChevronDown className={`size-5 ${hasErrors ? "text-[#856404]" : "text-[#667085]"}`} />
              )}
            </button>

            {isErrorsExpanded && (
              <div className="mt-4 bg-white rounded-xl border border-border overflow-hidden">
                {/* Error Tabs */}
                <div className="flex border-b border-border">
                  <button
                    onClick={() => setActiveErrorTab("console")}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                      activeErrorTab === "console"
                        ? "text-[#6e0699] border-b-2 border-[#6e0699] -mb-px"
                        : "text-[#667085] hover:text-[#1f2937]"
                    }`}
                  >
                    <Terminal className="size-4" />
                    Console Errors
                    <span className="px-1.5 py-0.5 text-xs bg-[#fee2e2] text-[#dc2626] rounded-full">
                      {consoleErrors.length}
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveErrorTab("network")}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                      activeErrorTab === "network"
                        ? "text-[#6e0699] border-b-2 border-[#6e0699] -mb-px"
                        : "text-[#667085] hover:text-[#1f2937]"
                    }`}
                  >
                    <Globe className="size-4" />
                    Network
                    <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                      failedRequests.length > 0
                        ? "bg-[#fee2e2] text-[#dc2626]"
                        : "bg-[#f4f4f5] text-[#667085]"
                    }`}>
                      {networkRequests.length}
                    </span>
                  </button>
                </div>

                {/* Console Errors Tab */}
                {activeErrorTab === "console" && (
                  <div className="divide-y divide-border">
                    {consoleErrors.length === 0 ? (
                      <div className="p-6 text-center text-sm text-[#667085]">
                        No console errors
                      </div>
                    ) : (
                      consoleErrors.map((error) => (
                        <div key={error.id} className="p-4 hover:bg-[#f9f9f9]/50">
                          <div className="flex items-start gap-3">
                            <div className="size-6 rounded-full bg-[#fee2e2] flex items-center justify-center flex-shrink-0">
                              <XCircle className="size-3.5 text-[#dc2626]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-[#1f2937] font-mono break-all">
                                {error.message}
                              </p>
                              <div className="flex items-center gap-3 mt-2">
                                {error.url && (
                                  <span className="text-xs text-[#667085] truncate max-w-[300px]">
                                    {error.url}
                                  </span>
                                )}
                                <span className="text-xs text-[#9ca3af]">
                                  {formatDate(error.timestamp)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Network Tab */}
                {activeErrorTab === "network" && (
                  <div>
                    {networkRequests.length === 0 ? (
                      <div className="p-6 text-center text-sm text-[#667085]">
                        No network requests captured
                      </div>
                    ) : (
                      <>
                        {/* Network Table Header */}
                        <div className="grid grid-cols-[70px_70px_1fr_80px_80px] bg-[#f9fafb] border-b border-border text-xs font-semibold text-[#667085] uppercase tracking-wider">
                          <div className="px-4 py-2">Method</div>
                          <div className="px-4 py-2">Status</div>
                          <div className="px-4 py-2">URL</div>
                          <div className="px-4 py-2 text-right">Size</div>
                          <div className="px-4 py-2 text-right">Time</div>
                        </div>
                        {/* Network Table Body */}
                        <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
                          {networkRequests.map((req) => {
                            const isError = req.failed || (req.status && req.status >= 400);
                            const statusColor = req.failed
                              ? "text-[#dc2626] bg-[#fee2e2]"
                              : req.status && req.status >= 400
                              ? "text-[#dc2626] bg-[#fee2e2]"
                              : req.status && req.status >= 300
                              ? "text-[#ca8a04] bg-[#fef9c3]"
                              : "text-[#16a34a] bg-[#dcfce7]";

                            // Format URL to show only path
                            let displayUrl = req.url;
                            try {
                              const urlObj = new URL(req.url);
                              displayUrl = urlObj.pathname + urlObj.search;
                            } catch {
                              // Keep original URL if parsing fails
                            }

                            // Format size
                            const formatSize = (bytes: number | null) => {
                              if (!bytes) return "-";
                              if (bytes < 1024) return `${bytes} B`;
                              if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
                              return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
                            };

                            return (
                              <div
                                key={req.id}
                                className={`grid grid-cols-[70px_70px_1fr_80px_80px] hover:bg-[#f9f9f9]/50 transition-colors ${
                                  isError ? "bg-[#fef2f2]" : ""
                                }`}
                              >
                                <div className="px-4 py-2.5 flex items-center">
                                  <span className={`text-xs font-semibold ${
                                    req.method === "GET" ? "text-[#16a34a]" :
                                    req.method === "POST" ? "text-[#2563eb]" :
                                    req.method === "PUT" ? "text-[#ca8a04]" :
                                    req.method === "DELETE" ? "text-[#dc2626]" :
                                    "text-[#667085]"
                                  }`}>
                                    {req.method}
                                  </span>
                                </div>
                                <div className="px-4 py-2.5 flex items-center">
                                  <span className={`inline-flex px-1.5 py-0.5 text-xs font-medium rounded ${statusColor}`}>
                                    {req.failed ? "ERR" : req.status || "-"}
                                  </span>
                                </div>
                                <div className="px-4 py-2.5 flex items-center min-w-0">
                                  <span className="text-xs text-[#1f2937] font-mono truncate" title={req.url}>
                                    {displayUrl}
                                  </span>
                                </div>
                                <div className="px-4 py-2.5 flex items-center justify-end">
                                  <span className="text-xs text-[#667085] font-mono">
                                    {formatSize(req.responseSize)}
                                  </span>
                                </div>
                                <div className="px-4 py-2.5 flex items-center justify-end">
                                  <span className={`text-xs font-mono ${
                                    req.duration && req.duration > 1000 ? "text-[#dc2626]" :
                                    req.duration && req.duration > 500 ? "text-[#ca8a04]" :
                                    "text-[#667085]"
                                  }`}>
                                    {req.duration ? `${req.duration}ms` : "-"}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        {/* Summary */}
                        <div className="px-4 py-2 bg-[#f9fafb] border-t border-border flex items-center justify-between text-xs text-[#667085]">
                          <span>{networkRequests.length} requests</span>
                          <span>
                            {failedRequests.length > 0 && (
                              <span className="text-[#dc2626]">{failedRequests.length} failed</span>
                            )}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </section>
        )}
      </main>

      {/* Screenshot Drawer */}
      <ScreenshotDrawer
        isOpen={!!selectedScreenshot}
        onClose={() => setSelectedScreenshot(null)}
        screenshot={selectedScreenshot}
      />

      {/* Verify Fix Modal */}
      <VerifyFixModal
        isOpen={isVerifyModalOpen}
        onClose={() => !isVerifying && setIsVerifyModalOpen(false)}
        onConfirm={handleVerifyFix}
        testName={testData.testFileName || "Test"}
        isRunning={isVerifying}
        progress={verifyProgress}
      />
    </div>
  );
};

export default TestSharePage;
