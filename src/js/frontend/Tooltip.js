/**
 * Tooltip component for displaying context-sensitive help text and rich content
 * @class Tooltip
 */
import { format } from '@utils';

export default class Tooltip {
  /**
   * Create a tooltip instance
   * @param {object} templateEngine - TemplateEngine instance
   */
  constructor(templateEngine) {
    this.templateEngine = templateEngine;
    this.activeTooltips = new Map();
    this.activeRichTooltips = new Map();
    this.initStyles();
  }

  /**
   * Initialize tooltip system
   */
  init() {
    try {
      // Delegate tooltip events for dynamic content
      document.addEventListener('mouseenter', this.handleMouseEnter.bind(this), true);
      document.addEventListener('mouseleave', this.handleMouseLeave.bind(this), true);
      document.addEventListener('focusin', this.handleFocusIn.bind(this), true);
      document.addEventListener('focusout', this.handleFocusOut.bind(this), true);
      document.addEventListener('click', this.handleClick.bind(this), true);
      
      // Close tooltips on scroll
      window.addEventListener('scroll', this.handleScroll.bind(this), true);
    } catch (error) {
      console.error('Error initializing tooltip system:', error);
    }
  }

  /**
   * Initialize styles for tooltip positioning
   */
  initStyles() {
    if (!document.getElementById('pe-tooltip-styles')) {
      const style = document.createElement('style');
      style.id = 'pe-tooltip-styles';
      style.textContent = `
        .pe-tooltip {
          position: absolute;
          z-index: 1000000;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.2s ease-in-out, visibility 0.2s ease-in-out;
          pointer-events: none;
        }
        
        .pe-tooltip.visible {
          opacity: 1;
          visibility: visible;
        }
        
        .pe-tooltip.pe-tooltip-rich {
          pointer-events: all;
        }
        
        .pe-tooltip-arrow {
          position: absolute;
          width: 0;
          height: 0;
          border-style: solid;
        }
      `;
      document.head.appendChild(style);
    }
  }

  /**
   * Handle mouse enter event
   * @param {Event} event - Mouse enter event
   */
  handleMouseEnter(event) {
    // Ensure we have a valid element
    const target = event.target;
    if (!target || typeof target.closest !== 'function') return;
    
    const trigger = target.closest('[data-tooltip]:not([data-tooltip-type="rich"])');
    if (trigger) {
      this.showTooltip(trigger);
    }
  }

  /**
   * Handle mouse leave event
   * @param {Event} event - Mouse leave event
   */
  handleMouseLeave(event) {
    // Ensure we have a valid element
    const target = event.target;
    if (!target || typeof target.closest !== 'function') return;
    
    const trigger = target.closest('[data-tooltip]:not([data-tooltip-type="rich"])');
    if (trigger && (!event.relatedTarget || typeof event.relatedTarget.closest !== 'function' || !event.relatedTarget.closest('.pe-tooltip'))) {
      this.hideTooltip(trigger);
    }
  }

  /**
   * Handle focus in event
   * @param {Event} event - Focus in event
   */
  handleFocusIn(event) {
    // Ensure we have a valid element
    const target = event.target;
    if (!target || typeof target.closest !== 'function') return;
    
    const trigger = target.closest('[data-tooltip]:not([data-tooltip-type="rich"])');
    if (trigger) {
      this.showTooltip(trigger);
    }
  }

  /**
   * Handle focus out event
   * @param {Event} event - Focus out event
   */
  handleFocusOut(event) {
    // Ensure we have a valid element
    const target = event.target;
    if (!target || typeof target.closest !== 'function') return;
    
    const trigger = target.closest('[data-tooltip]:not([data-tooltip-type="rich"])');
    if (trigger && (!event.relatedTarget || typeof event.relatedTarget.closest !== 'function' || !event.relatedTarget.closest('.pe-tooltip'))) {
      this.hideTooltip(trigger);
    }
  }

  /**
   * Handle click event for rich tooltips
   * @param {Event} event - Click event
   */
  handleClick(event) {
    // Ensure we have a valid element
    const target = event.target;
    if (!target || typeof target.closest !== 'function') return;
    
    const trigger = target.closest('[data-tooltip-type="rich"]');
    if (trigger) {
      event.preventDefault();
      this.toggleRichTooltip(trigger);
    }
    
    // Handle close button in rich tooltips
    const closeButton = target.closest('.pe-tooltip-close');
    if (closeButton) {
      const tooltip = closeButton.closest('.pe-tooltip-rich');
      const matchingTrigger = Array.from(this.activeRichTooltips.entries())
        .find(([key, value]) => value === tooltip)?.[0];
      if (matchingTrigger) {
        this.hideRichTooltip(matchingTrigger);
      }
    }
    
    // Close rich tooltips when clicking outside
    if (!target.closest('.pe-tooltip-rich') && !trigger) {
      this.activeRichTooltips.forEach((tooltip, triggerElement) => {
        this.hideRichTooltip(triggerElement);
      });
    }
  }

