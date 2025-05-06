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
  init() {
    if (this.initialized) {
      console.log('[TemplateEngine.init] Already initialized.'); // Added context
      return this;
    }

    console.log('[TemplateEngine.init] Initializing TemplateEngine. Templates to process:', Object.keys(this.templates)); // Added context

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
          console.log(`[TemplateEngine.init] Template element found in HTML for ID: "${id}"`); // Added context
        } else {
          console.error(`[TemplateEngine.init] UNEXPECTED: templateElement was null/undefined for ID: "${id}". Creating nested template. Original HTML likely already contained a <template> tag.`);

          // Create a new template element if the HTML string didn't contain <template> tags
          const newTemplate = document.createElement('template');
          newTemplate.id = id; // Set the ID on the template element itself
          newTemplate.innerHTML = html; // Put the raw HTML inside the template tag
          this.templateElements[id] = newTemplate;
          console.log(`[TemplateEngine.init] Created new template element for ID: "${id}" (HTML was likely raw, not wrapped in <template>)`); // Added context
        }

        // *** Add this logging block to check template element content ***
        if (this.templateElements[id]) {
          const contentToCheck = this.templateElements[id].content || this.templateElements[id]; // Check .content first, then the element itself

          console.log(`[TemplateEngine.init] TemplateElement for "${id}" created. Inner HTML starts with:`, (contentToCheck?.innerHTML || 'No innerHTML or content').substring(0, 200) + '...'); // Added context

          // Specifically check if the room template contains .product-list
          if (id === 'room-item-template') {
            // Use a temporary div to query the content/innerHTML safely
            const queryTempDiv = document.createElement('div');
            if (contentToCheck?.innerHTML) {
              queryTempDiv.innerHTML = contentToCheck.innerHTML;
            } else {
              // If no innerHTML (e.g., just text nodes or complex structure), append children
              Array.from(contentToCheck?.childNodes || []).forEach(node => queryTempDiv.appendChild(node.cloneNode(true)));
            }
            console.log(`[TemplateEngine.init] Checking "${id}" content for .product-list:`, queryTempDiv.querySelector('.product-list') ? 'Found' : 'Not Found'); // Added context
            if (!queryTempDiv.querySelector('.product-list')) {
              console.error(`[TemplateEngine.init] CRITICAL: .product-list not found in "${id}" template element content after creation.`); // Critical error if missing
            }
          }
        } else {
          console.error(`[TemplateEngine.init] Failed to assign template element for ID: "${id}"`); // Added context
        }
        // *** End logging block ***

      } catch (error) {
        console.error(`[TemplateEngine.init] Error processing template HTML for ID "${id}":`, error); // Added context
        // Decide how to handle templates that fail to parse - maybe skip them?
      }
    });

    console.log(`[TemplateEngine.init] TemplateEngine initialized with ${Object.keys(this.templateElements).length} template elements`); // Added context
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
      console.warn(`[TemplateEngine.registerTemplate] Cannot register empty or non-string HTML for template "${id}".`); // Added context
      // Optionally throw an error or return early
      return this;
    }
    this.templates[id] = html;
    this.initialized = false; // Mark as needing reinitialization when a new template is added
    console.log(`[TemplateEngine.registerTemplate] Registered template "${id}". HTML starts with:`, html.substring(0, 200) + '...'); // Add this log
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
      console.warn('[TemplateEngine.getTemplate] TemplateEngine not initialized yet. Calling init().'); // Added context
      this.init();
    }
    // Check if template element exists after ensuring initialization
    const template = this.templateElements[id] || null;
    if (!template) {
      console.error(`[TemplateEngine.getTemplate] Template element not found for ID: "${id}".`); // Added context
    }
    return template;
  }

  /**
   * Create an element from a template and populate it with data
   * This method returns a DocumentFragment
   * @param {string} templateId - Template ID
   * @param {Object} data - Data to populate the template with
   * @returns {DocumentFragment} The populated template content
   */
  create(templateId, data = {}) {
    const template = this.getTemplate(templateId); // Retrieve the <template> element

    if (!template) {
      console.error(`[TemplateEngine.create] Cannot create element. Template element not found for ID: "${templateId}"`);
      return document.createDocumentFragment(); // Return empty fragment gracefully
    }

    // --- START: Add Detailed Debug Logs Here ---
    console.log(`[DEBUG][TemplateEngine.create] Found template element for "${templateId}":`, template);
    // Check if the template element itself has content if .content property seems problematic
    console.log(`[DEBUG][TemplateEngine.create] Template "${templateId}" direct innerHTML (first 200 chars):`, template.innerHTML.substring(0, 200));

    if (template.content) {
      console.log(`[DEBUG][TemplateEngine.create] Template "${templateId}" has .content property:`, template.content);
      console.log(`[DEBUG][TemplateEngine.create] Template "${templateId}" .content.childNodes count:`, template.content.childNodes.length);

      // Log the node type and content of the first few children to see what's inside
      const childNodes = template.content.childNodes;
      for(let i=0; i < Math.min(childNodes.length, 3); i++) { // Log first 3 nodes
        const node = childNodes[i];
        // Check if textContent exists and has trim method before calling trim()
        const nodeTextContent = node.textContent ? node.textContent.trim().substring(0,50) : '[No textContent]';
        console.log(`[DEBUG][TemplateEngine.create] Node[${i}] type: ${node.nodeType}, name: ${node.nodeName}, text: ${nodeTextContent}...`);
      }

      const firstElement = template.content.firstElementChild;
      console.log(`[DEBUG][TemplateEngine.create] Template "${templateId}" .content.firstElementChild:`, firstElement);
    } else {
      console.error(`[DEBUG][TemplateEngine.create] CRITICAL: Template "${templateId}" DOES NOT HAVE a .content property!`);
    }
    // --- END: Add Detailed Debug Logs Here ---


    // Clone the template content (returns a DocumentFragment)
    // Use try-catch for cloning errors
    let clone;
    try {
      // Check if content exists before cloning
      if (!template.content) {
        console.error(`[TemplateEngine.create] Cannot clone template content for ID: "${templateId}" - .content is missing.`);
        return document.createDocumentFragment(); // Return empty fragment
      }

      clone = template.content.cloneNode(true); // Clone the actual content

      if (!clone) {
        console.error(`[TemplateEngine.create] Failed to clone template content for ID: "${templateId}". cloneNode returned null/undefined.`); // Updated log message
        return document.createDocumentFragment(); // Return empty fragment if cloning fails
      }
      console.log(`[TemplateEngine.create] Cloned template content for "${templateId}". Result is a DocumentFragment.`); // Added context

      // --- START: Log Cloned Fragment Structure ---
      const tempDiv = document.createElement('div');
      tempDiv.appendChild(clone.cloneNode(true)); // Append a clone of the clone to inspect without consuming it
      console.log(`[DEBUG][TemplateEngine.create] Cloned fragment structure for "${templateId}" (first 200 chars): ${tempDiv.innerHTML.substring(0, 200)}...`);
      // --- END: Log Cloned Fragment Structure ---

    } catch (error) {
      console.error(`[TemplateEngine.create] Error during template.content.cloneNode(true) for ID "${templateId}":`, error); // Updated log message
      return document.createDocumentFragment(); // Return empty fragment on cloning error
    }


    // Populate the template with data
    try { // Added try-catch for population errors
      this.populateElement(clone, data); //
      console.log(`[TemplateEngine.create] Populated fragment for "${templateId}".`); // Added context
    } catch (error) {
      console.error(`[TemplateEngine.create] Error populating fragment for ID "${templateId}":`, error); // Added context
      // Decide if you want to return the partially populated clone or an empty fragment on error
      // For now, we'll proceed with the potentially incomplete clone.
    }


    // *** Logging block to check the fragment content before returning (from your existing code) ***
    if (templateId === 'room-item-template') {
      // Query selector on a DocumentFragment works as expected
      const productListCheck = clone.querySelector('.product-list');
      console.log(`[TemplateEngine.create] Created fragment for "${templateId}". Checking for .product-list before returning:`, productListCheck ? 'Found' : 'Not Found'); // Add this log
      if (!productListCheck) {
        console.error(`[TemplateEngine.create] CRITICAL: .product-list not found in "${templateId}" fragment before returning. This fragment will not render products correctly.`); // Critical error if missing
        // Optionally log the fragment's innerHTML for inspection (can be verbose)
        // const tempDivForCheck = document.createElement('div'); tempDivForCheck.appendChild(clone.cloneNode(true)); console.log('Fragment innerHTML for check:', tempDivForCheck.innerHTML);
      }
    }
    // *** End logging block ***


    return clone; // Return the populated DocumentFragment
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

    // --- ADDED: Explicitly set data-replace-product-id on the replace button ---
    if (data.replace_product_id !== undefined) {
      const replaceButton = element.querySelector('.replace-product-in-room');
      if (replaceButton) {
        replaceButton.dataset.replaceProductId = data.replace_product_id;
        console.log(`TemplateEngine: Set data-replace-product-id on button to: ${data.replace_product_id}`);
      }
    }
    // --- END ADDED ---

    // --- ADDED: Explicitly set data-pricing-method on the replace button ---
    if (data.pricing_method !== undefined) {
      const replaceButton = element.querySelector('.replace-product-in-room');
      if (replaceButton) {
        replaceButton.dataset.pricingMethod = data.pricing_method;
        console.log(`TemplateEngine: Set data-pricing-method on button to: ${data.pricing_method}`);
      }
    }
    // --- END ADDED ---
  }



  /**
   * Create and insert an element into the DOM
   * @param {string} templateId - Template ID
   * @param {Object} data - Data to populate with
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
      console.error(`[TemplateEngine.insert] Container not found for template: "${templateId}"`); // Added context
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
        case 'replace':
          // To replace, we need the content of the fragment, not the fragment itself
          // This might need adjustment depending on expected behavior.
          // Standard replaceChild takes a node. Replacing with a fragment's content means looping.
          console.warn(`[TemplateEngine.insert] "replace" position used for template "${templateId}". Replacing container with fragment's children.`); // Added context
          const fragmentChildren = Array.from(element.childNodes); // Get children before fragment is consumed
          container.parentNode.replaceChild(element, container); // This inserts the fragment, effectively replacing the container with its children
          // Note: The original container is replaced by the fragment. If you need a reference to the new element,
          // this becomes complex as a fragment can have multiple top-level children.
          // Returning the fragment itself might be the most reliable if the caller expects multiple nodes.
          break;
        case 'append':
        default:
          container.appendChild(element); // element is a DocumentFragment
          break;
      }
      console.log(`[TemplateEngine.insert] Inserted template "${templateId}" into container. Position: ${position}`); // Added context

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
      console.error(`[TemplateEngine.insert] Error inserting template "${templateId}" into container. Position: ${position}`, error); // Added context
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
