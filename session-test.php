<?php
// File: session-test.php
// Place this file in your plugin's root directory and access it directly for testing

// First, set up the WordPress environment
define('WP_USE_THEMES', true);
$wp_load_path = dirname(dirname(dirname(__DIR__))) . '/wp-load.php';
require_once($wp_load_path);

// Set debug mode
error_reporting(E_ERROR);
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

            ?>
        </div>
    </div>


    <div class="test-panel">
        <h2>2. Reset Test Data</h2>
        <button id="reset-test-data">Reset Test Data</button>
        <div id="reset-result" class="test-result"></div>
    </div>


    <div class="test-panel">
        <h2>3. Current Session Data</h2>
        <div class="test-result">
            <?php
            // Display current session data
            if (isset($_SESSION) && !empty($_SESSION)) {
                echo "<pre>";
                echo print_r($_SESSION['product_estimator']);
                echo "</pre>";
            } else {
                echo "Session is empty.";
            }
            ?>
        </div>
    </div>


<!--    --><?php //wp_footer(); // Include WordPress footer ?>

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


            // Add test data to session
        unset($_SESSION['product_estimator']);


            echo "<span class='success'>Test data has been reset. Session now contains:</span>\n";
            echo json_encode($_SESSION['product_estimator'], JSON_PRETTY_PRINT);
            exit;

            break;

    }
}
?>
