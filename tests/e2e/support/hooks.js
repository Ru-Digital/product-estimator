const { Before, After, BeforeAll, AfterAll, Status } = require('@cucumber/cucumber');
const fs = require('fs');
const path = require('path');

/**
 * Initialize browser before each scenario
 */
Before({ timeout: 120000 }, async function(scenario) {
  try {
    this.testName = scenario.pickle.name;
    console.log(`======== Starting scenario: ${this.testName} ========`);
    await this.initBrowser();
    console.log(`Browser initialized for: ${this.testName}`);
  } catch (error) {
    console.error(`Failed to set up scenario "${this.testName}": ${error.message}`);
    throw error;
  }
});

/**
 * Cleanup after each scenario, take screenshot on failure
 */
After({ timeout: 120000 }, async function(scenario) {
  console.log(`======== Ending scenario: ${this.testName} (Status: ${scenario.result.status}) ========`);
  
  // Take screenshot if scenario failed
  if (scenario.result.status === Status.FAILED) {
    console.log(`Scenario "${this.testName}" failed, capturing screenshots and logs`);
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
    
    const timestamp = new Date().toISOString().replace(/[.:]/g, '-');
    const screenshotPath = path.join(
      screenshotDir, 
      `${screenshotName}-failure-${timestamp}.png`
    );
    
    // Take the screenshot
    if (this.page) {
      try {
        // First try to log where the error appeared
        console.log(`Current URL: ${this.page.url()}`);
        
        // Capture the current state of the page
        await this.page.screenshot({ path: screenshotPath, fullPage: true, timeout: 60000 });
        console.log(`Screenshot saved to: ${screenshotPath}`);
        
        // Attach screenshot to report
        const screenshot = fs.readFileSync(screenshotPath);
        this.attach(screenshot, 'image/png');
        
        // Also capture page HTML for debugging
        const htmlPath = path.join(screenshotDir, `${screenshotName}-html-${timestamp}.html`);
        const html = await this.page.content();
        fs.writeFileSync(htmlPath, html);
        console.log(`HTML saved to: ${htmlPath}`);
        
        // Capture console logs
        const consoleLogPath = path.join(screenshotDir, `${screenshotName}-console-${timestamp}.log`);
        const consoleLogs = await this.page.evaluate(() => {
          // Collect any stored logs from window.__testLogs if available
          return window.__testLogs || [];
        });
        
        if (consoleLogs.length > 0) {
          fs.writeFileSync(consoleLogPath, JSON.stringify(consoleLogs, null, 2));
          console.log(`Console logs saved to: ${consoleLogPath}`);
        }
      } catch (error) {
        console.error(`Failed to capture error artifacts: ${error.message}`);
      }
    } else {
      console.error('Page object not available for taking screenshot');
    }
  }
  
  // Close the browser with a try-catch to ensure it always completes
  try {
    console.log('Closing browser...');
    await this.closeBrowser();
    console.log('Browser closed successfully');
  } catch (error) {
    console.error(`Error closing browser: ${error.message}`);
  }
});

/**
 * Create test results directories and setup for tests
 */
