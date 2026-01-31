import { createContext, useContext, type ReactNode } from "react";
import type { Project } from "@/lib/api";

interface ProjectContextType {
  selectedProject: Project | null;
  setSelectedProject: (project: Project | null) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

interface ProjectProviderProps {
  children: ReactNode;
  value: ProjectContextType;
}

export function ProjectProvider({ children, value }: ProjectProviderProps) {
  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
}

export function useProjectOptional() {
  return useContext(ProjectContext);
}
