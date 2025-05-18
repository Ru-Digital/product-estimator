/**
 * Template Loader
 *
 * Imports all HTML templates and registers them with the template engine
 */
import { createLogger } from '@utils';

// Component Templates
// Product Components
import includeItemTemplate from '@templates/components/product/include-item.html';
import noteItemTemplate from '@templates/components/product/note-item.html';
import upgradeItemTemplate from '@templates/components/product/upgrade-item.html';
import additionalProductOptionTemplate from '@templates/components/product/additional-product-option.html';
import similarItemTemplate from '@templates/components/product/similar-item.html';
import suggestionItemTemplate from '@templates/components/product/suggestion-item.html';

// Room Components
import roomItemTemplate from '@templates/components/room/room-item.html';
import roomsContainerTemplate from '@templates/components/room/rooms-container.html';
import roomActionsFooterTemplate from '@templates/components/room/actions-footer.html';

// Estimate Components
import estimateItemTemplate from '@templates/components/estimate/estimate-item.html';

// Common Components
import loadingPlaceholderTemplate from '@templates/components/common/loading.html';
import selectOptionTemplate from '@templates/components/common/select-option.html';
import toggleButtonHideTemplate from '@templates/components/common/toggle/hide.html';
import toggleButtonShowTemplate from '@templates/components/common/toggle/show.html';

// Form Templates
import newEstimateFormTemplate from '@templates/forms/estimate/new-estimate.html';
import estimateSelectionTemplate from '@templates/forms/estimate/estimate-selection.html';
import newRoomFormTemplate from '@templates/forms/room/new-room.html';
import roomSelectionFormTemplate from '@templates/forms/room/room-selection.html';

// Layout Templates
import modalContainerTemplate from '@templates/layout/modal-container.html';

// UI Templates
// Dialog Templates
import confirmationDialogTemplate from '@templates/ui/dialogs/confirmation.html';
import productSelectionTemplate from '@templates/ui/dialogs/product-selection.html';
import variationOptionTemplate from '@templates/ui/dialogs/variation-option.html';
import variationSwatchTemplate from '@templates/ui/dialogs/variation-swatch.html';

// Empty State Templates
import estimatesEmptyTemplate from '@templates/ui/empty-states/estimates-empty.html';
import roomsEmptyTemplate from '@templates/ui/empty-states/rooms-empty.html';
import productsEmptyTemplate from '@templates/ui/empty-states/products-empty.html';

// Error Templates
import roomErrorTemplate from '@templates/ui/errors/room-error.html';
import productErrorTemplate from '@templates/ui/errors/product-error.html';
import formErrorTemplate from '@templates/ui/errors/form-error.html';

// Message Templates
import modalMessagesTemplate from '@templates/ui/messages/modal-messages.html';

// Tooltip Templates
import tooltipTemplate from '@templates/ui/tooltip.html';
import tooltipRichTemplate from '@templates/ui/tooltip-rich.html';

import TemplateEngine from './TemplateEngine';
const logger = createLogger('TemplateLoader');

// Create a map of all templates
const templates = {
  'room-item-template': roomItemTemplate,
  'estimate-item-template': estimateItemTemplate,
  'suggestion-item-template': suggestionItemTemplate,
  'note-item-template': noteItemTemplate,
  'include-item-template': includeItemTemplate,
  'similar-product-item-template': similarItemTemplate,
  'product-upgrade-item-template': upgradeItemTemplate,
  'additional-product-option-template': additionalProductOptionTemplate,
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
  'confirmation-dialog-template': confirmationDialogTemplate,
  'product-selection-template': productSelectionTemplate,
  'variation-option-template': variationOptionTemplate,
  'variation-swatch-template': variationSwatchTemplate,
  'toggle-button-hide-template': toggleButtonHideTemplate,
  'toggle-button-show-template': toggleButtonShowTemplate,
  'tooltip': tooltipTemplate,
  'tooltip-rich': tooltipRichTemplate
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
