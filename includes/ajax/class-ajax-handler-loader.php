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
        
        // Core handlers - always loaded
        $this->handlers['estimate'] = new EstimateAjaxHandler();
        $this->handlers['room'] = new RoomAjaxHandler();
        $this->handlers['product'] = new ProductAjaxHandler();
        $this->handlers['form'] = new FormAjaxHandler();
        $this->handlers['customer'] = new CustomerAjaxHandler();
        
        // Feature-dependent handlers
        if ($features->suggested_products_enabled) {
            $this->handlers['suggestion'] = new SuggestionAjaxHandler();
        }
        
        if ($features->product_upgrades_enabled) {
            $this->handlers['upgrade'] = new UpgradeAjaxHandler();
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