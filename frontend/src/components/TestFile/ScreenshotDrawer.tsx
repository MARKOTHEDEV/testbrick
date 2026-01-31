import { useEffect } from "react";
import { X, Download, ExternalLink } from "lucide-react";

interface ScreenshotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  screenshot: {
    url: string | null;
    stepNumber: number;
    text: string;
  } | null;
}

const ScreenshotDrawer = ({
  isOpen,
  onClose,
  screenshot,
}: ScreenshotDrawerProps) => {
  // Download screenshot as PNG
  const handleDownload = () => {
    if (!screenshot?.url) return;

    const link = document.createElement("a");
    link.href = screenshot.url;
    link.download = `step-${screenshot.stepNumber}-screenshot.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Open in new tab
  const handleOpenNewTab = () => {
    if (!screenshot?.url) return;
    window.open(screenshot.url, "_blank");
  };

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
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
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-[500px] bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h3 className="text-base font-semibold text-[#1f2937]">
              Step {screenshot.stepNumber} Screenshot
            </h3>
            <p className="text-sm text-[#667085] mt-0.5">{screenshot.text}</p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center size-9 rounded-lg hover:bg-[#f4f4f5] text-[#667085] transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Toolbar */}
        {screenshot.url && (
          <div className="flex items-center gap-2 px-6 py-3 border-b border-border bg-[#f9fafb]">
            <button
              onClick={handleOpenNewTab}
              className="flex items-center justify-center size-8 rounded-md hover:bg-white text-[#667085] transition-colors"
              title="Open in new tab"
            >
              <ExternalLink className="size-4" />
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center justify-center size-8 rounded-md hover:bg-white text-[#667085] transition-colors"
              title="Download"
            >
              <Download className="size-4" />
            </button>
          </div>
        )}

        {/* Screenshot Content */}
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
                  <p className="text-xs text-[#9ca3af] mt-1">
                    Run the test to capture screenshots
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
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

export default ScreenshotDrawer;
