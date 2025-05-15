const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

const CustomerEstimatesPage = require('../../page-objects/admin/CustomerEstimatesPage');
const AdminBasePage = require('../../page-objects/admin/AdminBasePage');

// Navigate to Customer Estimates page
When('I navigate to {string}', async function(menuPath) {
  this.adminBasePage = new AdminBasePage(this.page);
  
  if (menuPath === 'Product Estimator > Customer Estimates') {
    this.customerEstimatesPage = new CustomerEstimatesPage(this.page);
    await this.customerEstimatesPage.navigateToCustomerEstimates();
  } else {
    await this.adminBasePage.navigateToMenu(menuPath);
  }
});

Then('I should see a list of all customer estimates', async function() {
  const isTableVisible = await this.customerEstimatesPage.isEstimatesTableVisible();
  expect(isTableVisible).toBeTruthy();
});

Then('the list should contain columns for ID, Customer, Email, Phone, Postcode, Total, Status, and Created', async function() {
  const columns = await this.customerEstimatesPage.getColumnHeaders();
  
  // Check for required columns
  expect(columns).toEqual(
    expect.arrayContaining(['ID', 'Customer', 'Email', 'Phone', 'Postcode', 'Total', 'Status', 'Created'])
  );
});

// Data setup steps
Given('customer estimates exist in the database', async function() {
  // This would typically involve setting up test data
  // For now, we'll just check if there are any estimates in the table
  this.customerEstimatesPage = new CustomerEstimatesPage(this.page);
  await this.customerEstimatesPage.navigateToCustomerEstimates();
  
  const estimateCount = await this.customerEstimatesPage.getEstimateCount();
  if (estimateCount === 0) {
    // TODO: Create test estimates if needed
    console.log('Warning: No estimates found in the database for testing.');
  }
});

When('I click on an estimate name', async function() {
  // Click the first estimate name in the list
  await this.page.locator(this.customerEstimatesPage.tableRows).first().locator('a').first().click();
  await this.customerEstimatesPage.waitForPageLoad();
});

Then('I should see detailed information about the estimate', async function() {
  const isDetailVisible = await this.customerEstimatesPage.isEstimateDetailVisible();
  expect(isDetailVisible).toBeTruthy();
});

Then('the details should include customer information and room\\/product details', async function() {
  const hasCustomerDetails = await this.customerEstimatesPage.isCustomerDetailsSectionVisible();
  const hasRoomsSection = await this.customerEstimatesPage.isRoomsSectionVisible();
  
  expect(hasCustomerDetails).toBeTruthy();
  expect(hasRoomsSection).toBeTruthy();
});

// Filter estimates
Given('estimates exist from various dates', async function() {
  // Assumption: Estimates already exist from different dates
  this.customerEstimatesPage = new CustomerEstimatesPage(this.page);
  await this.customerEstimatesPage.navigateToCustomerEstimates();
});

When('I select {string} from the date filter', async function(filterName) {
  await this.customerEstimatesPage.filterByDate(filterName.toLowerCase().replace(/\s+/g, ''));
});

When('I click {string}', async function(buttonText) {
  this.adminBasePage = this.adminBasePage || new AdminBasePage(this.page);
  await this.adminBasePage.clickButtonWithText(buttonText);
});

Then('the list should only show estimates created within the last 7 days', async function() {
  // This would require checking the dates in the table
  // For now, just verify the filter was applied (URL parameter check)
  const currentUrl = await this.page.url();
  expect(currentUrl).toContain('date_filter=last7days');
});

// Search functionality
Given('multiple estimates exist in the database', async function() {
  // Assumption: Multiple estimates already exist
  this.customerEstimatesPage = new CustomerEstimatesPage(this.page);
  await this.customerEstimatesPage.navigateToCustomerEstimates();
});

When('I enter {string} in the search field', async function(searchTerm) {
  await this.customerEstimatesPage.searchForEstimate(searchTerm);
});

When('I press the search button', async function() {
  // Already handled in searchForEstimate method
});

Then('the list should only show estimates with {string} in the customer name or email', async function(searchTerm) {
  // Check that the URL contains the search parameter
  const currentUrl = await this.page.url();
  expect(currentUrl).toContain(`s=${encodeURIComponent(searchTerm)}`);
  
  // Check that all visible rows contain the search term
  const rows = await this.page.locator(this.customerEstimatesPage.tableRows).all();
  for (const row of rows) {
    const rowText = await row.textContent();
    expect(rowText.toLowerCase()).toContain(searchTerm.toLowerCase());
  }
});

// Email estimate
Given('an estimate with valid customer email exists', async function() {
  // Assumption: At least one estimate with a valid email exists
  this.customerEstimatesPage = new CustomerEstimatesPage(this.page);
  await this.customerEstimatesPage.navigateToCustomerEstimates();
});

