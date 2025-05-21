<?php
/**
 * Reset Labels Cache
 *
 * This script forcibly resets all label caches and updates the label version number.
 * Run this script directly to ensure all frontend label changes are visible immediately.
 */

// Load WordPress
require_once(__DIR__ . '/../../../../wp-load.php');

// Bail if not an admin
if (!current_user_can('manage_options')) {
    wp_die('You do not have permission to run this script.');
}

// Update the labels version
update_option('product_estimator_labels_version', time() . '.0.0');

// Clear all label-related transients
delete_transient('pe_frontend_labels_cache');
delete_transient('pe_frontend_frequent_labels');

// Also clear any version-specific transients 
global $wpdb;
$wpdb->query("DELETE FROM {$wpdb->options} WHERE option_name LIKE '%pe_frontend_labels_%'");

echo "Labels cache cleared successfully!";
echo "New version: " . get_option('product_estimator_labels_version', 'unknown');