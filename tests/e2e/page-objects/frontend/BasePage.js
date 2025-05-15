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
    this.headerEstimateLink = 'header a[href*="product-estimator"]';
    this.modalContainer = '.pe-modal-container';
    this.loadingIndicator = '.pe-loading-indicator';
  }

  /**
   * Wait for page load with network idle
   * @returns {Promise<void>}
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Wait for loading indicator to disappear
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<void>}
   */
  async waitForLoadingComplete(timeout = 5000) {
    // First check if loading indicator exists, then wait for it to disappear
    const loadingExists = await this.page.locator(this.loadingIndicator).count() > 0;
    if (loadingExists) {
      await this.page.locator(this.loadingIndicator).waitFor({ state: 'hidden', timeout });
    }
  }

  /**
   * Click the header estimate link
   * @returns {Promise<void>}
   */
  async clickHeaderEstimateLink() {
    await this.page.locator(this.headerEstimateLink).click();
    await this.waitForLoadingComplete();
  }

  /**
   * Check if modal is visible
   * @returns {Promise<boolean>}
   */
  async isModalVisible() {
    return await this.page.locator(this.modalContainer).isVisible();
  }

  /**
   * Get text of validation error message
   * @param {string} fieldName - Form field name or identifier
   * @returns {Promise<string>} Error message text
   */
  async getValidationError(fieldName) {
    const errorSelector = `.pe-form-error[data-field="${fieldName}"]`;
    return await this.page.locator(errorSelector).textContent();
  }
}

module.exports = BasePage;