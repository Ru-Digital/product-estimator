// File: admin/js/common/AdminTableManager.js

/**
 * AdminTableManager.js
 *
 * Base class for managing admin list tables with add/edit/delete functionality
 * driven by AJAX. It relies on a specific HTML structure and localized data
 * provided by the corresponding PHP settings module.
 * Now extends VerticalTabbedModule.
 */
import VerticalTabbedModule from './VerticalTabbedModule.js';
import { ajax, dom, validation } from '@utils'; // Assuming @utils provides these
import { createLogger } from '@utils'; // Ensure createLogger is correctly imported

class AdminTableManager extends VerticalTabbedModule {
  /**
   * Constructor for AdminTableManager.
   * @param {Object} config - Configuration object for the module.
   * @param {string} config.mainTabId - The ID of the main horizontal tab this table manager belongs to.
   * @param {string} config.localizedDataName - The name of the global JS object holding localized data.
   */
  constructor(config) {

    // Configuration for the VerticalTabbedModule parent class
    const vtmConfig = {
      ...config, // Includes mainTabId, localizedDataName, and possibly defaultSubTabId
      // Only set defaultSubTabId if not already provided in config
      defaultSubTabId: config.defaultSubTabId || config.mainTabId + '_table', // Use more predictable format
      ajaxActionPrefix: `atm_form_save_${config.mainTabId}`
    };


    super(vtmConfig); // Calls VerticalTabbedModule constructor

    this.$ = jQuery; // jQuery utility

    this.config = config; // <<<< ADD THIS LINE


    // --- CORRECTED LOGGER INITIALIZATION ---
    // Use `config.mainTabId` (from this constructor's direct argument `config`)
    // This `config` is guaranteed to have `mainTabId` as passed by ProductAdditionsSettingsModule.

    const loggerName = `AdminTableManager:${config.mainTabId || 'Generic'}`;

    this.logger = createLogger(loggerName); // Pass the pre-constructed string

    // `this.settings` is initialized by the `super(vtmConfig)` call chain (ProductEstimatorSettings).
    // `this.settings.tab_id` will hold the mainTabId.
    // A check for its presence after super() is good practice.
    if (!this.settings || !this.settings.tab_id) {
    }

    this.formModified = false;
    this.isEditMode = false;
    this.currentItemId = null;
    // Note: this.settings (formerly this.localizedData) is initialized by ProductEstimatorSettings
  }

  /**
   * Validates that essential settings (now from this.settings) are provided.
   * @private
   */
  _validateSettings() {
    if (!this.settings || this.settings.tab_id === undefined) {
      throw new Error(`AdminTableManager: Essential property 'this.settings.tab_id' was not initialized by the parent class. Cannot validate settings.`);
    }

    if (Object.keys(this.settings).length === 0) {
      let errorMsg = `AdminTableManager: Settings (this.settings) is an empty object`;
      if (this.settingsObjectName) {
        errorMsg += ` (expected from window.${this.settingsObjectName}). This might happen if the global object is empty or not correctly populated.`;
      }
      throw new Error(errorMsg + ` Cannot proceed with empty settings for tab "${this.settings.tab_id}".`);
    }

    const required = {
      actions: ['add_item', 'update_item', 'delete_item'],
      selectors: ['formContainer', 'form', 'addButton', 'listTableBody', 'editButton', 'deleteButton', 'idInput', 'saveButton', 'cancelButton', 'noItemsMessage', 'formTitle', 'listItemRow', 'listTableContainer', 'listTable'],
      i18n_keys: ['confirmDelete', 'itemSavedSuccess', 'itemDeletedSuccess', 'errorSavingItem', 'errorDeletingItem', 'addItemButtonLabel', 'editItemFormTitle', 'saving', 'deleting', 'editButtonLabel', 'deleteButtonLabel'],
    };

    let allValid = true;
    if (this.settings.ajaxUrl === undefined) { allValid = false; }
    if (this.settings.nonce === undefined) { allValid = false; }
    if (this.settings.option_name === undefined) { allValid = false; }

    if (this.settings.actions) {
      for (const key of required.actions) {
        if (this.settings.actions[key] === undefined) {
          allValid = false;
        }
      }
    } else {
      allValid = false;
    }

    if (this.settings.selectors) {
      for (const key of required.selectors) {
        if (this.settings.selectors[key] === undefined) {
          allValid = false;
        }
      }
    } else {
      allValid = false;
    }

    if (this.settings.i18n) {
      for (const key of required.i18n_keys) {
        if (this.settings.i18n[key] === undefined) {
        }
      }
    } else {
      allValid = false;
    }

    if (!allValid) {
      throw new Error(`AdminTableManager: Settings validation failed due to missing critical settings in this.settings for tab "${this.settings.tab_id}". Check console for details.`);
    }
  }

