import { useState } from "react";
import { X, Copy, Check, Mail } from "lucide-react";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  testName: string;
}

const ShareModal = ({ isOpen, onClose, testName }: ShareModalProps) => {
  const [copied, setCopied] = useState(false);

  // Generate a unique share URL (in production, this would come from an API)
  const shareUrl = `https://testbloc.app/share/${btoa(testName).slice(0, 12)}`;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Check out this test: ${testName}`);
    const body = encodeURIComponent(
      `I wanted to share this test with you:\n\n${testName}\n\nView it here: ${shareUrl}`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const handleTwitterShare = () => {
    const text = encodeURIComponent(
      `Check out this test: ${testName} ${shareUrl}`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
  };

  const handleLinkedInShare = () => {
    const url = encodeURIComponent(shareUrl);
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      "_blank"
    );
  };

  const handleSlackShare = () => {
    const text = encodeURIComponent(`Check out this test: ${testName} - ${shareUrl}`);
    window.open(`https://slack.com/share?text=${text}`, "_blank");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-[#1f2937]">Share Test</h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center size-8 rounded-lg hover:bg-[#f4f4f5] transition-colors"
          >
            <X className="size-5 text-[#667085]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Copy URL Section */}
          <div>
            <label className="block text-sm font-medium text-[#1f2937] mb-2">
              Share link
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 px-3 py-2 bg-[#f9f9f9] border border-border rounded-lg text-sm text-[#667085] truncate">
                {shareUrl}
              </div>
              <button
                onClick={handleCopyUrl}
                className="flex items-center justify-center size-10 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                {copied ? (
                  <Check className="size-4" />
                ) : (
                  <Copy className="size-4" />
                )}
              </button>
            </div>
            {copied && (
              <p className="text-sm text-[#22c55e] mt-1">Copied to clipboard!</p>
            )}
          </div>

          {/* Social Sharing */}
          <div>
            <label className="block text-sm font-medium text-[#1f2937] mb-3">
              Share via
            </label>
            <div className="grid grid-cols-4 gap-3">
              {/* Email */}
              <button
                onClick={handleEmailShare}
                className="flex flex-col items-center gap-2 p-3 rounded-lg border border-border hover:bg-[#f9f9f9] transition-colors"
              >
                <div className="flex items-center justify-center size-10 bg-[#667085] rounded-full">
                  <Mail className="size-5 text-white" />
                </div>
                <span className="text-xs text-[#667085]">Email</span>
              </button>

              {/* Twitter/X */}
              <button
                onClick={handleTwitterShare}
                className="flex flex-col items-center gap-2 p-3 rounded-lg border border-border hover:bg-[#f9f9f9] transition-colors"
              >
                <div className="flex items-center justify-center size-10 bg-black rounded-full">
                  <svg
                    className="size-5 text-white"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </div>
                <span className="text-xs text-[#667085]">X</span>
              </button>

              {/* LinkedIn */}
              <button
                onClick={handleLinkedInShare}
                className="flex flex-col items-center gap-2 p-3 rounded-lg border border-border hover:bg-[#f9f9f9] transition-colors"
              >
                <div className="flex items-center justify-center size-10 bg-[#0A66C2] rounded-full">
                  <svg
                    className="size-5 text-white"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </div>
                <span className="text-xs text-[#667085]">LinkedIn</span>
              </button>

              {/* Slack */}
              <button
                onClick={handleSlackShare}
                className="flex flex-col items-center gap-2 p-3 rounded-lg border border-border hover:bg-[#f9f9f9] transition-colors"
              >
                <div className="flex items-center justify-center size-10 bg-[#4A154B] rounded-full">
                  <svg
                    className="size-5 text-white"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
                  </svg>
                </div>
                <span className="text-xs text-[#667085]">Slack</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
