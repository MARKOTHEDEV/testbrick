import { Plus } from "lucide-react";

interface FolderEmptyStateProps {
  onCreateProject?: () => void;
}

const FolderEmptyState = ({ onCreateProject }: FolderEmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      {/* Illustration */}
      <div className="mb-5">
        <img src="/empty-state.svg" alt="Empty State Illustration" />
      </div>

      {/* Text content */}
      <div className="flex flex-col items-center gap-2.5 text-center mb-5">
        <h2 className="text-2xl font-semibold text-black capitalize">
          Welcome to Your Project!
        </h2>
        <p className="text-lg text-muted-foreground capitalize">
          Get Started By Creating Your First Test
        </p>
      </div>

      {/* Create Project Button */}
      <button
        onClick={onCreateProject}
        className="flex items-center justify-center gap-1.5 h-11 w-[200px] bg-[#f6e2fe] rounded-lg hover:bg-[#f0d4fc] transition-colors"
      >
        <Plus className="size-5 text-primary" strokeWidth={2} />
        <span className="text-primary font-medium text-base capitalize">
          Create Project
        </span>
      </button>
    </div>
  );
};

export default FolderEmptyState;
