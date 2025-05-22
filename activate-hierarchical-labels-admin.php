<?php
/**
 * Admin page to activate hierarchical labels
 * Add this as a temporary admin page to activate the hierarchical labels system
 */

// Add admin menu item
add_action('admin_menu', 'add_hierarchical_labels_activation_page');

function add_hierarchical_labels_activation_page() {
    add_submenu_page(
        'tools.php',
        'Activate Hierarchical Labels',
        'Activate Hierarchical Labels',
        'manage_options',
        'activate-hierarchical-labels',
        'hierarchical_labels_activation_page'
    );
}

function hierarchical_labels_activation_page() {
    ?>
    <div class="wrap">
        <h1>Activate Hierarchical Labels System</h1>
        
        <?php
        if (isset($_POST['activate_hierarchical_labels']) && wp_verify_nonce($_POST['_wpnonce'], 'activate_hierarchical_labels')) {
            // Run the activation process
            activate_hierarchical_labels_process();
        } else {
            // Show the activation form
            show_activation_form();
        }
        ?>
    </div>
    <?php
}

function show_activation_form() {
    $hierarchical_enabled = get_option('product_estimator_labels_hierarchical', false);
    $labels_version = get_option('product_estimator_labels_version', '1.0.0');
    
    ?>
    <div class="card">
        <h2>Current Status</h2>
        <?php if ($hierarchical_enabled): ?>
            <p style="color: green;">✅ Hierarchical labels system is already enabled</p>
            <p>Labels version: <?php echo esc_html($labels_version); ?></p>
            <p><a href="<?php echo admin_url('admin.php?page=product-estimator-settings&tab=labels'); ?>">Go to Labels Settings →</a></p>
        <?php else: ?>
            <p style="color: blue;">○ Hierarchical labels system is not yet enabled</p>
            <p>Current labels version: <?php echo esc_html($labels_version); ?></p>
            <p><strong>Ready to activate the hierarchical system.</strong></p>
        <?php endif; ?>
    </div>
    
    <?php if (!$hierarchical_enabled): ?>
    <div class="card">
        <h2>About This Process</h2>
        <p>This will activate the hierarchical labels system for the Product Estimator plugin.</p>
        <p><strong>What this does:</strong></p>
        <ul>
            <li>Backs up your existing labels configuration</li>
            <li>Converts flat labels to hierarchical structure</li>
            <li>Enables the new hierarchical UI in admin settings</li>
            <li>Maintains backward compatibility with existing code</li>
        </ul>
        
        <form method="post" action="">
            <?php wp_nonce_field('activate_hierarchical_labels'); ?>
            <input type="hidden" name="activate_hierarchical_labels" value="1">
            <p>
                <input type="submit" class="button button-primary" value="Activate Hierarchical Labels System">
            </p>
        </form>
    </div>
    <?php endif; ?>
    <?php
}

function activate_hierarchical_labels_process() {
    ?>
    <div class="card">
        <h2>Activation Process</h2>
        
        <?php
        try {
            echo '<h3>Step 1: Backup Existing Labels</h3>';
            $backup_name = backup_existing_labels_admin();
            
            echo '<h3>Step 2: Migrate to Hierarchical Structure</h3>';
            $migration_result = migrate_labels_to_hierarchical_admin();
            
            echo '<h3>Step 3: Enable Hierarchical UI</h3>';
            $ui_result = enable_hierarchical_ui_admin();
            
            echo '<h3>Activation Complete</h3>';
            if ($migration_result && $ui_result) {
                echo '<div class="notice notice-success"><p><strong>✅ Migration Successful!</strong></p>';
                echo '<p>All steps completed successfully. The hierarchical labels structure is now active.</p>';
                echo '<p>A backup of your previous labels is stored in the option: <code>' . esc_html($backup_name) . '</code></p></div>';
                
                echo '<p><a href="' . admin_url('admin.php?page=product-estimator-settings&tab=labels') . '" class="button button-primary">Go to Labels Settings →</a></p>';
            } else {
                echo '<div class="notice notice-warning"><p><strong>⚠️ Migration Partially Completed</strong></p>';
                echo '<p>Some steps encountered issues. Please check the messages above for details.</p></div>';
            }
            
        } catch (Exception $e) {
            echo '<div class="notice notice-error"><p><strong>✗ Error during activation:</strong> ' . esc_html($e->getMessage()) . '</p></div>';
        }
        ?>
    </div>
    <?php
}

// Backup existing labels first
function backup_existing_labels_admin() {
    $current_labels = get_option('product_estimator_labels', []);
    $backup_name = 'product_estimator_labels_backup_' . date('Y-m-d_H-i-s');
    $backup_result = add_option($backup_name, $current_labels);
    
    if ($backup_result) {
        echo "<p style='color: green;'>✅ Successfully backed up current labels to option: <code>$backup_name</code></p>";
    } else {
        echo "<p style='color: orange;'>⚠️ Failed to create backup option. Continuing anyway, but proceed with caution.</p>";
    }
    
    return $backup_name;
}

