<?php
namespace RuDigital\ProductEstimator\Includes\Frontend;

use RuDigital\ProductEstimator\Includes\Admin\Settings\FrontendBase;

/**
 * Frontend-only functionality for product additions
 * This lightweight class provides only what's needed for the frontend
 * without loading admin dependencies
 */
class ProductAdditionsFrontend extends FrontendBase {

    /**
     * Initialize the class and set its properties.
     *
     * @param string $plugin_name The name of this plugin.
     * @param string $version The version of this plugin.
     * @since    1.0.5
     */
    public function __construct($plugin_name, $version) {
        parent::__construct($plugin_name, $version);
    }


    /**
     * Get auto-add products for specific categories
     *
     * @since    1.1.0
     * @access   public
     * @param    int $category_id Category ID
     * @return   array Array of product IDs
     */
    public function get_auto_add_products_for_category($category_id) {
        // Get all relations
        $relations = get_option('product_estimator_product_additions', array());
        $product_ids = array();

        foreach ($relations as $relation) {
            // Skip relations that are not auto_add_by_category
            if (!isset($relation['relation_type']) || $relation['relation_type'] !== 'auto_add_by_category') {
                continue;
            }

            // Skip relations without product_id
            if (!isset($relation['product_id']) || empty($relation['product_id'])) {
                continue;
            }

            // Handle source_category as array
            $source_categories = isset($relation['source_category']) ? (array)$relation['source_category'] : array();

            // If this category is in the source categories, add the product
            if (in_array($category_id, $source_categories)) {
                $product_ids[] = (int)$relation['product_id'];
            }
        }

        return array_unique($product_ids);
    }

    /**
     * Get auto-add notes for specific categories
     *
     * @since    1.1.0
     * @access   public
     * @param    int $category_id Category ID
     * @return   array Array of note texts
     */
    public function get_auto_add_notes_for_category($category_id) {
        // Get all relations
        $relations = get_option('product_estimator_product_additions', array());
        $notes = array();

        foreach ($relations as $relation) {
            // Skip relations that are not auto_add_note_by_category
            if (!isset($relation['relation_type']) || $relation['relation_type'] !== 'auto_add_note_by_category') {
                continue;
            }

            // Skip relations without note_text
            if (!isset($relation['note_text']) || empty($relation['note_text'])) {
                continue;
            }

            // Handle source_category as array
            $source_categories = isset($relation['source_category']) ? (array)$relation['source_category'] : array();

            // If this category is in the source categories, add the note
            if (in_array($category_id, $source_categories)) {
                $notes[] = $relation['note_text'];
            }
        }

        return $notes;
    }


    /**
     * Get suggested products for a specific category
     *
     * @since    1.1.0
     * @access   public
     * @param    int $category_id Category ID
     * @return   array Array of product IDs
     */
    public function get_suggested_products_for_category($category_id) {
        // Get all relations
        $relations = get_option('product_estimator_product_additions', array());
        $suggested_categories = array();

        foreach ($relations as $relation) {
            // Skip relations that are not suggest_products_by_category
            if (!isset($relation['relation_type']) || $relation['relation_type'] !== 'suggest_products_by_category') {
                continue;
            }

            // Skip relations without target_category
            if (!isset($relation['target_category']) || empty($relation['target_category'])) {
                continue;
            }

            // Handle source_category as array
            $source_categories = isset($relation['source_category']) ? (array)$relation['source_category'] : array();

            // If this category is in the source categories, add the target category
            if (in_array($category_id, $source_categories)) {
                $suggested_categories[] = (int)$relation['target_category'];
            }
        }

        if (empty($suggested_categories)) {
            return array();
        }

        // Get products from the suggested categories
        $args = array(
            'post_type' => 'product',
            'posts_per_page' => 6,
            'post_status' => 'publish',
            'fields' => 'ids',
            'tax_query' => array(
                array(
                    'taxonomy' => 'product_cat',
                    'field' => 'term_id',
                    'terms' => $suggested_categories,
                    'operator' => 'IN',
                ),
            ),
        );

        $products = get_posts($args);

        return $products;
    }

    /**
     * Generate product suggestions based on room contents
     *
     * @since    1.1.0
     * @access   public
     * @param    array $room_products Array of products in the room
     * @return   array Array of suggested products
     */
    public function get_suggestions_for_room($room_products) {
        if (empty($room_products) || !is_array($room_products)) {
            return array();
        }

        $product_categories = array();
        $suggested_products = array();

        // Get product categories for all products in the room
        foreach ($room_products as $product) {
            if (isset($product['id']) && $product['id'] > 0) {
                $categories = wp_get_post_terms($product['id'], 'product_cat', array('fields' => 'ids'));
                if (is_array($categories)) {
                    $product_categories = array_merge($product_categories, $categories);
                }
            }
        }

        // Remove duplicates
        $product_categories = array_unique($product_categories);

        // Get suggested products for each category
        foreach ($product_categories as $category_id) {
            $category_suggested_products = $this->get_suggested_products_for_category($category_id);
            if (!empty($category_suggested_products)) {
                $suggested_products = array_merge($suggested_products, $category_suggested_products);
            }
        }

        // Remove duplicates and limit to 6 suggestions
        $suggested_products = array_unique($suggested_products);
        $suggested_products = array_slice($suggested_products, 0, 6);

        // Format the suggested products
        $formatted_suggestions = array();
        foreach ($suggested_products as $product_id) {
            $product = wc_get_product($product_id);
            if ($product) {
                $formatted_suggestions[] = array(
                    'id' => $product_id,
                    'name' => $product->get_name(),
                    'image' => wp_get_attachment_image_url($product->get_image_id(), 'thumbnail'),
                    'price' => $product->get_price(),
                    'formatted_price' => wc_price($product->get_price()),
                    'permalink' => get_permalink($product_id)
                );
            }
        }

        return $formatted_suggestions;
    }
}
