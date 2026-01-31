// Types for locator bundle - these should eventually move to @qa-builder/shared
type RoleLocator = {
  role: string;
  name?: string;
};

type LocatorBundle = {
  role?: RoleLocator;        // 1st priority - most stable
  testId?: string;           // 2nd priority - explicit test IDs
  label?: string;            // 3rd priority - form field labels
  placeholder?: string;      // 4th priority - input placeholders
  text?: string;             // 5th priority - visible text content
  altText?: string;          // 6th priority - image alt text
  title?: string;            // 7th priority - title attribute
  css?: string;              // 8th priority - generated CSS selector
  xpath?: string;            // 9th priority - generated XPath (last resort)
};

type ElementPickedMessage = {
  __qa: true;
  type: "ELEMENT_PICKED";
  qaId: string;
  role?: string;
  name?: string;
  frameChain: string[];
  locators: LocatorBundle;   // The locator bundle for playback
  tagName: string;
  inputType?: string;
};

interface QATaggerAPI {
  start(): void;
  stop(): void;
  ensureQaId(element: Element): string;
}

class QATagger implements QATaggerAPI {
  private isPicking = false;
  private overlay: HTMLElement | null = null;
  private currentElement: Element | null = null;

  constructor() {
    this.setupMessageListener();
    this.autoGenerateIds();
  }

  start(): void {
    if (this.isPicking) return;
    this.isPicking = true;
    this.createOverlay();
    this.addEventListeners();
  }

  stop(): void {
    if (!this.isPicking) return;
    this.isPicking = false;
    this.removeOverlay();
    this.removeEventListeners();
  }

  ensureQaId(element: Element): string {
    // Check for existing test IDs
    const existingId =
      element.getAttribute("data-testid") ||
      element.getAttribute("data-test") ||
      element.getAttribute("data-qa");

    if (existingId) {
      element.setAttribute("data-qa-id", existingId);
      return existingId;
    }

    // Generate new stable ID
    const qaId = this.generateStableId(element);
    element.setAttribute("data-qa-id", qaId);
    return qaId;
  }

  // Capture all possible locator strategies for an element
  captureLocators(element: Element): LocatorBundle {
    const locators: LocatorBundle = {};

    // 1. Role locator (most stable for semantic elements)
    const roleLocator = this.getRoleLocator(element);
    if (roleLocator) {
      locators.role = roleLocator;
    }

    // 2. Test ID (if developers added data-testid)
    const testId =
      element.getAttribute("data-testid") ||
      element.getAttribute("data-test") ||
      element.getAttribute("data-qa") ||
      element.getAttribute("data-cy");
    if (testId) {
      locators.testId = testId;
    }

    // 3. Label (for form fields)
    const label = this.getAssociatedLabel(element);
    if (label) {
      locators.label = label;
    }

    // 4. Placeholder
    const placeholder = (element as HTMLInputElement).placeholder;
    if (placeholder) {
      locators.placeholder = placeholder.trim();
    }

    // 5. Visible text (for buttons, links)
    const text = this.getVisibleText(element);
    if (text) {
      locators.text = text;
    }

    // 6. Alt text (for images)
    const alt = (element as HTMLImageElement).alt;
    if (alt) {
      locators.altText = alt.trim();
    }

    // 7. Title attribute
    const title = element.getAttribute("title");
    if (title) {
      locators.title = title.trim();
    }

    // 8. CSS selector (generated, less stable)
    const css = this.generateCssSelector(element);
    if (css) {
      locators.css = css;
    }

    // 9. XPath (last resort)
    const xpath = this.generateXPath(element);
    if (xpath) {
      locators.xpath = xpath;
    }

    return locators;
  }

  private getRoleLocator(element: Element): RoleLocator | undefined {
    const role = this.inferRole(element);
    if (!role) return undefined;

    const name = this.getAccessibleName(element);

    // Only return role locator if we have enough info to uniquely identify
    return {
      role,
      name: name || undefined,
    };
  }

  private getAssociatedLabel(element: Element): string | undefined {
    // Check for label via 'for' attribute
    if (element.id) {
      const label = document.querySelector(`label[for="${element.id}"]`);
      if (label) {
        return label.textContent?.trim();
      }
    }

    // Check for wrapping label
    const parentLabel = element.closest("label");
    if (parentLabel) {
      // Get label text excluding the input's own text
      const clone = parentLabel.cloneNode(true) as HTMLElement;
      const inputs = clone.querySelectorAll("input, select, textarea");
      inputs.forEach((input) => input.remove());
      const labelText = clone.textContent?.trim();
      if (labelText) {
        return labelText;
      }
    }

    // Check aria-labelledby
    const ariaLabelledBy = element.getAttribute("aria-labelledby");
    if (ariaLabelledBy) {
      const labelElement = document.getElementById(ariaLabelledBy);
      if (labelElement) {
        return labelElement.textContent?.trim();
      }
    }

    return undefined;
  }

