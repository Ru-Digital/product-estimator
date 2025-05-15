const AdminBasePage = require('./AdminBasePage');

/**
 * Page object for the Customer Estimates admin page
 */
class CustomerEstimatesPage extends AdminBasePage {
  /**
   * @param {import('@playwright/test').Page} page - Playwright page object
   */
  constructor(page) {
    super(page);
    
    // List table selectors
    this.tableContainer = '.wp-list-table';
    this.tableHeader = '.wp-list-table thead';
    this.tableRows = '.wp-list-table tbody tr';
    this.tableColumns = '.wp-list-table thead th';
    this.tableCheckboxes = '.wp-list-table tbody .check-column input[type="checkbox"]';
    this.tableHeaderCheckbox = '.wp-list-table thead .check-column input[type="checkbox"]';
    this.tableRowActions = '.row-actions';
    this.tableEmptyMessage = '.wp-list-table .no-items';
    
    // Pagination selectors
    this.paginationControls = '.tablenav .pagination-links';
    this.nextPageButton = '.tablenav .pagination-links .next-page';
    this.previousPageButton = '.tablenav .pagination-links .prev-page';
    this.paginationPageNumbers = '.tablenav .pagination-links .page-numbers';
    
    // Filter selectors
    this.searchBox = '#post-search-input';
    this.searchButton = '#search-submit';
    this.dateFilter = '.tablenav select[name="date_filter"]';
    this.statusFilter = '.tablenav select[name="status_filter"]';
    this.filterButton = '.tablenav #post-query-submit';
    
    // Bulk action selectors
    this.bulkActionSelect = '.tablenav .bulk-action-selector-top';
    this.applyButton = '.tablenav #doaction';
    
    // Export button
    this.exportButton = '.tablenav .button-secondary:has-text("Export CSV")';
    
    // Estimate detail selectors
    this.estimateDetailContainer = '.estimate-detail-container';
    this.customerDetailsSection = '.customer-details-section';
    this.roomsSection = '.rooms-section';
    
    // Action buttons
    this.emailButton = '.row-actions .email a';
    this.printButton = '.row-actions .print a';
    this.deleteButton = '.row-actions .delete a';
    this.duplicateButton = '.row-actions .duplicate a';
    
    // Confirmation dialog
    this.confirmDialog = '.pe-confirmation-dialog';
    this.confirmButton = '.pe-dialog-confirm';
    this.cancelButton = '.pe-dialog-cancel';
  }

  /**
   * Navigate to the Customer Estimates page
   * @returns {Promise<void>}
   */
  async navigateToCustomerEstimates() {
    await this.navigateToMenu('Product Estimator > Customer Estimates');
  }

  /**
   * Check if the Customer Estimates table is visible
   * @returns {Promise<boolean>}
   */
  async isEstimatesTableVisible() {
    return await this.page.locator(this.tableContainer).isVisible();
  }

  /**
   * Get all column headers in the table
   * @returns {Promise<string[]>} Array of column header texts
   */
  async getColumnHeaders() {
    return await this.page.locator(this.tableColumns).allTextContents();
  }

  /**
   * Get the number of estimates in the table
   * @returns {Promise<number>}
   */
  async getEstimateCount() {
    // Check for empty table message
    if (await this.page.locator(this.tableEmptyMessage).isVisible()) {
      return 0;
    }
    
    // Count rows
    return await this.page.locator(this.tableRows).count();
  }

  /**
   * Search for an estimate
   * @param {string} searchTerm - Search term
   * @returns {Promise<void>}
   */
  async searchForEstimate(searchTerm) {
    await this.page.locator(this.searchBox).fill(searchTerm);
    await this.page.locator(this.searchButton).click();
    await this.waitForPageLoad();
  }

  /**
   * Filter estimates by date
   * @param {string} dateFilter - Date filter value ('today', 'last7days', 'last30days', etc.)
   * @returns {Promise<void>}
   */
  async filterByDate(dateFilter) {
    await this.page.locator(this.dateFilter).selectOption(dateFilter);
    await this.page.locator(this.filterButton).click();
    await this.waitForPageLoad();
  }

  /**
   * Click on an estimate name to view details
   * @param {string} estimateName - Name of the estimate to click
   * @returns {Promise<void>}
   */
  async clickEstimateName(estimateName) {
    await this.page.locator(`a:has-text("${estimateName}")`).first().click();
    await this.waitForPageLoad();
  }

