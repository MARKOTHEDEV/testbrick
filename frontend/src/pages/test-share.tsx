import { useState, useEffect } from "react";
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
  ZoomIn,
  ZoomOut,
  ExternalLink,
  Clock,
  User,
  Calendar,
} from "lucide-react";

// Types
type TestStep = {
  id: string;
  stepNumber: number;
  action: string;
  expectedResult: string;
  screenshot: string;
  status: "passed" | "failed";
};

type ConsoleError = {
  id: string;
  type: "error" | "warning";
  message: string;
  source: string;
  line: number;
  timestamp: string;
};

type NetworkError = {
  id: string;
  method: string;
  url: string;
  status: number;
  statusText: string;
  duration: string;
  timestamp: string;
};

type TestData = {
  id: string;
  name: string;
  videoUrl: string;
  duration: string;
  createdAt: string;
  createdBy: string;
  status: "passed" | "failed";
  steps: TestStep[];
  consoleErrors: ConsoleError[];
  networkErrors: NetworkError[];
};

// Mock data
const mockTestData: TestData = {
  id: "test-123",
  name: "User Login Flow Test",
  videoUrl: "/test-recording.mp4",
  duration: "2:34",
  createdAt: "Jan 28, 2025",
  createdBy: "John Doe",
  status: "failed",
  steps: [
    {
      id: "1",
      stepNumber: 1,
      action: "Navigate to login page",
      expectedResult: "Login page should load with email and password fields",
      screenshot: "/screenshots/step-1.png",
      status: "passed",
    },
    {
      id: "2",
      stepNumber: 2,
      action: "Enter valid email address",
      expectedResult: "Email field should accept the input without errors",
      screenshot: "/screenshots/step-2.png",
      status: "passed",
    },
    {
      id: "3",
      stepNumber: 3,
      action: "Enter valid password",
      expectedResult: "Password field should mask the input",
      screenshot: "/screenshots/step-3.png",
      status: "passed",
    },
    {
      id: "4",
      stepNumber: 4,
      action: "Click login button",
      expectedResult: "User should be redirected to dashboard",
      screenshot: "/screenshots/step-4.png",
      status: "failed",
    },
    {
      id: "5",
      stepNumber: 5,
      action: "Verify dashboard elements",
      expectedResult: "Dashboard should show user name and navigation menu",
      screenshot: "/screenshots/step-5.png",
      status: "failed",
    },
  ],
  consoleErrors: [
    {
      id: "ce-1",
      type: "error",
      message: "Uncaught TypeError: Cannot read property 'user' of undefined",
      source: "auth.js",
      line: 142,
      timestamp: "00:01:45",
    },
    {
      id: "ce-2",
      type: "error",
      message: "Failed to load resource: the server responded with a status of 401",
      source: "api.js",
      line: 58,
      timestamp: "00:01:46",
    },
    {
      id: "ce-3",
      type: "warning",
      message: "React does not recognize the `isLoading` prop on a DOM element",
      source: "Button.tsx",
      line: 23,
      timestamp: "00:00:12",
    },
  ],
  networkErrors: [
    {
      id: "ne-1",
      method: "POST",
      url: "/api/auth/login",
      status: 401,
      statusText: "Unauthorized",
      duration: "234ms",
      timestamp: "00:01:45",
    },
    {
      id: "ne-2",
      method: "GET",
      url: "/api/user/profile",
      status: 500,
      statusText: "Internal Server Error",
      duration: "1.2s",
      timestamp: "00:01:46",
    },
  ],
};