  /**
   * Handle scroll event to close all tooltips
   * @param {Event} event - Scroll event
   */
  handleScroll(event) {
    // Close all regular tooltips
    this.activeTooltips.forEach((tooltip, trigger) => {
      this.hideTooltip(trigger);
    });
    
    // Close all rich tooltips
    this.activeRichTooltips.forEach((tooltip, trigger) => {
      this.hideRichTooltip(trigger);
    });
  }

  /**
   * Show tooltip for a trigger element
   * @param {HTMLElement} trigger - Element that triggers the tooltip
   */
  showTooltip(trigger) {
    const text = trigger.getAttribute('data-tooltip');
    const position = trigger.getAttribute('data-tooltip-position') || 'top';
    
    if (!text) return;

    // Create tooltip if it doesn't exist
    let tooltip = this.activeTooltips.get(trigger);
    if (!tooltip) {
      tooltip = this.createTooltip(text, position);
      if (!tooltip) {
        console.error('Failed to create tooltip');
        return;
      }
      this.activeTooltips.set(trigger, tooltip);
    }

    // Position and show the tooltip
    this.positionTooltip(tooltip, trigger, position);
    
    // Add to DOM if not already there
    if (!document.body.contains(tooltip)) {
      document.body.appendChild(tooltip);
    }
    
    // Force reflow and show
    tooltip.offsetHeight; // Force reflow
    tooltip.classList.add('visible');
  }

  /**
   * Hide tooltip for a trigger element
   * @param {HTMLElement} trigger - Element that triggers the tooltip
   */
  hideTooltip(trigger) {
    const tooltip = this.activeTooltips.get(trigger);
    if (tooltip) {
      tooltip.classList.remove('visible');
      
      // Remove after transition
      setTimeout(() => {
        if (tooltip.parentNode) {
          tooltip.parentNode.removeChild(tooltip);
        }
        this.activeTooltips.delete(trigger);
      }, 200);
    }
  }

  /**
   * Toggle rich tooltip for a trigger element
   * @param {HTMLElement} trigger - Element that triggers the rich tooltip
   */
  toggleRichTooltip(trigger) {
    const tooltip = this.activeRichTooltips.get(trigger);
    if (tooltip) {
      this.hideRichTooltip(trigger);
    } else {
      this.showRichTooltip(trigger);
    }
  }

  /**
   * Show rich tooltip for a trigger element
   * @param {HTMLElement} trigger - Element that triggers the rich tooltip
   */
  showRichTooltip(trigger) {
    const position = trigger.getAttribute('data-tooltip-position') || 'right';
    const data = this.getRichTooltipData(trigger);
    
    // Create rich tooltip if it doesn't exist
    let tooltip = this.activeRichTooltips.get(trigger);
    if (!tooltip) {
      tooltip = this.createRichTooltip(data, position);
      if (!tooltip) {
        console.error('Failed to create rich tooltip');
        return;
      }
      this.activeRichTooltips.set(trigger, tooltip);
    }

    // Position and show the tooltip
    this.positionTooltip(tooltip, trigger, position, true);
    
    // Add to DOM if not already there
    if (!document.body.contains(tooltip)) {
      document.body.appendChild(tooltip);
    }
    
    // Force reflow and show
    tooltip.offsetHeight; // Force reflow
    tooltip.classList.add('visible');
  }

  /**
   * Hide rich tooltip for a trigger element
   * @param {HTMLElement} trigger - Element that triggers the rich tooltip
   */
  hideRichTooltip(trigger) {
    const tooltip = this.activeRichTooltips.get(trigger);
    if (tooltip) {
      tooltip.classList.remove('visible');
      
      // Remove after transition
      setTimeout(() => {
        if (tooltip.parentNode) {
          tooltip.parentNode.removeChild(tooltip);
        }
        this.activeRichTooltips.delete(trigger);
      }, 200);
    }
  }

