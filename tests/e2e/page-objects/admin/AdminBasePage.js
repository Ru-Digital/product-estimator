/**
 * Base Page Object for all admin pages
 */
class AdminBasePage {
  /**
   * @param {import('@playwright/test').Page} page - Playwright page object
   */
  constructor(page) {
    this.page = page;
    
    // Common selectors
    this.adminBar = '#wpadminbar';
    this.adminMenu = '#adminmenu';
    this.adminMenuItems = '#adminmenu li';
    this.productEstimatorMenuItem = '#adminmenu li div.wp-menu-name:has-text("Product Estimator")';
    this.adminNotice = '.notice';
    this.successNotice = '.notice-success';
    this.errorNotice = '.notice-error';
    this.pageTitle = '.wrap h1';
    this.loadingSpinner = '.spinner.is-active';
    this.submitButton = 'input[type="submit"], .button-primary';
  }

  /**
   * Wait for admin page load with network idle
   * @returns {Promise<void>}
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Wait for AJAX completion
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<void>}
   */
  async waitForAjaxCompletion(timeout = 5000) {
    await this.page.waitForFunction(() => {
      return typeof jQuery !== 'undefined' ? jQuery.active === 0 : true;
    }, { timeout });
  }

  /**
   * Navigate to an admin page
   * @param {string} path - Admin path (without /wp-admin/)
   * @returns {Promise<void>}
   */
  async navigateTo(path) {
    const adminPath = path.startsWith('/') ? path : `/${path}`;
    await this.page.goto(`/wp-admin${adminPath}`);
    await this.waitForPageLoad();
  }

  /**
   * Navigate to a menu item in the admin menu
   * @param {string} menuPath - Menu path like "Product Estimator > Settings"
   * @returns {Promise<void>}
   */
  async navigateToMenu(menuPath) {
    const menuParts = menuPath.split(' > ');
    
    // Click on the top-level menu
    await this.page.locator(`#adminmenu li div.wp-menu-name:has-text("${menuParts[0]}")`).click();
    
    // If there's a submenu, click on it
    if (menuParts.length > 1) {
      await this.page.locator(`#adminmenu li a:has-text("${menuParts[1]}")`).click();
    }
    
    await this.waitForPageLoad();
  }

  /**
   * Check if a success notice is displayed
   * @returns {Promise<boolean>}
   */
  async hasSuccessNotice() {
    return await this.page.locator(this.successNotice).isVisible();
  }

  /**
   * Get the text of the success notice
   * @returns {Promise<string>}
   */
  async getSuccessNoticeText() {
    return await this.page.locator(this.successNotice).textContent();
  }

  /**
   * Check if an error notice is displayed
   * @returns {Promise<boolean>}
   */
  async hasErrorNotice() {
    return await this.page.locator(this.errorNotice).isVisible();
  }

  /**
   * Get the text of the error notice
   * @returns {Promise<string>}
   */
  async getErrorNoticeText() {
    return await this.page.locator(this.errorNotice).textContent();
  }

  /**
   * Get the page title text
   * @returns {Promise<string>}
   */
  async getPageTitle() {
    return await this.page.locator(this.pageTitle).textContent();
  }

  /**
   * Check if the admin menu contains a specific item
   * @param {string} menuText - Text of the menu item to look for
   * @returns {Promise<boolean>}
   */
  async adminMenuContains(menuText) {
    return (await this.page.locator(`#adminmenu li:has-text("${menuText}")`).count()) > 0;
  }

  /**
   * Check if an element is visible on the page
   * @param {string} selector - CSS selector for the element
   * @returns {Promise<boolean>}
   */
  async isElementVisible(selector) {
    return await this.page.locator(selector).isVisible();
  }

  /**
   * Wait for a notice to appear
   * @param {string} noticeType - Type of notice ('success' or 'error')
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<void>}
   */
  async waitForNotice(noticeType = 'success', timeout = 5000) {
    const selector = noticeType === 'error' ? this.errorNotice : this.successNotice;
    await this.page.locator(selector).waitFor({ state: 'visible', timeout });
  }

  /**
   * Click a button or link by its text
   * @param {string} text - Text of the button or link
   * @returns {Promise<void>}
   */
  async clickButtonWithText(text) {
    await this.page.locator(`button:has-text("${text}"), input[type="submit"][value="${text}"], a:has-text("${text}")`).click();
  }
}

module.exports = AdminBasePage;