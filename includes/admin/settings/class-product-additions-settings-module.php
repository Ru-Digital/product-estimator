<?php
namespace RuDigital\ProductEstimator\Includes\Admin\Settings;

/**
 * Product Additions Settings Module Class
 *
 * Implements the product additions settings tab functionality.
 *
 * @since      1.1.0
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes/admin/settings
 */
class ProductAdditionsSettingsModule extends SettingsModuleBase {

    /**
     * Set the tab and section details.
     *
     * @since    1.1.0
     * @access   protected
     */
    protected function set_tab_details() {
        $this->tab_id = 'product_additions';
        $this->tab_title = __('Product Additions', 'product-estimator');
        $this->section_id = 'product_additions_settings';
        $this->section_title = __('Product Additions Settings', 'product-estimator');
    }

    /**
     * Register the module-specific settings fields.
     *
     * @since    1.1.0
     * @access   protected
     */
    protected function register_fields() {
        // No traditional fields to register for this tab, as it uses a custom UI
        // But we can still register the section to ensure it's created
    }

    /**
     * Process form data specific to this module
     *
     * @since    1.1.0
     * @access   protected
     * @param    array    $form_data    The form data to process
     * @return   true|\WP_Error    True on success, WP_Error on failure
     */
    protected function process_form_data($form_data) {
        // For product additions, we handle the data saving through separate AJAX endpoints
        // This method is primarily used for validation

        return true;
    }

    /**
     * Render the section description.
     *
     * @since    1.1.0
     * @access   public
     */
    public function render_section_description() {
        echo '<p>' . esc_html__('Manage product additions for automatic and suggested products based on categories.', 'product-estimator') . '</p>';
    }

    /**
     * Render the module content.
     *
     * @since    1.1.0
     * @access   public
     */
    public function render_module_content() {
        // Get existing relations
        $relations = get_option('product_estimator_product_additions', array());

        // Get all product categories
        $categories = get_terms(array(
            'taxonomy' => 'product_cat',
            'hide_empty' => false,
        ));

        include PRODUCT_ESTIMATOR_PLUGIN_DIR . 'includes/admin/partials/product-additions-admin-display.php';
    }

    /**
     * Enqueue module-specific scripts.
     *
     * @since    1.1.0
     * @access   public
     */
    public function enqueue_scripts() {
        // Enqueue Select2 for multiple select functionality
        wp_enqueue_script('select2', 'https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js', array('jquery'), '4.1.0-rc.0', true);
        wp_enqueue_style('select2', 'https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css', array(), '4.1.0-rc.0');

        wp_enqueue_script(
            $this->plugin_name . '-product-additions-settings',
            PRODUCT_ESTIMATOR_PLUGIN_URL . 'admin/js/modules/product-additions-settings.js',
            array('jquery', 'select2', $this->plugin_name . '-settings'),
            $this->version,
            true
        );

        // Localize script with all required parameters
        wp_localize_script(
            $this->plugin_name . '-product-additions-settings',
            'productAdditionsSettings',
            array(
                'ajax_url' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('product_estimator_product_additions_nonce'),
                'i18n' => array(
                    'confirmDelete' => __('Are you sure you want to delete this relationship?', 'product-estimator'),
                    'addNew' => __('Add New Relationship', 'product-estimator'),
                    'saveChanges' => __('Save Changes', 'product-estimator'),
                    'cancel' => __('Cancel', 'product-estimator'),
                    'selectAction' => __('Please select an action type', 'product-estimator'),
                    'selectSourceCategories' => __('Please select at least one source category', 'product-estimator'),
                    'selectTargetCategory' => __('Please select a target category', 'product-estimator'),
                    'selectProduct' => __('Please select a product', 'product-estimator'),
                    'searching' => __('Searching...', 'product-estimator'),
                    'noProductsFound' => __('No products found', 'product-estimator'),
                    'errorSearching' => __('Error searching products', 'product-estimator')
                ),
                'tab_id' => $this->tab_id
            )
        );
    }

