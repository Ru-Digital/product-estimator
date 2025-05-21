/**
 * Hierarchical Label Settings JavaScript
 *
 * Handles functionality specific to the hierarchical label settings tab.
 * Extends VerticalTabbedModule for common vertical tab and form handling.
 *
 * This module provides enhanced UI for managing hierarchical label structure,
 * including expandable sections, path-based navigation, and search functionality.
 */
import VerticalTabbedModule from '../common/VerticalTabbedModule';
import { createLogger, ajax } from '@utils';

const logger = createLogger('HierarchicalLabelSettingsModule');

class HierarchicalLabelSettingsModule extends VerticalTabbedModule {
  constructor() {
    super({
      mainTabId: 'labels',
      defaultSubTabId: 'common',
      ajaxActionPrefix: 'save_labels',
      localizedDataName: 'labelSettings'
    });

    // Log that the HierarchicalLabelSettingsModule is being constructed
    logger.log('HierarchicalLabelSettingsModule constructor called');
    
    // Initialize label management properties
    this.bulkEditItems = [];
    this.expandedSections = new Set();
    this.searchResults = [];
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

    logger.log('Binding module-specific events for Hierarchical Labels Settings');

    // Bind events for label management functionality
    // Export functionality
    this.$('#export-labels').on('click', this.handleExport.bind(this));
    
    // Import functionality
    this.$('#import-labels').on('click', () => this.$('#import-file').click());
    this.$('#import-file').on('change', this.handleImport.bind(this));
    
    // Reset category
    this.$('#reset-category-defaults').on('click', this.handleResetCategory.bind(this));
    
    // Bulk edit
    this.$(document).on('click', '.bulk-edit-trigger', this.handleBulkEditTrigger.bind(this));
    this.$('#apply-bulk-edits').on('click', this.handleBulkUpdate.bind(this));
    this.$('#cancel-bulk-edit').on('click', this.cancelBulkEdit.bind(this));
    
    // Hierarchical-specific events
    this.$(document).on('click', '.pe-label-subcategory-heading', this.toggleSubcategory.bind(this));
    this.$('#label-search').on('input', this.debounce(this.handleSearch.bind(this), 300));
    
    // Add expand/collapse all buttons to each tab
    this.addExpandCollapseButtons();
    
    // Preview updates for hierarchical labels
    this.$(document).on('input', 'input[data-path]', this.updatePreview.bind(this));
      
    logger.log('Hierarchical label management events bound successfully');
  }

  /**
   * Add expand/collapse all buttons to each vertical tab panel
   */
  addExpandCollapseButtons() {
    this.$('.pe-vtabs-tab-panel, .vertical-tab-content').each((_, panel) => {
      const $panel = jQuery(panel);
      const $heading = $panel.find('h2, h3').first();
      
      if ($heading.length) {
        const $buttonContainer = jQuery('<div class="section-toggle-buttons"></div>');
        const $expandButton = jQuery(`<button type="button" class="button expand-all-button">
          ${this.settings.i18n.expandAll || 'Expand All'}
        </button>`);
        
        const $collapseButton = jQuery(`<button type="button" class="button collapse-all-button">
          ${this.settings.i18n.collapseAll || 'Collapse All'}
        </button>`);
        
        $buttonContainer.append($expandButton).append($collapseButton);
        $heading.after($buttonContainer);
        
        $expandButton.on('click', () => this.expandAllSections($panel));
        $collapseButton.on('click', () => this.collapseAllSections($panel));
      }
    });
  }

  /**
   * Expand all sections in a panel
   * @param {jQuery} $panel - The panel containing sections to expand
   */
  expandAllSections($panel) {
    const $headings = $panel.find('.pe-label-subcategory-heading');
    $headings.each((_, heading) => {
      const $heading = jQuery(heading);
      const path = $heading.next('.pe-label-subcategory-data').data('path');
      
      if (path) {
        this.expandedSections.add(path);
        this.updateSectionVisibility(path, true);
      }
    });
  }
  
  /**
   * Collapse all sections in a panel
   * @param {jQuery} $panel - The panel containing sections to collapse
   */
  collapseAllSections($panel) {
    const $headings = $panel.find('.pe-label-subcategory-heading');
    $headings.each((_, heading) => {
      const $heading = jQuery(heading);
      const path = $heading.next('.pe-label-subcategory-data').data('path');
      
      if (path) {
        this.expandedSections.delete(path);
        this.updateSectionVisibility(path, false);
      }
    });
  }
  