  /**
   * Create a tooltip element
   * @param {string} text - Tooltip text
   * @param {string} position - Tooltip position
   * @returns {HTMLElement|null} Tooltip element
   */
  createTooltip(text, position) {
    try {
      const fragment = this.templateEngine.create('tooltip', {
        content: text
      });
      
      const tooltip = fragment.querySelector('.pe-tooltip');
      if (!tooltip) {
        console.error('Tooltip element not found in template');
        return null;
      }
      
      tooltip.className = `pe-tooltip pe-tooltip-${position}`;
      
      // Update content
      const content = tooltip.querySelector('.pe-tooltip-content');
      if (content) {
        content.textContent = text;
      }
      
      return tooltip;
    } catch (error) {
      console.error('Error creating tooltip:', error);
      return null;
    }
  }

  /**
   * Create a rich tooltip element
   * @param {object} data - Tooltip data
   * @param {string} position - Tooltip position
   * @returns {HTMLElement|null} Tooltip element
   */
  createRichTooltip(data, position) {
    try {
      // Create the template with empty data first
      const fragment = this.templateEngine.create('tooltip-rich', {});
      
      const tooltip = fragment.querySelector('.pe-tooltip');
      if (!tooltip) {
        console.error('Rich tooltip element not found in template');
        return null;
      }
      
      // Manually populate the content elements
      const titleElement = tooltip.querySelector('.pe-tooltip-title');
      const notesElement = tooltip.querySelector('.pe-tooltip-notes-content');
      const detailsElement = tooltip.querySelector('.pe-tooltip-details-content');
      
      if (titleElement) titleElement.textContent = data.title || 'Product Information';
      
      if (notesElement) {
        // Format notes using the note-item template
        if (data.notes && data.notes !== 'No additional notes available') {
          // Clear the container
          notesElement.innerHTML = '';
          
          // Split notes by newlines and render each one using the template
          const notes = data.notes.split('\n\n');
          notes.forEach(noteText => {
            if (noteText.trim()) {
              // Create note item from template
              const noteFragment = this.templateEngine.create('note-item-template', {
                'note-text': noteText
              });
              
              // Update text manually since template might not populate correctly
              const noteTextElement = noteFragment.querySelector('.note-text');
              if (noteTextElement) {
                noteTextElement.textContent = noteText;
              }
              
              // Remove extra margins and stylings for tooltip context
              const noteItem = noteFragment.querySelector('.note-item');
              if (noteItem) {
                noteItem.style.margin = '0';
                noteItem.style.padding = '8px 0';
                noteItem.style.border = 'none';
              }
              
              notesElement.appendChild(noteFragment);
            }
          });
        } else {
          notesElement.textContent = 'No notes available';
        }
      }
      
      if (detailsElement) {
        // Format details with line breaks preserved
        if (data.details && data.details !== 'No additional details available') {
          detailsElement.innerHTML = data.details.replace(/\n/g, '<br>');
        } else {
          detailsElement.textContent = 'No details available';
        }
      }
      
      console.log('[Tooltip] Populated rich tooltip:', {
        title: titleElement?.textContent,
        notes: notesElement?.textContent,
        details: detailsElement?.textContent
      });
      
      tooltip.className = `pe-tooltip pe-tooltip-rich pe-tooltip-${position}`;
      
      return tooltip;
    } catch (error) {
      console.error('Error creating rich tooltip:', error);
      return null;
    }
  }

