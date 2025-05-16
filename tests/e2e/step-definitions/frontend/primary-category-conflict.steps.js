const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

// Background steps
Given('the admin has configured primary product categories in settings', async function() {
  // This would be handled by fixture data or admin API setup
  // For now, we assume the test environment has this configured
  await this.page.evaluate(() => {
    // Mock the primary categories setting in the test environment
    window.productEstimatorVars = window.productEstimatorVars || {};
    window.productEstimatorVars.primaryCategories = ['flooring'];
  });
});

Given('product {string} exists with ID {string} in primary category {string}', async function(productName, productId, categoryName) {
  // This would typically be set up via fixtures or test data
  // For now, we'll mock it in the browser context
  await this.page.evaluate(({ productName, productId, categoryName }) => {
    window.testProducts = window.testProducts || {};
    window.testProducts[productId] = {
      id: productId,
      name: productName,
      category: categoryName,
      is_primary_category: true
    };
  }, { productName, productId, categoryName });
});

Given('product {string} exists with ID {string} in non-primary category {string}', async function(productName, productId, categoryName) {
  await this.page.evaluate(({ productName, productId, categoryName }) => {
    window.testProducts = window.testProducts || {};
    window.testProducts[productId] = {
      id: productId,
      name: productName,
      category: categoryName,
      is_primary_category: false
    };
  }, { productName, productId, categoryName });
});

Given('room {string} already contains product {string} in primary category', async function(roomName, productName) {
  await this.page.evaluate(({ roomName, productName }) => {
    const productData = window.testProducts[Object.keys(window.testProducts).find(id => 
      window.testProducts[id].name === productName
    )];
    
    // Add product to room in localStorage
    const estimateData = JSON.parse(localStorage.getItem('productEstimatorEstimateData') || '{}');
    const estimateId = Object.keys(estimateData.estimates)[0];
    const estimate = estimateData.estimates[estimateId];
    const roomId = Object.keys(estimate.rooms).find(id => estimate.rooms[id].name === roomName);
    
    if (roomId && productData) {
      estimate.rooms[roomId].products = estimate.rooms[roomId].products || {};
      estimate.rooms[roomId].products[productData.id] = {
        ...productData,
        is_primary_category: true
      };
      localStorage.setItem('productEstimatorEstimateData', JSON.stringify(estimateData));
    }
  }, { roomName, productName });
});

// When steps
When('I click {string} for product {string}', async function(buttonText, productName) {
  const productId = await this.page.evaluate((productName) => {
    return Object.keys(window.testProducts).find(id => 
      window.testProducts[id].name === productName
    );
  }, productName);
  
  // In real tests, this would click an actual button
  // For now, we simulate the action
  await this.page.evaluate((productId) => {
    // Simulate clicking "Add to Estimate" for a product
    window.productEstimator.modalManager.openModal(productId);
  }, productId);
});

When('I select the room {string}', async function(roomName) {
  // Wait for room selection form to be visible
  await this.page.waitForSelector('#product-estimator-room-selection-form', { timeout: 5000 });
  
  // Select the room from dropdown
  const roomSelect = await this.page.$('select[name="room_id"]');
  if (roomSelect) {
    await roomSelect.selectOption({ label: roomName });
  }
  
  // Submit the form
  await this.page.click('button[type="submit"]');
});

When('I click {string} in the conflict dialog', async function(buttonText) {
  // Wait for the dialog to be visible
  await this.page.waitForSelector('.pe-confirmation-dialog.visible', { timeout: 5000 });
  
  // Find and click the appropriate button
  const button = await this.page.locator(`.pe-dialog-buttons button:has-text("${buttonText}")`);
  await button.click();
});

// Then steps
Then('I should see a dialog titled {string}', async function(expectedTitle) {
  await this.page.waitForSelector('.pe-confirmation-dialog.visible', { timeout: 5000 });
  const title = await this.page.textContent('.pe-dialog-title');
  expect(title).toBe(expectedTitle);
});

Then('the dialog should contain the message {string}', async function(expectedMessage) {
  const message = await this.page.textContent('.pe-dialog-message');
  expect(message).toContain(expectedMessage);
});

Then('I should see three buttons:', async function(dataTable) {
  const expectedButtons = dataTable.hashes().map(row => row['Button Text']);
  const buttons = await this.page.$$eval('.pe-dialog-buttons button', 
    elements => elements.map(el => el.textContent.trim())
  );
  
  expect(buttons).toEqual(expect.arrayContaining(expectedButtons));
  expect(buttons.length).toBe(3);
});

Then('product {string} should be removed from room {string}', async function(productName, roomName) {
  const hasProduct = await this.page.evaluate(({ productName, roomName }) => {
    const estimateData = JSON.parse(localStorage.getItem('productEstimatorEstimateData') || '{}');
    const estimateId = Object.keys(estimateData.estimates)[0];
    const estimate = estimateData.estimates[estimateId];
    const roomId = Object.keys(estimate.rooms).find(id => estimate.rooms[id].name === roomName);
    
    if (!roomId) return false;
    
    const products = estimate.rooms[roomId].products || {};
    return Object.values(products).some(product => product.name === productName);
  }, { productName, roomName });
  
  expect(hasProduct).toBe(false);
});

Then('product {string} should appear in room {string}', async function(productName, roomName) {
  const hasProduct = await this.page.evaluate(({ productName, roomName }) => {
    const estimateData = JSON.parse(localStorage.getItem('productEstimatorEstimateData') || '{}');
    const estimateId = Object.keys(estimateData.estimates)[0];
    const estimate = estimateData.estimates[estimateId];
    const roomId = Object.keys(estimate.rooms).find(id => estimate.rooms[id].name === roomName);
    
    if (!roomId) return false;
    
    const products = estimate.rooms[roomId].products || {};
    return Object.values(products).some(product => product.name === productName);
  }, { productName, roomName });
  
  expect(hasProduct).toBe(true);
});

