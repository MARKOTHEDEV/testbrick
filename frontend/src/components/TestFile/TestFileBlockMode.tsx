import { useEffect, useRef, useState, useCallback } from "react";
import * as Blockly from "blockly";
import { useBlocklyWorkspace } from "react-blockly";
import { Code, Blocks } from "lucide-react";
import { registerTestBlocks, toolboxConfig } from "./blockly/blocks";
import { generateTestScript } from "./blockly/generator";
import type { TestStep } from "./index";

interface TestFileBlockModeProps {
  steps: TestStep[];
}

// Register custom blocks once on module load
let blocksRegistered = false;
if (!blocksRegistered) {
  registerTestBlocks();
  blocksRegistered = true;
}

// Convert test steps to Blockly XML for initial workspace state
function stepsToBlocklyXml(steps: TestStep[]): string {
  const blockXmls: string[] = [];

  steps.forEach((step) => {
    const text = step.text.toLowerCase();
    let blockXml = "";

    if (text.includes("navigate") || text.includes("go to")) {
      blockXml = `<block type="goto_url"><field name="URL">https://example.com</field></block>`;
    } else if (text.includes("click")) {
      // Extract what was clicked from the step text
      const target = step.text.replace(/click\s*(on\s*)?(the\s*)?/i, "").trim() || "Button";
      blockXml = `<block type="click_element"><field name="TARGET">${target}</field></block>`;
    } else if (
      text.includes("enter") ||
      text.includes("type") ||
      text.includes("input")
    ) {
      blockXml = `<block type="enter_text"><field name="TEXT">test value</field><field name="FIELD">Input field</field></block>`;
    } else if (
      text.includes("verify") ||
      text.includes("check") ||
      text.includes("assert")
    ) {
      const target = step.expectedResult.substring(0, 30);
      blockXml = `<block type="assert_visible"><field name="TARGET">${target}</field></block>`;
    } else if (text.includes("wait")) {
      blockXml = `<block type="wait_seconds"><field name="SECONDS">2</field></block>`;
    } else {
      blockXml = `<block type="click_element"><field name="TARGET">Element</field></block>`;
    }

    blockXmls.push(blockXml);
  });

  // Chain blocks together with next connections
  if (blockXmls.length === 0) {
    return '<xml xmlns="https://developers.google.com/blockly/xml"></xml>';
  }

  // Build nested XML with next connections
  let xml = blockXmls[blockXmls.length - 1];
  for (let i = blockXmls.length - 2; i >= 0; i--) {
    // Insert the next block inside a <next> element
    const insertPoint = blockXmls[i].lastIndexOf("</block>");
    xml =
      blockXmls[i].substring(0, insertPoint) + `<next>${xml}</next></block>`;
  }

  return `<xml xmlns="https://developers.google.com/blockly/xml">${xml}</xml>`;
}

// Workspace configuration
const workspaceConfig: Blockly.BlocklyOptions = {
  grid: {
    spacing: 20,
    length: 3,
    colour: "#e0e0e0",
    snap: true,
  },
  zoom: {
    controls: true,
    wheel: true,
    startScale: 1.0,
    maxScale: 3,
    minScale: 0.3,
    scaleSpeed: 1.2,
  },
  trashcan: true,
  move: {
    scrollbars: true,
    drag: true,
    wheel: true,
  },
  renderer: "zelos", // Modern rounded block renderer
};

const TestFileBlockMode = ({ steps }: TestFileBlockModeProps) => {
  const blocklyRef = useRef<HTMLDivElement>(null!);
  const [generatedCode, setGeneratedCode] = useState<string>("");
  const [showCode, setShowCode] = useState(false);

  // Generate initial XML from steps
  const initialXml = stepsToBlocklyXml(steps);

  // Handle workspace changes
  const handleWorkspaceChange = useCallback((workspace: Blockly.Workspace) => {
    const code = generateTestScript(workspace);
    setGeneratedCode(code);
  }, []);

  const { workspace } = useBlocklyWorkspace({
    ref: blocklyRef,
    toolboxConfiguration: toolboxConfig,
    workspaceConfiguration: workspaceConfig,
    initialXml: initialXml,
    onWorkspaceChange: handleWorkspaceChange,
  });

  // Generate initial code on mount
  useEffect(() => {
    if (workspace) {
      const code = generateTestScript(workspace);
      setGeneratedCode(code);
    }
  }, [workspace]);

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-border">
        <div className="flex items-center gap-2">
          <Blocks className="size-5 text-primary" />
          <span className="text-sm font-medium text-[#1f2937]">
            Visual Test Editor
          </span>
          <span className="text-xs text-[#9ca3af] ml-2">
            Drag blocks from the toolbox to build your test
          </span>
        </div>
        <button
          onClick={() => setShowCode(!showCode)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            showCode
              ? "bg-primary text-white"
              : "bg-[#f4f4f5] text-[#667085] hover:bg-[#e5e5e5]"
          }`}
        >
          <Code className="size-4" />
          {showCode ? "Hide Code" : "Show Code"}
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Blockly workspace */}
        <div
          ref={blocklyRef}
          className="flex-1"
          style={{ minHeight: "500px" }}
        />

        {/* Generated code panel */}
        {showCode && (
          <div className="w-80 border-l border-border bg-[#1e1e1e] flex flex-col">
            <div className="px-4 py-3 border-b border-[#333] flex items-center justify-between">
              <span className="text-sm font-medium text-[#e5e5e5]">
                Generated Script
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedCode);
                }}
                className="text-xs text-[#9ca3af] hover:text-white transition-colors"
              >
                Copy
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <pre className="text-sm text-[#d4d4d4] font-mono whitespace-pre-wrap">
                {generatedCode || "// Add blocks to generate test script"}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestFileBlockMode;