  /**
   * Initializes the table manager. This method overrides VerticalTabbedModule.moduleInit().
   * It's called after DOM is ready and this.$container is set by the parent class.
   */
  moduleInit() {
    super.moduleInit(); // Calls VerticalTabbedModule.moduleInit() which sets up $container etc.


    if (!this.$container || !this.$container.length) {
      if (window.ProductEstimatorSettingsInstance && typeof window.ProductEstimatorSettingsInstance.showNotice === 'function') {
        window.ProductEstimatorSettingsInstance.showNotice(`Critical error: Table manager UI container #${this.settings.tab_id} missing.`, 'error');
      }
      return;
    }

    try {
      this._validateSettings();
    } catch (error) {
      if (window.ProductEstimatorSettingsInstance && typeof window.ProductEstimatorSettingsInstance.showNotice === 'function') {
        window.ProductEstimatorSettingsInstance.showNotice(
          `Error initializing table manager for ${this.settings.tab_id}: Configuration validation failed. Check console. Details: ${error.message}`, 'error'
        );
      }
      return;
    }

    this.cacheDOM();
    if (this._checkEssentialDOM()) {
      this.bindEvents();
      this.updateNoItemsMessageVisibility();
      this.$(document).trigger(`admin_table_manager_ready_${this.settings.tab_id}`, [this]);
    } else {
      if (window.ProductEstimatorSettingsInstance && typeof window.ProductEstimatorSettingsInstance.showNotice === 'function') {
        const tabDisplayName = this.settings.tab_id;
        window.ProductEstimatorSettingsInstance.showNotice(
          `Error initializing UI components for ${tabDisplayName}. Some parts may not work. Check console for missing DOM elements.`, 'error'
        );
      }
    }
  }

  _checkEssentialDOM() {
    let essentialFound = true;
    if (!this.settings || !this.settings.selectors) {
      return false;
    }
    const essentialSelectors = ['formContainer', 'form', 'addButton', 'listTableBody', 'listTableContainer', 'listTable', 'noItemsMessage', 'formTitle', 'idInput', 'saveButton', 'cancelButton'];
    for (const key of essentialSelectors) {
      if (!this.dom[key] || !this.dom[key].length) {
        essentialFound = false;
      }
    }
    return essentialFound;
  }

  cacheDOM() {
    this.dom = {};
    if (!this.settings || !this.settings.selectors) {
      return;
    }
    if (this.$container && this.$container.length) {
      for (const key in this.settings.selectors) {
        if (Object.prototype.hasOwnProperty.call(this.settings.selectors, key)) {
          // Special handling for idInput to only select the one in our form
          if (key === 'idInput') {
            // Find the hidden item_id input within this specific form
            this.dom[key] = this.$container.find(this.settings.selectors.form).find(this.settings.selectors[key]);
          } else {
            this.dom[key] = this.$container.find(this.settings.selectors[key]);
          }
        }
      }
    } else {
      this.logger.warn('Container not found for DOM caching');
    }
  }

