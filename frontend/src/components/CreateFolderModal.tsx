import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Loader2 } from "lucide-react";
import { FormInput } from "@/components/ui/form-input";
import { Modal } from "@/components/ui/modal";
import type { CreateFolderInput } from "@/lib/api";

interface FormData {
  name: string;
}

const schema: yup.ObjectSchema<FormData> = yup.object({
  name: yup
    .string()
    .required("Folder name is required")
    .min(1, "Name must be at least 1 character")
    .max(100, "Name must be less than 100 characters"),
});

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateFolderInput) => Promise<void>;
}

const CreateFolderModal = ({
  isOpen,
  onClose,
  onSubmit,
}: CreateFolderModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
    },
  });

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  const onFormSubmit = async (data: FormData) => {
    try {
      await onSubmit({
        name: data.name.trim(),
      });
      reset();
      onClose();
    } catch (err) {
      setError("root", {
        message: err instanceof Error ? err.message : "Failed to create folder",
      });
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      reset();
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="create folder"
      subtitle="organize your test files"
      disabled={isSubmitting}
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-[18px]">
        {errors.root && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {errors.root.message}
          </div>
        )}

        <FormInput
          label="Folder Name"
          placeholder="Authentication Tests"
          required
          disabled={isSubmitting}
          error={errors.name?.message}
          {...register("name")}
        />

        {/* Actions */}
        <div className="flex items-center gap-2.5 pt-1">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex-1 px-4 py-[17px] text-[16px] font-normal text-white bg-[#ffebf0] hover:bg-[#ffe0e8] rounded-xl transition-colors disabled:opacity-50"
          >
            <span className="text-[#e85387]">Cancel</span>
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-[17px] text-[16px] font-normal text-white bg-primary hover:bg-primary/90 rounded-xl transition-colors disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateFolderModal;
