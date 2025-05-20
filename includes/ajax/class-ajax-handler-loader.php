<?php
namespace RuDigital\ProductEstimator\Includes\Ajax;

/**
 * AJAX Handler Loader
 *
 * Loads and initializes all AJAX handlers for the plugin
 */
class AjaxHandlerLoader {

    /**
     * Array of handler class instances
     *
     * @var array
     */
    private $handlers = array();

    /**
     * Initialize the class and load handlers
     */
    public function __construct() {
        $this->load_handlers();
    }

    /**
     * Load all AJAX handlers
     *
     * @return void
     */
    private function load_handlers() {
        $features = product_estimator_features();

        // Get plugin name and version from global
        global $product_estimator_plugin_info;
        $plugin_name = isset($product_estimator_plugin_info['name']) ? $product_estimator_plugin_info['name'] : 'product-estimator';
        $version = isset($product_estimator_plugin_info['version']) ? $product_estimator_plugin_info['version'] : '2.0.0';
        
        // Core handlers - always loaded
        $this->handlers['storage'] = new StorageAjaxHandler();
        $this->handlers['validation'] = new ValidationAjaxHandler();
        $this->handlers['product'] = new ProductAjaxHandler($plugin_name, $version);

        // Feature-dependent handlers
        if ($features->suggested_products_enabled) {
            $this->handlers['suggestion'] = new SuggestionAjaxHandler();
        }

        // Allow adding custom handlers via filter
        $this->handlers = apply_filters('product_estimator_ajax_handlers', $this->handlers);
    }

    /**
     * Get all registered handlers
     *
     * @return array Array of handler instances
     */
    public function get_handlers() {
        return $this->handlers;
    }
}
