const reporter = require('cucumber-html-reporter');
const fs = require('fs');
const path = require('path');

// Check if the cucumber report exists
const cucumberReportPath = path.join(__dirname, 'test-reports/cucumber-report.json');
if (!fs.existsSync(cucumberReportPath)) {
  console.error('No Cucumber report found. Please run tests first.');
  process.exit(1);
}

// Options for the reporter
const options = {
  theme: 'bootstrap',
  jsonFile: cucumberReportPath,
  output: path.join(__dirname, 'test-reports/cucumber-html-report.html'),
  reportSuiteAsScenarios: true,
  scenarioTimestamp: true,
  launchReport: true,
  metadata: {
    'App Version': 'Product Estimator Plugin',
    'Test Environment': process.env.NODE_ENV || 'development',
    Browser: process.env.BROWSER || 'Chrome',
    Platform: process.platform
  }
};

// Generate the report
reporter.generate(options);