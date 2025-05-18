/**
 * TemplateEngine.js
 *
 * Manages HTML templates for the Product Estimator plugin.
 */
import { format, createLogger } from '@utils';
const logger = createLogger('TemplateEngine');

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
  init() {
    if (this.initialized) {
      logger.log('[init] Already initialized.'); // Added context
      return this;
    }

    logger.log('[init] Initializing TemplateEngine. Templates to process:', Object.keys(this.templates)); // Added context

    // Create template elements from registered HTML
    Object.entries(this.templates).forEach(([id, html]) => {
      try { // Added try-catch for parsing errors per template
        // Create a temporary div to hold the HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;

        // Extract the template content
        const templateElement = tempDiv.querySelector('template');

        if (templateElement) {
          this.templateElements[id] = templateElement;
          logger.log(`[init] Template element found in HTML for ID: "${id}"`); // Added context
        } else {
          logger.error(`[init] UNEXPECTED: templateElement was null/undefined for ID: "${id}". Creating nested template. Original HTML likely already contained a <template> tag.`);

          // Create a new template element if the HTML string didn't contain <template> tags
          const newTemplate = document.createElement('template');
          newTemplate.id = id; // Set the ID on the template element itself
          newTemplate.innerHTML = html; // Put the raw HTML inside the template tag
          this.templateElements[id] = newTemplate;
          logger.log(`[init] Created new template element for ID: "${id}" (HTML was likely raw, not wrapped in <template>)`); // Added context
        }

        // *** Add this logging block to check template element content ***
        if (this.templateElements[id]) {
          const contentToCheck = this.templateElements[id].content || this.templateElements[id]; // Check .content first, then the element itself

          logger.log(`[init] TemplateElement for "${id}" created. Inner HTML starts with:`, (contentToCheck?.innerHTML || 'No innerHTML or content').substring(0, 200) + '...'); // Added context

          // Product list check removed - products are now displayed directly in room template
        } else {
          logger.error(`[init] Failed to assign template element for ID: "${id}"`); // Added context
        }
        // *** End logging block ***

      } catch (error) {
        logger.error(`[init] Error processing template HTML for ID "${id}":`, error); // Added context
        // Decide how to handle templates that fail to parse - maybe skip them?
      }
    });

    logger.log(`[init] TemplateEngine initialized with ${Object.keys(this.templateElements).length} template elements`); // Added context
    this.initialized = true;

    // this.verifyTemplates(); // Your existing verification method is fine

    return this;
  }

  /**
   * Register a template with the engine
   * @param {string} id - Template ID
   * @param {string} html - Template HTML content
   * @returns {TemplateEngine} This instance for chaining
   */
  registerTemplate(id, html) {
    if (typeof html !== 'string' || html.trim() === '') {
      logger.warn(`[registerTemplate] Cannot register empty or non-string HTML for template "${id}".`); // Added context
      // Optionally throw an error or return early
      return this;
    }
    this.templates[id] = html;
    this.initialized = false; // Mark as needing reinitialization when a new template is added
    logger.log(`[registerTemplate] Registered template "${id}". HTML starts with:`, html.substring(0, 200) + '...'); // Add this log
    return this;
  }


  /**
   * Get a template by ID
   * @param {string} id - Template ID
   * @returns {HTMLTemplateElement|null} Template element or null if not found
   */
  getTemplate(id) {
    // Ensure initialization happens if needed
    if (!this.initialized) {
      logger.warn('[getTemplate] TemplateEngine not initialized yet. Calling init().'); // Added context
      this.init();
    }
    // Check if template element exists after ensuring initialization
    const template = this.templateElements[id] || null;
    if (!template) {
      logger.error(`[getTemplate] Template element not found for ID: "${id}".`); // Added context
    }
    return template;
  }

  /**
   * Create an element from a template and populate it with data
   * This method returns a DocumentFragment
   * @param {string} templateId - Template ID
   * @param {object} data - Data to populate the template with
   * @returns {DocumentFragment} The populated template content
   */
  create(templateId, data = {}) {
    const template = this.getTemplate(templateId); // Retrieve the <template> element

    if (!template) {
      logger.error(`[create] Cannot create element. Template element not found for ID: "${templateId}"`);
      return document.createDocumentFragment(); // Return empty fragment gracefully
    }

    // --- START: Add Detailed Debug Logs Here ---
    logger.log(`[DEBUG][TemplateEngine.create] Found template element for "${templateId}":`, template);
    // Check if the template element itself has content if .content property seems problematic
    logger.log(`[DEBUG][TemplateEngine.create] Template "${templateId}" direct innerHTML (first 200 chars):`, template.innerHTML.substring(0, 200));

    if (template.content) {
      logger.log(`[DEBUG][TemplateEngine.create] Template "${templateId}" has .content property:`, template.content);
      logger.log(`[DEBUG][TemplateEngine.create] Template "${templateId}" .content.childNodes count:`, template.content.childNodes.length);

      // Log the node type and content of the first few children to see what's inside
      const childNodes = template.content.childNodes;
      for(let i=0; i < Math.min(childNodes.length, 3); i++) { // Log first 3 nodes
        const node = childNodes[i];
        // Check if textContent exists and has trim method before calling trim()
        const nodeTextContent = node.textContent ? node.textContent.trim().substring(0,50) : '[No textContent]';
        logger.log(`[DEBUG][TemplateEngine.create] Node[${i}] type: ${node.nodeType}, name: ${node.nodeName}, text: ${nodeTextContent}...`);
      }

      const firstElement = template.content.firstElementChild;
      logger.log(`[DEBUG][TemplateEngine.create] Template "${templateId}" .content.firstElementChild:`, firstElement);
    } else {
      logger.error(`[DEBUG][TemplateEngine.create] CRITICAL: Template "${templateId}" DOES NOT HAVE a .content property!`);
    }
    // --- END: Add Detailed Debug Logs Here ---


    // Clone the template content (returns a DocumentFragment)
    // Use try-catch for cloning errors
    let clone;
    try {
      // Check if content exists before cloning
      if (!template.content) {
        logger.error(`[create] Cannot clone template content for ID: "${templateId}" - .content is missing.`);
        return document.createDocumentFragment(); // Return empty fragment
      }

      clone = template.content.cloneNode(true); // Clone the actual content

      if (!clone) {
        logger.error(`[create] Failed to clone template content for ID: "${templateId}". cloneNode returned null/undefined.`); // Updated log message
        return document.createDocumentFragment(); // Return empty fragment if cloning fails
      }
      logger.log(`[create] Cloned template content for "${templateId}". Result is a DocumentFragment.`); // Added context

      // --- START: Log Cloned Fragment Structure ---
      const tempDiv = document.createElement('div');
      tempDiv.appendChild(clone.cloneNode(true)); // Append a clone of the clone to inspect without consuming it
      logger.log(`[DEBUG][TemplateEngine.create] Cloned fragment structure for "${templateId}" (first 200 chars): ${tempDiv.innerHTML.substring(0, 200)}...`);
      // --- END: Log Cloned Fragment Structure ---

    } catch (error) {
      logger.error(`[create] Error during template.content.cloneNode(true) for ID "${templateId}":`, error); // Updated log message
      return document.createDocumentFragment(); // Return empty fragment on cloning error
    }


    // Populate the template with data
    try { // Added try-catch for population errors
      this.populateElement(clone, data); //
      logger.log(`[create] Populated fragment for "${templateId}".`); // Added context
    } catch (error) {
      logger.error(`[create] Error populating fragment for ID "${templateId}":`, error); // Added context
      // Decide if you want to return the partially populated clone or an empty fragment on error
      // For now, we'll proceed with the potentially incomplete clone.
    }


    // Product list check removed - products are now displayed directly in room template


    return clone; // Return the populated DocumentFragment
  }

  /**
   * Process a string with handlebars-style placeholders
   * @param {string} str - The string containing {{placeholders}}
   * @param {object} data - Data object with values to replace placeholders
   * @returns {string} - The processed string with placeholders replaced
   */
  processHandlebars(str, data) {
    if (!str || typeof str !== 'string') {
      return str;
    }
    
    return str.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] !== undefined ? data[key] : match;
    });
  }
  
  /**
   * Process all handlebars placeholders in an element and its children
   * @param {Element|DocumentFragment} element - The element to process
   * @param {object} data - Data object with values to replace placeholders
   * @private
   */
  _processElementHandlebars(element, data) {
    // Process all elements in the fragment
    const processNode = (node) => {
      // Skip non-element nodes (text nodes, comments, etc.)
      if (node.nodeType !== Node.ELEMENT_NODE) {
        return;
      }
      
      // Process attributes
      if (node.hasAttributes()) {
        Array.from(node.attributes).forEach(attr => {
          if (attr.value.includes('{{')) {
            attr.value = this.processHandlebars(attr.value, data);
          }
        });
      }
      
      // Process text content for elements without children
      if (node.childNodes.length === 1 && node.firstChild.nodeType === Node.TEXT_NODE) {
        const text = node.textContent;
        if (text.includes('{{')) {
          node.textContent = this.processHandlebars(text, data);
        }
      }
      
      // Process child elements recursively
      Array.from(node.childNodes).forEach(child => {
        processNode(child);
      });
    };
    
    // Start processing from the root element
    if (element.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
      // For document fragments, process all child nodes
      Array.from(element.childNodes).forEach(child => {
        processNode(child);
      });
    } else {
      // For regular elements, process the element itself
      processNode(element);
    }
    
    logger.log('[_processElementHandlebars] Processed handlebars placeholders in element');
  }
  
  /**
   * Populate an element with data
   * @param {Element|DocumentFragment} element - Element to populate
   * @param {object} data - Data to populate with
   */
  populateElement(element, data) {
    // Process handlebars placeholders in element attributes and text
    this._processElementHandlebars(element, data);
    
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

        // --- ADDED: Specific handling for similar item template classes ---
        if (key === 'name') {
          const nameElements = element.querySelectorAll('.suggestion-name');
          nameElements.forEach(el => { el.textContent = value; });
        }
        // The backend is sending min_price_total and max_price_total for the price range
        if (key === 'min_price_total' || key === 'max_price_total') {
          // We handle the price range display below, so no action needed here for individual min/max keys
        }
        if (key === 'image') {
          const imgElements = element.querySelectorAll('img.similar-product-thumbnail');
          imgElements.forEach(img => {
            img.src = value || 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='; // Fallback to a transparent pixel
            img.alt = data.name || 'Similar Product Image';
            // Show image and hide no-image placeholder if image exists
            const noImagePlaceholder = img.closest('.suggestion-image')?.querySelector('.no-image');
            if (value && value.trim() !== '') {
              img.style.display = ''; // Show image
              if(noImagePlaceholder) noImagePlaceholder.style.display = 'none'; // Hide placeholder
            } else {
              img.style.display = 'none'; // Hide image
              if(noImagePlaceholder) noImagePlaceholder.style.display = ''; // Show placeholder
            }
          });
        }
        // --- END ADDED ---
        
        // Handle primary product image for room items
        if (key === 'primary_product_image') {
          const primaryImgElements = element.querySelectorAll('img.primary-product-image');
          logger.log('Found primary-product-image elements:', primaryImgElements.length, 'with value:', value);
          primaryImgElements.forEach(img => {
            img.src = value || 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
            img.alt = 'Primary product';
            logger.log('Set image src to:', img.src);
          });
        }


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
        logger.log(`Setting removal button data attributes: estimate=${data.estimate_id}, room=${data.room_id}, product=${data.product_index}`);
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

    // Enhanced product ID handling
    if (data.id || data.product_id) {
      // Use either product_id or id (prefer product_id if both exist)
      const idToUse = data.product_id || data.id;
      
      // Find elements with data-product-id attribute
      const elementsWithProductId = element.querySelectorAll('[data-product-id]');
      elementsWithProductId.forEach(el => {
        el.setAttribute('data-product-id', idToUse);
      });

      // Also set on the main element if it's a product-related element
      if (element.classList) {
        const productRelatedClasses = ['product-item', 'similar-item', 'suggestion-item', 'include-item'];
        const isProductElement = productRelatedClasses.some(className => element.classList.contains(className));
        
        if (isProductElement) {
          element.setAttribute('data-product-id', idToUse);
        }
      }
      
      // Log successful product ID assignment for debugging
      logger.log(`Set data-product-id=${idToUse} on product element(s) in template`);
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

    // Enhanced image handling (general, might overlap with similar item specific handling)
    if (data.image) {
      const imgElements = element.querySelectorAll('img.product-thumbnail, img.product-img');
      imgElements.forEach(img => {
        img.src = data.image;
        img.alt = data.name || 'Product';
      });
    }

    // Handle price display (general, might overlap with similar item specific handling)
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

    // --- ADDED: Specific handling for similar item price range ---
    if (data.min_price_total !== undefined && data.max_price_total !== undefined) {
      const priceElements = element.querySelectorAll('.suggestion-price');
      priceElements.forEach(el => {
        if (data.min_price_total === data.max_price_total) {
          el.textContent = typeof format !== 'undefined' && format.formatPrice ? format.formatPrice(data.min_price_total) : data.min_price_total;
        } else {
          el.textContent = `${typeof format !== 'undefined' && format.formatPrice ? format.formatPrice(data.min_price_total) : data.min_price_total} - ${typeof format !== 'undefined' && format.formatPrice ? format.formatPrice(data.max_price_total) : data.max_price_total}`;
        }
      });
    }
    // --- END ADDED ---


    // Enhanced name display for products (general, might overlap with similar item specific handling)
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


    // Handle additional notes
    if (data.additional_notes) {
      const notesContainer = element.querySelector('.notes-container');
      const notesItems = element.querySelector('.product-notes-items');

      if (notesContainer && notesItems) {
        // Clear any previous notes first
        notesItems.innerHTML = '';

        // Handle both array and object formats of additional_notes
        let notesArray = [];
        
        if (Array.isArray(data.additional_notes)) {
          // Format is already an array
          notesArray = data.additional_notes;
        } else if (typeof data.additional_notes === 'object') {
          // Format is an object with keys, convert to array
          notesArray = Object.values(data.additional_notes);
        }

        // Filter out empty notes
        const validNotes = notesArray.filter(note => {
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
    
    // Handle similar products
    if (data.similar_products) {
      const similarProductsContainer = element.querySelector('.similar-products-container');
      const similarProductsList = element.querySelector('.similar-products-list');
      
      if (similarProductsContainer && similarProductsList) {
        // Clear any previous similar products first
        similarProductsList.innerHTML = '';
        
        // Handle both array and object formats of similar_products
        let productsArray = [];
        
        if (Array.isArray(data.similar_products)) {
          // Format is already an array
          productsArray = data.similar_products;
        } else if (typeof data.similar_products === 'object') {
          // Format is an object with keys, convert to array
          productsArray = Object.values(data.similar_products);
        }
        
        // Filter for valid similar products
        const validProducts = productsArray.filter(product => product && product.id);
        
        if (validProducts.length > 0) {
          // Add product ID to container for reference
          similarProductsContainer.dataset.productId = data.id || data.product_id || '';
          
          // Show toggle button if it exists
          const toggleButton = element.querySelector('.similar-products-toggle');
          if (toggleButton) {
            toggleButton.style.display = 'block';
          }
          
          // Render each similar product
          validProducts.forEach(product => {
            if (this.getTemplate('similar-product-item-template')) {
              // Create template data for the similar product
              const similarProductData = {
                id: product.id,
                product_id: product.id,
                name: product.name || 'Similar Product',
                image: product.image || '',
                min_price_total: product.min_price_total,
                max_price_total: product.max_price_total,
                pricing_method: product.pricing_method || 'sqm',
                // Data attributes for the replace button
                estimate_id: data.estimate_id || '',
                room_id: data.room_id || '',
                replace_product_id: data.id || data.product_id || ''
              };
              
              logger.log('Rendering similar product with data:', similarProductData);
              
              // Create the similar product element from template
              const similarFragment = this.create('similar-product-item-template', similarProductData);
              
              // Append the fragment to the similar products container
              similarProductsList.appendChild(similarFragment);
            }
          });
        } else {
          // Hide the container and toggle if no valid similar products
          const toggleButton = element.querySelector('.similar-products-toggle');
          if (toggleButton) {
            toggleButton.style.display = 'none';
          }
        }
      }
    }

    // --- ADDED: Explicitly set data-replace-product-id on the replace button ---
    if (data.replace_product_id !== undefined) {
      const replaceButton = element.querySelector('.replace-product-in-room');
      if (replaceButton) {
        replaceButton.dataset.replaceProductId = data.replace_product_id;
        logger.log(`TemplateEngine: Set data-replace-product-id on button to: ${data.replace_product_id}`);
      }
    }
    // --- END ADDED ---

    // --- ADDED: Explicitly set data-pricing-method on the replace button ---
    if (data.pricing_method !== undefined) {
      const replaceButton = element.querySelector('.replace-product-in-room');
      if (replaceButton) {
        replaceButton.dataset.pricingMethod = data.pricing_method;
        logger.log(`TemplateEngine: Set data-pricing-method on button to: ${data.pricing_method}`);
      }
    }
    // --- END ADDED ---
    
    // Handle visibility conditions based on data-visible-if attribute
    const visibleElements = element.querySelectorAll('[data-visible-if]');
    visibleElements.forEach(el => {
      const condition = el.getAttribute('data-visible-if');
      if (condition) {
        // Check if the condition is truthy in the data
        const isVisible = !!data[condition];
        if (!isVisible) {
          el.style.display = 'none';
        } else {
          // Make sure it's visible if condition is true
          el.style.display = '';
        }
      }
    });
  }



  /**
   * Create and insert an element into the DOM
   * @param {string} templateId - Template ID
   * @param {object} data - Data to populate with
   * @param {Element|string} container - Container element or selector
   * @param {string} position - Insert position ('append', 'prepend', 'before', 'after', 'replace')
   * @returns {Element|DocumentFragment|null} The inserted element(s) or null if container not found
   */
  insert(templateId, data, container, position = 'append') {
    const element = this.create(templateId, data); // element is a DocumentFragment

    if (typeof container === 'string') {
      container = document.querySelector(container);
    }

    if (!container) {
      logger.error(`[insert] Container not found for template: "${templateId}"`); // Added context
      // It might be useful to return the fragment even if the container isn't found,
      // in case the caller wants to handle appending it elsewhere.
      // Or just return null to indicate insertion failed. Let's return null for clarity of failure.
      return null;
    }

    try { // Added try-catch for insertion errors
      switch (position) {
        case 'prepend':
          container.prepend(element); // element is a DocumentFragment
          break;
        case 'before':
          // When inserting a fragment before/after, insert the fragment itself
          container.parentNode.insertBefore(element, container); // element is a DocumentFragment
          break;
        case 'after':
          // When inserting a fragment before/after, insert the fragment itself
          container.parentNode.insertBefore(element, container.nextSibling); // element is a DocumentFragment
          break;
        case 'replace': {
          // To replace, we need the content of the fragment, not the fragment itself
          // This might need adjustment depending on expected behavior.
          // Standard replaceChild takes a node. Replacing with a fragment's content means looping.
          logger.warn(`[insert] "replace" position used for template "${templateId}". Replacing container with fragment's children.`); // Added context
          // Get fragment's children before it's consumed (for debugging/reference purposes)
          // const fragmentChildren = Array.from(element.childNodes);
          container.parentNode.replaceChild(element, container); // This inserts the fragment, effectively replacing the container with its children
          // Note: The original container is replaced by the fragment. If you need a reference to the new element,
          // this becomes complex as a fragment can have multiple top-level children.
          // Returning the fragment itself might be the most reliable if the caller expects multiple nodes.
          break;
        }
        case 'append':
        default:
          container.appendChild(element); // element is a DocumentFragment
          break;
      }
      logger.log(`[insert] Inserted template "${templateId}" into container. Position: ${position}`); // Added context

      // When appending/prepending a fragment, its children are moved.
      // If the template content is guaranteed to have a single top-level element
      // (like <div class="accordion-item">...</div> for room-item-template),
      // we might try to find and return that specific element for the caller's convenience.
      // However, returning the fragment or null on failure is safer if templates can be varied.
      // Given loadEstimatesList expects roomElement to be the .accordion-item, let's find it.
      if (templateId === 'room-item-template' && position === 'append' && container) {
        // Find the element *within the container* that matches the top-level element of the template
        // This requires querying the container after the fragment is appended.
        // This is a potential point of failure if the query is too fast or the structure is unexpected.
        // For now, let's rely on the caller (loadEstimatesList) to query for the specific element after insert.
        // Returning the fragment itself is the standard DocumentFragment behavior return.
        return element; // Return the fragment
      }


      return element; // Return the fragment that was inserted (its children are now in the DOM)


    } catch (error) {
      logger.error(`[insert] Error inserting template "${templateId}" into container. Position: ${position}`, error); // Added context
      return null; // Return null on insertion error
    }
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

    // Message type determines which template would be used (if we used template-based approach)
    // For now, we're using direct DOM creation approach below

    // Find messages template container
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
  /**
   * Creates the modal container in the document body
   * @returns {HTMLElement|null} The created modal element or null if creation failed
   */
  createModalContainer() {
    logger.log('Creating modal container from template');
    
    try {
      // Check if modal container already exists
      const existingModal = document.querySelector('#product-estimator-modal');
      if (existingModal) {
        logger.log('Modal container already exists in DOM');
        return existingModal;
      }
      
      // Get the modal container template
      const modalTemplate = this.getTemplate('modal-container-template');
      if (!modalTemplate) {
        logger.error('Modal container template not found');
        return null;
      }
      
      // Add detailed debug logging for template creation
      logger.group('Debug: Template Creation');
      logger.log('Template id:', 'modal-container-template');
      logger.log('Template found:', !!modalTemplate);
      
      // Log template source
      logger.log('Template outerHTML:', modalTemplate.outerHTML);
      
      if (modalTemplate.content) {
        logger.log('Template has content property with:', modalTemplate.content.childNodes.length, 'child nodes');
        // Log the first few nodes
        Array.from(modalTemplate.content.childNodes).slice(0, 3).forEach((node, i) => {
          logger.log(`Node[${i}]:`, node.nodeType, node.nodeName);
        });
        
        // Check for specific elements in template content before creation
        const tempDiv = document.createElement('div');
        tempDiv.appendChild(modalTemplate.content.cloneNode(true));
        logger.log('Template content inner HTML:', tempDiv.innerHTML.substring(0, 500) + '...');
        
        // Check for specific elements
        logger.log('Template contains #estimates:', !!tempDiv.querySelector('#estimates'));
        logger.log('Template contains #estimate-selection-wrapper:', !!tempDiv.querySelector('#estimate-selection-wrapper'));
        logger.log('Template contains #room-selection-form-wrapper:', !!tempDiv.querySelector('#room-selection-form-wrapper'));
      }
      logger.groupEnd();
      
      // Create a fragment from the template
      const modalFragment = this.create('modal-container-template', {
        // Add i18n texts if needed
        title: window.productEstimatorVars?.i18n?.productEstimator || 'Product Estimator',
        close: window.productEstimatorVars?.i18n?.close || 'Close',
        loading: window.productEstimatorVars?.i18n?.loading || 'Loading...'
      });
      
      // Log the fragment content before adding to DOM
      if (modalFragment) {
        logger.log('Created fragment structure for modal:', modalFragment.childNodes.length, 'child nodes at root level');
        
        // Create temporary div to examine fragment content
        const tempFragDiv = document.createElement('div');
        tempFragDiv.appendChild(modalFragment.cloneNode(true));
        logger.log('Fragment content before appending to DOM:', tempFragDiv.innerHTML.substring(0, 300) + '...');
        
        // Check for specific elements in the fragment
        logger.log('Fragment contains #estimates:', !!tempFragDiv.querySelector('#estimates'));
        logger.log('Fragment contains form-container:', !!tempFragDiv.querySelector('.product-estimator-modal-form-container'));
      }
      
      // Append the fragment to the body
      document.body.appendChild(modalFragment);
      logger.log('Modal fragment appended to document body');
      
      // Get the modal element after it's been added to the DOM
      const modalElement = document.querySelector('#product-estimator-modal');
      
      // Add detailed logging about DOM after append
      logger.log('DOM after fragment append - modal found:', !!modalElement);
      
      // Add logging to verify all critical elements exist
      if (modalElement) {
        const elementsStatus = {
          modal: !!modalElement,
          container: !!modalElement.querySelector('.product-estimator-modal-container'),
          formContainer: !!modalElement.querySelector('.product-estimator-modal-form-container'),
          estimates: !!modalElement.querySelector('#estimates'),
          estimateSelection: !!modalElement.querySelector('#estimate-selection-wrapper'),
          roomSelection: !!modalElement.querySelector('#room-selection-form-wrapper'),
          newEstimate: !!modalElement.querySelector('#new-estimate-form-wrapper'),
          newRoom: !!modalElement.querySelector('#new-room-form-wrapper')
        };
        
        logger.log('Modal element created with child elements status:', elementsStatus);
        
        // Log element structure regardless
        logger.log('Modal HTML structure:', modalElement.outerHTML.substring(0, 500) + '...');
        
        // If any critical element is missing, log more details
        if (!elementsStatus.estimates) {
          logger.error('Critical element #estimates missing in created modal!');
          
          // Check if there's a content container
          const formContainer = modalElement.querySelector('.product-estimator-modal-form-container');
          if (formContainer) {
            logger.log('Form container exists but missing #estimates. Form container HTML:', 
                       formContainer.innerHTML);
          }
        }
      }
      
      if (!modalElement) {
        logger.error('Failed to find modal element after creating it');
        return null;
      }
      
      logger.log('Modal container created and added to DOM');
      return modalElement;
    } catch (error) {
      logger.error('Error creating modal container:', error);
      return null;
    }
  }
  
  debugTemplates() {
    logger.group('TemplateEngine Debug');
    logger.log('Registered template IDs:', Object.keys(this.templates));
    logger.log('Template elements:', Object.keys(this.templateElements));

    // Check each template
    Object.entries(this.templateElements).forEach(([id, template]) => {
      logger.log(`Template ${id}:`, template);

      // Check template content
      if (template.content) {
        logger.log(`- Has content: ${template.content.childNodes.length} child nodes`);
      } else {
        logger.warn(`- No content for template ${id}`);
      }
    });

    logger.groupEnd();
  }

   debugNoteData(element, data) {
    logger.log('Note data processing:', {
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
    logger.group('Template Verification');

    logger.log('Registered templates:', Object.keys(this.templates));
    logger.log('Template elements:', Object.keys(this.templateElements));

    // Check note template specifically
    if (this.templates['note-item-template']) {
      logger.log('Note template HTML:', this.templates['note-item-template'].substring(0, 100) + '...');
    } else {
      logger.warn('Note template not registered!');
    }

    // Check if template element exists
    if (this.templateElements['note-item-template']) {
      logger.log('Note template element exists');
    } else {
      logger.warn('Note template element not created!');
    }

    logger.groupEnd();
  }

}

// Export a singleton instance
export default new TemplateEngine();
