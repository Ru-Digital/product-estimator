/**
 * Label Settings JavaScript
 *
 * Handles functionality specific to the label settings tab.
 * Extends VerticalTabbedModule for common vertical tab and form handling.
 *
 * This module relies on abstract base classes for common functionality,
 * selectors, and internationalization strings.
 */
import VerticalTabbedModule from '../common/VerticalTabbedModule';
import { createLogger, ajax } from '@utils';

const logger = createLogger('LabelSettingsModule');

class LabelSettingsModule extends VerticalTabbedModule {
  constructor() {
    super({
      mainTabId: 'labels',
      defaultSubTabId: 'buttons',
      ajaxActionPrefix: 'save_labels',
      localizedDataName: 'labelSettings'
    });

    // Log that the LabelSettingsModule is being constructed
    logger.log('LabelSettingsModule constructor called');
    
    // Initialize label management properties
    this.searchTimeout = null;
    this.bulkEditItems = [];
  }

  /**
   * Override to bind module-specific events.
   * Common events are bound by the parent class.
   */
  bindModuleSpecificEvents() {
    super.bindModuleSpecificEvents();

    if (!this.$container || !this.$container.length) {
      logger.warn('Container not found, cannot bind label-specific events');
      return;
    }

    logger.log('Binding module-specific events for Labels Settings');

    // Bind events for label management functionality
    // Export functionality
    this.$('#export-labels').on('click', this.handleExport.bind(this));
    
    // Import functionality
    this.$('#import-labels').on('click', () => this.$('#import-file').click());
    this.$('#import-file').on('change', this.handleImport.bind(this));
    
    // Search functionality
    this.$('#label-search').on('input', this.handleSearch.bind(this));
    
    // Reset category
    this.$('#reset-category-defaults').on('click', this.handleResetCategory.bind(this));
    
    // Bulk edit
    this.$(document).on('click', '.bulk-edit-trigger', this.handleBulkEditTrigger.bind(this));
    this.$('#apply-bulk-edits').on('click', this.handleBulkUpdate.bind(this));
    this.$('#cancel-bulk-edit').on('click', this.cancelBulkEdit.bind(this));
    
    // Preview updates
    this.$('.regular-text[id^="buttons_"], .regular-text[id^="forms_"], .regular-text[id^="messages_"], .regular-text[id^="ui_elements_"], .regular-text[id^="pdf_"]')
      .on('input', this.updatePreview.bind(this));
      
    logger.log('Label management events bound successfully');
  }

  /**
   * Override for actions when the main "Labels" tab is activated.
   */
  onMainTabActivated() {
    super.onMainTabActivated();
    logger.log('Labels tab activated');
    this.initializePreview();
  }
  
  /**
   * Handle exporting labels to JSON
   */
  handleExport() {
    logger.log('Export button clicked');
    
    // Use the managementNonce from this module
    const nonce = this.settings.managementNonce || this.settings.nonce;
    logger.log('Using nonce for export:', nonce);
    
    ajax.ajaxRequest({
      url: this.settings.ajaxUrl,
      data: {
        action: 'pe_export_labels',
        nonce: nonce
      }
    })
    .then(data => {
      logger.log('Export response:', data);
      this.downloadJSON(data.filename, data.data);
      this.showNotice(this.settings.i18n.exportSuccess || 'Labels exported successfully.', 'success');
    })
    .catch(error => {
      logger.error('Export failed:', error);
      this.showNotice('Export failed: ' + (error.message || 'Unknown error'), 'error');
    });
  }
  
  /**
   * Handle importing labels from JSON file
   */
  handleImport(e) {
    logger.log('Import button clicked');
    const file = e.target.files[0];
    if (!file) return;
    
    const confirmMessage = this.settings.i18n.confirmImport || 'This will replace all existing labels. Are you sure?';
    if (!confirm(confirmMessage)) {
      jQuery('#import-file').val('');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const importData = event.target.result;
      
      // Use managementNonce first, then fall back to regular nonce
      const nonce = this.settings.managementNonce || this.settings.nonce;
      logger.log('Using nonce for import:', nonce);
      
      ajax.ajaxRequest({
        url: this.settings.ajaxUrl,
        data: {
          action: 'pe_import_labels',
          nonce: nonce,
          import_data: importData
        }
      })
      .then(data => {
        logger.log('Import response:', data);
        this.showNotice(data.message || 'Labels imported successfully.', 'success');
        // Reload page to show imported labels
        setTimeout(() => location.reload(), 1500);
      })
      .catch(error => {
        logger.error('Import failed:', error);
        this.showNotice(error.message || this.settings.i18n.importError || 'Error importing labels.', 'error');
      })
      .finally(() => {
        jQuery('#import-file').val('');
      });
    };
    
    reader.readAsText(file);
  }
  
