/**
 * Label Settings JavaScript
 *
 * Handles functionality specific to the label settings tab.
 * Extends VerticalTabbedModule for common vertical tab and form handling.
 *
 * This module relies on abstract base classes for common functionality,
 * selectors, and internationalization strings.
 */
import { createLogger, ajax } from '@utils';

import VerticalTabbedModule from '../common/VerticalTabbedModule';

const logger = createLogger('LabelSettingsModule');

class LabelSettingsModule extends VerticalTabbedModule {
  constructor() {
    super({
      mainTabId: 'labels',
      defaultSubTabId: 'estimate_management',
      ajaxActionPrefix: 'save_labels',
      localizedDataName: 'labelSettings'
    });

    // Log that the LabelSettingsModule is being constructed
    logger.log('LabelSettingsModule constructor called');

    // Initialize label management properties
    this.bulkEditItems = [];
    this.expandedSections = new Set();
    this.searchResults = [];
  }

  /**
   * Module initialization method called by ProductEstimatorSettings base class
   */
  moduleInit() {
    super.moduleInit();
    logger.log('LabelSettingsModule moduleInit called');
    
    // Fix section header table structure immediately when module loads
    setTimeout(() => {
      this.fixSectionHeaderTableStructure();
    }, 500);
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

    // Reset category
    this.$('#reset-category-defaults').on('click', this.handleResetCategory.bind(this));

    // Hierarchical-specific events for both main sections and subcategories
    this.$(document).on('click', '.pe-label-subcategory-heading, .pe-main-section-header', this.toggleSubcategory.bind(this));
    this.$('#label-search').on('input', this.debounce(this.handleSearch.bind(this), 300));
    
    // Add expand/collapse all buttons to each tab
    this.addExpandCollapseButtons();

    // Bulk edit
    this.$(document).on('click', '.bulk-edit-trigger', this.handleBulkEditTrigger.bind(this));
    this.$('#apply-bulk-edits').on('click', this.handleBulkUpdate.bind(this));
    this.$('#cancel-bulk-edit').on('click', this.cancelBulkEdit.bind(this));

    // Preview updates for hierarchical labels
    this.$(document).on('input', 'input[data-path]', this.updatePreview.bind(this));

    logger.log('Label management events bound successfully');
  }

  /**
   * Override for actions when the main "Labels" tab is activated.
   */
  onMainTabActivated() {
    super.onMainTabActivated();
    logger.log('Labels tab activated');
    this.initializeUI();
  }
  
  /**
   * Initialize UI components
   */
  initializeUI() {
    logger.log('Initializing UI components');
    
    // Fix section header table structure to use colspan (with delay to ensure DOM is ready)
    setTimeout(() => {
      this.fixSectionHeaderTableStructure();
    }, 100);
    
    // Initialize hierarchical sections
    this.initializeHierarchicalSections();
    
    this.initializePreview();
  }

  /**
   * Initialize hierarchical sections with proper expand/collapse functionality
   */
  initializeHierarchicalSections() {
    logger.log('Initializing hierarchical sections');
    
    // Handle both main section headers (depth 0) and subcategory headings
    const $subcategoryHeadings = jQuery('.pe-label-subcategory-heading');
    const $mainSectionHeaders = jQuery('.pe-main-section-header');
    const $allHeadings = $subcategoryHeadings.add($mainSectionHeaders);
    
    logger.log('Found subcategory headings:', $subcategoryHeadings.length);
    logger.log('Found main section headers:', $mainSectionHeaders.length);
    logger.log('Total headings to process:', $allHeadings.length);
    
    // Make sure headings are clickable and have proper styling
    $allHeadings.each((_, heading) => {
      const $heading = jQuery(heading);
      const $data = $heading.next('.pe-label-subcategory-data');
      const path = $data.data('path');
      
      logger.log('Processing heading for path:', path);
      
      if (path) {
        // Add cursor pointer and ensure heading is clickable
        $heading.css('cursor', 'pointer');
        $heading.attr('data-path', path);
        
        // Add expand/collapse indicator
        if (!$heading.find('.expand-indicator').length) {
          $heading.prepend('<span class="expand-indicator">▶ </span>');
        }
        
        // Determine initial state - start with all expanded so users can see all fields
        const pathParts = path.split('.');
        const shouldBeExpanded = true; // Start everything expanded for better UX
        
        if (shouldBeExpanded) {
          this.expandedSections.add(path);
          $heading.addClass('expanded');
          $heading.find('.expand-indicator').text('▼ ');
        } else {
          // Ensure collapsed state is properly set
          this.expandedSections.delete(path);
          $heading.removeClass('expanded');
          $heading.find('.expand-indicator').text('▶ ');
        }
        
        // Update visibility based on initial state - this will properly hide/show fields
        this.updateSectionVisibility(path, shouldBeExpanded);
      }
    });
    
    // Find and organize nested fields
    const $fieldWrappers = jQuery('.pe-label-field-wrapper');
    logger.log('Found field wrappers:', $fieldWrappers.length);
    
    $fieldWrappers.each((_, wrapper) => {
      const $wrapper = jQuery(wrapper);
      const fieldPath = $wrapper.find('input[data-path]').data('path');
      
      if (fieldPath) {
        // Add the path to the wrapper for easier identification
        $wrapper.attr('data-field-path', fieldPath);
        
        // Determine which section this field belongs to
        const pathParts = fieldPath.split('.');
        if (pathParts.length > 1) {
          // This is a nested field, find its parent section
          for (let i = pathParts.length - 1; i > 0; i--) {
            const parentPath = pathParts.slice(0, i).join('.');
            const $parentSection = jQuery(`.pe-label-subcategory-data[data-path="${parentPath}"]`);
            
            if ($parentSection.length) {
              $wrapper.attr('data-parent-section', parentPath);
              break;
            }
          }
        }
      }
    });
    
    logger.log('Hierarchical sections initialized');
  }

