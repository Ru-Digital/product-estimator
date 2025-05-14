/**
 * ConfirmationDialog.js
 *
 * Custom confirmation dialog component for Product Estimator plugin.
 * Replaces browser's built-in confirm() with a styled dialog.
 * Uses TemplateEngine to load template from HTML file.
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

    // Initialize the dialog elements
    this.init();
  }

  /**
   * Initialize and create dialog DOM elements
   */
  init() {
    // Don't initialize more than once
    if (this.initialized) return;

    // Create dialog elements
    this.createDialogElements();

    // Bind events
    this.bindEvents();

    this.initialized = true;
    logger.log('ConfirmationDialog initialized');
  }

  /**
   * Create dialog DOM elements using TemplateEngine
   */
  createDialogElements() {
    logger.log('Creating dialog elements using TemplateEngine');
    
    // Create a container element to hold our template
    this.dialogContainer = document.createElement('div');
    this.dialogContainer.id = 'confirmation-dialog-container';
    
    // Use TemplateEngine to load the template
    const templateLoaded = TemplateEngine.insert('confirmation-dialog-template', {}, this.dialogContainer);
    
    if (!templateLoaded) {
      logger.error('Failed to load confirmation-dialog-template');
      
      // Create a fallback dialog
      this.dialogContainer.innerHTML = `
        <div class="pe-dialog-backdrop">
          <div class="pe-confirmation-dialog" role="dialog" aria-modal="true">
            <div class="dialog-content">
              <div class="pe-dialog-header">
                <h3 class="pe-dialog-title">Confirm Action</h3>
                <button type="button" class="pe-dialog-close" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="pe-dialog-body">
                <p class="pe-dialog-message">Are you sure you want to proceed?</p>
              </div>
              <div class="pe-dialog-footer">
                <button type="button" class="pe-dialog-btn pe-dialog-cancel">Cancel</button>
                <button type="button" class="pe-dialog-btn pe-dialog-confirm">Confirm</button>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    // Get references to the backdrop and dialog elements
    this.backdropElement = this.dialogContainer.querySelector('.pe-dialog-backdrop');
    this.dialog = this.dialogContainer.querySelector('.pe-confirmation-dialog');

    // Add styles for visibility
    if (this.backdropElement) {
      this.backdropElement.style.position = 'fixed';
      this.backdropElement.style.top = '0';
      this.backdropElement.style.left = '0';
      this.backdropElement.style.right = '0';
      this.backdropElement.style.bottom = '0';
      this.backdropElement.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
      this.backdropElement.style.zIndex = '999999';
      this.backdropElement.style.display = 'none';
    }

    if (this.dialog) {
      this.dialog.style.position = 'fixed';
      this.dialog.style.top = '50%';
      this.dialog.style.left = '50%';
      this.dialog.style.transform = 'translate(-50%, -50%)';
      this.dialog.style.zIndex = '1000000';
    }

    // Remove any existing dialog elements
    const existingContainer = document.getElementById('confirmation-dialog-container');
    if (existingContainer) existingContainer.remove();

    // Append the container to the body
    document.body.appendChild(this.dialogContainer);
    
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
    }

    // Backdrop click
    if (this.backdropElement) {
      this.backdropElement.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.target === this.backdropElement) {
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

    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isVisible()) {
        e.preventDefault();
        e.stopPropagation();
        this.hide();
        if (typeof this.callbacks.cancel === 'function') {
          this.callbacks.cancel();
        }
      }
    });

    logger.log('Events bound to dialog elements');
  }

  /**
   * Show the dialog with the specified options
   * @param {Object} options - Configuration options for the dialog
   */
  show(options = {}) {
    logger.log('Showing dialog with options:', options);
    
    // Add a fallback alert if our dialog fails
    const fallbackAlert = () => {
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
    };
    
    if (!this.dialog || !this.backdropElement) {
      logger.error('Cannot show dialog: elements not found');
      fallbackAlert();
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

    if (titleEl) titleEl.textContent = settings.title;
    if (messageEl) messageEl.textContent = settings.message;
    if (confirmEl) confirmEl.textContent = settings.confirmText;

    // Handle cancel button visibility
    if (cancelEl) {
      if (settings.showCancel) {
        cancelEl.style.display = '';
        cancelEl.textContent = settings.cancelText;
      } else {
        cancelEl.style.display = 'none';

        // When cancel button is hidden, make confirm button full width
        if (confirmEl) {
          confirmEl.style.width = '100%';
        }
      }
    }

    // Set classes for type and action
    if (this.dialog) {
      // Remove previous type and action classes
      this.dialog.classList.remove(
        'pe-dialog-type-product', 
        'pe-dialog-type-room', 
        'pe-dialog-type-estimate', 
        'pe-dialog-notification'
      );

      // Remove all action classes
      [...this.dialog.classList].forEach(className => {
        if (/^pe-dialog-action-/.test(className)) {
          this.dialog.classList.remove(className);
        }
      });

      // Add type class if specified
      if (settings.type) {
        this.dialog.classList.add(`pe-dialog-type-${settings.type}`);
      }

      // Add action class if specified
      if (settings.action) {
        this.dialog.classList.add(`pe-dialog-action-${settings.action}`);
      }

      // Add notification class for success notifications
      if (!settings.showCancel && settings.type === 'estimate') {
        this.dialog.classList.add('pe-dialog-notification');
      }
    }

    // Make elements visible with !important flags
    if (this.backdropElement) {
      this.backdropElement.setAttribute('style', 
        'position: fixed !important; ' +
        'top: 0 !important; ' +
        'left: 0 !important; ' +
        'right: 0 !important; ' +
        'bottom: 0 !important; ' +
        'background-color: rgba(0, 0, 0, 0.6) !important; ' +
        'display: block !important; ' +
        'opacity: 1 !important; ' +
        'visibility: visible !important; ' +
        'z-index: 9999999 !important;'
      );
    }
    
    if (this.dialog) {
      this.dialog.setAttribute('style', 
        'position: fixed !important; ' +
        'top: 50% !important; ' +
        'left: 50% !important; ' +
        'transform: translate(-50%, -50%) !important; ' +
        'display: block !important; ' +
        'opacity: 1 !important; ' +
        'visibility: visible !important; ' +
        'background-color: #fff !important; ' +
        'border-radius: 8px !important; ' +
        'box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3) !important; ' +
        'width: 450px !important; ' +
        'max-width: 90% !important; ' +
        'z-index: 10000000 !important;'
      );
      this.dialog.classList.add('active');
      
      // Add border to make it obvious
      this.dialog.style.border = '3px solid #00833f !important';
    }
    
    // Additional styling for dialog content elements to make them visible
    const dialogHeader = this.dialog.querySelector('.pe-dialog-header');
    if (dialogHeader) {
      dialogHeader.setAttribute('style', 
        'display: flex !important; ' +
        'justify-content: space-between !important; ' +
        'align-items: center !important; ' +
        'padding: 15px !important; ' +
        'background-color: #f3f3f3 !important; ' +
        'border-bottom: 1px solid #ddd !important;'
      );
    }
    
    const dialogBody = this.dialog.querySelector('.pe-dialog-body');
    if (dialogBody) {
      dialogBody.setAttribute('style', 
        'padding: 20px !important;'
      );
    }
    
    const dialogFooter = this.dialog.querySelector('.pe-dialog-footer');
    if (dialogFooter) {
      dialogFooter.setAttribute('style', 
        'display: flex !important; ' +
        'justify-content: flex-end !important; ' +
        'gap: 10px !important; ' +
        'padding: 15px !important; ' +
        'background-color: #f3f3f3 !important; ' +
        'border-top: 1px solid #ddd !important;'
      );
    }
    
    const confirmBtn = this.dialog.querySelector('.pe-dialog-confirm');
    if (confirmBtn) {
      confirmBtn.setAttribute('style', 
        'padding: 8px 16px !important; ' +
        'background-color: #00833f !important; ' +
        'color: white !important; ' +
        'border: none !important; ' +
        'border-radius: 4px !important; ' +
        'cursor: pointer !important;'
      );
    }
    
    const cancelBtn = this.dialog.querySelector('.pe-dialog-cancel');
    if (cancelBtn && settings.showCancel) {
      cancelBtn.setAttribute('style', 
        'padding: 8px 16px !important; ' +
        'background-color: #f3f3f3 !important; ' +
        'border: 1px solid #ddd !important; ' +
        'border-radius: 4px !important; ' +
        'cursor: pointer !important;'
      );
      cancelBtn.style.display = 'block !important';
    } else if (cancelBtn) {
      cancelBtn.style.display = 'none !important';
    }

    // Focus the appropriate button
    setTimeout(() => {
      const buttonToFocus = settings.showCancel && cancelEl ?
        cancelEl : confirmEl;

      if (buttonToFocus) buttonToFocus.focus();
    }, 100);

    logger.log('Dialog shown successfully');
  }

  /**
   * Hide the dialog
   */
  hide() {
    logger.log('Hiding dialog');
    
    if (this.backdropElement) {
      this.backdropElement.setAttribute('style', 
        'display: none !important; ' +
        'opacity: 0 !important; ' +
        'visibility: hidden !important;'
      );
    }
    
    if (this.dialog) {
      this.dialog.classList.remove('active');
      this.dialog.setAttribute('style', 
        'display: none !important; ' +
        'opacity: 0 !important; ' +
        'visibility: hidden !important;'
      );
    }
    
    logger.log('Dialog hidden');
  }

  /**
   * Check if dialog is visible
   * @returns {boolean} Whether dialog is visible
   */
  isVisible() {
    return this.dialog && this.backdropElement && 
           this.backdropElement.style.display === 'block';
  }
}

export default ConfirmationDialog;
