const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

const LoginPage = require('../../page-objects/admin/LoginPage');
const AdminBasePage = require('../../page-objects/admin/AdminBasePage');

// Initialize the page objects
Given('I am on the WordPress login page', async function() {
  this.loginPage = new LoginPage(this.page);
  await this.loginPage.navigateToLogin();
  
  // Verify we're on the login page
  const loginFormVisible = await this.page.locator('#loginform').isVisible();
  expect(loginFormVisible).toBeTruthy();
});

When('I enter valid admin credentials', async function() {
  // Use credentials from the environment variables
  const username = process.env.WP_ADMIN_USERNAME || 'admin';
  const password = process.env.WP_ADMIN_PASSWORD || 'password';
  
  await this.loginPage.login(username, password);
});

When('I press the login {string} button', async function(buttonText) {
  // This step is already handled in the login method above
  // The step is here for readability in the feature file
});

Then('I should be redirected to the WordPress dashboard', async function() {
  // Check if we're logged in by looking for admin elements
  const isLoggedIn = await this.loginPage.isLoggedIn();
  expect(isLoggedIn).toBeTruthy();
  
  // Check if we're on the dashboard
  const dashboardTitle = await this.page.locator('h1:has-text("Dashboard")').isVisible();
  expect(dashboardTitle).toBeTruthy();
});

Then('the admin menu should contain {string}', async function(menuText) {
  this.adminBasePage = new AdminBasePage(this.page);
  const menuContainsText = await this.adminBasePage.adminMenuContains(menuText);
  expect(menuContainsText).toBeTruthy();
});

Given('I am logged in as a user with {string} role', async function(role) {
  this.loginPage = new LoginPage(this.page);
  await this.loginPage.loginAsRole(role);
});

When('I attempt to access the Product Estimator admin page', async function() {
  this.adminBasePage = new AdminBasePage(this.page);
  await this.adminBasePage.navigateTo('admin.php?page=product-estimator');
});

Then('I should see an {string} message', async function(messageType) {
  // Check for permission error message
  const permissionErrorVisible = await this.page.locator('.notice-error, .error').isVisible();
  expect(permissionErrorVisible).toBeTruthy();
  
  // Check if the message contains the expected text
  const errorText = await this.page.locator('.notice-error, .error').textContent();
  expect(errorText.toLowerCase()).toContain('permission');
});

Then('I should not be able to view the settings page', async function() {
  this.adminBasePage = new AdminBasePage(this.page);
  await this.adminBasePage.navigateTo('admin.php?page=product-estimator-settings');
  
  // Check for permission error message
  const permissionErrorVisible = await this.page.locator('.notice-error, .error').isVisible();
  expect(permissionErrorVisible).toBeTruthy();
});

// Reusable login step
Given('I am logged in as an administrator', async function() {
  this.loginPage = new LoginPage(this.page);
  await this.loginPage.loginAsAdmin();
});