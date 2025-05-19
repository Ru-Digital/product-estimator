<?php
namespace RuDigital\ProductEstimator\Includes\Ajax;

use RuDigital\ProductEstimator\Includes\Traits\EstimateDbHandler;

/**
 * Product-related AJAX handlers
 */
class ProductAjaxHandler extends AjaxHandlerBase {
    use EstimateDbHandler;

    /**
     * Register WordPress hooks for AJAX endpoints
     *
     * @return void
     */
    protected function register_hooks() {
        $this->register_ajax_endpoint('get_variation_estimator', 'getVariationEstimator');
        $this->register_ajax_endpoint('search_category_products', 'ajaxSearchCategoryProducts');
        $this->register_ajax_endpoint('get_category_products', 'get_category_products');
        $this->register_ajax_endpoint('get_product_data_for_storage', 'get_product_data_for_storage');
        $this->register_ajax_endpoint('product_estimator_get_product_variations', 'get_product_variations');
    }

    public function getVariationEstimator() {
        // Verify nonce
        check_ajax_referer('product_estimator_nonce', 'nonce');

        // Get variation ID
        $variation_id = isset($_POST['variation_id']) ? intval($_POST['variation_id']) : 0;

        if (!$variation_id) {
            wp_send_json_error([
                'message' => __('Variation ID is required', 'product-estimator')
            ]);
            return;
        }

        try {
            // Get variation
            $variation = wc_get_product($variation_id);

            if (!$variation || !$variation->is_type('variation')) {
                throw new \Exception(__('Invalid variation', 'product-estimator'));
            }

            // Check if estimator is enabled for this variation
            if (!\RuDigital\ProductEstimator\Includes\Integration\WoocommerceIntegration::isEstimatorEnabled($variation_id)) {
                throw new \Exception(__('Estimator not enabled for this variation', 'product-estimator'));
            }

            // Get parent product ID
            $parent_id = $variation->get_parent_id();

            // Start output buffer to capture estimator HTML
            ob_start();

            // Include the estimator partial with variation context
            $atts = [
                'title' => __('Product Estimate', 'product-estimator'),
                'button_text' => __('Calculate', 'product-estimator'),
                'product_id' => $variation_id,
                'parent_id' => $parent_id,
                'is_variation' => true
            ];
            include_once PRODUCT_ESTIMATOR_PLUGIN_DIR . 'public/partials/product-estimator-display.php';

            // Get HTML
            $html = ob_get_clean();

            wp_send_json_success([
                'html' => $html
            ]);

        } catch (\Exception $e) {
            wp_send_json_error([
                'message' => $e->getMessage()
            ]);
        }
    }

