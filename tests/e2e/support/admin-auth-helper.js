/**
 * Helper functions for WordPress admin authentication
 */
const fs = require('fs');
const path = require('path');

/**
 * Save authentication cookies to a file for reuse
 * @param {import('@playwright/test').BrowserContext} context - Playwright browser context
 * @param {string} [cookiePath='./test-results/auth/admin-cookies.json'] - Path to save cookies
 * @returns {Promise<void>}
 */
async function saveAuthCookies(context, cookiePath = './test-results/auth/admin-cookies.json') {
  // Get all cookies
  const cookies = await context.cookies();
  
  // Create directory if it doesn't exist
  const cookieDir = path.dirname(cookiePath);
  if (!fs.existsSync(cookieDir)) {
    fs.mkdirSync(cookieDir, { recursive: true });
  }
  
  // Save cookies to file
  fs.writeFileSync(cookiePath, JSON.stringify(cookies));
}

/**
 * Load authentication cookies from a file
 * @param {import('@playwright/test').BrowserContext} context - Playwright browser context
 * @param {string} [cookiePath='./test-results/auth/admin-cookies.json'] - Path to load cookies from
 * @returns {Promise<boolean>} True if cookies were loaded successfully
 */
async function loadAuthCookies(context, cookiePath = './test-results/auth/admin-cookies.json') {
  // Check if cookie file exists
  if (!fs.existsSync(cookiePath)) {
    return false;
  }
  
  try {
    // Load cookies from file
    const cookies = JSON.parse(fs.readFileSync(cookiePath, 'utf8'));
    
    // Set cookies in context
    await context.addCookies(cookies);
    return true;
  } catch (error) {
    console.error('Error loading auth cookies:', error);
    return false;
  }
}

/**
 * Authenticate as admin using saved cookies or login form
 * @param {import('@playwright/test').Page} page - Playwright page
 * @param {Object} credentials - Login credentials
 * @param {string} credentials.username - Admin username
 * @param {string} credentials.password - Admin password
 * @param {string} [cookiePath='./test-results/auth/admin-cookies.json'] - Path for cookie storage
 * @returns {Promise<boolean>} True if authentication was successful
 */
async function authenticateAsAdmin(page, credentials, cookiePath = './test-results/auth/admin-cookies.json') {
  // Try to use saved cookies first
  const cookiesLoaded = await loadAuthCookies(page.context(), cookiePath);
  
  if (cookiesLoaded) {
    // Navigate to admin page to check if cookies are valid
    await page.goto('/wp-admin/');
    
    // Check if we're already logged in
    if (await page.locator('#wpadminbar').isVisible()) {
      console.log('Authenticated using saved cookies');
      return true;
    }
  }
  
  // Cookies didn't work, login via form
  await page.goto('/wp-login.php');
  
  // Fill login form
  await page.locator('#user_login').fill(credentials.username);
  await page.locator('#user_pass').fill(credentials.password);
  await page.locator('#wp-submit').click();
  
  // Wait for navigation to complete
  await page.waitForLoadState('networkidle');
  
  // Check if login was successful
  const loginSuccessful = await page.locator('#wpadminbar').isVisible();
  
  if (loginSuccessful) {
    // Save cookies for future use
    await saveAuthCookies(page.context(), cookiePath);
    console.log('Authenticated via login form and saved cookies');
  }
  
  return loginSuccessful;
}

/**
 * Authenticate as a specific user role
 * @param {import('@playwright/test').Page} page - Playwright page
 * @param {string} role - User role (admin, editor, etc.)
 * @param {Object} credentials - Credentials object with usernames/passwords for different roles
 * @param {string} [cookiePathPrefix='./test-results/auth'] - Base path for cookie storage
 * @returns {Promise<boolean>} True if authentication was successful
 */
async function authenticateAsRole(page, role, credentials, cookiePathPrefix = './test-results/auth') {
  const cookiePath = `${cookiePathPrefix}/${role}-cookies.json`;
  
  // Get credentials for this role
  const username = credentials[`${role}Username`] || process.env[`WP_${role.toUpperCase()}_USERNAME`];
  const password = credentials[`${role}Password`] || process.env[`WP_${role.toUpperCase()}_PASSWORD`];
  
  if (!username || !password) {
    throw new Error(`No credentials found for role: ${role}`);
  }
  
  return await authenticateAsAdmin(page, { username, password }, cookiePath);
}

module.exports = {
  saveAuthCookies,
  loadAuthCookies,
  authenticateAsAdmin,
  authenticateAsRole
};