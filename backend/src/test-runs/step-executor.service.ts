import { Injectable } from '@nestjs/common';
import { Page, Locator, expect } from '@playwright/test';
import { PlaywrightService } from './playwright.service';

// Locator bundle structure matching the DTO
interface LocatorBundle {
  qaId?: string;
  role?: { role: string; name?: string };
  testId?: string;
  label?: string;
  placeholder?: string;
  text?: string;
  altText?: string;
  title?: string;
  css?: string;
  xpath?: string;
}

// Step structure from database
interface TestStep {
  id: string;
  stepNumber: number;
  action: string;
  description: string;
  value?: string | null;
  locators?: LocatorBundle | null;
}

export interface StepExecutionResult {
  status: 'PASSED' | 'FAILED' | 'SKIPPED';
  duration: number;
  error?: string;
  locatorUsed?: string;
  screenshot: string;
}

interface ResolvedLocator {
  locator: Locator;
  usedStrategy: string;
}

@Injectable()
export class StepExecutorService {
  constructor(private playwrightService: PlaywrightService) {}

  /**
   * Execute a single test step
   */
  async execute(page: Page, step: TestStep): Promise<StepExecutionResult> {
    const startTime = Date.now();
    let locatorUsed: string | undefined;

    try {
      // Execute based on action type
      switch (step.action.toLowerCase()) {
        case 'navigate':
        case 'goto':
          await this.executeNavigate(page, step);
          break;

        case 'click':
          locatorUsed = await this.executeClick(page, step);
          break;

        case 'fill':
        case 'type':
          locatorUsed = await this.executeFill(page, step);
          break;

        case 'select':
          locatorUsed = await this.executeSelect(page, step);
          break;

        case 'hover':
          locatorUsed = await this.executeHover(page, step);
          break;

        case 'press':
          await this.executePress(page, step);
          break;

        case 'assert':
          locatorUsed = await this.executeAssert(page, step);
          break;

        case 'wait':
          await this.executeWait(step);
          break;

        case 'refresh':
          await page.reload();
          break;

        case 'go_back':
          await page.goBack();
          break;

        case 'clear':
          locatorUsed = await this.executeClear(page, step);
          break;

        case 'double_click':
          locatorUsed = await this.executeDoubleClick(page, step);
          break;

        default:
          throw new Error(`Unknown action type: ${step.action}`);
      }

      // Capture screenshot after successful step
      const screenshot = await this.playwrightService.captureScreenshot(page);
      const duration = Date.now() - startTime;

      return {
        status: 'PASSED',
        duration,
        locatorUsed,
        screenshot,
      };
    } catch (error) {
      // Capture screenshot even on failure
      let screenshot = '';
      try {
        screenshot = await this.playwrightService.captureScreenshot(page);
      } catch {
        // Ignore screenshot errors
      }

      const duration = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      return {
        status: 'FAILED',
        duration,
        error: errorMessage,
        locatorUsed,
        screenshot,
      };
    }
  }

