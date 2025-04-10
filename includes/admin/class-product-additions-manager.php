<?php
/**
 * The admin-specific functionality for managing product additions.
 */

namespace RuDigital\ProductEstimator\Includes\Admin;

use RuDigital\ProductEstimator\Includes\Loader;

/**
 * The admin-specific functionality for managing product additions.
 *
 * Defines the plugin name, version, and hooks for the admin area related
 * to managing product additions for automatic and optional additions.
 */
class ProductAdditionsManager {

    /**
     * The ID of this plugin.
     */
    private $plugin_name;

    /**
     * The version of this plugin.
     */
    private $version;

    /**
     * The loader that's responsible for maintaining and registering all hooks.
     */
    protected $loader;

    /**
     * Initialize the class and set its properties.
     *
     * @param string $plugin_name The name of this plugin.
     * @param string $version The version of this plugin.
     * @param Loader $loader The loader object.
     */
    public function __construct($plugin_name, $version, $loader = null) {
        $this->plugin_name = $plugin_name;
        $this->version = $version;
        $this->loader = $loader;

        $this->load_dependencies();

        // Register hooks directly if no loader is provided
        if ($loader === null) {
            // Add menu item
            add_action('admin_menu', array($this, 'add_admin_menu'), 30);

            // Register settings
            add_action('admin_init', array($this, 'register_settings'));

            // Admin scripts and styles
            add_action('admin_enqueue_scripts', array($this, 'enqueue_scripts'));

            // AJAX handlers
            add_action('wp_ajax_save_category_relation', array($this, 'ajax_save_category_relation'));
            add_action('wp_ajax_delete_category_relation', array($this, 'ajax_delete_category_relation'));
            add_action('wp_ajax_search_category_products', array($this, 'ajax_search_category_products'));
            add_action('wp_ajax_get_product_details', array($this, 'ajax_get_product_details'));

            // Add custom column to product categories
            add_filter('manage_edit-product_cat_columns', array($this, 'add_product_cat_columns'));
            add_filter('manage_product_cat_custom_column', array($this, 'manage_product_cat_columns'), 10, 3);
        } else {
            $this->define_admin_hooks();
        }
    }

    /**
     * Load the required dependencies for this class.
     */
    private function load_dependencies() {
        // Any specific dependencies for the product additions feature
    }

    /**
     * Register all hooks related to the admin area functionality.
     */
    private function define_admin_hooks() {
        // Add menu item
        $this->loader->add_action('admin_menu', $this, 'add_admin_menu', 30);

        // Register settings
        $this->loader->add_action('admin_init', $this, 'register_settings');

        // Admin scripts and styles
        $this->loader->add_action('admin_enqueue_scripts', $this, 'enqueue_scripts');

        // AJAX handlers
        $this->loader->add_action('wp_ajax_save_category_relation', $this, 'ajax_save_category_relation');
        $this->loader->add_action('wp_ajax_delete_category_relation', $this, 'ajax_delete_category_relation');
        $this->loader->add_action('wp_ajax_search_category_products', $this, 'ajax_search_category_products');
        $this->loader->add_action('wp_ajax_get_product_details', $this, 'ajax_get_product_details');

        // Add custom column to product categories
        $this->loader->add_filter('manage_edit-product_cat_columns', $this, 'add_product_cat_columns');
        $this->loader->add_filter('manage_product_cat_custom_column', $this, 'manage_product_cat_columns', 10, 3);
    }

    /**
     * Add options page to admin menu
     */
    public function add_admin_menu() {
        add_submenu_page(
            'product-estimator', // Parent menu slug
            __('Product Additions', 'product-estimator'),
            __('Product Additions', 'product-estimator'),
            'manage_options',
            'product-estimator-additions',
            array($this, 'display_additions_page')
        );
    }

    /**
     * Register settings for product additions
     */
    public function register_settings() {
        register_setting(
            'product_estimator_additions',
            'product_estimator_product_additions',
            array(
                'sanitize_callback' => array($this, 'sanitize_product_additions'),
                'default' => array(),
            )
        );
    }

