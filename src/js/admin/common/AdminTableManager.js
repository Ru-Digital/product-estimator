// File: admin/js/common/AdminTableManager.js

/**
 * AdminTableManager.js
 *
 * Base class for managing admin list tables with add/edit/delete functionality
 * driven by AJAX. It relies on a specific HTML structure and localized data
 * provided by the corresponding PHP settings module.
 */
import { ajax, dom, validation } from '@utils'; // Assuming @utils provides these
import { createLogger } from '@utils'; // Assuming this exists

class AdminTableManager {
  /**
   * Constructor for AdminTableManager.
   * @param {Object} config - Configuration object for the module.
   * @param {string} config.mainTabId - The ID of the main horizontal tab this table manager belongs to.
   * @param {string} config.localizedDataName - The name of the global JS object holding localized data.
   */
  constructor(config) {
    this.$ = jQuery;
    this.config = config;
    this.logger = createLogger(`AdminTableManager:${this.config.mainTabId || 'Generic'}`);

    if (!this.config.mainTabId || !this.config.localizedDataName) {
      this.logger.error('AdminTableManager: Missing critical configuration: mainTabId or localizedDataName.', this.config);
      // Defer throwing error until document.ready when we try to use these.
    }

    // Fetch localized settings immediately.
    this.settings = window[this.config.localizedDataName] || {};

    this.formModified = false;
    this.isEditMode = false;
    this.currentItemId = null;
    this.$mainContainer = null; // Will be assigned in document.ready

    // Defer DOM-dependent initialization until document is ready
    this.$(document).ready(() => {
      if (!this.config.mainTabId) {
        this.logger.error('AdminTableManager: mainTabId missing in config during document.ready. Cannot initialize.');
        // Display a more prominent error if possible
        if (window.ProductEstimatorSettings && typeof window.ProductEstimatorSettings.showNotice === 'function') {
          window.ProductEstimatorSettings.showNotice('Critical error: Table manager configuration incomplete.', 'error');
        }
        return; // Prevent further execution
      }

      this.$mainContainer = this.$(`#${this.config.mainTabId}`);
      if (!this.$mainContainer || !this.$mainContainer.length) {
        this.logger.error(`AdminTableManager: Main container #${this.config.mainTabId} not found. Module will not initialize.`);
        return; // Stop initialization
      }

      try {
        this._validateSettings(); // Validate essential settings (now in this.settings)
        this.init(); // Call init which will cache DOM and bind events
      } catch (error) {
        this.logger.error(`AdminTableManager: Initialization failed for tab "${this.config.mainTabId}".`, error);
        if (window.ProductEstimatorSettings && typeof window.ProductEstimatorSettings.showNotice === 'function') {
          window.ProductEstimatorSettings.showNotice(
            `Error initializing table manager for ${this.config.mainTabId}. Check console.`, 'error'
          );
        }
      }
    });
  }

  /**
   * Validates that essential settings (fetched from localizedData) are provided.
   * @private
   */
  _validateSettings() {
    if (Object.keys(this.settings).length === 0 && this.config.localizedDataName) {
      this.logger.error(`Localized data object "${this.config.localizedDataName}" not found or is empty.`);
      throw new Error(`AdminTableManager: Localized data "${this.config.localizedDataName}" is missing or empty.`);
    }

    const required = {
      topLevel: ['ajaxUrl', 'nonce', 'actions', 'selectors', 'i18n', 'option_name', 'tab_id'],
      // Ensure actions required by handleSubmit are listed.
      actions: ['add_item', 'update_item', 'delete_item'], // get_item is optional. 'save_item' is no longer primary.
      selectors: ['formContainer', 'form', 'addButton', 'listTableBody', 'editButton', 'deleteButton', 'idInput', 'saveButton', 'cancelButton', 'noItemsMessage', 'formTitle', 'listItemRow', 'listTableContainer', 'listTable'],
      i18n: ['confirmDelete', 'itemSavedSuccess', 'itemDeletedSuccess', 'errorSavingItem', 'errorDeletingItem', 'addItemButtonLabel', 'editItemFormTitle', 'addItemFormTitle', 'saving', 'deleting', 'editButtonLabel', 'deleteButtonLabel']
    };

    let allValid = true;
    for (const key of required.topLevel) {
      if (this.settings[key] === undefined) {
        this.logger.error(`Missing required setting: ${key} (expected in ${this.config.localizedDataName})`);
        allValid = false;
      }
    }

    if (this.settings.actions) {
      for (const key of required.actions) {
        if (this.settings.actions[key] === undefined) {
          this.logger.error(`Missing required action: actions.${key} (expected in ${this.config.localizedDataName})`);
          allValid = false;
        }
      }
    } else {
      this.logger.error(`Missing required setting: actions (expected in ${this.config.localizedDataName})`);
      allValid = false;
    }

    if (this.settings.selectors) {
      for (const key of required.selectors) {
        if (this.settings.selectors[key] === undefined) {
          this.logger.error(`Missing required selector: selectors.${key} (expected in ${this.config.localizedDataName})`);
          allValid = false;
        }
      }
    } else {
      this.logger.error(`Missing required setting: selectors (expected in ${this.config.localizedDataName})`);
      allValid = false;
    }

    if (this.settings.i18n) {
      for (const key of required.i18n) {
        if (this.settings.i18n[key] === undefined) {
          this.logger.warn(`Potentially missing i18n string: i18n.${key} (in ${this.config.localizedDataName})`);
        }
      }
    } else {
      this.logger.warn(`Setting: i18n is missing (in ${this.config.localizedDataName}). Some UI text may not appear.`);
      // Not making i18n strictly a failure point for throwing error, but logging it.
    }

    if (!allValid) {
      throw new Error('AdminTableManager: Initialization failed due to missing critical settings. Check console for details.');
    }
    this.logger.log('Settings validated successfully for tab:', this.config.mainTabId);
  }

