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
    
    // Element selectors
    this.newEstimateForm = '.pe-new-estimate-form';
    this.estimateNameInput = 'input[name="estimate_name"]';
    this.postcodeInput = 'input[name="postcode"]';
    this.createEstimateButton = 'button.pe-create-estimate-btn';
    this.newEstimateButton = 'button.pe-new-estimate-btn';
    this.estimateSelector = 'select.pe-estimate-selector';
    this.estimateCard = '.pe-estimate-item';
    this.addRoomForm = '.pe-new-room-form';
    this.estimatesEmptyMessage = '.pe-estimates-empty';
    this.estimatesList = '.pe-estimates-list';
    this.selectedEstimate = '.pe-estimate-item.selected';
  }

  /**
   * Fill in the new estimate form
   * @param {string} name - Estimate name
   * @param {string} postcode - Postcode value
   * @returns {Promise<void>}
   */
  async fillNewEstimateForm(name, postcode) {
    if (name) {
      await this.page.locator(this.estimateNameInput).fill(name);
    }
    
    if (postcode) {
      await this.page.locator(this.postcodeInput).fill(postcode);
    }
  }

  /**
   * Click the create estimate button
   * @returns {Promise<void>}
   */
  async clickCreateEstimate() {
    await this.page.locator(this.createEstimateButton).click();
    await this.waitForLoadingComplete();
  }

  /**
   * Create a new estimate with the provided details
   * @param {string} name - Estimate name
   * @param {string} postcode - Postcode value
   * @returns {Promise<void>}
   */
  async createNewEstimate(name, postcode) {
    await this.fillNewEstimateForm(name, postcode);
    await this.clickCreateEstimate();
  }

  /**
   * Check if the Add Room form is displayed
   * @returns {Promise<boolean>}
   */
  async isAddRoomFormDisplayed() {
    return await this.page.locator(this.addRoomForm).isVisible();
  }

  /**
   * Click the new estimate button
   * @returns {Promise<void>}
   */
  async clickNewEstimateButton() {
    await this.page.locator(this.newEstimateButton).click();
    await this.waitForLoadingComplete();
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
    const selector = `${this.estimateCard}:has-text("${name}")`;
    return (await this.page.locator(selector).count()) > 0;
  }

  /**
   * Check if an estimate with the given name is selected
   * @param {string} name - Estimate name
   * @returns {Promise<boolean>}
   */
  async isEstimateSelected(name) {
    const selector = `${this.selectedEstimate}:has-text("${name}")`;
    return (await this.page.locator(selector).count()) > 0;
  }

  /**
   * Get all options from the estimate selector dropdown
   * @returns {Promise<string[]>} Array of option text values
   */
  async getEstimateSelectorOptions() {
    return await this.page.locator(`${this.estimateSelector} option`).allTextContents();
  }

  /**
   * Open the estimate selector dropdown
   * @returns {Promise<void>}
   */
  async openEstimateSelector() {
    await this.page.locator(this.estimateSelector).click();
  }

  /**
   * Clear local storage estimates
   * @returns {Promise<void>}
   */
  async clearLocalStorageEstimates() {
    await this.page.evaluate(() => {
      const keys = Object.keys(localStorage);
      const estimateKeys = keys.filter(key => key.startsWith('estimate_'));
      
      estimateKeys.forEach(key => {
        localStorage.removeItem(key);
      });
    });
  }
}

module.exports = EstimateCreationPage;