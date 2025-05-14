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
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      action: 'default',
      onConfirm: onConfirm,
      onCancel: onCancel
    });
  }

  /**
   * Initialize and create dialog DOM elements
   */
  init() {
    // Don't initialize more than once
    if (this.initialized) return;

    // Create dialog elements
    this.createDialogElements();

    this.initialized = true;
    logger.log('ConfirmationDialog initialized');
  }

  /**
   * Create dialog DOM elements using the TemplateEngine
   */
  createDialogElements() {
    logger.log('=========== CREATING DIALOG ELEMENTS ===========');

    // Check existing before creation
    const existingBeforeCreation = document.getElementById('confirmation-dialog-container');
    logger.log('Existing container before creation:', !!existingBeforeCreation);

    // Create a container element
    this.dialogContainer = document.createElement('div');
    this.dialogContainer.id = 'confirmation-dialog-container';

    logger.log('Dialog container created with id:', this.dialogContainer.id);

    // Create the dialog from template with empty content
    // We'll update the content after rendering
    logger.log('Creating dialog using TemplateEngine');
    const dialogFragment = TemplateEngine.create('confirmation-dialog-template', {});

    // Append the fragment to the container
    this.dialogContainer.appendChild(dialogFragment);

    // Get references to the backdrop and dialog elements
    this.backdropElement = this.dialogContainer.querySelector('.pe-dialog-backdrop');
    this.dialog = this.dialogContainer.querySelector('.pe-confirmation-dialog');

    logger.log('Element references:', {
      foundBackdrop: !!this.backdropElement,
      foundDialog: !!this.dialog
    });

    // Remove any existing dialog elements to avoid duplicates
    const existingContainer = document.getElementById('confirmation-dialog-container');
    if (existingContainer) {
      logger.log('Found existing container, removing it');
      existingContainer.remove();
    }

    // Append the container to the body
    logger.log('Appending dialog container to document body');
    document.body.appendChild(this.dialogContainer);

    // Verify it's in the DOM
    const containerInDOM = document.getElementById('confirmation-dialog-container');
    logger.log('Container found in DOM after append:', !!containerInDOM);

    // Bind events now that elements are in the DOM
    this.bindEvents();

    // Verify DOM structure
    const finalBackdrop = this.dialogContainer.querySelector('.pe-dialog-backdrop');
    const finalDialog = this.dialogContainer.querySelector('.pe-confirmation-dialog');

    logger.log('Final element check after binding:', {
      backdropInDOM: !!finalBackdrop,
      dialogInDOM: !!finalDialog
    });

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
        this.hide();
        if (typeof this.callbacks.confirm === 'function') {
          this.callbacks.confirm();
        }
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
    // Remove any existing dialog first
    this.hide();

    // Create new dialog elements
    logger.log('Creating fresh dialog elements');
    this.createDialogElements();

    logger.log('Dialog elements after creation:', {
      dialogContainer: !!this.dialogContainer,
      dialog: !!this.dialog,
      backdropElement: !!this.backdropElement
    });

    // If creation failed, use fallback
    if (!this.dialog || !this.backdropElement) {
      logger.error('Failed to create dialog elements');
      const message = options.message || 'Are you sure?';
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
      title: 'Confirm Action',
      message: 'Are you sure you want to proceed?',
      type: '', // product, room, estimate - entity type for context
      confirmText: i18n.confirm || 'Confirm',
      cancelText: i18n.cancel || 'Cancel',
      onConfirm: null,
      onCancel: null,
      action: 'default', // dialog type: 'default', 'success', 'warning', 'error', 'delete'
      showCancel: true  // Option to control cancel button visibility
    };

    // Merge options with defaults
    const settings = { ...defaults, ...options };
    logger.log('Final settings:', JSON.stringify(settings, null, 2));

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

    logger.log('Dialog elements for content update:', {
      titleElement: !!titleEl,
      messageElement: !!messageEl,
      confirmElement: !!confirmEl,
      cancelElement: !!cancelEl
    });

    // Important: Explicitly update text content with settings
    logger.log('Setting title to:', settings.title);
    logger.log('Setting message to:', settings.message);

    if (titleEl) {
      titleEl.textContent = settings.title;
      logger.log('After update, title element contains:', titleEl.textContent);
    }

    if (messageEl) {
      messageEl.textContent = settings.message;
      logger.log('After update, message element contains:', messageEl.textContent);
    }

    if (confirmEl) {
      confirmEl.textContent = settings.confirmText;
      logger.log('After update, confirm button text is:', confirmEl.textContent);
    }

    // Handle cancel button visibility
    if (cancelEl) {
      if (settings.showCancel) {
        cancelEl.classList.remove('hidden');
        cancelEl.textContent = settings.cancelText;
        logger.log('Cancel button is visible with text:', cancelEl.textContent);

        // When cancel is visible, ensure confirm button isn't full width
        if (confirmEl) {
          confirmEl.classList.remove('full-width');
        }
      } else {
        cancelEl.classList.add('hidden');
        logger.log('Cancel button is hidden');

        // When cancel button is hidden, make confirm button full width
        if (confirmEl) {
          confirmEl.classList.add('full-width');
        }
      }
    }

    // Prevent scrolling on the body while modal is active
    document.body.style.overflow = 'hidden';

    // Make backdrop visible with CSS classes
    if (this.backdropElement) {
      logger.log('Making backdrop visible with visible class');

      // Add the visible class for transitions
      this.backdropElement.classList.add('visible');
      logger.log('Backdrop classes after update:', this.backdropElement.className);
    }

    if (this.dialog) {
      logger.log('Making dialog visible with visible class');

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

      logger.log('Dialog classes after update:', this.dialog.className);
    }

    // Focus the appropriate button after a short delay
    setTimeout(() => {
      logger.log('Focusing button and confirming visibility');
      const buttonToFocus = settings.showCancel && cancelEl ?
        cancelEl : confirmEl;

      if (buttonToFocus) {
        buttonToFocus.focus();

        // Final check for visibility
        if (this.backdropElement) {
          logger.log('Final backdrop computed style:', window.getComputedStyle(this.backdropElement).display);
        }
        if (this.dialog) {
          logger.log('Final dialog computed style:', window.getComputedStyle(this.dialog).display);
        }
      }
    }, 100);

    logger.log('Dialog show sequence completed');
  }

  /**
   * Hide the dialog
   */
  hide() {
    logger.log('Hiding dialog');

    // Restore body scrolling
    document.body.style.overflow = '';

    // Check if dialog elements exist
    if (!this.dialogContainer) {
      logger.log('No dialog container to hide');
      return;
    }

    // Hide dialog by removing visible class
    if (this.backdropElement) {
      logger.log('Removing visible class from backdrop');
      this.backdropElement.classList.remove('visible');
    }

    if (this.dialog) {
      logger.log('Removing visible class from dialog');
      this.dialog.classList.remove('visible');
    }

    // Remove the dialog container from DOM immediately
    // Don't delay as we're recreating on each show() call
    if (this.dialogContainer) {
      logger.log('Removing dialog container from DOM');
      this.dialogContainer.remove();

      // Reset references
      this.dialogContainer = null;
      this.backdropElement = null;
      this.dialog = null;
    }

    logger.log('Dialog hidden and removed from DOM');
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
