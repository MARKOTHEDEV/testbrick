import { useParams } from "react-router-dom";
import TestFile from "@/components/TestFile";

const TestFileDetailPage = () => {
  const { fileId } = useParams();

  // In real app, fetch file details based on fileId
  // For now, use mock file name
  const fileName = fileId === "1-1" ? "Demo Daten" : "Projeckt Wolf";

  return (
    <div className="h-full">
      <TestFile fileName={fileName} />
    </div>
  );
};

export default TestFileDetailPage;
