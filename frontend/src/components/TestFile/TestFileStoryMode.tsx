import { useState } from "react";
import { Eye, Check, X, Pencil } from "lucide-react";
import type { TestStep } from "./index";
import ScreenshotDrawer from "./ScreenshotDrawer";

interface TestFileStoryModeProps {
  steps: TestStep[];
  onUpdateStep: (
    stepId: string,
    field: "text" | "expectedResult",
    value: string
  ) => void;
}

const EditableCell = ({
  value,
  onSave,
  placeholder,
}: {
  value: string;
  onSave: (value: string) => void;
  placeholder?: string;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleSave = () => {
    onSave(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-start gap-2">
        <textarea
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 min-h-[60px] p-2 text-sm text-[#1f2937] bg-white border border-primary/30 rounded-md outline-none focus:border-primary resize-none"
          autoFocus
        />
        <div className="flex flex-col gap-1">
          <button
            onClick={handleSave}
            className="p-1.5 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            <Check className="size-3.5" />
          </button>
          <button
            onClick={handleCancel}
            className="p-1.5 bg-[#f4f4f5] text-[#667085] rounded-md hover:bg-[#e4e4e7] transition-colors"
          >
            <X className="size-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative">
      <p className="text-sm text-[#667085] leading-relaxed pr-8">
        {value || <span className="italic text-[#a1a1aa]">{placeholder}</span>}
      </p>
      <button
        onClick={() => setIsEditing(true)}
        className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 text-[#667085] hover:text-primary transition-all"
      >
        <Pencil className="size-3.5" />
      </button>
    </div>
  );
};

const StatusBadge = ({ status }: { status: "passed" | "failed" | "pending" }) => {
  if (status === "passed") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#dcfce7] text-[#16a34a] text-xs font-medium rounded-full">
        <Check className="size-3" />
        Passed
      </span>
    );
  }

  if (status === "failed") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#fee2e2] text-[#dc2626] text-xs font-medium rounded-full">
        <X className="size-3" />
        Failed
      </span>
    );
  }

  // pending status
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#f4f4f5] text-[#71717a] text-xs font-medium rounded-full">
      Pending
    </span>
  );
};

const TestFileStoryMode = ({ steps, onUpdateStep }: TestFileStoryModeProps) => {
  const [selectedScreenshot, setSelectedScreenshot] = useState<{
    url: string | null;
    stepNumber: number;
    text: string;
  } | null>(null);

  return (
    <>
      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-[60px_1fr_1fr_100px_100px] gap-4 px-6 py-4 bg-[#f9fafb] border-b border-border">
          <div className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider">
            Step
          </div>
          <div className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider">
            Action
          </div>
          <div className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider">
            Expected Result
          </div>
          <div className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider text-center">
            Screenshot
          </div>
          <div className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider text-center">
            Status
          </div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-border">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`grid grid-cols-[60px_1fr_1fr_100px_100px] gap-4 px-6 py-5 hover:bg-[#f9fafb]/50 transition-colors ${
                step.status === "failed" ? "bg-[#fef2f2]/30" : ""
              }`}
            >
              {/* Step Number */}
              <div className="flex items-start">
                <span
                  className={`inline-flex items-center justify-center size-8 rounded-lg text-sm font-semibold ${
                    step.status === "passed"
                      ? "bg-[#f0fdf4] text-[#16a34a]"
                      : "bg-[#fef2f2] text-[#dc2626]"
                  }`}
                >
                  {step.stepNumber}
                </span>
              </div>

              {/* Action Text */}
              <div className="flex items-start">
                <EditableCell
                  value={step.text}
                  onSave={(value) => onUpdateStep(step.id, "text", value)}
                  placeholder="Enter action description..."
                />
              </div>

              {/* Expected Result */}
              <div className="flex items-start">
                <EditableCell
                  value={step.expectedResult}
                  onSave={(value) =>
                    onUpdateStep(step.id, "expectedResult", value)
                  }
                  placeholder="Enter expected result..."
                />
              </div>

              {/* Screenshot */}
              <div className="flex items-start justify-center">
                <button
                  onClick={() =>
                    setSelectedScreenshot({
                      url: step.screenshot,
                      stepNumber: step.stepNumber,
                      text: step.text,
                    })
                  }
                  className="flex items-center justify-center size-9 rounded-lg bg-[#f4f4f5] hover:bg-primary/10 hover:text-primary text-[#667085] transition-colors"
                >
                  <Eye className="size-4" />
                </button>
              </div>

              {/* Status */}
              <div className="flex items-start justify-center">
                <StatusBadge status={step.status} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Screenshot Drawer */}
      <ScreenshotDrawer
        isOpen={!!selectedScreenshot}
        onClose={() => setSelectedScreenshot(null)}
        screenshot={selectedScreenshot}
      />
    </>
  );
};

export default TestFileStoryMode;
