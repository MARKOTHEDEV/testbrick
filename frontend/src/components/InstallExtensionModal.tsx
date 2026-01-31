import { X, Chrome, ExternalLink, RefreshCw } from "lucide-react";
import { getExtensionStoreUrl } from "@/hooks/useRecorder";

interface InstallExtensionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRetryCheck: () => void;
}

const InstallExtensionModal = ({
  isOpen,
  onClose,
  onRetryCheck,
}: InstallExtensionModalProps) => {
  if (!isOpen) return null;

  const extensionUrl = getExtensionStoreUrl();

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
          <h2 className="text-lg font-semibold text-[#1f2937]">
            Install Browser Extension
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#f9f9f9] rounded-lg transition-colors"
          >
            <X className="size-5 text-[#667085]" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-primary/20 rounded-2xl flex items-center justify-center">
              <Chrome className="size-10 text-primary" />
            </div>
          </div>

          <p className="text-center text-[#667085] mb-6">
            To record browser interactions, you need to install the TestBloc
            Chrome extension. It allows us to capture your actions securely.
          </p>

          <div className="space-y-3">
            <a
              href={extensionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full h-11 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              <Chrome className="size-5" />
              Install Extension
              <ExternalLink className="size-4" />
            </a>

            <button
              onClick={onRetryCheck}
              className="flex items-center justify-center gap-2 w-full h-11 border border-border text-[#667085] rounded-lg hover:bg-[#f9f9f9] transition-colors font-medium"
            >
              <RefreshCw className="size-4" />
              I've installed it, check again
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#f9f9f9] border-t border-border">
          <p className="text-xs text-[#667085] text-center">
            The extension is open source and only activates when you click "Record".
            <br />
            No data is collected when you're not recording.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InstallExtensionModal;
