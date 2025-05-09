<?php
namespace RuDigital\ProductEstimator\Includes\Frontend;

/**
 * Base Settings Module Class
 *
 * This abstract class provides the foundation for all setting module implementations.
 * Each settings tab should extend this class to maintain consistency.
 *
 * @since      1.1.0
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes/admin/settings
 */
abstract class FrontendBase {

    /**
     * The ID of this plugin.
     *
     * @since    1.1.0
     * @access   protected
     * @var      string    $plugin_name    The ID of this plugin.
     */
    protected $plugin_name;

    /**
     * The version of this plugin.
     *
     * @since    1.1.0
     * @access   protected
     * @var      string    $version    The current version of this plugin.
     */
    protected $version;


    /**
     * Initialize the class and set its properties.
     *
     * @since    1.1.0
     * @param    string    $plugin_name       The name of this plugin.
     * @param    string    $version           The version of this plugin.
     */
    public function __construct($plugin_name, $version) {
        $this->plugin_name = $plugin_name;
        $this->version = $version;
    }
}