  /**
   * Add expand/collapse all buttons to each vertical tab panel
   */
  addExpandCollapseButtons() {
    this.$('.pe-vtabs-tab-panel, .vertical-tab-content').each((_, panel) => {
      const $panel = jQuery(panel);
      const $subcategoryHeadings = $panel.find('.pe-label-subcategory-heading');
      const $mainSectionHeaders = $panel.find('.pe-main-section-header');
      const $allCollapsibleHeadings = $subcategoryHeadings.add($mainSectionHeaders);
      
      // Only add buttons if this panel has hierarchical label sections
      if ($allCollapsibleHeadings.length > 0) {
        const $heading = $panel.find('h2, h3').first();
        
        if ($heading.length) {
          const $buttonContainer = jQuery('<div class="section-toggle-buttons"></div>');
          const $expandButton = jQuery(`<button type="button" class="button expand-all-button">
            ${this.settings.i18n.expandAll || 'Expand All Sections'}
          </button>`);
          
          const $collapseButton = jQuery(`<button type="button" class="button collapse-all-button">
            ${this.settings.i18n.collapseAll || 'Collapse All Sections'}
          </button>`);
          
          $buttonContainer.append($expandButton).append($collapseButton);
          $heading.after($buttonContainer);
          
          $expandButton.on('click', () => this.expandAllSections($panel));
          $collapseButton.on('click', () => this.collapseAllSections($panel));
        }
      }
    });
  }

  /**
   * Expand all sections in a panel
   * @param {jQuery} $panel - The panel containing sections to expand
   */
  expandAllSections($panel) {
    const $headings = $panel.find('.pe-label-subcategory-heading, .pe-main-section-header');
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
    const $headings = $panel.find('.pe-label-subcategory-heading, .pe-main-section-header');
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
    e.preventDefault();
    const $heading = jQuery(e.currentTarget);
    const path = $heading.attr('data-path') || $heading.next('.pe-label-subcategory-data').data('path');
    
    logger.log('Toggling subcategory for path:', path);
    
    if (!path) {
      logger.warn('No path found for subcategory heading');
      return;
    }
    
    if (this.expandedSections.has(path)) {
      this.expandedSections.delete(path);
      this.updateSectionVisibility(path, false);
    } else {
      this.expandedSections.add(path);
      this.updateSectionVisibility(path, true);
    }
  }
  
  /**
   * Expand all nested subsections of a main section
   * @param {string} mainSectionPath - The path of the main section
   */
  expandNestedSections(mainSectionPath) {
    logger.log(`Expanding nested sections for: ${mainSectionPath}`);
    
    // Find all subcategory headings that are children of this main section
    const $nestedHeadings = jQuery('.pe-label-subcategory-heading').filter(function() {
      const $heading = jQuery(this);
      const headingPath = $heading.next('.pe-label-subcategory-data').data('path') || $heading.data('path');
      return headingPath && headingPath.startsWith(mainSectionPath + '.');
    });
    
    $nestedHeadings.each((_, heading) => {
      const $heading = jQuery(heading);
      const nestedPath = $heading.next('.pe-label-subcategory-data').data('path') || $heading.data('path');
      
      if (nestedPath) {
        logger.log(`Expanding nested section: ${nestedPath}`);
        this.expandedSections.add(nestedPath);
        this.updateSectionVisibility(nestedPath, true, true);
      }
    });
  }
  