  /**
   * Binds event handlers to DOM elements.
   * This method sets up all the common event handling for the table manager.
   */
  bindEvents() {
    if (!this.dom || Object.keys(this.dom).length === 0) {
      return;
    }
    this.dom.addButton?.on('click.adminTableManager', this.handleAddNew.bind(this));

    const editButtonSelector = this.settings.selectors?.editButton;
    const deleteButtonSelector = this.settings.selectors?.deleteButton;

    if (this.dom.listTableBody && this.dom.listTableBody.length) {
      // Bind standard action buttons
      if (editButtonSelector) {
        this.dom.listTableBody.on('click.adminTableManager', editButtonSelector, this.handleEdit.bind(this));
      } else {
      }
      if (deleteButtonSelector) {
        this.dom.listTableBody.on('click.adminTableManager', deleteButtonSelector, this.handleDelete.bind(this));
      } else {
      }

      // Bind custom action buttons if they exist
      this.bindCustomActionButtons();
    } else {
    }

    this.dom.form?.on('submit.adminTableManager', this.handleSubmit.bind(this));
    this.dom.cancelButton?.on('click.adminTableManager', this.handleCancel.bind(this));

    this.dom.form?.on('change.adminTableManager input.adminTableManager', ':input', () => {
      this.formModified = true;
    });

  }

  /**
   * Binds event handlers for custom action buttons.
   * Child classes should override this method to bind their custom action buttons.
   */
  bindCustomActionButtons() {
    // Base implementation does nothing
    // Child classes should override to handle their custom action buttons
    // Example implementation:
    //
    // if (this.dom.listTableBody) {
    //   this.dom.listTableBody.on('click.adminTableManager', '.pe-view-product-button', this.handleViewProduct.bind(this));
    // }
  }

  handleAddNew(e) {
    e.preventDefault();
    this.isEditMode = false;
    this.currentItemId = null;
    this.resetForm();
    this.dom.formTitle?.text(this.settings.i18n.addItemFormTitle || 'Add New Item');
    this.dom.saveButton?.text(this.settings.i18n.addItemButtonLabel || this.settings.i18n.saveChangesButton || 'Save Item');
    this.dom.formContainer?.slideDown();
    this.dom.addButton?.hide();
  }

  handleEdit(e) {
    e.preventDefault();
    const $button = this.$(e.currentTarget);
    const $row = $button.closest(this.settings.selectors.listItemRow);
    const itemId = $row.data('id');


    if (!itemId) {
      this.showNotice('Error: Could not determine the item to edit.', 'error');
      return;
    }

    this.isEditMode = true;
    this.currentItemId = itemId;
    this.resetForm();

    if (this.dom.idInput && this.dom.idInput.length) {
      this.dom.idInput.val(this.currentItemId);
      
      // Set data attribute to track that we've set the ID (for debugging purposes)
      this.dom.idInput.attr('data-item-set', 'true');
    } else {
      this.logger.warn('Could not find idInput field to set ID. Check DOM selectors.');
    }

    this.dom.formTitle?.text(this.settings.i18n.editItemFormTitle || `Edit Item #${itemId}`);
    this.dom.saveButton?.text(this.settings.i18n.updateChangesButton || 'Update Item');

    if (this.settings.actions && this.settings.actions.get_item) {
      this.showFormLoadingSpinner(true, this.dom.saveButton);
      ajax.ajaxRequest({
        url: this.settings.ajaxUrl,
        data: {
          action: this.settings.actions.get_item,
          nonce: this.settings.nonce, // This should be the item-specific nonce
          item_id: itemId,
          option_name: this.settings.option_name,
          tab_id: this.settings.tab_id,
        }
      })
        .then(response => {
          if (response && response.item && typeof response.item === 'object') {
            this.populateFormWithData(response.item);
            this.dom.formContainer?.slideDown();
            this.dom.addButton?.hide();
          } else {
            const errorMsg = (response && response.message) ? response.message : (this.settings.i18n.errorLoadingItem || 'Error loading item details.');
            this.showNotice(errorMsg, 'error');
                }
        })
        .catch(error => {
          this.showNotice(error.message || this.settings.i18n.errorLoadingItem || 'AJAX error loading item.', 'error');
        })
        .finally(() => {
          this.showFormLoadingSpinner(false, this.dom.saveButton);
        });
    } else {
      const itemDataFromButton = $button.data();
      if (Object.keys(itemDataFromButton).length > 1) {
        itemDataFromButton.id = itemId;
        this.populateFormWithData(itemDataFromButton);
      } else {
        this.showNotice('Note: Full item details might not be loaded. Displaying basic form for editing.', 'info');
      }
      this.dom.formContainer?.slideDown();
      this.dom.addButton?.hide();
    }
  }

