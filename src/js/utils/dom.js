/**
 * DOM utility functions for Product Estimator plugin
 *
 * Enhanced DOM manipulation utilities that combine the existing functionality
 * with additional helpers.
 */

import { createLogger } from './logger';
const logger = createLogger('UtilsDom');

/**
 * Create an element with attributes and children
 * @param {string} tag - Element tag name
 * @param {object} attributes - Element attributes
 * @param {Array|string} children - Child elements or text
 * @returns {HTMLElement} Created element
 */
export function createElement(tag, attributes = {}, children = []) {
  const element = document.createElement(tag);

  // Set attributes
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === 'className') {
      element.className = value;
    } else if (key === 'dataset') {
      Object.entries(value).forEach(([dataKey, dataValue]) => {
        element.dataset[dataKey] = dataValue;
      });
    } else if (key === 'style' && typeof value === 'object') {
      Object.entries(value).forEach(([prop, val]) => {
        element.style[prop] = val;
      });
    } else {
      element.setAttribute(key, value);
    }
  });

  // Add children
  if (typeof children === 'string') {
    element.textContent = children;
  } else if (Array.isArray(children)) {
    children.forEach(child => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else if (child instanceof Node) {
        element.appendChild(child);
      }
    });
  }

  return element;
}

/**
 * Create a HTML element from HTML string
 * @param {string} html - HTML string
 * @returns {HTMLElement} Created element
 */
export function createElementFromHTML(html) {
  const div = document.createElement('div');
  div.innerHTML = html.trim();
  return div.firstChild;
}

/**
 * Find the closest ancestor matching a selector
 * @param {HTMLElement} element - Element to start from
 * @param {string} selector - CSS selector
 * @returns {HTMLElement|null} Matching ancestor or null
 */
export function closest(element, selector) {
  if (element.closest) {
    return element.closest(selector);
  }

  // Polyfill for older browsers
  let current = element;
  while (current && current !== document) {
    if (current.matches(selector)) {
      return current;
    }
    current = current.parentElement;
  }
  return null;
}

/**
 * Toggle element visibility
 * @param {HTMLElement} element - Element to toggle
 * @param {boolean} [show] - Whether to show or hide (if not provided, toggles current state)
 * @returns {boolean} New visibility state
 */
export function toggleVisibility(element, show) {
  if (!element) return false;

  // If show parameter not provided, toggle based on current state
  const newState = show !== undefined ? show : element.style.display === 'none';

  element.style.display = newState ? '' : 'none';

  return newState;
}

/**
 * Force element visibility using multiple techniques
 * @param {HTMLElement} element - Element to make visible
 * @returns {HTMLElement|null} The element for chaining or null if not found
 */
export function forceElementVisibility(element) {
  if (!element) {
    logger.error('Cannot show null element');
    return null;
  }

  // 1. Apply inline styles with !important to override any CSS rules
  element.style.cssText += 'display: block !important; visibility: visible !important; opacity: 1 !important; height: auto !important;';

  // 2. Remove any hiding classes
  ['hidden', 'hide', 'invisible', 'd-none', 'display-none'].forEach(cls => {
    if (element.classList.contains(cls)) {
      element.classList.remove(cls);
    }
  });

  // 3. Add visible classes (some frameworks use these)
  element.classList.add('visible', 'd-block');

  // 4. Ensure parent elements are also visible
  let parent = element.parentElement;
  const checkedParents = new Set(); // Prevent infinite loops

  while (parent && parent !== document.body && !checkedParents.has(parent)) {
    checkedParents.add(parent);

    const parentStyle = window.getComputedStyle(parent);
    if (parentStyle.display === 'none') {
      parent.style.cssText += 'display: block !important;';
    }
    parent = parent.parentElement;
  }

  // 5. Use jQuery as a fallback if available
  if (typeof jQuery !== 'undefined') {
    jQuery(element).show();
  }

  return element;
}

/**
 * Find parent element by selector
 * @param {HTMLElement} element - Element to start search from
 * @param {string} selector - CSS selector to match
 * @returns {HTMLElement|null} The matching parent or null
 */
export function findParentBySelector(element, selector) {
  return closest(element, selector);
}

/**
 * Insert element after a reference element
 * @param {HTMLElement} newElement - Element to insert
 * @param {HTMLElement} referenceElement - Element to insert after
 * @returns {HTMLElement} The inserted element
 */
export function insertAfter(newElement, referenceElement) {
  if (!referenceElement || !referenceElement.parentNode) {
    throw new Error('Reference element must be in the DOM');
  }

  referenceElement.parentNode.insertBefore(newElement, referenceElement.nextSibling);
  return newElement;
}

/**
 * Remove element from DOM with optional animation
 * @param {HTMLElement} element - Element to remove
 * @param {boolean} animate - Whether to animate the removal
 * @returns {Promise} Promise that resolves when removal is complete
 */
export function removeElement(element, animate = false) {
  if (!element) return Promise.resolve();

  if (!animate || !element.parentNode) {
    // Remove immediately if no animation or no parent
    if (element.parentNode) {
      element.parentNode.removeChild(element);
    }
    return Promise.resolve();
  }

  // With animation
  return new Promise(resolve => {
    // First fade out
    element.style.transition = 'opacity 0.3s ease';
    element.style.opacity = '0';

    // Then remove after animation completes
    setTimeout(() => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
      resolve();
    }, 300);
  });
}

/**
 * Add event listener that only fires once
 * @param {HTMLElement} element - Element to add listener to
 * @param {string} eventType - Event type (e.g., 'click')
 * @param {Function} handler - Event handler
 * @param {boolean} useCapture - Whether to use capture phase
 */
export function addEventListenerOnce(element, eventType, handler, useCapture = false) {
  if (!element) return;

  const wrappedHandler = (e) => {
    // Remove the event listener
    element.removeEventListener(eventType, wrappedHandler, useCapture);
    // Call the original handler
    handler(e);
  };

  element.addEventListener(eventType, wrappedHandler, useCapture);
}