    /**
     * Enqueue module-specific styles.
     *
     * @since    1.1.0
     * @access   public
     */
    public function enqueue_styles() {
        wp_enqueue_style(
            $this->plugin_name . '-product-additions',
            PRODUCT_ESTIMATOR_PLUGIN_URL . 'admin/css/modules/product-additions.css',
            array($this->plugin_name . '-settings'),
            $this->version
        );
    }

    /**
     * Register module hooks.
     *
     * @since    1.1.0
     * @access   protected
     */
    protected function register_hooks() {
        parent::register_hooks();

        // Register AJAX handlers
        add_action('wp_ajax_save_category_relation', array($this, 'ajax_save_category_relation'));
        add_action('wp_ajax_delete_category_relation', array($this, 'ajax_delete_category_relation'));
        add_action('wp_ajax_search_category_products', array($this, 'ajax_search_category_products'));
        add_action('wp_ajax_get_product_details', array($this, 'ajax_get_product_details'));
    }

    /**
     * AJAX handler for saving a category relation
     */
    public function ajax_save_category_relation() {
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

        // Get form data
        $relation_id = isset($_POST['relation_id']) && !empty($_POST['relation_id']) ?
            sanitize_text_field($_POST['relation_id']) :
            uniqid('rel_'); // Generate a unique ID if none provided

        // Handle source_category as array for multiple selection
        $source_categories = array();
        if (isset($_POST['source_category']) && is_array($_POST['source_category'])) {
            foreach ($_POST['source_category'] as $cat_id) {
                $source_categories[] = absint($cat_id);
            }
        } elseif (isset($_POST['source_category'])) {
            // Backward compatibility for single category
            $source_categories[] = absint($_POST['source_category']);
        }

        $relation_type = isset($_POST['relation_type']) ? sanitize_text_field($_POST['relation_type']) : '';
        $target_category = isset($_POST['target_category']) ? absint($_POST['target_category']) : 0;
        $product_id = isset($_POST['product_id']) ? absint($_POST['product_id']) : 0;
        $note_text = isset($_POST['note_text']) ? sanitize_textarea_field($_POST['note_text']) : '';

        // Validate data
        if (empty($relation_type)) {
            wp_send_json_error(array('message' => __('Please select an action type.', 'product-estimator')));
            return;
        }

        if (empty($source_categories)) {
            wp_send_json_error(array('message' => __('Please select at least one source category.', 'product-estimator')));
            return;
        }

        // Validate based on relation_type
        if ($relation_type === 'auto_add_by_category') {
            if (empty($target_category)) {
                wp_send_json_error(array('message' => __('Please select a target category.', 'product-estimator')));
                return;
            }

            if (empty($product_id)) {
                wp_send_json_error(array('message' => __('Please select a product.', 'product-estimator')));
                return;
            }
        } elseif ($relation_type === 'suggest_products_by_category') {
            if (empty($target_category)) {
                wp_send_json_error(array('message' => __('Please select a target category.', 'product-estimator')));
                return;
            }
        } elseif ($relation_type === 'auto_add_note_by_category') {
            if (empty($note_text)) {
                wp_send_json_error(array('message' => __('Please enter a note text.', 'product-estimator')));
                return;
            }
        }

        // Get current relations
        $relations = get_option('product_estimator_product_additions', array());

        // Prepare the relation data
        $relation_data = array(
            'source_category' => $source_categories,
            'relation_type' => $relation_type,
        );

        // Add target_category and product_id if applicable
        if ($relation_type === 'auto_add_by_category') {
            $relation_data['target_category'] = $target_category;
            $relation_data['product_id'] = $product_id;
        } elseif ($relation_type === 'suggest_products_by_category') {
            $relation_data['target_category'] = $target_category;
        } elseif ($relation_type === 'auto_add_note_by_category') {
            $relation_data['note_text'] = $note_text;
        }

        // Add or update relation
        $relations[$relation_id] = $relation_data;

        // Save relations
        update_option('product_estimator_product_additions', $relations);

        // Get category names for response
        $source_cat_names = array();
        foreach ($source_categories as $cat_id) {
            $term = get_term($cat_id, 'product_cat');
            if (!is_wp_error($term) && $term) {
                $source_cat_names[] = $term->name;
            }
        }

        // Determine relation type label
        $relation_type_label = '';
        if ($relation_type === 'auto_add_by_category') {
            $relation_type_label = __('Auto add product with Category', 'product-estimator');
        } elseif ($relation_type === 'auto_add_note_by_category') {
            $relation_type_label = __('Auto add note with Category', 'product-estimator');
        } elseif ($relation_type === 'suggest_products_by_category') {
            $relation_type_label = __('Suggest products when Category', 'product-estimator');
        }

        // Prepare response data
        $response_data = array(
            'id' => $relation_id,
            'source_category' => $source_categories,
            'source_name' => implode(', ', $source_cat_names),
            'relation_type' => $relation_type,
            'relation_type_label' => $relation_type_label,
        );

        // Add target category info if applicable
        if ($target_category && ($relation_type === 'auto_add_by_category' || $relation_type === 'suggest_products_by_category')) {
            $target_cat = get_term($target_category, 'product_cat');
            if (!is_wp_error($target_cat) && $target_cat) {
                $response_data['target_category'] = $target_category;
                $response_data['target_name'] = $target_cat->name;
            }
        }

        // Add product info if applicable
        if ($product_id && $relation_type === 'auto_add_by_category') {
            $product = wc_get_product($product_id);
            if ($product) {
                $response_data['product_id'] = $product_id;
                $response_data['product_name'] = $product->get_name();
            }
        }

        // Add note text if applicable
        if ($note_text && $relation_type === 'auto_add_note_by_category') {
            $response_data['note_text'] = $note_text;
        }

        wp_send_json_success(array(
            'message' => __('Relationship saved successfully.', 'product-estimator'),
            'relation' => $response_data,
        ));
    }

