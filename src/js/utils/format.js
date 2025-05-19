/**
 * Formatting utilities for Product Estimator plugin
 *
 * Functions for formatting different types of data.
 */

/**
 * Format a price with currency symbol
 * @param {number} amount - Amount to format
 * @param {string} currencySymbol - Currency symbol
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted price
 */
/**
 * Format a value as currency using the browser's Intl.NumberFormat
 * @param {number|string} amount - Amount to format
 * @param {string} locale - Locale string (e.g., 'en-US')
 * @param {string} currency - Currency code (e.g., 'USD')
 * @returns {string} Formatted currency string
 */
export function currency(amount, locale = 'en-US', currency = 'USD') {
  // Handle undefined or null amount
  if (amount === undefined || amount === null || isNaN(amount)) {
    amount = 0;
  }
  
  // Convert string to number if needed
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(numAmount);
}

/**
 *
 * @param amount
 * @param currencySymbol
 * @param decimals
 */
export function formatPrice(amount, currencySymbol = '$', decimals = 2) {
  // Handle undefined or null amount
  if (amount === undefined || amount === null) {
    return `${currencySymbol}0.00`;
  }

  // Convert to number if it's a string
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  // Check if it's a valid number
  if (isNaN(numAmount)) {
    return `${currencySymbol}0.00`;
  }

  return currencySymbol + numAmount.toFixed(decimals);
}

/**
 * Format a price range with currency symbol.
 * If min and max prices are the same, it shows a single price.
 * @param {number|string|null|undefined} minPrice - Minimum price
 * @param {number|string|null|undefined} maxPrice - Maximum price
 * @param {string} currencySymbol - Currency symbol
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted price range string
 */
export function formatPriceRange(minPrice, maxPrice, currencySymbol = '$', decimals = 2) {
  const numMinPrice = (minPrice === undefined || minPrice === null) ? 0 : (typeof minPrice === 'string' ? parseFloat(minPrice.replace(/[^0-9.-]+/g,"")) : minPrice);
  const numMaxPrice = (maxPrice === undefined || maxPrice === null) ? 0 : (typeof maxPrice === 'string' ? parseFloat(maxPrice.replace(/[^0-9.-]+/g,"")) : maxPrice);

  if (isNaN(numMinPrice) && isNaN(numMaxPrice)) {
    return `${formatPrice(0, currencySymbol, decimals)}`; // Or some other default like "N/A"
  }
  if (isNaN(numMinPrice)) {
    return formatPrice(numMaxPrice, currencySymbol, decimals);
  }
  if (isNaN(numMaxPrice)) {
    return formatPrice(numMinPrice, currencySymbol, decimals);
  }

  if (numMinPrice === numMaxPrice) {
    return formatPrice(numMinPrice, currencySymbol, decimals);
  }
  return `${formatPrice(numMinPrice, currencySymbol, decimals)} - ${formatPrice(numMaxPrice, currencySymbol, decimals)}`;
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
 * Throttle function execution
 * @param {Function} func - Function to throttle
 * @param {number} limit - Milliseconds to limit invocation
 * @returns {Function} Throttled function
 */
export function throttle(func, limit = 300) {
  let lastCall = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      return func.apply(this, args);
    }
  };
}

/**
 * Sanitize HTML to prevent XSS
 * @param {string} html - HTML string to sanitize
 * @returns {string} Sanitized HTML
 */
export function sanitizeHTML(html) {
  if (!html) return '';

  // Use a temporary element to sanitize the HTML
  const temp = document.createElement('div');
  temp.textContent = html;
  return temp.innerHTML;
}

/**
 * Format a date according to locale preferences
 * @param {Date|string} date - Date to format or ISO string
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date
 */
export function formatDate(date, options = {}) {
  // Default options
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };

  // Merge options
  const formatOptions = { ...defaultOptions, ...options };

  // Convert string to Date if needed
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  // Check if date is valid
  if (isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }

  // Format date according to locale
  return new Intl.DateTimeFormat(navigator.language, formatOptions).format(dateObj);
}

/**
 * Truncate text to a specific length with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @param {string} ellipsis - Ellipsis string
 * @returns {string} Truncated text
 */
export function truncateText(text, maxLength = 100, ellipsis = '...') {
  if (!text) return '';

  if (text.length <= maxLength) {
    return text;
  }

  return text.substring(0, maxLength - ellipsis.length) + ellipsis;
}

/**
 * Convert object to URL query string
 * @param {object} obj - Object to convert
 * @returns {string} URL query string (without leading ?)
 */
export function objectToQueryString(obj) {
  return Object.entries(obj)
    .filter(([_, value]) => value !== undefined && value !== null)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return value.map(val => `${encodeURIComponent(key)}=${encodeURIComponent(val)}`).join('&');
      }
      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    })
    .join('&');
}
