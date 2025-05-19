const primaryCategoryFixtures = require('../fixtures/primary-category-fixtures');

class PrimaryCategoryHelpers {
  constructor(page) {
    this.page = page;
  }

  /**
   * Setup test environment with primary category settings
   */
  async setupPrimaryCategoryEnvironment() {
    await this.page.evaluate((settings) => {
      // Mock the WordPress settings
      window.productEstimatorVars = window.productEstimatorVars || {};
      window.productEstimatorVars.settings = settings;
      
      // Mock the primary categories configuration
      window.productEstimatorSettings = window.productEstimatorSettings || {};
      window.productEstimatorSettings.primary_product_categories = settings.primary_product_categories;
    }, primaryCategoryFixtures.settings);
  }

  /**
   * Create a test estimate with rooms and products
   */
  async createTestEstimate(estimateName, rooms = []) {
    await this.page.evaluate(({ estimateName, rooms }) => {
      const estimateId = `estimate_${Date.now()}`;
      const estimateData = {
        id: estimateId,
        name: estimateName,
        rooms: {}
      };
      
      // Add rooms
      rooms.forEach((room, index) => {
        const roomId = `room_${Date.now()}_${index}`;
        estimateData.rooms[roomId] = {
          id: roomId,
          name: room.name,
          width: room.width || 4,
          length: room.length || 5,
          products: room.products || {}
        };
      });
      
      // Save to localStorage
      const storageData = JSON.parse(localStorage.getItem('productEstimatorEstimateData') || '{}');
      storageData.estimates = storageData.estimates || {};
      storageData.estimates[estimateId] = estimateData;
      localStorage.setItem('productEstimatorEstimateData', JSON.stringify(storageData));
      
      return estimateId;
    }, { estimateName, rooms });
  }

  /**
   * Add a product to a room
   */
  async addProductToRoom(estimateName, roomName, product) {
    await this.page.evaluate(({ estimateName, roomName, product }) => {
      const storageData = JSON.parse(localStorage.getItem('productEstimatorEstimateData') || '{}');
      
      // Find the estimate
      const estimate = Object.values(storageData.estimates || {}).find(est => est.name === estimateName);
      if (!estimate) return;
      
      // Find the room
      const room = Object.values(estimate.rooms || {}).find(rm => rm.name === roomName);
      if (!room) return;
      
      // Add the product
      room.products = room.products || {};
      room.products[product.id] = product;
      
      localStorage.setItem('productEstimatorEstimateData', JSON.stringify(storageData));
    }, { estimateName, roomName, product });
  }

  /**
   * Verify product exists in room
   */
  async verifyProductInRoom(estimateName, roomName, productName) {
    return await this.page.evaluate(({ estimateName, roomName, productName }) => {
      const storageData = JSON.parse(localStorage.getItem('productEstimatorEstimateData') || '{}');
      
      // Find the estimate
      const estimate = Object.values(storageData.estimates || {}).find(est => est.name === estimateName);
      if (!estimate) return false;
      
      // Find the room
      const room = Object.values(estimate.rooms || {}).find(rm => rm.name === roomName);
      if (!room) return false;
      
      // Check if product exists
      return Object.values(room.products || {}).some(product => product.name === productName);
    }, { estimateName, roomName, productName });
  }

  /**
   * Get room products
   */
  async getRoomProducts(estimateName, roomName) {
    return await this.page.evaluate(({ estimateName, roomName }) => {
      const storageData = JSON.parse(localStorage.getItem('productEstimatorEstimateData') || '{}');
      
      // Find the estimate
      const estimate = Object.values(storageData.estimates || {}).find(est => est.name === estimateName);
      if (!estimate) return [];
      
      // Find the room
      const room = Object.values(estimate.rooms || {}).find(rm => rm.name === roomName);
      if (!room) return [];
      
      return Object.values(room.products || {});
    }, { estimateName, roomName });
  }

  /**
   * Mock product data for testing
   */
  async mockProducts(products) {
    await this.page.evaluate((products) => {
      window.testProducts = products;
      
      // Mock the AJAX response for product data
      window.mockProductData = (productId) => {
        const product = products[productId];
        if (!product) return null;
        
        return {
          product_data: {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            is_primary_category: product.is_primary_category,
            category: product.category
          }
        };
      };
    }, products);
  }

  /**
   * Simulate clicking "Add to Estimate" for a product
   */
  async clickAddToEstimate(productId) {
    await this.page.evaluate((productId) => {
      // Simulate the action that opens the modal with a product
      if (window.productEstimator && window.productEstimator.modalManager) {
        window.productEstimator.modalManager.openModal(productId);
      }
    }, productId);
  }

  /**
   * Wait for primary conflict dialog
   */
  async waitForConflictDialog() {
    await this.page.waitForSelector('.pe-confirmation-dialog.visible', { timeout: 5000 });
  }

  /**
   * Get dialog message
   */
  async getDialogMessage() {
    const element = await this.page.$('.pe-dialog-message');
    return element ? await element.textContent() : null;
  }

  /**
   * Click dialog button by text
   */
  async clickDialogButton(buttonText) {
    const button = await this.page.locator(`.pe-dialog-buttons button:has-text("${buttonText}")`);
    await button.click();
  }

  /**
   * Check if success dialog is shown
   */
  async verifySuccessDialog(expectedTitle) {
    await this.page.waitForSelector('.pe-confirmation-dialog.visible', { timeout: 5000 });
    const title = await this.page.textContent('.pe-dialog-title');
    return title === expectedTitle;
  }

  /**
   * Clear test data
   */
  async clearTestData() {
    await this.page.evaluate(() => {
      localStorage.removeItem('productEstimatorEstimateData');
      delete window.testProducts;
      delete window.mockProductData;
    });
  }
}

module.exports = PrimaryCategoryHelpers;