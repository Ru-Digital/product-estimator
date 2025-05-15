const { Before, After, BeforeAll, AfterAll, Status } = require('@cucumber/cucumber');
const fs = require('fs');
const path = require('path');

/**
 * Initialize browser before each scenario
 */
Before(async function(scenario) {
  this.testName = scenario.pickle.name;
  await this.initBrowser();
});

/**
 * Cleanup after each scenario, take screenshot on failure
 */
After(async function(scenario) {
  // Take screenshot if scenario failed
  if (scenario.result.status === Status.FAILED) {
    const screenshotDir = path.join(process.cwd(), 'test-results/screenshots');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }
    
    // Create a name for the screenshot based on the scenario
    const screenshotName = this.testName
      .replace(/[^\w\s]/gi, '')  // Remove special characters
      .replace(/\s+/g, '-')      // Replace spaces with hyphens
      .toLowerCase();
    
    const screenshotPath = path.join(
      screenshotDir, 
      `${screenshotName}-failure-${new Date().toISOString().replace(/[.:]/g, '-')}.png`
    );
    
    // Take the screenshot
    if (this.page) {
      await this.page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`Screenshot saved to: ${screenshotPath}`);
      
      // Attach screenshot to report
      const screenshot = fs.readFileSync(screenshotPath);
      this.attach(screenshot, 'image/png');
    }
  }
  
  // Close the browser
  await this.closeBrowser();
});

/**
 * Create test results directories before all tests
 */
BeforeAll(async function() {
  const dirs = [
    'test-results',
    'test-results/screenshots',
    'test-results/videos',
    'test-reports'
  ];
  
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
});

/**
 * Clean up after all tests complete
 */
AfterAll(async function() {
  // Any cleanup after all tests run
});