  handleDelete(e) {
    e.preventDefault();
    const $button = this.$(e.currentTarget);
    const $row = $button.closest(this.settings.selectors.listItemRow);
    const itemId = $row.data('id');

    if (!itemId) {
      this.showNotice('Error: Could not determine item to delete.', 'error');
      return;
    }

    if (!confirm(this.settings.i18n.confirmDelete || 'Are you sure you want to delete this item?')) {
      return;
    }

    const originalButtonText = $button.text();
    $button.prop('disabled', true).text(this.settings.i18n.deleting || 'Deleting...');

    ajax.ajaxRequest({
      url: this.settings.ajaxUrl,
      data: {
        action: this.settings.actions.delete_item,
        nonce: this.settings.nonce, // Item-specific nonce
        item_id: itemId,
        option_name: this.settings.option_name,
        tab_id: this.settings.tab_id,
      }
    })
      .then(response => {
        const isSuccess = response && (response.success === true || (response.itemId && response.message));
        if (isSuccess) {
          this.showNotice((response.data && response.data.message) || response.message || this.settings.i18n.itemDeletedSuccess || 'Item deleted.', 'success');
          $row.fadeOut(300, () => {
            $row.remove();
            this.updateNoItemsMessageVisibility();
          });
        } else {
          this.showNotice((response && response.message) || (response && response.data && response.data.message) || this.settings.i18n.errorDeletingItem || 'Error deleting item.', 'error');
          $button.prop('disabled', false).text(originalButtonText);
        }
      })
      .catch(error => {
        this.showNotice(error.message || this.settings.i18n.errorDeletingItem || 'AJAX error deleting item.', 'error');
        $button.prop('disabled', false).text(originalButtonText);
      });
  }

