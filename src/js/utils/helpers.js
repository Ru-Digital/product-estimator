/**
 * Collection of helper utilities
 */

/**
 * Format a price with currency symbol
 * @param {number} amount - Amount to format
 * @param {string} currencySymbol - Currency symbol
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted price
 */
export function formatPrice(amount, currencySymbol = '$', decimals = 2) {
  return currencySymbol + amount.toFixed(decimals);
}

/**
 * Debounce function to limit how often a function can be called
 * @param {Function} func - Function to debounce
 * @param {number} wait - Milliseconds to wait
 * @returns {Function} Debounced function
 */
export function debounce(func, wait = 300) {
  let timeout;
  return function(...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}

/**
 * Sanitize HTML to prevent XSS
 * @param {string} html - HTML string to sanitize
 * @returns {string} Sanitized HTML
 */
export function sanitizeHTML(html) {
  const temp = document.createElement('div');
  temp.textContent = html;
  return temp.innerHTML;
}