  /**
   * Resolve locator using priority order
   */
  private async resolveLocator(
    page: Page,
    locators: LocatorBundle,
    timeout = 5000,
  ): Promise<ResolvedLocator> {
    const strategies: Array<{
      key: string;
      resolve: () => Locator | null;
    }> = [
      // 1. QA ID (custom attribute)
      {
        key: 'qaId',
        resolve: () =>
          locators.qaId ? page.locator(`[data-qa-id="${locators.qaId}"]`) : null,
      },
      // 2. Role locator (semantic, most stable)
      {
        key: 'role',
        resolve: () => {
          if (!locators.role) return null;
          const role = locators.role.role as
            | 'button'
            | 'link'
            | 'textbox'
            | 'checkbox'
            | 'radio'
            | 'combobox'
            | 'listbox'
            | 'option'
            | 'heading'
            | 'img'
            | 'navigation'
            | 'main'
            | 'banner'
            | 'contentinfo'
            | 'region'
            | 'dialog'
            | 'alert'
            | 'alertdialog'
            | 'menu'
            | 'menuitem'
            | 'menubar'
            | 'tab'
            | 'tablist'
            | 'tabpanel'
            | 'tree'
            | 'treeitem'
            | 'grid'
            | 'gridcell'
            | 'row'
            | 'rowgroup'
            | 'rowheader'
            | 'columnheader'
            | 'cell'
            | 'article'
            | 'complementary'
            | 'form'
            | 'list'
            | 'listitem'
            | 'figure'
            | 'search'
            | 'separator'
            | 'slider'
            | 'spinbutton'
            | 'status'
            | 'switch'
            | 'table'
            | 'progressbar';
          return page.getByRole(role, { name: locators.role.name });
        },
      },
      // 3. Test ID
      {
        key: 'testId',
        resolve: () =>
          locators.testId ? page.getByTestId(locators.testId) : null,
      },
      // 4. Label
      {
        key: 'label',
        resolve: () => (locators.label ? page.getByLabel(locators.label) : null),
      },
      // 5. Placeholder
      {
        key: 'placeholder',
        resolve: () =>
          locators.placeholder
            ? page.getByPlaceholder(locators.placeholder)
            : null,
      },
      // 6. Text
      {
        key: 'text',
        resolve: () => (locators.text ? page.getByText(locators.text) : null),
      },
      // 7. Alt text
      {
        key: 'altText',
        resolve: () =>
          locators.altText ? page.getByAltText(locators.altText) : null,
      },
      // 8. Title
      {
        key: 'title',
        resolve: () =>
          locators.title ? page.getByTitle(locators.title) : null,
      },
      // 9. CSS selector
      {
        key: 'css',
        resolve: () => (locators.css ? page.locator(locators.css) : null),
      },
      // 10. XPath (last resort)
      {
        key: 'xpath',
        resolve: () =>
          locators.xpath ? page.locator(`xpath=${locators.xpath}`) : null,
      },
    ];

    for (const strategy of strategies) {
      const locator = strategy.resolve();
      if (locator) {
        try {
          // Try to find the element with this strategy
          await locator.first().waitFor({ state: 'visible', timeout });
          return { locator: locator.first(), usedStrategy: strategy.key };
        } catch {
          // Strategy failed, try next
          continue;
        }
      }
    }

    throw new Error(
      'ELEMENT_NOT_FOUND: No locator strategy succeeded. Tried: ' +
        strategies
          .filter((s) => s.resolve() !== null)
          .map((s) => s.key)
          .join(', '),
    );
  }

  // Action implementations

  private async executeNavigate(page: Page, step: TestStep): Promise<void> {
    if (!step.value) {
      throw new Error('Navigate action requires a URL value');
    }
    await page.goto(step.value, { waitUntil: 'domcontentloaded' });
  }

  private async executeClick(page: Page, step: TestStep): Promise<string> {
    if (!step.locators) {
      throw new Error('Click action requires locators');
    }
    const { locator, usedStrategy } = await this.resolveLocator(
      page,
      step.locators,
    );
    await locator.click();
    return usedStrategy;
  }

  private async executeDoubleClick(page: Page, step: TestStep): Promise<string> {
    if (!step.locators) {
      throw new Error('Double click action requires locators');
    }
    const { locator, usedStrategy } = await this.resolveLocator(
      page,
      step.locators,
    );
    await locator.dblclick();
    return usedStrategy;
  }

  private async executeFill(page: Page, step: TestStep): Promise<string> {
    if (!step.locators) {
      throw new Error('Fill action requires locators');
    }
    const { locator, usedStrategy } = await this.resolveLocator(
      page,
      step.locators,
    );
    await locator.fill(step.value || '');
    return usedStrategy;
  }

  private async executeSelect(page: Page, step: TestStep): Promise<string> {
    if (!step.locators) {
      throw new Error('Select action requires locators');
    }
    const { locator, usedStrategy } = await this.resolveLocator(
      page,
      step.locators,
    );
    await locator.selectOption(step.value || '');
    return usedStrategy;
  }

  private async executeHover(page: Page, step: TestStep): Promise<string> {
    if (!step.locators) {
      throw new Error('Hover action requires locators');
    }
    const { locator, usedStrategy } = await this.resolveLocator(
      page,
      step.locators,
    );
    await locator.hover();
    return usedStrategy;
  }

  private async executePress(page: Page, step: TestStep): Promise<void> {
    if (!step.value) {
      throw new Error('Press action requires a key value');
    }
    await page.keyboard.press(step.value);
  }

  private async executeClear(page: Page, step: TestStep): Promise<string> {
    if (!step.locators) {
      throw new Error('Clear action requires locators');
    }
    const { locator, usedStrategy } = await this.resolveLocator(
      page,
      step.locators,
    );
    await locator.clear();
    return usedStrategy;
  }