  /**
   * Collapse all nested subsections of a main section
   * @param {string} mainSectionPath - The path of the main section
   */
  collapseNestedSections(mainSectionPath) {
    logger.log(`Collapsing nested sections for: ${mainSectionPath}`);
    
    // Find all subcategory headings that are children of this main section
    const $nestedHeadings = jQuery('.pe-label-subcategory-heading').filter(function() {
      const $heading = jQuery(this);
      const headingPath = $heading.next('.pe-label-subcategory-data').data('path') || $heading.data('path');
      return headingPath && headingPath.startsWith(mainSectionPath + '.');
    });
    
    $nestedHeadings.each((_, heading) => {
      const $heading = jQuery(heading);
      const nestedPath = $heading.next('.pe-label-subcategory-data').data('path') || $heading.data('path');
      
      if (nestedPath) {
        logger.log(`Collapsing nested section: ${nestedPath}`);
        this.expandedSections.delete(nestedPath);
        this.updateSectionVisibility(nestedPath, false, true);
      }
    });
  }

  /**
   * Update a section's visibility
   * @param {string} path - The section path
   * @param {boolean} visible - Whether the section should be visible
   * @param {boolean} skipNestedToggle - Whether to skip toggling nested sections (to prevent recursion)
   */
  updateSectionVisibility(path, visible, skipNestedToggle = false) {
    logger.log(`Updating visibility for path: ${path}, visible: ${visible}`);
    
    // Find the heading - could be either subcategory or main section header
    let $heading = jQuery(`.pe-label-subcategory-heading[data-path="${path}"]`);
    if (!$heading.length) {
      $heading = jQuery(`.pe-main-section-header[data-path="${path}"]`);
    }
    
    const $indicator = $heading.find('.expand-indicator');
    
    // Find all fields that belong to this section using multiple strategies
    let $allFields = jQuery();
    
    // Strategy 1: Fields with data-parent-section attribute
    const $fields = jQuery(`.pe-label-field-wrapper[data-parent-section="${path}"]`);
    $allFields = $allFields.add($fields);
    
    // Strategy 2: Direct child fields using path prefix matching
    const $directFields = jQuery(`.pe-label-field-wrapper`).filter(function() {
      const fieldPath = jQuery(this).attr('data-field-path') || '';
      return fieldPath.startsWith(path + '.') && fieldPath.split('.').length === path.split('.').length + 1;
    });
    $allFields = $allFields.add($directFields);
    
    // Strategy 3: Find fields by looking for input elements with data-path starting with our path
    const $inputFields = jQuery(`input[data-path^="${path}."]`).closest('.pe-label-field-wrapper');
    $allFields = $allFields.add($inputFields);
    
    // Strategy 3a: For subcategory sections, find all content between this subcategory and the next one
    if ($heading.hasClass('pe-label-subcategory-heading')) {
      const $nextSubcategoryOrMain = $heading.nextAll('.pe-label-subcategory-heading, .pe-main-section-header').first();
      if ($nextSubcategoryOrMain.length > 0) {
        // Include all content between this subcategory and the next heading
        const $contentBetween = $heading.nextUntil($nextSubcategoryOrMain);
        $allFields = $allFields.add($contentBetween);
      } else {
        // If no next heading, take all following content until a main section
        const $nextMainHeader = $heading.nextAll('.pe-main-section-header').first();
        if ($nextMainHeader.length > 0) {
          const $contentUntilMain = $heading.nextUntil($nextMainHeader);
          $allFields = $allFields.add($contentUntilMain);
        } else {
          // Take all remaining content
          $allFields = $allFields.add($heading.nextAll());
        }
      }
    }
    
    // Strategy 3b: For table structure, also find table rows containing field wrappers
    const $fieldWrappers = $allFields.filter('.pe-label-field-wrapper');
    $fieldWrappers.each(function() {
      const $wrapper = jQuery(this);
      const $parentRow = $wrapper.closest('tr');
      if ($parentRow.length > 0) {
        $allFields = $allFields.add($parentRow);
      }
    });
    
    // Strategy 4: For main sections, include everything except other main section headers
    if ($heading.hasClass('pe-main-section-header')) {
      const $nextMainHeader = $heading.nextAll('.pe-main-section-header').first();
      if ($nextMainHeader.length > 0) {
        // Include everything between this main header and the next, excluding the next main header itself
        const $contentBetween = $heading.nextUntil($nextMainHeader);
        $allFields = $allFields.add($contentBetween);
      } else {
        // If no next main header, take everything following except other main headers
        const $allFollowing = $heading.nextAll();
        const $otherMainHeaders = $allFollowing.filter('.pe-main-section-header');
        $allFields = $allFields.add($allFollowing.not($otherMainHeaders));
      }
    }
    
    // Strategy 5: Look for fields between this heading and the next heading (fallback)
    if ($allFields.length === 0) {
      const $nextHeading = $heading.nextAll('.pe-label-subcategory-heading, .pe-main-section-header').first();
      if ($nextHeading.length > 0) {
        $allFields = $heading.nextUntil($nextHeading).filter('.pe-label-field-wrapper');
      } else {
        // If no next heading, take all following field wrappers until end
        $allFields = $heading.nextAll('.pe-label-field-wrapper');
      }
    }
    
    logger.log(`Found ${$allFields.length} fields for section ${path} using combined strategies`);
    logger.log(`Heading classes: ${$heading.attr('class')}`);
    logger.log(`Indicator found: ${$indicator.length > 0}`);
    
    if (visible) {
      $heading.addClass('expanded');
      $indicator.text('▼ ');
      $allFields.show().css('display', '');
      logger.log(`Expanded section: ${path}`);
      
      // If this is a main section, also expand all nested subsections
      if (!skipNestedToggle && $heading.hasClass('pe-main-section-header')) {
        this.expandNestedSections(path);
      }
    } else {
      $heading.removeClass('expanded');
      $indicator.text('▶ ');
      $allFields.hide();
      logger.log(`Collapsed section: ${path}`);
      
      // If this is a main section, also collapse all nested subsections
      if (!skipNestedToggle && $heading.hasClass('pe-main-section-header')) {
        this.collapseNestedSections(path);
      }
    }
  }

