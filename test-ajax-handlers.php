<?php
/**
 * AJAX Handler Test Script
 * This script tests that all AJAX handlers in the new structure are correctly registered
 * 
 * How to use:
 * 1. Place this in the plugin root directory
 * 2. Visit /wp-content/plugins/product-estimator/test-ajax-handlers.php in your browser
 * 3. Check the output to ensure all handlers are properly registered
 */

// Bootstrap WordPress
// For this specific site structure, we know where wp-load.php should be
$root_dir = dirname(dirname(dirname(dirname(__FILE__))));
require_once($root_dir . '/wp-load.php');

// Make sure only admins can run this
if (!current_user_can('manage_options')) {
    die('You do not have permission to run this script.');
}

// Make sure the plugin is active
if (!class_exists('RuDigital\\ProductEstimator\\Includes\\AjaxHandler')) {
    die('Product Estimator plugin does not appear to be active or properly loaded.');
}

// Define the expected AJAX actions for each handler
$expected_handlers = [
    'estimate' => [
        'get_estimates_list',
        'get_estimates_data',
        'add_new_estimate',
        'remove_estimate',
        'check_estimates_exist',
        'store_single_estimate',
        'check_estimate_stored',
        'get_secure_pdf_url',
        'request_copy_estimate'
    ],
    'room' => [
        'get_rooms_for_estimate',
        'add_new_room',
        'remove_room',
        'add_product_to_room',
        'remove_product_from_room',
        'replace_product_in_room',
    ],
    'product' => [
        'get_variation_estimator',
        'search_category_products',
        'get_category_products',
    ],
    'form' => [
        'get_estimate_selection_form',
        'get_new_estimate_form',
        'get_new_room_form',
        'get_room_selection_form',
    ],
    'customer' => [
        'update_customer_details',
        'delete_customer_details',
        'check_customer_details',
        'request_store_contact',
    ],
    'suggestion' => [
        'fetch_suggestions_for_modified_room',
        'generate_suggestions',
        'get_similar_products',
    ],
    'upgrade' => [
        'get_product_upgrades',
    ],
];

// Initialize AjaxHandler and get the loader
$ajax_handler = new RuDigital\ProductEstimator\Includes\AjaxHandler();
$loader = $ajax_handler->get_loader();
$handlers = $loader->get_handlers();

// Get feature switches status to check which feature-dependent handlers should be active
$features = product_estimator_features();
$feature_dependent_handlers = [
    'suggestion' => $features->suggested_products_enabled ?? false,
    'upgrade' => $features->product_upgrades_enabled ?? false
];

// Filter out expected handlers that are feature-dependent but disabled
$filtered_expected_handlers = array_filter(
    $expected_handlers,
    function($key) use ($feature_dependent_handlers) {
        // If this is not a feature-dependent handler, always expect it
        if (!isset($feature_dependent_handlers[$key])) {
            return true;
        }
        // Otherwise, only expect it if the feature is enabled
        return $feature_dependent_handlers[$key];
    },
    ARRAY_FILTER_USE_KEY
);

// Check for missing or unexpected handlers
$missing_handlers = array_diff(array_keys($filtered_expected_handlers), array_keys($handlers));
$unexpected_handlers = array_diff(array_keys($handlers), array_keys($filtered_expected_handlers));

// Function to check if an AJAX action is registered
function is_ajax_action_registered($action) {
    global $wp_filter;
    $action_hook = 'wp_ajax_' . $action;
    return isset($wp_filter[$action_hook]) && !empty($wp_filter[$action_hook]->callbacks);
}

// Function to check if an AJAX nopriv action is registered
function is_ajax_nopriv_action_registered($action) {
    global $wp_filter;
    $action_hook = 'wp_ajax_nopriv_' . $action;
    return isset($wp_filter[$action_hook]) && !empty($wp_filter[$action_hook]->callbacks);
}

?>