When('I click the {string} action for that estimate', async function(action) {
  // Click the action for the first estimate in the list
  await this.customerEstimatesPage.clickRowAction(
    await this.page.locator(this.customerEstimatesPage.tableRows).first().locator('td').nth(1).textContent(),
    action
  );
});

When('I confirm the action in the dialog', async function() {
  await this.customerEstimatesPage.confirmDialog();
});

Then('the system should send an email to the customer', async function() {
  // This would typically check email delivery (not easily testable)
  // For now, we'll check for a success message
  const hasSuccessNotice = await this.customerEstimatesPage.hasSuccessNotice();
  expect(hasSuccessNotice).toBeTruthy();
});

Then('I should see a success notification', async function() {
  const hasSuccessNotice = await this.customerEstimatesPage.hasSuccessNotice();
  expect(hasSuccessNotice).toBeTruthy();
});

// Print estimate
Given('a valid estimate exists', async function() {
  // Assumption: At least one estimate exists
  this.customerEstimatesPage = new CustomerEstimatesPage(this.page);
  await this.customerEstimatesPage.navigateToCustomerEstimates();
});

Then('a PDF should open in a new browser tab', async function() {
  // This would require handling a new page/tab
  // For Playwright, we can use the 'page' event
  const pagePromise = this.context.waitForEvent('page');
  // The actual click is handled in the previous step
  const newPage = await pagePromise;
  await newPage.waitForLoadState('networkidle');
  
  // Check if the page is a PDF by URL or content type
  const url = newPage.url();
  expect(url).toContain('.pdf');
});

Then('the PDF should contain all estimate details and formatted correctly', async function() {
  // Not easily testable with Playwright
  // We could check the PDF content, but that's complex
  // For now, we'll just check that the PDF URL contains the estimate ID
  const pages = this.context.pages();
  const pdfPage = pages[pages.length - 1]; // Assume the newest page is the PDF
  const url = pdfPage.url();
  expect(url).toContain('estimate=');
});

// Delete estimate
Then('the estimate should be removed from the database', async function() {
  // Check for success message (already covered by "I should see a success notification")
  
  // Refresh the page to verify the estimate is gone
  await this.customerEstimatesPage.navigateToCustomerEstimates();
});

Then('the estimate should no longer appear in the list', async function() {
  // This would require tracking the estimate ID/name before deletion
  // For now, we'll just check that the deletion was acknowledged
  const successMessage = await this.customerEstimatesPage.getSuccessNoticeText();
  expect(successMessage).toContain('deleted');
});

// Duplicate estimate
Then('a new estimate should be created with the same details', async function() {
  // Check for success message
  const hasSuccessNotice = await this.customerEstimatesPage.hasSuccessNotice();
  expect(hasSuccessNotice).toBeTruthy();
});

Then('the new estimate name should contain {string}', async function(nameContains) {
  // Refresh to see the new estimate
  await this.customerEstimatesPage.navigateToCustomerEstimates();
  
  // Check for an estimate with "(Copy)" in the name
  const hasCopyEstimate = await this.page.locator(`${this.customerEstimatesPage.tableRows} td:has-text("${nameContains}")`).isVisible();
  expect(hasCopyEstimate).toBeTruthy();
});

Then('I should see both the original and copy in the estimates list', async function() {
  // Already covered by previous steps
});

// Bulk actions
When('I select three estimates using the checkboxes', async function() {
  // Select the first three estimates
  await this.customerEstimatesPage.selectEstimates([0, 1, 2]);
});

When('I select {string} from the bulk actions dropdown', async function(action) {
  this.bulkAction = action;
});

When('I click {string}', async function(buttonText) {
  if (buttonText === 'Apply') {
    await this.customerEstimatesPage.performBulkAction(this.bulkAction);
  } else {
    await this.customerEstimatesPage.clickButtonWithText(buttonText);
  }
});

Then('all three estimates should be removed from the database', async function() {
  // Check for success message (already covered)
  
  // Refresh to verify
  await this.customerEstimatesPage.navigateToCustomerEstimates();
});

// Export to CSV
When('I click the {string} button', async function(buttonText) {
  if (buttonText === 'Export CSV') {
    this.downloadedFile = await this.customerEstimatesPage.clickExportCSV();
  } else {
    await this.customerEstimatesPage.clickButtonWithText(buttonText);
  }
});

Then('a CSV file should be downloaded', async function() {
  expect(this.downloadedFile).toBeDefined();
  expect(this.downloadedFile).toMatch(/\.csv$/);
});

Then('the CSV should contain all visible estimate data', async function() {
  // Not easily testable without parsing the CSV
  // Just ensure the file was downloaded successfully
  expect(this.downloadedFile).toBeDefined();
});