  /**
   * Initializes the table manager. Called after DOM is ready and settings are validated.
   */
  init() {
    this.logger.log('Initializing AdminTableManager DOM and events for tab:', this.config.mainTabId);
    this.cacheDOM();
    if(this._checkEssentialDOM()) {
      this.bindEvents();
      this.updateNoItemsMessageVisibility();
      this.logger.log('AdminTableManager initialized successfully for tab:', this.config.mainTabId);
      this.$(document).trigger(`admin_table_manager_ready_${this.config.mainTabId}`, [this]);
    } else {
      this.logger.error('AdminTableManager initialization failed: missing essential DOM elements for tab:', this.config.mainTabId);
      if (window.ProductEstimatorSettings && typeof window.ProductEstimatorSettings.showNotice === 'function') {
        window.ProductEstimatorSettings.showNotice(
          `Error initializing UI components for ${this.settings.tab_id || 'table manager'}. Some parts may not work.`, 'error'
        );
      }
    }
  }

  /**
   * Checks if essential DOM elements were found.
   * @private
   */
  _checkEssentialDOM() {
    let essentialFound = true;
    const essentialSelectors = ['formContainer', 'form', 'addButton', 'listTableBody', 'listTableContainer', 'listTable', 'noItemsMessage', 'formTitle', 'idInput', 'saveButton', 'cancelButton'];
    for (const key of essentialSelectors) {
      if (!this.dom[key] || !this.dom[key].length) {
        this.logger.error(`Essential DOM element not found for selector key '${key}':`, this.settings.selectors[key]);
        essentialFound = false;
      }
    }
    return essentialFound;
  }

  /**
   * Caches frequently accessed DOM elements.
   */
  cacheDOM() {
    this.dom = {};
    if (this.settings.selectors) {
      for (const key in this.settings.selectors) {
        if (Object.prototype.hasOwnProperty.call(this.settings.selectors, key)) {
          // Ensure $mainContainer is valid before finding within it
          if (this.$mainContainer && this.$mainContainer.length) {
            this.dom[key] = this.$mainContainer.find(this.settings.selectors[key]);
          } else {
            this.dom[key] = this.$(); // Empty jQuery object if no container
          }
        }
      }
    }
    this.logger.log('DOM elements cached for tab:', this.config.mainTabId, this.dom);
  }

  /**
   * Binds event listeners.
   */
  bindEvents() {
    this.dom.addButton?.on('click.adminTableManager', this.handleAddNew.bind(this));
    if (this.dom.listTableBody && this.dom.listTableBody.length) {
      this.dom.listTableBody.on('click.adminTableManager', this.settings.selectors.editButton, this.handleEdit.bind(this));
      this.dom.listTableBody.on('click.adminTableManager', this.settings.selectors.deleteButton, this.handleDelete.bind(this));
    } else {
      this.logger.warn('listTableBody not found for tab:', this.config.mainTabId, '- edit/delete events not bound.');
    }
    this.dom.form?.on('submit.adminTableManager', this.handleSubmit.bind(this));
    this.dom.cancelButton?.on('click.adminTableManager', this.handleCancel.bind(this));

    this.dom.form?.on('change.adminTableManager input.adminTableManager', ':input', () => {
      this.formModified = true;
    });
    this.logger.log('Common events bound for tab:', this.config.mainTabId);
  }