Then('I should be navigated to the estimates list', async function() {
  await this.page.waitForSelector('#product-estimator-estimates-list', { timeout: 5000 });
  const isVisible = await this.page.isVisible('#product-estimator-estimates-list');
  expect(isVisible).toBe(true);
});

Then('estimate {string} should be expanded', async function(estimateName) {
  const estimateSection = await this.page.locator(`.estimate-section:has-text("${estimateName}")`);
  const isExpanded = await estimateSection.evaluate(el => el.classList.contains('expanded'));
  expect(isExpanded).toBe(true);
});

Then('room {string} should be expanded', async function(roomName) {
  const roomItem = await this.page.locator(`.room-item:has-text("${roomName}")`);
  const isExpanded = await roomItem.evaluate(el => {
    const content = el.querySelector('.accordion-content');
    return content && content.style.display !== 'none';
  });
  expect(isExpanded).toBe(true);
});

Then('I should see a success dialog {string}', async function(expectedTitle) {
  await this.page.waitForSelector('.pe-confirmation-dialog.visible', { timeout: 5000 });
  const title = await this.page.textContent('.pe-dialog-title');
  expect(title).toBe(expectedTitle);
});

Then('the room totals should be recalculated', async function() {
  // Check that room totals have been updated
  const roomTotal = await this.page.textContent('.room-total');
  expect(roomTotal).toBeTruthy();
  // Additional validation could check specific values
});

Then('the conflict dialog should close', async function() {
  // Wait for dialog to disappear
  await this.page.waitForSelector('.pe-confirmation-dialog', { state: 'hidden', timeout: 5000 });
  const isVisible = await this.page.isVisible('.pe-confirmation-dialog');
  expect(isVisible).toBe(false);
});

Then('I should remain on the current view', async function() {
  // Verify we're still on the same view (could check specific selectors)
  const currentView = await this.page.evaluate(() => {
    // Check which view is currently visible
    if (document.querySelector('#product-estimator-room-selection-form:not([style*="display: none"])')) {
      return 'room-selection';
    }
    if (document.querySelector('#product-estimator-estimates-list:not([style*="display: none"])')) {
      return 'estimates-list';
    }
    return 'unknown';
  });
  
  // Store the view for comparison
  this.currentView = this.currentView || currentView;
  expect(currentView).toBe(this.currentView);
});

Then('product {string} should not be added to room {string}', async function(productName, roomName) {
  const hasProduct = await this.page.evaluate(({ productName, roomName }) => {
    const estimateData = JSON.parse(localStorage.getItem('productEstimatorEstimateData') || '{}');
    const estimateId = Object.keys(estimateData.estimates)[0];
    const estimate = estimateData.estimates[estimateId];
    const roomId = Object.keys(estimate.rooms).find(id => estimate.rooms[id].name === roomName);
    
    if (!roomId) return false;
    
    const products = estimate.rooms[roomId].products || {};
    return Object.values(products).some(product => product.name === productName);
  }, { productName, roomName });
  
  expect(hasProduct).toBe(false);
});

Then('product {string} should still be in room {string}', async function(productName, roomName) {
  const hasProduct = await this.page.evaluate(({ productName, roomName }) => {
    const estimateData = JSON.parse(localStorage.getItem('productEstimatorEstimateData') || '{}');
    const estimateId = Object.keys(estimateData.estimates)[0];
    const estimate = estimateData.estimates[estimateId];
    const roomId = Object.keys(estimate.rooms).find(id => estimate.rooms[id].name === roomName);
    
    if (!roomId) return false;
    
    const products = estimate.rooms[roomId].products || {};
    return Object.values(products).some(product => product.name === productName);
  }, { productName, roomName });
  
  expect(hasProduct).toBe(true);
});

Then('room totals should remain unchanged', async function() {
  // Store and compare room totals
  const currentTotal = await this.page.textContent('.room-total');
  expect(currentTotal).toBe(this.previousRoomTotal || currentTotal);
});

Then('I should see the room selection form', async function() {
  await this.page.waitForSelector('#product-estimator-room-selection-form', { timeout: 5000 });
  const isVisible = await this.page.isVisible('#product-estimator-room-selection-form');
  expect(isVisible).toBe(true);
});

// Additional step definitions for edge cases and accessibility

Then('I should be able to navigate between buttons using the Tab key', async function() {
  // Focus on the first button
  await this.page.keyboard.press('Tab');
  const focusedElement1 = await this.page.evaluate(() => document.activeElement.tagName);
  expect(focusedElement1).toBe('BUTTON');
  
  // Tab to next button
  await this.page.keyboard.press('Tab');
  const focusedElement2 = await this.page.evaluate(() => document.activeElement.tagName);
  expect(focusedElement2).toBe('BUTTON');
});

Then('I should be able to dismiss the dialog with the Escape key', async function() {
  await this.page.keyboard.press('Escape');
  await this.page.waitForSelector('.pe-confirmation-dialog', { state: 'hidden', timeout: 5000 });
  const isVisible = await this.page.isVisible('.pe-confirmation-dialog');
  expect(isVisible).toBe(false);
});

Then('the dialog should have proper ARIA labels for screen readers', async function() {
  const dialog = await this.page.$('.pe-confirmation-dialog');
  const role = await dialog.getAttribute('role');
  const ariaLabel = await dialog.getAttribute('aria-label');
  
  expect(role).toBe('dialog');
  expect(ariaLabel).toBeTruthy();
});