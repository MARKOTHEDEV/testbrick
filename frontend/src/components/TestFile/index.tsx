import { useState } from "react";
import { ArrowLeft, Play, MoreHorizontal, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import TestFileStoryMode from "./TestFileStoryMode";
import TestFileBlockMode from "./TestFileBlockMode";
import ShareModal from "./ShareModal";

// Mock data for test steps
export const mockTestSteps = [
  {
    id: "1",
    stepNumber: 1,
    text: "Navigate to login page",
    expectedResult:
      "Login page loads successfully with all form elements visible",
    screenshot: "/screenshots/step-1.png",
    status: "passed" as const,
  },
  {
    id: "2",
    stepNumber: 2,
    text: "Enter valid email address",
    expectedResult: "Email field accepts input and shows no validation errors",
    screenshot: "/screenshots/step-2.png",
    status: "passed" as const,
  },
  {
    id: "3",
    stepNumber: 3,
    text: "Enter valid password",
    expectedResult: "Password field accepts input with masked characters",
    screenshot: "/screenshots/step-3.png",
    status: "passed" as const,
  },
  {
    id: "4",
    stepNumber: 4,
    text: "Click login button",
    expectedResult: "User is redirected to dashboard with welcome message",
    screenshot: "/screenshots/step-4.png",
    status: "failed" as const,
  },
  {
    id: "5",
    stepNumber: 5,
    text: "Verify dashboard elements",
    expectedResult: "All dashboard widgets and navigation items are visible",
    screenshot: "/screenshots/step-5.png",
    status: "passed" as const,
  },
];

export type TestStep = (typeof mockTestSteps)[number];

interface TestFileProps {
  fileName?: string;
}

const TestFile = ({ fileName = "Demo Daten" }: TestFileProps) => {
  const navigate = useNavigate();
  const [activeMode, setActiveMode] = useState<"story" | "block">("story");
  const [steps, setSteps] = useState(mockTestSteps);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const passedCount = steps.filter((s) => s.status === "passed").length;
  const failedCount = steps.filter((s) => s.status === "failed").length;
  const passRate = Math.round((passedCount / steps.length) * 100);

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
              {steps.length} steps • Last run 2 hours ago
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Stats */}
          <div className="flex items-center gap-4 px-4 py-2 bg-[#f9f9f9] rounded-lg">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-[#22c55e]" />
              <span className="text-sm text-[#667085]">
                {passedCount} Passed
              </span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-[#ef4444]" />
              <span className="text-sm text-[#667085]">
                {failedCount} Failed
              </span>
            </div>
            <div className="h-4 w-px bg-border" />
            <span className="text-sm font-medium text-[#1f2937]">
              {passRate}% Pass Rate
            </span>
          </div>

          {/* Run Button */}
          <button className="flex items-center gap-2 h-10 px-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
            <Play className="size-4" fill="currentColor" />
            <span className="font-medium">Run Test</span>
          </button>
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
        {activeMode === "story" ? (
          <TestFileStoryMode steps={steps} onUpdateStep={handleUpdateStep} />
        ) : (
          <TestFileBlockMode steps={steps} />
        )}
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        testName={fileName}
      />
    </div>
  );
};

export default TestFile;