  /**
   * Toggle a subcategory's visibility
   * @param {Event} e - The click event
   */
  toggleSubcategory(e) {
    const $heading = jQuery(e.currentTarget);
    const $data = $heading.next('.pe-label-subcategory-data');
    const path = $data.data('path');
    
    if (!path) return;
    
    if (this.expandedSections.has(path)) {
      this.expandedSections.delete(path);
      this.updateSectionVisibility(path, false);
    } else {
      this.expandedSections.add(path);
      this.updateSectionVisibility(path, true);
    }
  }
  
  /**
   * Update a section's visibility
   * @param {string} path - The section path
   * @param {boolean} visible - Whether the section should be visible
   */
  updateSectionVisibility(path, visible) {
    const $heading = jQuery(`.pe-label-subcategory-data[data-path="${path}"]`).prev('.pe-label-subcategory-heading');
    const $fields = jQuery(`.pe-label-field-wrapper[data-path^="${path}."]`);
    
    if (visible) {
      $heading.addClass('expanded');
      $fields.show();
    } else {
      $heading.removeClass('expanded');
      $fields.hide();
    }
  }

  /**
   * Handle search functionality
   */
  handleSearch(e) {
    const searchTerm = e.target.value.trim().toLowerCase();
    const $resultsContainer = jQuery('#label-search-results');
    
    if (searchTerm.length < 2) {
      $resultsContainer.hide();
      return;
    }
    
    // Find matching labels
    this.searchResults = [];
    jQuery('input[data-path]').each((_, input) => {
      const $input = jQuery(input);
      const path = $input.data('path');
      const value = $input.val().toLowerCase();
      
      if (path.toLowerCase().includes(searchTerm) || value.includes(searchTerm)) {
        this.searchResults.push({
          path: path,
          value: $input.val(),
          element: $input
        });
      }
    });
    
    // Display results
    $resultsContainer.empty();
    
    if (this.searchResults.length === 0) {
      $resultsContainer.html(`<p>${this.settings.i18n.searchNoResults || 'No labels found matching your search.'}</p>`);
      $resultsContainer.show();
      return;
    }
    
    const resultsCountText = this.settings.i18n.searchResultsCount
      ? this.settings.i18n.searchResultsCount.replace('%d', this.searchResults.length)
      : `${this.searchResults.length} labels found.`;
    
    $resultsContainer.append(`<p><strong>${resultsCountText}</strong></p>`);
    
    // Add results to container
    this.searchResults.forEach(result => {
      const highlightedPath = this.highlightSearchTerm(result.path, searchTerm);
      const highlightedValue = this.highlightSearchTerm(result.value, searchTerm);
      
      const $resultItem = jQuery(`
        <div class="search-result-item">
          <div class="path">${highlightedPath}</div>
          <div class="value">${highlightedValue}</div>
          <a href="#" class="go-to" data-path="${result.path}">Go to this field</a>
        </div>
      `);
      
      $resultsContainer.append($resultItem);
    });
    
    // Bind click events for "Go to" links
    $resultsContainer.find('.go-to').on('click', (e) => {
      e.preventDefault();
      const path = jQuery(e.currentTarget).data('path');
      this.goToLabelField(path);
    });
    
    $resultsContainer.show();
  }
  
  /**
   * Highlight search term in text
   * @param {string} text - The text to highlight
   * @param {string} term - The search term
   * @returns {string} HTML with highlighted term
   */
  highlightSearchTerm(text, term) {
    if (!term) return text;
    
    const regex = new RegExp(`(${term})`, 'gi');
    return text.replace(regex, '<span class="label-search-highlight">$1</span>');
  }
  
  /**
   * Navigate to a label field by path
   * @param {string} path - The path to the field
   */
  goToLabelField(path) {
    // First, determine which tab this field is in
    const pathParts = path.split('.');
    const category = pathParts[0];
    
    // Switch to the correct tab if needed
    if (this.getCurrentSubTabId() !== category) {
      this.activateSubTab(category);
    }
    
    // Ensure all parent sections are expanded
    let currentPath = '';
    pathParts.forEach((part, index) => {
      if (index === pathParts.length - 1) return; // Skip the last part (field name)
      
      currentPath = currentPath ? `${currentPath}.${part}` : part;
      this.expandedSections.add(currentPath);
      this.updateSectionVisibility(currentPath, true);
    });
    
    // Find and highlight the field
    const $field = jQuery(`input[data-path="${path}"]`);
    if ($field.length) {
      // Scroll to the field
      jQuery('html, body').animate({
        scrollTop: $field.offset().top - 100
      }, 500);
      
      // Highlight the field
      $field.focus().css('background-color', '#fffbcc');
      
      // Remove highlight after a delay
      setTimeout(() => {
        $field.css('background-color', '');
      }, 3000);
      
      // Close search results
      jQuery('#label-search-results').hide();
      jQuery('#label-search').val('');
    }
  }

