import { X } from "lucide-react";
import { ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  disabled?: boolean;
}

const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  disabled = false,
}: ModalProps) => {
  if (!isOpen) return null;

  const handleBackdropClick = () => {
    if (!disabled) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleBackdropClick}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-[697px] mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-3 pb-5">
          <div className="flex flex-col gap-2">
            <h2 className="text-[20px] font-medium text-[#667085] capitalize">
              {title}
            </h2>
            {subtitle && (
              <p className="text-[14px] font-normal text-[#6b7280]">
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            disabled={disabled}
            className="flex items-center justify-center size-[30px] rounded-md hover:bg-[#f4f4f5] transition-colors disabled:opacity-50"
          >
            <X className="size-6 text-[#667085]" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-8">{children}</div>
      </div>
    </div>
  );
};

export { Modal };
