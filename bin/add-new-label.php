#!/usr/bin/env php
<?php
/**
 * CLI tool to add new labels to the system
 *
 * Usage: php bin/add-new-label.php --category=buttons --key=new_button --value="New Button Text" [--description="Description of the label"]
 */

// Bootstrap WordPress
$wp_load_path = dirname(dirname(dirname(dirname(dirname(dirname(__FILE__)))))) . '/wp-load.php';
if (!file_exists($wp_load_path)) {
    die('WordPress not found. This script must be run within WordPress.');
}
require_once $wp_load_path;

// Check for admin privileges
if (!function_exists('current_user_can') || !current_user_can('manage_options')) {
    die('You do not have sufficient permissions to access this page.');
}

// Parse command-line arguments
$options = getopt('', ['category:', 'key:', 'value:', 'description::']);

// Validate required arguments
if (!isset($options['category']) || !isset($options['key']) || !isset($options['value'])) {
    echo "Error: Missing required arguments.\n";
    echo "Usage: php add-new-label.php --category=buttons --key=new_button --value=\"New Button Text\" [--description=\"Description of the label\"]\n";
    exit(1);
}

$category = $options['category'];
$key = $options['key'];
$value = $options['value'];
$description = isset($options['description']) ? $options['description'] : '';

// Get current labels
$labels = get_option('product_estimator_labels', []);

// Validate category
if (!isset($labels[$category]) && $category !== 'new') {
    echo "Error: Category '$category' does not exist. Available categories: " . implode(', ', array_keys(array_filter($labels, 'is_array'))) . "\n";
    echo "Use --category=new to create a new category.\n";
    exit(1);
}

// Handle creating a new category
if ($category === 'new') {
    echo "Creating a new category requires additional information.\n";
    
    // Ask for the actual category name
    echo "Enter the new category name (snake_case): ";
    $new_category = trim(fgets(STDIN));
    
    // Validate category name
    if (empty($new_category) || !preg_match('/^[a-z][a-z0-9_]*$/', $new_category)) {
        echo "Error: Invalid category name. Use snake_case (e.g., new_category).\n";
        exit(1);
    }
    
    // Check if category already exists
    if (isset($labels[$new_category])) {
        echo "Error: Category '$new_category' already exists.\n";
        exit(1);
    }
    
    // Ask for category description
    echo "Enter a description for the '$new_category' category: ";
    $category_description = trim(fgets(STDIN));
    
    // Create the new category
    $labels[$new_category] = [];
    $category = $new_category;
    
    echo "Created new category: $new_category\n";
}

// Check if key already exists
if (isset($labels[$category][$key])) {
    echo "Warning: Key '$key' already exists in category '$category' with value: \"{$labels[$category][$key]}\"\n";
    echo "Do you want to overwrite it? (y/n): ";
    $confirm = strtolower(trim(fgets(STDIN)));
    
    if ($confirm !== 'y' && $confirm !== 'yes') {
        echo "Operation cancelled.\n";
        exit(0);
    }
}

// Add the new label
$labels[$category][$key] = $value;

// Save the updated labels
$result = update_option('product_estimator_labels', $labels);

if ($result) {
    echo "Label added successfully: $category.$key = \"$value\"\n";
    
    // Update version to invalidate cache
    $current_version = get_option('product_estimator_labels_version', '1.0.0');
    $version_parts = explode('.', $current_version);
    $version_parts[2]++; // Increment patch version
    $new_version = implode('.', $version_parts);
    update_option('product_estimator_labels_version', $new_version);
    
    echo "Labels version updated to $new_version\n";
    
    // Output usage examples
    echo "\nUsage examples:\n";
    echo "PHP: \$label = \$labels_frontend->get('$category.$key');\n";
    echo "JavaScript: const label = labelManager.get('$category.$key');\n";
    echo "Template: <span data-label=\"$category.$key\">$value</span>\n";
    
    // Add to code if there's a description
    if (!empty($description)) {
        echo "\nDescription: $description\n";
    }
} else {
    echo "Error: Failed to add label.\n";
    exit(1);
}

// Successfully added the label
exit(0);