  /**
   * Handle searching for labels
   */
  handleSearch(e) {
    logger.log('Search input changed');
    const searchTerm = e.target.value.trim();
    
    // Clear previous timeout
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    
    if (searchTerm.length < 3) {
      jQuery('#search-results').hide().empty();
      return;
    }
    
    // Debounce search using the utility function
    this.searchTimeout = setTimeout(() => {
      logger.log('Searching for:', searchTerm);
      
      // Use managementNonce first, then fall back to regular nonce
      const nonce = this.settings.managementNonce || this.settings.nonce;
      
      ajax.ajaxRequest({
        url: this.settings.ajaxUrl,
        data: {
          action: 'pe_search_labels',
          nonce: nonce,
          search_term: searchTerm
        }
      })
      .then(data => {
        logger.log('Search response:', data);
        this.displaySearchResults(data.results);
      })
      .catch(error => {
        logger.error('Search failed:', error);
      });
    }, 300);
  }
  
  /**
   * Display search results
   */
  displaySearchResults(results) {
    const $resultsContainer = jQuery('#search-results');
    $resultsContainer.empty();
    
    if (!results || results.length === 0) {
      $resultsContainer.html('<p>' + (this.settings.i18n.searchNoResults || 'No labels found matching your search.') + '</p>');
    } else {
      const $list = jQuery('<ul class="label-search-results"></ul>');
      
      results.forEach(result => {
        const $item = jQuery(`
          <li>
            <strong>${result.path}</strong>: ${result.value}
            <button type="button" class="button-link bulk-edit-trigger" 
                   data-path="${result.path}" 
                   data-category="${result.category}" 
                   data-key="${result.key}">
              Edit
            </button>
          </li>
        `);
        $list.append($item);
      });
      
      $resultsContainer.append($list);
    }
    
    $resultsContainer.show();
  }
  