  /**
   * Handles the "Add New" button click.
   */
  handleAddNew(e) {
    e.preventDefault();
    this.logger.log('Add New clicked for tab:', this.config.mainTabId);
    this.isEditMode = false;
    this.currentItemId = null;
    this.resetForm();
    this.dom.formTitle?.text(this.settings.i18n.addItemFormTitle);
    this.dom.saveButton?.text(this.settings.i18n.saveChangesButton || 'Save Changes'); // Use specific i18n for add
    this.dom.formContainer?.slideDown();
    this.dom.addButton?.hide();
  }

  /**
   * Handles the "Edit" button click on a table row.
   * @param {Event} e - Click event.
   */
  handleEdit(e) {
    e.preventDefault();
    const $button = this.$(e.currentTarget);
    const $row = $button.closest(this.settings.selectors.listItemRow);
    const itemId = $row.data('id');

    this.logger.log('Edit clicked for item ID:', itemId, 'on tab:', this.config.mainTabId);

    if (!itemId) {
      this.logger.error('Could not find item ID for editing on tab:', this.config.mainTabId);
      return;
    }

    // Set edit mode and current item ID *before* resetting the form
    this.isEditMode = true;
    this.currentItemId = itemId;

    this.resetForm(); // Call resetForm - it should NOT clear currentItemId or isEditMode

    // Ensure the hidden ID input in the form is populated with the currentItemId
    if (this.dom.idInput && this.dom.idInput.length) {
      this.dom.idInput.val(this.currentItemId);
    }

    this.dom.formTitle?.text(this.settings.i18n.editItemFormTitle);
    this.dom.saveButton?.text(this.settings.i18n.updateChangesButton || 'Update Changes');

    if (this.settings.actions.get_item) {
      this.showFormLoadingSpinner(true, this.dom.saveButton);
      ajax.ajaxRequest({
        url: this.settings.ajaxUrl,
        // Ensure this is POST if PHP's handle_ajax_get_item expects $_POST
        // type: 'POST', // Assuming ajax.ajaxRequest defaults to POST or is configured for it
        data: {
          action: this.settings.actions.get_item,
          nonce: this.settings.nonce,
          item_id: itemId, // Send the item ID to fetch
          option_name: this.settings.option_name,
          tab_id: this.settings.tab_id,
        }
      })
        .then(response => {
          this.logger.log('Get Item AJAX response received by .then():', JSON.stringify(response));
          if (response && response.item && typeof response.item === 'object') {
            this.logger.log('SUCCESS BLOCK: Item data found. Populating form.');
            this.populateFormWithData(response.item); // This should also fill the hidden item_id input
            this.dom.formContainer?.slideDown();
            this.dom.addButton?.hide();
          } else {
            this.logger.log('ELSE BLOCK: Condition failed.');
            const errorMsg = (response && response.message)
              ? response.message
              : (this.settings.i18n.errorLoadingItem || 'Error loading item details or unexpected data structure.');
            this.showNotice(errorMsg, 'error');
            this.logger.error('Error loading item details: Unexpected response structure or item key missing. Response:', response);
          }
        })
        .catch(error => {
          this.showNotice(error.message || this.settings.i18n.errorLoadingItem, 'error');
          this.logger.error('AJAX error loading item for editing:', error);
        })
        .finally(() => {
          this.showFormLoadingSpinner(false, this.dom.saveButton);
        });
    } else {
      this.logger.log('No get_item action defined, attempting to populate from button data attributes for tab:', this.config.mainTabId);
      const itemData = $button.data(); // jQuery's .data() retrieves all data-* attributes
      itemData.id = itemId; // Ensure 'id' is present if it wasn't a data attribute named 'id'
      this.populateFormWithData(itemData);
      this.dom.formContainer?.slideDown();
      this.dom.addButton?.hide();
    }
  }

