import { useState, useEffect, useCallback } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { TestBrickLogo } from "@/components/ui/testbrick-logo";
import { UserMenu } from "@/components/user-menu";
import CreateProjectModal from "@/components/CreateProjectModal";
import { useApi } from "@/hooks/useApi";
import type { Project, CreateProjectInput } from "@/lib/api";
import {
  Search,
  Bell,
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  FileText,
  MoreVertical,
  PanelLeftClose,
  PanelLeft,
  Plus,
  Loader2,
} from "lucide-react";

const DashboardTopBar = () => {
  return (
    <header className="flex items-center justify-between h-20 px-6 bg-white border-b border-border">
      {/* Logo */}
      <div className="flex items-center gap-1">
        <TestBrickLogo size={22} className="text-primary" />
        <span className="text-primary font-medium text-[22px] font-['Poppins'] capitalize">
          testBrick.
        </span>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-2 h-11 w-[666px] px-3 bg-[#f9f9f9] rounded-lg">
        <Search className="size-5 text-[#53545c]" />
        <input
          type="text"
          placeholder="Search projects"
          className="flex-1 bg-transparent text-[#53545c] text-sm outline-none placeholder:text-[#53545c] placeholder:capitalize"
        />
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Create Test Button */}

        {/* Notification Bell */}
        <div className="relative">
          <button className="flex items-center justify-center size-[50px] rounded-full bg-[#f9f9f9]">
            <Bell className="size-6 text-primary" />
          </button>
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center size-[18px] bg-[#EF4444] rounded-full text-white text-xs font-medium">
            6
          </span>
        </div>

        {/* User Menu */}
        <UserMenu />
      </div>
    </header>
  );
};

// Extended project type with UI state
type ProjectWithState = Project & {
  isExpanded: boolean;
};

const DashboardSidebar = ({
  isCollapsed,
  onToggle,
  projects,
  isLoading,
  onCreateProject,
}: {
  isCollapsed: boolean;
  onToggle: () => void;
  projects: ProjectWithState[];
  isLoading: boolean;
  onCreateProject: () => void;
}) => {
  const navigate = useNavigate();
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [environment] = useState("staging");

  const toggleFolder = (projectId: string) => {
    setExpandedProjects((prev) => {
      const next = new Set(prev);
      if (next.has(projectId)) {
        next.delete(projectId);
      } else {
        next.add(projectId);
      }
      return next;
    });
  };

  if (isCollapsed) {
    return (
      <aside className="w-12 bg-white border-r border-border flex flex-col items-center py-4">
        <button
          onClick={onToggle}
          className="p-2 hover:bg-[#f9f9f9] rounded-md text-[#667085]"
        >
          <PanelLeft className="size-5" />
        </button>
        <button
          onClick={onCreateProject}
          className="mt-2 p-2 hover:bg-[#f9f9f9] rounded-md text-primary"
          title="New Project"
        >
          <Plus className="size-5" />
        </button>
        <div className="mt-4 flex flex-col gap-2">
          {projects.map((project) => (
            <button
              key={project.id}
              className="p-2 hover:bg-[#f9f9f9] rounded-md text-[#667085]"
              title={project.name}
            >
              <Folder className="size-5" />
            </button>
          ))}
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-[360px] bg-white border-r border-border flex flex-col">
      {/* Header with collapse button */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <span className="text-sm font-medium text-[#1f2937]">Explorer</span>
        <div className="flex items-center gap-1">
          <button
            onClick={onCreateProject}
            className="p-1 hover:bg-[#f9f9f9] rounded-md text-primary"
            title="New Project"
          >
            <Plus className="size-4" />
          </button>
          <button
            onClick={onToggle}
            className="p-1 hover:bg-[#f9f9f9] rounded-md text-[#667085]"
          >
            <PanelLeftClose className="size-4" />
          </button>
        </div>
      </div>

      {/* URL Input */}
      <div className="px-4 pt-4">
        <div className="flex items-center bg-[#f9f9f9] rounded h-10 px-3">
          <span className="text-sm text-[#53545c] capitalize shrink-0">URL :</span>
          <input
            type="text"
            className="flex-1 bg-transparent text-sm text-[#53545c] outline-none ml-2"
            placeholder="Enter URL..."
          />
        </div>
      </div>

      {/* Environment Dropdown */}
      <div className="px-4 pt-4 flex items-center gap-4">
        <span className="text-sm text-[#53545c] capitalize shrink-0">environment :</span>
        <button className="flex-1 flex items-center justify-center gap-2 bg-[#f9f9f9] rounded-lg h-11 px-4">
          <span className="text-sm text-[#53545c] capitalize">{environment}</span>
          <ChevronDown className="size-5 text-[#53545c]" />
        </button>
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-y-auto px-4 pt-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Folder className="size-12 text-[#667085] mb-3" />
            <p className="text-sm text-[#667085] mb-3">No projects yet</p>
            <button
              onClick={onCreateProject}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors"
            >
              <Plus className="size-4" />
              Create Project
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {projects.map((project) => {
              const isExpanded = expandedProjects.has(project.id);
              return (
                <div key={project.id}>
                  {/* Folder Row */}
                  <button
                    onClick={() => toggleFolder(project.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-2.5 rounded ${
                      isExpanded
                        ? "bg-[#fcf5ff] text-primary"
                        : "hover:bg-[#f9f9f9] text-[#667085]"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      {isExpanded ? (
                        <ChevronDown className="size-4" />
                      ) : (
                        <ChevronRight className="size-4" />
                      )}
                      {isExpanded ? (
                        <FolderOpen className="size-5" />
                      ) : (
                        <Folder className="size-5" />
                      )}
                      <span className="text-sm">{project.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-[#667085]">
                        {project._count.testFiles} tests
                      </span>
                      <MoreVertical className="size-5 text-[#667085]" />
                    </div>
                  </button>

                  {/* Expanded Project Content - placeholder for now */}
                  {isExpanded && (
                    <div className="ml-[54px] mt-3 flex flex-col gap-3">
                      {project._count.testFiles === 0 ? (
                        <p className="text-xs text-[#667085] italic">
                          No test files yet
                        </p>
                      ) : (
                        <button
                          onClick={() => navigate(`/dashboard/project/${project.id}`)}
                          className="flex items-center gap-1.5 text-sm text-primary hover:underline"
                        >
                          <FileText className="size-4" />
                          View {project._count.testFiles} test files
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
};

const DashboardLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [projects, setProjects] = useState<ProjectWithState[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { authFetch } = useApi();

  const fetchProjects = useCallback(async () => {
    try {
      const data = await authFetch<Project[]>("/projects");
      setProjects(data.map((p) => ({ ...p, isExpanded: false })));
    } catch (err) {
      console.error("Failed to fetch projects:", err);
    } finally {
      setIsLoading(false);
    }
  }, [authFetch]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleCreateProject = async (data: CreateProjectInput) => {
    await authFetch<Project>("/projects", {
      method: "POST",
      body: data,
    });
    // Refresh project list
    await fetchProjects();
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <DashboardTopBar />
      <div className="flex flex-1 overflow-hidden">
        <DashboardSidebar
          isCollapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          projects={projects}
          isLoading={isLoading}
          onCreateProject={() => setIsCreateModalOpen(true)}
        />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateProject}
      />
    </div>
  );
};

export default DashboardLayout;
