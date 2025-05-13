/**
 * Validation utilities for Product Estimator plugin
 *
 * Functions for validating inputs and displaying error messages.
 */

/**
 * Validates an email address
 * @param {string} email - Email address to validate
 * @returns {boolean} - Whether the email is valid
 */
export function validateEmail(email) {
  if (!email) return false;

  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

/**
 * Validates a number within specified bounds
 * @param {number|string} value - Number to validate
 * @param {object} options - Validation options
 * @param {number} [options.min] - Minimum allowed value
 * @param {number} [options.max] - Maximum allowed value
 * @param {boolean} [options.integer] - Whether the value must be an integer
 * @returns {boolean} Whether the number is valid
 */
export function validateNumber(value, options = {}) {
  const { min, max, integer = false } = options;

  // Convert to number if string
  const num = typeof value === 'string' ? parseFloat(value) : value;

  // Check if it's a valid number
  if (isNaN(num)) {
    return false;
  }

  // Check if it's an integer when required
  if (integer && !Number.isInteger(num)) {
    return false;
  }

  // Check bounds
  if (min !== undefined && num < min) {
    return false;
  }

  if (max !== undefined && num > max) {
    return false;
  }

  return true;
}

/**
 * Validates that a value is not empty
 * @param {*} value - Value to check
 * @returns {boolean} Whether the value is not empty
 */
export function validateRequired(value) {
  if (value === undefined || value === null) {
    return false;
  }

  if (typeof value === 'string') {
    return value.trim() !== '';
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return true;
}

/**
 * Show field error
 * @param {jQuery|HTMLElement} field - Field element
 * @param {string} message - Error message
 */
export function showFieldError(field, message) {
  const $ = jQuery;

  if (!field) return;

  // Handle both jQuery object and DOM element
  const $field = field instanceof jQuery ? field : $(field);

  // Clear any existing error first
  clearFieldError($field);

  // Create error element
  const $error = $(`<span class="field-error">${message}</span>`);

  // Add it after the field
  $field.after($error);
  $field.addClass('error');
}

/**
 * Clear field error
 * @param {jQuery|HTMLElement} field - Field element
 */
export function clearFieldError(field) {
  const $ = jQuery;

  if (!field) return;

  // Handle both jQuery object and DOM element
  const $field = field instanceof jQuery ? field : $(field);

  $field.next('.field-error').remove();
  $field.removeClass('error');
}

/**
 * Shows an admin notice
 * @param {string} message - Notice message
 * @param {string} type - Notice type (success/error)
 * @param {number} duration - Duration in ms before auto-dismissing
 */
export function showNotice(message, type = 'success', duration = 5000) {
  const $ = jQuery;

  if (!$) {
    // Fallback if jQuery not available
    alert(message);
    return;
  }

  const $notice = $(`<div class="notice notice-${type} is-dismissible"><p>${message}</p></div>`);

  // Try to find a good location to show the notice
  const $targetLocations = [
    $('.wrap h1'),  // Admin page headers
    $('.product-estimator-form-container'),  // Our form containers
    $('#wpbody-content') // WordPress admin content area
  ];

  let $target = null;

  // Find the first available target
  for (let i = 0; i < $targetLocations.length; i++) {
    if ($targetLocations[i].length) {
      $target = $targetLocations[i];
      break;
    }
  }

  if ($target) {
    $target.after($notice);
  } else {
    // Fallback - just prepend to body
    $('body').prepend($notice);
  }

  // Initialize WordPress dismissible notices
  if (window.wp && window.wp.notices) {
    window.wp.notices.init();
  } else {
    // Add close button manually if wp.notices is not available
    const $closeButton = $('<button type="button" class="notice-dismiss"><span class="screen-reader-text">Dismiss this notice.</span></button>');
    $notice.append($closeButton);

    $closeButton.on('click', function() {
      $notice.fadeOut(100, function() {
        $notice.remove();
      });
    });
  }

  // Auto-dismiss after specified duration
  setTimeout(() => {
    $notice.fadeOut(500, () => $notice.remove());
  }, duration);
}

/**
 * Validates a form by checking all specified fields
 * @param {HTMLFormElement|jQuery} form - Form to validate
 * @param {object} validators - Map of field selectors to validator functions
 * @returns {boolean} Whether the form is valid
 */
export function validateForm(form, validators) {
  const $ = jQuery;

  // Get jQuery object for the form
  const $form = form instanceof jQuery ? form : $(form);

  let isValid = true;

  // Process each validation rule
  Object.entries(validators).forEach(([selector, validator]) => {
    const $field = $form.find(selector);

    if (!$field.length) return;

    // Get the field value
    const value = $field.val();

    // Run the validator function, which should return { valid: boolean, message: string }
    const result = validator(value, $field);

    if (!result.valid) {
      showFieldError($field, result.message);
      isValid = false;
    } else {
      clearFieldError($field);
    }
  });

  return isValid;
}
