/**
 * Template Loader
 *
 * Imports all HTML templates and registers them with the template engine
 */
import { createLogger } from '@utils';
import productItemTemplate from '@templates/components/product-item.html';
import roomItemTemplate from '@templates/components/room-item.html';
import estimateItemTemplate from '@templates/components/estimate-item.html';
import suggestionItemTemplate from '@templates/components/suggestion-item.html';
import noteItemTemplate from '@templates/components/note-item.html';
import includeItemTemplate from '@templates/components/include-item.html';
import similarItemTemplate from '@templates/components/similar-item.html';
import productUpgradeItemTemplate from '@templates/components/product-upgrade-item.html';
import selectOptionTemplate from '@templates/components/select-option.html';
import loadingPlaceholderTemplate from '@templates/components/loading-placeholder.html';
import roomActionsFooterTemplate from '@templates/components/room-actions-footer.html';
import roomsContainerTemplate from '@templates/components/rooms-container.html';
import newEstimateFormTemplate from '@templates/forms/new-estimate-form.html';
import newRoomFormTemplate from '@templates/forms/new-room-form.html';
import roomSelectionFormTemplate from '@templates/forms/room-selection-form.html';
import estimateSelectionTemplate from '@templates/forms/estimate-selection.html';
import estimatesEmptyTemplate from '@templates/ui/estimates-empty.html';
import roomsEmptyTemplate from '@templates/ui/rooms-empty.html';
import productsEmptyTemplate from '@templates/ui/products-empty.html';
import roomErrorTemplate from '@templates/ui/room-error.html';
import productErrorTemplate from '@templates/ui/product-error.html';
import formErrorTemplate from '@templates/ui/form-error.html';
import modalMessagesTemplate from '@templates/ui/modal-messages.html';
import modalContainerTemplate from '@templates/ui/modal-container.html';
import confirmationDialogTemplate from '@templates/ui/confirmation-dialog.html';

import TemplateEngine from './TemplateEngine';
const logger = createLogger('TemplateLoader');

// Create a map of all templates
const templates = {
  'product-item-template': productItemTemplate,
  'room-item-template': roomItemTemplate,
  'estimate-item-template': estimateItemTemplate,
  'suggestion-item-template': suggestionItemTemplate,
  'note-item-template': noteItemTemplate,
  'include-item-template': includeItemTemplate,
  'similar-product-item-template': similarItemTemplate,
  'product-upgrade-item-template': productUpgradeItemTemplate,
  'select-option-template': selectOptionTemplate,
  'loading-placeholder-template': loadingPlaceholderTemplate,
  'room-actions-footer-template': roomActionsFooterTemplate,
  'rooms-container-template': roomsContainerTemplate,
  'new-estimate-form-template': newEstimateFormTemplate,
  'new-room-form-template': newRoomFormTemplate,
  'room-selection-form-template': roomSelectionFormTemplate,
  'estimate-selection-template': estimateSelectionTemplate,
  'estimates-empty-template': estimatesEmptyTemplate,
  'rooms-empty-template': roomsEmptyTemplate,
  'products-empty-template': productsEmptyTemplate,
  'room-error-template': roomErrorTemplate,
  'product-error-template': productErrorTemplate,
  'form-error-template': formErrorTemplate,
  'modal-messages-template': modalMessagesTemplate,
  'modal-container-template': modalContainerTemplate,
  'confirmation-dialog-template': confirmationDialogTemplate
};

/**
 * Initialize all templates with the template engine
 * @returns {object} The initialized template engine
 */
// In template-loader.js
export function initializeTemplates() {
  logger.group('Initializing templates');

  // Log all template IDs being registered
  logger.log('Registering templates:', Object.keys(templates));

  Object.entries(templates).forEach(([id, html]) => {
    if (!html || html.trim() === '') {
      logger.warn(`Template ${id} has empty HTML content!`);
    } else {
      logger.log(`Registering template: ${id} (${html.length} characters)`);
      TemplateEngine.registerTemplate(id, html);
    }
  });

  logger.log(`Initialized template engine with ${Object.keys(templates).length} templates`);
  logger.groupEnd();

  return TemplateEngine;
}

// Add this function to check template content
/**
 * Check if a template exists and log its content
 * @param {string} templateId - The ID of the template to check
 * @returns {boolean} True if the template exists, false otherwise
 */
export function checkTemplateContent(templateId) {
  const template = templates[templateId];
  if (!template) {
    logger.error(`Template not found: ${templateId}`);
    return false;
  }

  logger.log(`Template ${templateId} content (${template.length} characters):`);
  logger.log(template.substring(0, 100) + '...');
  return true;
}

export default templates;