import * as Blockly from "blockly";

// Simplified test blocks - just action + value (no technical selectors)
const testBlocks = [
  // Navigation Blocks
  {
    type: "goto_url",
    message0: "Go to %1",
    args0: [
      {
        type: "field_input",
        name: "URL",
        text: "https://example.com",
      },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: "#4C97FF",
    tooltip: "Navigate to a URL",
    helpUrl: "",
  },
  {
    type: "refresh_page",
    message0: "Refresh",
    previousStatement: null,
    nextStatement: null,
    colour: "#4C97FF",
    tooltip: "Refresh the page",
    helpUrl: "",
  },
  {
    type: "go_back",
    message0: "Go back",
    previousStatement: null,
    nextStatement: null,
    colour: "#4C97FF",
    tooltip: "Go back",
    helpUrl: "",
  },

  // Click/Events Blocks
  {
    type: "click_element",
    message0: "Click %1",
    args0: [
      {
        type: "field_input",
        name: "TARGET",
        text: "Submit button",
      },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: "#9966FF",
    tooltip: "Click on something",
    helpUrl: "",
  },
  {
    type: "double_click",
    message0: "Double click %1",
    args0: [
      {
        type: "field_input",
        name: "TARGET",
        text: "Item",
      },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: "#9966FF",
    tooltip: "Double click",
    helpUrl: "",
  },
  {
    type: "hover_element",
    message0: "Hover %1",
    args0: [
      {
        type: "field_input",
        name: "TARGET",
        text: "Menu",
      },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: "#9966FF",
    tooltip: "Hover over element",
    helpUrl: "",
  },

  // Input Blocks
  {
    type: "enter_text",
    message0: "Type %1 in %2",
    args0: [
      {
        type: "field_input",
        name: "TEXT",
        text: "hello@example.com",
      },
      {
        type: "field_input",
        name: "FIELD",
        text: "Email field",
      },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: "#59C059",
    tooltip: "Type text into a field",
    helpUrl: "",
  },
  {
    type: "clear_input",
    message0: "Clear %1",
    args0: [
      {
        type: "field_input",
        name: "FIELD",
        text: "Search field",
      },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: "#59C059",
    tooltip: "Clear a field",
    helpUrl: "",
  },
  {
    type: "select_option",
    message0: "Select %1 from %2",
    args0: [
      {
        type: "field_input",
        name: "OPTION",
        text: "United States",
      },
      {
        type: "field_input",
        name: "DROPDOWN",
        text: "Country dropdown",
      },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: "#59C059",
    tooltip: "Select from dropdown",
    helpUrl: "",
  },

  // Assertion Blocks
  {
    type: "assert_visible",
    message0: "Verify %1 visible",
    args0: [
      {
        type: "field_input",
        name: "TARGET",
        text: "Success message",
      },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: "#FF8C1A",
    tooltip: "Check if visible",
    helpUrl: "",
  },
  {
    type: "assert_text",
    message0: "Verify %1 shows %2",
    args0: [
      {
        type: "field_input",
        name: "TARGET",
        text: "Heading",
      },
      {
        type: "field_input",
        name: "EXPECTED_TEXT",
        text: "Welcome",
      },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: "#FF8C1A",
    tooltip: "Check text content",
    helpUrl: "",
  },
  {
    type: "assert_not_visible",
    message0: "Verify %1 hidden",
    args0: [
      {
        type: "field_input",
        name: "TARGET",
        text: "Error message",
      },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: "#FF8C1A",
    tooltip: "Check if hidden",
    helpUrl: "",
  },
  {
    type: "assert_url",
    message0: "Verify URL contains %1",
    args0: [
      {
        type: "field_input",
        name: "URL",
        text: "/dashboard",
      },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: "#FF8C1A",
    tooltip: "Check current URL",
    helpUrl: "",
  },

  // Wait/Control Blocks
  {
    type: "wait_seconds",
    message0: "Wait %1 sec",
    args0: [
      {
        type: "field_number",
        name: "SECONDS",
        value: 2,
        min: 0.1,
        max: 60,
      },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: "#FFAB19",
    tooltip: "Wait",
    helpUrl: "",
  },
  {
    type: "wait_for_element",
    message0: "Wait for %1",
    args0: [
      {
        type: "field_input",
        name: "TARGET",
        text: "Loading done",
      },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: "#FFAB19",
    tooltip: "Wait for element",
    helpUrl: "",
  },
];

// Register all custom blocks
export function registerTestBlocks() {
  Blockly.common.defineBlocksWithJsonArray(testBlocks);
}

// Toolbox configuration
export const toolboxConfig = {
  kind: "categoryToolbox",
  contents: [
    {
      kind: "category",
      name: "Navigation",
      colour: "#4C97FF",
      contents: [
        { kind: "block", type: "goto_url" },
        { kind: "block", type: "refresh_page" },
        { kind: "block", type: "go_back" },
      ],
    },
    {
      kind: "category",
      name: "Click",
      colour: "#9966FF",
      contents: [
        { kind: "block", type: "click_element" },
        { kind: "block", type: "double_click" },
        { kind: "block", type: "hover_element" },
      ],
    },
    {
      kind: "category",
      name: "Input",
      colour: "#59C059",
      contents: [
        { kind: "block", type: "enter_text" },
        { kind: "block", type: "clear_input" },
        { kind: "block", type: "select_option" },
      ],
    },
    {
      kind: "category",
      name: "Verify",
      colour: "#FF8C1A",
      contents: [
        { kind: "block", type: "assert_visible" },
        { kind: "block", type: "assert_text" },
        { kind: "block", type: "assert_not_visible" },
        { kind: "block", type: "assert_url" },
      ],
    },
    {
      kind: "category",
      name: "Wait",
      colour: "#FFAB19",
      contents: [
        { kind: "block", type: "wait_seconds" },
        { kind: "block", type: "wait_for_element" },
      ],
    },
  ],
};