  /**
   * Handles the "Delete" button click on a table row.
   */
  handleDelete(e) {
    e.preventDefault();
    const $button = this.$(e.currentTarget);
    const $row = $button.closest(this.settings.selectors.listItemRow);
    const itemId = $row.data('id');
    this.logger.log('Delete clicked for item ID:', itemId, 'on tab:', this.config.mainTabId);

    if (!itemId) {
      this.logger.error('Could not find item ID for deletion on tab:', this.config.mainTabId);
      return;
    }

    if (!confirm(this.settings.i18n.confirmDelete)) {
      return;
    }

    const originalButtonText = $button.text();
    $button.prop('disabled', true).text(this.settings.i18n.deleting);

    ajax.ajaxRequest({
      url: this.settings.ajaxUrl,
      data: {
        action: this.settings.actions.delete_item,
        nonce: this.settings.nonce,
        item_id: itemId,
        option_name: this.settings.option_name,
        tab_id: this.settings.tab_id,
      }
    })
      .then(response => {
        if (response.success) {
          this.showNotice((response.data && response.data.message) || this.settings.i18n.itemDeletedSuccess, 'success');
          $row.fadeOut(300, () => {
            $row.remove();
            this.updateNoItemsMessageVisibility();
          });
        } else if (response && response.itemId) { // And assuming 'message' is also present for success
          this.showNotice(response.message || this.settings.i18n.itemDeletedSuccess, 'success');
          this.logger.log('Attempting to remove row for item ID (response was data part):', response.itemId, $row);
          $row.fadeOut(300, () => {
            $row.remove();
            this.updateNoItemsMessageVisibility();
            this.logger.log('Row removed (response was data part).');
          });
      }else {
          this.showNotice((response.data && response.data.message) || this.settings.i18n.errorDeletingItem, 'error');
          $button.prop('disabled', false).text(originalButtonText);
        }
      })
      .catch(error => {
        this.showNotice(error.message || this.settings.i18n.errorDeletingItem, 'error');
        this.logger.error('AJAX error deleting item:', error);
        $button.prop('disabled', false).text(originalButtonText);
      });
  }

  /**
   * Handles the form submission (Add or Edit).
   * @param {Event} e - Submit event.
   */
  handleSubmit(e) {
    e.preventDefault();
    this.logger.log('Form submitted. Edit mode:', this.isEditMode, 'Current Item ID:', this.currentItemId);

    if (!this.validateForm()) {
      this.logger.warn('Form validation failed for tab:', this.config.mainTabId);
      return;
    }

    const determinedAction = this.isEditMode ? this.settings.actions.update_item : this.settings.actions.add_item;

    if (!determinedAction) {
      this.logger.error('Form submission action (add_item or update_item) is not defined in settings.actions for tab:', this.config.mainTabId);
      this.showNotice(this.settings.i18n.errorSavingItem || 'Configuration error: Save action not defined.', 'error');
      this.showFormLoadingSpinner(false, this.dom.saveButton);
      return;
    }

    const dataPayload = {
      action: determinedAction,
      nonce: this.settings.nonce,
      option_name: this.settings.option_name,
      tab_id: this.settings.tab_id,
      item_data: {} // All form fields will go under 'item_data'
    };

    const formFields = this.dom.form.serializeArray();
    formFields.forEach(field => {
      const fieldName = field.name;
      const fieldValue = field.value;

      if (fieldName.endsWith('[]')) {
        const actualName = fieldName.slice(0, -2);
        if (!dataPayload.item_data[actualName]) {
          dataPayload.item_data[actualName] = [];
        }
        dataPayload.item_data[actualName].push(fieldValue);
      } else {
        // If the form field is named 'item_id' (the hidden input),
        // its value will be included in item_data. This is fine,
        // but the PHP update handler uses the top-level item_id.
        dataPayload.item_data[fieldName] = fieldValue;
      }
    });

    // If in edit mode, add the currentItemId to the top level of the payload.
    // PHP's handle_ajax_update_item expects $_POST['item_id'].
    if (this.isEditMode && this.currentItemId) {
      dataPayload.item_id = this.currentItemId;
    }
    // Note: The hidden input `name="item_id"` from `render_form_fields` will be in `dataPayload.item_data.item_id`.
    // The PHP `handle_ajax_update_item` specifically looks for `$_POST['item_id']` (which `dataPayload.item_id` becomes).
    // The `dataPayload.item_data.item_id` (if present) will be part of the data passed to `validate_item_data` in PHP.

    this.logger.log('AJAX data payload for save:', dataPayload);
    this.showFormLoadingSpinner(true, this.dom.saveButton);

    ajax.ajaxRequest({
      url: this.settings.ajaxUrl,
      data: dataPayload
    })
      .then(response => {
        this.logger.log('AJAX save response received:', response);
        if (response && response.item) {
          this.showNotice(response.message || this.settings.i18n.itemSavedSuccess, 'success');
          if (this.isEditMode) {
            this.updateTableRow(response.item);
          } else {
            this.addTableRow(response.item);
          }
          this.dom.formContainer?.slideUp();
          this.dom.addButton?.show();
          this.resetForm(); // Call after successful operation
          // Explicitly reset edit mode flags after successful save/update & form reset
          this.isEditMode = false;
          this.currentItemId = null;
          this.updateNoItemsMessageVisibility();
          this.formModified = false;
        } else {
          const errorMsg = (response && response.message) ? response.message : this.settings.i18n.errorSavingItem;
          const errorsDetail = (response && response.errors) ? `<br><pre>${JSON.stringify(response.errors, null, 2)}</pre>` : '';
          this.showNotice(errorMsg + errorsDetail, 'error');
          this.logger.error('Error saving item or item data missing in response structure:', response);
        }
      })
      .catch(error => {
        const errorMsg = error.message || this.settings.i18n.errorSavingItem;
        this.showNotice(errorMsg, 'error');
        this.logger.error('AJAX error during save operation:', error);
      })
      .finally(() => {
        this.showFormLoadingSpinner(false, this.dom.saveButton);
      });
  }
  /**
   * Handles the "Cancel" button click in the form.
   */
  handleCancel(e) {
    e.preventDefault();
    this.logger.log('Cancel form clicked for tab:', this.config.mainTabId);
    this.dom.formContainer?.slideUp();
    this.dom.addButton?.show();
    this.resetForm();
  }