// Screenshot Drawer Component (inline for share page)
const ScreenshotDrawer = ({
  isOpen,
  onClose,
  screenshot,
}: {
  isOpen: boolean;
  onClose: () => void;
  screenshot: { url: string; stepNumber: number; action: string } | null;
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

        <div className="flex items-center gap-2 px-6 py-3 border-b border-border bg-[#f9fafb]">
          <button className="flex items-center justify-center size-8 rounded-md hover:bg-white text-[#667085] transition-colors">
            <ZoomIn className="size-4" />
          </button>
          <button className="flex items-center justify-center size-8 rounded-md hover:bg-white text-[#667085] transition-colors">
            <ZoomOut className="size-4" />
          </button>
          <div className="h-4 w-px bg-border mx-1" />
          <button className="flex items-center justify-center size-8 rounded-md hover:bg-white text-[#667085] transition-colors">
            <ExternalLink className="size-4" />
          </button>
          <button className="flex items-center justify-center size-8 rounded-md hover:bg-white text-[#667085] transition-colors">
            <Download className="size-4" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6 bg-[#f4f4f5]">
          <div className="bg-white rounded-lg border border-border shadow-sm overflow-hidden">
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
                <p className="text-sm text-[#6b7280]">Screenshot Preview</p>
                <p className="text-xs text-[#9ca3af] mt-1">{screenshot.url}</p>
              </div>
            </div>
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
const VideoPlayer = ({ duration }: { duration: string }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress] = useState(0);

  return (
    <div className="bg-[#1f2937] rounded-xl overflow-hidden">
      {/* Video Area */}
      <div className="aspect-video bg-black flex items-center justify-center relative">
        {/* Placeholder for actual video */}
        <div className="text-center">
          <div className="size-20 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center cursor-pointer hover:bg-white/20 transition-colors"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? (
              <Pause className="size-8 text-white" />
            ) : (
              <Play className="size-8 text-white ml-1" />
            )}
          </div>
          <p className="text-white/60 text-sm">Test Recording</p>
        </div>

        {/* Progress bar overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
          <div
            className="h-full bg-[#6e0699] transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="px-4 py-3 flex items-center gap-4 bg-[#111827]">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="flex items-center justify-center size-8 rounded-md hover:bg-white/10 text-white transition-colors"
        >
          {isPlaying ? (
            <Pause className="size-4" />
          ) : (
            <Play className="size-4" />
          )}
        </button>

        {/* Progress slider */}
        <div className="flex-1 flex items-center gap-3">
          <span className="text-xs text-white/60 font-mono w-10">0:00</span>
          <div className="flex-1 h-1 bg-white/20 rounded-full cursor-pointer">
            <div
              className="h-full bg-[#6e0699] rounded-full relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 size-3 bg-white rounded-full shadow-sm" />
            </div>
          </div>
          <span className="text-xs text-white/60 font-mono w-10">{duration}</span>
        </div>

        <button
          onClick={() => setIsMuted(!isMuted)}
          className="flex items-center justify-center size-8 rounded-md hover:bg-white/10 text-white transition-colors"
        >
          {isMuted ? (
            <VolumeX className="size-4" />
          ) : (
            <Volume2 className="size-4" />
          )}
        </button>

        <button className="flex items-center justify-center size-8 rounded-md hover:bg-white/10 text-white transition-colors">
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
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  testName: string;
}) => {
  const [isRunning, setIsRunning] = useState(false);

  const handleConfirm = () => {
    setIsRunning(true);
    // Simulate test run
    setTimeout(() => {
      setIsRunning(false);
      onConfirm();
    }, 3000);
  };

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
              <RotateCcw className={`size-6 text-[#6e0699] ${isRunning ? 'animate-spin' : ''}`} />
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
                onClick={handleConfirm}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-[#6e0699] rounded-lg hover:bg-[#5a0580] transition-colors"
              >
                Run Test
              </button>
            </div>
          )}

          {isRunning && (
            <div className="px-6 pb-6">
              <div className="h-2 bg-[#f4f4f5] rounded-full overflow-hidden">
                <div className="h-full bg-[#6e0699] rounded-full animate-pulse" style={{ width: '60%' }} />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

const TestSharePage = () => {
  const [testData] = useState<TestData>(mockTestData);
  const [selectedScreenshot, setSelectedScreenshot] = useState<{
    url: string;
    stepNumber: number;
    action: string;
  } | null>(null);
  const [isErrorsExpanded, setIsErrorsExpanded] = useState(false);
  const [activeErrorTab, setActiveErrorTab] = useState<"console" | "network">("console");
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);

  const hasErrors =
    testData.consoleErrors.length > 0 || testData.networkErrors.length > 0;
  const passedSteps = testData.steps.filter((s) => s.status === "passed").length;
  const failedSteps = testData.steps.filter((s) => s.status === "failed").length;

  const handleVerifyFix = () => {
    setIsVerifyModalOpen(false);
    // In real app, this would trigger test re-run and show results
    alert("Test queued for verification! You'll receive a notification when it's complete.");
  };

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
                  {testData.name}
                </h1>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="flex items-center gap-1 text-xs text-[#667085]">
                    <User className="size-3" />
                    {testData.createdBy}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-[#667085]">
                    <Calendar className="size-3" />
                    {testData.createdAt}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-[#667085]">
                    <Clock className="size-3" />
                    {testData.duration}
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
          <h2 className="text-sm font-semibold text-[#1f2937] mb-4">
            Test Recording
          </h2>
          <VideoPlayer duration={testData.duration} />
        </section>

        {/* Steps Table */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-[#1f2937] mb-4">
            Test Steps
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
                Expected Result
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
              {testData.steps.map((step) => (
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
                    <span className="text-sm text-[#1f2937]">{step.action}</span>
                  </div>
                  <div className="px-4 py-4 flex items-center">
                    <span className="text-sm text-[#667085]">
                      {step.expectedResult}
                    </span>
                  </div>
                  <div className="px-4 py-4 flex items-center justify-center">
                    <button
                      onClick={() =>
                        setSelectedScreenshot({
                          url: step.screenshot,
                          stepNumber: step.stepNumber,
                          action: step.action,
                        })
                      }
                      className="flex items-center justify-center size-8 rounded-lg hover:bg-[#f4f4f5] text-[#667085] transition-colors"
                    >
                      <Eye className="size-4" />
                    </button>
                  </div>
                  <div className="px-4 py-4 flex items-center justify-center">
                    {step.status === "passed" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-[#16a34a] bg-[#dcfce7] rounded-full">
                        <CheckCircle2 className="size-3" />
                        Passed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-[#dc2626] bg-[#fee2e2] rounded-full">
                        <XCircle className="size-3" />
                        Failed
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Error Details (Conditional) */}
        {hasErrors && (
          <section>
            <button
              onClick={() => setIsErrorsExpanded(!isErrorsExpanded)}
              className="w-full flex items-center justify-between px-4 py-3 bg-[#fef3cd] border border-[#ffc107] rounded-xl text-left hover:bg-[#fff3cd] transition-colors"
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className="size-5 text-[#856404]" />
                <span className="text-sm font-medium text-[#856404]">
                  {testData.consoleErrors.length + testData.networkErrors.length} errors detected during test execution
                </span>
              </div>
              {isErrorsExpanded ? (
                <ChevronUp className="size-5 text-[#856404]" />
              ) : (
                <ChevronDown className="size-5 text-[#856404]" />
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
                      {testData.consoleErrors.length}
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
                    Network Errors
                    <span className="px-1.5 py-0.5 text-xs bg-[#fee2e2] text-[#dc2626] rounded-full">
                      {testData.networkErrors.length}
                    </span>
                  </button>
                </div>

                {/* Console Errors Tab */}
                {activeErrorTab === "console" && (
                  <div className="divide-y divide-border">
                    {testData.consoleErrors.map((error) => (
                      <div key={error.id} className="p-4 hover:bg-[#f9f9f9]/50">
                        <div className="flex items-start gap-3">
                          <div
                            className={`size-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                              error.type === "error"
                                ? "bg-[#fee2e2]"
                                : "bg-[#fef3c7]"
                            }`}
                          >
                            {error.type === "error" ? (
                              <XCircle className="size-3.5 text-[#dc2626]" />
                            ) : (
                              <AlertTriangle className="size-3.5 text-[#d97706]" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-[#1f2937] font-mono break-all">
                              {error.message}
                            </p>
                            <div className="flex items-center gap-3 mt-2">
                              <span className="text-xs text-[#667085]">
                                {error.source}:{error.line}
                              </span>
                              <span className="text-xs text-[#9ca3af]">
                                {error.timestamp}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Network Errors Tab */}
                {activeErrorTab === "network" && (
                  <div className="divide-y divide-border">
                    {testData.networkErrors.map((error) => (
                      <div key={error.id} className="p-4 hover:bg-[#f9f9f9]/50">
                        <div className="flex items-start gap-3">
                          <div className="size-6 rounded-full bg-[#fee2e2] flex items-center justify-center flex-shrink-0">
                            <Globe className="size-3.5 text-[#dc2626]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="px-1.5 py-0.5 text-xs font-mono font-medium bg-[#f4f4f5] text-[#667085] rounded">
                                {error.method}
                              </span>
                              <span className="text-sm text-[#1f2937] font-mono truncate">
                                {error.url}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 mt-2">
                              <span className="px-1.5 py-0.5 text-xs font-medium bg-[#fee2e2] text-[#dc2626] rounded">
                                {error.status} {error.statusText}
                              </span>
                              <span className="text-xs text-[#667085]">
                                {error.duration}
                              </span>
                              <span className="text-xs text-[#9ca3af]">
                                {error.timestamp}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
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
        onClose={() => setIsVerifyModalOpen(false)}
        onConfirm={handleVerifyFix}
        testName={testData.name}
      />
    </div>
  );
};

export default TestSharePage;
