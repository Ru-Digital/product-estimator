/**
 * DOM utility functions
 */

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
