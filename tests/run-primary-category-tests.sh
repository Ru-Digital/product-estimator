#!/bin/bash

# Run primary category conflict tests

echo "Running Primary Category Conflict E2E Tests..."
echo "==========================================="

# Ensure we're in the tests directory
cd "$(dirname "$0")"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing test dependencies..."
    npm install
fi

# Run the specific feature file
echo "Running primary category conflict tests..."
npx cucumber-js e2e/features/frontend/primary-category-conflict.feature \
  --require e2e/step-definitions/frontend/primary-category-conflict.steps.js \
  --require e2e/support/*.js \
  --format html:test-reports/primary-category-report.html \
  --format json:test-reports/primary-category-report.json

# Check test results
if [ $? -eq 0 ]; then
    echo "✅ All tests passed!"
    echo "Test report generated: test-reports/primary-category-report.html"
else
    echo "❌ Some tests failed."
    echo "Check the test report for details: test-reports/primary-category-report.html"
fi

# Open the report in browser (macOS specific)
if [ "$(uname)" = "Darwin" ]; then
    open test-reports/primary-category-report.html
fi