  /**
   * Click on a row action for a specific estimate
   * @param {string} estimateName - Name of the estimate
   * @param {string} action - Action to click ('email', 'print', 'delete', 'duplicate')
   * @returns {Promise<void>}
   */
  async clickRowAction(estimateName, action) {
    // First hover over the row to make row actions visible
    await this.page.locator(`tr:has-text("${estimateName}")`).first().hover();
    
    // Then click the action
    const actionMap = {
      'email': this.emailButton,
      'print': this.printButton,
      'delete': this.deleteButton,
      'duplicate': this.duplicateButton
    };
    
    const actionSelector = actionMap[action.toLowerCase()];
    if (!actionSelector) {
      throw new Error(`Unknown action: ${action}`);
    }
    
    await this.page.locator(`tr:has-text("${estimateName}") ${actionSelector}`).click();
    
    // If it's a delete action, there will be a confirmation dialog
    if (action.toLowerCase() === 'delete' || action.toLowerCase() === 'email') {
      await this.waitForConfirmationDialog();
    }
  }

  /**
   * Wait for confirmation dialog to appear
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<void>}
   */
  async waitForConfirmationDialog(timeout = 5000) {
    await this.page.locator(this.confirmDialog).waitFor({ state: 'visible', timeout });
  }

  /**
   * Confirm action in confirmation dialog
   * @returns {Promise<void>}
   */
  async confirmDialog() {
    await this.page.locator(this.confirmButton).click();
    await this.waitForAjaxCompletion();
  }

  /**
   * Cancel action in confirmation dialog
   * @returns {Promise<void>}
   */
  async cancelDialog() {
    await this.page.locator(this.cancelButton).click();
  }

  /**
   * Check if estimate detail view is visible
   * @returns {Promise<boolean>}
   */
  async isEstimateDetailVisible() {
    return await this.page.locator(this.estimateDetailContainer).isVisible();
  }

  /**
   * Check if customer details section is visible
   * @returns {Promise<boolean>}
   */
  async isCustomerDetailsSectionVisible() {
    return await this.page.locator(this.customerDetailsSection).isVisible();
  }

  /**
   * Check if rooms section is visible
   * @returns {Promise<boolean>}
   */
  async isRoomsSectionVisible() {
    return await this.page.locator(this.roomsSection).isVisible();
  }

  /**
   * Click 'Next page' in pagination
   * @returns {Promise<void>}
   */
  async clickNextPage() {
    await this.page.locator(this.nextPageButton).click();
    await this.waitForPageLoad();
  }

  /**
   * Select multiple estimates by checkbox
   * @param {number[]} rowIndexes - Array of row indexes to select (0-based)
   * @returns {Promise<void>}
   */
  async selectEstimates(rowIndexes) {
    for (const index of rowIndexes) {
      await this.page.locator(this.tableCheckboxes).nth(index).check();
    }
  }

  /**
   * Perform a bulk action
   * @param {string} action - Bulk action to perform ('delete', 'email', 'export')
   * @returns {Promise<void>}
   */
  async performBulkAction(action) {
    await this.page.locator(this.bulkActionSelect).selectOption(action);
    await this.page.locator(this.applyButton).click();
    
    // If it's a delete action, there will be a confirmation dialog
    if (action.toLowerCase() === 'delete') {
      await this.waitForConfirmationDialog();
    }
  }

  /**
   * Click 'Export CSV' button
   * @returns {Promise<void>}
   */
  async clickExportCSV() {
    // This will trigger a download
    const downloadPromise = this.page.waitForEvent('download');
    await this.page.locator(this.exportButton).click();
    const download = await downloadPromise;
    
    // Return the downloaded file name for verification
    return download.suggestedFilename();
  }

  /**
   * Sort table by column
   * @param {string} columnName - Name of the column to sort by
   * @returns {Promise<void>}
   */
  async sortTableByColumn(columnName) {
    await this.page.locator(this.tableHeader).locator(`th:has-text("${columnName}")`).click();
    await this.waitForPageLoad();
  }

  /**
   * Check if pagination controls are visible
   * @returns {Promise<boolean>}
   */
  async isPaginationVisible() {
    return await this.page.locator(this.paginationControls).isVisible();
  }
}

module.exports = CustomerEstimatesPage;