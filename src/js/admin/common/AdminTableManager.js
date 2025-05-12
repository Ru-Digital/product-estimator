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
    console.log('[AdminTableManager] Constructor received config:', JSON.stringify(config)); // Log at the very start

    // Configuration for the VerticalTabbedModule parent class
    const vtmConfig = {
      ...config, // Includes mainTabId, localizedDataName
      defaultSubTabId: config.mainTabId + '-atm-default-subcontent',
      ajaxActionPrefix: `atm_form_save_${config.mainTabId}`
    };

    console.log('[AdminTableManager] vtmConfig created:', JSON.stringify(vtmConfig));

    super(vtmConfig); // Calls VerticalTabbedModule constructor

    this.$ = jQuery; // jQuery utility

    this.config = config; // <<<< ADD THIS LINE


    // --- CORRECTED LOGGER INITIALIZATION ---
    // Use `config.mainTabId` (from this constructor's direct argument `config`)
    // This `config` is guaranteed to have `mainTabId` as passed by ProductAdditionsSettingsModule.

    console.log('[AdminTableManager] About to initialize logger. Current config:', JSON.stringify(config));
    console.log('[AdminTableManager] Value of config.mainTabId:', config.mainTabId); // What does this print?
    const loggerName = `AdminTableManager:${config.mainTabId || 'Generic'}`;
    console.log('[AdminTableManager] Constructed logger name:', loggerName);

    this.logger = createLogger(loggerName); // Pass the pre-constructed string
    this.logger = createLogger(`AdminTableManager:${config.mainTabId || 'Generic'}`);

    // `this.settings` is initialized by the `super(vtmConfig)` call chain (ProductEstimatorSettings).
    // `this.settings.tab_id` will hold the mainTabId.
    // A check for its presence after super() is good practice.
    if (!this.settings || !this.settings.tab_id) {
      this.logger.error('AdminTableManager Critical Error: this.settings.tab_id (mainTabId) is missing after super() call. This indicates a problem with config propagation or parent constructor.', {
        passedConfigToVTM: vtmConfig, // What was passed to VerticalTabbedModule
        effectiveSettings: this.settings // What ProductEstimatorSettings established
      });
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
      this.logger.error(`AdminTableManager Critical Error: this.settings or this.settings.tab_id is undefined. This usually means ProductEstimatorSettings/VerticalTabbedModule constructor failed to initialize it. Config used by AdminTableManager:`, { vtmConfigUsedForSuper: this.vtmConfig });
      throw new Error(`AdminTableManager: Essential property 'this.settings.tab_id' was not initialized by the parent class. Cannot validate settings.`);
    }

    if (Object.keys(this.settings).length === 0) {
      let errorMsg = `AdminTableManager: Settings (this.settings) is an empty object`;
      if (this.settingsObjectName) {
        errorMsg += ` (expected from window.${this.settingsObjectName}). This might happen if the global object is empty or not correctly populated.`;
      }
      this.logger.error(errorMsg);
      throw new Error(errorMsg + ` Cannot proceed with empty settings for tab "${this.settings.tab_id}".`);
    }

    const required = {
      actions: ['add_item', 'update_item', 'delete_item'],
      selectors: ['formContainer', 'form', 'addButton', 'listTableBody', 'editButton', 'deleteButton', 'idInput', 'saveButton', 'cancelButton', 'noItemsMessage', 'formTitle', 'listItemRow', 'listTableContainer', 'listTable'],
      i18n_keys: ['confirmDelete', 'itemSavedSuccess', 'itemDeletedSuccess', 'errorSavingItem', 'errorDeletingItem', 'addItemButtonLabel', 'editItemFormTitle', 'saving', 'deleting', 'editButtonLabel', 'deleteButtonLabel'],
    };

    let allValid = true;
    if (this.settings.ajaxUrl === undefined) { this.logger.error(`Missing required setting: ajaxUrl`); allValid = false; }
    if (this.settings.nonce === undefined) { this.logger.error(`Missing required setting: nonce`); allValid = false; }
    if (this.settings.option_name === undefined) { this.logger.error(`Missing required setting: option_name`); allValid = false; }

    if (this.settings.actions) {
      for (const key of required.actions) {
        if (this.settings.actions[key] === undefined) {
          this.logger.error(`Missing required action: actions.${key} (expected in ${this.settingsObjectName}) for tab "${this.settings.tab_id}"`);
          allValid = false;
        }
      }
    } else {
      this.logger.error(`Required setting object 'actions' is missing from settings for tab "${this.settings.tab_id}".`);
      allValid = false;
    }

    if (this.settings.selectors) {
      for (const key of required.selectors) {
        if (this.settings.selectors[key] === undefined) {
          this.logger.error(`Missing required selector: selectors.${key} (expected in ${this.settingsObjectName}) for tab "${this.settings.tab_id}"`);
          allValid = false;
        }
      }
    } else {
      this.logger.error(`Required setting object 'selectors' is missing from settings for tab "${this.settings.tab_id}".`);
      allValid = false;
    }

    if (this.settings.i18n) {
      for (const key of required.i18n_keys) {
        if (this.settings.i18n[key] === undefined) {
          this.logger.warn(`Potentially missing i18n string: i18n.${key} (in ${this.settingsObjectName}) for tab "${this.settings.tab_id}"`);
        }
      }
    } else {
      this.logger.error(`Required setting object 'i18n' is missing from settings for tab "${this.settings.tab_id}".`);
      allValid = false;
    }

    if (!allValid) {
      throw new Error(`AdminTableManager: Settings validation failed due to missing critical settings in this.settings for tab "${this.settings.tab_id}". Check console for details.`);
    }
    this.logger.log('Settings (this.settings) validated successfully for tab:', this.settings.tab_id);
  }

  /**
   * Initializes the table manager. This method overrides VerticalTabbedModule.moduleInit().
   * It's called after DOM is ready and this.$container is set by the parent class.
   */
  moduleInit() {
    super.moduleInit(); // Calls VerticalTabbedModule.moduleInit() which sets up $container etc.

    this.logger.log('AdminTableManager: Overridden moduleInit() called for tab:', this.settings.tab_id);

    if (!this.$container || !this.$container.length) {
      this.logger.error(`AdminTableManager: Main container #${this.settings.tab_id} not found after super.moduleInit(). Module will not initialize further.`);
      if (window.ProductEstimatorSettingsInstance && typeof window.ProductEstimatorSettingsInstance.showNotice === 'function') {
        window.ProductEstimatorSettingsInstance.showNotice(`Critical error: Table manager UI container #${this.settings.tab_id} missing.`, 'error');
      }
      return;
    }

    try {
      this._validateSettings();
    } catch (error) {
      this.logger.error(`AdminTableManager: Settings validation failed for tab "${this.settings.tab_id}". Halting init.`, error);
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
      this.logger.log('AdminTableManager specific setup completed for tab:', this.settings.tab_id);
      this.$(document).trigger(`admin_table_manager_ready_${this.settings.tab_id}`, [this]);
    } else {
      this.logger.error('AdminTableManager initialization failed: missing essential DOM elements for tab:', this.settings.tab_id);
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
      this.logger.error('AdminTableManager _checkEssentialDOM: Invariant violated - this.settings or this.settings.selectors missing after _validateSettings.');
      return false;
    }
    const essentialSelectors = ['formContainer', 'form', 'addButton', 'listTableBody', 'listTableContainer', 'listTable', 'noItemsMessage', 'formTitle', 'idInput', 'saveButton', 'cancelButton'];
    for (const key of essentialSelectors) {
      if (!this.dom[key] || !this.dom[key].length) {
        this.logger.error(`Essential DOM element for AdminTableManager not found using selector key '${key}': Expected selector string was "${this.settings.selectors[key]}" within container #${this.settings.tab_id}.`);
        essentialFound = false;
      }
    }
    return essentialFound;
  }

  cacheDOM() {
    this.dom = {};
    if (!this.settings || !this.settings.selectors) {
      this.logger.error('AdminTableManager cacheDOM: Invariant violated - this.settings or this.settings.selectors missing after _validateSettings.');
      return;
    }
    if (this.$container && this.$container.length) {
      for (const key in this.settings.selectors) {
        if (Object.prototype.hasOwnProperty.call(this.settings.selectors, key)) {
          this.dom[key] = this.$container.find(this.settings.selectors[key]);
        }
      }
    } else {
      this.logger.error('AdminTableManager cacheDOM: this.$container is not available or empty. DOM elements cannot be cached.');
    }
    this.logger.log('DOM elements cached for tab:', this.settings.tab_id);
  }

  bindEvents() {
    if (!this.dom || Object.keys(this.dom).length === 0) {
      this.logger.error("AdminTableManager bindEvents: DOM elements not cached (this.dom is empty/undefined). Cannot bind events.");
      return;
    }
    this.dom.addButton?.on('click.adminTableManager', this.handleAddNew.bind(this));

    const editButtonSelector = this.settings.selectors?.editButton;
    const deleteButtonSelector = this.settings.selectors?.deleteButton;

    if (this.dom.listTableBody && this.dom.listTableBody.length) {
      if (editButtonSelector) {
        this.dom.listTableBody.on('click.adminTableManager', editButtonSelector, this.handleEdit.bind(this));
      } else {
        this.logger.warn('Edit button selector (settings.selectors.editButton) is undefined. Skipping bind for edit.');
      }
      if (deleteButtonSelector) {
        this.dom.listTableBody.on('click.adminTableManager', deleteButtonSelector, this.handleDelete.bind(this));
      } else {
        this.logger.warn('Delete button selector (settings.selectors.deleteButton) is undefined. Skipping bind for delete.');
      }
    } else {
      this.logger.warn('listTableBody DOM element not found for tab:', this.settings.tab_id, '- Edit/delete events for items not bound.');
    }

    this.dom.form?.on('submit.adminTableManager', this.handleSubmit.bind(this));
    this.dom.cancelButton?.on('click.adminTableManager', this.handleCancel.bind(this));

    this.dom.form?.on('change.adminTableManager input.adminTableManager', ':input', () => {
      this.formModified = true;
    });
    this.logger.log('AdminTableManager common events bound for tab:', this.settings.tab_id);
  }

  handleAddNew(e) {
    e.preventDefault();
    this.logger.log('Add New clicked for tab:', this.settings.tab_id);
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

    this.logger.log('Edit clicked for item ID:', itemId, 'on tab:', this.settings.tab_id);

    if (!itemId) {
      this.logger.error('Could not find item ID for editing on tab:', this.settings.tab_id);
      this.showNotice('Error: Could not determine the item to edit.', 'error');
      return;
    }

    this.isEditMode = true;
    this.currentItemId = itemId;
    this.resetForm();

    if (this.dom.idInput && this.dom.idInput.length) {
      this.dom.idInput.val(this.currentItemId);
    } else {
      this.logger.warn("Hidden ID input (dom.idInput) not found in form. Item ID might not be set correctly for submission during edit.");
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
            this.logger.error('Error loading item details for edit:', response);
          }
        })
        .catch(error => {
          this.showNotice(error.message || this.settings.i18n.errorLoadingItem || 'AJAX error loading item.', 'error');
          this.logger.error('AJAX error loading item for editing:', error);
        })
        .finally(() => {
          this.showFormLoadingSpinner(false, this.dom.saveButton);
        });
    } else {
      this.logger.warn(`No 'get_item' action defined in settings.actions for tab "${this.settings.tab_id}".`);
      const itemDataFromButton = $button.data();
      if (Object.keys(itemDataFromButton).length > 1) {
        itemDataFromButton.id = itemId;
        this.populateFormWithData(itemDataFromButton);
      } else {
        this.logger.log("Button data attributes did not yield sufficient data for form population.");
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
    this.logger.log('Delete clicked for item ID:', itemId, 'on tab:', this.settings.tab_id);

    if (!itemId) {
      this.logger.error('Could not find item ID for deletion on tab:', this.settings.tab_id);
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
        this.logger.error('AJAX error deleting item:', error);
        $button.prop('disabled', false).text(originalButtonText);
      });
  }

  handleSubmit(e) {
    e.preventDefault();
    this.logger.log('Form submitted. Edit mode:', this.isEditMode, 'Current Item ID:', this.currentItemId);

    if (!this.validateForm()) {
      this.logger.warn('Form validation failed for tab:', this.settings.tab_id);
      this.showNotice(this.settings.i18n.validationFailed || 'Please correct the errors in the form.', 'error');
      return;
    }
    this.showFormLoadingSpinner(true, this.dom.saveButton);

    const determinedAction = this.isEditMode ? this.settings.actions.update_item : this.settings.actions.add_item;

    if (!determinedAction) {
      this.logger.error('Form submission action (add_item or update_item) is not defined in settings.actions for tab:', this.settings.tab_id);
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
      if (fieldName.endsWith('[]')) {
        const actualName = fieldName.slice(0, -2);
        if (!dataPayload.item_data[actualName]) {
          dataPayload.item_data[actualName] = [];
        }
        dataPayload.item_data[actualName].push(fieldValue);
      } else {
        dataPayload.item_data[fieldName] = fieldValue;
      }
    });

    if (this.isEditMode && this.currentItemId) {
      dataPayload.item_id = this.currentItemId;
    }

    this.logger.log('AJAX data payload for save:', dataPayload);

    ajax.ajaxRequest({
      url: this.settings.ajaxUrl,
      data: dataPayload
    })
      .then(response => {
        this.logger.log('AJAX save response received:', response);
        if (response && response.item) {
          this.showNotice(response.message || this.settings.i18n.itemSavedSuccess || 'Item saved.', 'success');
          if (this.isEditMode) {
            this.updateTableRow(response.item);
          } else {
            this.addTableRow(response.item);
          }
          this.dom.formContainer?.slideUp();
          this.dom.addButton?.show();
          this.resetForm();
          this.isEditMode = false;
          this.currentItemId = null;
          this.updateNoItemsMessageVisibility();
          this.formModified = false;
        } else {
          const errorMsg = (response && response.message) ? response.message : this.settings.i18n.errorSavingItem || 'Error saving item or response format incorrect.';
          const errorsDetail = (response && response.errors) ? `<br><pre>${JSON.stringify(response.errors, null, 2)}</pre>` : '';
          this.showNotice(errorMsg + errorsDetail, 'error');
          this.logger.error('Error saving item or item data missing/invalid in response structure:', response);
        }
      })
      .catch(error => {
        const errorMsg = error.message || this.settings.i18n.errorSavingItem || 'AJAX error during save.';
        this.showNotice(errorMsg, 'error');
        this.logger.error('AJAX error during save operation:', error);
      })
      .finally(() => {
        this.showFormLoadingSpinner(false, this.dom.saveButton);
      });
  }

  handleCancel(e) {
    e.preventDefault();
    this.logger.log('Cancel form clicked for tab:', this.settings.tab_id);
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
    }
    this.formModified = false;
    this.dom.form?.find('.error').removeClass('error');
    this.dom.form?.find('.field-error').remove();
    this.logger.log('Form reset for tab:', this.settings.tab_id);
  }

  populateFormWithData(itemData) {
    this.logger.log('Populating form with data (base method) for tab:', this.settings.tab_id, 'Item Data:', itemData);
    if (itemData && itemData.id) {
      if (this.dom.idInput && this.dom.idInput.length) {
        this.dom.idInput.val(itemData.id);
      } else {
        this.logger.warn("AdminTableManager: dom.idInput (hidden item ID field) not found during populateFormWithData.");
      }
    } else {
      this.logger.warn('AdminTableManager: populateFormWithData called without itemData or itemData.id. Hidden ID field not populated.', itemData);
    }
    this.formModified = false;
  }

  validateForm() {
    this.logger.log('Validating form (base method) for tab:', this.settings.tab_id);
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
    this.logger.log('Adding table row for tab:', this.settings.tab_id, itemData);
    const $row = this.createTableRow(itemData);
    if ($row && this.dom.listTableBody && this.dom.listTableBody.length) {
      this.dom.listTableBody.append($row);
      this.updateNoItemsMessageVisibility();
    } else {
      this.logger.error('Failed to add table row: createTableRow returned invalid value or listTableBody not found for tab:', this.settings.tab_id);
    }
  }

  updateTableRow(itemData) {
    this.logger.log('Updating table row for tab:', this.settings.tab_id, itemData);
    if (!itemData.id) {
      this.logger.error('Cannot update table row: itemData missing ID for tab:', this.settings.tab_id, itemData);
      return;
    }
    if (!this.settings.selectors || !this.settings.selectors.listItemRow) {
      this.logger.error('Cannot update table row: listItemRow selector missing in settings.selectors.');
      return;
    }
    const $existingRow = this.dom.listTableBody?.find(`${this.settings.selectors.listItemRow}[data-id="${itemData.id}"]`);
    if ($existingRow && $existingRow.length) {
      const $newRow = this.createTableRow(itemData);
      if ($newRow) {
        $existingRow.replaceWith($newRow);
      } else {
        this.logger.error('Failed to update table row: createTableRow returned null for tab:', this.settings.tab_id);
      }
    } else {
      this.logger.warn('Could not find row to update with ID:', itemData.id, '- Appending as new for tab:', this.settings.tab_id);
      this.addTableRow(itemData);
    }
  }

  createTableRow(itemData) {
    this.logger.error('createTableRow() must be implemented by the child class.', itemData);
    const colspan = this.dom.listTable?.find('thead th').length || 4;
    return this.$(`<tr><td colspan="${colspan}">Error: createTableRow not implemented in child for ${this.settings.tab_id}.</td></tr>`);
  }

  updateNoItemsMessageVisibility() {
    if (!this.settings.selectors || !this.settings.selectors.listItemRow) {
      this.logger.warn('Cannot update "no items" message: listItemRow selector missing in settings.selectors.');
      return;
    }
    if (this.dom.noItemsMessage && this.dom.noItemsMessage.length && this.dom.listTableBody && this.dom.listTable) {
      const hasItems = this.dom.listTableBody.find(this.settings.selectors.listItemRow).length > 0;
      if (hasItems) {
        this.dom.noItemsMessage.hide();
        this.dom.listTable.show();
      } else {
        this.dom.noItemsMessage.show();
        this.dom.listTable.hide();
      }
      this.logger.log('"No items" message visibility updated for tab:', this.settings.tab_id, 'Has items:', hasItems);
    } else {
      this.logger.warn('Cannot update "no items" message visibility: one or more DOM elements (noItemsMessage, listTableBody, listTable) are missing for tab:', this.settings.tab_id);
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