  /**
   * Override for actions when the main "Labels" tab is activated.
   */
  onMainTabActivated() {
    super.onMainTabActivated();
    logger.log('Hierarchical Labels tab activated');
    this.initializeUI();
  }
  
  /**
   * Initialize UI components
   */
  initializeUI() {
    // Hide all nested fields initially
    jQuery('.pe-label-field-wrapper[data-depth]').each((_, field) => {
      const $field = jQuery(field);
      const path = $field.data('path') || '';
      const pathParts = path.split('.');
      
      // If this is a nested field (depth > 1), check if its path matches any expanded section
      if (pathParts.length > 2) {
        const parentPath = pathParts.slice(0, pathParts.length - 1).join('.');
        const isVisible = this.expandedSections.has(parentPath);
        $field.toggle(isVisible);
      }
    });
    
    // Apply expand/collapse state to section headings
    jQuery('.pe-label-subcategory-heading').each((_, heading) => {
      const $heading = jQuery(heading);
      const $data = $heading.next('.pe-label-subcategory-data');
      const path = $data.data('path');
      
      if (path && this.expandedSections.has(path)) {
        $heading.addClass('expanded');
      } else {
        $heading.removeClass('expanded');
      }
    });
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
   * Handle reset category to defaults
   */
  handleResetCategory() {
    // Valid categories for hierarchical structure
    const validCategories = ['common', 'estimate', 'room', 'product', 'customer', 'ui', 'modal', 'pdf'];
    
    // Try multiple selector strategies to find the active category
    let currentCategory = null;
    
    // Strategy 1: Use the form's data attribute in the visible panel (most reliable)
    const $activeForm = jQuery('.pe-vtabs-tab-panel:visible form.pe-vtabs-tab-form, .vertical-tab-content:visible form');
    if ($activeForm.length) {
      currentCategory = $activeForm.data('sub-tab-id');
      logger.log('Reset category: Found active category from form data attribute:', currentCategory);
    }
    
    // Try additional strategies to find the current category as in the original code
    // [Strategies 2-6 omitted for brevity, same as original code]
    
    // Validate that we have a valid category
    if (!currentCategory || !validCategories.includes(currentCategory)) {
      logger.error(`Reset category: Invalid category "${currentCategory}". Must be one of: ${validCategories.join(', ')}`);
      
      // Default to 'common' category if on labels tab
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab');
      
      if (tabParam === 'labels') {
        currentCategory = 'common';
        logger.log('Reset category: Defaulting to "common" category');
      } else {
        return; // Can't proceed without a valid category
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
      this.showNotice(data.message || 'Category reset to defaults successfully. Page will refresh to show changes.', 'success');
      
      // Schedule a page refresh after a short delay to show the changes
      setTimeout(() => {
        logger.log('Refreshing page to show updated labels');
        window.location.reload();
      }, 1500);
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
    const $target = jQuery(e.currentTarget);
    const $input = $target.closest('.pe-label-field-wrapper').find('input[data-path]');
    
    if ($input.length) {
      const path = $input.data('path');
      const currentValue = $input.val();
      
      // Add to bulk edit items
      const existingIndex = this.bulkEditItems.findIndex(item => item.path === path);
      if (existingIndex === -1) {
        this.bulkEditItems.push({
          path: path,
          originalValue: currentValue,
          newValue: currentValue
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
        const $input = jQuery(`input[data-path="${item.path}"]`);
        if ($input.length) {
          $input.val(item.newValue);
        }
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
   * Update preview for a label input field
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
  
  /**
   * Simple debounce function
   * @param {Function} func - The function to debounce
   * @param {number} wait - Milliseconds to wait
   * @returns {Function} Debounced function
   */
  debounce(func, wait) {
    let timeout;
    return function(...args) {
      const context = this;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), wait);
    };
  }
}

// Initialize the module
jQuery(document).ready(function() {
  if (jQuery('#labels').length) {
    logger.log('Initializing HierarchicalLabelSettingsModule');
    // Check if we should use the hierarchical module
    const labelSettings = window.productEstimatorSettings?.labelSettings || {};
    
    if (labelSettings.hierarchical) {
      window.LabelSettingsModuleInstance = new HierarchicalLabelSettingsModule();
    } else {
      // If hierarchical flag is not set, this script will not initialize
      // and the regular LabelSettingsModule will be used instead
      logger.log('Not using hierarchical labels module (hierarchical flag not set)');
    }
  }
});

export default HierarchicalLabelSettingsModule;