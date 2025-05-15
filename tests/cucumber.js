module.exports = {
  default: {
    require: [
      'e2e/step-definitions/**/*.js',
      'e2e/support/**/*.js'
    ],
    paths: [
      'e2e/features/**/*.feature'
    ],
    format: [
      'html:test-reports/cucumber-report.html',
      'json:test-reports/cucumber-report.json'
    ],
    formatOptions: {
      snippetInterface: 'async-await'
    },
    timeout: 120000 // 120 seconds timeout
  },
  frontend: {
    require: [
      'e2e/step-definitions/common/**/*.js',
      'e2e/step-definitions/frontend/**/*.js',
      'e2e/support/**/*.js'
    ],
    paths: [
      'e2e/features/frontend/**/*.feature'
    ],
    format: [
      'html:test-reports/frontend-report.html',
      'json:test-reports/frontend-report.json'
    ],
    formatOptions: {
      snippetInterface: 'async-await'
    },
    timeout: 120000 // 120 seconds timeout
  },
  admin: {
    require: [
      'e2e/step-definitions/common/**/*.js',
      'e2e/step-definitions/admin/**/*.js',
      'e2e/support/**/*.js'
    ],
    paths: [
      'e2e/features/admin/**/*.feature'
    ],
    format: [
      'html:test-reports/admin-report.html',
      'json:test-reports/admin-report.json'
    ],
    formatOptions: {
      snippetInterface: 'async-await'
    },
    timeout: 120000 // 120 seconds timeout
  }
};