    /**
     * Sanitize product additions settings
     *
     * @param array $input The data to be sanitized.
     * @return array The sanitized data.
     */
    public function sanitize_product_additions($input) {
        $sanitized_input = array();

        if (is_array($input)) {
            foreach ($input as $key => $value) {
                // Handle source_category as an array for multiple selection
                $source_categories = array();
                if (isset($value['source_category']) && is_array($value['source_category'])) {
                    foreach ($value['source_category'] as $cat_id) {
                        $source_categories[] = absint($cat_id);
                    }
                } elseif (isset($value['source_category'])) {
                    // Backward compatibility for non-array source categories
                    $source_categories[] = absint($value['source_category']);
                }

                $sanitized_input[$key] = array(
                    'source_category' => $source_categories,
                    'relation_type' => sanitize_text_field($value['relation_type']),
                );

                // Only add target_category if provided
                if (isset($value['target_category']) && !empty($value['target_category'])) {
                    $sanitized_input[$key]['target_category'] = absint($value['target_category']);
                }

                // Only add product_id if provided
                if (isset($value['product_id']) && !empty($value['product_id'])) {
                    $sanitized_input[$key]['product_id'] = absint($value['product_id']);
                }
            }
        }

        return $sanitized_input;
    }

    /**
     * Display the additions management page
     */
    public function display_additions_page() {
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
     * Enqueue admin scripts and styles
     *
     * @param string $hook_suffix The current admin page.
     */
    public function enqueue_scripts($hook_suffix) {
        if (strpos($hook_suffix, 'product-estimator-additions') === false) {
            return;
        }

        // Enqueue the styles and scripts
        wp_enqueue_style(
            $this->plugin_name . '-product-additions',
            PRODUCT_ESTIMATOR_PLUGIN_URL . 'admin/css/product-additions.css',
            array(),
            $this->version
        );

        wp_enqueue_script(
            $this->plugin_name . '-product-additions',
            PRODUCT_ESTIMATOR_PLUGIN_URL . 'admin/js/product-additions.js',
            array('jquery', 'select2'),
            $this->version,
            true
        );

        // Enqueue Select2 for multiple select functionality
        wp_enqueue_script('select2', 'https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js', array('jquery'), '4.1.0-rc.0', true);
        wp_enqueue_style('select2', 'https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css', array(), '4.1.0-rc.0');

        wp_localize_script(
            $this->plugin_name . '-product-additions',
            'ProductEstimatorAdmin',
            array(
                'ajaxUrl' => admin_url('admin-ajax.php'),
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
                ),
            )
        );
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

        // Prepare response data
        $response_data = array(
            'id' => $relation_id,
            'source_category' => $source_categories,
            'source_name' => implode(', ', $source_cat_names),
            'relation_type' => $relation_type,
            'relation_type_label' => __('Auto add product with Category', 'product-estimator'),
        );

        // Add target category info if applicable
        if ($target_category) {
            $target_cat = get_term($target_category, 'product_cat');
            if (!is_wp_error($target_cat) && $target_cat) {
                $response_data['target_category'] = $target_category;
                $response_data['target_name'] = $target_cat->name;
            }
        }

        // Add product info if applicable
        if ($product_id) {
            $product = wc_get_product($product_id);
            if ($product) {
                $response_data['product_id'] = $product_id;
                $response_data['product_name'] = $product->get_name();
            }
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
//            'meta_query' => array(
//                array(
//                    'key' => '_enable_estimator',
//                    'value' => 'yes',
//                    'compare' => '=',
//                ),
//            ),
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
     * Add custom columns to product categories table
     *
     * @param array $columns The existing columns.
     * @return array The modified columns.
     */
    public function add_product_cat_columns($columns) {
        $new_columns = array();

        foreach ($columns as $key => $value) {
            $new_columns[$key] = $value;

            // Add our column after the name column
            if ('name' === $key) {
                $new_columns['estimator_relations'] = __('Estimator Relations', 'product-estimator');
            }
        }

        return $new_columns;
    }

    /**
     * Manage content of custom product category columns
     *
     * @param string $content The column content.
     * @param string $column_name The name of the column.
     * @param int $term_id The ID of the term.
     * @return string The modified column content.
     */
    public function manage_product_cat_columns($content, $column_name, $term_id) {
        if ('estimator_relations' !== $column_name) {
            return $content;
        }

        $relations = get_option('product_estimator_product_additions', array());
        $source_relations = array();
        $target_relations = array();

        foreach ($relations as $relation_id => $relation) {
            // Handle source_category as array
            $source_categories = isset($relation['source_category']) ? (array) $relation['source_category'] : array();

            if (in_array($term_id, $source_categories)) {
                $relation_info = '';

                if ($relation['relation_type'] === 'auto_add_by_category' && isset($relation['product_id'])) {
                    $product = wc_get_product($relation['product_id']);
                    if ($product) {
                        $relation_info = sprintf(
                            __('Auto-adds product: %s', 'product-estimator'),
                            '<strong>' . esc_html($product->get_name()) . '</strong>'
                        );
                    }
                } else if (isset($relation['target_category'])) {
                    // Backward compatibility for category-only relationships
                    $target_cat = get_term($relation['target_category'], 'product_cat');
                    if (!is_wp_error($target_cat) && $target_cat) {
                        $relation_info = sprintf(
                            __('Adds products from: %s', 'product-estimator'),
                            '<strong>' . esc_html($target_cat->name) . '</strong>'
                        );
                    }
                }

                if (!empty($relation_info)) {
                    $source_relations[] = $relation_info;
                }
            }

            if (isset($relation['target_category']) && $relation['target_category'] == $term_id) {
                $source_cat_names = array();
                foreach ($source_categories as $cat_id) {
                    $term = get_term($cat_id, 'product_cat');
                    if (!is_wp_error($term) && $term) {
                        $source_cat_names[] = $term->name;
                    }
                }

                if (!empty($source_cat_names)) {
                    $relation_text = '';

                    if ($relation['relation_type'] === 'auto_add_by_category' && isset($relation['product_id'])) {
                        $product = wc_get_product($relation['product_id']);
                        if ($product) {
                            $relation_text = sprintf(
                                __('Products from %1$s auto-add product: %2$s', 'product-estimator'),
                                '<strong>' . esc_html(implode(', ', $source_cat_names)) . '</strong>',
                                '<strong>' . esc_html($product->get_name()) . '</strong>'
                            );
                        }
                    } else {
                        $relation_text = sprintf(
                            __('Added by products from: %s', 'product-estimator'),
                            '<strong>' . esc_html(implode(', ', $source_cat_names)) . '</strong>'
                        );
                    }

                    if (!empty($relation_text)) {
                        $target_relations[] = $relation_text;
                    }
                }
            }

            // Check if this category contains a product that is used in a relationship
            if (isset($relation['product_id'])) {
                $product = wc_get_product($relation['product_id']);
                if ($product && in_array($term_id, $product->get_category_ids())) {
                    $source_cat_names = array();
                    foreach ($source_categories as $cat_id) {
                        $term = get_term($cat_id, 'product_cat');
                        if (!is_wp_error($term) && $term) {
                            $source_cat_names[] = $term->name;
                        }
                    }

                    if (!empty($source_cat_names)) {
                        $target_relations[] = sprintf(
                            __('Product "%1$s" is auto-added when products from %2$s are added', 'product-estimator'),
                            '<strong>' . esc_html($product->get_name()) . '</strong>',
                            '<strong>' . esc_html(implode(', ', $source_cat_names)) . '</strong>'
                        );
                    }
                }
            }
        }

        $output = '';

        if (!empty($source_relations)) {
            $output .= '<div class="estimator-source-relations">';
            $output .= implode('<br>', $source_relations);
            $output .= '</div>';
        }

        if (!empty($target_relations)) {
            if (!empty($output)) {
                $output .= '<hr style="margin: 5px 0;">';
            }
            $output .= '<div class="estimator-target-relations">';
            $output .= implode('<br>', $target_relations);
            $output .= '</div>';
        }

        if (empty($output)) {
            $output = __('None', 'product-estimator');
        }

        return $output;
    }

    /**
     * Get all product additions
     *
     * @return array The product additions.
     */
    public function get_product_additions() {
        return get_option('product_estimator_product_additions', array());
    }

    /**
     * Get relations for a specific category
     *
     * @param int $category_id The category ID.
     * @param string $relation_type The relation type (auto_add_by_category or empty for all).
     * @return array The product additions.
     */
    public function get_relations_for_category($category_id, $relation_type = '') {
        $relations = $this->get_product_additions();
        $product_additions = array();

        foreach ($relations as $relation_id => $relation) {
            // Handle source_category as array
            $source_categories = isset($relation['source_category']) ? (array) $relation['source_category'] : array();

            if (in_array($category_id, $source_categories)) {
                if (empty($relation_type) || $relation['relation_type'] === $relation_type) {
                    $product_additions[$relation_id] = $relation;
                }
            }
        }

        return $product_additions;
    }

    /**
     * Get auto-add product for categories
     *
     * This method returns products that should be automatically added
     * when a product from the specified category is added to an estimate.
     *
     * @param int $category_id The category ID.
     * @return array Array of product IDs to auto-add.
     */
    public function get_auto_add_products_for_category($category_id) {
        $relations = $this->get_relations_for_category($category_id, 'auto_add_by_category');
        $product_ids = array();

        foreach ($relations as $relation) {
            if (isset($relation['product_id']) && $relation['product_id'] > 0) {
                $product_ids[] = $relation['product_id'];
            }
        }

        return array_unique($product_ids);
    }


}
