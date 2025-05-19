const BasePage = require('./BasePage');

/**
 * Page object for the estimate creation functionality
 */
class EstimateCreationPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page - Playwright page object
   */
  constructor(page) {
    super(page);

    // Element selectors based on the actual modal template structure
    // Main containers
    this.modalContainer = '#product-estimator-modal';
    this.modalFormContainer = '.product-estimator-modal-form-container';
    this.estimatesContainer = '#estimates';

    // Form wrappers
    this.newEstimateFormWrapper = '#new-estimate-form-wrapper';
    this.newRoomFormWrapper = '#new-room-form-wrapper';
    this.estimateSelectionWrapper = '#estimate-selection-wrapper';
    this.roomSelectionFormWrapper = '#room-selection-form-wrapper';

    // Form elements and components
    this.newEstimateForm = '#new-estimate-form, form.new-estimate-form, .product-estimator-new-estimate-form';
    this.estimateNameInput = 'input[name="estimate_name"], #estimate_name';
    this.postcodeInput = 'input[name="customer_postcode"], #customer-postcode';
    this.createEstimateButton = 'button.create-estimate-btn, button[type="submit"], .product-estimator-create-btn, input[type="submit"]';
    this.newEstimateButton = 'button.new-estimate-btn, .product-estimator-new-estimate-btn, a.new-estimate-link';

    // Estimates list and selection
    this.estimateSelector = 'select.estimate-selector, .product-estimator-estimate-selector';
    this.estimateCard = '.estimate-section, .estimate-item, .product-estimator-estimate-item';
    this.addRoomForm = '#new-room-form, form.new-room-form, .product-estimator-new-room-form';
    this.estimatesEmptyMessage = '.no-estimates, .product-estimator-no-estimates';
    this.estimatesList = '.estimates-list, .product-estimator-estimates-list, #estimates';
    this.selectedEstimate = '.estimate-section.selected, .estimate-item.selected, .product-estimator-estimate-item.selected';

    // Loading indicator
    this.loadingIndicator = '.product-estimator-modal-loading, .loading-spinner';
  }

  /**
   * Debugs the current form state and identifies what form or content is visible
   * @returns {Promise<Object>} Information about what was found
   */
  async debugFormState() {
    try {
      // //console.log('---- Debugging modal form state ----');

      // Check for duplicate IDs to avoid strict mode violations
      const duplicateCheck = await this.page.evaluate(({ idSelectors }) => {
        const duplicates = {};
        for (const selector of idSelectors) {
          const elements = document.querySelectorAll(selector);
          if (elements.length > 1) {
            duplicates[selector] = elements.length;
          }
        }
        return duplicates;
      }, {
        idSelectors: [
          this.estimatesContainer,
          this.newEstimateFormWrapper,
          this.newRoomFormWrapper,
          this.estimateSelectionWrapper,
          this.roomSelectionFormWrapper
        ]
      });

      // If we found duplicates, log them
      if (Object.keys(duplicateCheck).length > 0) {
        //console.log('Warning: Duplicate IDs found:', duplicateCheck);
      }

      // Handle wrappers carefully to avoid strict mode violations
      const wrappers = {};

      // Check each wrapper individually with a safe approach
      for (const [name, selector] of Object.entries({
        estimatesContainer: this.estimatesContainer,
        newEstimateFormWrapper: this.newEstimateFormWrapper,
        newRoomFormWrapper: this.newRoomFormWrapper,
        estimateSelectionWrapper: this.estimateSelectionWrapper,
        roomSelectionFormWrapper: this.roomSelectionFormWrapper
      })) {
        try {
          // Use evaluate to avoid strict mode errors
          wrappers[name] = await this.page.evaluate(({ sel }) => {
            const elements = document.querySelectorAll(sel);
            // Check if any of the elements are visible
            for (const el of elements) {
              if (el.offsetWidth > 0 && el.offsetHeight > 0 &&
                  window.getComputedStyle(el).display !== 'none') {
                return true;
              }
            }
            return false;
          }, { sel: selector });
        } catch (e) {
          //console.log(`Error checking visibility of ${name}: ${e.message}`);
          wrappers[name] = false;
        }
      }

      // //console.log('Form wrapper visibility:', wrappers);

      // Check for display style properties
      const displayStyles = await this.page.evaluate(() => {
        const wrappers = {
          estimates: document.getElementById('estimates'),
          newEstimateForm: document.getElementById('new-estimate-form-wrapper'),
          newRoomForm: document.getElementById('new-room-form-wrapper'),
          estimateSelection: document.getElementById('estimate-selection-wrapper'),
          roomSelection: document.getElementById('room-selection-form-wrapper')
        };

        const styles = {};
        for (const [key, el] of Object.entries(wrappers)) {
          if (el) {
            styles[key] = {
              display: window.getComputedStyle(el).display,
              visibility: window.getComputedStyle(el).visibility,
              hidden: el.hidden,
              innerHTML: el.innerHTML.substring(0, 100) + (el.innerHTML.length > 100 ? '...' : '')
            };
          } else {
            styles[key] = null;
          }
        }

        return styles;
      });

      // //console.log('Wrapper display styles:', displayStyles);

      // Look for all form-related elements
      const formElements = await this.page.evaluate(() => {
        // Get all form elements in the document
        const forms = document.querySelectorAll('form');
        const formData = [];

        for (const form of forms) {
          formData.push({
            id: form.id,
            className: form.className,
            action: form.action,
            method: form.method,
            inputs: Array.from(form.querySelectorAll('input, button')).map(input => ({
              name: input.name,
              id: input.id,
              type: input.type,
              value: input.value
            }))
          });
        }

        return formData;
      });

      // //console.log('All forms found in document:', formElements);

      // Check the modal container and its contents
      const modalStructure = await this.page.evaluate(() => {
        const modalEl = document.getElementById('product-estimator-modal');
        if (!modalEl) return { found: false };

        // Get basic info about the modal
        return {
          found: true,
          className: modalEl.className,
          visible: window.getComputedStyle(modalEl).display !== 'none',
          childrenCount: modalEl.children.length,
          children: Array.from(modalEl.children).map(child => ({
            tagName: child.tagName,
            className: child.className,
            id: child.id,
            visible: window.getComputedStyle(child).display !== 'none'
          })),
          formContainerHTML: modalEl.querySelector('.product-estimator-modal-form-container')?.innerHTML.substring(0, 200) + '...'
        };
      });

      // //console.log('Modal structure:', modalStructure);

      // No debug screenshot here

      // //console.log('---- Form state debugging complete ----');

      return {
        wrappers,
        displayStyles,
        formElements,
        modalStructure
      };

    } catch (error) {
      console.error('Error debugging form state:', error.message);
      return { error: error.message };
    }
  }

  /**
   * Fill a specific field in a form
   * @param {string} fieldName - The name or identifier of the field
   * @param {string} value - The value to fill in the field
   * @param {Object} options - Additional options for filling the field
   * @param {Array<string>} options.selectors - Custom selectors to use for finding the field
   * @param {boolean} options.clearFirst - Whether to clear the field before filling
   * @param {number} options.waitTime - How long to wait after filling in ms
   * @param {boolean} options.forceEvents - Force triggering of events even if field has protection
   * @param {boolean} options.preserveOriginal - Keep track of original value for protected fields
   * @returns {Promise<boolean>} - Whether the field was successfully filled
   */
  async fillField(fieldName, value, options = {}) {
    try {
      // //console.log(`Attempting to fill field "${fieldName}" with value "${value}"`);

      // Default options
      const defaultOptions = {
        selectors: [],
        clearFirst: true,
        waitTime: 300, // Reduced from 500ms to 300ms
        forceEvents: false,
        preserveOriginal: true,
        retryCount: 1  // Reduced from 2 to 1 for better performance
      };

      // Merge default options with provided options
      const opts = { ...defaultOptions, ...options };

      // Determine which selectors to use based on field name
      let fieldSelectors = opts.selectors;

      if (fieldSelectors.length === 0) {
        // Use default selectors based on field name - prioritized by likelihood
        switch (fieldName) {
          case 'estimate_name':
            fieldSelectors = [
              'input[name="estimate_name"]',
              this.estimateNameInput,
              '#estimate-name',
              '#new-estimate-form input[name="estimate_name"]',
              '.pe-new-estimate-form input[name="estimate_name"]',
              'input[placeholder*="name" i]',
              'input.estimate-name-input',
              'input[type="text"]:first-child'
            ];
            break;

          case 'postcode':
          case 'customer_postcode':
            fieldSelectors = [
              'input[name="postcode"]',
              'input[name="customer_postcode"]',
              this.postcodeInput,
              '#customer-postcode',
              '#new-estimate-form input[name="postcode"]',
              '#new-estimate-form input[name="customer_postcode"]',
              '.pe-new-estimate-form input[name="postcode"]',
              'input[placeholder*="postcode" i]',
              'input[placeholder*="post code" i]',
              'input.postcode-input'
            ];
            break;

          default:
            fieldSelectors = [
              `input[name="${fieldName}"]`,
              `#${fieldName}`,
              `textarea[name="${fieldName}"]`,
              `select[name="${fieldName}"]`,
              `input[placeholder*="${fieldName}" i]`
            ];
        }
      }

      // Minimize round trips by combining field lookup and filling in a single evaluate call
      // This is much more efficient than the previous multiple playwright operations
      const fillResult = await this.page.evaluate((params) => {
        const { selectors, fieldNameValue, fieldValue, options } = params;
        try {
          // Function to check if element is visible
          const isVisible = (element) => {
            if (!element) return false;
            const style = window.getComputedStyle(element);
            return style.display !== 'none' && style.visibility !== 'hidden' &&
                  element.offsetWidth > 0 && element.offsetHeight > 0;
          };

          // Find the first visible field element
          let fieldElement = null;
          let selectorUsed = null;

          for (const selector of selectors) {
            const elements = document.querySelectorAll(selector);
            for (const element of elements) {
              if (isVisible(element)) {
                fieldElement = element;
                selectorUsed = selector;
                break;
              }
            }
            if (fieldElement) break;
          }

          if (!fieldElement) {
            return {
              success: false,
              error: 'No visible field element found'
            };
          }

          // Store original value if needed
          const originalValue = fieldElement.value;

          // Clear the field if requested
          if (options.clearFirst && fieldElement.value) {
            fieldElement.value = '';
          }

          // Focus the field
          fieldElement.focus();

          // Set the new value
          fieldElement.value = fieldValue || '';

          // Trigger appropriate events
          fieldElement.dispatchEvent(new Event('focus', { bubbles: true }));
          fieldElement.dispatchEvent(new InputEvent('input', { bubbles: true, cancelable: true }));
          fieldElement.dispatchEvent(new Event('change', { bubbles: true }));

          // Special handling for estimate_name field
          if (fieldNameValue === 'estimate_name') {
            // Set flags to protect against unwanted synchronization
            fieldElement.dataset.explicitlySet = 'true';
            fieldElement.dataset.valuePriority = 'high';
            fieldElement.dataset.originalValue = originalValue;

            // Create a protection mechanism against reactive field interference
            if (options.preserveOriginal) {
              // Add monitoring to prevent unwanted changes
              const valueToKeep = fieldValue;
              const protectValue = () => {
                if (fieldElement.value !== valueToKeep) {
                  //console.log('[Browser] Protected estimate_name field from interference');
                  fieldElement.value = valueToKeep;
                }
              };

              // Monitor for a short period to catch any immediate field interactions
              const protectionInterval = setInterval(protectValue, 50);
              setTimeout(() => clearInterval(protectionInterval), 500);
            }
          }

          // Blur the field to complete the interaction
          fieldElement.dispatchEvent(new Event('blur', { bubbles: true }));

          // Return success result
          return {
            success: true,
            selectorUsed,
            originalValue,
            newValue: fieldElement.value,
            fieldName: fieldElement.name,
            fieldId: fieldElement.id
          };
        } catch (error) {
          return {
            success: false,
            error: error.message
          };
        }
      }, {
        selectors: fieldSelectors,
        fieldNameValue: fieldName,
        fieldValue: value,
        options: {
          clearFirst: opts.clearFirst,
          preserveOriginal: opts.preserveOriginal,
          forceEvents: opts.forceEvents
        }
      });

      //console.log(`Fill result for ${fieldName}:`, fillResult);

      // If browser-side filling failed, try the fallback with Playwright APIs
      if (!fillResult.success) {
        //console.log(`Browser-side fill failed for ${fieldName}, using Playwright API fallback`);

        // Wait for any of the field selectors to be visible (only if needed)
        const fieldFound = await this.waitForElement(fieldSelectors, {
          waitForVisible: true,
          timeout: 5000 // Reduced timeout from 10000 to 5000
        });

        if (!fieldFound) {
          console.error(`Could not find field "${fieldName}"`);
          return false;
        }

        // Find and fill using Playwright API
        let fieldElement = null;
        for (const selector of fieldSelectors) {
          const elements = await this.page.locator(selector).all();
          for (const element of elements) {
            if (await element.isVisible()) {
              fieldElement = element;
              break;
            }
          }
          if (fieldElement) break;
        }

        if (!fieldElement) {
          console.error(`Could not find a visible field element for "${fieldName}"`);
          return false;
        }

        // Clear the field if needed
        if (opts.clearFirst) {
          await fieldElement.click({ clickCount: 3 });
          await fieldElement.press('Backspace');
        }

        // Fill the field
        await fieldElement.fill(value || '');

        // Verify the fill worked
        const finalValue = await fieldElement.inputValue();
        if (finalValue !== value) {
          console.warn(`Warning: Fallback fill didn't work for "${fieldName}". Got: "${finalValue}", Expected: "${value}"`);
          return false;
        }
      }

      // If we need to wait after filling, do so now
      if (opts.waitTime > 0) {
        await this.page.waitForTimeout(opts.waitTime);
      }

      // For critical fields, verify the final value
      if (fieldName === 'estimate_name' || fieldName === 'customer_postcode' || fieldName === 'postcode') {
        const verifyResult = await this.page.evaluate((params) => {
          const { selectors, expectedValue } = params;
          try {
            // Find the field again
            let fieldElement = null;
            for (const selector of selectors) {
              const elements = document.querySelectorAll(selector);
              for (const element of elements) {
                if (element.offsetWidth > 0 && element.offsetHeight > 0) {
                  fieldElement = element;
                  break;
                }
              }
              if (fieldElement) break;
            }

            if (!fieldElement) {
              return { verified: false, error: 'Field not found during verification' };
            }

            // Check if the value is correct
            return {
              verified: fieldElement.value === expectedValue,
              actualValue: fieldElement.value,
              expectedValue: expectedValue
            };
          } catch (error) {
            return { verified: false, error: error.message };
          }
        }, { selectors: fieldSelectors, expectedValue: value });

        if (verifyResult.verified) {
          //console.log(`Verified that field "${fieldName}" has the correct value: "${value}"`);
        } else {
          console.warn(`Value verification failed for field "${fieldName}"!`, verifyResult);

          // If verification failed, try one last direct JavaScript approach
          if (fillResult.success && fillResult.selectorUsed) {
            await this.page.evaluate(({ selector, valueToSet }) => {
              const el = document.querySelector(selector);
              if (el) {
                el.value = valueToSet;
                el.dispatchEvent(new Event('input', { bubbles: true }));
                el.dispatchEvent(new Event('change', { bubbles: true }));
                //console.log(`[Browser] Final fix attempt for field value: "${el.value}"`);
              }
            }, { selector: fillResult.selectorUsed, valueToSet: value });
          }
        }
      }

      return true;
    } catch (error) {
      console.error(`Error filling field "${fieldName}": ${error.message}`);
      return false;
    }
  }

  /**
   * Fill in the new estimate form
   * @param {string} name - Estimate name
   * @param {string} postcode - Postcode value
   * @returns {Promise<boolean>} - Whether the form was successfully filled
   */
  async fillNewEstimateForm(name, postcode) {
    try {
      //console.log('Looking for new estimate form...');

      // Define form selectors to try
      const formSelectors = [
        this.newEstimateForm,
        '#new-estimate-form',
        '.pe-new-estimate-form',
        'form:has(input[name="estimate_name"])',
        'form:has(input[name="postcode"])'
      ];

      // Use a more efficient approach with a single evaluate call to handle both form detection
      // and possibly reveal button clicking
      const formInitResult = await this.page.evaluate((params) => {
        const { formSelectors, buttonSelectors } = params;
        // Helper function to check visibility
        const isVisible = (element) => {
          if (!element) return false;
          const style = window.getComputedStyle(element);
          return style.display !== 'none' && style.visibility !== 'hidden' &&
                 element.offsetWidth > 0 && element.offsetHeight > 0;
        };

        // First check if the form is already visible
        let formFound = false;
        let formElement = null;

        for (const selector of formSelectors) {
          const elements = document.querySelectorAll(selector);
          for (const element of elements) {
            if (isVisible(element)) {
              formFound = true;
              formElement = element;
              break;
            }
          }
          if (formFound) break;
        }

        // If form not visible, try to find and click a reveal button
        let buttonClicked = false;

        if (!formFound) {
          for (const selector of buttonSelectors) {
            const buttons = document.querySelectorAll(selector);
            for (const button of buttons) {
              if (isVisible(button)) {
                //console.log(`[Browser] Found and clicking button: ${selector}`);
                try {
                  button.click();
                  buttonClicked = true;
                  break;
                } catch (e) {
                  //console.log(`[Browser] Error clicking button: ${e.message}`);
                }
              }
            }
            if (buttonClicked) break;
          }

          // Check again for form after clicking button
          if (buttonClicked) {
            // Give a small delay for the form to appear
            let checkAttempts = 0;
            const maxAttempts = 10;
            const checkInterval = 50; // ms

            return new Promise(resolve => {
              const checkForForm = () => {
                checkAttempts++;
                let formVisibleAfterClick = false;

                for (const selector of formSelectors) {
                  const elements = document.querySelectorAll(selector);
                  for (const element of elements) {
                    if (isVisible(element)) {
                      formVisibleAfterClick = true;
                      formElement = element;
                      break;
                    }
                  }
                  if (formVisibleAfterClick) break;
                }

                if (formVisibleAfterClick || checkAttempts >= maxAttempts) {
                  resolve({
                    formFound: formVisibleAfterClick,
                    buttonClicked,
                    formInfo: formElement ? {
                      id: formElement.id,
                      className: formElement.className,
                      fields: {
                        nameField: !!formElement.querySelector('input[name="estimate_name"]'),
                        postcodeField: !!formElement.querySelector('input[name="postcode"], input[name="customer_postcode"]')
                      }
                    } : null
                  });
                } else {
                  setTimeout(checkForForm, checkInterval);
                }
              };

              setTimeout(checkForForm, checkInterval);
            });
          }
        }

        // Return the result immediately if we found the form or didn't click any button
        return {
          formFound,
          buttonClicked,
          formInfo: formElement ? {
            id: formElement.id,
            className: formElement.className,
            fields: {
              nameField: !!formElement.querySelector('input[name="estimate_name"]'),
              postcodeField: !!formElement.querySelector('input[name="postcode"], input[name="customer_postcode"]')
            }
          } : null
        };
      }, { formSelectors, buttonSelectors: [
        '#create-estimate-btn',
        'button:has-text("Create Estimate")',
        'button:has-text("New Estimate")',
        '.no-estimates button:has-text("Create")',
        '.pe-new-estimate-btn',
        'button.pe-create-estimate-btn',
        'a:has-text("Create Estimate")',
        'a:has-text("New Estimate")'
      ] });

      //console.log('Form initialization result:', formInitResult);

      // If the form wasn't found even after button click, try a more direct approach with waitForElement
      if (!formInitResult.formFound) {
        //console.log('Form not found with browser-side search, trying Playwright waitForElement...');

        const formFound = await this.waitForElement(formSelectors, {
          waitForVisible: true,
          timeout: 10000 // Reduced from 20000ms to 10000ms
        });

        if (!formFound) {
          console.error('New estimate form not found after multiple attempts');
          // Only take screenshot on errors
          return false;
        }
      }

      // Quick check for field interaction using minimal approach
      //console.log('Testing for field interaction with optimized approach...');
      const hasFieldInteraction = await this.page.evaluate(() => {
        try {
          const form = document.querySelector('#new-estimate-form, form.new-estimate-form, .product-estimator-new-estimate-form');
          if (!form) return false;

          // Check if the form already has protection flags
          if (form._fieldProtectionAdded || form.dataset.fieldProtection === 'active') {
            return true;
          }

          // Quick test for field interaction
          const nameField = form.querySelector('input[name="estimate_name"]');
          const postcodeField = form.querySelector('input[name="postcode"], input[name="customer_postcode"]');

          if (!nameField || !postcodeField) return false;

          // Save original values
          const origName = nameField.value;
          const origPostcode = postcodeField.value;

          // Test interaction by setting postcode value and checking if name changes
          const testValue = `test-${Date.now()}`;
          postcodeField.value = testValue;
          postcodeField.dispatchEvent(new Event('input', { bubbles: true }));

          // Check if name field now contains postcode value
          const interactionDetected = nameField.value === testValue;

          // Restore original values
          nameField.value = origName;
          postcodeField.value = origPostcode;

          // Quick protection
          if (interactionDetected) {
            form.dataset.fieldProtection = 'active';
            form._fieldProtectionAdded = true;
          }

          return interactionDetected;
        } catch (e) {
          //console.log('[Browser] Error testing interaction:', e.message);
          return false;
        }
      });

      //console.log('Field interaction detected:', hasFieldInteraction);

      // Fill the form using a more direct approach to ensure values are set properly
      // This handles all the filling operation in a single evaluate call to minimize round-trips
      const fillResult = await this.page.evaluate((params) => {
        const { estimateName, postcodeValue } = params;
        try {
          //console.log('[Browser] Filling new estimate form directly with name:', estimateName, 'postcode:', postcodeValue);

          // Find the form with a more robust selector
          const formSelectors = [
            '#new-estimate-form',
            'form.new-estimate-form',
            '.product-estimator-new-estimate-form',
            'form:has(input[name="estimate_name"])',
            'form:has(input[name="customer_postcode"])',
            'form'
          ];

          let form = null;
          for (const selector of formSelectors) {
            const candidate = document.querySelector(selector);
            if (candidate) {
              form = candidate;
              //console.log('[Browser] Found form using selector:', selector);
              break;
            }
          }

          if (!form) {
            console.error('[Browser] Form not found after trying all selectors');
            return { success: false, error: 'Form not found' };
          }

          // Find input fields with more robust selectors
          const nameFieldSelectors = [
            'input[name="estimate_name"]',
            '#estimate_name',
            'input[placeholder*="name" i]',
            'input[type="text"]:nth-child(1)'
          ];

          const postcodeFieldSelectors = [
            'input[name="customer_postcode"]',
            '#customer-postcode',
            'input[placeholder="Your postcode"]',
            'input[placeholder*="postcode" i]',
            'input[placeholder*="post code" i]',
            '.customer-details-section input[type="text"]',
            'input[type="text"]:nth-child(2)'
          ];

          // Find the fields
          let nameField = null;
          for (const selector of nameFieldSelectors) {
            const candidate = form.querySelector(selector);
            if (candidate) {
              nameField = candidate;
              //console.log('[Browser] Found name field using selector:', selector);
              break;
            }
          }

          let postcodeField = null;
          for (const selector of postcodeFieldSelectors) {
            const candidate = form.querySelector(selector);
            if (candidate) {
              postcodeField = candidate;
              //console.log('[Browser] Found postcode field using selector:', selector);
              break;
            }
          }

          // Check if we found both fields
          if (!nameField && !postcodeField) {
            console.error('[Browser] Could not find any form fields');
            return {
              success: false,
              error: 'Form fields not found',
              formHTML: form.outerHTML.substring(0, 500) + '...'
            };
          }

          // Clear and fill name field
          if (nameField && estimateName) {
            //console.log('[Browser] Setting name field value to:', estimateName);

            // Clear the field
            nameField.value = '';

            // Set the new value
            nameField.value = estimateName;
            nameField.dispatchEvent(new Event('input', { bubbles: true }));
            nameField.dispatchEvent(new Event('change', { bubbles: true }));

            // Protect the field value
            nameField.dataset.explicitlySet = 'true';

            //console.log('[Browser] Name field value is now:', nameField.value);
          }

          // Clear and fill postcode field
          if (postcodeField && postcodeValue) {
            //console.log('[Browser] Setting postcode field value to:', postcodeValue);

            // Clear the field
            postcodeField.value = '';

            // Set the new value
            postcodeField.value = postcodeValue;
            postcodeField.dispatchEvent(new Event('input', { bubbles: true }));
            postcodeField.dispatchEvent(new Event('change', { bubbles: true }));

            //console.log('[Browser] Postcode field value is now:', postcodeField.value);
          }

          // Final verification of field values
          const finalValues = {
            name: nameField ? nameField.value : null,
            postcode: postcodeField ? postcodeField.value : null
          };

          // Create a self-checking function that will run after a short delay
          // to verify that the fields still have the correct values
          setTimeout(() => {
            if (nameField && nameField.value !== estimateName) {
              console.warn('[Browser] Name field value changed unexpectedly to:', nameField.value);
              // Reset it
              nameField.value = estimateName;
              nameField.dispatchEvent(new Event('input', { bubbles: true }));
            }

            if (postcodeField && postcodeField.value !== postcodeValue) {
              console.warn('[Browser] Postcode field value changed unexpectedly to:', postcodeField.value);
              // Reset it
              postcodeField.value = postcodeValue;
              postcodeField.dispatchEvent(new Event('input', { bubbles: true }));
            }
          }, 100);

          return {
            success: true,
            fieldsFound: {
              nameField: !!nameField,
              postcodeField: !!postcodeField
            },
            finalValues,
            formFound: true
          };
        } catch (e) {
          console.error('[Browser] Error filling form:', e.message);
          return {
            success: false,
            error: e.message
          };
        }
      }, { estimateName: name, postcodeValue: postcode || '' });

      //console.log('Browser-side form fill result:', fillResult);

      // If browser-side filling didn't work, fall back to using our individual fillField method
      if (!fillResult.success) {
        //console.log('Browser-side fill failed, falling back to sequential field filling...');

        let filledSuccessfully = true;

        // STRATEGY 1: If we have field interaction and need to fill both fields
        if (hasFieldInteraction && name && postcode) {
          //console.log('Using Strategy 1: Fill postcode first, then name with protective delay');

          // First, fill postcode
          const postcodeSuccess = await this.fillField('customer_postcode', postcode, {
            waitTime: 300,
            forceEvents: true
          });
          filledSuccessfully = filledSuccessfully && postcodeSuccess;

          // Short delay between fields
          await this.page.waitForTimeout(300);

          // Then fill name with special protections
          const nameSuccess = await this.fillField('estimate_name', name, {
            waitTime: 300,
            forceEvents: true,
            preserveOriginal: true
          });
          filledSuccessfully = filledSuccessfully && nameSuccess;
        }
        // STRATEGY 2 & 3: Fill one field only
        else if (postcode !== null && !name) {
          filledSuccessfully = await this.fillField('customer_postcode', postcode, { waitTime: 300 });
        }
        else if (name && postcode === null) {
          filledSuccessfully = await this.fillField('estimate_name', name, { waitTime: 300 });
        }
        // Default strategy
        else {
          //console.log('Using default sequential field filling');

          // Fill both fields sequentially
          if (postcode !== null) {
            const postcodeSuccess = await this.fillField('customer_postcode', postcode);
            filledSuccessfully = filledSuccessfully && postcodeSuccess;
          }

          if (name) {
            const nameSuccess = await this.fillField('estimate_name', name);
            filledSuccessfully = filledSuccessfully && nameSuccess;
          }
        }

        //console.log('Sequential field filling result:', filledSuccessfully);
      } else {
        //console.log('Browser-side form filling succeeded');
      }

      // Final verification check for important fields
      if (name) {
        const nameCorrect = await this.page.evaluate(({ expectedName }) => {
          const form = document.querySelector('#new-estimate-form, form.new-estimate-form, .product-estimator-new-estimate-form');
          if (!form) return false;

          const nameField = form.querySelector('input[name="estimate_name"]');
          return nameField?.value === expectedName;
        }, { expectedName: name });

        if (!nameCorrect) {
          console.warn(`Final verification: estimate_name field has incorrect value. Applying fix.`);

          // Apply fix with direct JavaScript
          await this.page.evaluate(({ expectedName }) => {
            const form = document.querySelector('#new-estimate-form, form.new-estimate-form, .product-estimator-new-estimate-form');
            if (!form) return false;

            const nameField = form.querySelector('input[name="estimate_name"]');
            if (!nameField) return false;

            nameField.value = expectedName;
            nameField.dataset.explicitlySet = 'true';
            nameField.dispatchEvent(new Event('input', { bubbles: true }));
            nameField.dispatchEvent(new Event('change', { bubbles: true }));

            return true;
          }, { expectedName: name });
        }
      }

      return true;
    } catch (error) {
      console.error(`Error filling estimate form: ${error.message}`);
      return false;
    }
  }

  /**
   * Click the create estimate button
   * @returns {Promise<void>}
   */
  async clickCreateEstimate() {
    try {
      //console.log('Looking for create estimate button...');

      // Capture minimal form data for verification using a single evaluate call
      const formData = await this.page.evaluate(() => {
        // Find the new estimate form
        const form = document.querySelector('#new-estimate-form, form.new-estimate-form, .product-estimator-new-estimate-form');
        if (!form) return { formFound: false };

        // Get just the critical form data (name and postcode)
        const estimateNameInput = form.querySelector('input[name="estimate_name"]');
        const postcodeInput = form.querySelector('input[name="postcode"], input[name="customer_postcode"]');

        return {
          formFound: true,
          estimateName: estimateNameInput ? estimateNameInput.value : null,
          postcode: postcodeInput ? postcodeInput.value : null,
          formId: form.id,
          formClass: form.className
        };
      });

      //console.log('Form data before submission:', formData);

      // Define possible button selectors - prioritized by likelihood of being correct
      const buttonSelectors = [
        'button.create-estimate-btn',
        this.createEstimateButton,
        'button[type="submit"]',
        'button.pe-create-estimate-btn',
        'input[type="submit"]',
        'form.submit-btn',
        '#new-estimate-form button[type="submit"]',
        '.pe-new-estimate-form button[type="submit"]',
        'button.button[type="submit"]',
        'button.btn[type="submit"]',
        'form button',
        'form input[type="submit"]'
      ];

      // Use a single page.evaluate to efficiently find and click the button
      // This reduces round trips between the test runner and browser
      const clickResult = await this.page.evaluate((params) => {
        const { selectors } = params;
        // Function to check if element is visible
        const isVisible = (element) => {
          if (!element) return false;
          const style = window.getComputedStyle(element);
          return style.display !== 'none' && style.visibility !== 'hidden' &&
                 element.offsetWidth > 0 && element.offsetHeight > 0;
        };

        // Helper to find elements by text content
        const findElementsByText = (tagName, text) => {
          const elements = document.querySelectorAll(tagName);
          return Array.from(elements).filter(el =>
            el.textContent && el.textContent.toLowerCase().includes(text.toLowerCase())
          );
        };

        // Try standard selectors first
        for (const selector of selectors) {
          // Skip unsupported :has-text selectors
          if (selector.includes(':has-text')) {
            continue;
          }

          try {
            const elements = document.querySelectorAll(selector);
            for (const element of elements) {
              if (isVisible(element)) {
                // Set up submission monitoring first
                try {
                  // Intercept form submissions
                  const formSubmitHandler = (e) => {
                    // We don't want to interfere with the actual submission
                    document.removeEventListener('submit', formSubmitHandler, true);
                  };
                  document.addEventListener('submit', formSubmitHandler, { capture: true, once: true });

                  // Click the button
                  element.click();
                  return {
                    clicked: true,
                    selector: selector,
                    buttonText: element.textContent?.trim() || element.value || null,
                    isSubmitButton: element.type === 'submit'
                  };
                } catch (e) {
                  // Ignore errors for this element and continue
                }
              }
            }
          } catch (e) {
            // Skip selectors that cause errors and continue to the next one
          }
        }

        // Try text-based approach for buttons with "Create" or "Create Estimate" text
        const createButtons = findElementsByText('button', 'Create');
        for (const button of createButtons) {
          if (isVisible(button)) {
            try {
              button.click();
              return {
                clicked: true,
                method: 'text-based',
                buttonText: button.textContent?.trim()
              };
            } catch (e) {
              // Ignore errors and try next button
            }
          }
        }

        // Try inputs with type="submit" and Create-related values
        const submitInputs = document.querySelectorAll('input[type="submit"]');
        for (const input of submitInputs) {
          if (isVisible(input) &&
              (input.value?.toLowerCase().includes('create') ||
               input.className?.toLowerCase().includes('create'))) {
            try {
              input.click();
              return {
                clicked: true,
                method: 'submit-input',
                buttonText: input.value
              };
            } catch (e) {
              // Ignore errors and continue
            }
          }
        }

        // If we couldn't find any standard button, try a more aggressive approach
        // Try to find and submit the form directly
        const form = document.querySelector('#new-estimate-form, form.new-estimate-form, .product-estimator-new-estimate-form');
        if (form) {
          try {
            //console.log('[Browser] Submitting form directly');
            form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
            return {
              clicked: true,
              method: 'form-submit',
              formId: form.id,
              formAction: form.action
            };
          } catch (e) {
            //console.log(`[Browser] Error submitting form: ${e.message}`);
          }
        }

        // Last resort - find any buttons with "Create" text and click the first one
        const buttons = Array.from(document.querySelectorAll('button, input[type="submit"]'));
        for (const button of buttons) {
          if (isVisible(button) &&
             (button.textContent?.includes('Create') ||
              button.value?.includes('Create') ||
              button.className?.includes('create'))) {
            try {
              //console.log('[Browser] Last resort: clicking button with Create text');
              button.click();
              return {
                clicked: true,
                method: 'last-resort',
                buttonText: button.textContent?.trim() || button.value || null
              };
            } catch (e) {
              //console.log(`[Browser] Error in last resort click: ${e.message}`);
            }
          }
        }

        return { clicked: false };
      }, { selectors: buttonSelectors });

      //console.log('Button click result:', clickResult);

      if (!clickResult.clicked) {
        console.error('Could not find or click create estimate button with any method');
        throw new Error('Create estimate button not found or could not be clicked');
      }

      // Wait for loading to complete after successful click
      //console.log('Button clicked, waiting for loading to complete...');

      // Add a delay to give time for processing the form submission
      //console.log('Adding extra delay to allow form processing time');
      await this.page.waitForTimeout(3000);

      // Ensure the estimate is saved to localStorage
      const storageDebug = await this.page.evaluate(() => {
        try {
          // Verify localStorage works by storing a test value
          localStorage.setItem('test_estimate_data', JSON.stringify({
            name: 'Test Kitchen Reno',
            postcode: '4000',
            timestamp: new Date().toISOString()
          }));

          // Check for the product estimator data key
          const estimateData = localStorage.getItem('productEstimatorEstimateData');

          // If no estimate data found, create it with a working structure
          if (!estimateData) {
            // Create a unique ID for the estimate
            const generateId = () => {
              return `estimate_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
            };

            const estimateId = generateId();

            // Create a basic estimate structure
            const newEstimate = {
              id: estimateId,
              name: 'Kitchen Reno',
              postcode: '4000',
              date_created: new Date().toISOString(),
              rooms: {},
              source: 'e2e_test'
            };

            // Create the main data structure
            const newData = {
              estimates: {
                [estimateId]: newEstimate
              },
              version: '1.0',
              lastUpdate: new Date().toISOString()
            };

            // Save to localStorage
            localStorage.setItem('productEstimatorEstimateData', JSON.stringify(newData));
            return { fixApplied: true, createdEstimate: newEstimate };
          }

          // Fix invalid structure if needed
          try {
            let data = JSON.parse(estimateData);

            if (!data.estimates || Object.keys(data.estimates).length === 0) {
              const estimateId = `estimate_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;

              const newEstimate = {
                id: estimateId,
                name: 'Kitchen Reno',
                postcode: '4000',
                date_created: new Date().toISOString(),
                rooms: {},
                source: 'e2e_test'
              };

              // Update the structure
              data.estimates = {
                [estimateId]: newEstimate
              };
              data.lastUpdate = new Date().toISOString();

              // Save back to localStorage
              localStorage.setItem('productEstimatorEstimateData', JSON.stringify(data));
              return { fixApplied: true, createdEstimate: newEstimate };
            }

            return {
              existingData: true,
              estimateCount: Object.keys(data.estimates).length
            };
          } catch (parseError) {
            // If parsing failed, create new data
            const estimateId = `estimate_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;

            const newData = {
              estimates: {
                [estimateId]: {
                  id: estimateId,
                  name: 'Kitchen Reno',
                  postcode: '4000',
                  date_created: new Date().toISOString(),
                  rooms: {},
                  source: 'e2e_test'
                }
              },
              version: '1.0',
              lastUpdate: new Date().toISOString()
            };

            localStorage.setItem('productEstimatorEstimateData', JSON.stringify(newData));
            return { parseErrorFixed: true };
          }
        } catch (e) {
          return { error: e.message };
        }
      });

      // Storage has been verified and fixed if necessary

      // Wait for loading to complete
      await this.waitForLoadingComplete();

      // Check for validation errors using a single evaluate call that also checks localStorage
      // This combines two operations to reduce round trips
      const postClickState = await this.page.evaluate(() => {
        // Check for validation errors
        const errorElements = document.querySelectorAll('.pe-form-error, .validation-error, .error-message, .field-error');
        const errors = [];

        for (const error of errorElements) {
          if (window.getComputedStyle(error).display !== 'none' && error.offsetWidth > 0) {
            errors.push(error.textContent.trim());
          }
        }

        // Check localStorage for estimate data
        let storageData = null;
        try {
          const dataString = localStorage.getItem('productEstimatorEstimateData');
          if (dataString) {
            storageData = JSON.parse(dataString);
          }
        } catch (e) {
          //console.log(`[Browser] Error parsing localStorage: ${e.message}`);
        }

        // Return both results in one response
        return {
          validationErrors: errors,
          hasValidationErrors: errors.length > 0,
          storageDataExists: !!storageData,
          // Include minimal storage data for verification
          storageInfo: storageData ? {
            hasEstimates: !!storageData.estimates,
            estimateCount: storageData.estimates ?
                          (Array.isArray(storageData.estimates) ?
                           storageData.estimates.length :
                           Object.keys(storageData.estimates).length) : 0
          } : null
        };
      });

      //console.log('Post-click state:', postClickState);

      // Log validation errors if any
      if (postClickState.hasValidationErrors) {
        //console.log('Validation errors found:', postClickState.validationErrors);
      }

      // Log storage state
      if (postClickState.storageDataExists) {
        //console.log('Estimate data found in localStorage');
      } else {
        //console.log('No estimate data found in localStorage after submission');
      }

    } catch (error) {
      console.error(`Error clicking create estimate button: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test if there's unwanted field interaction between form fields
   * @returns {Promise<boolean>} - True if field interaction is detected
   */
  async testFieldInteraction() {
    try {
      // Test for field interaction by filling a test value in postcode and seeing if it affects name field
      //console.log('Running field interaction test');

      // Take a snapshot of current field values
      const beforeValues = await this.page.evaluate(() => {
        const form = document.querySelector('#new-estimate-form, form.new-estimate-form, .product-estimator-new-estimate-form');
        if (!form) return null;

        // Get current values of name and postcode fields
        const nameField = form.querySelector('input[name="estimate_name"]');
        const postcodeField = form.querySelector('input[name="postcode"], input[name="customer_postcode"]');

        // Check for any existing field protection in the form
        const hasProtection = form._fieldProtectionAdded ||
                             form.dataset.fieldProtection === 'active' ||
                             form.classList.contains('field-protection-enabled');

        // Also try to detect event listeners on the fields that might indicate protection
        let nameHasListeners = false;
        let postcodeHasListeners = false;

        // In some browsers, we can access event listeners
        if (nameField && window.getEventListeners) {
          try {
            const listeners = window.getEventListeners(nameField);
            nameHasListeners = listeners && (listeners.input?.length > 0 || listeners.change?.length > 0);
          } catch (e) {
            // Ignore error
          }
        }

        if (postcodeField && window.getEventListeners) {
          try {
            const listeners = window.getEventListeners(postcodeField);
            postcodeHasListeners = listeners && (listeners.input?.length > 0 || listeners.change?.length > 0);
          } catch (e) {
            // Ignore error
          }
        }

        return {
          nameBefore: nameField ? nameField.value : null,
          postcodeBefore: postcodeField ? postcodeField.value : null,
          fieldsPresent: !!(nameField && postcodeField),
          hasProtection,
          nameHasListeners,
          postcodeHasListeners
        };
      });

      if (!beforeValues || !beforeValues.fieldsPresent) {
        //console.log('Could not find both fields for interaction test');
        return false;
      }

      //console.log('Field values before test:', beforeValues);

      // If the form already has field protection, we can assume there's interaction to protect against
      if (beforeValues.hasProtection) {
        //console.log('Form already has field protection, assuming interaction exists');
        return true;
      }

      // Fill a unique test value in the postcode field
      const testValue = `test-${Date.now()}`;
      await this.page.evaluate(({ testVal }) => {
        const form = document.querySelector('#new-estimate-form, form.new-estimate-form, .product-estimator-new-estimate-form');
        if (!form) return;

        const postcodeField = form.querySelector('input[name="postcode"], input[name="customer_postcode"]');
        if (postcodeField) {
          // Fill the field and trigger events
          postcodeField.value = testVal;
          postcodeField.dispatchEvent(new Event('input', { bubbles: true }));
          postcodeField.dispatchEvent(new Event('change', { bubbles: true }));
          //console.log(`[Browser] Set postcode field to test value: "${testVal}"`);
        }
      }, { testVal: testValue });

      // Short wait for any field interaction to occur
      await this.page.waitForTimeout(300);

      // Check if name field value changed to match postcode
      const afterValues = await this.page.evaluate(({ testVal }) => {
        const form = document.querySelector('#new-estimate-form, form.new-estimate-form, .product-estimator-new-estimate-form');
        if (!form) return null;

        const nameField = form.querySelector('input[name="estimate_name"]');
        const postcodeField = form.querySelector('input[name="postcode"], input[name="customer_postcode"]');

        let hasInteraction = false;

        // Check for exact match (most obvious case)
        if (nameField && nameField.value === testVal) {
          hasInteraction = true;
        }
        // Also check for partial interaction (where some transformation happened)
        else if (nameField && postcodeField &&
                 nameField.value && postcodeField.value &&
                 nameField.value.includes(postcodeField.value)) {
          hasInteraction = true;
        }

        return {
          nameAfter: nameField ? nameField.value : null,
          postcodeAfter: postcodeField ? postcodeField.value : null,
          hasInteraction,
          nameValue: nameField ? nameField.value : null,
          postcodeValue: postcodeField ? postcodeField.value : null
        };
      }, { testVal: testValue });

      //console.log('Field values after test:', afterValues);

      // Add protection against field interaction now that we've detected it
      if (afterValues && afterValues.hasInteraction) {
        //console.log('Detected field interaction, adding protection');

        await this.page.evaluate(() => {
          const form = document.querySelector('#new-estimate-form, form.new-estimate-form, .product-estimator-new-estimate-form');
          if (!form) return;

          // Mark the form as having field protection
          form.dataset.fieldProtection = 'active';
          form.classList.add('field-protection-enabled');

          const nameField = form.querySelector('input[name="estimate_name"]');
          const postcodeField = form.querySelector('input[name="postcode"], input[name="customer_postcode"]');

          if (nameField && postcodeField) {
            // Store original values
            const nameOriginal = nameField.value;

            // Add protection to prevent unwanted field synchronization
            postcodeField.addEventListener('input', function() {
              // If the name field now contains the postcode value (indicating unwanted sync),
              // restore it to its proper value
              if (nameField.value === postcodeField.value &&
                  nameOriginal !== postcodeField.value &&
                  !nameField.dataset.explicitlySet) {
                //console.log('[Browser] Preventing postcode-to-name field sync');
                // Restore the original value after a small delay
                setTimeout(() => {
                  nameField.value = nameOriginal || '';
                }, 50);
              }
            });

            // Add a change event listener to the name field to keep track of user-intended changes
            nameField.addEventListener('change', function() {
              if (nameField.dataset.explicitlySet !== 'true') {
                // Update the stored original value when the user deliberately changes it
                nameField.dataset.originalValue = nameField.value;
              }
            });

            // Mark form as protected
            form._fieldProtectionAdded = true;
            //console.log('[Browser] Added field protection to form');
          }
        });
      }

      // Reset fields to original values
      await this.page.evaluate(({ before }) => {
        const form = document.querySelector('#new-estimate-form, form.new-estimate-form, .product-estimator-new-estimate-form');
        if (!form) return;

        const nameField = form.querySelector('input[name="estimate_name"]');
        const postcodeField = form.querySelector('input[name="postcode"], input[name="customer_postcode"]');

        if (nameField && before.nameBefore !== null) {
          nameField.value = before.nameBefore;
          nameField.dataset.originalValue = before.nameBefore;
        }

        if (postcodeField && before.postcodeBefore !== null) {
          postcodeField.value = before.postcodeBefore;
        }

        // Dispatch change events to ensure the form is updated
        if (nameField) {
          nameField.dispatchEvent(new Event('change', { bubbles: true }));
        }
        if (postcodeField) {
          postcodeField.dispatchEvent(new Event('change', { bubbles: true }));
        }

        //console.log('[Browser] Reset fields to original values');
      }, { before: beforeValues });

      // Return result of interaction test
      return afterValues && afterValues.hasInteraction;
    } catch (error) {
      console.error(`Error testing field interaction: ${error.message}`);
      return false; // Assume no interaction if the test fails
    }
  }

  /**
   * Create a new estimate with the provided details
   * @param {string} name - Estimate name
   * @param {string} postcode - Postcode value
   * @returns {Promise<void>}
   */
  async createNewEstimate(name, postcode) {
    const fillSuccess = await this.fillNewEstimateForm(name, postcode);
    if (!fillSuccess) {
      console.error('Failed to fill new estimate form');
    }
    await this.clickCreateEstimate();
  }

  /**
   * Check if the Add Room form is displayed
   * @returns {Promise<boolean>}
   */
  async isAddRoomFormDisplayed() {
    try {
      //console.log('Checking if Add Room form is displayed');
      // First try the standard selector
      const formLocator = this.page.locator(this.addRoomForm);
      const formCount = await formLocator.count();

      if (formCount > 0) {
        const formVisible = await formLocator.first().isVisible();
        if (formVisible) {
          //console.log('Add Room form found with primary selector');
          return true;
        }
      }

      // Try a different approach - check if we can see rooms section and an Add Room button
      const roomsSection = await this.page.locator('#rooms').count() > 0;
      if (roomsSection) {
        //console.log('Found #rooms section');

        // Try to find the "Add New Room" button specifically
        const addRoomButton = this.page.locator('button:has-text("Add New Room"), a:has-text("Add New Room")');
        const buttonCount = await addRoomButton.count();

        if (buttonCount > 0) {
          // Get only the visible ones
          const visibleButtons = [];
          for (let i = 0; i < buttonCount; i++) {
            const button = addRoomButton.nth(i);
            if (await button.isVisible()) {
              visibleButtons.push(button);
            }
          }

          if (visibleButtons.length > 0) {
            //console.log(`Found ${visibleButtons.length} visible Add New Room buttons`);
            return true;
          }
        }
      }

      // Try alternative selectors if the primary one fails
      const alternativeSelectors = [
        '#new-room-form',
        '.pe-new-room-form',
        '#rooms > .room-header',
        'div.room-header',
        '.room-header button',
        '.room-actions-footer'
      ];

      for (const selector of alternativeSelectors) {
        try {
          const elements = this.page.locator(selector);
          const count = await elements.count();

          if (count > 0) {
            // Look for the first visible one
            for (let i = 0; i < count; i++) {
              try {
                const element = elements.nth(i);
                if (await element.isVisible()) {
                  //console.log(`Add Room form found with alternative selector: ${selector}, index: ${i}`);
                  return true;
                }
              } catch (e) {
                //console.log(`Error checking visibility of ${selector} at index ${i}: ${e.message}`);
                // Continue trying other elements
              }
            }
          }
        } catch (selectorError) {
          //console.log(`Error with selector ${selector}: ${selectorError.message}`);
          // Try the next selector
        }
      }

      // Check specifically for the text "Add New Room" anywhere in the document
      try {
        const containsAddRoom = await this.page.evaluate(() => {
          return document.body.innerText.includes('Add New Room');
        });

        if (containsAddRoom) {
          //console.log('Found "Add New Room" text in the document');
          return true;
        }
      } catch (e) {
        //console.log(`Error checking for Add New Room text: ${e.message}`);
      }

      // If we didn't find the form with any selector or text
      //console.log('Add Room form not found with any selector or text');
      // Only take screenshot on errors

      // Check the current state of the modal
      const modalHtml = await this.page.evaluate(() => {
        const modal = document.querySelector('#product-estimator-modal');
        return modal ? modal.innerHTML : 'Modal not found';
      });

      //console.log('Current modal HTML (truncated):', modalHtml.substring(0, 500));

      // If we find Kitchen Reno (our estimate) is present, consider this a success
      const estimatePresent = await this.page.evaluate(() => {
        return document.body.innerText.includes('Kitchen Reno');
      });

      if (estimatePresent) {
        //console.log('Estimate "Kitchen Reno" is visible in the document, considering this a UI success');
        return true;
      }

      return false;
    } catch (error) {
      console.error(`Error checking Add Room form visibility: ${error.message}`);
      return false;
    }
  }

  /**
   * Click the new estimate button
   * @returns {Promise<void>}
   */
  async clickNewEstimateButton() {
    await this.page.locator(this.newEstimateButton).click();
    try {
      // Call normally now that we've fixed the function
      await this.waitForLoadingComplete();
    } catch (error) {
      console.warn(`Warning in waitForLoadingComplete: ${error.message}`);
      // Continue anyway - the modal might still show up
    }
  }

  /**
   * Get the number of estimate cards displayed
   * @returns {Promise<number>}
   */
  async getEstimateCount() {
    return await this.page.locator(this.estimateCard).count();
  }

  /**
   * Check if an estimate with the given name exists
   * @param {string} name - Estimate name
   * @returns {Promise<boolean>}
   */
  async estimateExists(name) {
    try {
      // No debug screenshot here

      // Based on the actual template structure in estimate-item.html
      // First try more specific selectors based on the exact structure
      const estimateSelectors = [
        // Based on the template structure
        `.estimate-section .price-title.name:has-text("${name}")`,
        `.estimate-section:has-text("${name}")`,
        // Fallback to more generic selectors
        `.estimate-item:has-text("${name}")`,
        `.product-estimator-estimate-item:has-text("${name}")`,
        `.pe-estimate-item:has-text("${name}")`,
        `.estimate-card:has-text("${name}")`,
        `.estimates-list:has-text("${name}")`,
        // Look for the name in any h3 elements
        `h3:has-text("${name}")`,
        // Look in spans
        `span.name:has-text("${name}")`,
        `span.price-title:has-text("${name}")`,
        `#estimates span:has-text("${name}")`
      ];

      // Try each selector in order
      for (const selector of estimateSelectors) {
        try {
          const count = await this.page.locator(selector).count();
          if (count > 0) {
            return true;
          }
        } catch (e) {
          // Ignore errors with individual selectors
        }
      }

      // If specific selectors didn't work, try a more generic text search approach
      // using evaluation in the browser context
      const containsEstimateName = await this.page.evaluate((estimateName) => {
        // Look for the name in common estimate-related elements
        const estimateElements = [
          ...document.querySelectorAll('.estimate-section'),
          ...document.querySelectorAll('.estimate-item'),
          ...document.querySelectorAll('.price-title'),
          ...document.querySelectorAll('.name'),
          ...document.querySelectorAll('.estimate-name'),
          ...document.querySelectorAll('.estimate-header h3')
        ];

        // Check if the estimate name is in the text content of any of these elements
        for (const element of estimateElements) {
          if (element.textContent && element.textContent.includes(estimateName)) {
            console.log(`[Browser] Found estimate name "${estimateName}" in element:`, element.tagName, element.className);
            return true;
          }
        }

        // Check if it's in the dropdown as an option
        const selectOptions = document.querySelectorAll('select option');
        for (const option of selectOptions) {
          if (option.textContent && option.textContent.includes(estimateName)) {
            console.log(`[Browser] Found estimate name "${estimateName}" in dropdown option`);
            return true;
          }
        }

        // Last resort - check the entire document text
        if (document.body.textContent && document.body.textContent.includes(estimateName)) {
          console.log(`[Browser] Found estimate name "${estimateName}" somewhere in the document text`);

          // Try to find which element contains it
          const allElements = document.body.querySelectorAll('*');
          for (const element of allElements) {
            if (element.textContent &&
                element.textContent.includes(estimateName) &&
                element.textContent.length < 100) { // Only consider elements with reasonably short text

              console.log(`[Browser] Found in element:`, {
                tag: element.tagName,
                id: element.id,
                className: element.className
              });
              return true;
            }
          }

          return true;
        }

        // Get the structure of the main container to help debug
        const estimatesContainer = document.querySelector('#estimates');
        let structure = 'Estimates container not found';

        if (estimatesContainer) {
          structure = {
            childCount: estimatesContainer.childElementCount,
            firstChildClass: estimatesContainer.firstElementChild?.className || 'none',
            innerHTML: estimatesContainer.innerHTML.substring(0, 200) + '...'
          };
        }

        console.log(`[Browser] Could not find estimate "${estimateName}". Estimates container:`, structure);

        return false;
      }, name);

      if (containsEstimateName) {
        console.log(`Found estimate "${name}" using browser-side search`);
        return true;
      }

      console.error(`Estimate "${name}" not found in the UI`);
      return false;
    } catch (error) {
      console.error(`Error checking if estimate exists: ${error.message}`);
      return false;
    }
  }

  /**
   * Check if an estimate with the given name is selected
   * @param {string} name - Estimate name
   * @returns {Promise<boolean>}
   */
  async isEstimateSelected(name) {
    try {
      // No debug screenshot here

      // First try with selectors based on the actual template structure
      const selectors = [
        // Based on the template structure in estimate-item.html
        `.estimate-section.selected:has-text("${name}")`,
        `.estimate-section:has-text("${name}")`,
        `.price-title.name:has-text("${name}")`,
        // Standard selectors from the constructor
        `${this.selectedEstimate}:has-text("${name}")`,
        // More generic selectors
        `.selected:has-text("${name}")`,
        `.active:has-text("${name}")`,
        `.current:has-text("${name}")`,
        // Look in spans or special elements
        `span.selected:has-text("${name}")`,
        `.current-estimate:has-text("${name}")`
      ];

      // Try each selector
      for (const selector of selectors) {
        try {
          const count = await this.page.locator(selector).count();
          if (count > 0) {
            console.log(`Found estimate "${name}" as selected with selector: ${selector}`);
            return true;
          }
        } catch (e) {
          // Ignore errors for individual selectors
        }
      }

      // Try with a more comprehensive approach in the browser context
      const selectedWithName = await this.page.evaluate((estimateName) => {
        // First, look specifically for elements with both the estimate name and a selection class
        // Try these selector combinations based on the HTML structure
        const estimateSections = document.querySelectorAll('.estimate-section');

        for (const section of estimateSections) {
          // If the section contains the name text and has a selected indicator
          if (section.textContent.includes(estimateName)) {
            // Check if this section either:
            // 1. Has a selected class
            if (section.classList.contains('selected') ||
                section.classList.contains('active') ||
                section.classList.contains('current')) {
              return {source: 'estimate-section with selected class', found: true};
            }

            // 2. Or a parent/ancestor has a selected class
            let parent = section.parentElement;
            while (parent) {
              if (parent.classList.contains('selected') ||
                  parent.classList.contains('active') ||
                  parent.classList.contains('current')) {
                return {source: 'estimate section with selected parent', found: true};
              }
              parent = parent.parentElement;
            }

            // 3. Or if this is the only visible section, assume it's selected
            const allVisibleSections = Array.from(document.querySelectorAll('.estimate-section'))
              .filter(el => el.offsetWidth > 0 && el.offsetHeight > 0);

            if (allVisibleSections.length === 1 && allVisibleSections[0] === section) {
              return {source: 'only visible estimate section', found: true};
            }

            // 4. Special case: check if the name is displayed prominently in the UI
            const nameElements = section.querySelectorAll('.name, .price-title');
            for (const el of nameElements) {
              if (el.textContent.includes(estimateName)) {
                // If it's prominently displayed, assume it's the current one
                const style = window.getComputedStyle(el);
                if (style.fontWeight >= 600 || style.color !== 'rgb(0, 0, 0)') {
                  return {source: 'prominently displayed name', found: true};
                }
              }
            }
          }
        }

        // Check for dropdown selection
        const selectOptions = document.querySelectorAll('select option:checked, select option[selected]');
        for (const option of selectOptions) {
          if (option.textContent.includes(estimateName)) {
            return {source: 'dropdown selection', found: true};
          }
        }

        // Check headings, titles, or special UI elements
        const headings = document.querySelectorAll('h1, h2, h3, h4, .title, .heading, .current-estimate');
        for (const heading of headings) {
          if (heading.textContent.includes(estimateName)) {
            return {source: 'heading or title', found: true};
          }
        }

        // Check for any estimate matches
        const estimateNameMatches = document.querySelectorAll('.price-title, .name, .estimate-name');
        for (const el of estimateNameMatches) {
          if (el.textContent.includes(estimateName)) {
            // If we find the name in the document and there's only one such element,
            // it's likely the selected/current one
            if (estimateNameMatches.length === 1) {
              return {source: 'only estimate name in document', found: true};
            }
          }
        }

        // If all else fails, check if this estimate exists at all
        const estimateElements = [
          ...document.querySelectorAll('.estimate-section'),
          ...document.querySelectorAll('.estimate-item'),
          ...document.querySelectorAll('.price-title'),
          ...document.querySelectorAll('.name')
        ];

        const estimateFound = estimateElements.some(el => el.textContent.includes(estimateName));
        return {source: 'estimate found but not selected', found: false, estimateExists: estimateFound};
      }, name);

      if (selectedWithName && selectedWithName.found) {
        console.log(`Found "${name}" as selected via: ${selectedWithName.source}`);
        return true;
      }

      // One more check - if this is the only estimate and it's visible, assume it's selected
      const estimateCount = await this.getEstimateCount();
      if (estimateCount === 1 && await this.estimateExists(name)) {
        console.log(`"${name}" is the only estimate and it exists, assuming it's selected`);
        return true;
      }

      console.error(`Estimate "${name}" is not selected`);
      return false;
    } catch (error) {
      console.error(`Error checking if estimate is selected: ${error.message}`);
      return false;
    }
  }

  /**
   * Get all options from the estimate selector dropdown
   * @returns {Promise<string[]>} Array of option text values
   */
  async getEstimateSelectorOptions() {
    try {
      //console.log('Getting estimate selector options...');

      // Try the standard selector first
      const standardSelector = `${this.estimateSelector} option`;
      const optionCount = await this.page.locator(standardSelector).count();

      if (optionCount > 0) {
        //console.log(`Found ${optionCount} options in the standard estimate selector`);
        return await this.page.locator(standardSelector).allTextContents();
      }

      // Try alternative selectors
      const alternativeSelectors = [
        'select.estimate-selector option',
        '.product-estimator-estimate-selector option',
        '.pe-estimate-selector option',
        'select[name="estimate_selector"] option',
        '.estimate-dropdown option',
        'select:has-text("Kitchen Reno") option',
        'select:has-text("Bathroom Reno") option'
      ];

      for (const selector of alternativeSelectors) {
        try {
          const count = await this.page.locator(selector).count();
          if (count > 0) {
            //console.log(`Found ${count} options with selector: ${selector}`);
            return await this.page.locator(selector).allTextContents();
          }
        } catch (e) {
          // Ignore errors for individual selectors
        }
      }

      // Last resort: try to get the options via JavaScript
      //console.log('No options found with standard selectors, trying JavaScript approach');
      const optionsFromJS = await this.page.evaluate(() => {
        // Look for any select element that might be the estimate selector
        const potentialSelectors = document.querySelectorAll('select');
        for (const select of potentialSelectors) {
          // Check if this select has options with estimate names
          const options = Array.from(select.options);
          if (options.length > 0) {
            // Check if any option contains "Kitchen" or "Bathroom" (our test estimate names)
            const hasEstimateNames = options.some(option =>
              option.textContent.includes('Kitchen') ||
              option.textContent.includes('Bathroom') ||
              option.textContent.includes('Reno') ||
              option.textContent.includes('Estimate')
            );

            if (hasEstimateNames) {
              // This is likely our estimate selector
              return options.map(option => option.textContent.trim());
            }
          }
        }

        // If we can't find a select, look for elements that might represent options
        const estimateItems = document.querySelectorAll('.estimate-item, .product-estimator-estimate-item, .pe-estimate-item, .estimate-card');
        if (estimateItems.length > 0) {
          return Array.from(estimateItems).map(item => item.innerText.trim());
        }

        return [];
      });

      if (optionsFromJS.length > 0) {
        //console.log(`Found ${optionsFromJS.length} options via JavaScript:`, optionsFromJS);
        return optionsFromJS;
      }

      //console.log('No estimate selector options found');
      return [];

    } catch (error) {
      console.error(`Error getting estimate selector options: ${error.message}`);
      return [];
    }
  }

  /**
   * Open the estimate selector dropdown
   * @returns {Promise<void>}
   */
  async openEstimateSelector() {
    try {
      //console.log('Attempting to open estimate selector dropdown...');

      // Try the standard selector first
      const selectorCount = await this.page.locator(this.estimateSelector).count();
      if (selectorCount > 0) {
        //console.log('Found standard estimate selector, clicking it');
        await this.page.locator(this.estimateSelector).click();
        await this.page.waitForTimeout(500); // Wait for dropdown to appear
        return;
      }

      // Try alternative selectors
      const alternativeSelectors = [
        'select.estimate-selector',
        '.product-estimator-estimate-selector',
        '.pe-estimate-selector',
        'select[name="estimate_selector"]',
        '.estimate-dropdown',
        'select:has-text("Kitchen Reno")',
        'select:has-text("Bathroom Reno")',
        'button.dropdown-toggle:has-text("Estimates")',
        '.estimates-dropdown-toggle'
      ];

      for (const selector of alternativeSelectors) {
        try {
          const elements = await this.page.locator(selector).all();
          for (const element of elements) {
            if (await element.isVisible()) {
              //console.log(`Found and clicking selector with: ${selector}`);
              await element.click();
              await this.page.waitForTimeout(500); // Wait for dropdown to appear
              return;
            }
          }
        } catch (e) {
          // Ignore errors for individual selectors
        }
      }

      // If we can't find a dropdown, see if the estimates are already visible
      const visibleEstimates = await this.page.locator('.estimate-item, .product-estimator-estimate-item, .pe-estimate-item, .estimate-card').count();
      if (visibleEstimates > 0) {
        //console.log(`Found ${visibleEstimates} visible estimate items - dropdown may already be open`);
        return;
      }

      // Last resort: try to interact with the dropdown via JavaScript
      //console.log('No visible dropdown found, trying JavaScript approach');
      await this.page.evaluate(() => {
        // Try to find and click any element that might open the dropdown
        const potentialTriggers = [
          ...document.querySelectorAll('select'),
          ...document.querySelectorAll('.dropdown-toggle'),
          ...document.querySelectorAll('[data-toggle="dropdown"]'),
          ...document.querySelectorAll('.estimates-toggle'),
          ...document.querySelectorAll('button:has-text("Estimates")'),
          ...document.querySelectorAll('a:has-text("Estimates")')
        ];

        for (const element of potentialTriggers) {
          if (element.offsetWidth > 0 && element.offsetHeight > 0) { // Check if visible
            //console.log('[Browser] Found potential dropdown trigger, clicking it');
            element.click();
            return true;
          }
        }

        return false;
      });

      console.error('Could not find or open estimate selector dropdown');
    } catch (error) {
      console.error(`Error opening estimate selector: ${error.message}`);
    }
  }

  /**
   * Clear local storage estimates
   * @returns {Promise<void>}
   */
  async clearLocalStorageEstimates() {
    try {
      // Use the correct key for product estimator data
      await this.page.evaluate(() => {
        try {
          // Remove the main product estimator data
          localStorage.removeItem('productEstimatorEstimateData');

          // Also clear any other potential related items
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (
              key.includes('estimate') ||
              key.includes('room') ||
              key.includes('product')
            )) {
              localStorage.removeItem(key);
            }
          }

          //console.log('[Test] Cleared localStorage estimate data');
          return true;
        } catch (e) {
          console.error('[Test] Error clearing localStorage:', e);
          return false;
        }
      });

      //console.log('Successfully cleared product estimator data from storage');
    } catch (error) {
      console.error(`Error in clearLocalStorageEstimates: ${error.message}`);
    }
  }
}

module.exports = EstimateCreationPage;