  handleSubmit(e) {
    e.preventDefault();

    if (!this.validateForm()) {
      this.showNotice(this.settings.i18n.validationFailed || 'Please correct the errors in the form.', 'error');
      return;
    }
    this.showFormLoadingSpinner(true, this.dom.saveButton);

    const determinedAction = this.isEditMode ? this.settings.actions.update_item : this.settings.actions.add_item;

    if (!determinedAction) {
      this.showNotice(this.settings.i18n.errorSavingItem || 'Configuration error: Save action not defined.', 'error');
      this.showFormLoadingSpinner(false, this.dom.saveButton);
      return;
    }

    const dataPayload = {
      action: determinedAction,
      nonce: this.settings.nonce, // Item-specific nonce
      option_name: this.settings.option_name,
      tab_id: this.settings.tab_id,
      item_data: {}
    };

    const formFields = this.dom.form.serializeArray();
    formFields.forEach(field => {
      const fieldName = field.name;
      const fieldValue = field.value;
      
      // Find the field element
      const $fieldElement = this.dom.form.find(`[name="${fieldName}"]`);
      
      // Check for renamed item_id field (which now has a suffix)
      const originalName = $fieldElement.data('original-name');
      
      // Don't include the item_id field from the form data
      // We'll use this.currentItemId for edit mode instead
      if (originalName === 'item_id' || fieldName === 'item_id') {
        // Skip item_id field as we handle it separately below
        return;
      }
      
      // Use the standard name for other fields if they have an original-name
      const nameToUse = originalName || fieldName;
      
      if (nameToUse.endsWith('[]')) {
        const actualName = nameToUse.slice(0, -2);
        if (!dataPayload.item_data[actualName]) {
          dataPayload.item_data[actualName] = [];
        }
        dataPayload.item_data[actualName].push(fieldValue);
      } else {
        dataPayload.item_data[nameToUse] = fieldValue;
      }
    });
    
    // Always use the currentItemId value for edit operations
    // This ensures consistency and avoids issues with renamed form fields

    if (this.isEditMode && this.currentItemId) {
      dataPayload.item_id = this.currentItemId;
    }


    ajax.ajaxRequest({
      url: this.settings.ajaxUrl,
      data: dataPayload
    })
      .then(response => {

        // Enhanced response validation with detailed logging
        if (!response) {
          this.showNotice(this.settings.i18n.errorSavingItem || 'Error: Empty response from server', 'error');
          return;
        }


        if (response && response.item) {
          this.showNotice(response.message || this.settings.i18n.itemSavedSuccess || 'Item saved.', 'success');

          // CRITICAL: Handling the first item scenario directly
          const isFirstItem = !this.dom.listTableBody.find('tr').length;

          if (this.isEditMode) {
            this.updateTableRow(response.item);
          } else {
            this.addTableRow(response.item);

            // Special handling for first item
            if (isFirstItem) {
              this.dom.listTable.show();
              this.dom.noItemsMessage.hide();

              // Force DOM recalculation/repaint for the table
              void this.dom.listTable[0].offsetHeight;
            }
          }

          this.dom.formContainer?.slideUp();
          this.dom.addButton?.show();
          this.resetForm();
          this.isEditMode = false;
          this.currentItemId = null;
          this.formModified = false;
        } else {
          const errorMsg = (response && response.message) ? response.message : this.settings.i18n.errorSavingItem || 'Error saving item or response format incorrect.';
          const errorsDetail = (response && response.errors) ? `<br><pre>${JSON.stringify(response.errors, null, 2)}</pre>` : '';
          this.showNotice(errorMsg + errorsDetail, 'error');
        }
      })
      .catch(error => {
        const errorMsg = error.message || this.settings.i18n.errorSavingItem || 'AJAX error during save.';
        this.showNotice(errorMsg, 'error');
      })
      .finally(() => {
        this.showFormLoadingSpinner(false, this.dom.saveButton);
      });
  }

  handleCancel(e) {
    e.preventDefault();
    if (this.formModified) {
      if (!confirm(this.settings.i18n.confirmCancelEditing || "You have unsaved changes. Are you sure you want to cancel?")) {
        return;
      }
    }
    this.dom.formContainer?.slideUp();
    this.dom.addButton?.show();
    this.resetForm();
    this.isEditMode = false;
    this.currentItemId = null;
    this.formModified = false;
  }

  resetForm() {
    this.dom.form[0]?.reset();
    if (this.dom.idInput && this.dom.idInput.length) {
      this.dom.idInput.val('');
      // Also clear the data attribute we set for debugging
      this.dom.idInput.removeAttr('data-item-set');
    } else {
      this.logger.warn('idInput not found during form reset');
    }
    this.formModified = false;
    this.dom.form?.find('.error').removeClass('error');
    this.dom.form?.find('.field-error').remove();
  }

