# Product Estimator E2E Tests

This directory contains end-to-end (E2E) tests for the Product Estimator plugin using Playwright and Cucumber.

## Directory Structure

```
tests/
├─ e2e/                          # End-to-end tests
│  ├─ features/                  # Gherkin feature files
│  │  ├─ frontend/               # Frontend-specific features
│  │  └─ admin/                  # Admin-specific features
│  ├─ step-definitions/          # Step implementation files
│  │  ├─ frontend/               # Frontend-specific steps
│  │  ├─ admin/                  # Admin-specific steps
│  │  └─ common/                 # Shared step definitions
│  ├─ page-objects/              # Page Object Model classes
│  │  ├─ frontend/               # Frontend-specific page objects
│  │  ├─ admin/                  # Admin-specific page objects
│  │  └─ common/                 # Shared page components
│  ├─ fixtures/                  # Test data and fixtures
│  └─ support/                   # Support files (hooks, world, helpers)
├─ playwright.config.js          # Playwright configuration
├─ cucumber.js                   # Cucumber configuration
├─ package.json                  # Test-specific dependencies
├─ .env                          # Environment variables
└─ test-results/                 # Test artifacts and debugging tools
```

## Setup

Before running the tests, make sure you have the necessary dependencies installed:

```bash
# Install npm dependencies
npm install

# Install Playwright browsers
npx playwright install
```

## Running Tests

### Single Test Scenario (Recommended for debugging)

This runs just the first basic test scenario for creating an estimate:

```bash
# Run in headless mode
npm run test:create-estimate

# Run in headed mode with slower execution for visual debugging
npm run test:debug
```

### All Frontend Tests

Run all the frontend test scenarios:

```bash
npm run test:frontend
```

### All Admin Tests

Run all the admin test scenarios:

```bash
npm run test:admin
```

### All Tests

Run all tests (both frontend and admin):

```bash
npm test
```

### Parallel Testing

Run tests in parallel for faster execution:

```bash
npm run test:parallel
```

## Test Results and Debugging

Test results are stored in the following locations:

- **Screenshots**: `test-results/screenshots/`
- **Videos**: `test-results/videos/` (if video recording is enabled)
- **HTML Reports**: `test-reports/`
- **Debug Helper**: `test-results/element-finder.html` (a tool to help find elements in HTML)

### Debugging Helper Tool

For element selector debugging, the test suite automatically creates a debugging helper tool. After running any test, open `test-results/element-finder.html` in your browser. You can paste HTML snippets there to help find selectors for elements containing "estimator" or "estimate".

## Configuration

The tests can be configured using environment variables in the `.env` file:

- `BASE_URL`: The base URL of the WordPress site (default: http://localhost/wp)
- `HEADLESS`: Set to "false" to show browser UI during tests (default: true)
- `SLOWMO`: Slow down Playwright operations by specified milliseconds (default: 0)
- `BROWSER`: Choose browser to run tests (chromium, firefox, webkit) (default: chromium)
- `RECORD_VIDEO`: Set to "true" to record videos of test runs (default: false)
- `WP_ADMIN_USERNAME` and `WP_ADMIN_PASSWORD`: For admin tests

Example usage with inline environment variables:

```bash
BASE_URL=https://example.com HEADLESS=false SLOWMO=100 npm run test:frontend
```

## Adding New Tests

### Frontend Features

1. Create a new `.feature` file in `e2e/features/frontend/`
2. Implement step definitions in `e2e/step-definitions/frontend/`
3. Create page objects in `e2e/page-objects/frontend/` as needed

### Admin Features

1. Create a new `.feature` file in `e2e/features/admin/`
2. Implement step definitions in `e2e/step-definitions/admin/`
3. Create page objects in `e2e/page-objects/admin/` as needed

## Troubleshooting

If you encounter issues with the tests:

1. **Element not found**: Check if selectors have changed in the HTML. Run the tests in headed mode with `npm run test:debug` to see what's happening.

2. **Timeouts**: You may need to increase timeouts for slow connections or complex page loads. Check `cucumber.js` and the step definitions for timeout settings.

3. **Check screenshots**: Look at the failure screenshots in `test-results/screenshots/` to see what the page looked like when the test failed.

4. **Browser installation issues**: If you get errors about browser binaries, try running `npx playwright install` again.

5. **Clear test results**: Sometimes clearing old test results can help: `npm run test:clear-results`

## HTML Reports

To generate a detailed HTML report after running tests:

```bash
npm run test:report
```

This will create an HTML report in `test-reports/` with detailed information about test runs, failures, and screenshots.