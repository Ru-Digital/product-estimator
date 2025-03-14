<?php
// File: session-test.php
// Place this file in your plugin's root directory and access it directly for testing

// First, set up the WordPress environment
define('WP_USE_THEMES', false);
$wp_load_path = dirname(dirname(dirname(__DIR__))) . '/wp-load.php';
require_once($wp_load_path);

// Set debug mode
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Create a simple HTML page structure
?>
    <!DOCTYPE html>
    <html>
    <head>
        <title>Session and AJAX Testing</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
            .test-panel { margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 4px; }
            .test-result { background: #f5f5f5; padding: 10px; border-radius: 4px; white-space: pre-wrap; overflow: auto; }
            .success { color: green; }
            .failure { color: red; }
            button { padding: 8px 12px; background: #0073aa; color: white; border: none; border-radius: 4px; cursor: pointer; }
            button:hover { background: #005177; }
        </style>
    </head>
    <body>
    <h1>Product Estimator Session and AJAX Testing</h1>

    <div class="test-panel">
        <h2>1. Session Status</h2>
        <div class="test-result">
            <?php
            // Start the session if not already started
            if (session_status() !== PHP_SESSION_ACTIVE) {
                session_start();
            }

            echo "Session ID: " . session_id() . "\n";
            echo "Session Status: " . (session_status() === PHP_SESSION_ACTIVE ? "Active" : "Not Active") . "\n";
            echo "Session Cookie: " . (isset($_COOKIE[session_name()]) ? "Set" : "Not Set") . "\n";
            ?>
        </div>
    </div>

    <div class="test-panel">
        <h2>2. Current Session Data</h2>
        <div class="test-result">
            <?php
            // Display current session data
            if (isset($_SESSION) && !empty($_SESSION)) {
                echo json_encode($_SESSION, JSON_PRETTY_PRINT);
            } else {
                echo "Session is empty.";
            }
            ?>
        </div>
    </div>

    <div class="test-panel">
        <h2>3. Reset Test Data</h2>
        <button id="reset-test-data">Reset Test Data</button>
        <div id="reset-result" class="test-result"></div>
    </div>

    <div class="test-panel">
        <h2>4. Test Get Rooms AJAX Call</h2>
        <select id="test-estimate-dropdown">
            <option value="">-- Select an Estimate --</option>
            <?php
            if (isset($_SESSION['estimates'])) {
                foreach ($_SESSION['estimates'] as $key => $estimate) {
                    echo '<option value="' . esc_attr($key) . '">' .
                        esc_html($estimate['name']) . ' (ID: ' . esc_html($key) . ')</option>';
                }
            }
            ?>
        </select>
        <button id="test-get-rooms">Test Get Rooms</button>
        <div id="ajax-result" class="test-result"></div>
    </div>

    <div class="test-panel">
        <h2>5. Direct Function Test</h2>
        <button id="direct-function-test">Run Function Test</button>
        <div id="function-result" class="test-result"></div>
    </div>

    <?php wp_footer(); // Include WordPress footer ?>

    <script>
        // jQuery code for our test buttons
        jQuery(document).ready(function($) {
            // Reset test data
            $('#reset-test-data').on('click', function() {
                $.ajax({
                    url: window.location.href,
                    type: 'POST',
                    data: { action: 'reset_test_data' },
                    success: function(response) {
                        $('#reset-result').html(response);
                        // Reload the page to see updated session data
                        window.location.reload();
                    }
                });
            });

            // Test AJAX get_rooms_for_estimate
            $('#test-get-rooms').on('click', function() {
                var estimateId = $('#test-estimate-dropdown').val();
                if (!estimateId) {
                    $('#ajax-result').html('Please select an estimate first.');
                    return;
                }

                $('#ajax-result').html('Sending request...');

                $.ajax({
                    url: '<?php echo admin_url('admin-ajax.php'); ?>',
                    type: 'POST',
                    data: {
                        action: 'get_rooms_for_estimate',
                        nonce: '<?php echo wp_create_nonce('product_estimator_nonce'); ?>',
                        estimate_id: estimateId
                    },
                    success: function(response) {
                        $('#ajax-result').html(JSON.stringify(response, null, 2));
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        $('#ajax-result').html('Error: ' + textStatus + '\n' + errorThrown + '\n\nResponse: ' + jqXHR.responseText);
                    }
                });
            });

            // Direct function test
            $('#direct-function-test').on('click', function() {
                $.ajax({
                    url: window.location.href,
                    type: 'POST',
                    data: { action: 'direct_function_test' },
                    success: function(response) {
                        $('#function-result').html(response);
                    }
                });
            });
        });
    </script>
    </body>
    </html>

<?php
// Handle AJAX actions in this file
if (isset($_POST['action'])) {
    switch ($_POST['action']) {
        case 'reset_test_data':
            // Clear current session
            $_SESSION = array();

            // Add test data to session
            $_SESSION['estimates'] = [
                '0' => [
                    "name" => "Estimate 1",
                    "rooms" => [
                        '0' => [
                            "name" => "Test Bedroom",
                            "width" => 3,
                            "length" => 4,
                            "products" => []
                        ],
                        '1' => [
                            "name" => "Test Living Room",
                            "width" => 5,
                            "length" => 4,
                            "products" => []
                        ]
                    ]
                ]
            ];

            echo "<span class='success'>Test data has been reset. Session now contains:</span>\n";
            echo json_encode($_SESSION, JSON_PRETTY_PRINT);
            exit;

        case 'direct_function_test':
            // Direct test of the function logic
            $result = "<h3>Testing estimate lookup with different ID formats</h3>\n";

            // Create test session data
            $test_data = [
                '0' => ['name' => 'Test Estimate']
            ];

            // Test different ID formats
            $test_ids = [0, '0', 0.0, "0.0", null, false, true, "", []];

            foreach ($test_ids as $id) {
                $type = gettype($id);
                $string_val = var_export($id, true);

                // Test exact match (===)
                $exact_match = isset($test_data[$id]) ? "Yes" : "No";

                // Test loose match (==)
                $loose_match = "No";
                foreach (array_keys($test_data) as $key) {
                    if ($key == $id) {
                        $loose_match = "Yes (matches with key '$key')";
                        break;
                    }
                }

                // Test string comparison
                $string_match = "No";
                foreach (array_keys($test_data) as $key) {
                    if ((string)$key === (string)$id) {
                        $string_match = "Yes (matches with key '$key')";
                        break;
                    }
                }

                $result .= "Testing ID: $string_val (type: $type)\n";
                $result .= "- Exact match (===): $exact_match\n";
                $result .= "- Loose match (==): $loose_match\n";
                $result .= "- String match: $string_match\n\n";
            }

            // Test actual session data
            $result .= "<h3>Testing with actual session data</h3>\n";

            if (isset($_SESSION['estimates']) && !empty($_SESSION['estimates'])) {
                $estimate_id = array_key_first($_SESSION['estimates']);
                $result .= "First estimate ID in session: '$estimate_id' (type: " . gettype($estimate_id) . ")\n\n";

                // Try different ways to access it
                $test_values = [0, '0', "$estimate_id"];

                foreach ($test_values as $val) {
                    $result .= "Testing access with: " . var_export($val, true) . " (type: " . gettype($val) . ")\n";
                    $result .= "Direct access [\$val]: " . (isset($_SESSION['estimates'][$val]) ? "Found" : "Not found") . "\n";

                    // Loop-based access with ==
                    $found_loose = false;
                    foreach (array_keys($_SESSION['estimates']) as $key) {
                        if ($key == $val) {
                            $found_loose = true;
                            break;
                        }
                    }
                    $result .= "Loop with == comparison: " . ($found_loose ? "Found" : "Not found") . "\n";

                    // Loop-based access with string conversion
                    $found_string = false;
                    foreach (array_keys($_SESSION['estimates']) as $key) {
                        if ((string)$key === (string)$val) {
                            $found_string = true;
                            break;
                        }
                    }
                    $result .= "Loop with string conversion: " . ($found_string ? "Found" : "Not found") . "\n\n";
                }
            } else {
                $result .= "No estimates found in session.";
            }

            echo $result;
            exit;
    }
}
?>