    /**
     * AJAX handler for deleting a category relation
     */
    public function ajax_delete_category_relation() {
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

        // Get relation ID
        $relation_id = isset($_POST['relation_id']) ? sanitize_text_field($_POST['relation_id']) : '';

        if (empty($relation_id)) {
            wp_send_json_error(array('message' => __('Invalid relationship ID.', 'product-estimator')));
            return;
        }

        // Get current relations
        $relations = get_option('product_estimator_product_additions', array());

        // Check if relation exists
        if (!isset($relations[$relation_id])) {
            wp_send_json_error(array('message' => __('Relationship not found.', 'product-estimator')));
            return;
        }

        // Remove relation
        unset($relations[$relation_id]);

        // Save relations
        update_option('product_estimator_product_additions', $relations);

        wp_send_json_success(array(
            'message' => __('Relationship deleted successfully.', 'product-estimator'),
        ));
    }

    /**
     * AJAX handler for searching products within a category
     */
    public function ajax_search_category_products() {
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
    }

    /**
     * AJAX handler for getting product details by ID
     */
    public function ajax_get_product_details() {
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

        // Get product ID
        $product_id = isset($_POST['product_id']) ? absint($_POST['product_id']) : 0;

        if (empty($product_id)) {
            wp_send_json_error(array('message' => __('Invalid product ID.', 'product-estimator')));
            return;
        }

        // Get product details
        $product = wc_get_product($product_id);

        if (!$product) {
            wp_send_json_error(array('message' => __('Product not found.', 'product-estimator')));
            return;
        }

        wp_send_json_success(array(
            'product' => array(
                'id' => $product_id,
                'name' => $product->get_name(),
                'price' => $product->get_price(),
                'formatted_price' => wc_price($product->get_price()),
                'category_ids' => $product->get_category_ids(),
            ),
        ));
    }

    /**
     * Get auto-add products for specific categories
     *
     * @param int $category_id Category ID
     * @return array Array of product IDs
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
     * @param int $category_id Category ID
     * @return array Array of note texts
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
     * @param int $category_id Category ID
     * @return array Array of product IDs
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
     * @param array $room_products Array of products in the room
     * @return array Array of suggested products
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
