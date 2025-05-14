/**
 * ConfirmationDialog.js
 *
 * Custom confirmation dialog component for Product Estimator plugin.
 * Uses TemplateEngine with HTML templates for proper styling and UI consistency.
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
   *
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

      // Add hover effects
      cancelBtn.addEventListener('mouseover', () => {
        cancelBtn.style.backgroundColor = '#e0e0e0 !important';
      });
      cancelBtn.addEventListener('mouseout', () => {
        cancelBtn.style.backgroundColor = '#f0f0f0 !important';
      });
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

      // Add hover effects
      confirmBtn.addEventListener('mouseover', () => {
        confirmBtn.style.backgroundColor = '#006a32 !important';
      });
      confirmBtn.addEventListener('mouseout', () => {
        confirmBtn.style.backgroundColor = '#00833f !important';
      });
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
    logger.log('=========== DIALOG SHOW CALLED ===========');
    logger.log('Options:', JSON.stringify(options, null, 2));
    
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
      type: '', // product, room, estimate
      confirmText: i18n.confirm || 'Confirm',
      cancelText: i18n.cancel || 'Cancel',
      onConfirm: null,
      onCancel: null,
      action: 'delete',
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
        cancelEl.style.display = '';
        cancelEl.textContent = settings.cancelText;
        logger.log('Cancel button is visible with text:', cancelEl.textContent);
      } else {
        cancelEl.style.display = 'none';
        logger.log('Cancel button is hidden');

        // When cancel button is hidden, make confirm button full width
        if (confirmEl) {
          confirmEl.style.width = '100%';
        }
      }
    }

    // Prevent scrolling on the body while modal is active
    document.body.style.overflow = 'hidden';

    // Make dialog visible with explicit inline styles initially, 
    // then add visible class so CSS transitions can work
    if (this.backdropElement) {
      logger.log('Making backdrop visible with explicit style then visible class');
      
      // Ensure the backdrop is definitely visible with inline style
      this.backdropElement.style.display = 'flex';
      this.backdropElement.style.alignItems = 'center';
      this.backdropElement.style.justifyContent = 'center';
      
      // Then add the visible class for transitions
      this.backdropElement.classList.add('visible');
      logger.log('Backdrop classes after update:', this.backdropElement.className);
    }

    if (this.dialog) {
      logger.log('Making dialog visible with explicit style then visible class');
      
      // Ensure the dialog is definitely visible with inline style
      this.dialog.style.display = 'block';
      
      // Then add the visible class for transitions
      this.dialog.classList.add('visible');
      logger.log('Dialog classes after update:', this.dialog.className);
      
      // Ensure dialog is positioned correctly
      this.dialog.style.position = 'fixed';
      this.dialog.style.top = '50%';
      this.dialog.style.left = '50%';
      this.dialog.style.transform = 'translate(-50%, -50%)';
      this.dialog.style.zIndex = '9999';
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
    
    // Hide dialog with explicit display none first to ensure it's hidden
    if (this.backdropElement) {
      logger.log('Setting backdrop display to none');
      this.backdropElement.style.display = 'none';
      this.backdropElement.classList.remove('visible');
    }
    
    if (this.dialog) {
      logger.log('Setting dialog display to none');
      this.dialog.style.display = 'none';
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
