<?php
/**
 * Test script for variation detection debugging
 */

// Load WordPress
$wp_load = dirname(__FILE__) . '/../../../wp-load.php';
if (file_exists($wp_load)) {
    require_once($wp_load);
} else {
    die('Could not find wp-load.php');
}

// Test product 14994
$product_id = 14994;
echo "Testing variation detection for product ID: " . $product_id . "\n\n";

$product = wc_get_product($product_id);
if (!$product) {
    echo "Product not found!\n";
    exit;
}

echo "Product Name: " . $product->get_name() . "\n";
echo "Product Type: " . $product->get_type() . "\n";
echo "Is Variable: " . ($product->is_type('variable') ? 'YES' : 'NO') . "\n";

// Check for children (variations)
$children = $product->get_children();
echo "Has Children: " . (!empty($children) ? 'YES (' . count($children) . ')' : 'NO') . "\n";

if ($product->is_type('variable')) {
    echo "\nDetected as variable product:\n";
    $variations = $product->get_available_variations();
    echo "Number of variations: " . count($variations) . "\n";
    
    foreach ($variations as $index => $variation) {
        echo "\nVariation " . ($index + 1) . ":\n";
        echo "  ID: " . $variation['variation_id'] . "\n";
        echo "  SKU: " . $variation['sku'] . "\n";
        echo "  Attributes: " . json_encode($variation['attributes']) . "\n";
    }
} else {
    echo "\nNot detected as variable product. Checking manually...\n";
    
    // Manual check 1: Check for children
    if (!empty($children)) {
        echo "Found children IDs: " . implode(', ', $children) . "\n";
        
        foreach ($children as $child_id) {
            $child = wc_get_product($child_id);
            if ($child) {
                echo "\nChild " . $child_id . ":\n";
                echo "  Type: " . $child->get_type() . "\n";
                echo "  Name: " . $child->get_name() . "\n";
                echo "  Parent ID: " . $child->get_parent_id() . "\n";
            }
        }
    }
    
    // Manual check 2: Direct database query
    global $wpdb;
    $variations = $wpdb->get_results($wpdb->prepare(
        "SELECT ID FROM {$wpdb->posts} WHERE post_parent = %d AND post_type = 'product_variation' AND post_status = 'publish'",
        $product_id
    ));
    
    if ($variations) {
        echo "\nFound variations in database:\n";
        foreach ($variations as $variation) {
            echo "  Variation ID: " . $variation->ID . "\n";
            $var_product = wc_get_product($variation->ID);
            if ($var_product) {
                echo "    Type: " . $var_product->get_type() . "\n";
                echo "    Name: " . $var_product->get_name() . "\n";
            }
        }
    }
    
    // Manual check 3: Check post meta
    $product_type = get_post_meta($product_id, '_product_type', true);
    echo "\nProduct type from meta: " . $product_type . "\n";
    
    // Check if it's stored as a term
    $terms = wp_get_object_terms($product_id, 'product_type');
    if ($terms && !is_wp_error($terms)) {
        echo "Product type from taxonomy: ";
        foreach ($terms as $term) {
            echo $term->slug . " ";
        }
        echo "\n";
    }
}

// Check if variations meta is properly set
$variation_enabled = get_post_meta($product_id, '_manage_stock', true);
echo "\nManage stock: " . ($variation_enabled ? $variation_enabled : 'not set') . "\n";

$attributes = get_post_meta($product_id, '_product_attributes', true);
if ($attributes) {
    echo "Product attributes: " . json_encode($attributes) . "\n";
}