    /**
     * AJAX handler for searching products within a category
     */
    public function ajaxSearchCategoryProducts()
    {
        // Check nonce
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'product_estimator_product_additions_nonce')) {
            wp_send_json_error(array('message' => __('Security check failed.', 'product-estimator')));
            return;
        }

        // Check permissions
        if (!current_user_can('manage_product_terms')) {
            wp_send_json_error(array('message' => __('You do not have permission to perform this action.', 'product-estimator')));
            return;
        }

        // Get search parameters
        $search_term = isset($_POST['search']) ? sanitize_text_field($_POST['search']) : '';
        $category_id = isset($_POST['category']) ? absint($_POST['category']) : 0;

        if (empty($search_term) || empty($category_id)) {
            wp_send_json_error(array('message' => __('Invalid search parameters.', 'product-estimator')));
            return;
        }

        try {
            // Query products
            $args = array(
                'post_type' => 'product',
                'post_status' => 'publish',
                'posts_per_page' => 20,
                's' => $search_term,
                'tax_query' => array(
                    array(
                        'taxonomy' => 'product_cat',
                        'field' => 'term_id',
                        'terms' => $category_id,
                    ),
                ),
            );

            $query = new \WP_Query($args);
            $products = array();

            if ($query->have_posts()) {
                while ($query->have_posts()) {
                    $query->the_post();
                    $product_id = get_the_ID();
                    $product = wc_get_product($product_id);

                    if ($product) {
                        $products[] = array(
                            'id' => $product_id,
                            'name' => $product->get_name(),
                            'price' => $product->get_price(),
                            'formatted_price' => wc_price($product->get_price()),
                        );
                    }
                }
                wp_reset_postdata();
            }

            wp_send_json_success(array(
                'products' => $products,
            ));
        } catch (\Exception $e) {
            wp_send_json_error(array(
                'message' => __('Error searching products:', 'product-estimator') . ' ' . $e->getMessage()
            ));
        }
    }

    /**
     * Get products from specified categories
     */
    public function get_category_products() {
        // Verify nonce
        check_ajax_referer('product_estimator_nonce', 'nonce');

        // Get category IDs
        $category_ids = isset($_POST['categories']) ? sanitize_text_field($_POST['categories']) : '';

        if (empty($category_ids)) {
            wp_send_json_error([
                'message' => __('Category IDs are required', 'product-estimator')
            ]);
            return;
        }

        // Convert comma-separated string to array
        $categories = explode(',', $category_ids);
        $categories = array_map('intval', $categories);

        // Query products in these categories
        $args = [
            'post_type' => 'product',
            'post_status' => 'publish',
            'posts_per_page' => 50, // Limit to 50 products for performance
            'tax_query' => [
                [
                    'taxonomy' => 'product_cat',
                    'field' => 'term_id',
                    'terms' => $categories,
                    'operator' => 'IN'
                ]
            ],
            'fields' => 'ids' // Only get post IDs for efficiency
        ];

        $product_query = new \WP_Query($args);
        $products = [];

        if ($product_query->have_posts()) {
            foreach ($product_query->posts as $product_id) {
                $product = wc_get_product($product_id);

                if ($product) {
                    // Only include products with estimator enabled
                    if (\RuDigital\ProductEstimator\Includes\Integration\WoocommerceIntegration::isEstimatorEnabled($product_id)) {
                        $products[] = [
                            'id' => $product_id,
                            'name' => $product->get_name(),
                            'price' => $product->get_price(),
                            'image' => wp_get_attachment_image_url($product->get_image_id(), 'thumbnail')
                        ];
                    }
                }
            }
        }

        wp_send_json_success([
            'products' => $products
        ]);
    }

    /**
     * AJAX handler to get comprehensive product data for local storage.
     * Ensures room_suggested_products is a numerically indexed array.
     *
     * @since 1.0.0
     */
    public function get_product_data_for_storage()
    {
        // Verify nonce
        check_ajax_referer('product_estimator_nonce', 'nonce');

        $product_id = isset($_POST['product_id']) ? intval($_POST['product_id']) : 0;

        // Ensure 'null' string from JS is converted to actual null for PHP
        $room_width_raw = $_POST['room_width'] ?? null;
        $room_length_raw = $_POST['room_length'] ?? null;

        $room_width = ($room_width_raw === 'null' || $room_width_raw === null) ? null : floatval($room_width_raw);
        $room_length = ($room_length_raw === 'null' || $room_length_raw === null) ? null : floatval($room_length_raw);

        // --- Parsing block for room_products ---
        $room_products_input = $_POST['room_products'] ?? '';
        $room_products_ids_for_suggestions = [];

        if (is_string($room_products_input) && $room_products_input !== '') {
            $ids_from_string = explode(',', $room_products_input);
            $temp_ids = [];
            foreach ($ids_from_string as $id_str) {
                $trimmed_id_str = trim($id_str);
                if (ctype_digit($trimmed_id_str)) {
                    $id_val = intval($trimmed_id_str);
                    if ($id_val > 0) {
                        $temp_ids[] = $id_val;
                    }
                }
            }
            if (!empty($temp_ids)) {
                $room_products_ids_for_suggestions = array_values(array_unique($temp_ids));
            }
        }

        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('AJAX get_product_data_for_storage: Raw room_products_input from POST: \'' . ($_POST['room_products'] ?? 'not set') . '\'');
            error_log('AJAX get_product_data_for_storage: Processed $room_products_ids_for_suggestions (array of IDs): ' . print_r($room_products_ids_for_suggestions, true));
        }
        // --- End of parsing block ---


        if (!$product_id) {
            wp_send_json_error(['message' => __('Product ID is required', 'product-estimator')]);
            return;
        }

        try {
            $product = wc_get_product($product_id);
            if (!$product) {
                wp_send_json_error(['message' => __('Product not found', 'product-estimator')]);
                return;
            }

            $room_area = 0;
            if ($room_width !== null && $room_length !== null && is_numeric($room_width) && is_numeric($room_length)) {
                $room_area = floatval($room_width) * floatval($room_length);
            }

            if (!function_exists('product_estimator_get_product_price')) {
                $helper_path = PRODUCT_ESTIMATOR_PLUGIN_DIR . 'includes/helpers.php';
                if (file_exists($helper_path)) {
                    require_once $helper_path;
                    if (!function_exists('product_estimator_get_product_price')) {
                        wp_send_json_error(['message' => __('Pricing helper function not available after include attempt.', 'product-estimator')]);
                        return;
                    }
                } else {
                    wp_send_json_error(['message' => __('Pricing helper file not found.', 'product-estimator')]);
                    return;
                }
            }
            $pricing_data = product_estimator_get_product_price($product_id, $room_area, false);

            $product_data = [
                'id' => $product_id,
                'name' => $product->get_name(),
                'image' => wp_get_attachment_image_url($product->get_image_id(), 'thumbnail'),
                'min_price' => $pricing_data['min_price'],
                'max_price' => $pricing_data['max_price'],
                'pricing_method' => $pricing_data['pricing_method'],
                'pricing_source' => $pricing_data['pricing_source'],
                'room_area' => $room_area,
                'additional_products' => [],
                'additional_notes' => [],
                'min_price_total' => 0,
                'max_price_total' => 0,
                'similar_products' => [],
                'room_suggested_products' => [], // Initialize as empty array
                'is_primary_category' => false // Default to false
            ];

            if ($pricing_data['pricing_method'] === 'sqm' && $room_area > 0) {
                $product_data['min_price_total'] = $pricing_data['min_price'] * $room_area;
                $product_data['max_price_total'] = $pricing_data['max_price'] * $room_area;
            } else {
                $product_data['min_price_total'] = $pricing_data['min_price'];
                $product_data['max_price_total'] = $pricing_data['max_price'];
            }

            // Check if product is in primary categories
            $product_data['is_primary_category'] = $this->isProductInPrimaryCategories($product_id);

            $product_id_for_categories = $product->is_type('variation') ? $product->get_parent_id() : $product_id;
            $product_categories = wp_get_post_terms($product_id_for_categories, 'product_cat', array('fields' => 'ids'));
            if (is_wp_error($product_categories)) {
                $product_categories = [];
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log('AJAX get_product_data_for_storage: Error fetching product categories: ' . $product_categories->get_error_message());
                }
            }

            $fqcn_pa = '\\RuDigital\\ProductEstimator\\Includes\\Frontend\\ProductAdditionsFrontend';
            $product_additions_frontend_path = PRODUCT_ESTIMATOR_PLUGIN_DIR . 'includes/frontend/class-product-additions-frontend.php';
            $product_additions_manager = null;

            if (!class_exists($fqcn_pa)) {
                if (file_exists($product_additions_frontend_path)) {
                    require_once $product_additions_frontend_path;
                }
            }

            if (class_exists($fqcn_pa)) {
                try {
                    if (!defined('PRODUCT_ESTIMATOR_VERSION')) {
                        if (function_exists('get_plugin_data') && file_exists(PRODUCT_ESTIMATOR_PLUGIN_DIR . 'product-estimator.php')) {
                            $plugin_data = get_plugin_data(PRODUCT_ESTIMATOR_PLUGIN_DIR . 'product-estimator.php');
                            define('PRODUCT_ESTIMATOR_VERSION', $plugin_data['Version'] ?? '1.0.0');
                        } else {
                            define('PRODUCT_ESTIMATOR_VERSION', '1.0.0');
                        }
                    }
                    $product_additions_manager = new $fqcn_pa('product-estimator', PRODUCT_ESTIMATOR_VERSION);
                } catch (\Throwable $e) {
                    if (defined('WP_DEBUG') && WP_DEBUG) {
                        error_log('AJAX Handler FATAL: Failed to instantiate ' . $fqcn_pa . '. Error: ' . $e->getMessage());
                    }
                    $product_additions_manager = null;
                }
            }

            if ($product_additions_manager instanceof $fqcn_pa) {
                // Auto-add products and notes logic...
                $auto_add_products_with_details = [];
                $auto_add_notes_texts = [];
                $section_info = [];

                if (is_array($product_categories)) {
                    foreach ($product_categories as $category_id) {
                        // Use new method to get products with details
                        if (method_exists($product_additions_manager, 'get_auto_add_products_with_details_for_category')) {
                            $cat_auto_add_products_details = $product_additions_manager->get_auto_add_products_with_details_for_category($category_id);
                            if (!empty($cat_auto_add_products_details)) {
                                $auto_add_products_with_details = array_merge($auto_add_products_with_details, $cat_auto_add_products_details);
                            }
                        } else {
                            // Fallback to old method
                            $cat_auto_add_prods = $product_additions_manager->get_auto_add_products_for_category($category_id);
                            if (!empty($cat_auto_add_prods)) {
                                foreach ($cat_auto_add_prods as $prod_id) {
                                    $auto_add_products_with_details[] = array('product_id' => $prod_id, 'section_title' => '', 'section_description' => '');
                                }
                            }
                        }
                        
                        $cat_auto_add_notes = $product_additions_manager->get_auto_add_notes_for_category($category_id);
                        if (!empty($cat_auto_add_notes)) {
                            $auto_add_notes_texts = array_merge($auto_add_notes_texts, $cat_auto_add_notes);
                        }
                    }
                }
                
                // Remove duplicates and process
                $processed_products = [];
                foreach ($auto_add_products_with_details as $product_detail) {
                    $product_key = $product_detail['product_id'];
                    if (!isset($processed_products[$product_key])) {
                        $processed_products[$product_key] = $product_detail;
                        // Store section info for the first product (they should all have the same section)
                        if (empty($section_info) && (!empty($product_detail['section_title']) || !empty($product_detail['section_description']))) {
                            $section_info = [
                                'title' => $product_detail['section_title'],
                                'description' => $product_detail['section_description']
                            ];
                            
                            // Add option colors if available
                            for ($i = 1; $i <= 5; $i++) {
                                $color_key = 'option_colour_' . $i;
                                if (!empty($product_detail[$color_key])) {
                                    $section_info[$color_key] = $product_detail[$color_key];
                                }
                            }
                        }
                    }
                }
                
                $auto_add_notes_texts = array_values(array_unique($auto_add_notes_texts));

                foreach ($processed_products as $product_detail) {
                    $auto_add_product_id = $product_detail['product_id'];
                    if ($auto_add_product_id == $product_id) continue;
                    $auto_add_product_obj = wc_get_product($auto_add_product_id);
                    if ($auto_add_product_obj) {
                        $auto_add_pricing_data = product_estimator_get_product_price($auto_add_product_id, $room_area, false);
                        $additional_product_entry = [
                            'id' => $auto_add_product_id,
                            'name' => $auto_add_product_obj->get_name(),
                            'image' => wp_get_attachment_image_url($auto_add_product_obj->get_image_id(), 'thumbnail'),
                            'min_price' => $auto_add_pricing_data['min_price'],
                            'max_price' => $auto_add_pricing_data['max_price'],
                            'pricing_method' => $auto_add_pricing_data['pricing_method'],
                            'min_price_total' => ($auto_add_pricing_data['pricing_method'] === 'sqm' && $room_area > 0) ? $auto_add_pricing_data['min_price'] * $room_area : $auto_add_pricing_data['min_price'],
                            'max_price_total' => ($auto_add_pricing_data['pricing_method'] === 'sqm' && $room_area > 0) ? $auto_add_pricing_data['max_price'] * $room_area : $auto_add_pricing_data['max_price'],
                            'is_primary_category' => $this->isProductInPrimaryCategories($auto_add_product_id),
                            'selected_option' => null
                        ];

                        // Let's also manually check for variations
                        // Enhanced variation detection with multiple fallbacks
                        $is_variable = false;
                        $variations_found = [];

                        // Method 1: Standard WooCommerce check
                        if ($auto_add_product_obj->is_type('variable')) {
                            $is_variable = true;
                        }
                        // Check if this is a variable product and add variations
                        if ($is_variable) {
                            $variations = [];

                            // Get variations in the order they are sorted in the admin
                            // This ensures variations are displayed in the same order as set in WooCommerce admin
                            $available_variation_ids = $auto_add_product_obj->get_children();
                            
                            // Get the variation objects and their menu_order
                            // The menu_order field determines the sorting position in WooCommerce admin
                            $variations_with_order = [];
                            foreach ($available_variation_ids as $variation_id) {
                                $variation_obj = wc_get_product($variation_id);
                                if ($variation_obj) {
                                    $variations_with_order[] = [
                                        'id' => $variation_id,
                                        'obj' => $variation_obj,
                                        'menu_order' => $variation_obj->get_menu_order()
                                    ];
                                }
                            }
                            
                            // Sort by menu_order to match admin ordering
                            // Lower menu_order values appear first
                            usort($variations_with_order, function($a, $b) {
                                return $a['menu_order'] - $b['menu_order'];
                            });
                            
                            $selected_option = true;
                            $default_option_select = null;
                            
                            // Build variations array with IDs as keys, maintaining insertion order
                            foreach ($variations_with_order as $variation_data) {
                                $variation_id = $variation_data['id'];
                                $variation_obj = $variation_data['obj'];
                                
                                if ($selected_option) $default_option_select = $variation_id;
                                
                                $variation_pricing_data = product_estimator_get_product_price($variation_id, $room_area, false);

                                $variations[$variation_id] = [
                                    'id' => $variation_id,
                                    'name' => $variation_obj->get_name(),
                                    'image' => wp_get_attachment_image_url($variation_obj->get_image_id(), 'thumbnail'),
                                    'min_price' => $variation_pricing_data['min_price'],
                                    'max_price' => $variation_pricing_data['max_price'],
                                    'pricing_method' => $variation_pricing_data['pricing_method'],
                                    'min_price_total' => ($variation_pricing_data['pricing_method'] === 'sqm' && $room_area > 0) ? $variation_pricing_data['min_price'] * $room_area : $variation_pricing_data['min_price'],
                                    'max_price_total' => ($variation_pricing_data['pricing_method'] === 'sqm' && $room_area > 0) ? $variation_pricing_data['max_price'] * $room_area : $variation_pricing_data['max_price'],
                                    'is_primary_category' => $this->isProductInPrimaryCategories($variation_id),
                                    'selected' => $selected_option,
                                    'menu_order' => $variation_obj->get_menu_order()
                                ];

                                $selected_option = false;
                            }

                            if (!empty($variations)) {
                                $additional_product_entry['variations'] = $variations;
                                $additional_product_entry['is_variable'] = true;
                                $additional_product_entry['selected_option'] = $default_option_select;
                            } else {
                                $additional_product_entry['is_variable'] = false;
                                $additional_product_entry['variations'] = [];
                            }
                        }

                        // Always check for upgrades (no feature switch required)
                            $product_upgrades_frontend = null;
                            $upgrades_frontend_class = '\\RuDigital\\ProductEstimator\\Includes\\Frontend\\ProductUpgradesFrontend';

                            // Check if class exists and instantiate if needed
                            if (!class_exists($upgrades_frontend_class)) {
                                $upgrades_frontend_path = PRODUCT_ESTIMATOR_PLUGIN_DIR . 'includes/frontend/class-product-upgrades-frontend.php';
                                error_log('PRODUCT UPGRADES CHECK: Class not found, attempting to load from: ' . $upgrades_frontend_path);

                                if (file_exists($upgrades_frontend_path)) {
                                    require_once $upgrades_frontend_path;
                                    error_log('PRODUCT UPGRADES CHECK: Successfully loaded ProductUpgradesFrontend class');
                                } else {
                                    error_log('PRODUCT UPGRADES CHECK: File not found at: ' . $upgrades_frontend_path);
                                }
                            } else {
                                error_log('PRODUCT UPGRADES CHECK: ProductUpgradesFrontend class already exists');
                            }

                            if (class_exists($upgrades_frontend_class)) {
                                try {
                                    // Get existing estimate ID if available (usually passed in the AJAX request)
                                    $estimate_id = isset($_POST['estimate_id']) ? sanitize_text_field($_POST['estimate_id']) : '';
                                    $room_id = isset($_POST['room_id']) ? sanitize_text_field($_POST['room_id']) : '';

                                    error_log('PRODUCT UPGRADES CHECK: Creating instance with estimate_id=' . $estimate_id . ', room_id=' . $room_id);

                                    $product_upgrades_frontend = new $upgrades_frontend_class('product-estimator', PRODUCT_ESTIMATOR_VERSION);

                                    error_log('PRODUCT UPGRADES CHECK: Calling get_upgrades_for_product with:');
                                    error_log('  - product_id: ' . $auto_add_product_id);
                                    error_log('  - type: room_product');
                                    error_log('  - estimate_id: ' . $estimate_id);
                                    error_log('  - room_id: ' . $room_id);
                                    error_log('  - room_area: ' . $room_area);

                                    $upgrades_data = $product_upgrades_frontend->get_upgrades_for_product(
                                        $auto_add_product_id,
                                        'room_product',
                                        $estimate_id,
                                        $room_id,
                                        $room_area
                                    );

                                    error_log('PRODUCT UPGRADES CHECK: Response from get_upgrades_for_product:');
                                    error_log(print_r($upgrades_data, true));

                                    // Add upgrades data if available
                                    if (!empty($upgrades_data) && isset($upgrades_data['products'])) {
                                        $additional_product_entry['has_upgrades'] = true;
                                        $additional_product_entry['upgrades'] = $upgrades_data;
                                        error_log('PRODUCT UPGRADES CHECK: Found ' . count($upgrades_data['products']) . ' upgrade products');
                                    } else {
                                        $additional_product_entry['has_upgrades'] = false;
                                        error_log('PRODUCT UPGRADES CHECK: No upgrade products found');
                                    }
                                } catch (\Throwable $e) {
                                    error_log('PRODUCT UPGRADES CHECK ERROR: Failed to get upgrades for additional product ' . $auto_add_product_id);
                                    error_log('PRODUCT UPGRADES CHECK ERROR: ' . $e->getMessage());
                                    error_log('PRODUCT UPGRADES CHECK ERROR: Stack trace: ' . $e->getTraceAsString());
                                    $additional_product_entry['has_upgrades'] = false;
                                }
                            } else {
                                error_log('PRODUCT UPGRADES CHECK: ProductUpgradesFrontend class not available after load attempt');
                                $additional_product_entry['has_upgrades'] = false;
                            }

                        $product_data['additional_products'][$auto_add_product_id] = $additional_product_entry;
                    }
                }
                foreach ($auto_add_notes_texts as $note_text) {
                    $product_data['additional_notes']['note_' . uniqid()] = ['id' => 'note_' . uniqid(), 'type' => 'note', 'note_text' => $note_text];
                }
                
                // Add section info to the product data
                if (!empty($section_info)) {
                    $product_data['additional_products_section'] = $section_info;
                }

                // Generate room suggestions.
                // $room_products_ids_for_suggestions is already an array of product IDs.
                // Format it for get_suggestions_for_room which expects an array of items, each with an 'id' key.

                $features = product_estimator_features(); // Get feature flags

                if ($features->suggested_products_enabled) {
                    if (defined('WP_DEBUG') && WP_DEBUG) {
                        error_log('AJAX get_product_data_for_storage: Suggested products ENABLED. Generating suggestions.');
                    }
                    // Format $room_products_ids_for_suggestions_context for get_suggestions_for_room
                    // which expects an array of items, each with an 'id' key.
                    $current_room_contents_for_suggestions_formatted = [];
                    foreach ($room_products_ids_for_suggestions as $pid) {
                        $current_room_contents_for_suggestions_formatted[] = ['id' => intval($pid)];
                    }

                    if (defined('WP_DEBUG') && WP_DEBUG) {
                        error_log('AJAX get_product_data_for_storage: Calling get_suggestions_for_room with formatted items: ' . print_r($current_room_contents_for_suggestions_formatted, true) . ' for room_area ' . $room_area);
                    }

                    $raw_suggestions = $product_additions_manager->get_suggestions_for_room($current_room_contents_for_suggestions_formatted, $room_area);

                    if (is_array($raw_suggestions)) {
                        // Add is_primary_category flag to each suggestion
                        foreach ($raw_suggestions as $key => $suggestion) {
                            if (isset($suggestion['id'])) {
                                $raw_suggestions[$key]['is_primary_category'] = $this->isProductInPrimaryCategories($suggestion['id']);
                            }
                        }

                        // Ensure the suggestions are a numerically indexed array for JSON
                        $product_data['room_suggested_products'] = array_values($raw_suggestions);
                        if (defined('WP_DEBUG') && WP_DEBUG) {
                            error_log('AJAX get_product_data_for_storage: Suggestions returned (and re-indexed): ' . print_r($product_data['room_suggested_products'], true));
                        }
                    } else {
                        // If $raw_suggestions is not an array, default to an empty array.
                        $product_data['room_suggested_products'] = [];
                        if (defined('WP_DEBUG') && WP_DEBUG) {
                            error_log('AJAX get_product_data_for_storage: get_suggestions_for_room did not return an array. Value: ' . print_r($raw_suggestions, true) . '. Defaulting to empty array for room_suggested_products.');
                        }
                    }
                } else {
                    // If suggested_products_enabled is false, ensure room_suggested_products is an empty array.
                    $product_data['room_suggested_products'] = [];
                    if (defined('WP_DEBUG') && WP_DEBUG) {
                        error_log('AJAX get_product_data_for_storage: Suggested products DISABLED. Setting room_suggested_products to empty array.');
                    }
                }
                // **END MODIFIED PART**

            } else {
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log('AJAX Handler Warning: ProductAdditionsFrontend manager is NOT available. Auto-add products and suggestions will be skipped.');
                }
                $product_data['room_suggested_products'] = []; // Ensure it's an empty array if manager is not available
            }

            $similar_products_list = $this->fetch_and_format_similar_products($product_id, $room_area);

            $product_data['similar_products'] = $similar_products_list;

            // Check if this is a variable product and add variations data
            if ($product->is_type('variable')) {
                // Get variations data
                $available_variations = $product->get_available_variations();
                $attributes = $product->get_variation_attributes();

                // Format attributes for frontend
                $formatted_attributes = [];
                foreach ($attributes as $attribute_name => $options) {
                    $formatted_options = [];

                    // Check if this is a taxonomy attribute
                    $attribute_taxonomy = wc_attribute_taxonomy_name($attribute_name);
                    $is_taxonomy = taxonomy_exists($attribute_taxonomy);

                    foreach ($options as $option) {
                        $option_data = [
                            'value' => $option,
                            'label' => $option
                        ];

                        // If this is a taxonomy attribute, get the term details
                        if ($is_taxonomy) {
                            $term = get_term_by('slug', $option, $attribute_taxonomy);
                            if ($term) {
                                $option_data['label'] = $term->name;

                                // Check for color or image meta
                                $color = get_term_meta($term->term_id, 'product_attribute_color', true);
                                $image = get_term_meta($term->term_id, 'product_attribute_image', true);

                                if ($color) {
                                    $option_data['color'] = $color;
                                    $option_data['type'] = 'color';
                                } elseif ($image) {
                                    $option_data['image'] = wp_get_attachment_url($image);
                                    $option_data['type'] = 'image';
                                }
                            }
                        }

                        $formatted_options[] = $option_data;
                    }

                    $formatted_attributes[$attribute_name] = [
                        'label' => wc_attribute_label($attribute_name, $product),
                        'options' => $formatted_options,
                        'type' => isset($formatted_options[0]['type']) ? $formatted_options[0]['type'] : 'label'
                    ];
                }

                // Format variations for frontend
                $formatted_variations = [];
                foreach ($available_variations as $variation) {
                    $variation_obj = wc_get_product($variation['variation_id']);
                    $image_id = $variation_obj ? $variation_obj->get_image_id() : 0;
                    $image_url = '';

                    if ($image_id) {
                        $image_url = wp_get_attachment_image_url($image_id, 'woocommerce_thumbnail');
                    } elseif (isset($variation['image']['url'])) {
                        $image_url = $variation['image']['url'];
                    }

                    $formatted_variations[] = [
                        'variation_id' => $variation['variation_id'],
                        'attributes' => $variation['attributes'],
                        'display_price' => $variation['display_price'],
                        'display_regular_price' => $variation['display_regular_price'],
                        'image' => $variation['image'],
                        'image_url' => $image_url,
                        'is_in_stock' => $variation['is_in_stock'],
                        'variation_description' => $variation['variation_description']
                    ];
                }

                // Add variations data to product data
                $product_data['is_variable'] = true;
                $product_data['variations'] = $formatted_variations;
                $product_data['attributes'] = $formatted_attributes;
            } else {
                $product_data['is_variable'] = false;
                $product_data['variations'] = [];
                $product_data['attributes'] = [];
            }

            error_log('FINAL PRODUCT DATA: ' . print_r($product_data, true));

            wp_send_json_success([
                'message' => __('Product data retrieved successfully', 'product-estimator'),
                'product_data' => $product_data
            ]);

        } catch (\Exception $e) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('Exception in get_product_data_for_storage: ' . $e->getMessage() . ' at ' . $e->getFile() . ':' . $e->getLine());
                error_log('Trace: ' . $e->getTraceAsString());
            }
            wp_send_json_error([
                'message' => __('An error occurred while retrieving product data', 'product-estimator'),
                'error_detail' => $e->getMessage()
            ]);
        }
    }


    /**
     * Get the appropriate pricing rule for a product
     *
     * @param int $product_id The product ID
     * @return array The pricing rule with 'method' and 'source' keys, or default values
     */
    private function getPricingRuleForProduct($product_id)
    {
        // Get global settings
        $settings = get_option('product_estimator_settings');

        // Use defaults from settings if available, otherwise fall back to hardcoded defaults
        $default_rule = [
            'method' => isset($settings['default_pricing_method']) ? $settings['default_pricing_method'] : 'sqm',
            'source' => isset($settings['default_pricing_source']) ? $settings['default_pricing_source'] : 'website'
        ];

        // Return default rule if WooCommerce is not active or product ID is invalid
        if (!function_exists('wp_get_post_terms') || empty($product_id)) {
            return $default_rule;
        }
        // Check if product is a variation and get parent if needed
        $product = wc_get_product($product_id);
        $parent_product_id = null;

        if ($product && $product->is_type('variation')) {
            $parent_product_id = $product->get_parent_id();
        }

        // Get product categories
        if ($parent_product_id) {
            $product_categories = wp_get_post_terms($parent_product_id, 'product_cat', ['fields' => 'ids']);
        } else {
            $product_categories = wp_get_post_terms($product_id, 'product_cat', ['fields' => 'ids']);
        }

        if (empty($product_categories) || is_wp_error($product_categories)) {
            return $default_rule;
        }

        // Get all pricing rules
        $pricing_rules = get_option('product_estimator_pricing_rules', []);

        if (empty($pricing_rules)) {
            return $default_rule;
        }

        // Check each rule to find one that applies to this product's categories
        foreach ($pricing_rules as $rule) {
            if (!isset($rule['categories']) || !is_array($rule['categories'])) {
                continue;
            }

            // Check if any of this product's categories match the rule's categories
            $matching_categories = array_intersect($product_categories, $rule['categories']);

            if (!empty($matching_categories)) {
                // Found a matching rule, return its method and source
                return [
                    'method' => isset($rule['pricing_method']) ? $rule['pricing_method'] : $default_rule['method'],
                    'source' => isset($rule['pricing_source']) ? $rule['pricing_source'] : $default_rule['source']
                ];
            }
        }

        // No matching rule found, return default
        return $default_rule;
    }

    /**
     * Get pricing method for a product based on pricing rules
     *
     * @param int $product_id The product ID
     * @return string The pricing method ('sqm' or 'fixed')
     */
    private function getPricingMethodForProduct($product_id)
    {
        // Get settings
        $settings = get_option('product_estimator_settings');

        // Default to setting from options, or 'sqm' if not set
        $default_method = isset($settings['default_pricing_method']) ? $settings['default_pricing_method'] : 'sqm';

        // Get product categories
        $product_categories = wp_get_post_terms($product_id, 'product_cat', ['fields' => 'ids']);

        if (empty($product_categories)) {
            return $default_method;
        }

        // Get all pricing rules
        $pricing_rules = get_option('product_estimator_pricing_rules', []);

        if (empty($pricing_rules)) {
            return $default_method;
        }

        // Check each rule for matching categories
        foreach ($pricing_rules as $rule) {
            if (!isset($rule['categories']) || !is_array($rule['categories'])) {
                continue;
            }

            // Check if this product's categories match any in the rule
            $matching_categories = array_intersect($product_categories, $rule['categories']);

            if (!empty($matching_categories)) {
                // Found a matching rule, return its method
                return isset($rule['pricing_method']) ? $rule['pricing_method'] : $default_method;
            }
        }

        return $default_method;
    }

    /**
     * Helper method to prepare additional product data for replacement
     * Enhanced to maintain consistent product ID references for multiple replacements
     *
     * @param int $product_id Product ID
     * @param float $room_area Room area
     * @param int|null $original_id Original product ID to maintain reference consistency
     * @return array|false Product data array or false on failure
     */
    private function prepareAdditionalProductData($product_id, $room_area, $original_id = null)
    {
        try {
            // Get product data
            $product = wc_get_product($product_id);
            if (!$product) {
                return false;
            }

            // Get pricing data
            $pricing_data = product_estimator_get_product_price($product_id, $room_area, false);

            // Prepare product data
            $product_data = [
                'id' => $product_id,
                'name' => $product->get_name(),
                'image' => wp_get_attachment_image_url($product->get_image_id(), 'thumbnail'),
                'min_price' => $pricing_data['min_price'],
                'max_price' => $pricing_data['max_price'],
                'pricing_method' => $pricing_data['pricing_method'],
                'pricing_source' => $pricing_data['pricing_source']
            ];

            // If an original ID was provided, store it for reference consistency
            // This is crucial for maintaining multiple upgrades
            if ($original_id) {
                $product_data['original_id'] = $original_id;
            }

            // Calculate price totals
            if ($pricing_data['pricing_method'] === 'sqm' && $room_area > 0) {
                $min_total = $pricing_data['min_price'] * $room_area;
                $max_total = $pricing_data['max_price'] * $room_area;

                $product_data['min_price_total'] = $min_total;
                $product_data['max_price_total'] = $max_total;
            } else {
                $product_data['min_price_total'] = $pricing_data['min_price'];
                $product_data['max_price_total'] = $pricing_data['max_price'];
            }

            return $product_data;
        } catch (\Exception $e) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('Error preparing additional product data: ' . $e->getMessage());
            }
            return false;
        }
    }

    /**
     * Get product variations including attributes and available variations
     */
    public function get_product_variations() {
        check_ajax_referer('product_estimator_nonce', 'nonce');

        $product_id = isset($_POST['product_id']) ? intval($_POST['product_id']) : 0;

        if (!$product_id) {
            wp_send_json_error(['message' => __('Product ID is required', 'product-estimator')]);
            return;
        }

        try {
            $product = wc_get_product($product_id);

            if (!$product || !$product->is_type('variable')) {
                wp_send_json_success([
                    'is_variable' => false,
                    'product_name' => $product ? $product->get_name() : '',
                    'variations' => [],
                    'attributes' => []
                ]);
                return;
            }

            // Get available variations
            $available_variations = $product->get_available_variations();
            $attributes = $product->get_variation_attributes();

            // Format attributes for frontend
            $formatted_attributes = [];
            foreach ($attributes as $attribute_name => $options) {
                $formatted_options = [];

                // Check if this is a taxonomy attribute
                $attribute_taxonomy = wc_attribute_taxonomy_name($attribute_name);
                $is_taxonomy = taxonomy_exists($attribute_taxonomy);

                foreach ($options as $option) {
                    $option_data = [
                        'value' => $option,
                        'label' => $option
                    ];

                    // If this is a taxonomy attribute, get the term details
                    if ($is_taxonomy) {
                        $term = get_term_by('slug', $option, $attribute_taxonomy);
                        if ($term) {
                            $option_data['label'] = $term->name;

                            // Check for color or image meta
                            $color = get_term_meta($term->term_id, 'product_attribute_color', true);
                            $image = get_term_meta($term->term_id, 'product_attribute_image', true);

                            if ($color) {
                                $option_data['color'] = $color;
                                $option_data['type'] = 'color';
                            } elseif ($image) {
                                $option_data['image'] = wp_get_attachment_url($image);
                                $option_data['type'] = 'image';
                            }
                        }
                    }

                    // For each option, try to find a matching variation image
                    $option_image = null;
                    foreach ($available_variations as $variation) {
                        if (isset($variation['attributes']["attribute_$attribute_name"]) &&
                            $variation['attributes']["attribute_$attribute_name"] === $option) {
                            $variation_obj = wc_get_product($variation['variation_id']);
                            if ($variation_obj) {
                                $image_id = $variation_obj->get_image_id();
                                if ($image_id) {
                                    $option_image = wp_get_attachment_image_url($image_id, 'woocommerce_thumbnail');
                                    break;
                                }
                            }
                        }
                    }

                    // Use variation image if no attribute image is set
                    if ($option_image && empty($option_data['image'])) {
                        $option_data['image'] = $option_image;
                        $option_data['type'] = 'image';
                    }

                    $formatted_options[] = $option_data;
                }

                $formatted_attributes[$attribute_name] = [
                    'label' => wc_attribute_label($attribute_name, $product),
                    'options' => $formatted_options,
                    'type' => isset($formatted_options[0]['type']) ? $formatted_options[0]['type'] : 'label'
                ];
            }

            // Format variations for frontend
            $formatted_variations = [];
            foreach ($available_variations as $variation) {
                $variation_obj = wc_get_product($variation['variation_id']);
                $image_id = $variation_obj ? $variation_obj->get_image_id() : 0;
                $image_url = '';

                // Get the variation image URL if it exists
                if ($image_id) {
                    $image_url = wp_get_attachment_image_url($image_id, 'woocommerce_thumbnail');
                } elseif (isset($variation['image']['url'])) {
                    $image_url = $variation['image']['url'];
                }

                $formatted_variations[] = [
                    'variation_id' => $variation['variation_id'],
                    'attributes' => $variation['attributes'],
                    'display_price' => $variation['display_price'],
                    'display_regular_price' => $variation['display_regular_price'],
                    'image' => $variation['image'],
                    'image_url' => $image_url,
                    'is_in_stock' => $variation['is_in_stock'],
                    'variation_description' => $variation['variation_description']
                ];
            }

            wp_send_json_success([
                'is_variable' => true,
                'product_name' => $product->get_name(),
                'variations' => $formatted_variations,
                'attributes' => $formatted_attributes
            ]);

        } catch (\Exception $e) {
            wp_send_json_error([
                'message' => $e->getMessage()
            ]);
        }
    }
}
