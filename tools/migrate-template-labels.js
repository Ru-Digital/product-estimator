/**
 * Template Labels Migration Tool
 * 
 * This script updates template files to use the new hierarchical label structure.
 * It scans HTML files for data-label attributes and updates their values
 * according to the mapping from old to new paths.
 * 
 * Usage:
 *   node tools/migrate-template-labels.js [directory]
 * 
 * If no directory is specified, it will process the src/templates directory.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Map from old label paths to new paths
const LABEL_MAPPING = {
    // Buttons category
    'buttons.save_estimate': 'buttons.estimate.save_estimate',
    'buttons.print_estimate': 'buttons.estimate.print_estimate',
    'buttons.email_estimate': 'buttons.estimate.email_estimate',
    'buttons.add_product': 'buttons.product.add_product',
    'buttons.add_room': 'buttons.room.add_room',
    'buttons.add_to_room': 'buttons.product.add_to_room',
    'buttons.add_to_estimate': 'buttons.product.add_to_estimate',
    'buttons.add_to_estimate_single_product': 'buttons.product.add_to_estimate_single',
    'buttons.save': 'buttons.core.save',
    'buttons.cancel': 'buttons.core.cancel',
    'buttons.confirm': 'buttons.core.confirm',
    'buttons.delete': 'buttons.core.delete',
    'buttons.edit': 'buttons.core.edit',
    'buttons.continue': 'buttons.core.continue',
    'buttons.back': 'buttons.core.back',
    'buttons.close': 'buttons.core.close',
    'buttons.select': 'buttons.core.select',
    'buttons.remove_product': 'buttons.product.remove_product',
    'buttons.remove_room': 'buttons.room.remove_room',
    'buttons.delete_estimate': 'buttons.estimate.delete_estimate',
    'buttons.delete_room': 'buttons.room.delete_room',
    'buttons.delete_product': 'buttons.product.delete_product',
    'buttons.view_details': 'buttons.product.view_details',
    'buttons.hide_details': 'buttons.product.hide_details',
    'buttons.similar_products': 'buttons.product.view_similar',
    'buttons.product_includes': 'buttons.product.show_includes',
    'buttons.show_more': 'buttons.core.show_more',
    'buttons.show_less': 'buttons.core.show_less',
    'buttons.next': 'buttons.core.next',
    'buttons.previous': 'buttons.core.previous',
    'buttons.add_note': 'buttons.product.add_note',
    'buttons.select_variation': 'buttons.product.select_variation',
    'buttons.close_dialog': 'buttons.dialogs.close',
    'buttons.confirm_delete': 'buttons.dialogs.confirm_delete',
    'buttons.cancel_delete': 'buttons.dialogs.cancel_delete',
    'buttons.proceed': 'buttons.dialogs.proceed',
    'buttons.try_again': 'buttons.dialogs.try_again',
    'buttons.save_changes': 'buttons.core.save',
    'buttons.create_estimate': 'buttons.estimate.create_estimate',
    'buttons.create_new_estimate': 'buttons.estimate.create_estimate',
    'buttons.add_new_room': 'buttons.room.add_room',
    
    // Forms category
    'forms.estimate_name': 'forms.estimate.name.label',
    'forms.estimate_name_placeholder': 'forms.estimate.name.placeholder',
    'forms.room_name': 'forms.room.name.label',
    'forms.room_name_placeholder': 'forms.room.name.placeholder',
    'forms.room_width': 'forms.room.width.label',
    'forms.room_width_placeholder': 'forms.room.width.placeholder',
    'forms.room_length': 'forms.room.length.label',
    'forms.room_length_placeholder': 'forms.room.length.placeholder',
    'forms.room_dimensions': 'forms.room.dimensions.label',
    'forms.room_dimensions_help': 'forms.room.dimensions.help_text',
    'forms.customer_name': 'forms.customer.name.label',
    'forms.customer_name_placeholder': 'forms.customer.name.placeholder',
    'forms.customer_email': 'forms.customer.email.label',
    'forms.customer_email_placeholder': 'forms.customer.email.placeholder',
    'forms.customer_phone': 'forms.customer.phone.label',
    'forms.customer_phone_placeholder': 'forms.customer.phone.placeholder',
    'forms.customer_postcode': 'forms.customer.postcode.label',
    'forms.customer_postcode_placeholder': 'forms.customer.postcode.placeholder',
    'forms.customer_details': 'forms.customer.section_title',
    'forms.saved_details': 'forms.customer.use_saved',
    'forms.save_details': 'forms.customer.save_details',
    'forms.select_estimate': 'forms.estimate.selector.label',
    'forms.select_room': 'forms.room.selector.label',
    'forms.required_field': 'forms.validation.required_field',
    'forms.minimum_length': 'forms.validation.min_length',
    'forms.maximum_length': 'forms.validation.max_length',
    'forms.invalid_email': 'forms.validation.invalid_email',
    'forms.invalid_phone': 'forms.validation.invalid_phone',
    'forms.invalid_postcode': 'forms.validation.invalid_postcode',
    'forms.numeric_only': 'forms.validation.numeric_only',
    'forms.default_estimate_name': 'forms.placeholders.default_estimate_name',
    'forms.default_room_name': 'forms.placeholders.default_room_name',
    'forms.select_option': 'forms.placeholders.select_option',
    'forms.search_products': 'forms.placeholders.search_products',
    'forms.placeholder_name': 'forms.customer.name.placeholder',
    'forms.placeholder_email': 'forms.customer.email.placeholder',
    'forms.placeholder_phone': 'forms.customer.phone.placeholder',
    'forms.placeholder_postcode': 'forms.customer.postcode.placeholder',
    'forms.placeholder_room_name': 'forms.room.name.placeholder',
    'forms.placeholder_estimate_name': 'forms.estimate.name.placeholder',
    'forms.placeholder_width': 'forms.room.width.placeholder',
    'forms.placeholder_length': 'forms.room.length.placeholder',
    
    // Messages category
    'messages.product_added': 'messages.success.product_added',
    'messages.room_added': 'messages.success.room_added',
    'messages.estimate_saved': 'messages.success.estimate_saved',
    'messages.email_sent': 'messages.success.email_sent',
    'messages.changes_saved': 'messages.success.changes_saved',
    'messages.operation_complete': 'messages.success.operation_completed',
    'messages.error': 'messages.error.general_error',
    'messages.network_error': 'messages.error.network_error',
    'messages.save_failed': 'messages.error.save_failed',
    'messages.load_failed': 'messages.error.load_failed',
    'messages.invalid_data': 'messages.error.invalid_data',
    'messages.server_error': 'messages.error.server_error',
    'messages.product_not_found': 'messages.error.product_not_found',
    'messages.room_not_found': 'messages.error.room_not_found',
    'messages.unsaved_changes': 'messages.warning.unsaved_changes',
    'messages.duplicate_item': 'messages.warning.duplicate_item',
    'messages.will_be_deleted': 'messages.warning.will_be_deleted',
    'messages.cannot_be_undone': 'messages.warning.cannot_be_undone',
    'messages.validation_issues': 'messages.warning.validation_issues',
    'messages.no_rooms': 'messages.info.no_rooms_yet',
    'messages.no_products': 'messages.info.no_products_yet',
    'messages.no_estimates': 'messages.info.no_estimates_yet',
    'messages.product_count': 'messages.info.product_count',
    'messages.room_count': 'messages.info.room_count',
    'messages.estimate_count': 'messages.info.estimate_count',
    'messages.price_range_info': 'messages.info.price_range_info',
    'messages.confirm_delete_product': 'messages.confirm.delete_product',
    'messages.confirm_delete_room': 'messages.confirm.delete_room',
    'messages.confirm_delete_estimate': 'messages.confirm.delete_estimate',
    'messages.confirm_discard': 'messages.confirm.discard_changes',
    'messages.confirm_proceed': 'messages.confirm.proceed_with_action',
    'messages.confirm_replace': 'messages.confirm.replace_product',
    'messages.product_conflict': 'messages.confirm.product_conflict',
    'messages.create_new_room': 'messages.confirm.create_new_room',
    
    // UI Elements category
    'ui_elements.estimates_title': 'ui.headings.estimates_title',
    'ui_elements.rooms_title': 'ui.headings.rooms_title',
    'ui_elements.products_title': 'ui.headings.products_title',
    'ui_elements.customer_details_title': 'ui.headings.customer_details_title',
    'ui_elements.estimate_summary': 'ui.headings.estimate_summary',
    'ui_elements.room_summary': 'ui.headings.room_summary',
    'ui_elements.product_details': 'ui.headings.product_details',
    'ui_elements.similar_products': 'ui.headings.similar_products',
    'ui_elements.total_price': 'ui.labels.total_price',
    'ui_elements.price_range': 'ui.labels.price_range',
    'ui_elements.unit_price': 'ui.labels.unit_price',
    'ui_elements.product_name': 'ui.labels.product_name',
    'ui_elements.room_name': 'ui.labels.room_name',
    'ui_elements.estimate_name': 'ui.labels.estimate_name',
    'ui_elements.created_date': 'ui.labels.created_date',
    'ui_elements.last_modified': 'ui.labels.last_modified',
    'ui_elements.quantity': 'ui.labels.quantity',
    'ui_elements.dimensions': 'ui.labels.dimensions',
    'ui_elements.show_details': 'ui.toggles.show_details',
    'ui_elements.hide_details': 'ui.toggles.hide_details',
    'ui_elements.show_more': 'ui.toggles.show_more',
    'ui_elements.show_less': 'ui.toggles.show_less',
    'ui_elements.expand': 'ui.toggles.expand',
    'ui_elements.collapse': 'ui.toggles.collapse',
    'ui_elements.show_includes': 'ui.toggles.show_includes',
    'ui_elements.hide_includes': 'ui.toggles.hide_includes',
    'ui_elements.no_estimates': 'ui.empty_states.no_estimates',
    'ui_elements.no_rooms': 'ui.empty_states.no_rooms',
    'ui_elements.no_products': 'ui.empty_states.no_products',
    'ui_elements.no_results': 'ui.empty_states.no_results',
    'ui_elements.no_similar_products': 'ui.empty_states.no_similar_products',
    'ui_elements.no_includes': 'ui.empty_states.no_includes',
    'ui_elements.empty_room': 'ui.empty_states.empty_room',
    'ui_elements.empty_estimate': 'ui.empty_states.empty_estimate',
    'ui_elements.loading': 'ui.loading.please_wait',
    'ui_elements.loading_products': 'ui.loading.loading_products',
    'ui_elements.loading_rooms': 'ui.loading.loading_rooms',
    'ui_elements.loading_estimates': 'ui.loading.loading_estimates',
    'ui_elements.processing': 'ui.loading.processing_request',
    'ui_elements.saving': 'ui.loading.saving_changes',
    'ui_elements.searching': 'ui.loading.searching',
    'ui_elements.dialog_title_product': 'ui.dialogs.titles.product_selection',
    'ui_elements.dialog_title_room': 'ui.dialogs.titles.room_selection',
    'ui_elements.dialog_title_estimate': 'ui.dialogs.titles.estimate_selection',
    'ui_elements.dialog_title_confirm': 'ui.dialogs.titles.confirmation',
    'ui_elements.dialog_title_error': 'ui.dialogs.titles.error',
    'ui_elements.dialog_title_success': 'ui.dialogs.titles.success',
    'ui_elements.dialog_title_warning': 'ui.dialogs.titles.warning',
    'ui_elements.dialog_title_conflict': 'ui.dialogs.titles.product_conflict',
    'ui_elements.dialog_title_customer': 'ui.dialogs.titles.customer_details',
    'ui_elements.dialog_body_confirm_delete': 'ui.dialogs.bodies.confirm_delete',
    'ui_elements.dialog_body_confirm_replace': 'ui.dialogs.bodies.confirm_replace',
    'ui_elements.dialog_body_confirm_discard': 'ui.dialogs.bodies.confirm_discard',
    'ui_elements.dialog_body_general_confirm': 'ui.dialogs.bodies.general_confirmation',
    'ui_elements.dialog_body_product_conflict': 'ui.dialogs.bodies.product_conflict',
    'ui_elements.dialog_body_required_fields': 'ui.dialogs.bodies.required_fields',
    'ui_elements.your_details': 'forms.customer.section_title',
    'ui_elements.saved_details': 'forms.customer.use_saved',
    'ui_elements.edit_your_details': 'forms.customer.section_title',
    'ui_elements.select_variation': 'buttons.product.select_variation',
    'ui_elements.create_new_estimate': 'ui.headings.create_estimate',
    'ui_elements.general.close': 'common.actions.close',
    'ui.general.close': 'common.actions.close',
    'ui.components.variations.attribute_label': 'ui.labels.attribute_label',
    'ui.components.variations.select_option': 'forms.validation.select_option',
    'dialogs.titles.confirmation': 'ui.dialogs.titles.confirmation',
    'dialogs.messages.confirm_action': 'ui.dialogs.bodies.general_confirmation',
    'actions.core.cancel': 'buttons.core.cancel',
    'actions.core.confirm': 'buttons.core.confirm',
    'dialogs.titles.product_selection': 'ui.dialogs.titles.product_selection',
    'dialogs.messages.select_options': 'ui.dialogs.bodies.select_variation_options',
    
    // Tooltips category
    'tooltips.create_estimate': 'tooltips.estimate.create_new_tip',
    'tooltips.print_estimate': 'tooltips.estimate.print_tip',
    'tooltips.email_estimate': 'tooltips.estimate.email_tip',
    'tooltips.save_estimate': 'tooltips.estimate.save_tip',
    'tooltips.delete_estimate': 'tooltips.estimate.delete_tip',
    'tooltips.product_count': 'tooltips.estimate.product_count_tip',
    'tooltips.add_to_room': 'tooltips.product.add_to_room_tip',
    'tooltips.remove_from_room': 'tooltips.product.remove_from_room_tip',
    'tooltips.product_details': 'tooltips.product.details_tip',
    'tooltips.price_range': 'tooltips.product.price_range_tip',
    'tooltips.variations': 'tooltips.product.variations_tip',
    'tooltips.includes': 'tooltips.product.includes_tip',
    'tooltips.similar_products': 'tooltips.product.similar_products_tip',
    'tooltips.add_room': 'tooltips.room.add_room_tip',
    'tooltips.delete_room': 'tooltips.room.delete_room_tip',
    'tooltips.dimensions': 'tooltips.room.dimensions_tip',
    'tooltips.products_count': 'tooltips.room.products_count_tip',
    'tooltips.edit_dimensions': 'tooltips.room.edit_dimensions_tip',
};

// ARIA label attribute names
const ARIA_LABEL_ATTRS = [
    'data-aria-label',
    'data-title-label'
];

// Placeholder attribute names
const PLACEHOLDER_LABEL_ATTRS = [
    'data-placeholder-label'
];

// All label attribute names
const ALL_LABEL_ATTRS = ['data-label', ...ARIA_LABEL_ATTRS, ...PLACEHOLDER_LABEL_ATTRS];

/**
 * Process a single template file
 * 
 * @param {string} filePath - Path to the template file
 * @param {boolean} dryRun - If true, just log changes without writing
 * @param {boolean} backupFiles - If true, create backup files
 * @returns {Object} Statistics about changes
 */
