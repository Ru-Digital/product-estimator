#!/usr/bin/env php
<?php
/**
 * CLI tool to generate labels documentation
 *
 * Usage: php bin/generate-labels-docs.php [--format=html|md] [--output=path/to/file] [--no-analytics]
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
$options = getopt('', ['format::', 'output::', 'no-analytics']);
$format = isset($options['format']) ? $options['format'] : 'html';
$output_path = isset($options['output']) ? $options['output'] : null;
$include_analytics = !isset($options['no-analytics']);

// Get necessary components
global $product_estimator;
if (!isset($product_estimator) || !method_exists($product_estimator, 'get_component')) {
    die('Product Estimator plugin not initialized properly.');
}

$labels_frontend = $product_estimator->get_component('labels_frontend');
if (!$labels_frontend) {
    die('Labels Frontend component not found.');
}

$analytics = $include_analytics ? $product_estimator->get_component('labels_analytics') : null;

// Load documentation generator
require_once dirname(__FILE__) . '/../includes/class-labels-documentation-generator.php';
$generator = new \RuDigital\ProductEstimator\Includes\LabelsDocumentationGenerator(
    'product-estimator',
    $product_estimator->version,
    $labels_frontend,
    $analytics
);

// Generate documentation
$result = $generator->generate_and_save($format, $output_path, $include_analytics);

if ($result) {
    $extension = ($format === 'markdown' || $format === 'md') ? '.md' : '.html';
    $path = $output_path ?: wp_upload_dir()['basedir'] . '/product-estimator-labels-documentation' . $extension;
    echo "Documentation generated successfully at: $path\n";
} else {
    echo "Error: Documentation generation failed.\n";
    exit(1);
}