  private getVisibleText(element: Element): string | undefined {
    const tagName = element.tagName.toLowerCase();

    // For buttons and links, get direct text content
    if (["button", "a"].includes(tagName)) {
      // Get text but exclude text from nested interactive elements
      const clone = element.cloneNode(true) as HTMLElement;
      const nested = clone.querySelectorAll("button, a, input, select, textarea");
      nested.forEach((el) => el.remove());

      const text = clone.textContent?.trim();
      if (text && text.length > 0 && text.length <= 100) {
        return text;
      }
    }

    // For inputs with type button/submit/reset
    if (tagName === "input") {
      const inputType = (element as HTMLInputElement).type;
      if (["button", "submit", "reset"].includes(inputType)) {
        const value = (element as HTMLInputElement).value;
        if (value) return value.trim();
      }
    }

    return undefined;
  }

  private generateCssSelector(element: Element): string {
    const parts: string[] = [];
    let current: Element | null = element;
    let depth = 0;
    const maxDepth = 5;

    while (current && current !== document.body && depth < maxDepth) {
      let selector = current.tagName.toLowerCase();

      // Prefer ID if available and looks stable (not auto-generated)
      if (current.id && !this.looksAutoGenerated(current.id)) {
        selector = `#${CSS.escape(current.id)}`;
        parts.unshift(selector);
        break; // ID is unique, no need to go further
      }

      // Add stable classes (filter out dynamic/hashed ones)
      const stableClasses = Array.from(current.classList)
        .filter((cls) => !this.looksAutoGenerated(cls))
        .slice(0, 2);

      if (stableClasses.length > 0) {
        selector += stableClasses.map((cls) => `.${CSS.escape(cls)}`).join("");
      }

      // Add nth-of-type if needed for uniqueness
      const parent = current.parentElement;
      if (parent) {
        const siblings = Array.from(parent.children).filter(
          (sibling) => sibling.tagName === current!.tagName
        );
        if (siblings.length > 1) {
          const index = siblings.indexOf(current) + 1;
          selector += `:nth-of-type(${index})`;
        }
      }

      parts.unshift(selector);
      current = current.parentElement;
      depth++;
    }

    return parts.join(" > ");
  }

  private generateXPath(element: Element): string {
    const parts: string[] = [];
    let current: Element | null = element;

    while (current && current !== document.body) {
      let selector = current.tagName.toLowerCase();

      // Use ID if available and stable
      if (current.id && !this.looksAutoGenerated(current.id)) {
        parts.unshift(`//*[@id="${current.id}"]`);
        break;
      }

      // Add index for disambiguation
      const parent = current.parentElement;
      if (parent) {
        const siblings = Array.from(parent.children).filter(
          (sibling) => sibling.tagName === current!.tagName
        );
        if (siblings.length > 1) {
          const index = siblings.indexOf(current) + 1;
          selector += `[${index}]`;
        }
      }

      parts.unshift(selector);
      current = current.parentElement;
    }

    return "//" + parts.join("/");
  }

  private looksAutoGenerated(str: string): boolean {
    // Detect common patterns for auto-generated classes/IDs
    const autoGenPatterns = [
      /^[a-z]{1,3}[0-9a-f]{4,}$/i,          // e.g., "css-1a2b3c4"
      /^[a-z]+-[0-9a-f]{6,}$/i,              // e.g., "styles-a1b2c3d4"
      /^_[a-z0-9]+$/i,                        // e.g., "_1234abc"
      /^[a-z]{2,4}__[a-z]+_[a-z0-9]+$/i,    // e.g., "sc__button_xyz123" (styled-components)
      /[a-f0-9]{8,}/i,                        // Contains long hex string
      /^:r[0-9]+:$/,                          // React useId pattern
    ];

    return autoGenPatterns.some((pattern) => pattern.test(str));
  }