<!DOCTYPE html>
<html>
<head>
    <title>AJAX Handler Test Results</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 20px;
            color: #333;
        }
        h1 {
            color: #0073aa;
            border-bottom: 1px solid #ccc;
            padding-bottom: 10px;
        }
        h2 {
            color: #0073aa;
            margin-top: 30px;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            margin-bottom: 20px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f2f2f2;
        }
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        .success {
            color: green;
        }
        .warning {
            color: orange;
        }
        .error {
            color: red;
        }
        .missing {
            background-color: #ffeded;
        }
        .unexpected {
            background-color: #fff9e6;
        }
        .summary {
            margin: 20px 0;
            padding: 15px;
            background-color: #f5f5f5;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <h1>AJAX Handler Test Results</h1>
    
    <div class="summary">
        <h2>Summary</h2>
        <p>
            <strong>Expected Core Handlers:</strong> <?php echo count(array_filter($expected_handlers, function($key) use ($feature_dependent_handlers) { return !isset($feature_dependent_handlers[$key]); }, ARRAY_FILTER_USE_KEY)); ?><br>
            <strong>Feature-Dependent Handlers:</strong> <?php echo count($feature_dependent_handlers); ?> 
            (<?php 
                $enabled_features = array_filter($feature_dependent_handlers);
                echo count($enabled_features) . ' enabled, ' . (count($feature_dependent_handlers) - count($enabled_features)) . ' disabled'; 
            ?>)<br>
            <strong>Actual Handlers:</strong> <?php echo count($handlers); ?><br>
            <strong>Missing Core Handlers:</strong> <?php echo count($missing_handlers); ?><br>
            <strong>Unexpected Handlers:</strong> <?php echo count($unexpected_handlers); ?>
        </p>
        
        <h3>Feature Status</h3>
        <ul>
            <?php foreach ($feature_dependent_handlers as $handler => $enabled): ?>
                <li>
                    <strong><?php echo ucfirst($handler); ?> Handler:</strong> 
                    <?php if ($enabled): ?>
                        <span class="success">Enabled</span>
                        <?php echo isset($handlers[$handler]) ? ' <span class="success">(Loaded)</span>' : ' <span class="error">(Not Loaded - ERROR)</span>'; ?>
                    <?php else: ?>
                        <span class="warning">Disabled</span>
                        <?php echo !isset($handlers[$handler]) ? ' <span class="success">(Not Loaded - Correct)</span>' : ' <span class="error">(Loaded - ERROR)</span>'; ?>
                    <?php endif; ?>
                </li>
            <?php endforeach; ?>
        </ul>
        
        <?php if (empty($missing_handlers) && empty($unexpected_handlers)): ?>
            <p class="success"><strong>All required handlers are present!</strong></p>
        <?php else: ?>
            <?php if (!empty($missing_handlers)): ?>
                <p class="error"><strong>Missing Core Handlers:</strong> <?php echo implode(', ', $missing_handlers); ?></p>
            <?php endif; ?>
            <?php if (!empty($unexpected_handlers)): ?>
                <p class="warning"><strong>Unexpected Handlers:</strong> <?php echo implode(', ', $unexpected_handlers); ?></p>
            <?php endif; ?>
        <?php endif; ?>
    </div>

    <h2>Handler Test Results</h2>
    
    <?php foreach ($expected_handlers as $handler_name => $expected_actions): ?>
        <h3><?php echo ucfirst($handler_name); ?> Handler</h3>
        
        <?php if (isset($feature_dependent_handlers[$handler_name]) && !$feature_dependent_handlers[$handler_name]): ?>
            <p class="warning">This feature-dependent handler is disabled in Feature Switches.</p>
        <?php elseif (!isset($handlers[$handler_name])): ?>
            <p class="error">Handler not found in the loader!</p>
        <?php else: ?>
            <table>
                <tr>
                    <th>Action</th>
                    <th>Admin Hook</th>
                    <th>Public Hook</th>
                </tr>
                <?php foreach ($expected_actions as $action): ?>
                    <tr>
                        <td><?php echo $action; ?></td>
                        <td>
                            <?php if (is_ajax_action_registered($action)): ?>
                                <span class="success">Registered</span>
                            <?php else: ?>
                                <span class="error">Not Registered</span>
                            <?php endif; ?>
                        </td>
                        <td>
                            <?php if (is_ajax_nopriv_action_registered($action)): ?>
                                <span class="success">Registered</span>
                            <?php else: ?>
                                <span class="warning">Not Registered</span>
                            <?php endif; ?>
                        </td>
                    </tr>
                <?php endforeach; ?>
            </table>
        <?php endif; ?>
    <?php endforeach; ?>

    <h2>Tests to Perform Manually</h2>
    <p>While the hooks are registered, testing their functionality requires user interaction. Here's a checklist of key features to test:</p>
    
    <h3>Estimate Handler</h3>
    <ul>
        <li>Create a new estimate</li>
        <li>Delete an estimate</li>
        <li>View estimate list</li>
        <li>Check if estimates exist</li>
        <li>Store an estimate in the database</li>
        <li>Generate a PDF</li>
        <li>Request a copy of an estimate</li>
    </ul>
    
    <h3>Room Handler</h3>
    <ul>
        <li>Add a new room to an estimate</li>
        <li>Remove a room from an estimate</li>
        <li>Add a product to a room</li>
        <li>Remove a product from a room</li>
        <li>Replace a product in a room</li>
    </ul>
    
    <h3>Product Handler</h3>
    <ul>
        <li>Get product variation data</li>
        <li>Search for products</li>
        <li>Get products from a category</li>
    </ul>
    
    <h3>Form Handler</h3>
    <ul>
        <li>Load estimate selection form</li>
        <li>Load new estimate form</li>
        <li>Load new room form</li>
        <li>Load room selection form</li>
    </ul>
    
    <h3>Customer Handler</h3>
    <ul>
        <li>Update customer details</li>
        <li>Delete customer details</li>
        <li>Check if customer details exist</li>
        <li>Send store contact request</li>
    </ul>
    
    <h3>Suggestion Handler</h3>
    <ul>
        <li>Generate product suggestions</li>
        <li>Get similar products</li>
    </ul>
    
    <h3>Upgrade Handler</h3>
    <ul>
        <li>Get product upgrades</li>
    </ul>
</body>
</html>
<?php
// Log the completion of the test to the error log
error_log('Product Estimator AJAX Handler Test Script executed at ' . date('Y-m-d H:i:s'));
?>