  /**
   * Resets the form to its initial state.
   */
  resetForm() {
    this.dom.form[0]?.reset(); // Native form reset
    // Clear the hidden ID input. It will be repopulated by populateFormWithData if in edit mode.
    if (this.dom.idInput && this.dom.idInput.length) {
      this.dom.idInput.val('');
    }
    // DO NOT reset isEditMode and currentItemId here.
    // They should be managed by handleAddNew, handleEdit, and the success part of handleSubmit.
    this.formModified = false;

    this.dom.form?.find('.error').removeClass('error');
    this.dom.form?.find('.field-error').remove();
    this.logger.log('Form reset for tab:', this.config.mainTabId);
    // Child class should override to reset its specific fields (like Select2, conditional visibility)
  }

  /**
   * Populates the form with data for editing.
   */
  populateFormWithData(itemData) {
    this.logger.log('Populating form with data (base method) for tab:', this.config.mainTabId, 'Item Data:', itemData);
    if (itemData && itemData.id && this.dom.idInput && this.dom.idInput.length) {
      this.dom.idInput.val(itemData.id); // Populate hidden ID field
      this.currentItemId = itemData.id; // Also ensure currentItemId is set if called directly
      this.isEditMode = true; // If we are populating with an item, it's for editing
    } else if (itemData && !itemData.id) {
      this.logger.warn('populateFormWithData called with itemData lacking an ID. Cannot set hidden ID input or currentItemId reliably from this data alone.', itemData)
    }
    // Child classes will override to populate their specific fields.
  }

  /**
   * Validates the form before submission.
   */
  validateForm() {
    this.logger.log('Validating form (base method) for tab:', this.config.mainTabId);
    let isValid = true;
    this.dom.form?.find('.error').removeClass('error');
    this.dom.form?.find('.field-error').remove();
    this.dom.form?.find('.is-required').each((index, el) => {
      const $field = this.$(el);
      let value = $field.val();
      if (typeof value === 'string') value = value.trim();
      if (!value || ($field.is('select') && !value)) {
        this.showFieldError($field, this.settings.i18n.fieldRequired || 'This field is required.');
        isValid = false;
      }
    });
    return isValid;
  }

  /**
   * Adds a new row to the HTML table.
   */
  addTableRow(itemData) {
    this.logger.log('Adding table row for tab:', this.config.mainTabId, itemData);
    const $row = this.createTableRow(itemData); // Must be implemented by child
    if ($row && this.dom.listTableBody && this.dom.listTableBody.length) {
      this.dom.listTableBody.append($row);
      this.updateNoItemsMessageVisibility();
    } else {
      this.logger.error('Failed to add table row: createTableRow invalid or listTableBody not found for tab:', this.config.mainTabId);
    }
  }

