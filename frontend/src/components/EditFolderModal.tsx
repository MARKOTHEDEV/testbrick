import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Loader2 } from "lucide-react";
import { FormInput } from "@/components/ui/form-input";
import { Modal } from "@/components/ui/modal";
import type { Folder, UpdateFolderInput } from "@/lib/api";

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

interface EditFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UpdateFolderInput) => Promise<void>;
  folder: Folder | null;
}

const EditFolderModal = ({
  isOpen,
  onClose,
  onSubmit,
  folder,
}: EditFolderModalProps) => {
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

  // Populate form when folder changes or modal opens
  useEffect(() => {
    if (isOpen && folder) {
      reset({
        name: folder.name,
      });
    }
  }, [isOpen, folder, reset]);

  const onFormSubmit = async (data: FormData) => {
    try {
      await onSubmit({
        name: data.name.trim(),
      });
      onClose();
    } catch (err) {
      setError("root", {
        message: err instanceof Error ? err.message : "Failed to update folder",
      });
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="edit folder"
      subtitle="rename your folder"
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
                Updating...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditFolderModal;