  /**
   * Get rich tooltip data from trigger element
   * @param {HTMLElement} trigger - Trigger element
   * @returns {object} Tooltip data
   */
  getRichTooltipData(trigger) {
    const data = {
      title: trigger.getAttribute('data-tooltip-title') || 'Product Information',
      notes: '',
      details: ''
    };
    
    // Try to get product data from the parent product container
    const includeItem = trigger.closest('.include-item');
    if (includeItem) {
      // Get the product ID from the include item
      const productId = includeItem.getAttribute('data-product-id');
      
      // Get the product name from the displayed element
      const productName = includeItem.querySelector('.include-item-name')?.textContent;
      if (productName) {
        data.title = productName.trim();
      }
      
      console.log('[Tooltip] Looking for product data:', { 
        productId, 
        productName: data.title,
        includeItem 
      });
      
      // For includes/notes we need to get the product data from room
      const roomItem = includeItem.closest('.room-item');
      if (roomItem) {
        const roomId = roomItem.getAttribute('data-room-id');
        const estimateId = roomItem.getAttribute('data-estimate-id');
        
        console.log('[Tooltip] Found room context:', { roomId, estimateId });
        
        // Access data from localStorage
        const storedData = localStorage.getItem('productEstimatorEstimateData');
        if (storedData) {
          try {
            const parsedData = JSON.parse(storedData);
            const estimate = parsedData?.estimates?.[estimateId];
            if (estimate?.rooms?.[roomId]) {
              const room = estimate.rooms[roomId];
              
              console.log('[Tooltip] Room data:', room);
              console.log('[Tooltip] Looking for product with ID:', productId);
              
              // Get the product data by ID
              if (productId && room.products?.[productId]) {
                const product = room.products[productId];
                
                console.log('[Tooltip] Found product:', product);
                
                // Check for additional_notes
                if (product.additional_notes) {
                  const notes = Object.values(product.additional_notes)
                    .filter(note => note.type === 'note')
                    .map(note => note.note_text)
                    .filter(text => text && text.trim());
                  
                  console.log('[Tooltip] Found notes:', notes);
                  
                  if (notes.length > 0) {
                    data.notes = notes.join('\n\n');
                  }
                }
                
                // Check for additional_products information
                if (product.additional_products) {
                  const additionalInfo = Object.values(product.additional_products)
                    .map(prod => `${prod.name}${prod.min_price > 0 ? ` - ${format.currency(prod.min_price)}` : ' (included)'}`)
                    .filter(text => text && text.trim());
                  
                  console.log('[Tooltip] Found additional products:', additionalInfo);
                  
                  if (additionalInfo.length > 0) {
                    data.details = 'Additional Products:\n' + additionalInfo.join('\n');
                  }
                }
              } else {
                console.log('[Tooltip] Product not found in room.products');
              }
            } else {
              console.log('[Tooltip] Room not found in estimate');
            }
          } catch (error) {
            console.error('[Tooltip] Error parsing localStorage data:', error);
          }
        } else {
          console.log('[Tooltip] No productEstimatorEstimateData in localStorage');
        }
        
        // Fallback to default messages if no data found
        if (!data.notes) {
          data.notes = 'No additional notes available';
        }
        if (!data.details) {
          data.details = 'No additional details available';
        }
      } else {
        console.log('[Tooltip] No room-item found');
      }
    } else {
      console.log('[Tooltip] No include-item found');
    }
    
    // Allow custom data attributes to override
    const notesContent = trigger.getAttribute('data-tooltip-notes');
    const detailsContent = trigger.getAttribute('data-tooltip-details');
    
    if (notesContent) data.notes = notesContent;
    if (detailsContent) data.details = detailsContent;
    
    return data;
  }

  /**
   * Position tooltip relative to trigger element
   * @param {HTMLElement} tooltip - Tooltip element
   * @param {HTMLElement} trigger - Trigger element
   * @param {string} position - Desired position
   * @param {boolean} isRich - Whether it's a rich tooltip
   */
  positionTooltip(tooltip, trigger, position, isRich = false) {
    const triggerRect = trigger.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    const gap = isRich ? 12 : 8; // Larger gap for rich tooltips
    const arrowSize = 8;
    
    let top = 0;
    let left = 0;
    
    // Calculate position based on preference
    switch (position) {
      case 'top':
        top = triggerRect.top - tooltipRect.height - gap;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'bottom':
        top = triggerRect.bottom + gap;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.left - tooltipRect.width - gap;
        break;
      case 'right':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.right + gap;
        break;
    }
    
    // Adjust for viewport boundaries
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };
    
    // Ensure tooltip doesn't go off screen
    if (left < 0) left = gap;
    if (left + tooltipRect.width > viewport.width) left = viewport.width - tooltipRect.width - gap;
    if (top < 0) top = gap;
    if (top + tooltipRect.height > viewport.height) top = viewport.height - tooltipRect.height - gap;
    
    // Apply positioning - with absolute position, we need scroll offsets
    tooltip.style.top = `${top + window.scrollY}px`;
    tooltip.style.left = `${left + window.scrollX}px`;
    
