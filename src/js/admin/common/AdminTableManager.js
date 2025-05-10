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
   * @param {Object} moduleSettings - Localized settings for this specific table manager instance.
   * Expected properties: ajaxUrl, nonce, actions (save_item, delete_item, get_item),
   * selectors (formContainer, form, addButton, etc.), i18n, option_name, tab_id.
   * @param {jQuery} $mainContainer - The main jQuery container element for this module's UI.
   */
  constructor(moduleSettings, $mainContainer) {
    this.$ = jQuery; // Make jQuery available as this.$
    this.settings = moduleSettings;
    this.$mainContainer = $mainContainer;

    if (!this.settings || !this.$mainContainer || !this.$mainContainer.length) {
      const errorLogger = createLogger('AdminTableManager:CriticalError');
      errorLogger.error('AdminTableManager: Critical settings or main container missing.', { settings: this.settings, containerExists: !!(this.$mainContainer && this.$mainContainer.length) });
      throw new Error('AdminTableManager: Initialization failed due to missing settings or container.');
    }
    this.logger = createLogger(`AdminTableManager:${this.settings.tab_id || 'Generic'}`);

    this.formModified = false;
    this.isEditMode = false;
    this.currentItemId = null;

    this._validateSettings(); // Validate essential settings
    this.init();
  }

  /**
   * Validates that essential settings are provided.
   * @private
   */
  _validateSettings() {
    const required = {
      settings: ['ajaxUrl', 'nonce', 'actions', 'selectors', 'i18n', 'option_name', 'tab_id'],
      actions: ['save_item', 'delete_item'], // get_item is optional
      selectors: ['formContainer', 'form', 'addButton', 'listTableBody', 'editButton', 'deleteButton', 'idInput', 'saveButton', 'cancelButton', 'noItemsMessage', 'formTitle', 'listItemRow', 'listTableContainer', 'listTable'],
      i18n: ['confirmDelete', 'itemSavedSuccess', 'itemDeletedSuccess', 'errorSavingItem', 'errorDeletingItem', 'addItemButtonLabel', 'editItemFormTitle', 'addItemFormTitle', 'saving', 'deleting', 'editButtonLabel', 'deleteButtonLabel']
    };

    let allValid = true;
    for (const key of required.settings) {
      if (this.settings[key] === undefined) {
        this.logger.error(`Missing required setting: settings.${key}`);
        allValid = false;
      }
    }
    if (this.settings.actions) {
      for (const key of required.actions) {
        if (this.settings.actions[key] === undefined) {
          this.logger.error(`Missing required action: actions.${key}`);
          allValid = false;
        }
      }
    } else {
      this.logger.error(`Missing required setting: settings.actions`);
      allValid = false;
    }

    if (this.settings.selectors) {
      for (const key of required.selectors) {
        if (this.settings.selectors[key] === undefined) {
          this.logger.error(`Missing required selector: selectors.${key}`);
          allValid = false;
        }
      }
    } else {
      this.logger.error(`Missing required setting: settings.selectors`);
      allValid = false;
    }

    if (this.settings.i18n) {
      for (const key of required.i18n) {
        if (this.settings.i18n[key] === undefined) {
          this.logger.warn(`Potentially missing i18n string: i18n.${key}`);
          // Not throwing an error for i18n, but it's important.
        }
      }
    } else {
      this.logger.error(`Missing required setting: settings.i18n`);
      allValid = false;
    }


    if (!allValid) {
      throw new Error('AdminTableManager: Initialization failed due to missing critical settings. Check console for details.');
    }
  }

  /**
   * Initializes the table manager.
   */
  init() {
    this.logger.log('Initializing with settings:', this.settings);
    this.cacheDOM();
    if(this._checkEssentialDOM()) {
      this.bindEvents();
      this.updateNoItemsMessageVisibility();
      this.logger.log('AdminTableManager initialized successfully.');
    } else {
      this.logger.error('AdminTableManager initialization failed due to missing essential DOM elements. Manager will not function correctly.');
    }
  }

  /**
   * Checks if essential DOM elements were found.
   * @private
   */
  _checkEssentialDOM() {
    let essentialFound = true;
    const essentialSelectors = ['formContainer', 'form', 'addButton', 'listTableBody', 'listTableContainer', 'listTable', 'noItemsMessage'];
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
          this.dom[key] = this.$mainContainer.find(this.settings.selectors[key]);
        }
      }
    }
    this.logger.log('DOM elements cached.');
  }

  /**
   * Binds event listeners.
   */
  bindEvents() {
    this.dom.addButton?.on('click.adminTableManager', this.handleAddNew.bind(this));
    // Ensure listTableBody exists before binding events to its children
    if (this.dom.listTableBody && this.dom.listTableBody.length) {
      this.dom.listTableBody.on('click.adminTableManager', this.settings.selectors.editButton, this.handleEdit.bind(this));
      this.dom.listTableBody.on('click.adminTableManager', this.settings.selectors.deleteButton, this.handleDelete.bind(this));
    } else {
      this.logger.warn('listTableBody not found, edit/delete events not bound.');
    }
    this.dom.form?.on('submit.adminTableManager', this.handleSubmit.bind(this));
    this.dom.cancelButton?.on('click.adminTableManager', this.handleCancel.bind(this));

    this.dom.form?.on('change.adminTableManager input.adminTableManager', ':input', () => {
      this.formModified = true;
    });
    this.logger.log('Common events bound.');
  }

  /**
   * Handles the "Add New" button click.
   * @param {Event} e - Click event.
   */
  handleAddNew(e) {
    e.preventDefault();
    this.logger.log('Add New clicked.');
    this.isEditMode = false;
    this.currentItemId = null;
    this.resetForm();
    this.dom.formTitle?.text(this.settings.i18n.addItemFormTitle);
    this.dom.saveButton?.text(this.settings.i18n.saveChangesButton || 'Save Changes');
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
    // Ensure listItemRow selector is valid and $button is its descendant or itself
    const $row = $button.closest(this.settings.selectors.listItemRow);
    const itemId = $row.data('id');

    this.logger.log('Edit clicked for item ID:', itemId);

    if (!itemId) {
      this.logger.error('Could not find item ID for editing. Ensure rows have data-id and selector is correct.');
      return;
    }

    this.isEditMode = true;
    this.currentItemId = itemId;
    this.resetForm();
    this.dom.formTitle?.text(this.settings.i18n.editItemFormTitle);
    this.dom.saveButton?.text(this.settings.i18n.updateChangesButton || 'Update Changes');

    if (this.settings.actions.get_item) {
      this.showFormLoadingSpinner(true, this.dom.saveButton); // Show spinner on save button
      ajax.ajaxRequest({
        url: this.settings.ajaxUrl,
        data: {
          action: this.settings.actions.get_item,
          nonce: this.settings.nonce,
          item_id: itemId,
          option_name: this.settings.option_name,
          tab_id: this.settings.tab_id,
        }
      })
        .then(response => {
          if (response.success && response.data && response.data.item) {
            this.populateFormWithData(response.data.item);
            this.dom.formContainer?.slideDown();
            this.dom.addButton?.hide();
          } else {
            const errorMsg = (response.data && response.data.message) || this.settings.i18n.errorLoadingItem || 'Error loading item details.';
            this.showNotice(errorMsg, 'error');
            this.logger.error('Error loading item details for editing:', response);
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
      // Fallback: Populate from data attributes on the edit button itself
      // This requires all necessary data to be on the button.
      this.logger.log('No get_item action defined, attempting to populate from button data attributes.');
      const itemData = $button.data(); // Gets all data attributes
      itemData.id = itemId; // Ensure ID is included
      this.populateFormWithData(itemData);
      this.dom.formContainer?.slideDown();
      this.dom.addButton?.hide();
    }
  }

  /**
   * Handles the "Delete" button click on a table row.
   * @param {Event} e - Click event.
   */
  handleDelete(e) {
    e.preventDefault();
    const $button = this.$(e.currentTarget);
    const $row = $button.closest(this.settings.selectors.listItemRow);
    const itemId = $row.data('id');
    this.logger.log('Delete clicked for item ID:', itemId);

    if (!itemId) {
      this.logger.error('Could not find item ID for deletion.');
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
          this.showNotice( (response.data && response.data.message) || this.settings.i18n.itemDeletedSuccess, 'success');
          $row.fadeOut(300, () => {
            $row.remove();
            this.updateNoItemsMessageVisibility();
          });
        } else {
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
    this.logger.log('Form submitted. Edit mode:', this.isEditMode, 'Item ID:', this.currentItemId);

    if (!this.validateForm()) {
      this.logger.warn('Form validation failed.');
      return;
    }

    const formDataArray = this.dom.form.serializeArray();
    const dataPayload = {
      action: this.settings.actions.save_item,
      nonce: this.settings.nonce,
      option_name: this.settings.option_name,
      tab_id: this.settings.tab_id,
    };

    formDataArray.forEach(field => {
      if (dataPayload[field.name]) {
        if (!Array.isArray(dataPayload[field.name])) {
          dataPayload[field.name] = [dataPayload[field.name]];
        }
        dataPayload[field.name].push(field.value);
      } else {
        dataPayload[field.name] = field.value;
      }
    });

    // Ensure item_id is correctly set from the hidden input this.dom.idInput
    // The name of this.dom.idInput is defined in selectors.idInput (e.g., 'input[name="item_id"]')
    // So, dataPayload[this.dom.idInput.attr('name')] should get its value.
    // If creating a new item, this.currentItemId is null.
    // If editing, this.currentItemId has the ID. The hidden input should also have this ID.
    if (this.isEditMode && this.currentItemId) {
      // Ensure the ID being submitted matches this.currentItemId
      // The hidden input 'item_id' (or whatever it's named) should be populated by populateFormWithData
      dataPayload[this.dom.idInput.attr('name')] = this.currentItemId;
    }
    // If the PHP handler specifically expects 'item_id' regardless of the input's name:
    if (this.isEditMode && this.currentItemId && !dataPayload.item_id) {
      dataPayload.item_id = this.currentItemId;
    }


    this.logger.log('AJAX data payload for save:', dataPayload);
    this.showFormLoadingSpinner(true, this.dom.saveButton);

    ajax.ajaxRequest({
      url: this.settings.ajaxUrl,
      data: dataPayload
    })
      .then(response => {
        if (response.success && response.data && response.data.item) {
          this.showNotice((response.data && response.data.message) || this.settings.i18n.itemSavedSuccess, 'success');
          if (this.isEditMode) {
            this.updateTableRow(response.data.item);
          } else {
            this.addTableRow(response.data.item);
          }
          this.dom.formContainer?.slideUp();
          this.dom.addButton?.show();
          this.resetForm(); // Resets isEditMode and currentItemId
          this.updateNoItemsMessageVisibility();
          this.formModified = false;
        } else {
          this.showNotice((response.data && response.data.message) || this.settings.i18n.errorSavingItem, 'error');
          this.logger.error('Error saving item or item data missing in response:', response);
        }
      })
      .catch(error => {
        this.showNotice(error.message || this.settings.i18n.errorSavingItem, 'error');
        this.logger.error('AJAX error saving item:', error);
      })
      .finally(() => {
        this.showFormLoadingSpinner(false, this.dom.saveButton);
      });
  }

  /**
   * Handles the "Cancel" button click in the form.
   * @param {Event} e - Click event.
   */
  handleCancel(e) {
    e.preventDefault();
    this.logger.log('Cancel form clicked.');
    this.dom.formContainer?.slideUp();
    this.dom.addButton?.show();
    this.resetForm();
  }

  /**
   * Resets the form to its initial state.
   * Child classes should override to handle specific fields (e.g., Select2).
   */
  resetForm() {
    this.dom.form[0]?.reset(); // Native reset
    this.dom.idInput?.val(''); // Clear hidden ID field by selector
    this.isEditMode = false;
    this.currentItemId = null;
    this.formModified = false;

    this.dom.form?.find('.error').removeClass('error');
    this.dom.form?.find('.field-error').remove();
    this.logger.log('Form reset.');
  }

  /**
   * Populates the form with data for editing.
   * Child classes MUST override this to handle their specific form fields.
   * @param {Object} itemData - The data of the item to edit.
   */
  populateFormWithData(itemData) {
    this.logger.log('Populating form with data (base method, override in child):', itemData);
    if (itemData.id && this.dom.idInput) {
      this.dom.idInput.val(itemData.id); // Populate hidden ID field
    }
  }

  /**
   * Validates the form before submission.
   * Child classes can override to add specific validation rules.
   * @returns {boolean} True if the form is valid, false otherwise.
   */
  validateForm() {
    this.logger.log('Validating form (base method).');
    let isValid = true;
    // Clear previous errors
    this.dom.form?.find('.error').removeClass('error');
    this.dom.form?.find('.field-error').remove();

    // Example: Check for required fields with a common class (e.g., 'is-required')
    this.dom.form?.find('.is-required').each((index, el) => { // Use a more specific class if needed
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
   * Child classes MUST override this to render their specific table row HTML.
   * @param {Object} itemData - The data of the item to add.
   */
  addTableRow(itemData) {
    this.logger.log('Adding table row (base method, override in child):', itemData);
    const $row = this.createTableRow(itemData);
    if ($row && this.dom.listTableBody) {
      this.dom.listTableBody.append($row);
      this.updateNoItemsMessageVisibility();
    } else {
      this.logger.error('Failed to add table row: createTableRow returned null or listTableBody not found.');
    }
  }

  /**
   * Updates an existing row in the HTML table.
   * Child classes MUST override this to render their specific table row HTML.
   * @param {Object} itemData - The updated data of the item.
   */
  updateTableRow(itemData) {
    this.logger.log('Updating table row (base method, override in child):', itemData);
    if (!itemData.id) {
      this.logger.error('Cannot update table row: itemData is missing an ID.', itemData);
      return;
    }
    const $existingRow = this.dom.listTableBody?.find(`${this.settings.selectors.listItemRow}[data-id="${itemData.id}"]`);
    if ($existingRow && $existingRow.length) {
      const $newRow = this.createTableRow(itemData);
      if ($newRow) {
        $existingRow.replaceWith($newRow);
      } else {
        this.logger.error('Failed to update table row: createTableRow returned null.');
      }
    } else {
      this.logger.warn('Could not find row to update with ID:', itemData.id, '- Appending as new row instead.');
      this.addTableRow(itemData); // Fallback to add if not found
    }
  }

  /**
   * Creates the HTML for a single table row.
   * Child classes MUST override this.
   * @param {Object} itemData - The data for the row.
   * @returns {jQuery|null} A jQuery object representing the new row, or null.
   */
  createTableRow(itemData) {
    this.logger.error('createTableRow() must be implemented by the child class.', itemData);
    return null;
  }

  /**
   * Shows or hides the "No items" message based on table content.
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
      this.logger.log('"No items" message visibility updated. Has items:', hasItems);
    } else {
      this.logger.warn('Cannot update "no items" message visibility: noItemsMessage, listTableBody, or listTable DOM element not found.');
    }
  }

  /**
   * Shows a generic success/error notice.
   * @param {string} message - The message to display.
   * @param {string} type - 'success' or 'error'.
   */
  showNotice(message, type = 'success') {
    if (window.ProductEstimatorSettings && typeof window.ProductEstimatorSettings.showNotice === 'function') {
      window.ProductEstimatorSettings.showNotice(message, type);
    } else if (typeof validation !== 'undefined' && typeof validation.showNotice === 'function') {
      validation.showNotice(message, type);
    } else {
      alert((type === 'success' ? 'SUCCESS: ' : 'ERROR: ') + message);
    }
    this.logger.log(`Notice shown (${type}):`, message);
  }

  /**
   * Shows a field-specific error message.
   * @param {jQuery} $field - The jQuery object of the field.
   * @param {string} message - The error message.
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
   * @param {jQuery} $field - The jQuery object of the field.
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
   * Shows/hides a loading spinner on a button or form.
   * @param {boolean} isLoading - True to show spinner, false to hide.
   * @param {jQuery} [$button] - Optional button to show spinner on. If not provided, uses form's save button.
   */
  showFormLoadingSpinner(isLoading, $button) {
    const $btn = $button || this.dom.saveButton;
    if (!$btn || !$btn.length) return;

    if (isLoading) {
      $btn.prop('disabled', true).addClass('pe-loading'); // Add a class for spinner styling
      if (!$btn.data('original-text')) {
        $btn.data('original-text', $btn.text() || $btn.val()); // Handles <button> and <input type="submit">
      }
      $btn.text(this.settings.i18n.saving); // Use .text() for <button>, .val() for <input>
      if ($btn.is('input')) $btn.val(this.settings.i18n.saving);

    } else {
      $btn.prop('disabled', false).removeClass('pe-loading');
      if ($btn.data('original-text')) {
        $btn.text($btn.data('original-text'));
        if ($btn.is('input')) $btn.val($btn.data('original-text'));
      }
    }
  }
}

export default AdminTableManager;