  /**
   * Populates the form with data from an item
   * This new implementation uses a cleaner, more systematic approach
   * @param {Object} itemData - The data to populate the form with
   */
  populateFormWithData(itemData) {
    if (!itemData) {
      this.logger.warn('populateFormWithData called with empty itemData');
      return;
    }

    // Log the item data we're trying to populate for debugging
    this.logger.log('Populating form with data:', itemData);

    // First set the ID field if it exists
    if (itemData.id && this.dom.idInput && this.dom.idInput.length) {
      this.dom.idInput.val(itemData.id);
      this.dom.idInput.attr('data-item-set', 'true');
      this.logger.log('Set ID field to:', itemData.id);
    } else if (!this.dom.idInput || !this.dom.idInput.length) {
      this.logger.warn('ID input field not found in form');
    }

    // Get all form inputs except the hidden ID field we already handled
    const $formInputs = this.dom.form.find('input, select, textarea').not('.pe-item-id-input');
    
    // Process each input field
    $formInputs.each((index, element) => {
      const $input = this.$(element);
      const fieldName = $input.attr('name');
      
      if (!fieldName) return; // Skip inputs without a name
      
      // Handle array notation for multi-selects
      const baseName = fieldName.endsWith('[]') ? 
        fieldName.substring(0, fieldName.length - 2) : 
        fieldName;
      
      // Special handling for product upgrades module field mapping
      let dataField = baseName;
      
      // Map form field names to data field names for product upgrades
      if (this.settings.tab_id === 'product_upgrades') {
        if (baseName === 'upgrade_title') dataField = 'title';
        if (baseName === 'upgrade_description') dataField = 'description';
      }
      
      // Check if this field exists in the item data
      if (itemData[dataField] !== undefined) {
        const fieldValue = itemData[dataField];
        this.logger.log(`Setting field ${baseName} from data field ${dataField} with value:`, fieldValue);
        
        // Set the field value based on field type
        this._setFieldValue($input, fieldValue);
      } else if (itemData[baseName] !== undefined) {
        // Try with the original field name if the mapped one wasn't found
        const fieldValue = itemData[baseName];
        this.logger.log(`Setting field ${baseName} with value:`, fieldValue);
        
        // Set the field value based on field type
        this._setFieldValue($input, fieldValue);
      }
    });
    
    this.formModified = false;
  }
  
  /**
   * Helper method to set a field value based on its type
   * @private
   * @param {jQuery} $field - The jQuery field object
   * @param {*} fieldValue - The value to set
   */
  _setFieldValue($field, fieldValue) {
    if ($field.is('select[multiple]')) {
      this._setMultiSelectValue($field, fieldValue);
    } else if ($field.is(':checkbox')) {
      $field.prop('checked', !!fieldValue);
    } else if ($field.is(':radio')) {
      this.dom.form.find(`[name="${$field.attr('name')}"][value="${fieldValue}"]`).prop('checked', true);
    } else if ($field.is('textarea')) {
      $field.val(fieldValue);
      
      // Handle TinyMCE editor
      const editorId = $field.attr('id');
      if (editorId && typeof window.tinyMCE !== 'undefined' && window.tinyMCE.get(editorId)) {
        window.tinyMCE.get(editorId).setContent(fieldValue);
      }
    } else {
      // Regular inputs
      $field.val(fieldValue);
    }
  }
  
  /**
   * Helper method to set multi-select values
   * @private
   * @param {jQuery} $field - The jQuery select field object
   * @param {Array} fieldValue - The array of values to set
   */
  _setMultiSelectValue($field, fieldValue) {
    if (!Array.isArray(fieldValue)) {
      this.logger.warn(`Expected array for select multiple but got:`, fieldValue);
      return;
    }
    
    // Convert all values to strings for proper comparison
    const stringValues = fieldValue.map(val => String(val));
    
    // Set the value directly first
    $field.val(stringValues);
    
    // Handle Select2 specially
    if ($field.hasClass('pe-select2')) {
      // For Select2, we need to handle initialization and UI updates
      
      // Wait a bit to ensure Select2 is initialized
      setTimeout(() => {
        // For modern Select2 (4.0+)
        if (typeof jQuery.fn.select2 === 'function') {
          // Clear all current selections
          $field.val(null).trigger('change');
          
          // For each value, find the matching option and select it
          stringValues.forEach(value => {
            const $option = $field.find(`option[value="${value}"]`);
            if ($option.length) {
              $option.prop('selected', true);
            }
          });
          
          // Trigger final change to update the UI
          $field.trigger('change');
        }
      }, 100); // Small delay to ensure Select2 is ready
    }
  }

  validateForm() {
    let isValid = true;
    this.dom.form?.find('.error').removeClass('error');
    this.dom.form?.find('.field-error').remove();

    this.dom.form?.find('[data-is-required="true"], .is-required').each((index, el) => {
      const $field = this.$(el);
      let value = $field.val();

      if ($field.is(':checkbox')) {
        if (!$field.is(':checked')) {
          this.showFieldError($field.closest('label').length ? $field.closest('label') : $field, this.settings.i18n.fieldRequired || 'This field must be checked.');
          isValid = false;
        }
      } else {
        if (typeof value === 'string') value = value.trim();
        if (value === null || value === undefined || value === '' || ($field.is('select') && !value) ) {
          this.showFieldError($field, this.settings.i18n.fieldRequired || 'This field is required.');
          isValid = false;
        }
      }
    });
    return isValid;
  }

