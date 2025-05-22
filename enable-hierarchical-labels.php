<?php
/**
 * Enable Hierarchical Labels System
 *
 * This file hooks into the settings manager to replace the standard labels
 * settings module with the hierarchical version when the hierarchical flag is active.
 *
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Enable hierarchical labels by default for unreleased plugin
add_action('init', 'enable_hierarchical_labels_by_default', 1);

/**
 * Enable hierarchical labels by default since this is an unreleased plugin
 */
function enable_hierarchical_labels_by_default() {
    // For unreleased plugin, always enable V3 field-grouped hierarchical labels
    if (get_option('product_estimator_labels_hierarchical', null) === null) {
        update_option('product_estimator_labels_hierarchical', true);
        update_option('product_estimator_labels_version', '3.0.0'); // V3 field-grouped structure
        update_option('product_estimator_labels_structure', 'ui_component');
        
        // Apply the V3 structure immediately
        migrate_to_v3_structure();
    }
}

/**
 * Apply V3 field-grouped structure to existing labels
 */
function migrate_to_v3_structure() {
    $current_labels = get_option('product_estimator_labels', []);
    
    // If no existing labels or already V3 structure, apply default V3 structure
    if (empty($current_labels) || !is_v1_flat_structure($current_labels)) {
        $v3_structure = get_default_v3_structure();
        update_option('product_estimator_labels', $v3_structure);
        return;
    }
    
    // Convert V1 flat structure to V3 field-grouped structure
    require_once __DIR__ . '/activate-hierarchical-labels-admin.php';
    $v3_labels = convert_to_hierarchical_structure_admin($current_labels);
    update_option('product_estimator_labels', $v3_labels);
}

/**
 * Check if labels are in V1 flat structure
 */
function is_v1_flat_structure($labels) {
    return isset($labels['buttons']) || isset($labels['forms']) || isset($labels['messages']);
}

/**
 * Get default V3 field-grouped structure
 */
function get_default_v3_structure() {
    return [
        'estimate_management' => [
            'create_new_estimate_form' => [
                'estimate_name_field' => [
                    'label' => __('Estimate Name', 'product-estimator'),
                    'placeholder' => __('Enter estimate name', 'product-estimator'),
                ],
                'buttons' => [
                    'create' => __('Create Estimate', 'product-estimator'),
                ],
            ],
            'estimate_actions' => [
                'buttons' => [
                    'save' => __('Save Estimate', 'product-estimator'),
                    'print' => __('Print Estimate', 'product-estimator'), 
                    'delete' => __('Delete Estimate', 'product-estimator'),
                ],
            ],
        ],
        'room_management' => [
            'add_new_room_form' => [
                'room_name_field' => [
                    'label' => __('Room Name', 'product-estimator'),
                    'placeholder' => __('Enter room name', 'product-estimator'),
                ],
                'buttons' => [
                    'add' => __('Add Room', 'product-estimator'),
                ],
            ],
        ],
        'customer_details' => [
            'customer_details_form' => [
                'customer_email_field' => [
                    'label' => __('Email Address', 'product-estimator'), 
                    'placeholder' => __('Enter your email', 'product-estimator'),
                    'validation' => [
                        'invalid_email' => __('Please enter a valid email address', 'product-estimator'),
                        'email_required' => __('Email is required', 'product-estimator'),
                    ],
                ],
            ],
        ],
        'common_ui' => [
            'confirmation_dialogs' => [
                'buttons' => [
                    'confirm' => __('Confirm', 'product-estimator'),
                    'cancel' => __('Cancel', 'product-estimator'),
                ],
            ],
        ],
    ];
}

// Hook into the settings modules registration
add_action('product_estimator_register_settings_modules', 'enable_hierarchical_labels_module', 20);

/**
 * Replace the standard labels module with the hierarchical version 
 * 
 * @param SettingsManager $settings_manager The settings manager instance
 */
function enable_hierarchical_labels_module($settings_manager) {
    // Always use hierarchical labels for unreleased plugin
    $hierarchical_enabled = true; // get_option('product_estimator_labels_hierarchical', true);
    
    if ($hierarchical_enabled) {
        // First, remove the standard labels module if it exists
        $modules = $settings_manager->get_modules();
        if (isset($modules['labels'])) {
            // Can't actually remove it from the manager, but we can register
            // our hierarchical module which will override it
            
            // Make sure the labels module is loaded
            require_once PRODUCT_ESTIMATOR_PLUGIN_DIR . 'includes/admin/settings/class-labels-settings-module.php';
            
            // Create the labels module
            $labels_module = new RuDigital\ProductEstimator\Includes\Admin\Settings\LabelsSettingsModule(
                'product-estimator',
                '3.0.0'
            );
            
            // Register the labels module (this will replace the standard one)
            $settings_manager->register_module($labels_module);
            
            // Add JavaScript data flag to indicate hierarchical mode is active
            add_filter('product_estimator_admin_script_data', 'add_hierarchical_labels_flag');
        }
    }
}

/**
 * Add a flag to the JavaScript script data to indicate hierarchical labels are enabled
 * 
 * @param array $data The script data
 * @return array Modified script data
 */
function add_hierarchical_labels_flag($data) {
    if (!isset($data['labelSettings'])) {
        $data['labelSettings'] = [];
    }
    
    $data['labelSettings']['hierarchical'] = true;
    
    return $data;
}

// Add the script data filter to the script handler
add_action('plugins_loaded', 'init_hierarchical_labels_hooks');

/**
 * Initialize hooks for hierarchical labels
 */
function init_hierarchical_labels_hooks() {
    global $product_estimator_script_handler;
    
    if ($product_estimator_script_handler) {
        add_filter('product_estimator_admin_script_data', 'add_hierarchical_labels_flag');
    }
}