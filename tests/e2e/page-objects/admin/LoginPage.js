const AdminBasePage = require('./AdminBasePage');

/**
 * Page object for the WordPress login page
 */
class LoginPage extends AdminBasePage {
  /**
   * @param {import('@playwright/test').Page} page - Playwright page object
   */
  constructor(page) {
    super(page);
    
    // Login form selectors
    this.loginUrl = '/wp-login.php';
    this.usernameInput = '#user_login';
    this.passwordInput = '#user_pass';
    this.loginButton = '#wp-submit';
    this.loginError = '#login_error';
    this.rememberMeCheckbox = '#rememberme';
    this.lostPasswordLink = 'a:has-text("Lost your password?")';
  }

  /**
   * Navigate to the login page
   * @returns {Promise<void>}
   */
  async navigateToLogin() {
    await this.page.goto(this.loginUrl);
    await this.waitForPageLoad();
  }

  /**
   * Login with the provided credentials
   * @param {string} username - Username
   * @param {string} password - Password
   * @param {boolean} rememberMe - Whether to check the "Remember Me" checkbox
   * @returns {Promise<void>}
   */
  async login(username, password, rememberMe = false) {
    await this.page.locator(this.usernameInput).fill(username);
    await this.page.locator(this.passwordInput).fill(password);
    
    if (rememberMe) {
      await this.page.locator(this.rememberMeCheckbox).check();
    }
    
    await this.page.locator(this.loginButton).click();
    await this.waitForPageLoad();
  }

  /**
   * Check if login was successful
   * @returns {Promise<boolean>}
   */
  async isLoggedIn() {
    return await this.page.locator(this.adminBar).isVisible();
  }

  /**
   * Check if login error is displayed
   * @returns {Promise<boolean>}
   */
  async hasLoginError() {
    return await this.page.locator(this.loginError).isVisible();
  }

  /**
   * Get the login error message
   * @returns {Promise<string>}
   */
  async getLoginErrorMessage() {
    return await this.page.locator(this.loginError).textContent();
  }

  /**
   * Login with admin credentials from environment variables
   * @returns {Promise<void>}
   */
  async loginAsAdmin() {
    const username = process.env.WP_ADMIN_USERNAME || 'admin';
    const password = process.env.WP_ADMIN_PASSWORD || 'password';
    
    await this.navigateToLogin();
    await this.login(username, password);
    
    // Verify login was successful
    if (!(await this.isLoggedIn())) {
      throw new Error('Failed to login as admin');
    }
  }

  /**
   * Login with a specific user role (requires test users to be set up)
   * @param {string} role - User role (editor, author, etc.)
   * @returns {Promise<void>}
   */
  async loginAsRole(role) {
    // This would require test users with different roles to be set up
    // For now, just use environment variables with a naming convention
    const username = process.env[`WP_${role.toUpperCase()}_USERNAME`] || `${role}`;
    const password = process.env[`WP_${role.toUpperCase()}_PASSWORD`] || 'password';
    
    await this.navigateToLogin();
    await this.login(username, password);
  }
}

module.exports = LoginPage;