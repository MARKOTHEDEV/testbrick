import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { X, Loader2 } from "lucide-react";
import { FormInput } from "@/components/ui/form-input";
import { FormTextarea } from "@/components/ui/form-textarea";
import type { CreateProjectInput } from "@/lib/api";

interface FormData {
  name: string;
  baseUrl: string;
  description?: string;
}

const schema: yup.ObjectSchema<FormData> = yup.object({
  name: yup
    .string()
    .required("Project name is required")
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  baseUrl: yup
    .string()
    .required("Base URL is required")
    .url("Please enter a valid URL (e.g., https://example.com)"),
  description: yup
    .string()
    .max(500, "Description must be less than 500 characters"),
});

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProjectInput) => Promise<void>;
}

const CreateProjectModal = ({
  isOpen,
  onClose,
  onSubmit,
}: CreateProjectModalProps) => {
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
      baseUrl: "",
      description: "",
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
        baseUrl: data.baseUrl.trim(),
        description: data.description?.trim() || undefined,
      });
      reset();
      onClose();
    } catch (err) {
      setError("root", {
        message: err instanceof Error ? err.message : "Failed to create project",
      });
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      reset();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-[#1f2937]">
            Create New Project
          </h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex items-center justify-center size-8 rounded-lg hover:bg-[#f4f4f5] transition-colors disabled:opacity-50"
          >
            <X className="size-5 text-[#667085]" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-4">
          {errors.root && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {errors.root.message}
            </div>
          )}

          <FormInput
            label="Project Name"
            placeholder="My E-commerce Tests"
            required
            disabled={isSubmitting}
            error={errors.name?.message}
            {...register("name")}
          />

          <FormInput
            label="Base URL"
            type="url"
            placeholder="https://example.com"
            required
            disabled={isSubmitting}
            error={errors.baseUrl?.message}
            hint="The starting URL for your test recordings"
            {...register("baseUrl")}
          />

          <FormTextarea
            label="Description"
            placeholder="Optional description for your project..."
            rows={3}
            disabled={isSubmitting}
            error={errors.description?.message}
            {...register("description")}
          />

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 text-sm font-medium text-[#667085] hover:bg-[#f9f9f9] rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Project"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectModal;
