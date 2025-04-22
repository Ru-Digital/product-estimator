<?php
namespace RuDigital\ProductEstimator\Includes;

/**
 * Session Debug Helper for Product Estimator
 *
 * A utility class to help debug session-related issues.
 *
 * @since      1.0.5
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes
 */
class SessionDebugHelper {
    /**
     * @var SessionDebugHelper|null Singleton instance
     */
    private static $instance = null;

    /**
     * @var array Debug log entries
     */
    private $debug_log = [];

    /**
     * Get singleton instance
     */
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Private constructor for singleton
     */
    private function __construct() {
    }

    /**
     * Log current session state
     *
     * @param string $location Description of where the log is coming from
     * @return array The logged state
     */
    public function logSessionState($location = '') {
        $state = [
            'timestamp' => date('Y-m-d H:i:s'),
            'location' => $location,
            'session_id' => session_id(),
            'session_status' => $this->getSessionStatusText(),
            'session_data' => $_SESSION ?? [],
            'request_uri' => $_SERVER['REQUEST_URI'] ?? 'Unknown',
            'has_estimates' => isset($_SESSION['product_estimator']['estimates']) && !empty($_SESSION['product_estimator']['estimates'])
        ];

        $this->debug_log[] = $state;

        return $state;
    }

    /**
     * Get text representation of session status
     *
     * @return string Session status text
     */
    private function getSessionStatusText() {
        switch (session_status()) {
            case PHP_SESSION_DISABLED:
                return 'PHP_SESSION_DISABLED';
            case PHP_SESSION_NONE:
                return 'PHP_SESSION_NONE';
            case PHP_SESSION_ACTIVE:
                return 'PHP_SESSION_ACTIVE';
            default:
                return 'UNKNOWN';
        }
    }

    /**
     * Check if the session is active and valid
     *
     * @return array Validation results
     */
    public function validateSession() {
        $issues = [];

        if (!session_id()) {
            $issues[] = 'No session ID found';
        }

        if (session_status() !== PHP_SESSION_ACTIVE) {
            $issues[] = 'Session not active';
        }

        if (!isset($_SESSION)) {
            $issues[] = '$_SESSION superglobal not set';
        }

        if (!isset($_SESSION['product_estimator'])) {
            $issues[] = 'product_estimator array not found in session';
        }

        if (!isset($_SESSION['product_estimator']['estimates'])) {
            $issues[] = 'estimates array not found in session';
        } elseif (!is_array($_SESSION['product_estimator']['estimates'])) {
            $issues[] = 'estimates is not an array';
        }

        return [
            'is_valid' => empty($issues),
            'issues' => $issues,
            'has_estimates' => isset($_SESSION['product_estimator']['estimates']) &&
                is_array($_SESSION['product_estimator']['estimates']) &&
                !empty($_SESSION['product_estimator']['estimates'])
        ];
    }

    /**
     * Get the debug log
     *
     * @return array Debug log entries
     */
    public function getDebugLog() {
        return $this->debug_log;
    }

    /**
     * Add a debug endpoint for AJAX calls
     */
    public function registerDebugAjaxEndpoint() {
        add_action('wp_ajax_check_estimator_session', [$this, 'ajaxCheckSession']);
        add_action('wp_ajax_nopriv_check_estimator_session', [$this, 'ajaxCheckSession']);
    }

    /**
     * AJAX handler for session checking
     */
    public function ajaxCheckSession() {
        check_ajax_referer('product_estimator_nonce', 'nonce');

        $this->logSessionState('AJAX Debug Endpoint');

        // Get Session handler state
        $session_handler = SessionHandler::getInstance();
        $handler_debug = $session_handler->debugDump();

        // Validate session
        $validation = $this->validateSession();

        wp_send_json_success([
            'session_status' => $this->getSessionStatusText(),
            'session_id' => session_id(),
            'handler_debug' => $handler_debug,
            'session_validation' => $validation,
            'has_product_estimator' => isset($_SESSION['product_estimator']),
            'has_estimates' => isset($_SESSION['product_estimator']['estimates']) &&
                !empty($_SESSION['product_estimator']['estimates']),
            'estimates_count' => isset($_SESSION['product_estimator']['estimates']) ?
                count($_SESSION['product_estimator']['estimates']) : 0
        ]);
    }
}
