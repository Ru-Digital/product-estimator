/**
 * TemplateEngine.js
 *
 * Manages HTML templates for the Product Estimator plugin.
 */

class TemplateEngine {
  /**
   * Initialize the template engine
   */
  constructor() {
    this.templates = {};
    this.templateElements = {};
    this.initialized = false;
  }

  /**
   * Initialize template engine by gathering all templates
   * @returns {TemplateEngine} This instance for chaining
   */
// In TemplateEngine.js - init method
  init() {
    if (this.initialized) return this;

    console.log('Initializing TemplateEngine with templates', Object.keys(this.templates));

    // Create template elements from registered HTML
    Object.entries(this.templates).forEach(([id, html]) => {
      // Create a temporary div to hold the HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;

      // Extract the template content
      const templateElement = tempDiv.querySelector('template');
      if (templateElement) {
        this.templateElements[id] = templateElement;
        console.log(`Template found in HTML: ${id}`);
      } else {
        // Create a new template element
        const newTemplate = document.createElement('template');
        newTemplate.id = id;
        newTemplate.innerHTML = html;
        this.templateElements[id] = newTemplate;
        console.log(`Created new template element: ${id}`);
      }
    });

    console.log(`TemplateEngine initialized with ${Object.keys(this.templateElements).length} templates`);
    this.initialized = true;
    return this;
  }
  /**
   * Register a template with the engine
   * @param {string} id - Template ID
   * @param {string} html - Template HTML content
   * @returns {TemplateEngine} This instance for chaining
   */
  registerTemplate(id, html) {
    this.templates[id] = html;
    this.initialized = false; // Mark as needing reinitialization
    return this;
  }

  /**
   * Get a template by ID
   * @param {string} id - Template ID
   * @returns {HTMLTemplateElement|null} Template element or null if not found
   */
  getTemplate(id) {
    if (!this.initialized) this.init();
    return this.templateElements[id] || null;
  }

  /**
   * Create an element from a template and populate it with data
   * @param {string} templateId - Template ID
   * @param {Object} data - Data to populate the template with
   * @returns {DocumentFragment} The populated template content
   */
  create(templateId, data = {}) {
    const template = this.getTemplate(templateId);

    if (!template) {
      console.error(`Template not found: ${templateId}`);
      return document.createDocumentFragment();
    }

    // Clone the template content
    const clone = template.content.cloneNode(true);

    // Populate the template with data
    this.populateElement(clone, data);

    return clone;
  }