function processTemplateFile(filePath, dryRun = false, backupFiles = true) {
    const content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;
    const stats = {
        file: filePath,
        totalLabels: 0,
        updatedLabels: 0,
        changes: []
    };

    // Process each label attribute
    ALL_LABEL_ATTRS.forEach(attrName => {
        // Find all instances of the attribute
        const regex = new RegExp(`${attrName}="([^"]+)"`, 'g');
        let match;
        
        while ((match = regex.exec(content)) !== null) {
            const fullMatch = match[0];
            const oldLabelPath = match[1];
            stats.totalLabels++;
            
            // Check if this label path needs to be updated
            if (LABEL_MAPPING[oldLabelPath]) {
                const newLabelPath = LABEL_MAPPING[oldLabelPath];
                const newAttr = `${attrName}="${newLabelPath}"`;
                
                // Replace the attribute in the content
                newContent = newContent.replace(fullMatch, newAttr);
                
                stats.updatedLabels++;
                stats.changes.push({
                    attribute: attrName,
                    oldPath: oldLabelPath,
                    newPath: newLabelPath
                });
            }
        }
    });

    // If we made changes and this is not a dry run, write the file
    if (stats.updatedLabels > 0 && !dryRun) {
        // Create backup if requested
        if (backupFiles) {
            const backupPath = `${filePath}.bak`;
            fs.writeFileSync(backupPath, content);
            console.log(`Backup created: ${backupPath}`);
        }
        
        // Write updated file
        fs.writeFileSync(filePath, newContent);
        console.log(`Updated ${stats.updatedLabels} labels in ${filePath}`);
    }
    
    return stats;
}

