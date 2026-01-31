import { TestBrickLogo } from "./testbrick-logo";

const UiLoader = ({ text }: { text?: string }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <TestBrickLogo size={48} className="mb-4 text-primary" animate />
      <p className="text-muted-foreground text-sm">
        {text || "Loading..."}
      </p>
    </div>
  );
};

export default UiLoader;
