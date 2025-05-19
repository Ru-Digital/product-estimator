<?php
/**
 * Test script to check product type detection
 */

// Load WordPress
require_once('product-estimator.php');

// Test product 14994
$product_id = 14994;
echo "=== Testing Product Type Detection ===\n";
echo "Product ID: " . $product_id . "\n\n";

echo "Method 1: Using wc_get_product()\n";
$product = wc_get_product($product_id);
if ($product) {
    echo "  Product Name: " . $product->get_name() . "\n";
    echo "  Product Type: " . $product->get_type() . "\n";
    echo "  Product Class: " . get_class($product) . "\n";
    echo "  Is Variable: " . ($product->is_type('variable') ? 'YES' : 'NO') . "\n";
    echo "  Has Children: " . (method_exists($product, 'get_children') && !empty($product->get_children()) ? 'YES' : 'NO') . "\n";
    
    if (method_exists($product, 'get_children')) {
        $children = $product->get_children();
        echo "  Children Count: " . count($children) . "\n";
        if (!empty($children)) {
            echo "  Children IDs: " . implode(', ', $children) . "\n";
        }
    }
} else {
    echo "  Product not found\n";
}

echo "\nMethod 2: Direct Database Query\n";
global $wpdb;

// Check the wp_posts table
$post = $wpdb->get_row($wpdb->prepare(
    "SELECT * FROM {$wpdb->posts} WHERE ID = %d",
    $product_id
));

if ($post) {
    echo "  Post Type: " . $post->post_type . "\n";
    echo "  Post Status: " . $post->post_status . "\n";
}

// Check for variations
$variations = $wpdb->get_results($wpdb->prepare(
    "SELECT ID, post_title, post_status FROM {$wpdb->posts} WHERE post_parent = %d AND post_type = 'product_variation' ORDER BY ID",
    $product_id
));

echo "  Variation Count: " . count($variations) . "\n";
if ($variations) {
    foreach ($variations as $variation) {
        echo "    Variation ID: " . $variation->ID . " - " . $variation->post_title . " (Status: " . $variation->post_status . ")\n";
    }
}

echo "\nMethod 3: Product Type from Taxonomy\n";
$terms = wp_get_object_terms($product_id, 'product_type');
if ($terms && !is_wp_error($terms)) {
    foreach ($terms as $term) {
        echo "  Product Type Term: " . $term->name . " (slug: " . $term->slug . ")\n";
    }
} else {
    echo "  No product type terms found\n";
}

echo "\nMethod 4: WooCommerce Product Factory\n";
$product_factory = WC()->product_factory;
if (method_exists($product_factory, 'get_product_type')) {
    $type = $product_factory->get_product_type($product_id);
    echo "  Factory Product Type: " . $type . "\n";
}

// Let's also check the wp_term_relationships table directly
echo "\nMethod 5: Direct Term Relationships Query\n";
$term_relationships = $wpdb->get_results($wpdb->prepare(
    "SELECT tr.*, t.name, t.slug FROM {$wpdb->term_relationships} tr 
     JOIN {$wpdb->term_taxonomy} tt ON tr.term_taxonomy_id = tt.term_taxonomy_id 
     JOIN {$wpdb->terms} t ON tt.term_id = t.term_id 
     WHERE tr.object_id = %d AND tt.taxonomy = 'product_type'",
    $product_id
));

if ($term_relationships) {
    foreach ($term_relationships as $rel) {
        echo "  Term: " . $rel->name . " (slug: " . $rel->slug . ")\n";
    }
} else {
    echo "  No product_type relationships found\n";
}

// Check if WooCommerce is recognizing this product at all
echo "\nMethod 6: WooCommerce Product Data Store\n";
$data_store = WC_Data_Store::load('product');
if ($data_store) {
    $product_type = $data_store->get_product_type($product_id);
    echo "  Data Store Product Type: " . $product_type . "\n";
}