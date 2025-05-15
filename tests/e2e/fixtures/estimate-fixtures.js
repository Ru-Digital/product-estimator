/**
 * Test fixtures for creating and managing test estimates
 */

/**
 * Create a test customer estimate in WordPress
 * @param {import('@playwright/test').Page} page - Playwright page
 * @param {Object} estimateData - Data for the estimate to create
 * @returns {Promise<string>} ID of the created estimate
 */
async function createTestEstimate(page, estimateData = {}) {
  // Default data
  const defaultData = {
    name: `Test Estimate ${new Date().toISOString()}`,
    customer: {
      name: 'Test Customer',
      email: 'test@example.com',
      phone: '0412345678',
      postcode: '4000'
    },
    rooms: [
      {
        name: 'Living Room',
        width: 4,
        length: 5,
        products: [1, 2] // Product IDs to add
      }
    ]
  };
  
  // Merge with provided data
  const data = {
    ...defaultData,
    ...estimateData,
    customer: {
      ...defaultData.customer,
      ...(estimateData.customer || {})
    }
  };
  
  // Use WordPress REST API to create the estimate
  // This requires authentication with a user who has the appropriate capabilities
  
  // First, get a nonce for the REST API
  const nonce = await page.evaluate(() => {
    return window.wpApiSettings?.nonce || '';
  });
  
  if (!nonce) {
    // If we can't get a nonce from the page, we need to log in and get one
    await page.goto('/wp-login.php');
    await page.fill('#user_login', process.env.WP_ADMIN_USERNAME || 'admin');
    await page.fill('#user_pass', process.env.WP_ADMIN_PASSWORD || 'password');
    await page.click('#wp-submit');
    await page.waitForLoadState('networkidle');
    
    // Now try to get the nonce again
    const newNonce = await page.evaluate(() => {
      return window.wpApiSettings?.nonce || '';
    });
    
    if (!newNonce) {
      throw new Error('Could not get REST API nonce. Make sure you are logged in as an administrator.');
    }
  }
  
  // Create the estimate using the REST API
  const response = await page.evaluate(async (data, nonce) => {
    const response = await fetch('/wp-json/product-estimator/v1/estimates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-WP-Nonce': nonce
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create test estimate: ${response.statusText}`);
    }
    
    return await response.json();
  }, data, nonce);
  
  return response.id;
}

/**
 * Create multiple test estimates
 * @param {import('@playwright/test').Page} page - Playwright page
 * @param {number} count - Number of estimates to create
 * @param {Object} baseEstimateData - Base data for all estimates
 * @returns {Promise<string[]>} Array of created estimate IDs
 */
async function createTestEstimates(page, count = 5, baseEstimateData = {}) {
  const estimateIds = [];
  
  for (let i = 0; i < count; i++) {
    const data = {
      ...baseEstimateData,
      name: `Test Estimate ${i + 1}`,
      customer: {
        ...(baseEstimateData.customer || {}),
        name: `Test Customer ${i + 1}`,
        email: `test${i + 1}@example.com`
      }
    };
    
    const id = await createTestEstimate(page, data);
    estimateIds.push(id);
  }
  
  return estimateIds;
}

/**
 * Delete a test estimate
 * @param {import('@playwright/test').Page} page - Playwright page
 * @param {string} estimateId - ID of the estimate to delete
 * @returns {Promise<boolean>} True if deletion was successful
 */
async function deleteTestEstimate(page, estimateId) {
  // Get a nonce for the REST API
  const nonce = await page.evaluate(() => {
    return window.wpApiSettings?.nonce || '';
  });
  
  if (!nonce) {
    throw new Error('Could not get REST API nonce. Make sure you are logged in as an administrator.');
  }
  
  // Delete the estimate using the REST API
  const success = await page.evaluate(async (id, nonce) => {
    const response = await fetch(`/wp-json/product-estimator/v1/estimates/${id}`, {
      method: 'DELETE',
      headers: {
        'X-WP-Nonce': nonce
      }
    });
    
    return response.ok;
  }, estimateId, nonce);
  
  return success;
}

/**
 * Delete all test estimates
 * @param {import('@playwright/test').Page} page - Playwright page
 * @returns {Promise<boolean>} True if deletion was successful
 */
async function deleteAllTestEstimates(page) {
  // Get a nonce for the REST API
  const nonce = await page.evaluate(() => {
    return window.wpApiSettings?.nonce || '';
  });
  
  if (!nonce) {
    throw new Error('Could not get REST API nonce. Make sure you are logged in as an administrator.');
  }
  
  // Get all estimates with "Test Estimate" in the name
  const estimates = await page.evaluate(async (nonce) => {
    const response = await fetch('/wp-json/product-estimator/v1/estimates', {
      headers: {
        'X-WP-Nonce': nonce
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch estimates: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.filter(estimate => estimate.name.includes('Test Estimate'));
  }, nonce);
  
  // Delete each test estimate
  for (const estimate of estimates) {
    await deleteTestEstimate(page, estimate.id);
  }
  
  return true;
}

module.exports = {
  createTestEstimate,
  createTestEstimates,
  deleteTestEstimate,
  deleteAllTestEstimates
};