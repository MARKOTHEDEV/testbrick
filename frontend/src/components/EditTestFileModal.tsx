import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Loader2 } from "lucide-react";
import { FormInput } from "@/components/ui/form-input";
import { FormTextarea } from "@/components/ui/form-textarea";
import { Modal } from "@/components/ui/modal";
import type { TestFile, UpdateTestFileInput } from "@/lib/api";

interface FormData {
  name: string;
  description: string;
}

const schema: yup.ObjectSchema<FormData> = yup.object({
  name: yup
    .string()
    .required("Test file name is required")
    .min(1, "Name must be at least 1 character")
    .max(200, "Name must be less than 200 characters"),
  description: yup.string().max(1000, "Description must be less than 1000 characters").default(""),
});

interface EditTestFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UpdateTestFileInput) => Promise<void>;
  testFile: TestFile | null;
}

const EditTestFileModal = ({
  isOpen,
  onClose,
  onSubmit,
  testFile,
}: EditTestFileModalProps) => {
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
      description: "",
    },
  });

  // Populate form when testFile changes or modal opens
  useEffect(() => {
    if (isOpen && testFile) {
      reset({
        name: testFile.name,
        description: testFile.description || "",
      });
    }
  }, [isOpen, testFile, reset]);

  const onFormSubmit = async (data: FormData) => {
    try {
      await onSubmit({
        name: data.name.trim(),
        description: data.description?.trim() || undefined,
      });
      onClose();
    } catch (err) {
      setError("root", {
        message: err instanceof Error ? err.message : "Failed to update test file",
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
      title="edit test file"
      subtitle="update test file details"
      disabled={isSubmitting}
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-[18px]">
        {errors.root && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {errors.root.message}
          </div>
        )}

        <FormInput
          label="Test Name"
          placeholder="Login Flow Test"
          required
          disabled={isSubmitting}
          error={errors.name?.message}
          {...register("name")}
        />

        <FormTextarea
          label="Description"
          placeholder="Tests the complete login flow including validation errors"
          disabled={isSubmitting}
          error={errors.description?.message}
          rows={3}
          {...register("description")}
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

export default EditTestFileModal;