  addTableRow(itemData) {

    // Debug table state before adding row

    // Create the row
    const $row = this.createTableRow(itemData);

    // Add the row to the table
    if ($row && this.dom.listTableBody && this.dom.listTableBody.length) {
      this.dom.listTableBody.append($row);

      // Always make table visible after adding a row, and hide the "no items" message
      if (this.dom.listTable) {
        this.dom.listTable.show();
      }

      if (this.dom.noItemsMessage) {
        this.dom.noItemsMessage.hide();
      }

      // Skip updateNoItemsMessageVisibility() since we're explicitly handling visibility

      // Debug table state after adding row
    } else {
    }
  }

  updateTableRow(itemData) {
    if (!itemData.id) {
      return;
    }
    if (!this.settings.selectors || !this.settings.selectors.listItemRow) {
      return;
    }
    const $existingRow = this.dom.listTableBody?.find(`${this.settings.selectors.listItemRow}[data-id="${itemData.id}"]`);
    if ($existingRow && $existingRow.length) {
      const $newRow = this.createTableRow(itemData);
      if ($newRow) {
        $existingRow.replaceWith($newRow);
      } else {
      }
    } else {
      this.addTableRow(itemData);
    }
  }

  /**
   * Creates a table row from item data.
   * This method provides a common implementation for creating table rows based on
   * the table_columns setting provided from PHP.
   *
   * @param {Object} itemData - The item data for the row.
   * @returns {jQuery} - The jQuery object representing the row.
   */
  createTableRow(itemData) {
    if (!itemData || !itemData.id) {
      // Return a valid jQuery object for a row, even for an error.
      const colspan = this.dom.listTable?.find('thead th').length || 4;
      return this.$(`<tr><td colspan="${colspan}">Error: Invalid item data provided to createTableRow.</td></tr>`);
    }

    // Get column information from the settings passed from PHP
    const tableColumns = this.settings.table_columns || {};
    if (Object.keys(tableColumns).length === 0) {
      const colspan = this.dom.listTable?.find('thead th').length || 4;
      return this.$(`<tr><td colspan="${colspan}">Error: table_columns data missing in settings for ${this.settings.tab_id}.</td></tr>`);
    }

    // Get selector values
    const selectors = this.settings.selectors || {};
    const listItemRowSelector = selectors.listItemRow || 'tr'; // Base class might use this if defined
    const editButtonClass = (selectors.editButton || '.pe-edit-item-button').replace(/^\./, '');
    const deleteButtonClass = (selectors.deleteButton || '.pe-delete-item-button').replace(/^\./, '');

    // Get i18n strings
    const i18n = this.settings.i18n || {};

    // Extract just the tag name without any attribute selectors
    const tagName = listItemRowSelector.split('.')[0].replace(/\[(.*?)\]/g, '');

    // Generate a unique row ID based on tab ID, current timestamp, and item ID
    const uniqueRowIdPrefix = `${this.settings.tab_id}_row_${itemData.id}_`;
    const uniqueRowId = `${uniqueRowIdPrefix}${Date.now()}`;

    // Create the row with the correct tag, data-id attribute, and unique ID
    const $row = this.$(`<${tagName} data-id="${itemData.id}" id="${uniqueRowId}"></${tagName}>`);

    // If listItemRowSelector includes classes, add them: e.g., 'tr.my-custom-row-class'
    if (listItemRowSelector.includes('.')) {
      $row.addClass(listItemRowSelector.substring(listItemRowSelector.indexOf('.') + 1).replace(/\./g, ' '));
    }

    // Create each cell using the column IDs from PHP
    Object.entries(tableColumns).forEach(([columnId, columnTitle]) => {
      // Generate unique cell ID based on row ID and column
      const uniqueCellId = `${uniqueRowId}_cell_${columnId}`;
      
      const $cell = this.$('<td></td>')
        .addClass(`column-${columnId}`) // Match the PHP class naming convention
        .attr('data-colname', columnTitle) // Set the column title for responsive display
        .attr('id', uniqueCellId); // Add unique ID to cell

      // Hook points for column customization:
      // 1. Child class can implement a specific method for a column
      // 2. Generic actions column handler
      // 3. Default text display

      // Check if the child class has a method to populate specific column content
      const methodName = `populateColumn_${columnId.replace(/[^a-zA-Z0-9_]/g, '_')}`;
      if (typeof this[methodName] === 'function') {
        // Let the child class handle this specific column
        this[methodName]($cell, itemData, columnId);
      } else if (columnId === 'item_actions' || columnId.endsWith('_actions')) {
        // Default handling for actions column
        $cell.addClass('actions');

        // Generate unique button IDs
        const editButtonId = `${uniqueRowId}_edit_btn`;
        const deleteButtonId = `${uniqueRowId}_delete_btn`;

        // Create edit button with unique ID
        const $editButton = this.$('<button></button>')
          .attr('type', 'button')
          .attr('id', editButtonId)
          .addClass(`button button-small ${editButtonClass}`)
          .text(i18n.editButtonLabel || 'Edit')
          .data('id', itemData.id);

        // Create delete button with unique ID
        const $deleteButton = this.$('<button></button>')
          .attr('type', 'button')
          .attr('id', deleteButtonId)
          .addClass(`button button-small ${deleteButtonClass}`)
          .text(i18n.deleteButtonLabel || 'Delete')
          .data('id', itemData.id);

        $cell.append($editButton, ' ', $deleteButton);
      } else {
        // Default handling for other columns - just use the display field if available
        const displayField = `${columnId}_display`;
        const displayValue = itemData[displayField] || itemData[columnId] || '';
        $cell.text(displayValue);
      }

      // Add the cell to the row
      $row.append($cell);
    });

    // Allow child classes to perform post-processing on the row
    if (typeof this.afterRowCreated === 'function') {
      this.afterRowCreated($row, itemData);
    }

    return $row;
  }

