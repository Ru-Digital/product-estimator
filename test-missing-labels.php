<?php
/**
 * Test missing labels detection
 * Run from WordPress admin or via URL: /wp-content/plugins/product-estimator/test-missing-labels.php
 */

// Load WordPress if not already loaded
if (!defined('ABSPATH')) {
    // Try to load WordPress from typical locations
    $wp_load_paths = [
        __DIR__ . '/../../../../wp-load.php',
        __DIR__ . '/../../../wp-load.php',
        __DIR__ . '/../../wp-load.php'
    ];
    
    foreach ($wp_load_paths as $path) {
        if (file_exists($path)) {
            require_once($path);
            break;
        }
    }
    
    if (!defined('ABSPATH')) {
        die('Could not load WordPress');
    }
}

// Check if our analytics class exists
if (!class_exists('Labels_Usage_Analytics')) {
    require_once(__DIR__ . '/includes/class-labels-usage-analytics.php');
}

echo "<h1>Missing Labels Detection Test</h1>\n";
echo "<pre>\n";

// Create analytics instance
$analytics = new Labels_Usage_Analytics();

// Test keys that should be missing (old flat structure)
$test_keys = [
    'ui_elements.loading',
    'buttons.show_similar_products', 
    'buttons.save',
    'buttons.cancel',
    'buttons.add_to_room',
    'forms.room_name',
    'forms.estimate_name',
    'actions.core.cancel',
    'dialogs.titles.confirmation',
    'messages.confirm_proceed'
];

echo "Testing old v1/v2 keys (should be MISSING):\n";
echo "==========================================\n";

foreach ($test_keys as $key) {
    $is_missing = $analytics->is_missing_label($key);
    echo sprintf("Key: %-35s | Missing: %s\n", $key, $is_missing ? 'YES' : 'NO');
}

echo "\n";

// Test keys that should exist (new hierarchical structure)
$new_keys = [
    'common_ui.general_actions.buttons.save_button.label',
    'common_ui.general_actions.buttons.cancel_button.label',
    'room_management.actions.add_room.label'
];

echo "Testing new hierarchical keys (should be FOUND):\n";
echo "==============================================\n";

foreach ($new_keys as $key) {
    $is_missing = $analytics->is_missing_label($key);
    echo sprintf("Key: %-50s | Missing: %s\n", $key, $is_missing ? 'NO' : 'YES');
}

echo "</pre>\n";