/**
 * Process all template files in a directory
 * 
 * @param {string} directory - Directory to search for templates
 * @param {boolean} dryRun - If true, just log changes without writing
 * @param {boolean} backupFiles - If true, create backup files
 * @returns {Object} Statistics about changes
 */
function processTemplates(directory, dryRun = false, backupFiles = true) {
    const pattern = path.join(directory, '**/*.html');
    const files = glob.sync(pattern);
    
    const stats = {
        processedFiles: 0,
        totalLabels: 0,
        updatedLabels: 0,
        fileStats: []
    };
    
    console.log(`Found ${files.length} template files in ${directory}`);
    
    files.forEach(file => {
        const fileStats = processTemplateFile(file, dryRun, backupFiles);
        stats.processedFiles++;
        stats.totalLabels += fileStats.totalLabels;
        stats.updatedLabels += fileStats.updatedLabels;
        stats.fileStats.push(fileStats);
    });
    
    return stats;
}

/**
 * Main function
 */
function main() {
    // Parse command line arguments
    const args = process.argv.slice(2);
    const options = {
        directory: path.resolve(process.cwd(), 'src/templates'),
        dryRun: false,
        backupFiles: true
    };
    
    // Process arguments
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        
        if (arg === '--dry-run' || arg === '-d') {
            options.dryRun = true;
        } else if (arg === '--no-backup' || arg === '-n') {
            options.backupFiles = false;
        } else if (!arg.startsWith('-')) {
            options.directory = path.resolve(process.cwd(), arg);
        }
    }
    
    console.log(`Processing templates in ${options.directory}`);
    if (options.dryRun) {
        console.log('Dry run mode: no files will be modified');
    }
    
    // Process templates
    const stats = processTemplates(options.directory, options.dryRun, options.backupFiles);
    
    // Print summary
    console.log('\nSummary:');
    console.log(`Processed ${stats.processedFiles} template files`);
    console.log(`Found ${stats.totalLabels} label attributes`);
    console.log(`Updated ${stats.updatedLabels} label paths`);
    
    // Print details of files with changes
    const filesWithChanges = stats.fileStats.filter(f => f.updatedLabels > 0);
    if (filesWithChanges.length > 0) {
        console.log('\nDetails of files with changes:');
        filesWithChanges.forEach(file => {
            console.log(`\n${file.file}:`);
            console.log(`  Updated ${file.updatedLabels} of ${file.totalLabels} labels`);
            
            if (file.changes.length <= 10) {
                // Show all changes if there are 10 or fewer
                console.log('  Changes:');
                file.changes.forEach(change => {
                    console.log(`    ${change.attribute}: ${change.oldPath} -> ${change.newPath}`);
                });
            } else {
                // Show just the first 5 and last 5 changes if there are more than 10
                console.log('  First 5 changes:');
                file.changes.slice(0, 5).forEach(change => {
                    console.log(`    ${change.attribute}: ${change.oldPath} -> ${change.newPath}`);
                });
                
                console.log(`    ... ${file.changes.length - 10} more changes ...`);
                
                console.log('  Last 5 changes:');
                file.changes.slice(-5).forEach(change => {
                    console.log(`    ${change.attribute}: ${change.oldPath} -> ${change.newPath}`);
                });
            }
        });
    }
    
    // Warn about unused mappings
    const usedPaths = new Set();
    stats.fileStats.forEach(file => {
        file.changes.forEach(change => {
            usedPaths.add(change.oldPath);
        });
    });
    
    const unusedMappings = Object.keys(LABEL_MAPPING).filter(key => !usedPaths.has(key));
    if (unusedMappings.length > 0) {
        console.log(`\nWARNING: ${unusedMappings.length} mappings were not used in any template:`);
        console.log(unusedMappings.slice(0, 20).join(', '));
        if (unusedMappings.length > 20) {
            console.log(`... and ${unusedMappings.length - 20} more`);
        }
    }
}

// Run the main function
main();