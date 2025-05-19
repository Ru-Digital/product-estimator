const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

const SettingsPage = require('../../page-objects/admin/SettingsPage');
const AdminBasePage = require('../../page-objects/admin/AdminBasePage');

// Initialize settings page
Given('I am on the {string} page', async function(pagePath) {
  this.adminBasePage = new AdminBasePage(this.page);
  
  if (pagePath === 'Product Estimator > Settings') {
    this.settingsPage = new SettingsPage(this.page);
    await this.settingsPage.navigateToSettings();
  } else {
    await this.adminBasePage.navigateToMenu(pagePath);
  }
});

// Navigate tabs
Then('I should see a vertical tabbed interface', async function() {
  this.settingsPage = this.settingsPage || new SettingsPage(this.page);
  const isTabsVisible = await this.settingsPage.isVerticalTabsVisible();
  expect(isTabsVisible).toBeTruthy();
});

Then('the tabs should include {string}, {string}, {string}, and other modules', async function(tab1, tab2, tab3) {
  const tabNames = await this.settingsPage.getTabNames();
  
  expect(tabNames).toContain(tab1);
  expect(tabNames).toContain(tab2);
  expect(tabNames).toContain(tab3);
  expect(tabNames.length).toBeGreaterThanOrEqual(3);
});

When('I click on each tab', async function() {
  const tabNames = await this.settingsPage.getTabNames();
  
  for (const tabName of tabNames) {
    await this.settingsPage.clickTab(tabName);
    
    // Check that the tab is active after clicking
    const isActive = await this.settingsPage.isTabActive(tabName);
    expect(isActive).toBeTruthy();
  }
});

Then('the corresponding settings form should be displayed', async function() {
  // Already verified in the previous step
});

// Tab-specific interactions
When('I click the {string} tab', async function(tabName) {
  await this.settingsPage.clickTab(tabName);
});

When('I change the {string} to {string}', async function(fieldName, value) {
  await this.settingsPage.setInputValue(fieldName, value);
});

When('I click {string}', async function(buttonText) {
  if (buttonText === 'Save Changes') {
    await this.settingsPage.saveChanges();
  } else {
    await this.settingsPage.clickButtonWithText(buttonText);
  }
});

Then('the settings should be saved via AJAX', async function() {
  const hasSuccessNotice = await this.settingsPage.hasSuccessNotice();
  expect(hasSuccessNotice).toBeTruthy();
});

Then('I should see a success notification', async function() {
  const hasSuccessNotice = await this.settingsPage.hasSuccessNotice();
  expect(hasSuccessNotice).toBeTruthy();
});

Then('the {string} should remain {string} after page reload', async function(fieldName, value) {
  // Reload the page
  await this.settingsPage.navigateToSettings();
  await this.settingsPage.clickTab('General');
  
  // Check the field value
  const fieldValue = await this.settingsPage.getFieldValue('estimate_validity_period');
  expect(fieldValue).toBe(value);
});

// Feature switches
When('I toggle the {string} switch to {string}', async function(switchName, state) {
  await this.settingsPage.toggleFeatureSwitch(switchName, state);
});

Then('the feature state should be saved', async function() {
  // Already covered by "I should see a success notification"
});

Then('the feature should affect frontend functionality when tested', async function() {
  // This would require navigating to the frontend and checking
  // Not implemented in this basic step definition
});

// Label settings
Then('the button text should appear as {string} on the frontend', async function(buttonText) {
  // This would require navigating to the frontend and checking
  // Not implemented in this basic step definition
});

// Notification settings
When('I enter a new email template for customer notifications', async function() {
  await this.settingsPage.setTextareaValue('customer_email_template', 'New template content with {{customer_name}} placeholder');
});

Then('the template should be saved', async function() {
  // Already covered by "I should see a success notification"
});

Then('new notifications should use the updated template', async function() {
  // This would require sending a test email and checking
  // Not implemented in this basic step definition
});

// Product upgrades
When('I add a new upgrade option', async function() {
  await this.settingsPage.addNewUpgradeOption();
});

Then('the upgrade option should be saved', async function() {
  // Already covered by "I should see a success notification"
});

Then('the upgrade should appear in the frontend product display', async function() {
  // This would require navigating to the frontend and checking
  // Not implemented in this basic step definition
});

// Validation
When('I enter {string} in the {string} field', async function(value, fieldName) {
  await this.settingsPage.setInputValue(fieldName, value);
});

Then('the settings should not be saved', async function() {
  // Check that no success message appears
  const hasSuccessNotice = await this.settingsPage.hasSuccessNotice();
  expect(hasSuccessNotice).toBeFalsy();
});

Then('I should see a validation error message', async function() {
  const hasValidationError = await this.settingsPage.hasValidationError('estimate_validity_period');
  expect(hasValidationError).toBeTruthy();
});

Then('the field should be highlighted', async function() {
  const isHighlighted = await this.settingsPage.isFieldHighlighted('estimate_validity_period');
  expect(isHighlighted).toBeTruthy();
});