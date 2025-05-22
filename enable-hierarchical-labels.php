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

// Hook into the settings modules registration
add_action('product_estimator_register_settings_modules', 'enable_hierarchical_labels_module', 20);

/**
 * Replace the standard labels module with the hierarchical version if enabled
 * 
 * @param SettingsManager $settings_manager The settings manager instance
 */
function enable_hierarchical_labels_module($settings_manager) {
    // Check if hierarchical labels are enabled
    if (get_option('product_estimator_labels_hierarchical', false)) {
        // First, remove the standard labels module if it exists
        $modules = $settings_manager->get_modules();
        if (isset($modules['labels'])) {
            // Can't actually remove it from the manager, but we can register
            // our hierarchical module which will override it
            
            // Make sure the hierarchical module is loaded
            require_once PRODUCT_ESTIMATOR_PLUGIN_DIR . 'includes/admin/settings/class-labels-settings-module-hierarchical.php';
            
            // Create the hierarchical module
            $hierarchical_module = new RuDigital\ProductEstimator\Includes\Admin\Settings\LabelsSettingsModuleHierarchical(
                'product-estimator',
                '2.5.0'
            );
            
            // Register the hierarchical module (this will replace the standard one)
            $settings_manager->register_module($hierarchical_module);
            
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