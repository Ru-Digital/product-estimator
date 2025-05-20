/**
 * ConfirmationDialog.js
 *
 * Custom confirmation dialog component for Product Estimator plugin.
 * Uses TemplateEngine with HTML templates for proper styling and UI consistency.
 * 
 * Supports multiple dialog types through the 'action' parameter:
 * - default: Standard confirmation dialog (blue/primary styling)
 * - success: Success message dialog (green styling)
 * - warning: Warning message dialog (amber/orange styling)
 * - error: Error message dialog (red styling)
 * - delete: Deletion confirmation dialog (red styling)
 */

import { createLogger } from '@utils';
import { labelManager } from '@utils/labels';

import TemplateEngine from './TemplateEngine';

const logger = createLogger('ConfirmationDialog');

class ConfirmationDialog {
  /**
   * Initialize the confirmation dialog
   */
  constructor() {
    this.dialogContainer = null;
    this.dialog = null;
    this.backdropElement = null;
    this.initialized = false;
    this.callbacks = {
      confirm: null,
      cancel: null
    };

    // Don't create dialog elements immediately
    // Only mark as initialized
    this.initialized = true;
    logger.log('ConfirmationDialog constructor completed');
  }

  /**
   * Convenience method for simple confirmation dialogs
   * For backwards compatibility with window.productEstimator.dialog.confirm()
   * @param {string} title - The dialog title
   * @param {string} message - The confirmation message
   * @param {Function} onConfirm - Callback for confirmation
   * @param {Function} onCancel - Callback for cancellation
   */
  confirm(title, message, onConfirm, onCancel) {
    this.show({
      title: title,
      message: message,
      confirmText: labelManager.get('buttons.confirm', 'Confirm'),
      cancelText: labelManager.get('buttons.cancel', 'Cancel'),
      action: 'default',
      onConfirm: onConfirm,
      onCancel: onCancel
    });
  }

  /**
   * Initialize the dialog component
   * Note: createDialogElements is now called on demand in show()
   */
  init() {
    // Don't initialize more than once
    if (this.initialized) return;

    this.initialized = true;
    logger.log('ConfirmationDialog initialized');
  }

  /**
   * Create dialog DOM elements using the TemplateEngine
   */
  createDialogElements() {
    logger.log('Creating dialog elements');

    // Remove any existing dialog elements to avoid duplicates
    const existingContainer = document.getElementById('confirmation-dialog-container');
    if (existingContainer) {
      existingContainer.remove();
    }

    // Create the dialog container using TemplateEngine
    this.dialogContainer = document.createElement('div');
    this.dialogContainer.id = 'confirmation-dialog-container';
    
    // Insert the dialog template into the container
    TemplateEngine.insert('confirmation-dialog-template', {}, this.dialogContainer);

    // Get references to the backdrop and dialog elements
    this.backdropElement = this.dialogContainer.querySelector('.pe-dialog-backdrop');
    this.dialog = this.dialogContainer.querySelector('.pe-confirmation-dialog');

    // Append the container to the body
    document.body.appendChild(this.dialogContainer);

    // Bind events now that elements are in the DOM
    this.bindEvents();

    logger.log('Dialog elements created and appended to body');
  }

