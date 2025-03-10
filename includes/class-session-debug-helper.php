<?php

class SessionDebugHelper {
    private static $instance = null;
    private $debug_log = [];
    private $session_start_time;

    private function __construct() {
        $this->session_start_time = time();
    }

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function logSessionState($location = '') {
        $state = [
            'timestamp' => date('Y-m-d H:i:s'),
            'location' => $location,
            'session_id' => session_id(),
            'session_status' => $this->getSessionStatusText(),
            'session_age' => time() - $this->session_start_time,
            'session_data' => $_SESSION ?? 'No session data',
            'request_method' => $_SERVER['REQUEST_METHOD'] ?? 'Unknown',
            'request_uri' => $_SERVER['REQUEST_URI'] ?? 'Unknown',
            'debug_backtrace' => $this->getDebugBacktrace()
        ];

        $this->debug_log[] = $state;

        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log("=== Session Debug ($location) ===");
            error_log(print_r($state, true));
        }

        return $state;
    }

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

    private function getDebugBacktrace() {
        $trace = debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS, 3);
        return array_slice($trace, 1); // Remove the current method from trace
    }

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

        if (!isset($_SESSION['estimates'])) {
            $issues[] = 'estimates array not found in session';
        } elseif (!is_array($_SESSION['estimates'])) {
            $issues[] = 'estimates is not an array';
        }

        return [
            'is_valid' => empty($issues),
            'issues' => $issues
        ];
    }

    public function getDebugLog() {
        return $this->debug_log;
    }

    public function clearDebugLog() {
        $this->debug_log = [];
    }
}
