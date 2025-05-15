const AdminBasePage = require('./AdminBasePage');

/**
 * Page object for the Product Estimator Settings page
 */
class SettingsPage extends AdminBasePage {
  /**
   * @param {import('@playwright/test').Page} page - Playwright page object
   */
  constructor(page) {
    super(page);
    
    // Tabs and settings containers
    this.verticalTabs = '.pe-vertical-tabs';
    this.tabItems = '.pe-vertical-tabs-nav-item';
    this.activeTab = '.pe-vertical-tabs-nav-item.active';
    this.tabContent = '.pe-vertical-tabs-content';
    this.activeTabContent = '.pe-vertical-tabs-content.active';
    
    // Settings form elements
    this.settingsForm = '.pe-settings-form';
    this.formFields = '.pe-setting-field';
    this.textInputs = 'input[type="text"]';
    this.numberInputs = 'input[type="number"]';
    this.textareas = 'textarea';
    this.checkboxes = 'input[type="checkbox"]';
    this.radioButtons = 'input[type="radio"]';
    this.toggleSwitches = '.pe-toggle-switch';
    this.saveButton = 'button.pe-save-settings, #submit';
    
    // Field validation
    this.validationErrors = '.pe-field-error';
    this.invalidField = '.pe-field-invalid';
    
    // Common settings by tab
    this.generalTab = '.pe-vertical-tabs-nav-item:has-text("General")';
    this.labelsTab = '.pe-vertical-tabs-nav-item:has-text("Labels")';
    this.featureSwitchesTab = '.pe-vertical-tabs-nav-item:has-text("Feature Switches")';
    this.notificationsTab = '.pe-vertical-tabs-nav-item:has-text("Notifications")';
    this.productUpgradesTab = '.pe-vertical-tabs-nav-item:has-text("Product Upgrades")';
    
    // Specific settings fields
    this.estimateValidityPeriod = 'input[name="estimate_validity_period"]';
    this.addToEstimateButtonText = 'input[name="add_to_estimate_button_text"]';
    this.similarProductsSwitchToggle = 'input[name="enable_similar_products"]';
    this.emailTemplateField = 'textarea[name="customer_email_template"]';
  }

  /**
   * Navigate to the Settings page
   * @returns {Promise<void>}
   */
  async navigateToSettings() {
    await this.navigateToMenu('Product Estimator > Settings');
  }

  /**
   * Check if the vertical tabs interface is visible
   * @returns {Promise<boolean>}
   */
  async isVerticalTabsVisible() {
    return await this.page.locator(this.verticalTabs).isVisible();
  }

  /**
   * Get all tab names
   * @returns {Promise<string[]>} Array of tab names
   */
  async getTabNames() {
    return await this.page.locator(this.tabItems).allTextContents();
  }

  /**
   * Click on a tab by name
   * @param {string} tabName - Name of the tab to click
   * @returns {Promise<void>}
   */
  async clickTab(tabName) {
    await this.page.locator(`${this.tabItems}:has-text("${tabName}")`).click();
    // Wait for tab content to be visible
    await this.page.locator(this.activeTabContent).waitFor({ state: 'visible' });
  }

  /**
   * Check if a specific tab is active
   * @param {string} tabName - Name of the tab to check
   * @returns {Promise<boolean>}
   */
  async isTabActive(tabName) {
    return await this.page.locator(`${this.activeTab}:has-text("${tabName}")`).isVisible();
  }

  /**
   * Set a value for a text or number input field
   * @param {string} fieldName - Name or label of the field
   * @param {string} value - Value to set
   * @returns {Promise<void>}
   */
  async setInputValue(fieldName, value) {
    // Try to find by name attribute
    const inputByName = this.page.locator(`input[name="${fieldName}"]`);
    if (await inputByName.count() > 0) {
      await inputByName.fill(value);
      return;
    }
    
    // Try to find by label text
    const inputByLabel = this.page.locator(`label:has-text("${fieldName}") + input, label:has-text("${fieldName}") input`);
    if (await inputByLabel.count() > 0) {
      await inputByLabel.fill(value);
      return;
    }
    
    throw new Error(`Field '${fieldName}' not found`);
  }

  /**
   * Set a value for a textarea field
   * @param {string} fieldName - Name or label of the field
   * @param {string} value - Value to set
   * @returns {Promise<void>}
   */
  async setTextareaValue(fieldName, value) {
    // Try to find by name attribute
    const textareaByName = this.page.locator(`textarea[name="${fieldName}"]`);
    if (await textareaByName.count() > 0) {
      await textareaByName.fill(value);
      return;
    }
    
    // Try to find by label text
    const textareaByLabel = this.page.locator(`label:has-text("${fieldName}") + textarea, label:has-text("${fieldName}") textarea`);
    if (await textareaByLabel.count() > 0) {
      await textareaByLabel.fill(value);
      return;
    }
    
    throw new Error(`Textarea '${fieldName}' not found`);
  }

