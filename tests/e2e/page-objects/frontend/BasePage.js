/**
 * Base Page Object class that all other page objects extend
 */
class BasePage {
  /**
   * @param {import('@playwright/test').Page} page - Playwright page object
   */
  constructor(page) {
    this.page = page;

    // Common selectors
    // Target main menu estimator specifically
    this.headerEstimateLink = '#menu-header-menu .product-estimator-menu-item a.product-estimator-button';
    this.mobileEstimateLink = '#ocean-mobile-menu-icon + .mobile-menu .product-estimator-menu-item a';
    this.fallbackEstimateLink = 'a.product-estimator-button, .product-estimator-menu-item a, a.product-estimator-link, a[href*="product-estimator"], button.product-estimator-link';

    // Modal selectors based on the actual template
    this.modalContainer = '#product-estimator-modal, .product-estimator-modal-container';
    this.loadingIndicator = '.product-estimator-modal-loading, .loading-spinner';
  }

  /**
   * Wait for page load with network idle
   * @returns {Promise<void>}
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Wait for an element to be visible on the page
   * @param {string|Array<string>} selector - The selector(s) to wait for
   * @param {Object} options - Additional options
   * @param {number} options.timeout - Maximum time to wait in milliseconds
   * @param {boolean} options.waitForVisible - Whether to wait for visibility (true) or just presence (false)
   * @param {boolean} options.optional - Whether the element is optional (won't fail if not found)
   * @returns {Promise<boolean>} True if element was found, false otherwise
   */
  async waitForElement(selector, options = {}) {
    const {
      timeout = 30000,
      waitForVisible = true,
      optional = false
    } = options;

    // If we have an array of selectors, try each one
    if (Array.isArray(selector)) {
      // console.log(`Waiting for any of ${selector.length} selectors to be available...`);

      // Try each selector in sequence
      for (const singleSelector of selector) {
        try {
          const found = await this.waitForElement(singleSelector, {
            timeout: Math.min(5000, timeout), // Short timeout for each individual selector
            waitForVisible,
            optional: true // Don't throw error for individual selectors
          });

          if (found) {
            // console.log(`Found element with selector: ${singleSelector}`);
            return true;
          }
        } catch (e) {
          // Ignore errors for individual selectors
        }
      }

      // If we get here, none of the selectors matched
      if (optional) {
        // console.log(`None of the ${selector.length} selectors were found, but element was optional`);
        return false;
      } else {
        throw new Error(`None of the ${selector.length} selectors were found within ${timeout}ms`);
      }
    }

    // Handle a single selector
    try {
      // console.log(`Waiting for element with selector: ${selector}`);
      const locator = this.page.locator(selector);

      // First check if the element exists at all
      const count = await locator.count();
      if (count === 0) {
        if (optional) {
          // console.log(`Element with selector "${selector}" not found, but element was optional`);
          return false;
        }

        // Wait for the element to appear
        await this.page.waitForSelector(selector, { timeout });
      }

      // If we only care about presence, not visibility, we're done
      if (!waitForVisible) {
        // console.log(`Element with selector "${selector}" found (presence only)`);
        return true;
      }

      // Wait for the element to be visible
      // If we have multiple elements, check each one
      if (count > 1) {
        for (let i = 0; i < count; i++) {
          try {
            const element = locator.nth(i);
            const isVisible = await element.isVisible();
            if (isVisible) {
              // console.log(`Found visible element with selector "${selector}" at index ${i}`);
              return true;
            }
          } catch (e) {
            // Continue to the next element
          }
        }

        // If we get here, none of the elements were visible
        if (optional) {
          // console.log(`None of the ${count} elements with selector "${selector}" were visible, but element was optional`);
          return false;
        } else {
          throw new Error(`None of the ${count} elements with selector "${selector}" were visible within ${timeout}ms`);
        }
      } else {
        // Just one element, check if it's visible
        await locator.waitFor({ state: 'visible', timeout });
        // console.log(`Element with selector "${selector}" is now visible`);
        return true;
      }
    } catch (error) {
      if (optional) {
        // console.log(`Element with selector "${selector}" not found or not visible, but element was optional`);
        return false;
      } else {
        console.error(`Error waiting for element "${selector}": ${error.message}`);
        throw error;
      }
    }
  }