  /**
   * Updates an existing row in the HTML table.
   */
  updateTableRow(itemData) {
    this.logger.log('Updating table row for tab:', this.config.mainTabId, itemData);
    if (!itemData.id) {
      this.logger.error('Cannot update table row: itemData missing ID for tab:', this.config.mainTabId, itemData);
      return;
    }
    const $existingRow = this.dom.listTableBody?.find(`${this.settings.selectors.listItemRow}[data-id="${itemData.id}"]`);
    if ($existingRow && $existingRow.length) {
      const $newRow = this.createTableRow(itemData); // Must be implemented by child
      if ($newRow) {
        $existingRow.replaceWith($newRow);
      } else {
        this.logger.error('Failed to update table row: createTableRow returned null for tab:', this.config.mainTabId);
      }
    } else {
      this.logger.warn('Could not find row to update with ID:', itemData.id, '- Appending as new for tab:', this.config.mainTabId);
      this.addTableRow(itemData);
    }
  }

  /**
   * Creates the HTML for a single table row. Child classes MUST override this.
   */
  createTableRow(itemData) {
    this.logger.error('createTableRow() must be implemented by the child class.', itemData);
    // Example: return this.$(`<tr><td colspan="100">Implement createTableRow in child class for ${this.config.mainTabId}</td></tr>`);
    return null;
  }

  /**
   * Shows or hides the "No items" message.
   */
  updateNoItemsMessageVisibility() {
    if (this.dom.noItemsMessage && this.dom.noItemsMessage.length && this.dom.listTableBody && this.dom.listTable) {
      const hasItems = this.dom.listTableBody.find(this.settings.selectors.listItemRow).length > 0;
      if (hasItems) {
        this.dom.noItemsMessage.hide();
        this.dom.listTable.show();
      } else {
        this.dom.noItemsMessage.show();
        this.dom.listTable.hide();
      }
      this.logger.log('"No items" message visibility updated for tab:', this.config.mainTabId, 'Has items:', hasItems);
    } else {
      this.logger.warn('Cannot update "no items" message visibility: DOM elements missing for tab:', this.config.mainTabId);
    }
  }

  /**
   * Shows a generic success/error notice.
   */
  showNotice(message, type = 'success') {
    if (window.ProductEstimatorSettings && typeof window.ProductEstimatorSettings.showNotice === 'function') {
      window.ProductEstimatorSettings.showNotice(message, type);
    } else if (typeof validation !== 'undefined' && typeof validation.showNotice === 'function') {
      validation.showNotice(message, type);
    } else {
      this.logger.info(`Notice (${type}): ${message}`); // Use info for notices
      alert((type === 'success' ? 'SUCCESS: ' : 'ERROR: ') + message);
    }
  }

  /**
   * Shows a field-specific error message.
   */
  showFieldError($field, message) {
    if (window.ProductEstimatorSettings && typeof window.ProductEstimatorSettings.showFieldError === 'function') {
      window.ProductEstimatorSettings.showFieldError($field, message);
    } else if (validation && typeof validation.showFieldError === 'function') {
      validation.showFieldError($field, message);
    } else {
      this.clearFieldError($field);
      const errorEl = this.$(`<span class="field-error">${message}</span>`);
      $field.addClass('error').after(errorEl);
    }
  }

  /**
   * Clears a field-specific error message.
   */
  clearFieldError($field) {
    if (window.ProductEstimatorSettings && typeof window.ProductEstimatorSettings.clearFieldError === 'function') {
      window.ProductEstimatorSettings.clearFieldError($field);
    } else if (validation && typeof validation.clearFieldError === 'function') {
      validation.clearFieldError($field);
    } else {
      $field.removeClass('error').next('.field-error').remove();
    }
  }

  /**
   * Shows/hides a loading spinner on a button.
   */
  showFormLoadingSpinner(isLoading, $button) {
    const $btn = $button || this.dom.saveButton;
    if (!$btn || !$btn.length) return;

    if (isLoading) {
      $btn.prop('disabled', true).addClass('pe-loading');
      if (!$btn.data('original-text')) {
        $btn.data('original-text', $btn.text() || $btn.val());
      }
      const savingText = (this.settings.i18n && this.settings.i18n.saving) || 'Saving...';
      if ($btn.is('input')) $btn.val(savingText); else $btn.text(savingText);
    } else {
      $btn.prop('disabled', false).removeClass('pe-loading');
      if ($btn.data('original-text')) {
        if ($btn.is('input')) $btn.val($btn.data('original-text')); else $btn.text($btn.data('original-text'));
      }
    }
  }
}

export default AdminTableManager;