  updateNoItemsMessageVisibility() {
    if (!this.settings.selectors || !this.settings.selectors.listItemRow) {
      return;
    }

    // Debug info

    if (this.dom.noItemsMessage && this.dom.noItemsMessage.length && this.dom.listTableBody && this.dom.listTable) {
      const rowSelector = this.settings.selectors.listItemRow;
      const $foundRows = this.dom.listTableBody.find(rowSelector);
      const hasItems = $foundRows.length > 0;


      if (hasItems) {
        this.dom.noItemsMessage.hide();
        this.dom.listTable.show();
      } else {
        this.dom.noItemsMessage.show();
        this.dom.listTable.hide();
      }
    } else {
    }
  }

  showFormLoadingSpinner(isLoading, $button) {
    const $btn = $button || this.dom.saveButton;
    if (!$btn || !$btn.length) return;

    const originalTextKey = 'original-text';
    const savingText = (this.settings.i18n && this.settings.i18n.saving) || 'Saving...';

    if (isLoading) {
      $btn.prop('disabled', true).addClass('pe-loading');
      if (!$btn.data(originalTextKey)) {
        const currentText = $btn.is('input, textarea, select') ? $btn.val() : $btn.text();
        $btn.data(originalTextKey, currentText);
      }
      if ($btn.is('input, textarea, select')) $btn.val(savingText); else $btn.text(savingText);
    } else {
      $btn.prop('disabled', false).removeClass('pe-loading');
      if ($btn.data(originalTextKey)) {
        const originalText = $btn.data(originalTextKey);
        if ($btn.is('input, textarea, select')) $btn.val(originalText); else $btn.text(originalText);
        $btn.removeData(originalTextKey);
      }
    }
  }
}

export default AdminTableManager;