  /**
   * Fix section header table structure to use proper colspan
   */
  fixSectionHeaderTableStructure() {
    logger.log('fixSectionHeaderTableStructure called');
    const $headers = jQuery('.section-header-needs-colspan');
    logger.log('Found headers with needs-colspan:', $headers.length);

    $headers.each((_, sectionHeader) => {
      const $sectionHeader = jQuery(sectionHeader);
      const $td = $sectionHeader.closest('td');
      const $th = $td.prev('th');
      const $tr = $td.closest('tr');

      logger.log('Processing header:', $sectionHeader.text());
      logger.log('Found td:', $td.length);
      logger.log('Found th:', $th.length);
      logger.log('Th is empty:', $th.is(':empty'));

      // Only process if this is in a table row with empty th
      if ($th.length && $th.is(':empty')) {
        logger.log('Removing th and adding colspan for:', $sectionHeader.text());

        // Remove the empty th
        $th.remove();

        // Add colspan to the td
        $td.attr('colspan', '2');
        $td.addClass('section-header-cell');

        // Remove the special class now that we've processed it
        $sectionHeader.removeClass('section-header-needs-colspan');

        logger.log('Fixed section header table structure for:', $sectionHeader.text());
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
   * @param e
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
    // Valid categories list - must match what's defined in PHP (V3 hierarchical structure)
    const validCategories = [
      'estimate_management',
      'room_management',
      'customer_details',
      'product_management',
      'common_ui',
      'modal_system',
      'search_and_filters',
      'pdf_generation'
    ];

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
          // If we're on the labels tab, default to 'estimate_management' category
          currentCategory = 'estimate_management';
          logger.log('Reset category: Defaulting to "estimate_management" category');
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
      this.showNotice(data.message || 'Category reset to defaults successfully. Page will refresh to show changes.', 'success');

      // Update the form fields in the UI
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

        // Schedule a page refresh after a short delay to show the changes
        setTimeout(() => {
          logger.log('Refreshing page to show updated labels');
          window.location.reload();
        }, 1500);
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
   * @param e
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
    // Add preview functionality for labels (V3 hierarchical structure)
    jQuery('.regular-text[id^="estimate_management_"], .regular-text[id^="room_management_"], .regular-text[id^="customer_details_"], .regular-text[id^="product_management_"], .regular-text[id^="common_ui_"], .regular-text[id^="modal_system_"], .regular-text[id^="search_and_filters_"], .regular-text[id^="pdf_generation_"]')
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
   * @param e
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
   * @param labelId
   */
  getPreviewForLabel(labelId) {
    const previewMap = {
      // Estimate Management previews
      'estimate_management_estimate_actions_buttons_save': 'Button text shown when saving',
      'estimate_management_estimate_actions_buttons_print': 'Button text for printing',
      'estimate_management_create_new_estimate_form_estimate_name_field_label': 'Form field label',

      // Room Management previews
      'room_management_add_new_room_form_room_name_field_label': 'Room name form field label',

      // Customer Details previews
      'customer_details_customer_details_form_customer_name_field_label': 'Customer name form field label',

      // Common UI previews
      'common_ui_confirmation_dialogs_buttons_confirm': 'Confirmation dialog button text',
      'common_ui_general_actions_buttons_save': 'General save button text',

      // Add more preview mappings as needed
    };

    return previewMap[labelId] || null;
  }

  /**
   * Handle search functionality (hierarchical version)
   * @param e
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
   * Navigate to a label field by path (hierarchical version)
   * @param {string} path - The path to the field
   */
  goToLabelField(path) {
    logger.log(`DEBUG: goToLabelField called with path: ${path}`);
    
    // First, determine which tab this field is in
    const pathParts = path.split('.');
    const verticalTabId = pathParts[0]; // This should be the vertical tab ID (e.g., 'estimate_management')
    const currentTabId = this.getCurrentSubTabId();
    
    logger.log(`DEBUG: Path parts: ${JSON.stringify(pathParts)}`);
    logger.log(`DEBUG: Vertical tab ID: ${verticalTabId}`);
    logger.log(`DEBUG: Current tab ID: ${currentTabId}`);
    
    // Always try to switch to the correct tab (force it to ensure proper state)
    logger.log(`DEBUG: Switching from tab '${currentTabId}' to tab '${verticalTabId}'`);
    this.activateSubTab(verticalTabId);
    
    // Wait a moment for tab to switch before continuing
    setTimeout(() => {
      this.expandSectionsAndNavigateToField(path, pathParts);
    }, 300);
  }
  
  /**
   * Expand sections and navigate to field after tab switch
   * @param {string} path - The full path to the field
   * @param {Array} pathParts - The path split into parts
   */
  expandSectionsAndNavigateToField(path, pathParts) {
    logger.log(`DEBUG: expandSectionsAndNavigateToField called with path: ${path}`);
    
    // Ensure all parent sections are expanded, including the section containing the field
    let currentPath = '';
    pathParts.forEach((part, index) => {
      // Skip only if this is the actual field name (last part)
      // We want to expand the section that contains the field
      if (index === pathParts.length - 1) {
        // This is the field name, but we should expand its parent section
        // The parent section path is currentPath (already built from previous parts)
        if (currentPath) {
          this.expandedSections.add(currentPath);
          this.updateSectionVisibility(currentPath, true);
          logger.log(`DEBUG: Expanding field container section: ${currentPath}`);
        }
        return;
      }
      
      currentPath = currentPath ? `${currentPath}.${part}` : part;
      this.expandedSections.add(currentPath);
      this.updateSectionVisibility(currentPath, true);
      logger.log(`DEBUG: Expanding parent section: ${currentPath}`);
    });
    
    // Find and highlight the field
    const $field = jQuery(`input[data-path="${path}"]`);
    logger.log(`DEBUG: Looking for field with path: ${path}, found: ${$field.length}`);
    
    if ($field.length) {
      // Additional step: ensure the immediate section containing this field is expanded
      // Find the closest section heading above this field
      const $fieldWrapper = $field.closest('.pe-label-field-wrapper');
      if ($fieldWrapper.length) {
        const $parentSection = $fieldWrapper.prevAll('.pe-label-subcategory-heading, .pe-main-section-header').first();
        if ($parentSection.length) {
          const sectionPath = $parentSection.next('.pe-label-subcategory-data').data('path') || $parentSection.data('path');
          if (sectionPath && !this.expandedSections.has(sectionPath)) {
            logger.log(`DEBUG: Expanding immediate parent section for field: ${sectionPath}`);
            this.expandedSections.add(sectionPath);
            this.updateSectionVisibility(sectionPath, true);
          }
        }
      }
      
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
    } else {
      logger.warn(`DEBUG: Field with path "${path}" not found`);
      
      // Debug: let's see what fields actually exist
      const allFields = jQuery('input[data-path]');
      logger.log(`DEBUG: All available fields:`);
      allFields.each((i, field) => {
        logger.log(`  - ${jQuery(field).data('path')}`);
      });
    }
  }


  /**
   * Download JSON data as a file
   * @param filename
   * @param data
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
    logger.log('Initializing LabelSettingsModule');
    window.LabelSettingsModuleInstance = new LabelSettingsModule();
  }
});

export default LabelSettingsModule;