  /**
   * Bind events to dialog elements
   */
  bindEvents() {
    if (!this.dialog) {
      logger.error('Cannot bind events: dialog element not found');
      return;
    }

    logger.log('Binding events to dialog elements');

    // Get elements
    const closeBtn = this.dialog.querySelector('.pe-dialog-close');
    const cancelBtn = this.dialog.querySelector('.pe-dialog-cancel');
    const confirmBtn = this.dialog.querySelector('.pe-dialog-confirm');

    // Close button
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.hide();
        if (typeof this.callbacks.cancel === 'function') {
          this.callbacks.cancel();
        }
      });
    }

    // Cancel button
    if (cancelBtn) {
      cancelBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.hide();
        if (typeof this.callbacks.cancel === 'function') {
          this.callbacks.cancel();
        }
      });

      // Hover effects are handled by CSS classes
    }

    // Confirm button
    if (confirmBtn) {
      confirmBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (typeof this.callbacks.confirm === 'function') {
          // For form dialogs, check if the callback returns false to keep dialog open
          const result = this.callbacks.confirm();
          
          // If callback explicitly returns false or a promise that resolves to false,
          // keep the dialog open (for validation failures)
          if (result === false) {
            logger.log('Confirmation callback returned false, keeping dialog open');
            return;
          }
          
          // If it's a promise, wait for it
          if (result && typeof result.then === 'function') {
            result.then(shouldClose => {
              if (shouldClose !== false) {
                this.hide();
              }
            }).catch(error => {
              logger.error('Error in confirmation callback:', error);
              this.hide();
            });
            return;
          }
        }
        
        // Default behavior: hide the dialog
        this.hide();
      });

      // Hover effects are handled by CSS classes
    }

    // Backdrop click
    if (this.backdropElement) {
      this.backdropElement.addEventListener('click', (e) => {
        if (e.target === this.backdropElement) {
          e.preventDefault();
          e.stopPropagation();
          this.hide();
          if (typeof this.callbacks.cancel === 'function') {
            this.callbacks.cancel();
          }
        }
      });
    }

    // Prevent clicks inside dialog from propagating
    if (this.dialog) {
      this.dialog.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }

    // Escape key handler
    this.escKeyHandler = (e) => {
      if (e.key === 'Escape' && this.isVisible()) {
        e.preventDefault();
        e.stopPropagation();
        this.hide();
        if (typeof this.callbacks.cancel === 'function') {
          this.callbacks.cancel();
        }
      }
    };

    // Add ESC key listener
    document.addEventListener('keydown', this.escKeyHandler);

    logger.log('Events bound to dialog elements');
  }

  /**
   * Show the dialog with the specified options
   * @param {object} options - Configuration options for the dialog
   */
  show(options = {}) {
    // Always recreate the dialog to ensure it's fresh and properly configured
    this.hide();

    // Create new dialog elements
    this.createDialogElements();

    // If creation failed, use fallback
    if (!this.dialog || !this.backdropElement) {
      logger.error('Failed to create dialog elements');
      const message = options.message || labelManager.get('messages.confirm_proceed', 'Are you sure you want to proceed?');
      if (confirm(message)) {
        if (typeof options.onConfirm === 'function') {
          options.onConfirm();
        }
      } else {
        if (typeof options.onCancel === 'function') {
          options.onCancel();
        }
      }
      return;
    }

    // Get text from localized strings if available
    const i18n = window.productEstimatorVars?.i18n || {};

    const defaults = {
      title: labelManager.get('ui_elements.confirm_title', 'Confirm Action'),
      message: labelManager.get('messages.confirm_proceed', 'Are you sure you want to proceed?'),
      type: '', // product, room, estimate - entity type for context
      confirmText: labelManager.get('buttons.confirm', i18n.confirm || 'Confirm'),
      cancelText: labelManager.get('buttons.cancel', i18n.cancel || 'Cancel'),
      onConfirm: null,
      onCancel: null,
      action: 'default', // dialog type: 'default', 'success', 'warning', 'error', 'delete'
      showCancel: true  // Option to control cancel button visibility
    };

    // Merge options with defaults
    const settings = { ...defaults, ...options };

    // If cancelText is explicitly null/false, hide the cancel button
    if (options.cancelText === null || options.cancelText === false) {
      settings.showCancel = false;
    }

    // Set callbacks
    this.callbacks.confirm = settings.onConfirm;
    this.callbacks.cancel = settings.onCancel;

    // Update dialog content
    const titleEl = this.dialog.querySelector('.pe-dialog-title');
    const messageEl = this.dialog.querySelector('.pe-dialog-message');
    const confirmEl = this.dialog.querySelector('.pe-dialog-confirm');
    const cancelEl = this.dialog.querySelector('.pe-dialog-cancel');
    const buttonsContainer = this.dialog.querySelector('.pe-dialog-buttons');

    // Update text content with settings
    if (titleEl) {
      titleEl.textContent = settings.title;
    }

    // Get the dialog body element
    const bodyEl = this.dialog.querySelector('.pe-dialog-body');
    
    // Add or remove form-body class based on dialog type
    if (bodyEl) {
      if (settings.type === 'form' || settings.action === 'collect-details') {
        bodyEl.classList.add('form-body');
      } else {
        bodyEl.classList.remove('form-body');
      }
    }

    if (messageEl) {
      // Clear existing content
      messageEl.innerHTML = '';
      
      // Check if we have a form type dialog with template content
      if (settings.type === 'form' && settings.formFields) {
        // Create form container using template
        const formContainer = TemplateEngine.create('dialog-content-form-template', {
          instruction: settings.message || labelManager.get('ui_elements.form_instructions', 'Please fill out the following information:')
        });
        
        // Get the form fields container
        const fieldsContainer = formContainer.querySelector('.pe-dialog-form-fields');
        
        // Add each form field
        if (fieldsContainer && Array.isArray(settings.formFields)) {
          settings.formFields.forEach(field => {
            const fieldElement = TemplateEngine.create('dialog-form-field-template', field);
            // Append the first child of the template (the actual form group)
            if (fieldElement.firstElementChild) {
              fieldsContainer.appendChild(fieldElement.firstElementChild);
            }
          });
        }
        
        // Append the complete form to the message element
        messageEl.appendChild(formContainer);
      } else if (settings.type === 'contact-selection') {
        // Create contact selection dialog using template
        const selectionContainer = TemplateEngine.create('dialog-contact-selection-template', {
          message: settings.message || labelManager.get('messages.contact_selection', 'How would you like to be contacted?'),
          emailButtonText: settings.emailButtonText || labelManager.get('buttons.contact_email', 'Email'),
          phoneButtonText: settings.phoneButtonText || labelManager.get('buttons.contact_phone', 'Phone')
        });
        
        messageEl.appendChild(selectionContainer);
        
        // Set up click handlers for the choice buttons
        const emailBtn = messageEl.querySelector('.pe-dialog-email-choice');
        const phoneBtn = messageEl.querySelector('.pe-dialog-phone-choice');
        
        if (emailBtn && settings.onEmailChoice) {
          emailBtn.addEventListener('click', () => {
            settings.onEmailChoice();
            this.hide();
          });
        }
        
        if (phoneBtn && settings.onPhoneChoice) {
          phoneBtn.addEventListener('click', () => {
            settings.onPhoneChoice();
            this.hide();
          });
        }
      } else {
        // For non-form dialogs, just set the text content
        messageEl.textContent = settings.message || '';
      }
    }

    if (confirmEl) {
      confirmEl.textContent = settings.confirmText;
    }

    // Hide standard buttons for contact selection dialog
    const footerEl = this.dialog.querySelector('.pe-dialog-footer');
    if (settings.type === 'contact-selection') {
      // Hide footer entirely for contact selection
      if (footerEl) footerEl.style.display = 'none';
    } else {
      // Show footer for other dialog types
      if (footerEl) footerEl.style.display = '';
      
      // Handle cancel button visibility
      if (cancelEl) {
        if (settings.showCancel) {
          cancelEl.classList.remove('hidden');
          cancelEl.textContent = settings.cancelText;

          // When cancel is visible, ensure confirm button isn't full width
          if (confirmEl) {
            confirmEl.classList.remove('full-width');
          }
        } else {
          cancelEl.classList.add('hidden');

          // When cancel button is hidden, make confirm button full width
          if (confirmEl) {
            confirmEl.classList.add('full-width');
          }
        }
      }
    }
    
    // Handle additional buttons if provided
    if (settings.additionalButtons && buttonsContainer) {
      // Clear any existing additional buttons
      const existingAdditionalButtons = buttonsContainer.querySelectorAll('.pe-dialog-additional');
      existingAdditionalButtons.forEach(btn => btn.remove());
      
      // Add new additional buttons
      settings.additionalButtons.forEach((buttonConfig, index) => {
        const button = document.createElement('button');
        button.className = 'pe-button pe-button-secondary pe-dialog-additional';
        button.textContent = buttonConfig.text || `Button ${index + 1}`;
        
        // Set up click handler
        button.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.hide();
          if (typeof buttonConfig.callback === 'function') {
            buttonConfig.callback();
          }
        });
        
        // Insert the button after the cancel button or before confirm if no cancel
        if (cancelEl && settings.showCancel) {
          buttonsContainer.insertBefore(button, confirmEl);
        } else {
          buttonsContainer.insertBefore(button, confirmEl);
        }
      });
    }

    // Prevent scrolling on the body while modal is active
    document.body.style.overflow = 'hidden';

    // Make backdrop visible with CSS classes
    if (this.backdropElement) {
      this.backdropElement.classList.add('visible');
    }

    if (this.dialog) {
      // Add the visible class for transitions
      this.dialog.classList.add('visible');

      // Always apply an action-specific class for styling
      // Remove any existing action classes first
      this.dialog.classList.remove(
        'pe-dialog-action-default',
        'pe-dialog-action-delete',
        'pe-dialog-action-error',
        'pe-dialog-action-warning',
        'pe-dialog-action-success'
      );
      
      // Map certain actions to standard types for consistency
      let actionClass = settings.action || 'default';
      
      // Normalize action types for consistent styling
      if (actionClass === 'add') actionClass = 'success';
      if (actionClass === 'remove') actionClass = 'delete';
      
      // Add the specific action class
      this.dialog.classList.add(`pe-dialog-action-${actionClass}`);
    }

    // Focus the appropriate button after a short delay
    setTimeout(() => {
      const buttonToFocus = settings.showCancel && cancelEl ?
        cancelEl : confirmEl;

      if (buttonToFocus) {
        buttonToFocus.focus();
      }
    }, 100);
  }

  /**
   * Hide the dialog
   */
  hide() {
    // Restore body scrolling
    document.body.style.overflow = '';

    // Check if dialog elements exist
    if (!this.dialogContainer) {
      return;
    }

    // Hide dialog by removing visible class
    if (this.backdropElement) {
      this.backdropElement.classList.remove('visible');
    }

    if (this.dialog) {
      this.dialog.classList.remove('visible');
    }

    // Remove the dialog container from DOM immediately
    // Don't delay as we're recreating on each show() call
    if (this.dialogContainer) {
      this.dialogContainer.remove();

      // Reset references
      this.dialogContainer = null;
      this.backdropElement = null;
      this.dialog = null;
    }
  }

  /**
   * Check if dialog is visible
   * @returns {boolean} Whether dialog is visible
   */
  isVisible() {
    return this.dialog &&
           this.backdropElement &&
           this.backdropElement.classList.contains('visible');
  }
}

export default ConfirmationDialog;
