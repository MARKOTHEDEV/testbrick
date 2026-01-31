import { useParams } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import TestFile from "@/components/TestFile";
import { useApi } from "@/hooks/useApi";
import UiLoader from "@/components/ui/UiLoader";

export interface TestStep {
  id: string;
  stepNumber: number;
  action: string;
  description: string;
  value: string | null;
  locators: unknown;
  elementScreenshot: string | null;
}

interface TestFileData {
  id: string;
  name: string;
  description: string | null;
  folderId: string;
  createdAt: string;
  updatedAt: string;
  steps: TestStep[];
  testRuns: Array<{
    id: string;
    status: string;
    startedAt: string | null;
    endedAt: string | null;
    createdAt: string;
  }>;
  _count: {
    steps: number;
    testRuns: number;
  };
}

const TestFileDetailPage = () => {
  const { fileId } = useParams();
  const { authFetch } = useApi();
  const [testFile, setTestFile] = useState<TestFileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTestFile = useCallback(async () => {
    if (!fileId) return;

    try {
      const data = await authFetch<TestFileData>(`/tests/${fileId}`);
      setTestFile(data);
    } catch (err) {
      console.error("Failed to fetch test file:", err);
      setError(err instanceof Error ? err.message : "Failed to load test file");
    }
  }, [fileId, authFetch]);

  useEffect(() => {
    const loadInitial = async () => {
      setIsLoading(true);
      setError(null);
      await fetchTestFile();
      setIsLoading(false);
    };
    loadInitial();
  }, [fetchTestFile]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <UiLoader text="Loading test file..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-primary hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!testFile) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-[#667085]">Test file not found</p>
      </div>
    );
  }

  return (
    <div className="h-full">
      <TestFile
        testId={testFile.id}
        fileName={testFile.name}
        initialSteps={testFile.steps}
        onRefresh={fetchTestFile}
      />
    </div>
  );
};

export default TestFileDetailPage;
