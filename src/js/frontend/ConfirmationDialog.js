/**
 * ConfirmationDialog.js
 *
 * Custom confirmation dialog component for Product Estimator plugin.
 * Replaces browser's built-in confirm() with a styled dialog.
 */

class ConfirmationDialog {
  /**
   * Initialize the confirmation dialog
   */
  constructor() {
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

    if (productEstimatorVars && productEstimatorVars.debug) {
      console.log('[ConfirmationDialog] Initialized');
    }
  }

  /**
   * Updates to ConfirmationDialog.js to fix the z-index issue
   * Replace the relevant sections in your ConfirmationDialog.js file
   */

// In the createDialogElements method, add this code:
  createDialogElements() {
    // Create backdrop with higher z-index
    this.backdropElement = document.createElement('div');
    this.backdropElement.className = 'pe-dialog-backdrop';

    // Create dialog container with higher z-index
    this.dialog = document.createElement('div');
    this.dialog.className = 'pe-confirmation-dialog';
    this.dialog.setAttribute('role', 'dialog');
    this.dialog.setAttribute('aria-modal', 'true');

    // Create dialog content
    this.dialog.innerHTML = `
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
  `;

    // Important: Append to document.body AFTER removing any existing elements
    const existingBackdrop = document.querySelector('.pe-dialog-backdrop');
    const existingDialog = document.querySelector('.pe-confirmation-dialog');

    if (existingBackdrop) existingBackdrop.remove();
    if (existingDialog) existingDialog.remove();

    // Append fresh elements to body
    document.body.appendChild(this.backdropElement);
    document.body.appendChild(this.dialog);
  }

  /**
   * Bind events to dialog elements
   */
  bindEvents() {
    // Get elements
    const closeBtn = this.dialog.querySelector('.pe-dialog-close');
    const cancelBtn = this.dialog.querySelector('.pe-dialog-cancel');
    const confirmBtn = this.dialog.querySelector('.pe-dialog-confirm');

    // Close button - prevent event propagation
    closeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.hide();
      if (typeof this.callbacks.cancel === 'function') {
        this.callbacks.cancel();
      }
    });

    // Cancel button - prevent event propagation
    cancelBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.hide();
      if (typeof this.callbacks.cancel === 'function') {
        this.callbacks.cancel();
      }
    });

    // Confirm button - prevent event propagation
    confirmBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.hide();
      if (typeof this.callbacks.confirm === 'function') {
        this.callbacks.confirm();
      }
    });

    // Backdrop click - with better event handling
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

    // Prevent clicks inside dialog from propagating to modal
    this.dialog.addEventListener('click', (e) => {
      e.stopPropagation();
    });

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
  }

  show(options = {}) {
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
      showCancel: true  // New option to control cancel button visibility
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

    // Remove all type classes
    this.dialog.classList.remove('pe-dialog-type-product', 'pe-dialog-type-room', 'pe-dialog-type-estimate', 'pe-dialog-notification');

    [...this.dialog.classList].forEach(className => {
      if (/^pe-dialog-action-/.test(className)) {
        this.dialog.classList.remove(className);
      }
    });

    // Add type class if specified
    if (settings.type) {
      this.dialog.classList.add (`pe-dialog-type-${settings.type}`);
    }

    if(settings.action) {
      this.dialog.classList.add (`pe-dialog-action-${settings.action}`);
    }

    // Add notification class if it's a success notification
    if (!settings.showCancel && settings.type === 'estimate') {
      this.dialog.classList.add('pe-dialog-notification');
    }

    // Show the dialog - force it to the front
    if (this.backdropElement) this.backdropElement.style.display = 'block';
    if (this.dialog) this.dialog.style.display = 'block';

    // Add active class for animation
    if (this.dialog) this.dialog.classList.add('active');

    // Focus the appropriate button
    setTimeout(() => {
      const buttonToFocus = settings.showCancel ?
        this.dialog.querySelector('.pe-dialog-cancel') :
        this.dialog.querySelector('.pe-dialog-confirm');

      if (buttonToFocus) buttonToFocus.focus();
    }, 100);
  }

  /**
   * Hide the dialog
   */
  hide() {
    if (this.backdropElement) this.backdropElement.style.display = 'none';
    if (this.dialog) {
      this.dialog.classList.remove('active');
      this.dialog.style.display = 'none';
    }
  }


  /**
   * Check if dialog is visible
   * @return {boolean} Whether dialog is visible
   */
  isVisible() {
    return this.dialog && this.dialog.style.display === 'block';
  }

  /**
   * Log debug messages
   * @param {...any} args - Arguments to log
   */
  log(...args) {
    if (productEstimatorVars && productEstimatorVars.debug) {
      console.log('[ConfirmationDialog]', ...args);
    }
  }
}

// Export a singleton instance
export default new ConfirmationDialog();
