<?php
// Test file to verify product upgrades rendering

// Load WordPress
require_once($_SERVER['DOCUMENT_ROOT'] . '/wp-load.php');

// Output JSON header
header('Content-Type: application/json');

// Create test data with product upgrades
$testData = [
    'estimates' => [
        'estimate_test123' => [
            'id' => 'estimate_test123',
            'name' => 'Test Estimate with Upgrades',
            'rooms' => [
                'room_test456' => [
                    'id' => 'room_test456',
                    'name' => 'Living Room',
                    'width' => 4,
                    'length' => 5,
                    'total' => 799.00,
                    'products' => [
                        '6147' => [
                            'id' => '6147',
                            'name' => 'Basic Carpet',
                            'price' => 599.00,
                            'image' => 'https://example.com/basic-carpet.jpg',
                            'sku' => 'BC-001',
                            'additional_products' => [
                                [
                                    'id' => '6148',
                                    'product_id' => '6148',
                                    'name' => 'Premium Carpet Upgrade',
                                    'price' => 799.00,
                                    'image' => 'https://example.com/premium-carpet.jpg',
                                    'sku' => 'PC-002',
                                    'type' => 'upgrade',
                                    'pricing_method' => 'fixed'
                                ],
                                [
                                    'id' => '6149',
                                    'product_id' => '6149',
                                    'name' => 'Luxury Carpet Upgrade',
                                    'price' => 999.00,
                                    'image' => 'https://example.com/luxury-carpet.jpg',
                                    'sku' => 'LC-003',
                                    'type' => 'upgrade',
                                    'pricing_method' => 'fixed'
                                ]
                            ]
                        ]
                    ]
                ]
            ]
        ]
    ]
];

echo json_encode([
    'success' => true,
    'message' => 'Test data for product upgrades',
    'data' => $testData,
    'instructions' => [
        'Open browser console',
        'Run: localStorage.setItem("productEstimatorData", JSON.stringify(' . json_encode($testData) . '))',
        'Refresh the product estimator page',
        'Open the estimate and room to see the product upgrades'
    ]
], JSON_PRETTY_PRINT);