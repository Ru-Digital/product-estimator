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