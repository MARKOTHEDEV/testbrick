import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { TestBrickLogo } from "@/components/ui/testbrick-logo";
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

        {/* User Avatar & Info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-[46px]  rounded-full border border-[#e5e5e5]">
            <span className="text-[#1f2937] font-semibold text-base font-inter tracking-[0.08px]">
              A
            </span>
          </div>
          <div className="flex flex-col text-[#667085] capitalize">
            <span className="text-base">odeleye. o</span>
            <span className="text-xs">free account</span>
          </div>
        </div>
      </div>
    </header>
  );
};

// Mock data for the file tree
const mockProjects = [
  {
    id: "1",
    name: "API Testing",
    type: "folder" as const,
    progress: 98,
    isExpanded: true,
    children: [
      { id: "1-1", name: "Demo Daten", type: "file" as const, checked: false },
      { id: "1-2", name: "Projeckt Wolf", type: "file" as const, checked: false },
    ],
  },
  {
    id: "2",
    name: "API Testing",
    type: "folder" as const,
    progress: 99,
    isExpanded: false,
    children: [],
  },
];

type FileItem = {
  id: string;
  name: string;
  type: "file";
  checked: boolean;
};

type FolderItem = {
  id: string;
  name: string;
  type: "folder";
  progress: number;
  isExpanded: boolean;
  children: FileItem[];
};

const DashboardSidebar = ({
  isCollapsed,
  onToggle,
}: {
  isCollapsed: boolean;
  onToggle: () => void;
}) => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<FolderItem[]>(mockProjects);
  const [environment] = useState("staging");

  const toggleFolder = (folderId: string) => {
    setProjects((prev) =>
      prev.map((project) =>
        project.id === folderId
          ? { ...project, isExpanded: !project.isExpanded }
          : project
      )
    );
  };

  const toggleFileCheck = (folderId: string, fileId: string) => {
    setProjects((prev) =>
      prev.map((project) =>
        project.id === folderId
          ? {
              ...project,
              children: project.children.map((child) =>
                child.id === fileId
                  ? { ...child, checked: !child.checked }
                  : child
              ),
            }
          : project
      )
    );
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
        <button
          onClick={onToggle}
          className="p-1 hover:bg-[#f9f9f9] rounded-md text-[#667085]"
        >
          <PanelLeftClose className="size-4" />
        </button>
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
        <div className="flex flex-col gap-3">
          {projects.map((project) => (
            <div key={project.id}>
              {/* Folder Row */}
              <button
                onClick={() => toggleFolder(project.id)}
                className={`w-full flex items-center justify-between px-2.5 py-2.5 rounded ${
                  project.isExpanded
                    ? "bg-[#fcf5ff] text-primary"
                    : "hover:bg-[#f9f9f9] text-[#667085]"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  {project.isExpanded ? (
                    <ChevronDown className="size-4" />
                  ) : (
                    <ChevronRight className="size-4" />
                  )}
                  {project.isExpanded ? (
                    <FolderOpen className="size-5" />
                  ) : (
                    <Folder className="size-5" />
                  )}
                  <span className="text-sm capitalize">{project.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-[#519c66]">{project.progress}%</span>
                  <MoreVertical className="size-5 text-[#667085]" />
                </div>
              </button>

              {/* Children Files */}
              {project.isExpanded && project.children.length > 0 && (
                <div className="ml-[54px] mt-3 flex flex-col gap-3">
                  {project.children.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between cursor-pointer hover:bg-[#f9f9f9] rounded px-2 py-1"
                      onClick={() => navigate(`/dashboard/test/${file.id}`)}
                    >
                      <div className="flex items-center gap-1.5">
                        <FileText className="size-5 text-[#667085]" />
                        <span className="text-sm text-[#667085] capitalize">
                          {file.name}
                        </span>
                      </div>
                      <div
                        className={`size-4 border rounded ${
                          file.checked
                            ? "bg-primary border-primary"
                            : "border-[#667085]"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFileCheck(project.id, file.id);
                        }}
                      >
                        {file.checked && (
                          <svg
                            viewBox="0 0 16 16"
                            fill="white"
                            className="size-4"
                          >
                            <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
                          </svg>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

const DashboardLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-background">
      <DashboardTopBar />
      <div className="flex flex-1 overflow-hidden">
        <DashboardSidebar
          isCollapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
