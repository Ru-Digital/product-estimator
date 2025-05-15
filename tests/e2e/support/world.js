const { setWorldConstructor, World } = require('@cucumber/cucumber');
const { chromium, firefox, webkit } = require('@playwright/test');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config();

/**
 * Custom world class for Cucumber with Playwright integration
 * @extends {World}
 */
class PlaywrightWorld extends World {
  /**
   * Constructor for the PlaywrightWorld
   * @param {Object} options - Cucumber world options
   */
  constructor(options) {
    super(options);
    this.browser = null;
    this.context = null;
    this.page = null;
    this.testName = '';
    this.browserName = process.env.BROWSER || 'chromium';
    this.baseURL = process.env.BASE_URL || 'http://localhost/wp';
  }

  /**
   * Initialize the browser, context, and page for testing
   * @param {Object} options - Browser launch options
   * @returns {Promise<void>}
   */
  async initBrowser(options = {}) {
    try {
      const browserOptions = {
        headless: process.env.HEADLESS !== 'false',
        slowMo: process.env.SLOWMO ? parseInt(process.env.SLOWMO) : 0,
        timeout: 120000, // 120 second timeout for browser launch
        args: ['--disable-dev-shm-usage', '--no-sandbox', '--disable-setuid-sandbox'],
        ...options
      };

      switch (this.browserName) {
        case 'firefox':
          this.browser = await firefox.launch(browserOptions);
          break;
        case 'webkit':
          this.browser = await webkit.launch(browserOptions);
          break;
        default:
          this.browser = await chromium.launch(browserOptions);
      }

      this.context = await this.browser.newContext({
        viewport: { width: 1280, height: 720 },
        recordVideo: process.env.RECORD_VIDEO === 'true' ? {
          dir: 'test-results/videos/'
        } : undefined,
        // Set default timeouts
        navigationTimeout: 120000,
        actionTimeout: 90000
      });

      this.page = await this.context.newPage();
      
      // Add event listeners for console and errors
      this.page.on('console', msg => {
        // Log all console events for better debugging
        const type = msg.type();
        const text = msg.text();
        if (type === 'error' || type === 'warning') {
          console.log(`Browser console ${type}: ${text}`);
        } else if (type === 'log' && text.includes('[E2E Test]')) {
          // Always log our custom debug messages
          console.log(`Browser: ${text}`);
        }
      });
      
      this.page.on('pageerror', error => {
        console.error(`Page error: ${error.message}`);
      });
      
      // Set default navigation timeout
      this.page.setDefaultNavigationTimeout(120000);
      this.page.setDefaultTimeout(90000);
      
      // Inject the debug script if it exists
      try {
        const debugScriptPath = path.join(process.cwd(), 'test-results', 'console-debug.js');
        if (fs.existsSync(debugScriptPath)) {
          const debugScript = fs.readFileSync(debugScriptPath, 'utf8');
          await this.page.addInitScript(debugScript);
          console.log('Injected console debug script into page');
        }
      } catch (error) {
        console.error(`Failed to inject debug script: ${error.message}`);
      }
      
      console.log(`Browser initialized: ${this.browserName}`);
    } catch (error) {
      console.error(`Failed to initialize browser: ${error.message}`);
      throw error;
    }
  }

  /**
   * Close the browser after testing
   * @returns {Promise<void>}
   */
  async closeBrowser() {
    try {
      if (this.browser) {
        // Add small delay to allow any pending operations to complete
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (this.page) {
          // Try to close page first
          try {
            await this.page.close();
          } catch (e) {
            console.log(`Error closing page: ${e.message}`);
          }
          this.page = null;
        }
        
        if (this.context) {
          // Then try to close context
          try {
            await this.context.close();
          } catch (e) {
            console.log(`Error closing context: ${e.message}`);
          }
          this.context = null;
        }
        
        // Finally close browser
        await this.browser.close({ timeout: 30000 });
        this.browser = null;
        
        console.log('Browser closed successfully');
      }
    } catch (error) {
      console.error(`Error during browser cleanup: ${error.message}`);
      // Force reset references even if closing fails
      this.page = null;
      this.context = null;
      this.browser = null;
    }
  }

  /**
   * Navigate to a URL, prepending baseURL if needed
   * @param {string} path - The URL path to navigate to
   * @returns {Promise<void>}
   */
  async goto(path, options = {}) {
    try {
      const url = path.startsWith('http') ? path : `${this.baseURL}${path}`;
      console.log(`Navigating to: ${url}`);
      
      const navigationOptions = {
        waitUntil: 'networkidle',
        timeout: 120000,
        ...options
      };
      
      await this.page.goto(url, navigationOptions);
      console.log(`Successfully navigated to: ${url}`);
    } catch (error) {
      console.error(`Error navigating to ${path}: ${error.message}`);
      
      // Take a screenshot on navigation error
      try {
        await this.page.screenshot({ path: `test-results/navigation-error-${Date.now()}.png` });
      } catch (screenshotError) {
        console.error(`Failed to take screenshot: ${screenshotError.message}`);
      }
      
      throw error;
    }
  }

  /**
   * Get the current URL
   * @returns {Promise<string>}
   */
  async getCurrentUrl() {
    return this.page.url();
  }
}

setWorldConstructor(PlaywrightWorld);