BeforeAll(async function() {
  console.log('===============================================');
  console.log('Starting Playwright + Cucumber test suite');
  console.log('===============================================');
  
  // Create necessary directories
  const dirs = [
    'test-results',
    'test-results/screenshots',
    'test-results/videos',
    'test-reports'
  ];
  
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  }
  
  // Create a script that will be injected into the page to help with debugging
  const consoleDebugScript = `
  // Create a global array to store console logs
  window.__testLogs = [];
  
  // Create a global array to store errors
  window.__e2eErrors = [];
  
  // Override console methods to store logs
  const originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error,
    info: console.info
  };
  
  // Store original methods
  console.log = function() {
    window.__testLogs.push({type: 'log', message: Array.from(arguments).join(' '), timestamp: new Date().toISOString()});
    originalConsole.log.apply(console, arguments);
  };
  
  console.warn = function() {
    window.__testLogs.push({type: 'warn', message: Array.from(arguments).join(' '), timestamp: new Date().toISOString()});
    originalConsole.warn.apply(console, arguments);
  };
  
  console.error = function() {
    window.__testLogs.push({type: 'error', message: Array.from(arguments).join(' '), timestamp: new Date().toISOString()});
    window.__e2eErrors.push({message: Array.from(arguments).join(' '), timestamp: new Date().toISOString()});
    originalConsole.error.apply(console, arguments);
  };
  
  console.info = function() {
    window.__testLogs.push({type: 'info', message: Array.from(arguments).join(' '), timestamp: new Date().toISOString()});
    originalConsole.info.apply(console, arguments);
  };
  
  // Add window error handler
  window.addEventListener('error', function(e) {
    window.__e2eErrors.push({
      message: e.message,
      source: e.filename,
      lineno: e.lineno,
      colno: e.colno,
      stack: e.error ? e.error.stack : null,
      timestamp: new Date().toISOString()
    });
    return false;
  });
  
  console.log('[E2E Test] Debug script initialized');
  `;
  
  // Write the script to a file so it can be injected during page setup
  fs.writeFileSync(path.join('test-results', 'console-debug.js'), consoleDebugScript);
  console.log('Debug script created for browser injection');
  
  // Create a helper HTML file that logs all elements with Estimator text for debugging
  const debugHelperHtml = `
  <!DOCTYPE html>
  <html>
    <head>
      <title>Element Finder Debug Tool</title>
      <style>
        body { font-family: sans-serif; padding: 20px; }
        pre { background: #f4f4f4; padding: 10px; border-radius: 5px; }
        .highlight { background: yellow; }
      </style>
    </head>
    <body>
      <h1>Element Finder Debug Tool</h1>
      <p>Paste the HTML from your page below, and this tool will highlight elements containing "estimator" or "estimate".</p>
      <textarea id="htmlInput" style="width: 100%; height: 200px;"></textarea>
      <button onclick="findElements()">Find Elements</button>
      <div id="results"></div>
      
      <script>
        function findElements() {
          const html = document.getElementById('htmlInput').value;
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = html;
          
          const allElements = tempDiv.querySelectorAll('*');
          const results = [];
          
          for (const element of allElements) {
            const text = element.textContent?.toLowerCase() || '';
            const className = element.className?.toLowerCase() || '';
            const id = element.id?.toLowerCase() || '';
            const href = element.getAttribute('href')?.toLowerCase() || '';
            
            if (
              text.includes('estimator') || 
              text.includes('estimate') || 
              className.includes('estimator') || 
              className.includes('estimate') ||
              id.includes('estimator') ||
              id.includes('estimate') ||
              href.includes('estimator') ||
              href.includes('estimate')
            ) {
              // Create a simplified version of the element for display
              const tagName = element.tagName.toLowerCase();
              const idPart = id ? \` id="\${id}"\` : '';
              const classPart = element.className ? \` class="\${element.className}"\` : '';
              const hrefPart = href ? \` href="\${href}"\` : '';
              const content = text.substring(0, 50) + (text.length > 50 ? '...' : '');
              
              results.push({
                element: \`<\${tagName}\${idPart}\${classPart}\${hrefPart}>\${content}</\${tagName}>\`,
                className,
                id,
                href,
                text: content
              });
            }
          }
          
          // Display results
          const resultsDiv = document.getElementById('results');
          if (results.length === 0) {
            resultsDiv.innerHTML = '<p>No matching elements found.</p>';
            return;
          }
          
          let html = '<h2>Found ' + results.length + ' matching elements:</h2>';
          
          results.forEach((result, index) => {
            html += \`
              <div style="margin-bottom: 20px; border: 1px solid #ccc; padding: 10px; border-radius: 5px;">
                <h3>Element #\${index + 1}</h3>
                <pre>\${escapeHtml(result.element)}</pre>
                <ul>
                  \${result.id ? '<li><strong>ID:</strong> ' + result.id + '</li>' : ''}
                  \${result.className ? '<li><strong>Classes:</strong> ' + result.className + '</li>' : ''}
                  \${result.href ? '<li><strong>Href:</strong> ' + result.href + '</li>' : ''}
                  \${result.text ? '<li><strong>Text:</strong> ' + result.text + '</li>' : ''}
                </ul>
                <p><strong>Possible Selectors:</strong></p>
                <ul>
                  \${result.id ? \`<li>document.getElementById("\${result.id}")</li>\` : ''}
                  \${result.className ? result.className.split(' ').map(cls => 
                    \`<li>document.querySelector(".\${cls}")</li>\`).join('') : ''}
                  \${result.href ? \`<li>document.querySelector("a[href*='\${result.href}']")</li>\` : ''}
                  \${\`<li>document.querySelector("*:contains('\${result.text}')")</li>\`}
                </ul>
              </div>
            \`;
          });
          
          resultsDiv.innerHTML = html;
        }
        
        function escapeHtml(unsafe) {
          return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
        }
      </script>
    </body>
  </html>
  `;
  
  fs.writeFileSync(path.join('test-results', 'element-finder.html'), debugHelperHtml);
  console.log('Element finder debug tool created: test-results/element-finder.html');
  
  console.log('Test environment setup complete');
});

/**
 * Clean up after all tests complete
 */
AfterAll(async function() {
  // Any cleanup after all tests run
});