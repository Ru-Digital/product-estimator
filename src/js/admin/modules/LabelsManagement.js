/**
 * Labels Management Module
 * 
 * Handles bulk operations, search, import/export, and advanced
 * label management functionality for the admin interface.
 * @since 2.0.0
 */
class LabelsManagement {
    constructor() {
        this.labelsContext = window.productEstimatorAdmin.labelsSettings;
        this.searchTimeout = null;
        this.bulkEditItems = [];
        
        this.init();
    }
    
    init() {
        if (!this.labelsContext) return;
        
        this.bindEvents();
        this.initializePreview();
    }
    
    bindEvents() {
        // Export functionality
        jQuery('#export-labels').on('click', this.handleExport.bind(this));
        
        // Import functionality
        jQuery('#import-labels').on('click', () => jQuery('#import-file').click());
        jQuery('#import-file').on('change', this.handleImport.bind(this));
        
        // Search functionality
        jQuery('#label-search').on('input', this.handleSearch.bind(this));
        
        // Reset category
        jQuery('#reset-category-defaults').on('click', this.handleResetCategory.bind(this));
        
        // Bulk edit
        jQuery(document).on('click', '.bulk-edit-trigger', this.handleBulkEditTrigger.bind(this));
        jQuery('#apply-bulk-edits').on('click', this.handleBulkUpdate.bind(this));
        jQuery('#cancel-bulk-edit').on('click', this.cancelBulkEdit.bind(this));
        
        // Preview updates
        jQuery('.regular-text[id^="buttons_"], .regular-text[id^="forms_"], .regular-text[id^="messages_"], .regular-text[id^="ui_elements_"], .regular-text[id^="pdf_"]')
            .on('input', this.updatePreview.bind(this));
    }
    
    handleExport() {
        jQuery.ajax({
            url: window.ajaxurl,
            type: 'POST',
            data: {
                action: 'pe_export_labels',
                nonce: this.labelsContext.managementNonce
            },
            success: (response) => {
                if (response.success) {
                    this.downloadJSON(response.data.filename, response.data.data);
                    this.showNotice(this.labelsContext.i18n.exportSuccess, 'success');
                }
            }
        });
    }
    
    handleImport(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        if (!confirm(this.labelsContext.i18n.confirmImport)) {
            jQuery('#import-file').val('');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (event) => {
            const importData = event.target.result;
            
            jQuery.ajax({
                url: window.ajaxurl,
                type: 'POST',
                data: {
                    action: 'pe_import_labels',
                    nonce: this.labelsContext.managementNonce,
                    import_data: importData
                },
                success: (response) => {
                    if (response.success) {
                        this.showNotice(response.data.message, 'success');
                        // Reload page to show imported labels
                        setTimeout(() => location.reload(), 1500);
                    } else {
                        this.showNotice(response.data || this.labelsContext.i18n.importError, 'error');
                    }
                    jQuery('#import-file').val('');
                },
                error: () => {
                    this.showNotice(this.labelsContext.i18n.importError, 'error');
                    jQuery('#import-file').val('');
                }
            });
        };
        
        reader.readAsText(file);
    }
    
    handleSearch(e) {
        const searchTerm = e.target.value.trim();
        
        // Clear previous timeout
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }
        
        if (searchTerm.length < 3) {
            jQuery('#search-results').hide().empty();
            return;
        }
        
        // Debounce search
        this.searchTimeout = setTimeout(() => {
            jQuery.ajax({
                url: window.ajaxurl,
                type: 'POST',
                data: {
                    action: 'pe_search_labels',
                    nonce: this.labelsContext.managementNonce,
                    search_term: searchTerm
                },
                success: (response) => {
                    if (response.success) {
                        this.displaySearchResults(response.data.results);
                    }
                }
            });
        }, 300);
    }
    
    displaySearchResults(results) {
        const $resultsContainer = jQuery('#search-results');
        $resultsContainer.empty();
        
        if (results.length === 0) {
            $resultsContainer.html('<p>' + this.labelsContext.i18n.searchNoResults + '</p>');
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
        
        jQuery.ajax({
            url: window.ajaxurl,
            type: 'POST',
            data: {
                action: 'pe_bulk_update_labels',
                nonce: this.labelsContext.managementNonce,
                updates: updates
            },
            success: (response) => {
                if (response.success) {
                    this.showNotice(this.labelsContext.i18n.bulkUpdateSuccess, 'success');
                    
                    // Update the actual input fields
                    this.bulkEditItems.forEach(item => {
                        const $input = jQuery(`#${item.category}_${item.key}`);
                        $input.val(item.newValue);
                    });
                    
                    this.cancelBulkEdit();
                } else {
                    this.showNotice(this.labelsContext.i18n.bulkUpdateError, 'error');
                }
            }
        });
    }
    
    cancelBulkEdit() {
        this.bulkEditItems = [];
        jQuery('.label-bulk-edit-section').hide();
        jQuery('#bulk-edit-items').empty();
    }
    
    handleResetCategory() {
        const currentCategory = jQuery('.pe-vtabs-nav .active').data('vertical-tab-id');
        
        if (!currentCategory) {
            return;
        }
        
        if (!confirm(this.labelsContext.i18n.resetConfirm)) {
            return;
        }
        
        jQuery.ajax({
            url: window.ajaxurl,
            type: 'POST',
            data: {
                action: 'pe_reset_category_labels',
                nonce: this.labelsContext.managementNonce,
                category: currentCategory
            },
            success: (response) => {
                if (response.success) {
                    this.showNotice(response.data.message, 'success');
                    
                    // Update the form fields
                    Object.entries(response.data.labels).forEach(([key, value]) => {
                        jQuery(`#${currentCategory}_${key}`).val(value);
                    });
                }
            }
        });
    }
    
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
    
    updatePreview(e) {
        const $input = jQuery(e.target);
        const value = $input.val();
        const $preview = $input.next('.label-preview-text');
        
        if ($preview.length) {
            $preview.find('em').text(value);
        }
    }
    
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
    
    showNotice(message, type = 'info') {
        const $notice = jQuery(`
            <div class="notice notice-${type} is-dismissible">
                <p>${message}</p>
            </div>
        `);
        
        jQuery('.wrap h1').after($notice);
        
        // Trigger WordPress dismiss button functionality
        jQuery(document).trigger('wp-updates-notice-added');
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            $notice.fadeOut(() => $notice.remove());
        }, 5000);
    }
}

// Initialize when DOM is ready
jQuery(document).ready(() => {
    new LabelsManagement();
});

export default LabelsManagement;