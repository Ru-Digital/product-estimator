/**
 * Template Loader
 *
 * Imports all HTML templates and registers them with the template engine
 */

// Import template engine
import TemplateEngine from './TemplateEngine';

// Import component templates
import productItemTemplate from '@templates/components/product-item.html';
import roomItemTemplate from '@templates/components/room-item.html';
import estimateItemTemplate from '@templates/components/estimate-item.html';
import suggestionItemTemplate from '@templates/components/suggestion-item.html';
import noteItemTemplate from '@templates/components/note-item.html';
import includeItemTemplate from '@templates/components/include-item.html';
import similarItemTemplate from '@templates/components/similar-item.html'; // Correct import name


// Import form templates
import newEstimateFormTemplate from '@templates/forms/new-estimate-form.html';
import newRoomFormTemplate from '@templates/forms/new-room-form.html';
import roomSelectionFormTemplate from '@templates/forms/room-selection-form.html';
import estimateSelectionTemplate from '@templates/forms/estimate-selection.html';

// Import UI templates
import estimatesEmptyTemplate from '@templates/ui/estimates-empty.html';
import roomsEmptyTemplate from '@templates/ui/rooms-empty.html';
import productsEmptyTemplate from '@templates/ui/products-empty.html';
import modalMessagesTemplate from '@templates/ui/modal-messages.html';

// Create a map of all templates
const templates = {
  'product-item-template': productItemTemplate,
  'room-item-template': roomItemTemplate,
  'estimate-item-template': estimateItemTemplate,
  'suggestion-item-template': suggestionItemTemplate,
  'note-item-template': noteItemTemplate,
  'include-item-template': includeItemTemplate, // Add this line
  'similar-product-item-template': similarItemTemplate, // Corrected ID and variable name
  'new-estimate-form-template': newEstimateFormTemplate,
  'new-room-form-template': newRoomFormTemplate,
  'room-selection-form-template': roomSelectionFormTemplate,
  'estimate-selection-template': estimateSelectionTemplate,
  'estimates-empty-template': estimatesEmptyTemplate,
  'rooms-empty-template': roomsEmptyTemplate,
  'products-empty-template': productsEmptyTemplate,
  'modal-messages-template': modalMessagesTemplate
};

/**
 * Initialize all templates with the template engine
 * @returns {Object} The initialized template engine
 */
// In template-loader.js
export function initializeTemplates() {
  console.group('Initializing templates');

  // Log all template IDs being registered
  console.log('Registering templates:', Object.keys(templates));

  Object.entries(templates).forEach(([id, html]) => {
    if (!html || html.trim() === '') {
      console.warn(`Template ${id} has empty HTML content!`);
    } else {
      console.log(`Registering template: ${id} (${html.length} characters)`);
      TemplateEngine.registerTemplate(id, html);
    }
  });

  console.log(`Initialized template engine with ${Object.keys(templates).length} templates`);
  console.groupEnd();

  return TemplateEngine;
}

// Add this function to check template content
export function checkTemplateContent(templateId) {
  const template = templates[templateId];
  if (!template) {
    console.error(`Template not found: ${templateId}`);
    return false;
  }

  console.log(`Template ${templateId} content (${template.length} characters):`);
  console.log(template.substring(0, 100) + '...');
  return true;
}

export default templates;
