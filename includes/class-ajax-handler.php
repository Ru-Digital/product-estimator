<?php
namespace RuDigital\ProductEstimator\Includes;

use RuDigital\ProductEstimator\Includes\Ajax\AjaxHandlerLoader;

/**
 * AJAX Handlers for Product Estimator
 *
 * This class is a backwards compatibility layer that extends the original AjaxHandler
 * and delegates to the new modular AJAX handlers
 */
class AjaxHandler {
    use \RuDigital\ProductEstimator\Includes\Traits\EstimateDbHandler;

    /**
     * Loader that contains all the handler instances
     *
     * @var AjaxHandlerLoader
     */
    private $loader;

    /**
     * Initialize the class
     */
    public function __construct() {
        $this->loader = new AjaxHandlerLoader();
    }

    /**
     * Get the loader instance
     *
     * @return AjaxHandlerLoader
     */
    public function get_loader() {
        return $this->loader;
    }
}
