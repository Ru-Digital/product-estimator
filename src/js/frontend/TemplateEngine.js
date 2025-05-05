/**
 * TemplateEngine.js
 *
 * Manages HTML templates for the Product Estimator plugin.
 */
import { format } from '@utils';

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

    this.verifyTemplates();

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

    // Handle product removal buttons specifically to ensure they get ALL required attributes
    if (data.product_index !== undefined) {
      // Find remove buttons
      const removeButtons = element.querySelectorAll('.remove-product');
      removeButtons.forEach(button => {
        // Set product index directly (critical for deletion to work)
        button.dataset.productIndex = data.product_index;

        // Ensure other needed attributes
        if (data.estimate_id !== undefined) button.dataset.estimateId = data.estimate_id;
        if (data.room_id !== undefined) button.dataset.roomId = data.room_id;

        // Debug log to verify attributes
        console.log(`Setting removal button data attributes: estimate=${data.estimate_id}, room=${data.room_id}, product=${data.product_index}`);
      });
    }

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
    if (data.min_total !== undefined && data.max_total !== undefined) {
      const priceElements = element.querySelectorAll('.estimate-price');
      priceElements.forEach(el => {
        el.textContent = `${format.formatPrice(data.min_total)} - ${format.formatPrice(data.max_total)}`;
      });
    }

    if (data.min_price_total !== undefined && data.max_price_total !== undefined) {
      const priceElements = element.querySelectorAll('.product-price');
      priceElements.forEach(el => {
        el.textContent = `${format.formatPrice(data.min_price_total)} - ${format.formatPrice(data.max_price_total)}`;
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

    // Handle common product data patterns - UPDATED FOR PRODUCT INCLUDES
    if (data.additional_products) {
      const includesContainer = element.querySelector('.includes-container');
      const includesItems = element.querySelector('.product-includes-items');

      if (includesContainer && includesItems) {
        // Clear any previous items first
        includesItems.innerHTML = '';

        // Filter for valid additional products
        const validProducts = Array.isArray(data.additional_products) ?
          data.additional_products.filter(product => product && product.id) :
          [];



        if (validProducts.length > 0) {
          // Ensure includes container is visible
          includesContainer.style.display = 'block';
          includesContainer.classList.add('visible');

          // Render each additional product
          validProducts.forEach(product => {


            // Use template to create include item
            if (this.getTemplate('include-item-template')) {
              // Create data object for the include item
              const includeItemData = {
                product_id: product.id,
                include_item_name: product.name || 'Additional Product'
              };

              // Add price information if available
              if (product.min_price_total !== undefined && product.max_price_total !== undefined) {
                includeItemData.include_item_total_price =
                  format.formatPrice(product.min_price_total) + ' - ' + format.formatPrice(product.max_price_total);
              product.total_price =  format.formatPrice(product.min_price_total) + ' - ' + format.formatPrice(product.max_price_total);

              }

              console.log("include item product:: ", product);
              // Create the item from template
              const includeFragment = this.create('include-item-template', includeItemData);

              const includeNameElement = includeFragment.querySelector('.include-item-name');
              if (includeNameElement) {
                includeNameElement.textContent = product.name || '';
              }

              const includePriceElement = includeFragment.querySelector('.include-item-total-price');
              if (includePriceElement) {
                includePriceElement.textContent = product.total_price || '';
              }

              includesItems.appendChild(includeFragment);
            }
          });

          // Show the toggle button if it exists
          const toggleButton = element.querySelector('.product-includes-toggle');
          if (toggleButton) {
            toggleButton.style.display = '';
          }
        } else {
          // Hide the includes container if no valid products
          includesContainer.style.display = 'none';
          includesContainer.classList.remove('visible');

          // Also hide the toggle button if it exists
          const toggleButton = element.querySelector('.product-includes-toggle');
          if (toggleButton) {
            toggleButton.style.display = 'none';
          }
        }
      }
    }

    // Handle additional notes - THIS IS YOUR EXISTING CODE
    if (data.additional_notes && Array.isArray(data.additional_notes)) {
      const notesContainer = element.querySelector('.notes-container');
      const notesItems = element.querySelector('.product-notes-items');

      if (notesContainer && notesItems) {
        // Clear any previous notes first
        notesItems.innerHTML = '';

        // Filter out empty notes
        const validNotes = data.additional_notes.filter(note => {
          // Check if the note has text content
          return note && (note.note_text || note.text) &&
            (note.note_text || note.text).trim() !== '';
        });

        if (validNotes.length > 0) {
          // Ensure notes container is visible
          notesContainer.style.display = 'block';
          notesContainer.classList.add('visible');

          // Render each valid note
          validNotes.forEach((note) => {
            // Use template to create note element
            if (this.getTemplate('note-item-template')) {
              // Create a clone of the template
              const noteFragment = this.create('note-item-template', {});

              // Find the note-text element and explicitly set its content
              const noteTextElement = noteFragment.querySelector('.note-text');
              if (noteTextElement) {
                noteTextElement.textContent = note.note_text || note.text || '';
              }

              // Append the fragment to the notes container
              notesItems.appendChild(noteFragment);
            }
          });
        } else {
          // Hide the notes container if no valid notes
          notesContainer.style.display = 'none';
          notesContainer.classList.remove('visible');

          // Also hide the toggle button if it exists
          const toggleButton = element.querySelector('.product-notes-toggle');
          if (toggleButton) {
            toggleButton.style.display = 'none';
          }
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

   debugNoteData(element, data) {
    console.log('Note data processing:', {
      hasNotes: !!(data.additional_notes && Array.isArray(data.additional_notes)),
      notesCount: data.additional_notes ? data.additional_notes.length : 0,
      notesContainer: element.querySelector('.notes-container') ? 'found' : 'missing',
      notesItems: element.querySelector('.product-notes-items') ? 'found' : 'missing',
      noteTemplate: this.getTemplate('note-item-template') ? 'found' : 'missing',
      firstNote: data.additional_notes && data.additional_notes.length > 0 ? data.additional_notes[0] : null
    });
  }

  // Add to TemplateEngine.js
  verifyTemplates() {
    console.group('Template Verification');

    console.log('Registered templates:', Object.keys(this.templates));
    console.log('Template elements:', Object.keys(this.templateElements));

    // Check note template specifically
    if (this.templates['note-item-template']) {
      console.log('Note template HTML:', this.templates['note-item-template'].substring(0, 100) + '...');
    } else {
      console.warn('Note template not registered!');
    }

    // Check if template element exists
    if (this.templateElements['note-item-template']) {
      console.log('Note template element exists');
    } else {
      console.warn('Note template element not created!');
    }

    console.groupEnd();
  }

}

// Export a singleton instance
export default new TemplateEngine();
