<?php
namespace RuDigital\ProductEstimator\Includes\Frontend;

use RuDigital\ProductEstimator\Includes\Admin\Settings\FrontendBase;

/**
 * Frontend-only functionality for product upgrades
 * This lightweight class provides only what's needed for the frontend
 * without loading admin dependencies
 */
class ProductUpgradesFrontend extends FrontendBase
{

    /**
     * Option name for storing product upgrades settings
     *
     * @since    1.1.0
     * @access   private
     * @var      string $option_name Option name for settings
     */
    private $option_name = 'product_estimator_product_upgrades';

    /**
     * Initialize the class and set its properties.
     *
     * @param string $plugin_name The name of this plugin.
     * @param string $version The version of this plugin.
     * @since    1.0.5
     */
    public function __construct($plugin_name, $version)
    {
        parent::__construct($plugin_name, $version);
    }

    /**
     * Get applicable upgrades for a product
     *
     * This method checks if the product belongs to configured base categories
     * and returns applicable upgrade products
     *
     * @param int $product_id The product ID
     * @param string $type The Type
     * @param int $estimate_id The Estimate ID
     * @param int $room_id The Room ID
     * @param int $room_area room area
     * @return array Array of upgrade configurations and applicable categories
     */
    public function get_upgrades_for_product($product_id, $type, $estimate_id, $room_id, $room_area = null) {
        // Get product object
        $product = wc_get_product($product_id);

        if (!$product) {
            return array();
        }

        // Get the product categories
        $product_categories = wc_get_product_term_ids($product_id, 'product_cat');

        if (empty($product_categories)) {
            return array();
        }

        // Get all upgrade configurations
        $upgrade_configs = get_option($this->option_name, array());


        if (empty($upgrade_configs)) {
            return array();
        }

        $applicable_upgrade_cats = array();
        $config_settings = array();
        // Find which upgrade configurations apply to this product


        foreach ($upgrade_configs as $config) {
            $config_settings['upgrade_for_product_id'] = $product_id;
            $config_settings['estimate_id'] = $estimate_id;
            $config_settings['room_id'] = $room_id;
            $config_settings['display_mode'] = $config['display_mode'];
            $config_settings['type'] = $type;
            $config_settings['title'] = $config['title'];
            $config_settings['description'] = $config['description'];

            // Check if this product belongs to any of the base categories
            $matching_cats = array_intersect($product_categories, $config['base_categories']);

            if (!empty($matching_cats)) {
                // This product is in at least one base category, so add all upgrade categories
                $applicable_upgrade_cats = array_merge($applicable_upgrade_cats, $config['upgrade_categories']);
            }
        }

        // If no applicable upgrade categories found, return empty
        if (empty($applicable_upgrade_cats)) {
            return array();
        }

        // Get upsell IDs directly from the product
        $upsell_ids = $product->get_upsell_ids();

        if (empty($upsell_ids)) {
            return array();
        }

        $upsells = $config_settings;

        // Get the actual upsell products that belong to applicable upgrade categories
        foreach ($upsell_ids as $upsell_id) {
            $upsell_product = wc_get_product($upsell_id);

            if (!$upsell_product) {
                continue;
            }

            $pricing_data = product_estimator_get_product_price($upsell_id, $room_area, false);

            if (!empty($upsell_product)) {
                $min_total = $pricing_data['min_price'];
                $max_total = $pricing_data['max_price'];

                if ($pricing_data['pricing_method'] === 'sqm' && $room_area > 0) {
                    $min_total = $pricing_data['min_price'] * $room_area;
                    $max_total = $pricing_data['max_price'] * $room_area;
                }

                $upsells['products'][] = array(
                    'id' => $upsell_id,
                    'name' => $upsell_product->get_name(),
                    'image' => wp_get_attachment_image_url($upsell_product->get_image_id(), 'thumbnail'),
                    'url' => get_permalink($upsell_id),
                    'min_price' => $pricing_data['min_price'],
                    'max_price' => $pricing_data['max_price'],
                    'min_total' => $min_total,
                    'max_total' => $max_total,
                    'pricing_method' => $pricing_data['pricing_method'],
                    'pricing_source' => $pricing_data['pricing_source'],
                    'room_area' => $room_area,
                );
            }
        }

        return $upsells;
    }
}
