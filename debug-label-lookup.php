<?php
/**
 * Debug label lookup to see exactly what's happening
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

// Test specific keys that are showing up in analytics
$test_keys = [
    'buttons.remove_product',
    'buttons.replace_product',
    'ui_elements.similar_product_image',
    'buttons.add_new_room'
];

echo "<h1>Debug Label Lookup</h1>\n";
echo "<pre>\n";

// Get the labels frontend to test the actual lookup
global $product_estimator;
if (isset($product_estimator) && method_exists($product_estimator, 'get_loader')) {
    $loader = $product_estimator->get_loader();
    $labels_frontend = $loader->get_component('labels_frontend');

    if ($labels_frontend) {
        echo "Testing actual label lookups:\n";
        echo "============================\n";

        foreach ($test_keys as $key) {
            $result = $labels_frontend->get_label($key, '[DEFAULT_TEXT]');
            echo sprintf("Key: %-35s | Result: %s\n", $key, $result);
        }

        echo "\nTesting with fresh labels structure:\n";
        echo "===================================\n";

        // Get fresh labels
        $all_labels = $labels_frontend->get_all_labels_with_cache();

        echo "Top-level keys: " . implode(', ', array_keys($all_labels)) . "\n";
        echo "Has _flat: " . (isset($all_labels['_flat']) ? 'YES' : 'NO') . "\n";

        if (isset($all_labels['_flat'])) {
            echo "First 10 _flat keys: " . implode(', ', array_slice(array_keys($all_labels['_flat']), 0, 10)) . "\n";
        }

        // Test our validation logic
        echo "\nTesting missing label detection:\n";
        echo "==============================\n";

        require_once(__DIR__ . '/includes/class-labels-usage-analytics.php');
        $analytics = new \RuDigital\ProductEstimator\Includes\LabelsUsageAnalytics('product-estimator', '1.0.0');

        foreach ($test_keys as $key) {
            $is_missing = $analytics->is_missing_label($key);
            echo sprintf("Key: %-35s | Missing: %s\n", $key, $is_missing ? 'YES' : 'NO');
        }

    } else {
        echo "Could not get labels frontend\n";
    }
} else {
    echo "Could not access plugin instance\n";
}

echo "</pre>\n";
