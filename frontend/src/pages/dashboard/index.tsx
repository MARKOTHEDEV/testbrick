import FolderEmptyState from "@/components/ui/FolderEmptyState";

const DashboardPage = () => {
  return (
    <div className="p-6">
      <h1 className="text-xl font-medium text-black capitalize mb-8">
        Project Home
      </h1>
      <FolderEmptyState />
    </div>
  );
};

export default DashboardPage;
