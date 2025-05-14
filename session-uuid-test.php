<?php
/**
 * Session UUID Test Script
 * 
 * This script tests the UUID-based session handling in the Product Estimator plugin.
 * It verifies that UUIDs are correctly generated and used throughout the system.
 */

// Include WordPress core
require_once dirname(dirname(dirname(dirname(dirname(__FILE__))))) . '/wp-load.php';

// Ensure user is logged in and has admin permissions
if (!current_user_can('manage_options')) {
    wp_die('You do not have sufficient permissions to access this page.');
}

echo "<h1>Product Estimator - UUID Session Test</h1>";

// Get the SessionHandler instance
$session = \RuDigital\ProductEstimator\Includes\SessionHandler::getInstance();

// Test 1: Create an estimate with UUID
echo "<h2>Test 1: Creating a New Estimate with UUID</h2>";

// Generate a test UUID
$test_uuid = 'estimate_' . wp_generate_uuid4();

$estimate_data = [
    'id' => $test_uuid,
    'name' => 'Test Estimate ' . date('Y-m-d H:i:s'),
    'date_created' => date('Y-m-d H:i:s'),
    'customer_details' => [
        'name' => 'Test Customer',
        'email' => 'test@example.com',
        'phone' => '1234567890',
        'postcode' => '1234'
    ],
    'rooms' => []
];

$estimate_id = $session->addEstimate($estimate_data);

if ($estimate_id === $test_uuid) {
    echo "<p style='color:green'>✅ Success: Estimate created with UUID: $estimate_id</p>";
} else {
    echo "<p style='color:red'>❌ Error: Estimate creation failed or UUID mismatch. Got: " . ($estimate_id ?: 'false') . ", Expected: $test_uuid</p>";
}

// Test 2: Add a room with UUID to the estimate
echo "<h2>Test 2: Adding a Room with UUID</h2>";

// Generate a test room UUID
$room_uuid = 'room_' . wp_generate_uuid4();

$room_data = [
    'id' => $room_uuid,
    'name' => 'Test Room',
    'width' => 4.5,
    'length' => 3.2,
    'products' => []
];

$room_id = $session->addRoom($estimate_id, $room_data);

if ($room_id === $room_uuid) {
    echo "<p style='color:green'>✅ Success: Room created with UUID: $room_id</p>";
} else {
    echo "<p style='color:red'>❌ Error: Room creation failed or UUID mismatch. Got: " . ($room_id ?: 'false') . ", Expected: $room_uuid</p>";
}

// Test 3: Add a product to the room with object storage
echo "<h2>Test 3: Adding a Product with Object Storage</h2>";

// Get a test product ID - use the first published WooCommerce product
$test_products = get_posts([
    'post_type' => 'product',
    'post_status' => 'publish',
    'numberposts' => 1
]);

if (empty($test_products)) {
    echo "<p style='color:red'>❌ Error: No published WooCommerce products found for testing</p>";
} else {
    $test_product_id = $test_products[0]->ID;
    
    $product_data = [
        'id' => $test_product_id,
        'name' => get_the_title($test_product_id),
        'min_price' => 100,
        'max_price' => 150,
        'min_price_total' => 450,
        'max_price_total' => 675,
        'pricing_method' => 'sqm',
        'image' => wp_get_attachment_image_url(get_post_thumbnail_id($test_product_id), 'thumbnail')
    ];
    
    $product_added = $session->addProductToRoom($estimate_id, $room_id, $product_data);
    
    if ($product_added) {
        echo "<p style='color:green'>✅ Success: Product ID $test_product_id added to room</p>";
        
        // Verify the product was stored using object storage
        $updated_room = $session->getRoom($estimate_id, $room_id);
        
        if (isset($updated_room['products']) && is_array($updated_room['products'])) {
            // Check if products is an object with product IDs as keys
            if (isset($updated_room['products'][$test_product_id])) {
                echo "<p style='color:green'>✅ Success: Product stored with ID as key in object storage</p>";
                echo "<pre>" . print_r($updated_room['products'], true) . "</pre>";
            } else {
                echo "<p style='color:red'>❌ Error: Product not stored with ID as key. Current structure:</p>";
                echo "<pre>" . print_r($updated_room['products'], true) . "</pre>";
            }
        } else {
            echo "<p style='color:red'>❌ Error: Products array not found in room data</p>";
        }
    } else {
        echo "<p style='color:red'>❌ Error: Failed to add product to room</p>";
    }
}

// Test 4: Remove a product using product ID
echo "<h2>Test 4: Removing a Product Using ID</h2>";

if (!empty($test_products)) {
    $test_product_id = $test_products[0]->ID;
    
    // Try to remove using just the product ID (passing null for index)
    $product_removed = $session->removeProductFromRoom($estimate_id, $room_id, null, $test_product_id);
    
    if ($product_removed) {
        echo "<p style='color:green'>✅ Success: Product removed using its ID without needing an index</p>";
        
        // Verify product was removed
        $updated_room = $session->getRoom($estimate_id, $room_id);
        if (!isset($updated_room['products'][$test_product_id])) {
            echo "<p style='color:green'>✅ Success: Product no longer exists in room</p>";
        } else {
            echo "<p style='color:red'>❌ Error: Product still exists in room after removal</p>";
        }
    } else {
        echo "<p style='color:red'>❌ Error: Failed to remove product using ID</p>";
    }
}

// Test 5: Clean up - remove test data
echo "<h2>Test 5: Cleanup</h2>";

$removed = $session->removeEstimate($estimate_id);
if ($removed) {
    echo "<p style='color:green'>✅ Success: Test estimate removed</p>";
} else {
    echo "<p style='color:red'>❌ Error: Failed to remove test estimate</p>";
}

echo "<h2>Summary</h2>";
echo "<p>The UUID-based ID system and object-based product storage have been implemented and tested.</p>";
echo "<p>This implementation ensures consistent ID handling between JavaScript and PHP, and provides a more efficient storage structure for products.</p>";