  private async executeWait(step: TestStep): Promise<void> {
    const seconds = parseFloat(step.value || '1');
    await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
  }

  private async executeAssert(page: Page, step: TestStep): Promise<string> {
    // Parse assertion type from locators or description
    const assertionType = this.parseAssertionType(step);
    let usedStrategy = '';

    switch (assertionType) {
      case 'text_equals':
      case 'text_contains':
        if (!step.locators) {
          throw new Error('Text assertion requires locators');
        }
        const textResult = await this.resolveLocator(page, step.locators);
        usedStrategy = textResult.usedStrategy;
        if (assertionType === 'text_equals') {
          await expect(textResult.locator).toHaveText(step.value || '');
        } else {
          await expect(textResult.locator).toContainText(step.value || '');
        }
        break;

      case 'visible':
        if (!step.locators) {
          throw new Error('Visibility assertion requires locators');
        }
        const visibleResult = await this.resolveLocator(page, step.locators);
        usedStrategy = visibleResult.usedStrategy;
        await expect(visibleResult.locator).toBeVisible();
        break;

      case 'not_visible':
      case 'hidden':
        if (!step.locators) {
          throw new Error('Hidden assertion requires locators');
        }
        // For hidden elements, we can't use resolveLocator since it waits for visible
        // Instead, directly check the first available locator
        const hiddenLocator = this.getFirstAvailableLocator(page, step.locators);
        if (!hiddenLocator) {
          throw new Error('No locator available for hidden assertion');
        }
        await expect(hiddenLocator.locator).not.toBeVisible();
        usedStrategy = hiddenLocator.strategy;
        break;

      case 'url_contains':
        await expect(page).toHaveURL(new RegExp(step.value || ''));
        usedStrategy = 'url';
        break;

      case 'url_equals':
        await expect(page).toHaveURL(step.value || '');
        usedStrategy = 'url';
        break;

      case 'title_contains':
        await expect(page).toHaveTitle(new RegExp(step.value || ''));
        usedStrategy = 'title';
        break;

      case 'title_equals':
        await expect(page).toHaveTitle(step.value || '');
        usedStrategy = 'title';
        break;

      default:
        // Default to visibility check
        if (step.locators) {
          const defaultResult = await this.resolveLocator(page, step.locators);
          usedStrategy = defaultResult.usedStrategy;
          await expect(defaultResult.locator).toBeVisible();
        }
    }

    return usedStrategy;
  }

  private parseAssertionType(step: TestStep): string {
    // Check if assertionType is stored in locators (our extension stores it there)
    const locatorsAny = step.locators as Record<string, unknown> | null;
    if (locatorsAny?.assertionType) {
      return locatorsAny.assertionType as string;
    }

    // Parse from description
    const desc = step.description.toLowerCase();
    if (desc.includes('text equals') || desc.includes('text_equals')) {
      return 'text_equals';
    }
    if (desc.includes('text contains') || desc.includes('text_contains')) {
      return 'text_contains';
    }
    if (desc.includes('not visible') || desc.includes('not_visible') || desc.includes('hidden')) {
      return 'not_visible';
    }
    if (desc.includes('visible')) {
      return 'visible';
    }
    if (desc.includes('url contains') || desc.includes('url_contains')) {
      return 'url_contains';
    }
    if (desc.includes('url equals') || desc.includes('url_equals')) {
      return 'url_equals';
    }
    if (desc.includes('title contains') || desc.includes('title_contains')) {
      return 'title_contains';
    }
    if (desc.includes('title equals') || desc.includes('title_equals')) {
      return 'title_equals';
    }

    // Default to visible
    return 'visible';
  }

  private getFirstAvailableLocator(
    page: Page,
    locators: LocatorBundle,
  ): { locator: Locator; strategy: string } | null {
    if (locators.qaId) {
      return {
        locator: page.locator(`[data-qa-id="${locators.qaId}"]`).first(),
        strategy: 'qaId',
      };
    }
    if (locators.testId) {
      return { locator: page.getByTestId(locators.testId).first(), strategy: 'testId' };
    }
    if (locators.css) {
      return { locator: page.locator(locators.css).first(), strategy: 'css' };
    }
    if (locators.xpath) {
      return { locator: page.locator(`xpath=${locators.xpath}`).first(), strategy: 'xpath' };
    }
    if (locators.text) {
      return { locator: page.getByText(locators.text).first(), strategy: 'text' };
    }
    return null;
  }
}