  /**
   * Populate an element with data
   * @param {Element|DocumentFragment} element - Element to populate
   * @param {Object} data - Data to populate with
   */
  populateElement(element, data) {
    // Process simple data attributes first
    Object.entries(data).forEach(([key, value]) => {
      // Skip complex objects and arrays
      if (typeof value !== 'object' && !Array.isArray(value)) {
        // Look for elements with matching class name
        const targetElements = element.querySelectorAll(`.${key}`);

        targetElements.forEach(target => {
          if (target.tagName === 'IMG' && key === 'image') {
            target.src = value || '';
            if (data.name) target.alt = data.name;
          } else if (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA') {
            target.value = value;
          } else {
            target.textContent = value;
          }
        });

        // Also set data attributes
        const dataElements = element.querySelectorAll(`[data-${key}]`);
        dataElements.forEach(dataElement => {
          dataElement.setAttribute(`data-${key}`, value);
        });
      }
    });

    // Handle special data attributes like data-product-id
    if (data.estimate_id) {
      const elementsWithEstimateId = element.querySelectorAll('[data-estimate-id]');
      elementsWithEstimateId.forEach(el => {
        el.setAttribute('data-estimate-id', data.estimate_id);
      });
    }

    if (data.room_id) {
      const elementsWithRoomId = element.querySelectorAll('[data-room-id]');
      elementsWithRoomId.forEach(el => {
        el.setAttribute('data-room-id', data.room_id);
      });
    }

    if (data.name || data.room_name) {
      const roomNameElements = element.querySelectorAll('.room-name');
      roomNameElements.forEach(element => {
        element.textContent = data.name || data.room_name || 'Unnamed Room';
      });
    }

    // Enhance product ID handling
    if (data.id) {
      // For products, the ID is often stored in data.id
      const elementsWithProductId = element.querySelectorAll('[data-product-id]');
      elementsWithProductId.forEach(el => {
        el.setAttribute('data-product-id', data.id);
      });

      // Also set on the main element if it's a product item
      if (element.classList && element.classList.contains('product-item')) {
        element.setAttribute('data-product-id', data.id);
      }
    } else if (data.product_id) {
      const elementsWithProductId = element.querySelectorAll('[data-product-id]');
      elementsWithProductId.forEach(el => {
        el.setAttribute('data-product-id', data.product_id);
      });
    }

    if (data.product_index !== undefined) {
      const elementsWithProductIndex = element.querySelectorAll('[data-product-index]');
      elementsWithProductIndex.forEach(el => {
        el.setAttribute('data-product-index', data.product_index);
      });

      // Also set it on the main element if it's a product item
      if (element.classList && element.classList.contains('product-item')) {
        element.setAttribute('data-product-index', data.product_index);
      }
    }

    // Enhanced image handling
    if (data.image) {
      const imgElements = element.querySelectorAll('img.product-thumbnail, img.product-img');
      imgElements.forEach(img => {
        img.src = data.image;
        img.alt = data.name || 'Product';
      });
    }

    // Handle price display
    if (data.min_price !== undefined && data.max_price !== undefined) {
      const priceElements = element.querySelectorAll('.room-price, .price');
      priceElements.forEach(el => {
        el.textContent = `${data.min_price || 0} - ${data.max_price || 0}`;
      });
    }

    // Enhanced name display for products
    if (data.name) {
      const nameElements = element.querySelectorAll('.price-title, .product-name');
      nameElements.forEach(el => {
        el.textContent = data.name;
      });
    }

    // Handle nested arrays of data using child templates
    Object.entries(data).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length > 0) {
        // Find container for this array
        const container = element.querySelector(`.${key}`) ||
          element.querySelector(`.${key}-container`) ||
          element.querySelector(`.${key}-items`);

        if (container && value[0].template) {
          // Use the specified template for each item
          const childTemplateId = value[0].template;
          value.forEach(item => {
            const childElement = this.create(childTemplateId, item);
            container.appendChild(childElement);
          });
        }
      }
    });

    // Handle common product data patterns
    if (data.additional_products && Array.isArray(data.additional_products) && data.additional_products.length > 0) {
      const includesContainer = element.querySelector('.includes-container');
      const includesItems = element.querySelector('.product-includes-items');

      if (includesContainer && includesItems) {
        // Ensure includes container is visible
        includesContainer.style.display = 'block';
        includesContainer.classList.add('visible');

        // Render each additional product
        data.additional_products.forEach(product => {
          const itemDiv = document.createElement('div');
          itemDiv.className = 'include-item';
          itemDiv.innerHTML = `<span class="include-item-name">${product.name || 'Additional Product'}</span>`;
          includesItems.appendChild(itemDiv);
        });
      }
    }

    // Handle notes
    if (data.additional_notes && Array.isArray(data.additional_notes) && data.additional_notes.length > 0) {
      const notesContainer = element.querySelector('.notes-container');
      const notesItems = element.querySelector('.product-notes-items');

      if (notesContainer && notesItems && this.getTemplate) {
        // Ensure notes container is visible
        notesContainer.style.display = 'block';
        notesContainer.classList.add('visible');

        // Check if we have a note template
        if (this.getTemplate('note-item-template')) {
          // Use template to render notes
          data.additional_notes.forEach(note => {
            // Prepare note data with parent product context
            const noteData = {
              estimate_id: data.estimate_id,
              room_id: data.room_id,
              product_index: data.product_index,
              ...note
            };

            // Create and append note using template
            const noteElement = this.create('note-item-template', noteData);
            notesItems.appendChild(noteElement);
          });
        } else {
          // Fallback if template is not available
          data.additional_notes.forEach(note => {
            const noteDiv = document.createElement('div');
            noteDiv.className = 'product-note-item';
            noteDiv.innerHTML = `
            <div class="note-details-wrapper">
              <div class="note-details">
                <span class="note-icon">
                  <span class="dashicons dashicons-sticky"></span>
                </span>
                <div class="note-content">${note.note_text || ''}</div>
              </div>
            </div>
          `;
            notesItems.appendChild(noteDiv);
          });
        }
      }
    }
  }
  
  /**
   * Create and insert an element into the DOM
   * @param {string} templateId - Template ID
   * @param {Object} data - Data to populate with
   * @param {Element|string} container - Container element or selector
   * @param {string} position - Insert position ('append', 'prepend', 'before', 'after', 'replace')
   * @returns {Element} The inserted element
   */
  insert(templateId, data, container, position = 'append') {
    const element = this.create(templateId, data);

    if (typeof container === 'string') {
      container = document.querySelector(container);
    }

    if (!container) {
      console.error(`Container not found for template: ${templateId}`);
      return null;
    }

    switch (position) {
      case 'prepend':
        container.prepend(element);
        break;
      case 'before':
        container.parentNode.insertBefore(element, container);
        break;
      case 'after':
        container.parentNode.insertBefore(element, container.nextSibling);
        break;
      case 'replace':
        container.parentNode.replaceChild(element, container);
        break;
      case 'append':
      default:
        container.appendChild(element);
        break;
    }

    return element;
  }

  /**
   * Show a message in the modal
   * @param {string} message - Message to show
   * @param {string} type - Message type ('success' or 'error')
   * @param {Element|string} container - Container element or selector
   */
  showMessage(message, type = 'success', container = '.product-estimator-modal-form-container') {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.modal-message');
    existingMessages.forEach(msg => msg.remove());

    // Create message element - use correct template ID based on type
    const templateId = type === 'error' ? 'error-message-template' : 'success-message-template';

    // Find both templates in the modal-messages-template
    const messageTemplate = this.getTemplate('modal-messages-template');
    if (!messageTemplate) {
      // Fallback - create a basic message div
      const messageDiv = document.createElement('div');
      messageDiv.className = `modal-message modal-${type}-message`;
      messageDiv.textContent = message;

      if (typeof container === 'string') {
        container = document.querySelector(container);
      }

      if (container) {
        container.prepend(messageDiv);

        // Auto-remove after 5 seconds
        setTimeout(() => {
          if (messageDiv.parentNode) {
            messageDiv.remove();
          }
        }, 5000);
      }

      return;
    }

    // Create the message element from the template
    const messageElement = document.createElement('div');
    messageElement.className = `modal-message modal-${type}-message`;
    messageElement.innerHTML = `<div class="message-content">${message}</div>`;

    if (typeof container === 'string') {
      container = document.querySelector(container);
    }

    if (container) {
      container.prepend(messageElement);

      // Auto-remove after 5 seconds
      setTimeout(() => {
        if (messageElement.parentNode) {
          messageElement.remove();
        }
      }, 5000);
    }
  }

  // Add this method to TemplateEngine class
  debugTemplates() {
    console.group('TemplateEngine Debug');
    console.log('Registered template IDs:', Object.keys(this.templates));
    console.log('Template elements:', Object.keys(this.templateElements));

    // Check each template
    Object.entries(this.templateElements).forEach(([id, template]) => {
      console.log(`Template ${id}:`, template);

      // Check template content
      if (template.content) {
        console.log(`- Has content: ${template.content.childNodes.length} child nodes`);
      } else {
        console.warn(`- No content for template ${id}`);
      }
    });

    console.groupEnd();
  }
}

// Export a singleton instance
export default new TemplateEngine();