    // Position the arrow
    this.positionArrow(tooltip, trigger, position);
  }

  /**
   * Position the tooltip arrow
   * @param {HTMLElement} tooltip - Tooltip element
   * @param {HTMLElement} trigger - Trigger element
   * @param {string} position - Tooltip position
   */
  positionArrow(tooltip, trigger, position) {
    const arrow = tooltip.querySelector('.pe-tooltip-arrow');
    if (!arrow) return;
    
    const triggerRect = trigger.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    const arrowSize = 8;
    
    // Reset arrow styles
    arrow.style = '';
    
    switch (position) {
      case 'top':
        arrow.style.bottom = `-${arrowSize}px`;
        arrow.style.left = `${triggerRect.left - tooltipRect.left + triggerRect.width / 2 - arrowSize}px`;
        arrow.style.borderColor = 'transparent transparent transparent transparent';
        arrow.style.borderTopColor = '#333';
        arrow.style.borderWidth = `${arrowSize}px ${arrowSize}px 0 ${arrowSize}px`;
        break;
      case 'bottom':
        arrow.style.top = `-${arrowSize}px`;
        arrow.style.left = `${triggerRect.left - tooltipRect.left + triggerRect.width / 2 - arrowSize}px`;
        arrow.style.borderColor = 'transparent transparent transparent transparent';
        arrow.style.borderBottomColor = '#333';
        arrow.style.borderWidth = `0 ${arrowSize}px ${arrowSize}px ${arrowSize}px`;
        break;
      case 'left':
        arrow.style.right = `-${arrowSize}px`;
        arrow.style.top = `${triggerRect.top - tooltipRect.top + triggerRect.height / 2 - arrowSize}px`;
        arrow.style.borderColor = 'transparent transparent transparent transparent';
        arrow.style.borderLeftColor = '#333';
        arrow.style.borderWidth = `${arrowSize}px 0 ${arrowSize}px ${arrowSize}px`;
        break;
      case 'right':
        arrow.style.left = `-${arrowSize}px`;
        arrow.style.top = `${triggerRect.top - tooltipRect.top + triggerRect.height / 2 - arrowSize}px`;
        arrow.style.borderColor = 'transparent transparent transparent transparent';
        arrow.style.borderRightColor = '#333';
        arrow.style.borderWidth = `${arrowSize}px ${arrowSize}px ${arrowSize}px 0`;
        break;
    }
  }

  /**
   * Add tooltip to an element dynamically
   * @param {HTMLElement} element - Element to add tooltip to
   * @param {string | object} content - Tooltip text or data object for rich tooltips
   * @param {object} options - Tooltip options
   */
  addTooltip(element, content, options = {}) {
    const {
      position = 'top',
      type = 'simple',
      notes = null,
      details = null,
      title = null
    } = options;
    
    if (type === 'rich') {
      element.setAttribute('data-tooltip-type', 'rich');
      if (title) element.setAttribute('data-tooltip-title', title);
      if (notes) element.setAttribute('data-tooltip-notes', notes);
      if (details) element.setAttribute('data-tooltip-details', details);
    } else {
      element.setAttribute('data-tooltip', content);
    }
    
    element.setAttribute('data-tooltip-position', position);
  }

  /**
   * Remove tooltip from an element
   * @param {HTMLElement} element - Element to remove tooltip from
   */
  removeTooltip(element) {
    element.removeAttribute('data-tooltip');
    element.removeAttribute('data-tooltip-position');
    element.removeAttribute('data-tooltip-type');
    element.removeAttribute('data-tooltip-title');
    element.removeAttribute('data-tooltip-notes');
    element.removeAttribute('data-tooltip-details');
    this.hideTooltip(element);
    this.hideRichTooltip(element);
  }

  /**
   * Update tooltip content for an element
   * @param {HTMLElement} element - Element with tooltip
   * @param {string | object} content - New tooltip content
   */
  updateTooltip(element, content) {
    if (typeof content === 'string') {
      element.setAttribute('data-tooltip', content);
      
      // Update active tooltip if it exists
      const tooltip = this.activeTooltips.get(element);
      if (tooltip) {
        const tooltipContent = tooltip.querySelector('.pe-tooltip-content');
        if (tooltipContent) {
          tooltipContent.textContent = content;
        }
      }
    } else {
      // Update rich tooltip data
      if (content.title) element.setAttribute('data-tooltip-title', content.title);
      if (content.notes) element.setAttribute('data-tooltip-notes', content.notes);
      if (content.details) element.setAttribute('data-tooltip-details', content.details);
      
      // Update active rich tooltip if it exists
      const tooltip = this.activeRichTooltips.get(element);
      if (tooltip) {
        // Re-render with new data
        const newTooltip = this.createRichTooltip(content, tooltip.className.match(/pe-tooltip-(\w+)/)?.[1] || 'right');
        tooltip.replaceWith(newTooltip);
        this.activeRichTooltips.set(element, newTooltip);
      }
    }
  }
}