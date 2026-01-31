import { useState, useEffect, useCallback, useRef } from "react";
import { Outlet } from "react-router-dom";
import { TestBrickLogo } from "@/components/ui/testbrick-logo";
import { UserMenu } from "@/components/user-menu";
import CreateProjectModal from "@/components/CreateProjectModal";
import EditProjectModal from "@/components/EditProjectModal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useApi } from "@/hooks/useApi";
import type { Project, CreateProjectInput, UpdateProjectInput } from "@/lib/api";
import {
  Search,
  Bell,
  ChevronDown,
  Folder,
  FolderOpen,
  MoreVertical,
  PanelLeftClose,
  PanelLeft,
  Plus,
  Check,
  FileText,
  Pencil,
  Trash2,
} from "lucide-react";
import UiLoader from "@/components/ui/UiLoader";

const SELECTED_PROJECT_KEY = "testbrick_selected_project";

interface ProjectSwitcherProps {
  projects: Project[];
  selectedProject: Project | null;
  onSelect: (project: Project) => void;
  onCreateNew: () => void;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  isLoading: boolean;
}

const ProjectSwitcher = ({
  projects,
  selectedProject,
  onSelect,
  onCreateNew,
  onEdit,
  onDelete,
  isLoading,
}: ProjectSwitcherProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuOpenForId, setMenuOpenForId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setMenuOpenForId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 h-11 px-4 bg-[#f9f9f9] hover:bg-[#f0f0f0] rounded-lg transition-colors min-w-[200px]"
      >
        <Folder className="size-5 text-primary" />
        <span className="text-sm text-[#1f2937] font-medium truncate flex-1 text-left">
          {isLoading ? "Loading..." : selectedProject?.name || "Select Project"}
        </span>
        <ChevronDown
          className={`size-4 text-[#667085] transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-border z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-border">
            <span className="text-xs font-medium text-[#667085] uppercase">
              Projects
            </span>
          </div>

          {/* Project List */}
          <div className="max-h-64 overflow-y-auto">
            {projects.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-[#667085]">
                No projects yet
              </div>
            ) : (
              projects.map((project) => (
                <div
                  key={project.id}
                  className={`relative flex items-center gap-3 px-4 py-3 hover:bg-[#f9f9f9] transition-colors ${
                    selectedProject?.id === project.id ? "bg-[#fcf5ff]" : ""
                  }`}
                >
                  <button
                    onClick={() => {
                      onSelect(project);
                      setIsOpen(false);
                    }}
                    className="flex items-center gap-3 flex-1 text-left"
                  >
                    <Folder
                      className={`size-5 ${selectedProject?.id === project.id ? "text-primary" : "text-[#667085]"}`}
                    />
                    <div className="flex-1">
                      <p
                        className={`text-sm font-medium truncate ${selectedProject?.id === project.id ? "text-primary" : "text-[#1f2937]"}`}
                      >
                        {project.name}
                      </p>
                      <p className="text-xs text-[#667085]">
                        {project._count.folders} folders
                      </p>
                    </div>
                    {selectedProject?.id === project.id && (
                      <Check className="size-4 text-primary" />
                    )}
                  </button>

                  {/* More options menu */}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpenForId(menuOpenForId === project.id ? null : project.id);
                      }}
                      className="p-1 hover:bg-white/50 rounded text-[#667085] hover:text-[#1f2937]"
                    >
                      <MoreVertical className="size-4" />
                    </button>

                    {menuOpenForId === project.id && (
                      <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-lg border border-border z-50 overflow-hidden">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpenForId(null);
                            setIsOpen(false);
                            onEdit(project);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#1f2937] hover:bg-[#f9f9f9]"
                        >
                          <Pencil className="size-4" />
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpenForId(null);
                            setIsOpen(false);
                            onDelete(project);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="size-4" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Create New Project */}
          <div className="border-t border-border">
            <button
              onClick={() => {
                onCreateNew();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#f9f9f9] transition-colors text-primary"
            >
              <Plus className="size-5" />
              <span className="text-sm font-medium">Create New Project</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

interface DashboardTopBarProps {
  projects: Project[];
  selectedProject: Project | null;
  onSelectProject: (project: Project) => void;
  onCreateProject: () => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (project: Project) => void;
  isLoading: boolean;
}

const DashboardTopBar = ({
  projects,
  selectedProject,
  onSelectProject,
  onCreateProject,
  onEditProject,
  onDeleteProject,
  isLoading,
}: DashboardTopBarProps) => {
  return (
    <header className="flex items-center justify-between h-20 px-6 bg-white border-b border-border">
      {/* Logo + Project Switcher */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-1">
          <TestBrickLogo size={22} className="text-primary" />
          <span className="text-primary font-medium text-[22px] font-['Poppins'] capitalize">
            testBrick.
          </span>
        </div>

        <ProjectSwitcher
          projects={projects}
          selectedProject={selectedProject}
          onSelect={onSelectProject}
          onCreateNew={onCreateProject}
          onEdit={onEditProject}
          onDelete={onDeleteProject}
          isLoading={isLoading}
        />
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-2 h-11 w-[400px] px-3 bg-[#f9f9f9] rounded-lg">
        <Search className="size-5 text-[#53545c]" />
        <input
          type="text"
          placeholder="Search files and folders"
          className="flex-1 bg-transparent text-[#53545c] text-sm outline-none placeholder:text-[#53545c]"
        />
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
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

// Folder type for the sidebar
interface FolderWithFiles {
  id: string;
  name: string;
  createdAt: string;
  _count: {
    testFiles: number;
  };
  testFiles: Array<{
    id: string;
    name: string;
    _count: {
      steps: number;
      testRuns: number;
    };
  }>;
}

interface DashboardSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  selectedProject: Project | null;
  folders: FolderWithFiles[];
  isLoadingFolders: boolean;
  onCreateFolder: () => void;
}

const DashboardSidebar = ({
  isCollapsed,
  onToggle,
  selectedProject,
  folders,
  isLoadingFolders,
  onCreateFolder,
}: DashboardSidebarProps) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(),
  );
  const [environment] = useState("staging");

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
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
        {selectedProject && (
          <button
            onClick={onCreateFolder}
            className="mt-2 p-2 hover:bg-[#f9f9f9] rounded-md text-primary"
            title="New Folder"
          >
            <Plus className="size-5" />
          </button>
        )}
      </aside>
    );
  }

  return (
    <aside className="w-[360px] bg-white border-r border-border flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <span className="text-sm font-medium text-[#1f2937]">
          {selectedProject ? "Folders" : "Explorer"}
        </span>
        <div className="flex items-center gap-1">
          {selectedProject && (
            <button
              onClick={onCreateFolder}
              className="p-1 hover:bg-[#f9f9f9] rounded-md text-primary"
              title="New Folder"
            >
              <Plus className="size-4" />
            </button>
          )}
          <button
            onClick={onToggle}
            className="p-1 hover:bg-[#f9f9f9] rounded-md text-[#667085]"
          >
            <PanelLeftClose className="size-4" />
          </button>
        </div>
      </div>

      {/* Project Info */}
      {selectedProject && (
        <div>
          {/* URL Input */}
          <div className="px-4 pt-4">
            <div className="flex items-center bg-[#f9f9f9] rounded h-10 px-3">
              <span className="text-sm text-[#53545c] capitalize shrink-0">
                URL :
              </span>
              <input
                value={selectedProject?.baseUrl || ""}
                type="text"
                className="flex-1 bg-transparent text-sm text-[#53545c] outline-none ml-2"
                placeholder="Enter URL..."
              />
            </div>
          </div>
          {/* Environment Dropdown */}
          <div className="px-4 pt-4 flex items-center gap-4">
            <span className="text-sm text-[#53545c] capitalize shrink-0">
              environment :
            </span>
            <button className="flex-1 flex items-center justify-center gap-2 bg-[#f9f9f9] rounded-lg h-11 px-4">
              <span className="text-sm text-[#53545c] capitalize">
                {environment}
              </span>
              <ChevronDown className="size-5 text-[#53545c]" />
            </button>
          </div>
        </div>
      )}

      {/* Folder Tree */}
      <div className="flex-1 overflow-y-auto px-4 pt-4">
        {!selectedProject ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Folder className="size-12 text-[#667085] mb-3" />
            <p className="text-sm text-[#667085]">
              Select a project to view folders
            </p>
          </div>
        ) : isLoadingFolders ? (
          <div className="flex items-center justify-center py-8">
            <UiLoader />
          </div>
        ) : folders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Folder className="size-12 text-[#667085] mb-3" />
            <p className="text-sm text-[#667085] mb-3">No folders yet</p>
            <button
              onClick={onCreateFolder}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors"
            >
              <Plus className="size-4" />
              Create Folder
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {folders.map((folder) => {
              const isExpanded = expandedFolders.has(folder.id);
              return (
                <div key={folder.id}>
                  {/* Folder Row */}
                  <button
                    onClick={() => toggleFolder(folder.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-2.5 rounded ${
                      isExpanded
                        ? "bg-[#fcf5ff] text-primary"
                        : "hover:bg-[#f9f9f9] text-[#667085]"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <ChevronDown
                        className={`size-4 transition-transform ${isExpanded ? "" : "-rotate-90"}`}
                      />
                      {isExpanded ? (
                        <FolderOpen className="size-5" />
                      ) : (
                        <Folder className="size-5" />
                      )}
                      <span className="text-sm">{folder.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#667085]">
                        {folder._count.testFiles} files
                      </span>
                      <MoreVertical className="size-4 text-[#667085]" />
                    </div>
                  </button>

                  {/* Expanded Folder Content - Test Files */}
                  {isExpanded && (
                    <div className="ml-8 mt-1 flex flex-col gap-1">
                      {folder.testFiles.length === 0 ? (
                        <p className="text-xs text-[#667085] italic py-2 px-2">
                          No test files yet
                        </p>
                      ) : (
                        folder.testFiles.map((file) => (
                          <button
                            key={file.id}
                            className="flex items-center gap-2 px-2 py-2 rounded hover:bg-[#f9f9f9] text-[#667085]"
                          >
                            <FileText className="size-4" />
                            <span className="text-sm truncate">
                              {file.name}
                            </span>
                            <span className="text-xs ml-auto">
                              {file._count.steps} steps
                            </span>
                          </button>
                        ))
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
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [folders, setFolders] = useState<FolderWithFiles[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [isLoadingFolders, setIsLoadingFolders] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { authFetch } = useApi();

  // Fetch all projects
  const fetchProjects = useCallback(async () => {
    try {
      const data = await authFetch<Project[]>("/projects");
      setProjects(data);

      // Restore selected project from localStorage
      const savedProjectId = localStorage.getItem(SELECTED_PROJECT_KEY);
      if (savedProjectId) {
        const savedProject = data.find((p) => p.id === savedProjectId);
        if (savedProject) {
          setSelectedProject(savedProject);
        } else if (data.length > 0) {
          // If saved project no longer exists, select first
          setSelectedProject(data[0]);
        }
      } else if (data.length > 0) {
        // No saved project, select first
        setSelectedProject(data[0]);
      }
    } catch (err) {
      console.error("Failed to fetch projects:", err);
    } finally {
      setIsLoadingProjects(false);
    }
  }, [authFetch]);

  // Fetch folders for selected project
  const fetchFolders = useCallback(
    async (projectId: string) => {
      setIsLoadingFolders(true);
      try {
        // Using the findOne endpoint which includes folders
        const data = await authFetch<Project & { folders: FolderWithFiles[] }>(
          `/projects/${projectId}`,
        );
        setFolders(data.folders || []);
      } catch (err) {
        console.error("Failed to fetch folders:", err);
        setFolders([]);
      } finally {
        setIsLoadingFolders(false);
      }
    },
    [authFetch],
  );

  // Load projects on mount
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Load folders when project changes
  useEffect(() => {
    if (selectedProject) {
      localStorage.setItem(SELECTED_PROJECT_KEY, selectedProject.id);
      fetchFolders(selectedProject.id);
    } else {
      setFolders([]);
    }
  }, [selectedProject, fetchFolders]);

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
  };

  const handleCreateProject = async (data: CreateProjectInput) => {
    const newProject = await authFetch<Project>("/projects", {
      method: "POST",
      body: data,
    });
    await fetchProjects();
    setSelectedProject(newProject);
  };

  const handleCreateFolder = () => {
    // TODO: Implement create folder modal (Task 1.5.1)
    console.log("Create folder for project:", selectedProject?.id);
  };

  const handleEditProject = (project: Project) => {
    setProjectToEdit(project);
    setIsEditModalOpen(true);
  };

  const handleUpdateProject = async (data: UpdateProjectInput) => {
    if (!projectToEdit) return;

    const updated = await authFetch<Project>(`/projects/${projectToEdit.id}`, {
      method: "PATCH",
      body: data,
    });

    // Update projects list
    setProjects((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );

    // Update selected project if it was edited
    if (selectedProject?.id === updated.id) {
      setSelectedProject(updated);
    }
  };

  const handleDeleteProject = (project: Project) => {
    setProjectToDelete(project);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;

    setIsDeleting(true);
    try {
      await authFetch(`/projects/${projectToDelete.id}`, {
        method: "DELETE",
      });

      // Remove from projects list
      setProjects((prev) => prev.filter((p) => p.id !== projectToDelete.id));

      // If deleted project was selected, select another one
      if (selectedProject?.id === projectToDelete.id) {
        const remaining = projects.filter((p) => p.id !== projectToDelete.id);
        setSelectedProject(remaining.length > 0 ? remaining[0] : null);
        localStorage.removeItem(SELECTED_PROJECT_KEY);
      }

      setIsDeleteDialogOpen(false);
      setProjectToDelete(null);
    } catch (err) {
      console.error("Failed to delete project:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <DashboardTopBar
        projects={projects}
        selectedProject={selectedProject}
        onSelectProject={handleSelectProject}
        onCreateProject={() => setIsCreateModalOpen(true)}
        onEditProject={handleEditProject}
        onDeleteProject={handleDeleteProject}
        isLoading={isLoadingProjects}
      />
      <div className="flex flex-1 overflow-hidden">
        <DashboardSidebar
          isCollapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          selectedProject={selectedProject}
          folders={folders}
          isLoadingFolders={isLoadingFolders}
          onCreateFolder={handleCreateFolder}
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
      <EditProjectModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setProjectToEdit(null);
        }}
        onSubmit={handleUpdateProject}
        project={projectToEdit}
      />
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setProjectToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Project"
        message={`Are you sure you want to delete "${projectToDelete?.name}"? This will permanently delete all folders, test files, and test runs associated with this project.`}
        confirmLabel="Delete"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default DashboardLayout;