  private autoGenerateIds(): void {
    // Wait for DOM to be ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () =>
        this.generateIdsForInteractiveElements()
      );
    } else {
      this.generateIdsForInteractiveElements();
    }

    // Also generate IDs when new elements are added (throttled for performance)
    let sdkUpdateTimeout: number | null = null;
    const observer = new MutationObserver((mutations) => {
      // Throttle to avoid excessive processing
      if (sdkUpdateTimeout) return;

      sdkUpdateTimeout = window.setTimeout(() => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) {
              // Element node
              this.ensureQaIdForElement(node as Element);
            }
          });
        });
        sdkUpdateTimeout = null;
      }, 200); // Throttle to max once per 200ms
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  private generateIdsForInteractiveElements(): void {
    // Generate IDs for interactive elements
    const interactiveSelectors = [
      "input",
      "button",
      "select",
      "textarea",
      "a[href]",
      "[onclick]",
      '[role="button"]',
      '[role="link"]',
      "[tabindex]",
    ];

    interactiveSelectors.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((element) => {
        this.ensureQaIdForElement(element);
      });
    });
  }

  private ensureQaIdForElement(element: Element): void {
    // Only generate ID if element doesn't already have one
    if (!element.getAttribute("data-qa-id")) {
      this.ensureQaId(element);
    }
  }

  private setupMessageListener(): void {
    window.addEventListener("message", (event) => {
      if (event.data?.__qa === true) {
        switch (event.data.type) {
          case "START_PICK":
            this.start();
            break;
          case "STOP_PICK":
            this.stop();
            break;
        }
      }
    });
  }

  private createOverlay(): void {
    this.overlay = document.createElement("div");
    this.overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 123, 255, 0.1);
      border: 2px solid #007bff;
      pointer-events: none;
      z-index: 2147483647;
      display: none;
    `;
    document.body.appendChild(this.overlay);
  }

  private removeOverlay(): void {
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
  }

  private addEventListeners(): void {
    document.addEventListener("mouseover", this.handleMouseOver);
    document.addEventListener("mouseout", this.handleMouseOut);
    document.addEventListener("click", this.handleClick, true);
  }

  private removeEventListeners(): void {
    document.removeEventListener("mouseover", this.handleMouseOver);
    document.removeEventListener("mouseout", this.handleMouseOut);
    document.removeEventListener("click", this.handleClick, true);
  }

  private handleMouseOver = (event: MouseEvent): void => {
    if (!this.isPicking || !this.overlay) return;

    const element = event.target as Element;
    if (this.isValidTarget(element)) {
      this.currentElement = element;
      this.highlightElement(element);
    }
  };

  private handleMouseOut = (): void => {
    if (this.overlay) {
      this.overlay.style.display = "none";
    }
    this.currentElement = null;
  };

  private handleClick = (event: MouseEvent): void => {
    if (!this.isPicking || !this.currentElement) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    const qaId = this.ensureQaId(this.currentElement);
    const role = this.inferRole(this.currentElement);
    const name = this.getAccessibleName(this.currentElement);
    const frameChain = this.getFrameChain(this.currentElement);
    const locators = this.captureLocators(this.currentElement);
    const tagName = this.currentElement.tagName.toLowerCase();
    const inputType = (this.currentElement as HTMLInputElement).type;

    const message: ElementPickedMessage = {
      __qa: true,
      type: "ELEMENT_PICKED",
      qaId,
      role,
      name,
      frameChain,
      locators,
      tagName,
      inputType: inputType || undefined,
    };

    window.postMessage(message, "*");
    this.stop();
  };

  private isValidTarget(element: Element): boolean {
    // Skip script, style, and other non-interactive elements
    const tagName = element.tagName.toLowerCase();
    const skipTags = ["script", "style", "meta", "link", "title", "head"];

    if (skipTags.includes(tagName)) return false;

    // Skip elements that are not visible
    const rect = element.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return false;

    return true;
  }

  private highlightElement(element: Element): void {
    if (!this.overlay) return;

    const rect = element.getBoundingClientRect();
    this.overlay.style.display = "block";
    this.overlay.style.top = `${rect.top}px`;
    this.overlay.style.left = `${rect.left}px`;
    this.overlay.style.width = `${rect.width}px`;
    this.overlay.style.height = `${rect.height}px`;
  }

  private generateStableId(element: Element): string {
    const role = this.inferRole(element) || "node";
    const hint = this.getHint(element);

    // Create base ID without random hash
    const baseId = `qa:${role}:${hint}`;

    // Check for duplicates and add counter if needed
    return this.ensureUniqueId(baseId);
  }

  private ensureUniqueId(baseId: string): string {
    let counter = 0;
    let finalId = baseId;

    // Check if this ID already exists
    while (document.querySelector(`[data-qa-id="${finalId}"]`)) {
      counter++;
      finalId = `${baseId}:${counter}`;
    }

    return finalId;
  }

  private inferRole(element: Element): string | undefined {
    // Check explicit ARIA role
    const ariaRole = element.getAttribute("role");
    if (ariaRole) return ariaRole;

    // Check semantic HTML elements
    const tagName = element.tagName.toLowerCase();
    const semanticRoles: Record<string, string> = {
      button: "button",
      a: "link",
      input: "textbox",
      textarea: "textbox",
      select: "combobox",
      img: "img",
      h1: "heading",
      h2: "heading",
      h3: "heading",
      h4: "heading",
      h5: "heading",
      h6: "heading",
      nav: "navigation",
      main: "main",
      header: "banner",
      footer: "contentinfo",
      aside: "complementary",
      form: "form",
      table: "table",
      ul: "list",
      ol: "list",
      li: "listitem",
    };

    if (semanticRoles[tagName]) {
      return semanticRoles[tagName];
    }

    // Check input types
    if (tagName === "input") {
      const type = (element as HTMLInputElement).type;
      const inputRoles: Record<string, string> = {
        button: "button",
        submit: "button",
        reset: "button",
        checkbox: "checkbox",
        radio: "radio",
        email: "textbox",
        password: "textbox",
        text: "textbox",
        search: "searchbox",
        number: "spinbutton",
        range: "slider",
        tel: "textbox",
        url: "textbox",
        date: "textbox",
        time: "textbox",
        file: "button",
      };
      return inputRoles[type] || "textbox";
    }

    return undefined;
  }

  private getAccessibleName(element: Element): string | undefined {
    // Check aria-label
    const ariaLabel = element.getAttribute("aria-label");
    if (ariaLabel) return ariaLabel.trim();

    // Check aria-labelledby
    const ariaLabelledBy = element.getAttribute("aria-labelledby");
    if (ariaLabelledBy) {
      const labelElement = document.getElementById(ariaLabelledBy);
      if (labelElement) return labelElement.textContent?.trim();
    }

    // Check placeholder
    const placeholder = (element as HTMLInputElement).placeholder;
    if (placeholder) return placeholder.trim();

    // Check alt text for images
    const alt = (element as HTMLImageElement).alt;
    if (alt) return alt.trim();

    // Check text content for buttons and links
    const tagName = element.tagName.toLowerCase();
    if (["button", "a"].includes(tagName)) {
      return element.textContent?.trim();
    }

    // Check value for input buttons
    if (tagName === "input") {
      const inputType = (element as HTMLInputElement).type;
      if (["button", "submit", "reset"].includes(inputType)) {
        return (element as HTMLInputElement).value?.trim();
      }
    }

    // Check label association
    if (element.id) {
      const label = document.querySelector(`label[for="${element.id}"]`);
      if (label) return label.textContent?.trim();
    }

    // Check wrapping label
    const parentLabel = element.closest("label");
    if (parentLabel) {
      const clone = parentLabel.cloneNode(true) as HTMLElement;
      const inputs = clone.querySelectorAll("input, select, textarea");
      inputs.forEach((input) => input.remove());
      const labelText = clone.textContent?.trim();
      if (labelText) return labelText;
    }

    return undefined;
  }

  private getHint(element: Element): string {
    // Try to get a meaningful hint from the element
    const name = this.getAccessibleName(element);
    if (name) {
      return this.sanitizeHint(name);
    }

    const id = element.id;
    if (id && !this.looksAutoGenerated(id)) {
      return this.sanitizeHint(id);
    }

    const placeholder = (element as HTMLInputElement).placeholder;
    if (placeholder) {
      return this.sanitizeHint(placeholder);
    }

    // Use stable classes as hint
    const stableClasses = Array.from(element.classList)
      .filter((cls) => !this.looksAutoGenerated(cls))
      .slice(0, 1);
    if (stableClasses.length > 0) {
      return this.sanitizeHint(stableClasses[0]);
    }

    const tagName = element.tagName.toLowerCase();
    return tagName;
  }

  private sanitizeHint(str: string): string {
    return str
      .substring(0, 20) // Increased from 12 for better uniqueness
      .replace(/[^a-zA-Z0-9]/g, "")
      .toLowerCase();
  }

  private getFrameChain(element: Element): string[] {
    const chain: string[] = [];
    let current = element;

    // Check for shadow DOM
    while (current) {
      const shadowRoot = current.getRootNode();
      if (shadowRoot instanceof ShadowRoot) {
        const host = shadowRoot.host;
        chain.unshift(host.tagName.toLowerCase());
        current = host;
      } else {
        break;
      }
    }

    return chain;
  }
}

// Declare global type for the window object
declare global {
  interface Window {
    __QATagger: QATagger;
  }
}

// Initialize and expose the API
const qaTagger = new QATagger();
window.__QATagger = qaTagger;

// Export types for use in other modules
export type { LocatorBundle, RoleLocator, ElementPickedMessage, QATaggerAPI };
