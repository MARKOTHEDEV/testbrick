import { Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  variant?: "danger" | "warning" | "default";
}

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isLoading = false,
  variant = "default",
}: ConfirmDialogProps) => {
  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  const confirmButtonClasses = {
    danger: "bg-red-500 hover:bg-red-600",
    warning: "bg-amber-500 hover:bg-amber-600",
    default: "bg-primary hover:bg-primary/90",
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      disabled={isLoading}
    >
      <div className="space-y-6">
        <p className="text-sm text-[#667085]">{message}</p>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1 px-4 py-[17px] text-[16px] font-normal bg-[#f9f9f9] hover:bg-[#f0f0f0] rounded-xl transition-colors disabled:opacity-50"
          >
            <span className="text-[#667085]">{cancelLabel}</span>
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-[17px] text-[16px] font-normal text-white rounded-xl transition-colors disabled:opacity-50 ${confirmButtonClasses[variant]}`}
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Processing...
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};