  /**
   * Wait for loading indicator to disappear and modal to be ready (optimized version)
   * @param {number|Object} [options=30000] - Timeout in ms or options object with timeout property
   * @returns {Promise<boolean>} - Whether the modal or key elements were found
   */
  async waitForLoadingComplete(options = 30000) {
    try {
      // Extract timeout from arguments, defaulting to 30000
      let timeout = 30000;
      if (typeof options === 'number') {
        timeout = options;
      } else if (options && typeof options === 'object' && options.timeout) {
        timeout = options.timeout;
      }

      // Use a single evaluate call to efficiently check loading status
      // This avoids multiple round-trips between test runner and browser

      // Pass parameters as a single object to prevent "Too many arguments" error
      const maxWaitTime = timeout - 1000; // Subtract 1s for overhead
      const loadingSelector = this.loadingIndicator;

      const result = await this.page.evaluate(async (params) => {
        const { maxWaitTime, loadingSelector } = params;
        const startTime = Date.now();
        let result = { loadingFound: false, modalFound: false, completion: 'timeout' };

        // Helper function to check if an element is visible
        const isVisible = (selector) => {
          const el = document.querySelector(selector);
          return el && (window.getComputedStyle(el).display !== 'none') &&
                 (window.getComputedStyle(el).visibility !== 'hidden');
        };

        // First check if loading indicator exists and is visible
        const initiallyLoading = isVisible(loadingSelector);
        result.loadingFound = initiallyLoading;

        // If loading indicator visible, wait for it to disappear
        if (initiallyLoading) {
          // Poll until invisible or timeout (using efficient browser-side polling)
          while (Date.now() - startTime < maxWaitTime) {
            if (!isVisible(loadingSelector)) {
              result.completion = 'loading-disappeared';
              break;
            }
            // Simple wait using setTimeout and Promise
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        } else {
          result.completion = 'no-loading-indicator';
        }

        // Check for modal visibility or key elements
        const keySelectors = [
          '#product-estimator-modal',
          '.product-estimator-modal-form-container',
          '#new-estimate-form',
          '#estimates',
          '#rooms'
        ];

        for (const selector of keySelectors) {
          if (isVisible(selector)) {
            result.modalFound = true;
            result.visibleElement = selector;
            break;
          }
        }

        // Return detailed result
        return {
          ...result,
          duration: Date.now() - startTime,
          finalState: {
            modalVisible: isVisible('#product-estimator-modal'),
            loadingVisible: isVisible(loadingSelector),
            newEstimateFormVisible: isVisible('#new-estimate-form'),
            estimatesVisible: isVisible('#estimates'),
            roomsVisible: isVisible('#rooms')
          }
        };
      }, { maxWaitTime, loadingSelector });

      // Loading completed successfully

      // If we didn't find the modal or any key elements, do a quick follow-up check
      if (!result.modalFound) {
        const quickCheck = await this.isModalVisible();
        if (quickCheck) {
          return true;
        } else {
          // Try most important form elements directly
          const formPresent = await this.page.locator('#new-estimate-form, #estimates, #rooms').isVisible();
          if (formPresent) {
            return true;
          }
          return false;
        }
      }

      return true;
    } catch (error) {
      return false; // Don't throw error, just return false
    }
  }

  /**
   * Click the header estimate link
   * @returns {Promise<void>}
   */
  async clickHeaderEstimateLink() {
    try {
      // Take a screenshot for debugging
      // await this.page.screenshot({ path: 'test-results/before-click-header.png' });
      // console.log('Looking for Estimator button in the header...');

      // Wait for the page to be fully loaded
      await this.page.waitForLoadState('domcontentloaded');
      await this.page.waitForLoadState('networkidle');
      await this.page.waitForTimeout(1000); // Extra wait to ensure everything is initialized

      // First try the main menu estimator link specifically
      let mainMenuEstimatorButton = this.page.locator(this.headerEstimateLink);
      let count = await mainMenuEstimatorButton.count();

      if (count > 0) {
        // console.log('Found Estimator button in main menu');
        await mainMenuEstimatorButton.click({ timeout: 30000 });
        // console.log('Clicked the Estimator button in main menu');
        await this.page.waitForTimeout(2000); // Wait a bit after clicking
        // await this.page.screenshot({ path: 'test-results/after-click-header-specific.png' });

        try {
          // Wait for the modal or next page to load
          await this.waitForLoadingComplete(60000);
        } catch (error) {
          console.warn(`Warning in waitForLoadingComplete: ${error.message}`);
          // Continue anyway - the modal might still show up
        }
        return;
      }

      // Only try mobile menu if we did not find the main menu button
      let mobileMenuEstimatorButton = this.page.locator(this.mobileEstimateLink);
      count = await mobileMenuEstimatorButton.count();

      if (count > 0) {
        // We might need to open the mobile menu first
        const mobileMenuToggle = this.page.locator('#ocean-mobile-menu-icon');
        if (await mobileMenuToggle.count() > 0) {
          // console.log('Opening mobile menu...');
          await mobileMenuToggle.click();
          await this.page.waitForTimeout(1000); // Wait for menu animation
        }

        // console.log('Found Estimator button in mobile menu');
        await mobileMenuEstimatorButton.click({ timeout: 30000 });
        // console.log('Clicked the Estimator button in mobile menu');
        await this.page.waitForTimeout(2000); // Wait a bit after clicking
        // await this.page.screenshot({ path: 'test-results/after-click-header-mobile.png' });

        try {
          // Wait for the modal or next page to load
          await this.waitForLoadingComplete(60000);
        } catch (error) {
          console.warn(`Warning in waitForLoadingComplete: ${error.message}`);
          // Continue anyway - the modal might still show up
        }
        return;
      }

      // Try alternative selectors
      // console.log('Trying alternative selectors...');
      const selectorOptions = [
        // Target the estimator link more precisely by location
        'ul#menu-header-menu li.product-estimator-menu-item a',  // Main desktop menu
        'div.oceanwp-mobile-menu-icon + div.mobile-menu li.product-estimator-menu-item a', // Mobile menu
        '.main-menu .product-estimator-menu-item a',   // Another way to target main menu
        '#site-navigation .product-estimator-menu-item a', // Navigation container
        // Fallbacks with less specific selectors
        '.product-estimator-menu-item a',              // Any menu item containing the link
        'a.product-estimator-button',                  // Any link with the button class
        'a.product-estimator-link',                    // Any link with estimator class
        'a[href="#"].product-estimator-button',        // Links with href="#" and specific class
        'nav a:has-text("Estimator")',                 // Any link in nav with text Estimator
        'header a:has-text("Estimator")'               // Any link in header with text Estimator
      ];

      for (const selector of selectorOptions) {
        const linkLocator = this.page.locator(selector);
        count = await linkLocator.count();

        if (count > 0) {
          // console.log(`Found ${count} matching elements with selector: ${selector}`);

          // If we have multiple matches, we need to determine which one to click
          if (count > 1) {
            // console.log(`Multiple matches (${count}) found with selector: ${selector}`);

            // Take a screenshot for debugging
            // await this.page.screenshot({ path: `test-results/before-click-multiple-${selector.replace(/[^a-zA-Z0-9]/g, '_')}.png` });

            // Try to find a visible one
            const elements = await linkLocator.all();
            let clicked = false;

            for (let i = 0; i < elements.length; i++) {
              const element = elements[i];
              const isVisible = await element.isVisible();
              const boundingBox = await element.boundingBox();

              // Only click if the element is visible and has size
              if (isVisible && boundingBox && boundingBox.width > 0 && boundingBox.height > 0) {
                // console.log(`Clicking visible element at index ${i} with selector: ${selector}`);
                await element.click({ timeout: 30000 });
                // console.log(`Clicked element at index ${i}`);
                clicked = true;
                break;
              }
            }

            // If we didn't find a visible element, fall back to first() but with force option
            if (!clicked) {
              // console.log(`No visible elements found, forcing click on first element with selector: ${selector}`);
              await linkLocator.first().click({ timeout: 30000, force: true });
              // console.log(`Forced click on first element`);
            }
          } else {
            // Just one match, click it normally
            await linkLocator.first().click({ timeout: 30000 });
            // console.log(`Clicked element with selector: ${selector}`);
          }

          await this.page.waitForTimeout(2000); // Wait a bit after clicking
          // await this.page.screenshot({ path: `test-results/after-click-header-${selector.replace(/[^a-zA-Z0-9]/g, '_')}.png` });

          try {
            // Wait for the modal or next page to load
            await this.waitForLoadingComplete(60000);
          } catch (error) {
            console.warn(`Warning in waitForLoadingComplete: ${error.message}`);
            // Continue anyway - the modal might still show up
          }
          return;
        }
      }

      // If that fails, try using a text-based approach
      // console.log('No links found with CSS selectors, trying text approach...');

      // Try various text options with and without case sensitivity
      const textOptions = ['Estimator', 'ESTIMATOR', 'estimator', 'Estimate', 'Product Estimator', 'Start Estimate'];

      for (const text of textOptions) {
        // First try exact text
        let linkByText = this.page.getByText(text, { exact: true });
        if (await linkByText.count() > 0) {
          // console.log(`Found link with exact text "${text}"`);
          await linkByText.first().click({ timeout: 30000 });
          // console.log(`Clicked link with exact text "${text}"`);
          await this.page.waitForTimeout(2000);
          // await this.page.screenshot({ path: `test-results/after-click-text-exact-${text}.png` });

          try {
            // Wait for the modal or next page to load
            await this.waitForLoadingComplete(60000);
          } catch (error) {
            console.warn(`Warning in waitForLoadingComplete: ${error.message}`);
            // Continue anyway - the modal might still show up
          }
          return;
        }

        // Then try partial text
        linkByText = this.page.getByText(text, { exact: false });
        if (await linkByText.count() > 0) {
          // console.log(`Found link with partial text "${text}"`);
          await linkByText.first().click({ timeout: 30000 });
          // console.log(`Clicked link with partial text "${text}"`);
          await this.page.waitForTimeout(2000);
          // await this.page.screenshot({ path: `test-results/after-click-text-partial-${text}.png` });

          try {
            // Wait for the modal or next page to load
            await this.waitForLoadingComplete(60000);
          } catch (error) {
            console.warn(`Warning in waitForLoadingComplete: ${error.message}`);
            // Continue anyway - the modal might still show up
          }
          return;
        }
      }

      // If nothing works, try a last resort - get all links and inspect their text in JS
      // console.log('Last resort: examining all links on page...');

      // Take another debug screenshot
      // await this.page.screenshot({ path: 'test-results/all-links-debug.png' });

      // Try to find and click a link or button with estimator-related text or classes
      const foundAndClicked = await this.page.evaluate(() => {
        // Look for terms in text content, href, class, or id
        const terms = ['estimator', 'estimate', 'product-estimator'];

        // Look through all links and buttons
        const elements = [...document.querySelectorAll('a, button')];

        for (const element of elements) {
          const text = element.textContent?.toLowerCase() || '';
          const href = element.getAttribute('href')?.toLowerCase() || '';
          const className = element.className?.toLowerCase() || '';
          const id = element.id?.toLowerCase() || '';

          // Check if any term matches
          for (const term of terms) {
            if (text.includes(term) || href.includes(term) || className.includes(term) || id.includes(term)) {
              // console.log(`[Browser] Found and clicking element with term: ${term}`);
              element.click();
              return true;
            }
          }
        }

        return false;
      });

      if (foundAndClicked) {
        // console.log('Found and clicked an element via browser-side JavaScript');
        await this.page.waitForTimeout(2000);
        // await this.page.screenshot({ path: 'test-results/after-js-click.png' });

        try {
          // Wait for the modal or next page to load
          await this.waitForLoadingComplete(60000);
        } catch (error) {
          console.warn(`Warning in waitForLoadingComplete: ${error.message}`);
          // Continue anyway - the modal might still show up
        }
        return;
      }

      // If we reach here, we couldn't find the link - take a final screenshot showing all elements
      // console.log('Could not find any estimator link or button. Taking a final debug screenshot...');
      // await this.page.screenshot({ path: 'test-results/final-debug.png' });

      // Dump the HTML for debugging
      const html = await this.page.content();
      // console.log('Page HTML for debugging:');
      // console.log(html.substring(0, 5000) + '... [truncated]'); // Log first 5000 chars

      throw new Error('Could not find any estimate link in the header after trying all strategies');
    } catch (error) {
      console.error(`Error clicking estimate link: ${error.message}`);
      await this.page.screenshot({ path: 'test-results/error-screenshot.png' });
      throw error;
    }
  }

  /**
   * Check if modal is visible
   * @returns {Promise<boolean>}
   */
  async isModalVisible() {
    try {
      // Check for the main product-estimator-modal
      const specificModalContainer = await this.page.locator('#product-estimator-modal').isVisible();
      if (specificModalContainer) {
        // console.log('Modal found with #product-estimator-modal selector');
        return true;
      }

      // Check using the combined selector from the constructor
      const modalContainer = await this.page.locator(this.modalContainer).isVisible();
      if (modalContainer) {
        // console.log(`Modal found with "${this.modalContainer}" selector`);
        return true;
      }

      // Try all the components that could be part of the modal
      const alternateSelectors = [
        '.product-estimator-modal',
        '.product-estimator-modal-container',
        '.product-estimator-modal-form-container',
        '.product-estimator-modal-header',
        '#estimates',
        '#new-estimate-form-wrapper',
        '#new-room-form-wrapper',
        '#estimate-selection-wrapper',
        '#room-selection-form-wrapper',
        // Generic modal selectors as fallback
        '.modal',
        '.modal-container',
        '.modal-content',
        'div[role="dialog"]'
      ];

      for (const selector of alternateSelectors) {
        try {
          const elements = await this.page.locator(selector).all();
          for (const element of elements) {
            if (await element.isVisible()) {
              // console.log(`Modal component found with selector: ${selector}`);
              return true;
            }
          }
        } catch (e) {
          // Ignore errors for individual selectors
        }
      }

      // If we get here, check if there's any interaction blocker visible (overlay)
      const overlaySelectors = [
        '.product-estimator-modal-overlay',
        '.modal-backdrop',
        '.overlay',
        '.backdrop'
      ];

      for (const selector of overlaySelectors) {
        try {
          const elements = await this.page.locator(selector).all();
          for (const element of elements) {
            if (await element.isVisible()) {
              // console.log(`Modal overlay found with selector: ${selector}`);
              return true;
            }
          }
        } catch (e) {
          // Ignore errors for individual selectors
        }
      }

      // If we get here, don't take a screenshot - only on errors

      // Log the current page HTML elements to help debug
      try {
        // console.log('Looking for any modal-related elements in the DOM...');
        const modalRelatedElements = await this.page.evaluate(() => {
          // Look for any elements with IDs or classes containing 'modal', 'estimator', 'estimate'
          const allElements = document.querySelectorAll('*');
          const relevantElements = [];

          for (const el of allElements) {
            const id = el.id || '';
            const className = el.className || '';

            if (id.includes('modal') || id.includes('estimator') || id.includes('estimate') ||
                (typeof className === 'string' && (
                  className.includes('modal') ||
                  className.includes('estimator') ||
                  className.includes('estimate')
                ))) {
              relevantElements.push({
                tag: el.tagName,
                id: id,
                class: className,
                visible: el.offsetWidth > 0 && el.offsetHeight > 0
              });
            }
          }

          return relevantElements;
        });

        // console.log('Modal-related elements found in DOM:', modalRelatedElements);
      } catch (e) {
        console.error('Error analyzing DOM for modal elements:', e.message);
      }

      return false;
    } catch (error) {
      console.error(`Error checking modal visibility: ${error.message}`);
      return false;
    }
  }

  /**
   * Get text of validation error message
   * @param {string} fieldName - Form field name or identifier
   * @returns {Promise<string>} Error message text
   */
  async getValidationError(fieldName) {
    try {
      // console.log(`Looking for validation error for field "${fieldName}"...`);

      // Take a screenshot of the current form state with errors
      await this.page.screenshot({ path: `test-results/validation-error-${fieldName}.png`, fullPage: true });

      // Try multiple selector patterns for error messages
      const errorSelectors = [
        `.pe-form-error[data-field="${fieldName}"]`,             // Using data-field attribute
        `.pe-form-error[data-for="${fieldName}"]`,               // Using data-for attribute
        `.pe-form-error.${fieldName}-error`,                     // Using class with field name
        `.pe-form-error.error-${fieldName}`,                     // Another class pattern
        `label[for="${fieldName}"] + .pe-form-error`,            // Error after label
        `input[name="${fieldName}"] + .pe-form-error`,           // Error after input
        `input[name="${fieldName}"] ~ .pe-form-error`,           // Error as sibling to input
        `#${fieldName.replace('_', '-')} + .pe-form-error`,      // Error after element with hyphens (HTML format)
        `#${fieldName.replace('_', '-')} ~ .pe-form-error`,      // Error as sibling with hyphens (HTML format)
        `.field-${fieldName} .pe-form-error`,                    // Error inside field container
        `[data-field="${fieldName}"] .error-message`,            // Generic error message
        `.pe-validation-error[data-field="${fieldName}"]`,       // Alternative validation class
        `#${fieldName}-error`,                                   // ID-based error
        `#${fieldName.replace('_', '-')}-error`,                 // ID-based error with hyphens (HTML format)
        `.error-message:has-text("${fieldName}")`,               // Error message containing field name
        `.pe-form-error`,                                        // Any form error (last resort)
        `.validation-error`,                                     // Any validation error (last resort)
        `.error-message`                                         // Any error message (very last resort)
      ];

      for (const selector of errorSelectors) {
        const errorLocator = this.page.locator(selector);
        const count = await errorLocator.count();

        if (count > 0) {
          // console.log(`Found ${count} error message elements with selector: ${selector}`);

          // Get the text of the first visible error message
          for (let i = 0; i < count; i++) {
            const error = errorLocator.nth(i);
            const isVisible = await error.isVisible();

            if (isVisible) {
              const text = await error.textContent();
              console.log(`Found visible error message: "${text}"`);
              return text.trim();
            }
          }
        }
      }

      // If we couldn't find a specific error, check for any validation error
      // console.log('Could not find specific error message, checking for any validation errors');

      // Look for any error messages on the form
      const anyErrorSelector = [
        '.pe-form-error',
        '.validation-error',
        '.error-message',
        '.field-error',
        '.form-error',
        'input.error ~ .error-text',
        '.error-text',
        'div[role="alert"]'
      ];

      for (const selector of anyErrorSelector) {
        const anyErrorLocator = this.page.locator(selector);
        const count = await anyErrorLocator.count();

        if (count > 0) {
          // console.log(`Found ${count} generic error elements with selector: ${selector}`);

          // Get all error texts
          const allErrors = [];
          for (let i = 0; i < count; i++) {
            const error = anyErrorLocator.nth(i);
            if (await error.isVisible()) {
              const text = await error.textContent();
              if (text && text.trim()) {
                allErrors.push(text.trim());
              }
            }
          }

          if (allErrors.length > 0) {
            // console.log('Found these generic error messages:', allErrors);
            // Filter for messages containing the field name or related terms
            const fieldRelatedError = allErrors.find(error =>
              error.toLowerCase().includes(fieldName.toLowerCase()) ||
              (fieldName === 'postcode' && (
                error.toLowerCase().includes('post') ||
                error.toLowerCase().includes('zip') ||
                error.toLowerCase().includes('code')
              ))
            );

            if (fieldRelatedError) {
              // console.log(`Found error related to ${fieldName}: "${fieldRelatedError}"`);
              return fieldRelatedError;
            }

            // If no field-specific error found, return the first error
            // console.log(`Returning first generic error: "${allErrors[0]}"`);
            return allErrors[0];
          }
        }
      }

      // Check if there are any elements with error styling
      // console.log('Checking if any input fields have error styling...');
      const errorInput = this.page.locator(`input[name="${fieldName}"].error, input[name="${fieldName}"].has-error, input[name="${fieldName}"].invalid`);
      if (await errorInput.count() > 0 && await errorInput.isVisible()) {
        // If the input has error styling but no message, return a generic message
        // console.log(`Input field "${fieldName}" has error styling but no visible error message`);
        return `${fieldName} field has error`;
      }

      // If all else fails, check for error text using JavaScript in the browser
      // console.log('Using JavaScript to search the entire page for error text...');
      const errorText = await this.page.evaluate((field) => {
        // Get the entire text of the page
        const fullText = document.body.innerText;

        // Look for common error message patterns
        const errorPhrases = [
          `${field} required`,
          `${field} is required`,
          `Please enter ${field}`,
          `Invalid ${field}`,
          `enter a valid ${field}`,
          `${field} cannot be empty`,
          'required field',
          'This field is required',
          'cannot be empty',
          'required',
          'invalid'
        ];

        // Check if any of these phrases exist in the page text
        for (const phrase of errorPhrases) {
          if (fullText.toLowerCase().includes(phrase.toLowerCase())) {
            // Find the specific text containing this phrase
            const lines = fullText.split('\n');
            for (const line of lines) {
              if (line.toLowerCase().includes(phrase.toLowerCase())) {
                return line.trim();
              }
            }
            return phrase; // Fallback to the phrase itself
          }
        }

        return null;
      }, fieldName);

      if (errorText) {
        // console.log(`Found error text via JavaScript: "${errorText}"`);
        return errorText;
      }

      // console.log(`No validation error found for field "${fieldName}"`);
      return '';
    } catch (error) {
      console.error(`Error getting validation error: ${error.message}`);
      await this.page.screenshot({ path: `test-results/validation-error-exception-${fieldName}.png`, fullPage: true });
      return '';
    }
  }
}

module.exports = BasePage;
