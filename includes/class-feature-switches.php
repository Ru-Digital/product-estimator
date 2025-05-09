<?php
namespace RuDigital\ProductEstimator\Includes;

/**
 * Feature Switches Helper Class (Runtime Access)
 *
 * Assumes feature switch key-value pairs are stored directly in the
 * WordPress option named 'product_estimator_feature_switches'.
 */
class FeatureSwitches {

    /**
     * Holds all settings loaded directly from $this->option_name.
     * These are assumed to be exclusively feature switches.
     * @var array
     */
    private $settings = [];

    /**
     * Stores the keys of all loaded feature switches.
     * Dynamically populated from the keys of $this->settings.
     * @var array
     */
    private $feature_switch_keys = []; // Still useful for in_array checks if needed

    /**
     * The single instance of the class.
     * @var FeatureSwitches|null
     */
    private static $instance = null;

    /**
     * The WordPress option name where feature switches (key => value) are directly stored.
     * @var string
     */
    private $option_name = 'product_estimator_feature_switches';
    // Note: The concept of DEFINED_FEATURE_KEYS_OPTION_NAME is no longer needed
    // if this class assumes all keys in $option_name_for_feature_values are valid features.

    /**
     * Constructor. Made private to enforce singleton pattern.
     * Loads feature switches settings directly from its dedicated WordPress option.
     */
    private function __construct() {
        $this->load_settings();

        // No longer need the filter on 'option_product_estimator_feature_switches'
        // if we are reading it directly and it's not a "virtual" option.
        // However, if other code *also* uses get_option('product_estimator_feature_switches')
        // and you want to ensure it gets what this instance has (e.g., after a refresh),
        // you might keep a simplified filter. For now, let's assume direct read is sufficient.
        // If keeping filter: add_filter('option_' . $this->option_name_for_feature_values, array($this, 'get_current_settings_for_filter'), 10, 1);
    }

    /**
     * Loads settings from the WordPress option and populates instance properties.
     */
    private function load_settings() {
        // Read directly from the option that is supposed to contain ONLY feature switches.
        $this->settings = get_option($this->option_name, []);
        if (is_array($this->settings)) {
            $this->feature_switch_keys = array_keys($this->settings);
        } else {
            $this->settings = [];
            $this->feature_switch_keys = [];
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('FeatureSwitches (Runtime) Notice: Option \'' . esc_html($this->option_name) . '\' did not return an array.');
            }
        }
    }

    /**
     * Get the singleton instance of the FeatureSwitches class.
     * @return FeatureSwitches The singleton instance.
     */
    public static function get_instance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    // Optional: If you still want get_option('product_estimator_feature_switches') to be "managed"
    // public function get_current_settings_for_filter($value) {
    //     return $this->settings;
    // }

    /**
     * Magic method to access feature switches as properties.
     */
    public function __get($name) {
        if (isset($this->settings[$name])) { // We only care if the key exists in our loaded settings
            $value = $this->settings[$name];
            if ($value === '1' || $value === 1 || $value === true) {
                return true;
            }
            if ($value === '0' || $value === 0 || $value === false) {
                return false;
            }
            return $value;
        }
        // If key doesn't exist in the dedicated feature switch option, it's considered disabled/off.
        return false; // Default to false for non-existent keys in this model
    }

    /**
     * Public method to get a specific feature switch value with a fallback default.
     */
    public function get_feature($key, $default = false) {
        if (isset($this->settings[$key])) {
            $value = $this->settings[$key];
            if ($value === '1' || $value === 1 || $value === true) {
                return true;
            }
            if ($value === '0' || $value === 0 || $value === false) {
                return false;
            }
            return $value;
        }
        return $default;
    }

    /**
     * Reloads settings from the database.
     */
    public function refresh_settings() {
        $this->load_settings();
    }

    private function __clone() { /* Prevent cloning */ }
    public function __wakeup() { throw new \Exception('Cannot unserialize a singleton.'); }
}
