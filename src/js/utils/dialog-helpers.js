/**
 * dialog-helpers.js
 * 
 * Utility functions for standardized dialog usage across the application.
 * Provides a consistent API for showing different types of dialogs.
 */

// Import directly from logger to avoid circular dependency
import { createLogger } from './logger';
import { labelManager } from './labels';

const logger = createLogger('DialogHelpers');

/**
 * Show a success message dialog
 * @param {object} modalManager - The modal manager instance
 * @param {string} message - The success message to display
 * @param {string} type - The entity type (product, room, estimate)
 * @param {Function} onConfirm - Callback for when the user confirms
 * @param {string} title - The dialog title
 * @returns {boolean} - Whether the dialog was shown successfully
 */
export function showSuccessDialog(modalManager, message, type = 'default', onConfirm = null, title = 'Success') {
  if (!modalManager || !modalManager.confirmationDialog) {
    logger.error('Cannot show success dialog: modal manager or confirmation dialog not available');
    return false;
  }

  // Get the appropriate title from labels if type-specific title exists
  let dialogTitle = title;
  const titleLabel = `ui_elements.dialog_title_${type}_saved`;
  if (labelManager.exists(titleLabel)) {
    dialogTitle = labelManager.get(titleLabel, title);
  }

  modalManager.confirmationDialog.show({
    title: dialogTitle,
    message: message,
    confirmText: labelManager.get('common_ui.confirmation_dialogs.buttons.ok_button.label', 'OK'),
    cancelText: false, // No cancel button
    action: 'success',
    type: type,
    showCancel: false,
    onConfirm: onConfirm
  });
  
  return true;
}

/**
 * Show an error message dialog
 * @param {object} modalManager - The modal manager instance
 * @param {string} message - The error message to display
 * @param {string} type - The entity type (product, room, estimate)
 * @param {Function} onConfirm - Callback for when the user confirms
 * @param {string} title - The dialog title
 * @returns {boolean} - Whether the dialog was shown successfully
 */
export function showErrorDialog(modalManager, message, type = 'default', onConfirm = null, title = 'Error') {
  if (!modalManager || !modalManager.confirmationDialog) {
    logger.error('Cannot show error dialog: modal manager or confirmation dialog not available');
    return false;
  }

  modalManager.confirmationDialog.show({
    title: title,
    message: message,
    confirmText: 'OK',
    cancelText: false, // No cancel button
    action: 'error',
    type: type,
    showCancel: false,
    onConfirm: onConfirm
  });
  
  return true;
}

/**
 * Show a warning message dialog
 * @param {object} modalManager - The modal manager instance
 * @param {string} message - The warning message to display
 * @param {string} type - The entity type (product, room, estimate)
 * @param {Function} onConfirm - Callback for when the user confirms
 * @param {string} title - The dialog title
 * @returns {boolean} - Whether the dialog was shown successfully
 */
export function showWarningDialog(modalManager, message, type = 'default', onConfirm = null, title = 'Warning') {
  if (!modalManager || !modalManager.confirmationDialog) {
    logger.error('Cannot show warning dialog: modal manager or confirmation dialog not available');
    return false;
  }

  modalManager.confirmationDialog.show({
    title: title,
    message: message,
    confirmText: 'OK',
    cancelText: false, // No cancel button
    action: 'warning',
    type: type,
    showCancel: false,
    onConfirm: onConfirm
  });
  
  return true;
}

/**
 * Show a delete confirmation dialog
 * @param {object} modalManager - The modal manager instance
 * @param {string} message - The confirmation message to display
 * @param {Function} onConfirm - Callback for when the user confirms
 * @param {string} type - The entity type (product, room, estimate)
 * @param {Function} onCancel - Callback for when the user cancels
 * @param {string} title - The dialog title
 * @returns {boolean} - Whether the dialog was shown successfully
 */
export function showDeleteConfirmDialog(modalManager, message, onConfirm, type = 'default', onCancel = null, title = 'Confirm Deletion') {
  if (!modalManager || !modalManager.confirmationDialog) {
    logger.error('Cannot show delete confirmation dialog: modal manager or confirmation dialog not available');
    return false;
  }

  // Get the appropriate title from labels if type-specific title exists
  let dialogTitle = title;
  const titleLabel = `ui_elements.dialog_title_delete_${type}`;
  if (labelManager.exists(titleLabel)) {
    dialogTitle = labelManager.get(titleLabel, title);
  }

  modalManager.confirmationDialog.show({
    title: dialogTitle,
    message: message,
    confirmText: labelManager.get('common_ui.confirmation_dialogs.buttons.delete_button.label', 'Delete'),
    cancelText: labelManager.get('common_ui.general_actions.buttons.cancel_button.label', 'Cancel'),
    action: 'delete',
    type: type,
    showCancel: true,
    onConfirm: onConfirm,
    onCancel: onCancel
  });
  
  return true;
}

/**
 * Show a standard confirmation dialog
 * @param {object} modalManager - The modal manager instance
 * @param {string} message - The confirmation message to display
 * @param {Function} onConfirm - Callback for when the user confirms
 * @param {string} type - The entity type (product, room, estimate)
 * @param {Function} onCancel - Callback for when the user cancels
 * @param {string} title - The dialog title
 * @returns {boolean} - Whether the dialog was shown successfully
 */
export function showConfirmDialog(modalManager, message, onConfirm, type = 'default', onCancel = null, title = 'Confirm Action') {
  if (!modalManager || !modalManager.confirmationDialog) {
    logger.error('Cannot show confirmation dialog: modal manager or confirmation dialog not available');
    return false;
  }

  modalManager.confirmationDialog.show({
    title: title,
    message: message,
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    action: 'default',
    type: type,
    showCancel: true,
    onConfirm: onConfirm,
    onCancel: onCancel
  });
  
  return true;
}

// Default export with all helper functions
export default {
  showSuccessDialog,
  showErrorDialog,
  showWarningDialog,
  showDeleteConfirmDialog,
  showConfirmDialog
};