// Convert flat structure to hierarchical
function convert_to_hierarchical_structure_admin($flat_labels) {
    // Define mapping from flat categories to UI component-based hierarchical paths (V3)
    // PHASE 1: Core Components - Field-Grouped Structure
    $mapping = [
        'buttons' => [
            // === ESTIMATE MANAGEMENT ===
            // Create New Estimate Form
            'create_new_estimate' => 'estimate_management.create_new_estimate_form.buttons.create',
            'create_estimate' => 'estimate_management.create_new_estimate_form.buttons.create',
            
            // Estimate Actions
            'save_estimate' => 'estimate_management.estimate_actions.buttons.save',
            'print_estimate' => 'estimate_management.estimate_actions.buttons.print',
            'delete_estimate' => 'estimate_management.estimate_actions.buttons.delete',
            'request_copy' => 'estimate_management.estimate_actions.buttons.request_copy',
            'start_new_estimate' => 'estimate_management.estimate_selection.buttons.start_new',
            
            // === ROOM MANAGEMENT ===
            // Add New Room Form
            'add_new_room' => 'room_management.add_new_room_form.buttons.add',
            'add_room' => 'room_management.add_new_room_form.buttons.add',
            'add_room_and_product' => 'room_management.add_new_room_form.buttons.add_with_product',
            'add_product_and_room' => 'room_management.add_new_room_form.buttons.add_with_product',
            
            // Room Selection Form
            'select_room' => 'room_management.room_selection_form.buttons.select',
            'go_back_to_room_select' => 'room_management.room_selection_form.buttons.back_to_select',
            
            // Room Actions
            'remove_room' => 'room_management.room_actions.buttons.delete',
            
            // Room Navigation
            'back_to_rooms' => 'room_management.room_navigation.buttons.back_to_list',
            
            // === CUSTOMER DETAILS ===
            // Contact Methods
            'contact_email' => 'customer_details.contact_methods.buttons.contact_email',
            'contact_phone' => 'customer_details.contact_methods.buttons.contact_phone',
            
            // Contact Actions
            'request_contact' => 'customer_details.contact_actions.buttons.request_contact',
            
            // === COMMON UI (Phase 1 - Core Only) ===
            'confirm' => 'common_ui.confirmation_dialogs.buttons.confirm',
            'cancel' => 'common_ui.confirmation_dialogs.buttons.cancel',
            'close' => 'common_ui.general_actions.buttons.close',
            'save' => 'common_ui.general_actions.buttons.save',
            'save_changes' => 'common_ui.general_actions.buttons.save_changes',
            'delete' => 'common_ui.general_actions.buttons.delete',
            'edit' => 'common_ui.general_actions.buttons.edit',
            'add' => 'common_ui.general_actions.buttons.add',
            'remove' => 'common_ui.general_actions.buttons.remove',
            'continue' => 'common_ui.navigation.buttons.continue',
            'back' => 'common_ui.navigation.buttons.back',
            'ok' => 'common_ui.confirmation_dialogs.buttons.ok',
            
            // === PRODUCTS (Phase 2 - Placeholder for now) ===
            'add_product' => 'product.buttons.add',
            'remove_product' => 'product.buttons.remove',
            'edit_product' => 'product.buttons.edit',
            'add_to_estimate' => 'product.buttons.add_to_estimate',
        ],
        'forms' => [
            // === ESTIMATE MANAGEMENT - FIELD GROUPED ===
            // Create New Estimate Form - Estimate Name Field
            'estimate_name' => 'estimate_management.create_new_estimate_form.estimate_name_field.label',
            'placeholder_estimate_name' => 'estimate_management.create_new_estimate_form.estimate_name_field.placeholder',
            
            // Estimate Selection - Estimate Choice Field
            'choose_estimate' => 'estimate_management.estimate_selection.estimate_choice_field.label',
            'select_estimate_option' => 'estimate_management.estimate_selection.estimate_choice_field.options',
            
            // === ROOM MANAGEMENT - FIELD GROUPED ===
            // Add New Room Form - Room Name Field
            'room_name' => 'room_management.add_new_room_form.room_name_field.label',
            'placeholder_room_name' => 'room_management.add_new_room_form.room_name_field.placeholder',
            
            // Add New Room Form - Room Width Field
            'room_width' => 'room_management.add_new_room_form.room_width_field.label',
            'placeholder_width' => 'room_management.add_new_room_form.room_width_field.placeholder',
            
            // Add New Room Form - Room Length Field
            'room_length' => 'room_management.add_new_room_form.room_length_field.label',
            'placeholder_length' => 'room_management.add_new_room_form.room_length_field.placeholder',
            
            // Add New Room Form - Room Dimensions Field
            'room_dimensions' => 'room_management.add_new_room_form.room_dimensions_field.label',
            
            // Room Selection Form - Room Choice Field
            'choose_room' => 'room_management.room_selection_form.room_choice_field.label',
            'select_room_option' => 'room_management.room_selection_form.room_choice_field.options',
            
            // === CUSTOMER DETAILS - FIELD GROUPED ===
            // Customer Details Form - Customer Name Field
            'customer_name' => 'customer_details.customer_details_form.customer_name_field.label',
            'full_name' => 'customer_details.customer_details_form.customer_name_field.label',
            'placeholder_name' => 'customer_details.customer_details_form.customer_name_field.placeholder',
            
            // Customer Details Form - Customer Email Field
            'customer_email' => 'customer_details.customer_details_form.customer_email_field.label',
            'email_address' => 'customer_details.customer_details_form.customer_email_field.label',
            'placeholder_email' => 'customer_details.customer_details_form.customer_email_field.placeholder',
            
            // Customer Details Form - Customer Phone Field
            'customer_phone' => 'customer_details.customer_details_form.customer_phone_field.label',
            'phone_number' => 'customer_details.customer_details_form.customer_phone_field.label',
            'placeholder_phone' => 'customer_details.customer_details_form.customer_phone_field.placeholder',
            
            // Customer Details Form - Customer Postcode Field
            'customer_postcode' => 'customer_details.customer_details_form.customer_postcode_field.label',
            'placeholder_postcode' => 'customer_details.customer_details_form.customer_postcode_field.placeholder',
            
            // === PRODUCTS (Phase 2 - Placeholder) ===
            'product_quantity' => 'product.forms.quantity',
            'notes' => 'product.forms.notes',
            'quantity' => 'product.forms.quantity',
            
            // === PRICING (Phase 2 - Placeholder) ===
            'price' => 'product.pricing.price',
            'total' => 'product.pricing.total',
        ],
        'messages' => [
            // === ESTIMATE MANAGEMENT MESSAGES ===
            // Estimate Actions
            'estimate_saved' => 'estimate_management.estimate_actions.messages.saved',
            'estimate_deleted' => 'estimate_management.estimate_actions.messages.deleted',
            'estimate_removed' => 'estimate_management.estimate_actions.messages.removed',
            
            // Estimate Selection
            'no_estimates_available' => 'estimate_management.estimate_selection.messages.no_estimates_available',
            
            // === ROOM MANAGEMENT MESSAGES ===
            // Add New Room Form
            'room_added' => 'room_management.add_new_room_form.messages.added',
            'room_created' => 'room_management.add_new_room_form.messages.created',
            'room_created_with_product' => 'room_management.add_new_room_form.messages.created_with_product',
            
            // Room Actions
            'room_deleted' => 'room_management.room_actions.messages.deleted',
            'room_load_error' => 'room_management.room_actions.messages.load_error',
            
            // Room Selection
            'no_rooms_available' => 'room_management.room_selection_form.messages.no_rooms_available',
            
            // === CUSTOMER DETAILS MESSAGES ===
            // Customer Email Field Validation
            'invalid_email' => 'customer_details.customer_details_form.customer_email_field.validation.invalid_email',
            'email_required' => 'customer_details.customer_details_form.customer_email_field.validation.email_required',
            
            // Customer Phone Field Validation
            'invalid_phone' => 'customer_details.customer_details_form.customer_phone_field.validation.invalid_phone',
            'phone_required' => 'customer_details.customer_details_form.customer_phone_field.validation.phone_required',
            
            // Customer Name Field Validation
            'name_required' => 'customer_details.customer_details_form.customer_name_field.validation.required',
            
            // Contact Actions
            'email_sent' => 'customer_details.contact_actions.messages.email_sent',
            
            // General Validation
            'additional_information_required' => 'customer_details.general_validation.messages.details_required',
            'email_required_for_copy' => 'customer_details.general_validation.messages.email_required',
            'phone_required_for_sms' => 'customer_details.general_validation.messages.phone_required',
            'contact_email_details_required' => 'customer_details.general_validation.messages.email_details_required',
            'contact_phone_details_required' => 'customer_details.general_validation.messages.phone_details_required',
            'email_required_for_estimate' => 'customer_details.general_validation.messages.email_required_for_estimate',
            'contact_method_estimate_prompt' => 'customer_details.contact_methods.messages.contact_method_estimate',
            'contact_method_prompt' => 'customer_details.contact_methods.messages.contact_method',
            
            // === COMMON UI MESSAGES ===
            'confirm_delete' => 'common_ui.confirmation_dialogs.messages.confirm_delete',
            'confirm_proceed' => 'common_ui.confirmation_dialogs.messages.confirm',
            'settings_saved' => 'common_ui.general_actions.messages.settings_saved',
            'general_error' => 'common_ui.error_handling.messages.error',
            'save_failed' => 'common_ui.error_handling.messages.save_failed',
            'required_field' => 'common_ui.validation.messages.required_field',
            'network_error' => 'common_ui.error_handling.messages.network_error',
            'permission_denied' => 'common_ui.error_handling.messages.permission_denied',
            
            // === PRODUCTS (Phase 2 - Placeholder) ===
            'product_added' => 'product.messages.added',
            'product_added_message' => 'product.messages.added_details',
            'confirm_product_remove' => 'product.messages.confirm_remove',
            'product_load_error' => 'product.messages.load_error',
            'select_options' => 'product.messages.select_options',
            'product_removed' => 'product.messages.removed',
            
            // === SEARCH (Phase 2 - Placeholder) ===
            'showing_results' => 'ui.search.results_count',
        ],
        'ui_elements' => [
            // === ESTIMATE MANAGEMENT UI ===
            // Create New Estimate Form
            'create_new_estimate' => 'estimate_management.create_new_estimate_form.headings.create',
            
            // Estimate Selection
            'select_estimate' => 'estimate_management.estimate_selection.headings.select',
            
            // Estimate Display
            'no_estimates' => 'estimate_management.estimate_display.messages.empty',
            'rooms_heading' => 'estimate_management.estimate_display.headings.rooms',
            'estimate_summary' => 'estimate_management.estimate_display.headings.summary',
            
            // === ROOM MANAGEMENT UI ===
            // Room Selection Form
            'select_room' => 'room_management.room_selection_form.headings.select',
            
            // Room Display
            'no_rooms' => 'room_management.room_display.messages.empty',
            'products_heading' => 'room_management.room_display.headings.products',
            'room_summary' => 'room_management.room_display.headings.summary',
            
            // === CUSTOMER DETAILS UI ===
            // Customer Details Form
            'your_details' => 'customer_details.customer_details_form.headings.details',
            'saved_details' => 'customer_details.customer_details_form.headings.saved_details',
            'edit_your_details' => 'customer_details.customer_details_form.headings.edit_details',
            
            // === MODAL SYSTEM UI ===
            'confirm_title' => 'modal_system.confirmation_dialogs.headings.confirmation',
            'product_added_title' => 'modal_system.product_dialogs.headings.product_added',
            'remove_product_title' => 'modal_system.product_dialogs.headings.remove_product',
            'add_new_room_title' => 'modal_system.room_dialogs.headings.add_room',
            'error_title' => 'modal_system.error_dialogs.headings.error',
            'success_title' => 'modal_system.success_dialogs.headings.success',
            
            // === COMMON UI ===
            'loading' => 'common_ui.loading_states.messages.generic',
            'get_started' => 'common_ui.general_labels.labels.get_started',
            'expand' => 'common_ui.display_controls.buttons.expand',
            'collapse' => 'common_ui.display_controls.buttons.collapse',
            
            // === PRODUCTS (Phase 2 - Placeholder) ===
            'no_products' => 'product.messages.empty',
            'price_notice' => 'product.pricing.notice',
            'select_product_options' => 'product.headings.options',
            'primary_product' => 'product.labels.primary',
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
function migrate_labels_to_hierarchical_admin() {
    $current_labels = get_option('product_estimator_labels', []);
    $hierarchical_labels = convert_to_hierarchical_structure_admin($current_labels);
    
    // Update the option with hierarchical structure
    $update_result = update_option('product_estimator_labels', $hierarchical_labels);
    
    if ($update_result) {
        echo "<p style='color: green;'>✅ Successfully migrated labels to hierarchical structure</p>";
    } else {
        echo "<p style='color: orange;'>⚠️ Failed to update labels option. Check database permissions.</p>";
    }
    
    // Update version for cache busting
    update_option('product_estimator_labels_version', time());
    
    // Clear any caches
    delete_transient('pe_frontend_labels_cache');
    
    return $update_result;
}

// Enable hierarchical UI in settings
function enable_hierarchical_ui_admin() {
    // Create a special option to indicate hierarchical UI should be used
    $result = add_option('product_estimator_labels_hierarchical', true);
    
    if (!$result) {
        // Option might already exist, update it instead
        $result = update_option('product_estimator_labels_hierarchical', true);
    }
    
    if ($result) {
        echo "<p style='color: green;'>✅ Successfully enabled hierarchical UI for labels</p>";
    } else {
        echo "<p style='color: orange;'>⚠️ Failed to enable hierarchical UI. Check database permissions.</p>";
    }
    
    return $result;
}