const BasePage = require('./BasePage');

class ProductEstimatorPage extends BasePage {
  constructor(page) {
    super(page);
    
    // Main modal selectors
    this.modal = '#product-estimator-modal-content';
    this.modalWrapper = '.product-estimator-modal-wrapper';
    
    // Form selectors
    this.estimateSelectionForm = '#product-estimator-estimate-selection-form';
    this.roomSelectionForm = '#product-estimator-room-selection-form';
    this.newEstimateForm = '#product-estimator-new-estimate-form';
    this.newRoomForm = '#product-estimator-new-room-form';
    
    // List selectors
    this.estimatesList = '#product-estimator-estimates-list';
    this.estimateSection = '.estimate-section';
    this.roomItem = '.room-item';
    this.productItem = '.product-item';
    
    // Button selectors
    this.addToEstimateButton = '.add-to-estimate-button';
    this.createEstimateButton = '#create-estimate-btn';
    this.addRoomButton = '.add-room-button';
  }

  async openModal(productId = null) {
    if (productId) {
      // Simulate opening modal with a product
      await this.page.evaluate((productId) => {
        window.productEstimator.modalManager.openModal(productId);
      }, productId);
    } else {
      // Open modal without product (estimates list view)
      await this.page.click('a[href="#estimate"]');
    }
    
    await this.page.waitForSelector(this.modal, { timeout: 5000 });
  }

  async selectEstimate(estimateName) {
    await this.page.waitForSelector(this.estimateSelectionForm, { timeout: 5000 });
    const selectElement = await this.page.$('select[name="estimate_id"]');
    
    // Find the option with the matching text
    const optionValue = await this.page.evaluate((selectElement, estimateName) => {
      const options = selectElement.querySelectorAll('option');
      for (const option of options) {
        if (option.textContent.includes(estimateName)) {
          return option.value;
        }
      }
      return null;
    }, selectElement, estimateName);
    
    if (optionValue) {
      await selectElement.selectOption(optionValue);
      await this.page.click('button[type="submit"]');
    }
  }

  async selectRoom(roomName) {
    await this.page.waitForSelector(this.roomSelectionForm, { timeout: 5000 });
    const selectElement = await this.page.$('select[name="room_id"]');
    
    // Find the option with the matching text
    const optionValue = await this.page.evaluate((selectElement, roomName) => {
      const options = selectElement.querySelectorAll('option');
      for (const option of options) {
        if (option.textContent.includes(roomName)) {
          return option.value;
        }
      }
      return null;
    }, selectElement, roomName);
    
    if (optionValue) {
      await selectElement.selectOption(optionValue);
      await this.page.click('button[type="submit"]');
    }
  }

  async createEstimate(name, postcode) {
    await this.page.waitForSelector(this.newEstimateForm, { timeout: 5000 });
    await this.page.fill('input[name="estimate_name"]', name);
    await this.page.fill('input[name="customer_postcode"]', postcode);
    await this.page.click('button[type="submit"]');
  }

  async createRoom(name, width, length) {
    await this.page.waitForSelector(this.newRoomForm, { timeout: 5000 });
    await this.page.fill('input[name="room_name"]', name);
    await this.page.fill('input[name="room_width"]', width.toString());
    await this.page.fill('input[name="room_length"]', length.toString());
    await this.page.click('button[type="submit"]');
  }

  async expandEstimate(estimateName) {
    const estimate = await this.page.locator(`${this.estimateSection}:has-text("${estimateName}")`);
    const header = estimate.locator('.estimate-header');
    const isExpanded = await estimate.evaluate(el => el.classList.contains('expanded'));
    
    if (!isExpanded) {
      await header.click();
      await this.page.waitForTimeout(500); // Wait for animation
    }
  }

  async expandRoom(roomName) {
    const room = await this.page.locator(`${this.roomItem}:has-text("${roomName}")`);
    const header = room.locator('.accordion-header-wrapper');
    const content = room.locator('.accordion-content');
    const isExpanded = await content.evaluate(el => el.style.display !== 'none');
    
    if (!isExpanded) {
      await header.click();
      await this.page.waitForTimeout(500); // Wait for animation
    }
  }

  async getEstimateByName(estimateName) {
    return await this.page.locator(`${this.estimateSection}:has-text("${estimateName}")`);
  }

  async getRoomByName(roomName) {
    return await this.page.locator(`${this.roomItem}:has-text("${roomName}")`);
  }

  async getProductByName(productName) {
    return await this.page.locator(`${this.productItem}:has-text("${productName}")`);
  }

  async isEstimateExpanded(estimateName) {
    const estimate = await this.getEstimateByName(estimateName);
    return await estimate.evaluate(el => el.classList.contains('expanded'));
  }

  async isRoomExpanded(roomName) {
    const room = await this.getRoomByName(roomName);
    const content = room.locator('.accordion-content');
    return await content.evaluate(el => el.style.display !== 'none');
  }

  async getRoomProducts(roomName) {
    const room = await this.getRoomByName(roomName);
    const products = await room.locator(this.productItem);
    return await products.evaluateAll(elements => 
      elements.map(el => ({
        name: el.querySelector('.product-name')?.textContent,
        price: el.querySelector('.product-price')?.textContent,
        id: el.dataset.productId
      }))
    );
  }

  async getRoomTotal(roomName) {
    const room = await this.getRoomByName(roomName);
    const totalElement = room.locator('.room-total');
    return await totalElement.textContent();
  }

  async isProductInRoom(productName, roomName) {
    const products = await this.getRoomProducts(roomName);
    return products.some(product => product.name === productName);
  }

  async waitForEstimatesList() {
    await this.page.waitForSelector(this.estimatesList, { timeout: 5000 });
  }

  async waitForRoomSelection() {
    await this.page.waitForSelector(this.roomSelectionForm, { timeout: 5000 });
  }

  async getLocalStorageData() {
    return await this.page.evaluate(() => {
      const data = localStorage.getItem('productEstimatorEstimateData');
      return data ? JSON.parse(data) : null;
    });
  }

  async getEstimateData(estimateName) {
    const data = await this.getLocalStorageData();
    if (!data || !data.estimates) return null;
    
    return Object.values(data.estimates).find(estimate => 
      estimate.name === estimateName
    );
  }

  async getRoomData(estimateName, roomName) {
    const estimate = await this.getEstimateData(estimateName);
    if (!estimate || !estimate.rooms) return null;
    
    return Object.values(estimate.rooms).find(room => 
      room.name === roomName
    );
  }
}

module.exports = ProductEstimatorPage;