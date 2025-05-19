<?php
namespace RuDigital\ProductEstimator\Includes;

use RuDigital\ProductEstimator\Includes\Models\EstimateModel;
use RuDigital\ProductEstimator\Includes\Traits\EstimateDbHandler;

/**
 * Estimate Handler
 *
 * Handles operations for printing and managing estimates
 * Works with database storage as frontend uses localStorage
 *
 * @since      1.0.0
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes
 */
class EstimateHandler {
    use EstimateDbHandler;

    /**
     * @var EstimateModel Estimate model instance
     */
    private $estimate_model;

    /**
     * Initialize the class
     */
    public function __construct() {
        // Initialize estimate model if the class exists
        if (class_exists('\\RuDigital\\ProductEstimator\\Includes\\Models\\EstimateModel')) {
            $this->estimate_model = new EstimateModel();
        }

        add_action('wp_ajax_request_copy_estimate', array($this, 'request_copy_estimate'));
        add_action('wp_ajax_nopriv_request_copy_estimate', array($this, 'request_copy_estimate'));

    }
















}
