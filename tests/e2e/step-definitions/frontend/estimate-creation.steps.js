const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

const EstimateCreationPage = require('../../page-objects/frontend/EstimateCreationPage');

// Initialize the page object
Given('no estimates exist in local storage or the PHP session', async function() {
  this.estimateCreationPage = new EstimateCreationPage(this.page);
  
  // Clear any existing estimates from local storage
  await this.goto('/');
  await this.estimateCreationPage.clearLocalStorageEstimates();
  
  // You might need additional steps to clear PHP session via API or DB
});

When('I open the site header and click the {string} link', async function(linkText) {
  this.estimateCreationPage = new EstimateCreationPage(this.page);
  
  await this.goto('/');
  await this.estimateCreationPage.clickHeaderEstimateLink();
  await this.estimateCreationPage.waitForLoadingComplete();
});

When('I open the {string} link', async function(linkText) {
  this.estimateCreationPage = new EstimateCreationPage(this.page);
  
  await this.goto('/');
  await this.estimateCreationPage.clickHeaderEstimateLink();
  await this.estimateCreationPage.waitForLoadingComplete();
});

When('I enter {string} as the estimate name', async function(name) {
  await this.estimateCreationPage.fillNewEstimateForm(name, null);
});

When('I enter {string} as the postcode', async function(postcode) {
  await this.estimateCreationPage.fillNewEstimateForm(null, postcode);
});

When('I leave the postcode field blank', async function() {
  // Don't need to do anything as the field is blank by default
});

When('I press the {string} button', async function(buttonText) {
  if (buttonText === 'Create Estimate') {
    await this.estimateCreationPage.clickCreateEstimate();
  } else if (buttonText === 'New Estimate') {
    await this.estimateCreationPage.clickNewEstimateButton();
  } else {
    throw new Error(`Button "${buttonText}" not implemented in step definitions`);
  }
});

When('I press {string}', async function(buttonText) {
  if (buttonText === 'Create Estimate') {
    await this.estimateCreationPage.clickCreateEstimate();
  } else {
    throw new Error(`Button "${buttonText}" not implemented in step definitions`);
  }
});

Then('an estimate named {string} should be stored in local storage', async function(name) {
  // Check if the estimate exists in the UI
  const exists = await this.estimateCreationPage.estimateExists(name);
  expect(exists).toBeTruthy();
  
  // You could also directly check local storage if needed
  const estimateExists = await this.page.evaluate((estimateName) => {
    const keys = Object.keys(localStorage);
    const estimateKeys = keys.filter(key => key.startsWith('estimate_'));
    
    for (const key of estimateKeys) {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        if (data && data.name === estimateName) {
          return true;
        }
      } catch (e) {
        // Ignore parse errors
      }
    }
    return false;
  }, name);
  
  expect(estimateExists).toBeTruthy();
});

Then('the {string} form should be displayed', async function(formName) {
  if (formName === 'Add Room') {
    const isVisible = await this.estimateCreationPage.isAddRoomFormDisplayed();
    expect(isVisible).toBeTruthy();
  } else {
    throw new Error(`Form "${formName}" not implemented in step definitions`);
  }
});

Then('a validation message {string} should appear', async function(message) {
  const errorText = await this.estimateCreationPage.getValidationError('postcode');
  expect(errorText).toContain(message);
});

Then('no estimate should be stored in local storage', async function() {
  const estimateCount = await this.page.evaluate(() => {
    return Object.keys(localStorage)
      .filter(key => key.startsWith('estimate_'))
      .length;
  });
  
  expect(estimateCount).toBe(0);
});

Given('an estimate named {string} with postcode {string} is stored and visible in the Estimates list', async function(name, postcode) {
  this.estimateCreationPage = new EstimateCreationPage(this.page);
  
  // First clear existing estimates
  await this.goto('/');
  await this.estimateCreationPage.clearLocalStorageEstimates();
  
  // Open the estimate modal
  await this.estimateCreationPage.clickHeaderEstimateLink();
  
  // Create a new estimate
  await this.estimateCreationPage.createNewEstimate(name, postcode);
  
  // Verify it was created
  const exists = await this.estimateCreationPage.estimateExists(name);
  expect(exists).toBeTruthy();
});

Then('the Estimates list is displayed', async function() {
  const isVisible = await this.page.locator(this.estimateCreationPage.estimatesList).isVisible();
  expect(isVisible).toBeTruthy();
});

Then('an estimate card titled {string} should appear in the Estimates list', async function(name) {
  const exists = await this.estimateCreationPage.estimateExists(name);
  expect(exists).toBeTruthy();
});

Then('the existing estimate {string} card should still be present', async function(name) {
  const exists = await this.estimateCreationPage.estimateExists(name);
  expect(exists).toBeTruthy();
});

Then('the UI should indicate that {string} is the currently selected estimate', async function(name) {
  const isSelected = await this.estimateCreationPage.isEstimateSelected(name);
  expect(isSelected).toBeTruthy();
});

Given('the two estimates {string} and {string} exist', async function(name1, name2) {
  this.estimateCreationPage = new EstimateCreationPage(this.page);
  
  // First clear existing estimates
  await this.goto('/');
  await this.estimateCreationPage.clearLocalStorageEstimates();
  
  // Open the estimate modal
  await this.estimateCreationPage.clickHeaderEstimateLink();
  
  // Create the first estimate
  await this.estimateCreationPage.createNewEstimate(name1, '4000');
  
  // Create the second estimate
  await this.estimateCreationPage.clickNewEstimateButton();
  await this.estimateCreationPage.createNewEstimate(name2, '4000');
  
  // Verify they were created
  const exists1 = await this.estimateCreationPage.estimateExists(name1);
  const exists2 = await this.estimateCreationPage.estimateExists(name2);
  expect(exists1).toBeTruthy();
  expect(exists2).toBeTruthy();
});

When('I open the estimate selector dropdown', async function() {
  await this.estimateCreationPage.openEstimateSelector();
});

Then('the dropdown should list exactly two options: {string} and {string}', async function(name1, name2) {
  const options = await this.estimateCreationPage.getEstimateSelectorOptions();
  
  // Filter out any empty options
  const filteredOptions = options.filter(option => option.trim().length > 0);
  
  expect(filteredOptions.length).toBe(2);
  expect(filteredOptions).toContain(name1);
  expect(filteredOptions).toContain(name2);
});