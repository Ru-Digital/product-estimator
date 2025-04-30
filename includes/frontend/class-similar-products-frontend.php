<?php
namespace RuDigital\ProductEstimator\Includes\Frontend;

use RuDigital\ProductEstimator\Includes\Admin\Settings\FrontendBase;

/**
 * Frontend-only functionality for product additions
 * This lightweight class provides only what's needed for the frontend
 * without loading admin dependencies
 */
class SimilarProductsFrontend extends FrontendBase {

    /**
     * Option name for storing similar products settings
     *
     * @since    1.0.5
     * @access   private
     * @var      string $option_name Option name for settings
     */
    private $option_name = 'product_estimator_similar_products';

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
     * Get similar products for display
     *
     * @param int $product_id The source product ID
     * @param int $limit Maximum number of products to return
     * @return array Array of product data for display
     * @since    1.0.5
     */
    public function get_similar_products_for_display($product_id, $limit = 5) {
        // Get similar products based on attributes
        $similar_product_ids = $this->find_similar_products($product_id);

        if (empty($similar_product_ids)) {
            return array();
        }

        $similar_products = array();
        $count = 0;

        foreach ($similar_product_ids as $similar_id) {
            // Skip the original product
            if ($similar_id == $product_id) {
                continue;
            }

            $product = wc_get_product($similar_id);
            if (!$product) {
                continue;
            }

            $similar_products[] = array(
                'id' => $similar_id,
                'name' => $product->get_name(),
                'price' => $product->get_price(),
                'image' => wp_get_attachment_image_url($product->get_image_id(), 'thumbnail'),
            );

            $count++;
            if ($count >= $limit) {
                break;
            }
        }

        return $similar_products;
    }

    /**
     * Find similar products based on attributes
     * Updated to support multiple source categories
     *
     * @param int $product_id The source product ID
     * @return array List of similar product IDs
     * @since    1.0.6
     */
    public function find_similar_products($product_id) {
        // Get product
        $product = wc_get_product($product_id);

        if (!$product) {
            return array();
        }

        $is_variation = false;
        $parent_id = null;

        if ( $product instanceof \WC_Product_Variation ) {
            $parent_id = $product->get_parent_id();
            $is_variation = true;
            $product = wc_get_product($product->get_parent_id());


        }

        // Get product categories
        $product_categories = wp_get_post_terms(($is_variation) ? $parent_id : $product_id, 'product_cat', array('fields' => 'ids'));

        if (empty($product_categories)) {
            return array();
        }

        // Get similar products settings
        $settings = get_option($this->option_name, array());

        if (empty($settings)) {
            return array();
        }

        // Find matching rules for this product's categories
        $matching_rules = array();

        foreach ($settings as $rule) {
            // Skip if no source categories
            if (empty($rule['source_categories'])) {
                // Legacy support for old format
                if (isset($rule['source_category']) && in_array($rule['source_category'], $product_categories)) {
                    $matching_rules[] = $rule;
                }
                continue;
            }

            // Check if any of the product's categories match any of the rule's source categories
            $intersect = array_intersect($product_categories, $rule['source_categories']);


            if (!empty($intersect)) {
                $matching_rules[] = $rule;
            }
        }

        if (empty($matching_rules)) {
            return array();
        }

        // Get products in same categories (from all matching rules)
        $all_rule_categories = array();
        foreach ($matching_rules as $rule) {
            if (isset($rule['source_categories'])) {
                $all_rule_categories = array_merge($all_rule_categories, $rule['source_categories']);
            } elseif (isset($rule['source_category'])) {
                // Legacy support
                $all_rule_categories[] = $rule['source_category'];
            }
        }
        $all_rule_categories = array_unique($all_rule_categories);

        $category_products = $this->get_products_in_categories($all_rule_categories);

        // Remove the source product
        if (isset($category_products[$product_id])) {
            unset($category_products[$product_id]);
        }

        // Remove the source product parent
        if ($parent_id && isset($category_products[$parent_id])) {
            unset($category_products[$parent_id]);
        }


        if (empty($category_products)) {
            return array();
        }

        // Calculate similarity scores
        $similarity_scores = array();

        foreach ($category_products as $candidate_id => $candidate_product) {
            $max_score = 0;

            foreach ($matching_rules as $rule) {
                $score = $this->calculate_product_similarity(
                    $product,
                    $candidate_product,
                    $rule['attributes']
                );

                // Keep the highest score from any matching rule
                $max_score = max($max_score, $score);

                // If we've reached maximum similarity, no need to check other rules
                if ($max_score >= 1) {
                    break;
                }
            }

            $similarity_scores[$candidate_id] = $max_score;
        }


        // Filter products based on highest similarity threshold from matching rules
        $max_threshold = 0;
        foreach ($matching_rules as $rule) {
            $max_threshold = max($max_threshold, $rule['similarity_threshold']);
        }

        $similar_products = array();

        foreach ($similarity_scores as $id => $score) {
            if ($score >= $max_threshold) {
                $similar_products[$id] = $score;
            }
        }

        // Sort by similarity score (descending)
        arsort($similar_products);

        // Limit to top 10 results
        $return = array_slice(array_keys($similar_products), 0, 10);
        return $return;
    }


    /**
     * Get products in specified categories
     *
     * @param array $category_ids The category IDs
     * @return array List of products indexed by ID
     * @since    1.0.5
     */
    private function get_products_in_categories($category_ids) {
        // Query products in the categories
        $args = array(
            'post_type' => 'product',
            'posts_per_page' => 100, // Reasonable limit
            'tax_query' => array(
                array(
                    'taxonomy' => 'product_cat',
                    'field' => 'term_id',
                    'terms' => $category_ids,
                    'operator' => 'IN'
                )
            )
        );

        $products = get_posts($args);
        $product_objects = array();

        foreach ($products as $product) {
            $product_obj = wc_get_product($product->ID);

            if ($product_obj) {
                $product_objects[$product->ID] = $product_obj;
            }
        }

        return $product_objects;
    }

    /**
     * Calculate similarity between two products based on attributes
     *
     * @param \WC_Product $product1 First product
     * @param \WC_Product $product2 Second product
     * @param array $attributes Attributes to compare
     * @return float Similarity score (0-1)
     * @since    1.0.5
     */
    private function calculate_product_similarity($product1, $product2, $attributes) {
        if (empty($attributes)) {
            return 0;
        }

        $matches = 0;
        $total_attributes = count($attributes);

        foreach ($attributes as $attribute) {
            $attribute_name = 'pa_' . $attribute; // Add pa_ prefix

            $values1 = $this->get_product_attribute_values($product1, $attribute_name);
            $values2 = $this->get_product_attribute_values($product2, $attribute_name);

            // If both products have the attribute and share at least one value
            if (!empty($values1) && !empty($values2) && !empty(array_intersect($values1, $values2))) {
                $matches++;
            }
        }

        // Calculate similarity as percentage of matching attributes
        return $matches / $total_attributes;
    }

    /**
     * Get attribute values for a product
     *
     * @param \WC_Product $product The product
     * @param string $attribute_name The attribute name
     * @return array Array of attribute values
     * @since    1.0.5
     */
    private function get_product_attribute_values($product, $attribute_name) {
        $values = array();

        // Get the attribute
        $attribute = $product->get_attribute($attribute_name);

        if (empty($attribute)) {
            return $values;
        }

        // Convert string of comma-separated values to array
        $values = array_map('trim', explode(',', $attribute));

        return $values;
    }
}
