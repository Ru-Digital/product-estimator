<?php
/**
 * Activate Hierarchical Labels Structure
 *
 * This script activates the hierarchical labels structure by loading the
 * enhanced settings module and migrating existing labels to the new structure.
 *
 * Usage: Just include this script in your WordPress installation or run it directly.
 * It will automatically:
 * 1. Backup current labels
 * 2. Migrate to hierarchical structure
 * 3. Update settings to use the new UI
 *
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    // Try to load WordPress
    $wp_load_paths = [
        dirname(__FILE__) . '/../../../../../wp-load.php',
        dirname(__FILE__) . '/../../../../wp-load.php', 
        dirname(__FILE__) . '/../../../wp-load.php',
        dirname(__FILE__) . '/../../wp-load.php',
        dirname(__FILE__) . '/../wp-load.php'
    ];

    $wp_loaded = false;
    foreach ($wp_load_paths as $path) {
        if (file_exists($path)) {
            require_once($path);
            $wp_loaded = true;
            break;
        }
    }
    
    // If we still can't load WordPress
    if (!$wp_loaded) {
        // Try to find WordPress root by looking for wp-config.php
        $current_dir = dirname(__FILE__);
        $max_depth = 10;
        $depth = 0;
        
        while ($depth < $max_depth) {
            if (file_exists($current_dir . '/wp-config.php') || file_exists($current_dir . '/wp-load.php')) {
                if (file_exists($current_dir . '/wp-load.php')) {
                    require_once($current_dir . '/wp-load.php');
                    $wp_loaded = true;
                    break;
                }
            }
            $current_dir = dirname($current_dir);
            $depth++;
        }
    }
    
    // If we still can't load WordPress, exit
    if (!$wp_loaded) {
        if (php_sapi_name() == 'cli') {
            echo "Error: Could not find WordPress installation. Please run this script from within your WordPress directory.\n";
        } else {
            die('Error: Could not load WordPress. Please ensure this script is in the correct location within your WordPress installation.');
        }
        exit;
    }
}

// Ensure user has proper permissions
if (!current_user_can('manage_options')) {
    wp_die(__('You do not have sufficient permissions to access this page.', 'product-estimator'));
}

// Backup existing labels first
function backup_existing_labels() {
    $current_labels = get_option('product_estimator_labels', []);
    $backup_name = 'product_estimator_labels_backup_' . date('Y-m-d_H-i-s');
    $backup_result = add_option($backup_name, $current_labels);
    
    if ($backup_result) {
        echo "<p>✅ Successfully backed up current labels to option: <code>$backup_name</code></p>";
    } else {
        echo "<p>⚠️ Failed to create backup option. Continuing anyway, but proceed with caution.</p>";
    }
    
    return $backup_name;
}

// Convert flat structure to hierarchical
function convert_to_hierarchical_structure($flat_labels) {
    // Define mapping from flat categories to hierarchical paths
    $mapping = [
        'buttons' => [
            'save_estimate' => 'estimate.buttons.save',
            'print_estimate' => 'estimate.buttons.print',
            'create_new_estimate' => 'estimate.buttons.create',
            'delete_estimate' => 'estimate.buttons.delete',
            'confirm' => 'common.buttons.confirm',
            'cancel' => 'common.buttons.cancel',
            'contact_email' => 'customer.buttons.contact_email',
            'contact_phone' => 'customer.buttons.contact_phone',
            'remove_room' => 'room.buttons.delete',
            'request_contact' => 'customer.buttons.request_contact',
            'request_copy' => 'estimate.buttons.request_copy',
            'add_new_room' => 'room.buttons.add',
            'create_estimate' => 'estimate.buttons.create',
            'save_changes' => 'common.buttons.save',
            'add_to_estimate' => 'product.buttons.add_to_estimate',
            'add_to_estimate_single_product' => 'product.buttons.add_to_estimate_single',
            'remove_product' => 'product.buttons.remove',
            'add_product' => 'product.buttons.add',
            'edit_product' => 'product.buttons.edit',
            'continue' => 'common.buttons.continue',
            'suggested_products' => 'product.buttons.suggested',
            'replace_product' => 'product.buttons.replace',
            'add_room' => 'room.buttons.add',
            'add_to_cart' => 'product.buttons.add_to_cart',
            'show_more' => 'ui.buttons.show_more',
            'show_less' => 'ui.buttons.show_less',
            'close' => 'common.buttons.close',
            'save' => 'common.buttons.save',
            'delete' => 'common.buttons.delete',
            'edit' => 'common.buttons.edit',
            'add' => 'common.buttons.add',
            'remove' => 'common.buttons.remove',
            'update' => 'common.buttons.update',
            'search' => 'ui.buttons.search',
            'filter' => 'ui.buttons.filter',
            'reset' => 'common.buttons.reset',
            'apply' => 'common.buttons.apply',
            'additional_products' => 'product.buttons.additional',
            'ok' => 'common.buttons.ok',
            'upgrade' => 'product.buttons.upgrade',
            'remove_product_aria' => 'product.buttons.remove_aria',
            'select_additional_product' => 'product.buttons.select_additional',
            'selected_additional_product' => 'product.buttons.selected_additional',
            'add_product_and_room' => 'room.buttons.add_with_product',
            'back_to_products' => 'product.buttons.back_to_list',
            'view_details' => 'product.buttons.view_details',
            'back_to_rooms' => 'room.buttons.back_to_list',
            'start_new_estimate' => 'estimate.buttons.start_new',
            'select_product' => 'product.buttons.select',
            'select_room' => 'room.buttons.select',
            'add_note' => 'product.buttons.add_note',
            'submit' => 'common.buttons.submit',
            'more_options' => 'common.buttons.more_options',
            'back' => 'common.buttons.back',
            'next' => 'common.buttons.next',
            'done' => 'common.buttons.done',
            'select_all' => 'common.buttons.select_all',
            'select_none' => 'common.buttons.select_none',
            'toggle_details' => 'ui.buttons.toggle_details',
            'add_to_room' => 'product.buttons.add_to_room',
            'add_product_to_room' => 'product.buttons.add_to_existing_room',
            'replace_existing_product' => 'product.buttons.replace_existing',
            'go_back_to_room_select' => 'room.buttons.back_to_select',
            'add_room_and_product' => 'room.buttons.add_with_product',
            'similar_products' => 'product.buttons.similar',
            'product_includes' => 'product.buttons.includes',
        ],
        'forms' => [
            'estimate_name' => 'estimate.forms.name',
            'customer_email' => 'customer.forms.email',
            'placeholder_email' => 'customer.forms.email_placeholder',
            'customer_name' => 'customer.forms.name',
            'customer_phone' => 'customer.forms.phone',
            'customer_postcode' => 'customer.forms.postcode',
            'placeholder_name' => 'customer.forms.name_placeholder',
            'placeholder_phone' => 'customer.forms.phone_placeholder',
            'placeholder_postcode' => 'customer.forms.postcode_placeholder',
            'placeholder_estimate_name' => 'estimate.forms.name_placeholder',
            'room_name' => 'room.forms.name',
            'room_width' => 'room.forms.width',
            'room_length' => 'room.forms.length',
            'placeholder_room_name' => 'room.forms.name_placeholder',
            'placeholder_width' => 'room.forms.width_placeholder',
            'placeholder_length' => 'room.forms.length_placeholder',
            'product_quantity' => 'product.forms.quantity',
            'notes' => 'product.forms.notes',
            'quantity' => 'product.forms.quantity',
            'price' => 'product.pricing.price',
            'total' => 'product.pricing.total',
            'subtotal' => 'product.pricing.subtotal',
            'tax' => 'product.pricing.tax',
            'shipping' => 'product.pricing.shipping',
            'discount' => 'product.pricing.discount',
            'room_dimensions' => 'room.headings.dimensions',
            'placeholder_search' => 'ui.search.placeholder',
            'choose_estimate' => 'estimate.forms.choose',
            'select_estimate_option' => 'estimate.forms.select_option',
            'select_estimate' => 'estimate.headings.select',
            'select_room' => 'room.headings.select',
            'full_name' => 'customer.forms.full_name',
            'email_address' => 'customer.forms.email_address',
            'phone_number' => 'customer.forms.phone_number',
            'choose_room' => 'room.forms.choose',
            'select_room_option' => 'room.forms.select_option',
        ],
        'messages' => [
            'product_added' => 'product.messages.added',
            'product_added_message' => 'product.messages.added_details',
            'confirm_delete' => 'common.messages.confirm_delete',
            'confirm_product_remove' => 'product.messages.confirm_remove',
            'product_load_error' => 'product.messages.load_error',
            'room_load_error' => 'room.messages.load_error',
            'confirm_proceed' => 'common.messages.confirm',
            'select_options' => 'product.messages.select_options',
            'estimate_saved' => 'estimate.messages.saved',
            'estimate_deleted' => 'estimate.messages.deleted',
            'room_added' => 'room.messages.added',
            'room_deleted' => 'room.messages.deleted',
            'showing_results' => 'ui.search.results_count',
            'product_removed' => 'product.messages.removed',
            'email_sent' => 'customer.messages.email_sent',
            'settings_saved' => 'common.messages.settings_saved',
            'room_created' => 'room.messages.created',
            'general_error' => 'common.messages.error',
            'save_failed' => 'common.messages.save_failed',
            'invalid_email' => 'customer.messages.invalid_email',
            'invalid_phone' => 'customer.messages.invalid_phone',
            'required_field' => 'common.messages.required_field',
            'network_error' => 'common.messages.network_error',
            'permission_denied' => 'common.messages.permission_denied',
            'confirm_remove_product' => 'product.messages.confirm_remove',
            'confirm_delete_room' => 'room.messages.confirm_delete',
            'unsaved_changes' => 'common.messages.unsaved_changes',
            'min_length' => 'common.messages.min_length',
            'max_length' => 'common.messages.max_length',
            'invalid_format' => 'common.messages.invalid_format',
            'number_required' => 'common.messages.number_required',
            'product_id_required' => 'product.messages.id_required',
            'product_not_found' => 'product.messages.not_found',
            'product_data_error' => 'product.messages.data_error',
            'product_data_retrieved' => 'product.messages.data_retrieved',
            'pricing_helper_missing' => 'product.messages.pricing_helper_missing',
            'pricing_helper_file_missing' => 'product.messages.pricing_helper_file_missing',
            'modal_open_error' => 'modal.messages.open_error',
            'replace_product_error' => 'product.messages.replace_error',
            'product_replaced_success' => 'product.messages.replaced',
            'primary_product_conflict' => 'product.messages.primary_conflict',
            'product_already_exists' => 'product.messages.already_exists',
            'additional_information_required' => 'customer.messages.details_required',
            'email_required_for_copy' => 'customer.messages.email_required',
            'phone_required_for_sms' => 'customer.messages.phone_required',
            'contact_email_details_required' => 'customer.messages.email_details_required',
            'contact_phone_details_required' => 'customer.messages.phone_details_required',
            'email_required_for_estimate' => 'customer.messages.email_required_for_estimate',
            'contact_method_estimate_prompt' => 'customer.messages.contact_method_estimate',
            'contact_method_prompt' => 'customer.messages.contact_method',
            'product_conflict' => 'product.messages.conflict',
            'confirm_product_remove_with_name' => 'product.messages.confirm_remove_with_name',
            'product_added_success' => 'product.messages.added_success',
            'room_created_with_product' => 'room.messages.created_with_product',
            'estimate_removed' => 'estimate.messages.removed',
        ],
        'ui_elements' => [
            'confirm_title' => 'modal.headings.confirmation',
            'no_estimates' => 'estimate.messages.empty',
            'no_rooms' => 'room.messages.empty',
            'no_products' => 'product.messages.empty',
            'price_notice' => 'product.pricing.notice',
            'rooms_heading' => 'estimate.headings.rooms',
            'products_heading' => 'room.headings.products',
            'select_product_options' => 'product.headings.options',
            'create_new_estimate' => 'estimate.headings.create',
            'your_details' => 'customer.headings.details',
            'saved_details' => 'customer.headings.saved_details',
            'edit_your_details' => 'customer.headings.edit_details',
            'primary_product' => 'product.labels.primary',
            'previous' => 'ui.pagination.previous',
            'next' => 'ui.pagination.next',
            'previous_suggestions' => 'product.navigation.previous_suggestions',
            'next_suggestions' => 'product.navigation.next_suggestions',
            'get_started' => 'ui.labels.get_started',
            'expand' => 'ui.buttons.expand',
            'collapse' => 'ui.buttons.collapse',
            'loading' => 'ui.loading.generic',
            'loading_variations' => 'product.loading.variations',
            'loading_products' => 'product.loading.products',
            'close_tooltip' => 'ui.tooltips.close',
            'notes_heading' => 'product.headings.notes',
            'details_heading' => 'product.headings.details',
            'no_notes' => 'product.messages.no_notes',
            'no_results' => 'ui.search.no_results',
            'empty_room' => 'room.messages.empty',
            'empty_estimate' => 'estimate.messages.empty',
            'showing_results' => 'ui.search.results_count',
            'page_of' => 'ui.pagination.page_count',
            'sort_by' => 'ui.search.sort_by',
            'filter_by' => 'ui.search.filter_by',
            'search_results' => 'ui.search.results_heading',
            'no_items' => 'ui.messages.no_items',
            'add_first_item' => 'ui.messages.add_first_item',
            'learn_more' => 'ui.buttons.learn_more',
            'view_all' => 'ui.buttons.view_all',
            'hide_all' => 'ui.buttons.hide_all',
            'error_title' => 'modal.headings.error',
            'product_estimator_title' => 'modal.title',
            'modal_not_found' => 'modal.messages.not_found',
            'close' => 'common.buttons.close',
            'select_options' => 'product.messages.select_options',
            'product_replaced_title' => 'modal.headings.product_replaced',
            'primary_product_conflict_title' => 'modal.headings.product_conflict',
            'product_already_exists_title' => 'modal.headings.product_exists',
            'add_new_room_title' => 'modal.headings.add_room',
            'complete_details_title' => 'modal.headings.customer_details',
            'email_details_required_title' => 'modal.headings.email_details',
            'phone_details_required_title' => 'modal.headings.phone_details',
            'contact_information_required_title' => 'modal.headings.contact_information',
            'contact_method_estimate_title' => 'modal.headings.contact_method_estimate',
            'contact_method_title' => 'modal.headings.contact_method',
            'product_added_title' => 'modal.headings.product_added',
            'room_created_title' => 'modal.headings.room_created',
            'success_title' => 'modal.headings.success',
            'dialog_title_product_added' => 'modal.headings.product_added',
            'dialog_title_product_removed' => 'modal.headings.product_removed',
            'dialog_title_product_replaced' => 'modal.headings.product_replaced',
            'dialog_title_estimate_removed' => 'modal.headings.estimate_removed',
            'dialog_title_delete_estimate' => 'modal.headings.delete_estimate',
            'dialog_title_estimate_saved' => 'modal.headings.estimate_saved',
            'remove_product_title' => 'modal.headings.remove_product',
            'remove_room_title' => 'modal.headings.remove_room',
            'remove_room_message' => 'room.messages.confirm_delete',
            'product_conflict_title' => 'modal.headings.product_conflict',
            'select_estimate_title' => 'modal.headings.select_estimate',
            'select_room_title' => 'modal.headings.select_room',
            'no_estimates_available' => 'estimate.messages.none_available',
            'no_rooms_available' => 'room.messages.none_available',
            'details_toggle' => 'product.buttons.show_details',
            'details_toggle_hide' => 'product.buttons.hide_details',
            'includes_heading' => 'product.headings.includes',
            'no_includes' => 'product.messages.no_includes',
            'variation_options' => 'product.headings.variations',
            'price_range' => 'product.pricing.price_range',
            'single_price' => 'product.pricing.single_price',
            'per_unit' => 'product.pricing.per_unit',
            'total_price' => 'product.pricing.total',
            'estimate_summary' => 'estimate.headings.summary',
            'room_summary' => 'room.headings.summary',
            'product_summary' => 'product.headings.summary',
        ],
        'pdf' => [
            'title' => 'pdf.title',
            'customer_details' => 'pdf.customer_details',
            'estimate_summary' => 'pdf.estimate_summary',
            'price_range' => 'pdf.price_range',
            'from' => 'pdf.from',
            'to' => 'pdf.to',
            'date' => 'pdf.date',
            'page' => 'pdf.page',
            'of' => 'pdf.of',
            'company_name' => 'pdf.company_name',
            'company_phone' => 'pdf.company_phone',
            'company_email' => 'pdf.company_email',
            'company_website' => 'pdf.company_website',
            'footer_text' => 'pdf.footer_text',
            'disclaimer' => 'pdf.disclaimer',
        ]
    ];
    
    // Initialize hierarchical structure
    $hierarchical = [];
    
    // Process each category in the flat structure
    foreach ($flat_labels as $old_category => $labels) {
        // Skip if this category isn't in our mapping
        if (!isset($mapping[$old_category])) {
            continue;
        }
        
        // Process each label in this category
        foreach ($labels as $key => $value) {
            // Check if we have a mapping for this label
            if (isset($mapping[$old_category][$key])) {
                // Get the hierarchical path for this label
                $path = $mapping[$old_category][$key];
                $path_parts = explode('.', $path);
                
                // Create path in hierarchical structure
                $current = &$hierarchical;
                foreach ($path_parts as $i => $part) {
                    if ($i === count($path_parts) - 1) {
                        // Last part is the label key
                        $current[$part] = $value;
                    } else {
                        // Create intermediate nodes if needed
                        if (!isset($current[$part])) {
                            $current[$part] = [];
                        }
                        $current = &$current[$part];
                    }
                }
            } else {
                // For unmapped labels, place in common category under original category
                if (!isset($hierarchical['common'][$old_category])) {
                    $hierarchical['common'][$old_category] = [];
                }
                $hierarchical['common'][$old_category][$key] = $value;
            }
        }
    }
    
    return $hierarchical;
}

// Migrate labels from flat to hierarchical
function migrate_labels_to_hierarchical() {
    $current_labels = get_option('product_estimator_labels', []);
    $hierarchical_labels = convert_to_hierarchical_structure($current_labels);
    
    // Update the option with hierarchical structure
    $update_result = update_option('product_estimator_labels', $hierarchical_labels);
    
    if ($update_result) {
        echo "<p>✅ Successfully migrated labels to hierarchical structure</p>";
    } else {
        echo "<p>⚠️ Failed to update labels option. Check database permissions.</p>";
    }
    
    // Update version for cache busting
    update_option('product_estimator_labels_version', time());
    
    // Clear any caches
    delete_transient('pe_frontend_labels_cache');
    
    return $update_result;
}

// Enable hierarchical UI in settings
function enable_hierarchical_ui() {
    // Create a special option to indicate hierarchical UI should be used
    $result = add_option('product_estimator_labels_hierarchical', true);
    
    if (!$result) {
        // Option might already exist, update it instead
        $result = update_option('product_estimator_labels_hierarchical', true);
    }
    
    if ($result) {
        echo "<p>✅ Successfully enabled hierarchical UI for labels</p>";
    } else {
        echo "<p>⚠️ Failed to enable hierarchical UI. Check database permissions.</p>";
    }
    
    return $result;
}

// Main execution
function main() {
    echo '<div style="font-family: Arial, sans-serif; max-width: 800px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; background-color: #f9f9f9;">';
    echo '<h1>Product Estimator - Migrate to Hierarchical Labels</h1>';
    
    // Step 1: Backup existing labels
    echo '<h2>Step 1: Backup Existing Labels</h2>';
    $backup_name = backup_existing_labels();
    
    // Step 2: Migrate to hierarchical structure
    echo '<h2>Step 2: Migrate to Hierarchical Structure</h2>';
    $migration_result = migrate_labels_to_hierarchical();
    
    // Step 3: Enable hierarchical UI
    echo '<h2>Step 3: Enable Hierarchical UI</h2>';
    $ui_result = enable_hierarchical_ui();
    
    // Summary
    echo '<h2>Migration Summary</h2>';
    if ($migration_result && $ui_result) {
        echo '<div style="padding: 15px; background-color: #dff0d8; border: 1px solid #d6e9c6; border-radius: 4px; color: #3c763d;">';
        echo '<h3 style="margin-top: 0;">✅ Migration Successful!</h3>';
        echo '<p>All steps completed successfully. The hierarchical labels structure is now active.</p>';
        echo '<p>A backup of your previous labels is stored in the option: <code>' . esc_html($backup_name) . '</code></p>';
        echo '</div>';
    } else {
        echo '<div style="padding: 15px; background-color: #f2dede; border: 1px solid #ebccd1; border-radius: 4px; color: #a94442;">';
        echo '<h3 style="margin-top: 0;">⚠️ Migration Partially Completed</h3>';
        echo '<p>Some steps encountered issues. Please check the messages above for details.</p>';
        echo '</div>';
    }
    
    echo '<h2>Next Steps</h2>';
    echo '<ul>';
    echo '<li>Go to the <a href="' . esc_url(admin_url('admin.php?page=product-estimator-settings&tab=labels')) . '">Labels Settings page</a> to verify the new structure</li>';
    echo '<li>Review your label values to ensure everything was migrated correctly</li>';
    echo '<li>If you encounter any issues, you can restore from backup using the option name: <code>' . esc_html($backup_name) . '</code></li>';
    echo '</ul>';
    
    echo '</div>';
}

// Run the migration
main();