# Product Estimator E2E Tests

This directory contains end-to-end tests for the Product Estimator plugin using Playwright with Cucumber.

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
└─ .env.example                  # Environment variables template
```

## Installation

1. First, ensure you have Node.js and npm installed
2. Install the test dependencies:

```bash
# From the plugin root directory
npm run test:setup
```

## Configuration

1. Copy the `.env.example` file to `.env`:

```bash
cp tests/.env.example tests/.env
```

2. Update the `.env` file with your specific configuration:
   - `BASE_URL`: Your WordPress installation URL
   - `BROWSER`: The browser to use for testing (chromium, firefox, webkit)
   - `HEADLESS`: Whether to run tests in headless mode (true/false)
   - `WP_ADMIN_USERNAME` and `WP_ADMIN_PASSWORD`: For admin tests

## Running Tests

### From the plugin root directory:

```bash
# Run all tests
npm run test:e2e

# Run only frontend tests
npm run test:frontend

# Run only admin tests
npm run test:admin
```

### From the tests directory:

```bash
# Run all tests
npm test

# Run frontend tests
npm run test:frontend

# Run admin tests
npm run test:admin

# Run tests in parallel
npm run test:parallel

# Generate HTML report
npm run test:report
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

## Test Reports

Test reports are generated in the `test-reports` directory:
- Cucumber JSON report: `cucumber-report.json`
- HTML report: `cucumber-html-report.html`

To generate an HTML report from the JSON data:

```bash
npm run test:report
```

## Debugging Tests

1. Set `HEADLESS=false` in your `.env` file to see the browser UI during test execution
2. Set `SLOWMO=100` to slow down test execution by 100ms per action
3. Set `DEBUG=pw:api` for Playwright API debugging output