  /**
   * Toggle a feature switch
   * @param {string} switchName - Name of the feature switch
   * @param {string} state - State to set ('Enabled' or 'Disabled')
   * @returns {Promise<void>}
   */
  async toggleFeatureSwitch(switchName, state) {
    const isEnabled = state.toLowerCase() === 'enabled';
    
    // Find the toggle switch by name
    const toggleLabel = this.page.locator(`label:has-text("${switchName}")`);
    
    if (await toggleLabel.count() === 0) {
      throw new Error(`Feature switch '${switchName}' not found`);
    }
    
    // Get the current state of the toggle
    const toggleInput = toggleLabel.locator('input[type="checkbox"]');
    const isCurrentlyChecked = await toggleInput.isChecked();
    
    // Toggle if the current state doesn't match the desired state
    if (isCurrentlyChecked !== isEnabled) {
      await toggleLabel.click();
    }
  }

  /**
   * Click the Save Changes button
   * @returns {Promise<void>}
   */
  async saveChanges() {
    await this.page.locator(this.saveButton).click();
    await this.waitForAjaxCompletion();
    
    // Wait for success notice to appear
    await this.waitForNotice('success');
  }

  /**
   * Check if validation error is displayed for a field
   * @param {string} fieldName - Name of the field
   * @returns {Promise<boolean>}
   */
  async hasValidationError(fieldName) {
    const fieldSelector = `[name="${fieldName}"]`;
    const field = this.page.locator(fieldSelector);
    
    if (await field.count() === 0) {
      throw new Error(`Field '${fieldName}' not found`);
    }
    
    // Check if field has error class
    const hasErrorClass = await field.evaluate(el => {
      return el.classList.contains('pe-field-invalid');
    });
    
    // Check if there's an error message
    const errorMessage = this.page.locator(`${fieldSelector} + .pe-field-error, .pe-field-error[data-field="${fieldName}"]`);
    const hasErrorMessage = await errorMessage.isVisible();
    
    return hasErrorClass || hasErrorMessage;
  }

  /**
   * Get the validation error message for a field
   * @param {string} fieldName - Name of the field
   * @returns {Promise<string>}
   */
  async getValidationErrorMessage(fieldName) {
    const fieldSelector = `[name="${fieldName}"]`;
    const errorMessage = this.page.locator(`${fieldSelector} + .pe-field-error, .pe-field-error[data-field="${fieldName}"]`);
    
    if (await errorMessage.count() === 0) {
      return '';
    }
    
    return await errorMessage.textContent();
  }

  /**
   * Check if a field is highlighted as invalid
   * @param {string} fieldName - Name of the field
   * @returns {Promise<boolean>}
   */
  async isFieldHighlighted(fieldName) {
    const field = this.page.locator(`[name="${fieldName}"]`);
    
    if (await field.count() === 0) {
      throw new Error(`Field '${fieldName}' not found`);
    }
    
    return await field.evaluate(el => {
      return el.classList.contains('pe-field-invalid');
    });
  }

  /**
   * Add a new upgrade option
   * @returns {Promise<void>}
   */
  async addNewUpgradeOption() {
    // Click the "Add New" button
    await this.page.locator('button:has-text("Add New Upgrade")').click();
    
    // Fill in the upgrade details in the form that appears
    await this.page.locator('input[name="upgrade_name"]').first().fill('Premium Upgrade');
    await this.page.locator('input[name="upgrade_price"]').first().fill('50');
    await this.page.locator('textarea[name="upgrade_description"]').first().fill('Premium quality upgrade option');
    
    // Select a product or category if required
    const productSelect = this.page.locator('select[name="upgrade_product"]').first();
    if (await productSelect.count() > 0) {
      await productSelect.selectOption({ index: 1 }); // Select the first product in the list
    }
  }

  /**
   * Get the current value of a field
   * @param {string} fieldName - Name of the field
   * @returns {Promise<string>}
   */
  async getFieldValue(fieldName) {
    const field = this.page.locator(`[name="${fieldName}"]`);
    
    if (await field.count() === 0) {
      throw new Error(`Field '${fieldName}' not found`);
    }
    
    const tagName = await field.evaluate(el => el.tagName.toLowerCase());
    
    if (tagName === 'textarea') {
      return await field.inputValue();
    } else if (tagName === 'input') {
      const type = await field.evaluate(el => el.type.toLowerCase());
      
      if (type === 'checkbox' || type === 'radio') {
        return await field.isChecked() ? 'checked' : 'unchecked';
      } else {
        return await field.inputValue();
      }
    } else if (tagName === 'select') {
      return await field.inputValue();
    }
    
    return '';
  }
}

module.exports = SettingsPage;