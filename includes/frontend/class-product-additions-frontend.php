<?php
namespace RuDigital\ProductEstimator\Includes\Frontend;

/**
 * Frontend-only functionality for product additions
 * This lightweight class provides only what's needed for the frontend
 * without loading admin dependencies
 */
class ProductAdditionsFrontend extends FrontendBase
{

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
     * Get auto-add products for specific categories
     *
     * @param int $category_id Category ID
     * @return   array Array of product IDs
     * @since    1.1.0
     * @access   public
     */
    public function get_auto_add_products_for_category($category_id)
    {
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
     * @param int $category_id Category ID
     * @return   array Array of note texts
     * @since    1.1.0
     * @access   public
     */
    public function get_auto_add_notes_for_category($category_id)
    {
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
     * @param int $category_id Category ID
     * @return   array Array of product IDs
     * @since    1.1.0
     * @access   public
     */
    public function get_suggested_products_for_category($category_id)
    {
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
     * Generate product suggestions based on room contents.
     * This version iterates through products in the room and uses the parent product ID
     * for variations when getting categories for suggestion lookup.
     *
     * @param array $room_products Array of products in the room (passed from frontend)
     * @return   array Array of suggested product IDs (raw IDs before formatting)
     * @since    1.1.0
     * @access   public
     */
    public function get_suggestions_for_room($room_products, $room_area = null)
    {
        if (empty($room_products) || !is_array($room_products)) {
            return array();
        }

        $room_products = array_unique($room_products);



        $raw_suggested_product_ids = array();

        // Iterate through each product in the room
        foreach ($room_products as $product) {
            // Skip notes or products without IDs
            if (isset($product['type']) && $product['type'] === 'note') {
                continue;
            }
            if (!isset($product['id']) || empty($product['id'])) {
                continue;
            }

            // Get the product object to check for variation parent
            $product_obj = wc_get_product($product['id']);
            $product_id_for_categories = $product['id']; // Default to product ID

            $product_id_for_categories  = ($product_obj->get_parent_id()) ? $product_obj->get_parent_id() : $product['id'];

            // Get product categories using the determined product ID (parent or own)
            $categories = wp_get_post_terms($product_id_for_categories, 'product_cat', array('fields' => 'ids'));

            if (!empty($categories) && !is_wp_error($categories)) {
                // Check each category for suggestions
                foreach ($categories as $category_id) {
                    // Get suggested products for this category using the manager's helper method
                    $category_suggestions = $this->get_suggested_products_for_category($category_id);
                    if (!empty($category_suggestions)) {
                        // Add each suggested product ID to the raw list
                        $raw_suggested_product_ids = array_merge($raw_suggested_product_ids, $category_suggestions);
                    }
                }
            }
        }

        $room_products_ids = array_column($room_products, 'id');

        $raw_suggested_product_ids = array_diff($raw_suggested_product_ids, $room_products_ids);
        // Remove duplicates from the raw list of suggested product IDs
        $unique_raw_suggestions = array_unique($raw_suggested_product_ids);

        // If we need to add [MARKUP] do here.
        $markup = null;
        $product_suggestions = [];
        foreach($unique_raw_suggestions as $raw_suggestion_id) {

            $suggested_product = wc_get_product($raw_suggestion_id);
            if($suggested_product) {
                $price_data = product_estimator_calculate_total_price_with_additions($raw_suggestion_id, $room_area, $markup);
                $pricing_method = 'sqm'; // Default method
                $pricing_rules = get_option('product_estimator_pricing_rules', []);
                $product_categories = wp_get_post_terms($raw_suggestion_id, 'product_cat', ['fields' => 'ids']);

                foreach ($pricing_rules as $rule) {
                    if (isset($rule['categories']) && is_array($rule['categories']) && !empty(array_intersect($product_categories, $rule['categories']))) {
                        $pricing_method = isset($rule['pricing_method']) ? $rule['pricing_method'] : 'sqm';
                        break;
                    }
                }

                $price_breakdown = $price_data['breakdown'];
                $has_auto_add = count($price_breakdown) > 1;

                // Add to suggestions array - using product ID as key to avoid duplicates
                $product_suggestions[intval($raw_suggestion_id)] = [
                    'id' => intval($raw_suggestion_id),
                    'name' => $suggested_product->get_name(),
                    'image' => wp_get_attachment_image_url($suggested_product->get_image_id(), [300, 300]) ?: '',
                    'min_price_total' => $price_data['min_total'], // Use total prices here
                    'max_price_total' => $price_data['max_total'], // Use total prices here
                    'pricing_method' => $pricing_method, // Keep pricing method for display logic
                    'has_auto_add' => $has_auto_add // Indicate if it has auto-add products
                ];
            }
        }

        // Return the unique raw suggested product IDs
        return $product_suggestions;
    }
}
