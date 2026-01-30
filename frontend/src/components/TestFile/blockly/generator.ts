import * as Blockly from "blockly";

// Create a custom code generator for test scripts
export const testScriptGenerator = new Blockly.CodeGenerator("TestScript");

// Navigation blocks
testScriptGenerator.forBlock["goto_url"] = function (
  block: Blockly.Block,
): string {
  const url = block.getFieldValue("URL");
  return `navigate("${url}");\n`;
};

testScriptGenerator.forBlock["refresh_page"] = function (): string {
  return `refresh();\n`;
};

testScriptGenerator.forBlock["go_back"] = function (): string {
  return `goBack();\n`;
};

// Click/Events blocks
testScriptGenerator.forBlock["click_element"] = function (
  block: Blockly.Block,
): string {
  const target = block.getFieldValue("TARGET");
  return `click("${target}");\n`;
};

testScriptGenerator.forBlock["double_click"] = function (
  block: Blockly.Block,
): string {
  const target = block.getFieldValue("TARGET");
  return `doubleClick("${target}");\n`;
};

testScriptGenerator.forBlock["hover_element"] = function (
  block: Blockly.Block,
): string {
  const target = block.getFieldValue("TARGET");
  return `hover("${target}");\n`;
};

// Input blocks
testScriptGenerator.forBlock["enter_text"] = function (
  block: Blockly.Block,
): string {
  const text = block.getFieldValue("TEXT");
  const field = block.getFieldValue("FIELD");
  return `type("${text}", "${field}");\n`;
};

testScriptGenerator.forBlock["clear_input"] = function (
  block: Blockly.Block,
): string {
  const field = block.getFieldValue("FIELD");
  return `clear("${field}");\n`;
};

testScriptGenerator.forBlock["select_option"] = function (
  block: Blockly.Block,
): string {
  const option = block.getFieldValue("OPTION");
  const dropdown = block.getFieldValue("DROPDOWN");
  return `select("${option}", "${dropdown}");\n`;
};

// Assertion blocks
testScriptGenerator.forBlock["assert_visible"] = function (
  block: Blockly.Block,
): string {
  const target = block.getFieldValue("TARGET");
  return `assertVisible("${target}");\n`;
};

testScriptGenerator.forBlock["assert_text"] = function (
  block: Blockly.Block,
): string {
  const target = block.getFieldValue("TARGET");
  const expectedText = block.getFieldValue("EXPECTED_TEXT");
  return `assertText("${target}", "${expectedText}");\n`;
};

testScriptGenerator.forBlock["assert_not_visible"] = function (
  block: Blockly.Block,
): string {
  const target = block.getFieldValue("TARGET");
  return `assertNotVisible("${target}");\n`;
};

testScriptGenerator.forBlock["assert_url"] = function (
  block: Blockly.Block,
): string {
  const url = block.getFieldValue("URL");
  return `assertUrl("${url}");\n`;
};

// Wait/Control blocks
testScriptGenerator.forBlock["wait_seconds"] = function (
  block: Blockly.Block,
): string {
  const seconds = block.getFieldValue("SECONDS");
  return `wait(${seconds});\n`;
};

testScriptGenerator.forBlock["wait_for_element"] = function (
  block: Blockly.Block,
): string {
  const target = block.getFieldValue("TARGET");
  return `waitFor("${target}");\n`;
};

// Scrub function to handle block stacking
testScriptGenerator.scrub_ = function (
  block: Blockly.Block,
  code: string,
  thisOnly?: boolean,
): string {
  const nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  if (nextBlock && !thisOnly) {
    return code + testScriptGenerator.blockToCode(nextBlock);
  }
  return code;
};

// Export helper to generate code from workspace
export function generateTestScript(workspace: Blockly.Workspace): string {
  return testScriptGenerator.workspaceToCode(workspace);
}
