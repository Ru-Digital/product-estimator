const { setWorldConstructor, World } = require('@cucumber/cucumber');
const { chromium, firefox, webkit } = require('@playwright/test');
const dotenv = require('dotenv');

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
    const browserOptions = {
      headless: process.env.HEADLESS !== 'false',
      slowMo: process.env.SLOWMO ? parseInt(process.env.SLOWMO) : 0,
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
      } : undefined
    });

    this.page = await this.context.newPage();
    
    // Add event listeners for console and errors
    this.page.on('console', msg => {
      if (msg.type() === 'error' || msg.type() === 'warning') {
        console.log(`Browser console ${msg.type()}: ${msg.text()}`);
      }
    });
    
    this.page.on('pageerror', error => {
      console.error(`Page error: ${error.message}`);
    });
  }

  /**
   * Close the browser after testing
   * @returns {Promise<void>}
   */
  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.context = null;
      this.page = null;
    }
  }

  /**
   * Navigate to a URL, prepending baseURL if needed
   * @param {string} path - The URL path to navigate to
   * @returns {Promise<void>}
   */
  async goto(path) {
    const url = path.startsWith('http') ? path : `${this.baseURL}${path}`;
    await this.page.goto(url);
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