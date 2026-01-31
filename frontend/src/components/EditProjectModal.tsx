import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Loader2 } from "lucide-react";
import { FormInput } from "@/components/ui/form-input";
import { FormTextarea } from "@/components/ui/form-textarea";
import { Modal } from "@/components/ui/modal";
import type { Project, UpdateProjectInput } from "@/lib/api";

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

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UpdateProjectInput) => Promise<void>;
  project: Project | null;
}

const EditProjectModal = ({
  isOpen,
  onClose,
  onSubmit,
  project,
}: EditProjectModalProps) => {
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

  // Populate form when project changes or modal opens
  useEffect(() => {
    if (isOpen && project) {
      reset({
        name: project.name,
        baseUrl: project.baseUrl,
        description: project.description || "",
      });
    }
  }, [isOpen, project, reset]);

  const onFormSubmit = async (data: FormData) => {
    try {
      await onSubmit({
        name: data.name.trim(),
        baseUrl: data.baseUrl.trim(),
        description: data.description?.trim() || undefined,
      });
      onClose();
    } catch (err) {
      setError("root", {
        message: err instanceof Error ? err.message : "Failed to update project",
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
      title="edit project"
      subtitle="update your project details"
      disabled={isSubmitting}
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-[18px]">
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

export default EditProjectModal;
