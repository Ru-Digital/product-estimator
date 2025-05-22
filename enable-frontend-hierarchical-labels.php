<?php
/**
 * Enable Hierarchical Labels Frontend
 *
 * This file hooks into the plugin initialization to replace the standard
 * LabelsFrontend with the enhanced hierarchical version when enabled.
 *
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Hook into the plugin initialization
add_filter('product_estimator_labels_frontend_class', 'use_hierarchical_labels_frontend', 10, 1);

/**
 * Replace the standard LabelsFrontend with LabelsFrontendEnhanced if enabled
 * 
 * @param string $class_name The current frontend class name
 * @return string The class name to use
 */
function use_hierarchical_labels_frontend($class_name) {
    // Check if hierarchical labels are enabled
    if (get_option('product_estimator_labels_hierarchical', false)) {
        // Make sure the enhanced frontend class is loaded
        require_once PRODUCT_ESTIMATOR_PLUGIN_DIR . 'includes/frontend/class-labels-frontend-enhanced.php';
        
        // Return the enhanced class name
        return 'RuDigital\\ProductEstimator\\Includes\\Frontend\\LabelsFrontendEnhanced';
    }
    
    // Return the original class name
    return $class_name;
}

// Update the main plugin file to load this filter
add_action('plugins_loaded', 'init_hierarchical_labels_frontend_hooks', 5); // Priority 5 to run before plugin initialization

/**
 * Initialize hooks for hierarchical labels frontend
 */
function init_hierarchical_labels_frontend_hooks() {
    // Add a hook to modify the labels frontend class
    add_filter('product_estimator_labels_frontend_class', 'use_hierarchical_labels_frontend', 10, 1);
}