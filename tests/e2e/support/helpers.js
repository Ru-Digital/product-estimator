/**
 * Helper functions for E2E tests
 */

/**
 * Wait for a condition to be true with polling
 * @param {Function} conditionFn - Function that returns a boolean or Promise<boolean>
 * @param {Object} options - Options for the wait
 * @param {number} [options.timeout=5000] - Timeout in milliseconds
 * @param {number} [options.pollingInterval=100] - Polling interval in milliseconds
 * @returns {Promise<void>}
 */
async function waitForCondition(conditionFn, { timeout = 5000, pollingInterval = 100 } = {}) {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    const result = await conditionFn();
    if (result) return;
    
    // Wait for the polling interval
    await new Promise(resolve => setTimeout(resolve, pollingInterval));
  }
  
  throw new Error(`Condition not met within ${timeout}ms timeout`);
}

/**
 * Generate a random string for test data
 * @param {number} [length=8] - Length of the string
 * @returns {string}
 */
function randomString(length = 8) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return result;
}

/**
 * Generate a random postcode for test data
 * @returns {string}
 */
function randomPostcode() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

/**
 * Parse local storage estimates
 * @param {import('@playwright/test').Page} page - Playwright page
 * @returns {Promise<Array>} Array of estimate objects
 */
async function getLocalStorageEstimates(page) {
  return await page.evaluate(() => {
    const estimates = [];
    const keys = Object.keys(localStorage);
    
    for (const key of keys) {
      if (key.startsWith('estimate_')) {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          if (data) {
            estimates.push(data);
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
    }
    
    return estimates;
  });
}

module.exports = {
  waitForCondition,
  randomString,
  randomPostcode,
  getLocalStorageEstimates
};