  /**
   * Handle reset category to defaults
   */
  handleResetCategory() {
    // Valid categories list - must match what's defined in PHP
    const validCategories = ['buttons', 'forms', 'messages', 'ui_elements', 'pdf'];
    
    // Try multiple selector strategies to find the active category
    let currentCategory = null;
    
    // Strategy 1: Use the form's data attribute in the visible panel (most reliable)
    const $activeForm = jQuery('.pe-vtabs-tab-panel:visible form.pe-vtabs-tab-form, .vertical-tab-content:visible form');
    if ($activeForm.length) {
      currentCategory = $activeForm.data('sub-tab-id');
      logger.log('Reset category: Found active category from form data attribute:', currentCategory);
    }
    
    // Strategy 2: Check visible content panel ID
    if (!currentCategory || !validCategories.includes(currentCategory)) {
      const $visiblePanel = jQuery('.pe-vtabs-tab-panel:visible, .vertical-tab-content:visible');
      if ($visiblePanel.length) {
        currentCategory = $visiblePanel.attr('id');
        logger.log('Reset category: Found active category from visible panel:', currentCategory);
      }
    }
    
    // Strategy 3: Look for navigation item with active class
    if (!currentCategory || !validCategories.includes(currentCategory)) {
      // First try data-tab attribute
      const $activeNavItem = jQuery('.pe-vtabs-nav-item.active, .tab-item.active');
      if ($activeNavItem.length) {
        currentCategory = $activeNavItem.data('tab');
        logger.log('Reset category: Found active category from nav item data-tab:', currentCategory);
        
        // If not found in data-tab, try data-vertical-tab-id
        if (!currentCategory) {
          currentCategory = $activeNavItem.data('vertical-tab-id');
          logger.log('Reset category: Found active category from nav item data-vertical-tab-id:', currentCategory);
        }
      }
    }
    
    // Strategy 4: Check active link elements in navigation
    if (!currentCategory || !validCategories.includes(currentCategory)) {
      const $activeLink = jQuery('.pe-vtabs-nav-item.active a, .tab-item.active a, .pe-vtabs-nav a.active');
      if ($activeLink.length) {
        currentCategory = $activeLink.data('tab');
        logger.log('Reset category: Found active category from active link data-tab:', currentCategory);
      }
    }
    
    // Strategy 5: Extract from URL in active link href
    if (!currentCategory || !validCategories.includes(currentCategory)) {
      const $activeLink = jQuery('.pe-vtabs-nav-item.active a, .tab-item.active a');
      if ($activeLink.length) {
        const href = $activeLink.attr('href') || '';
        const match = href.match(/[?&]sub_tab=([^&#]*)/i);
        if (match && match[1]) {
          currentCategory = decodeURIComponent(match[1].replace(/\+/g, ' '));
          logger.log('Reset category: Found active category from href:', currentCategory);
        }
      }
    }
    
    // Strategy 6: Fallback to URL parameter
    if (!currentCategory || !validCategories.includes(currentCategory)) {
      const urlParams = new URLSearchParams(window.location.search);
      currentCategory = urlParams.get('sub_tab');
      logger.log('Reset category: Found active category from URL param:', currentCategory);
    }
    
    // Validate that we have a valid category
    if (!currentCategory || !validCategories.includes(currentCategory)) {
      logger.error(`Reset category: Invalid category "${currentCategory}". Must be one of: ${validCategories.join(', ')}`);
      
      // If we found a category but it's invalid, try to automatically determine the correct category
      if (currentCategory) {
        // Try to extract a valid category from URL
        const urlParams = new URLSearchParams(window.location.search);
        const tabParam = urlParams.get('tab');
        
        if (tabParam === 'labels') {
          // If we're on the labels tab, default to 'buttons' category
          currentCategory = 'buttons';
          logger.log('Reset category: Defaulting to "buttons" category');
        } else {
          return; // Can't proceed without a valid category
        }
      } else {
        return; // Can't proceed without a category at all
      }
    }
    
    const confirmMessage = this.settings.i18n.resetConfirm || 'Are you sure you want to reset this category to default values?';
    if (!confirm(confirmMessage)) {
      logger.log('Reset category: User canceled the operation');
      return;
    }
    
    // Use managementNonce first, then fall back to regular nonce
    const nonce = this.settings.managementNonce || this.settings.nonce;
    logger.log('Reset category: Using nonce:', nonce);
    
    logger.log('Reset category: Making AJAX request for category:', currentCategory);
    ajax.ajaxRequest({
      url: this.settings.ajaxUrl,
      data: {
        action: 'pe_reset_category_labels',
        nonce: nonce,
        category: currentCategory
      }
    })
    .then(data => {
      logger.log('Reset category response:', data);
      this.showNotice(data.message || 'Category reset to defaults successfully.', 'success');
      
      // Update the form fields
      if (data.labels) {
        logger.log('Reset category: Updating', Object.keys(data.labels).length, 'labels');
        Object.entries(data.labels).forEach(([key, value]) => {
          const selector = `#${currentCategory}_${key}`;
          const $field = jQuery(selector);
          if ($field.length) {
            $field.val(value);
            logger.log(`Reset category: Updated field ${selector} to "${value}"`);
          } else {
            logger.warn(`Reset category: Field not found for ${selector}`);
          }
        });
      } else {
        logger.warn('Reset category: No labels returned in response');
      }
    })
    .catch(error => {
      logger.error('Reset category failed:', error);
      this.showNotice('Reset failed: ' + (error.message || 'Unknown error'), 'error');
    });
  }
  
  /**
   * Handle bulk edit trigger button
   */
  handleBulkEditTrigger(e) {
    e.preventDefault();
    const $button = jQuery(e.currentTarget);
    const path = $button.data('path');
    const category = $button.data('category');
    const key = $button.data('key');
    
    // Find the input field
    const $input = jQuery(`#${category}_${key}`);
    if ($input.length) {
      const currentValue = $input.val();
      
      // Add to bulk edit items
      const existingIndex = this.bulkEditItems.findIndex(item => item.path === path);
      if (existingIndex === -1) {
        this.bulkEditItems.push({
          path: path,
          originalValue: currentValue,
          newValue: currentValue,
          category: category,
          key: key
        });
      }
      
      this.showBulkEditSection();
    }
  }
  
  /**
   * Show bulk edit section
   */
  showBulkEditSection() {
    const $section = jQuery('.label-bulk-edit-section');
    const $container = jQuery('#bulk-edit-items');
    
    $container.empty();
    
    this.bulkEditItems.forEach((item, index) => {
      const $item = jQuery(`
        <div class="bulk-edit-item" data-index="${index}">
          <label>${item.path}</label>
          <input type="text" class="bulk-edit-value regular-text" 
                 value="${item.newValue}" 
                 data-index="${index}" />
          <button type="button" class="button-link remove-bulk-item" data-index="${index}">
            Remove
          </button>
        </div>
      `);
      $container.append($item);
    });
    
    // Bind events for bulk edit items
    jQuery('.bulk-edit-value').on('input', (e) => {
      const index = jQuery(e.target).data('index');
      this.bulkEditItems[index].newValue = e.target.value;
    });
    
    jQuery('.remove-bulk-item').on('click', (e) => {
      const index = jQuery(e.target).data('index');
      this.bulkEditItems.splice(index, 1);
      
      if (this.bulkEditItems.length === 0) {
        this.cancelBulkEdit();
      } else {
        this.showBulkEditSection();
      }
    });
    
    $section.show();
  }
  
  /**
   * Handle bulk update button
   */
  handleBulkUpdate() {
    const updates = {};
    
    this.bulkEditItems.forEach(item => {
      if (item.newValue !== item.originalValue) {
        updates[item.path] = item.newValue;
      }
    });
    
    if (Object.keys(updates).length === 0) {
      this.showNotice('No changes to apply', 'info');
      return;
    }
    
    // Use managementNonce first, then fall back to regular nonce
    const nonce = this.settings.managementNonce || this.settings.nonce;
    
    ajax.ajaxRequest({
      url: this.settings.ajaxUrl,
      data: {
        action: 'pe_bulk_update_labels',
        nonce: nonce,
        updates: updates
      }
    })
    .then(data => {
      logger.log('Bulk update response:', data);
      this.showNotice(this.settings.i18n.bulkUpdateSuccess || 'Labels updated successfully.', 'success');
      
      // Update the actual input fields
      this.bulkEditItems.forEach(item => {
        const $input = jQuery(`#${item.category}_${item.key}`);
        $input.val(item.newValue);
      });
      
      this.cancelBulkEdit();
    })
    .catch(error => {
      logger.error('Bulk update failed:', error);
      this.showNotice(this.settings.i18n.bulkUpdateError || 'Error updating labels.', 'error');
    });
  }
  
  /**
   * Cancel bulk edit
   */
  cancelBulkEdit() {
    this.bulkEditItems = [];
    jQuery('.label-bulk-edit-section').hide();
    jQuery('#bulk-edit-items').empty();
  }
  
  /**
   * Initialize preview functionality
   */
  initializePreview() {
    // Add preview functionality for labels
    jQuery('.regular-text[id^="buttons_"], .regular-text[id^="forms_"], .regular-text[id^="messages_"], .regular-text[id^="ui_elements_"], .regular-text[id^="pdf_"]')
      .each((index, element) => {
        const $input = jQuery(element);
        const labelId = $input.attr('id');
        const preview = this.getPreviewForLabel(labelId);
        
        if (preview) {
          $input.after(`<div class="label-preview-text">Preview: <em>${preview}</em></div>`);
        }
      });
  }
  
  /**
   * Update preview text as user types
   */
  updatePreview(e) {
    const $input = jQuery(e.target);
    const value = $input.val();
    const $preview = $input.next('.label-preview-text');
    
    if ($preview.length) {
      $preview.find('em').text(value);
    }
  }
  
  /**
   * Get preview text for a specific label
   */
  getPreviewForLabel(labelId) {
    const previewMap = {
      'buttons_save_estimate': 'Button text shown when saving',
      'buttons_print_estimate': 'Button text for printing',
      'forms_estimate_name': 'Form field label',
      'messages_product_added': 'Success message after adding product',
      // Add more preview mappings as needed
    };
    
    return previewMap[labelId] || null;
  }
  
  /**
   * Download JSON data as a file
   */
  downloadJSON(filename, data) {
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

// Initialize the module
jQuery(document).ready(function() {
  if (jQuery('#labels').length) {
    logger.log('Initializing LabelSettingsModule');
    window.LabelSettingsModuleInstance = new LabelSettingsModule();
  }
});

export default LabelSettingsModule;
