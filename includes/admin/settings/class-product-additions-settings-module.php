<?php
// File: class-product-additions-settings-module.php (Refactored)
namespace RuDigital\ProductEstimator\Includes\Admin\Settings;

/**
 * Product Additions Settings Module
 *
 * This module manages rules for product relationships, automatically adding
 * related products, notes, or suggesting products based on category relationships.
 *
 * This is a concrete implementation of the settings module hierarchy:
 * SettingsModuleBase → SettingsModuleWithVerticalTabsBase → SettingsModuleWithTableBase → ProductAdditionsSettingsModule
 *
 * Key functionality:
 * - Manages rules for automatic product additions
 * - Handles rule-based product suggestions
 * - Supports automatic note addition based on product categories
 * - Provides a WooCommerce product search integration
 * - Renders rules in a tabular format with CRUD operations
 *
 * @since      1.0.0
 * @package    ProductEstimator
 * @subpackage ProductEstimator/Admin/Settings
 */
final class ProductAdditionsSettingsModule extends SettingsModuleWithTableBase implements SettingsModuleInterface
{
    /**
     * Option name in WordPress options table where all settings are stored
     * This is the key in wp_options for this module's settings collection
     */
    protected $option_name = 'product_estimator_product_additions';

    /**
     * Cache for product categories to prevent multiple taxonomy queries
     * Populated in get_item_form_fields_definition() when needed
     */
    private $product_categories = null;

    /**
     * Callback for rendering the section description
     *
     * This function is called by WordPress when rendering the settings section.
     * It outputs the descriptive text that appears at the top of the section.
     *
     * @return void
     */
    public function your_section_callback_function() {
        echo '<p>' . esc_html__('These are the general settings for Product Additions.', 'product-estimator') . '</p>';
        echo '<p>' . esc_html__('Configure global behavior for product additions, suggestions, and notes.', 'product-estimator') . '</p>';
    }

    /**
     * Determines if this module handles a specific setting key
     *
     * This method is crucial for the validation process as it identifies which
     * settings keys belong to this module. It handles two types of keys:
     *
     * 1. Settings fields from the WordPress Settings API (e.g., 'my_pa_setting_field_id')
     * 2. Table items which typically have a prefix specific to their type (e.g., 'rel_')
     *
     * Without this method, the module wouldn't know which settings to validate
     * when save operations occur through the Settings API or custom AJAX handlers.
     *
     * @since 1.0.0
     * @param string $key The setting key to check
     * @return boolean True if this module handles the setting key
     */
    public function has_setting($key) {
        // Check if it's a general setting field
        if ($key === 'my_pa_setting_field_id') {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('Product Additions: has_setting: TRUE for ' . $key);
            }
            return true;
        }

        // Check if it's a table item - item keys typically start with 'rel_' prefix
        if (is_string($key) && strpos($key, 'rel_') === 0) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('Product Additions: has_setting: TRUE for table item ' . $key);
            }
            return true;
        }

        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('Product Additions: has_setting: FALSE for ' . $key);
        }
        return false;
    }

    /**
     * Custom rendering for the product search component
     *
     * This callback creates a specialized UI component for searching and selecting
     * WooCommerce products. It includes:
     *
     * 1. A search input with autocomplete functionality
     * 2. A results container for displaying matching products
     * 3. A hidden input to store the selected product ID
     * 4. A display area showing the currently selected product
     * 5. A clear button to reset the selection
     *
     * The component uses AJAX to fetch product results as the user types.
     *
     * @param array      $field_args     Field definition from get_item_form_fields_definition()
     * @param string|int $current_value  Currently selected product ID (if any)
     * @return void      Outputs the complete HTML for the component
     */
    public function render_product_search_component_callback($field_args, $current_value) {
        $base_html_id = esc_attr($field_args['attributes']['id'] ?? $field_args['id']); // Will be 'product_id'

        $search_input_id = $base_html_id . '_search_input';   // product_id_search_input
        $search_results_id = $base_html_id . '_search_results'; // product_id_search_results
        $hidden_input_id = $base_html_id;                     // product_id
        $selected_display_id = $base_html_id . '_selected_display'; // product_id_selected_display

        $hidden_input_name = esc_attr($field_args['id']); // 'product_id'

        $placeholder = $field_args['placeholder'] ?? __('Search products...', 'product-estimator');
        $product_name_display = '';
        $current_product_id = $current_value;

        if (!empty($current_product_id) && function_exists('wc_get_product')) {
            $product = wc_get_product($current_product_id);
            if ($product) {
                $product_name_display = $product->get_formatted_name();
            } else {
                $product_name_display = __('Product not found', 'product-estimator') . ' (ID: ' . esc_html($current_product_id) . ')';
            }
        }

        // Use the class from attributes for the main wrapper
        $wrapper_class = esc_attr($field_args['attributes']['class'] ?? 'pe-product-search-component-wrapper-main');
        echo '<div class="' . $wrapper_class . '" data-field-id="' . esc_attr($hidden_input_id) . '">';

        echo '<input type="text" id="' . esc_attr($search_input_id) . '" placeholder="' . esc_attr($placeholder) . '" autocomplete="off" class="product-search-input widefat pe-item-form-field">';
        echo '<div id="' . esc_attr($search_results_id) . '" class="product-search-results" style="display:none;"></div>';
        echo '<input type="hidden" id="' . esc_attr($hidden_input_id) . '" name="' . esc_attr($hidden_input_name) . '" value="' . esc_attr($current_product_id) . '">';
        echo '<div id="' . esc_attr($selected_display_id) . '" class="selected-product-display pe-item-form-field" style="' . (empty($current_product_id) ? 'display:none;' : '') . '">';
        echo '<span class="selected-product-info">';
        if (!empty($current_product_id)) {
            echo '<strong>' . esc_html($product_name_display) . '</strong> (ID: ' . esc_attr($current_product_id) . ')';
        }
        echo '</span>';
        echo ' <button type="button" class="button-link clear-product-button">' . esc_html__('Clear', 'product-estimator') . '</button>';
        echo '</div>';
        echo '</div>';
    }

    /**
     * Renders the content for table cells
     *
     * This method generates the HTML content for each cell in the table based on
     * the column name and item data. It formats each piece of data appropriately
     * for display in the admin UI.
     *
     * Column handling:
     * - source_categories: Shows comma-separated list of category names
     * - action_type: Displays a formatted action label with CSS class
     * - target_details: Shows context-specific data (product name, note excerpt, or category)
     * - item_actions: Shows edit/delete/view buttons
     *
     * @param array  $item        The item data for this row
     * @param string $column_name The column identifier being rendered
     * @return void  Directly outputs HTML for the cell content
     */
    public function render_table_cell_content($item, $column_name)
    {
        $relation_type = $item['relation_type'] ?? '';
        // Note: Feature-based filtering is now done in get_items_for_table for consistency.
        // If an item makes it here, its feature is considered enabled or not applicable.

        switch ($column_name) {
            case 'source_categories':
                $source_names = [];
                $source_category_ids = isset($item['source_category']) ? (array)$item['source_category'] : [];
                foreach ($source_category_ids as $cat_id) {
                    $term = get_term($cat_id, 'product_cat');
                    if (!is_wp_error($term) && $term) {
                        $source_names[] = $term->name;
                    }
                }
                echo esc_html(implode(', ', $source_names));
                break;
            case 'action_type':
                echo '<span class="relation-type pe-relation-' . esc_attr($relation_type) . '">' . esc_html($this->get_relation_type_label($relation_type)) . '</span>';
                break;
            case 'target_details':
                echo esc_html($this->get_target_details_for_display($item));
                break;
            case 'item_actions':
                echo $this->render_standard_item_actions($item);
                break;
        }
    }

    /**
     * Gets a human-readable label for a relation type
     *
     * This helper method converts the internal relation type key into a
     * user-friendly translated label for display in the UI.
     *
     * The method handles the three standard relation types:
     * - auto_add_by_category: Automatically add specific products
     * - auto_add_note_by_category: Automatically add notes
     * - suggest_products_by_category: Suggest products from a category
     *
     * For any unknown relation types, it falls back to a basic formatted version
     * of the key with underscores replaced by spaces.
     *
     * @param string $relation_type_key The internal relation type key
     * @return string User-friendly translated label
     */
    private function get_relation_type_label($relation_type_key) {
        // Get features object to check if suggested products is enabled
        $features = $this->get_features_object();

        // Debug log feature object when checking for relation type label
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('get_relation_type_label() called for: ' . $relation_type_key);
            error_log('Features object: ' . print_r($features, true));
        }

        // Map of relation type keys to their human-readable labels
        $labels = [
            'auto_add_by_category' => __('Auto-Add Product with Category', 'product-estimator'),
            'auto_add_note_by_category' => __('Auto-Add Note with Category', 'product-estimator'),
        ];

        // Check if the feature is enabled using our wrapper object
        // with direct property access
        $suggested_products_enabled = ($features && isset($features->suggested_products_enabled) && $features->suggested_products_enabled === true);

        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('suggested_products_enabled value: ' . ($suggested_products_enabled ? 'true' : 'false'));
        }

        // Only include suggest_products_by_category if the feature is enabled
        if ($suggested_products_enabled) {
            $labels['suggest_products_by_category'] = __('Suggest Products when Category', 'product-estimator');
        }

        // Return the mapped label or format the key as a fallback
        return $labels[$relation_type_key] ?? ucfirst(str_replace('_', ' ', $relation_type_key));
    }

    /**
     * Formats the target details for display in the table
     *
     * This helper method generates the appropriate display text for the "Target/Note"
     * column based on the relation type. The content varies depending on the type:
     *
     * - For auto_add_by_category: Shows the product name
     * - For auto_add_note_by_category: Shows a trimmed excerpt of the note text
     * - For suggest_products_by_category: Shows the target category name
     *
     * Each type has appropriate error handling for missing data.
     *
     * @param array $item The rule item data
     * @return string Formatted HTML-safe display text
     */
    private function get_target_details_for_display(array $item) {
        $relation_type = $item['relation_type'] ?? '';

        // For auto-add product rules, show the product name
        if ($relation_type === 'auto_add_by_category' && !empty($item['product_id'])) {
            $product = wc_get_product($item['product_id']);
            return $product
                ? esc_html($product->get_name())
                : __('Product not found', 'product-estimator');
        }
        // For auto-add note rules, show a trimmed excerpt of the note
        elseif ($relation_type === 'auto_add_note_by_category' && !empty($item['note_text'])) {
            // Limit to 10 words with ellipsis for long notes
            return esc_html(wp_trim_words($item['note_text'], 10, '...'));
        }
        // For product suggestion rules, show the target category
        elseif ($relation_type === 'suggest_products_by_category' && !empty($item['target_category'])) {
            $target_cat = get_term($item['target_category'], 'product_cat');
            return ($target_cat && !is_wp_error($target_cat))
                ? esc_html($target_cat->name . ' (Category)')
                : __('Category not found', 'product-estimator');
        }

        // Fallback for unknown or empty relation types
        return '';
    }

    /**
     * Enqueue module-specific scripts and styles.
     *
     * @since X.X.X (Refactored to use provide_script_data_for_localization)
     */
    public function enqueue_scripts()
    {
        // Enqueue Select2 JS
        wp_enqueue_script('select2', 'https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js', array('jquery'), '4.1.0-rc.0', true);

        // This single call handles getting common data, module-specific data, merging, and localizing.
        // It relies on get_common_table_script_data() from SettingsModuleWithTableBase,
        // get_module_specific_script_data() and get_js_context_name() from this class.
        $this->provide_script_data_for_localization();

        // If ProductAdditionsSettingsModule has its own JS file (e.g., ProductAdditionsSettingsModule.js)
        // it should be enqueued here. This JS file would then use 'productAdditionsSettings' global object.
        // Example:
        // wp_enqueue_script(
        //     $this->plugin_name . '-product-additions-module',
        //     PRODUCT_ESTIMATOR_PLUGIN_URL . 'admin/js/modules/ProductAdditionsSettingsModule.js', // Ensure path is correct
        //     [$this->plugin_name . '-admin', 'select2', 'admin-table-manager'], // Dependencies
        //     $this->version,
        //     true
        // );
    }


    // The render_form_fields($item = null) method is now inherited from SettingsModuleWithTableBase
    // and will use the definition from get_item_form_fields_definition().

    public function enqueue_styles() {
        parent::enqueue_styles(); // From SettingsModuleWithTableBase, enqueues admin-tables.css

        wp_enqueue_style(
            'select2-css', // Handle for Select2 CSS
            'https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css',
            array(),
            '4.1.0-rc.0'
        );

        // Your module-specific CSS (if it exists and has content)
        wp_enqueue_style(
            $this->plugin_name . '-product-additions-settings',
            PRODUCT_ESTIMATOR_PLUGIN_URL . 'admin/css/modules/product-additions-settings.css',
            [$this->plugin_name . '-admin-tables', 'select2-css'], // Depends on admin-tables and select2-css
            $this->version
        );
    }

    public function render_section_description()
    {
        // This description appears above the vertical tab navigation (if this module is the primary one)
        // or as part of the main settings page structure.
        // Since ProductAdditionsSettingsModule now renders within a tab, this might not be directly visible
        // unless the main settings page explicitly calls it for the 'product_additions' main tab.
        // The description for the *vertical tab itself* is set in get_vertical_tabs().
        echo '<p>' . esc_html__('Define rules to automatically add related products or notes, or suggest alternative products, based on the categories of items added to an estimate.', 'product-estimator') . '</p>';
    }

/**
     * AJAX handler for product search functionality
     *
     * This method processes AJAX requests for the product search autocomplete component.
     * It searches WooCommerce products based on:
     * 1. A search term (partial product name)
     * 2. A specific product category
     *
     * The search is performed using WP_Query with a taxonomy filter for the category,
     * and the results are formatted for display in the autocomplete dropdown.
     *
     * Security:
     * - Verifies nonce to prevent CSRF
     * - Validates required parameters
     * - Sanitizes all input
     *
     * @since 1.0.0
     * @return void Sends JSON response and terminates execution
     */
    public function ajax_handle_product_search_for_additions() {
        // Nonce check - Use the nonce that JS is sending for 'search_products'
        // The JS is sending this.settings.nonce which is from get_nonce_action_base() . '_nonce'
        // ('product_estimator_pa_items_nonce')
        // OR, if this is a more general search, you might use a general settings nonce, but be consistent.
        // Let's assume the 'productAdditionsSettings.nonce' is appropriate.
        check_ajax_referer($this->get_nonce_action_base() . '_nonce', 'nonce'); // Matches JS

        // Script data sends 'search' and 'category'
        $search_term = isset($_POST['search']) ? sanitize_text_field(wp_unslash($_POST['search'])) : '';
        $category_id = isset($_POST['category']) ? absint($_POST['category']) : 0; // JS sends 'category'

        if (empty($search_term)) {
            wp_send_json_error(['message' => __('Search term is required.', 'product-estimator')]);
            return;
        }
        if (empty($category_id)) { // Product search is per category in your JS logic
            wp_send_json_error(['message' => __('Target category is required for product search.', 'product-estimator')]);
            return;
        }

        $args = [
            'post_type' => 'product',
            'post_status' => 'publish',
            's' => $search_term,
            'posts_per_page' => 20, // Or a configurable limit
            // Filter by category
            'tax_query' => array(
                array(
                    'taxonomy' => 'product_cat',
                    'field'    => 'term_id',
                    'terms'    => $category_id,
                ),
            ),
        ];

        $product_query = new \WP_Query($args);
        $products_found = [];

        if ($product_query->have_posts()) {
            while ($product_query->have_posts()) {
                $product_query->the_post();
                $product = wc_get_product(get_the_ID());
                if ($product) {
                    $products_found[] = [
                        'id'   => $product->get_id(),
                        // JS expects 'name' for the display text in the list item
                        'name' => $product->get_name(), // wc_get_product()->get_name() is simpler
                    ];
                }
            }
            wp_reset_postdata();
        }
        // The JS is trying to access response.data.products OR response.products
        // wp_send_json_success wraps data in a 'data' key.
        // So, we should send an object with a 'products' key.
        wp_send_json_success(['products' => $products_found]);
    }

    protected function get_nonce_action_base()
    {
        // This nonce is used for the item CRUD operations (add, update, delete, get)
        // It should be unique to this module's item management.
        return 'product_estimator_pa_items'; // Changed from 'product_estimator_product_additions' to be more specific for items
    }

    /**
     * Configure the module's tab details
     *
     * This method sets the identifiers and titles for this module within the
     * main settings page. These values are used in:
     * - URL parameters for navigation
     * - HTML IDs for DOM targeting
     * - Display titles in the UI
     * - WordPress settings API section registration
     *
     * @return void
     */
    protected function set_tab_details()
    {
        // Main tab identifier in the settings page
        $this->tab_id = 'product_additions';

        // Display title for the main tab
        $this->tab_title = __('Product Additions', 'product-estimator');

        // Section identifier for WordPress settings API
        $this->section_id = 'product_additions_rules_section';

        // Title used for the section and vertical tab
        $this->section_title = __('Product Relationship Rules', 'product-estimator');
    }

    /**
     * Defines the vertical tabs structure for this module
     *
     * This method configures the left-side vertical tab navigation for the module.
     * Each tab can display different types of content: tables, settings forms, or custom content.
     *
     * This product additions module has two tabs:
     * 1. Main rules table - Displays the CRUD interface for relationship rules
     * 2. General settings - Contains general configuration options for product additions
     *
     * The 'content_type' value determines how each tab's content is rendered:
     * - 'table': Uses render_table_content_for_tab() from SettingsModuleWithTableBase
     * - 'settings': Uses the WordPress Settings API with fields from register_vertical_tab_fields()
     * - 'custom': Would require a custom render method for specialized content
     *
     * @return array Array of tab definitions
     */
    protected function get_vertical_tabs() {
        return [
            // Main rules management table tab
            [
                'id'          => 'rules_table_tab',           // Unique ID for this tab panel
                'title'       => $this->section_title,        // Use the main section title for the tab
                'description' => __('Manage rules for product additions and suggestions based on categories.', 'product-estimator'),
                'content_type'=> 'table',                     // This tab displays table-based content
            ],

            // Additional settings tab for general configuration options
            [
                'id'          => 'pa_general_settings',       // Unique ID for this settings tab
                'title'       => __('General PA Settings', 'product-estimator'),
                'content_type'=> 'settings',                  // This tab displays WordPress settings fields
            ],
        ];
    }

    /**
     * Registers WordPress settings fields for vertical tabs
     *
     * This method is called by SettingsModuleWithVerticalTabsBase for each vertical tab
     * to register settings fields with the WordPress Settings API. The fields are rendered
     * automatically when a tab with 'content_type' => 'settings' is active.
     *
     * Each tab can have its own sections and fields:
     * - For 'rules_table_tab', no settings are needed as it uses table display
     * - For 'pa_general_settings', we register standard WordPress settings fields
     *
     * The registration process has three components:
     * 1. Register a settings section using add_settings_section()
     * 2. Register individual fields with add_settings_field()
     * 3. Store field data in the module using store_field_for_sub_tab()
     *
     * @param string $vertical_tab_id     Current tab ID being registered
     * @param string $page_slug_for_wp_api Page slug for WordPress Settings API
     * @return void
     */
    protected function register_vertical_tab_fields($vertical_tab_id, $page_slug_for_wp_api) {
        // The table-type tab doesn't need WordPress settings fields
        if ($vertical_tab_id === 'rules_table_tab') {
            // No settings fields to register - table content is handled separately
            // via render_table_content_for_tab() from SettingsModuleWithTableBase
            return;
        }

        // Register fields for the general settings tab
        if ($vertical_tab_id === 'pa_general_settings') {
            // Create a unique section ID by combining the base section ID with a suffix
            $section_id = $this->section_id . '_pa_general';

            // Register the settings section
            add_settings_section(
                $section_id,                                          // Section ID
                __('General Settings Section Title', 'product-estimator'), // Section title
                [$this, 'your_section_callback_function'],            // Section description callback
                $page_slug_for_wp_api                                 // Page slug
            );

            // Define a checkbox field with all necessary properties
            $field_args_for_general = [
                'id'          => 'my_pa_setting_field_id',            // Field ID in the database
                'title'       => __('Enable Feature X', 'product-estimator'), // Field title
                'type'        => 'checkbox',                           // Field type (checkbox, text, select, etc.)
                'description' => __('Tick to enable Feature X for product additions.', 'product-estimator'),
                'default'     => '0',                                  // Default value if not set
                'option_name' => $this->option_name,                   // Option name for data storage
                'attributes'  => [
                    'id' => 'my_pa_setting_field_id_html'             // HTML element ID attribute
                ],
                'checkbox_label' => __('Enable this awesome feature', 'product-estimator') // Label next to checkbox
            ];

            // Register the field with WordPress Settings API
            add_settings_field(
                'my_pa_setting_field_id',                             // Field ID
                __('Enable Feature X Label', 'product-estimator'),     // Field label in the UI
                [$this, 'render_field'],                              // Callback to render the field
                $page_slug_for_wp_api,                                // Page slug
                $section_id,                                          // Section ID this field belongs to
                $field_args_for_general                               // Field arguments
            );

            // Store field data in module for validation and form handling
            $this->store_field_for_sub_tab($vertical_tab_id, 'my_pa_setting_field_id', $field_args_for_general);

            // Debug logging to help troubleshoot field registration
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('Product Additions: Stored field for tab ' . $vertical_tab_id . ': my_pa_setting_field_id');
                error_log('Product Additions: Field args: ' . print_r($field_args_for_general, true));
            }
        }
    }

    protected function get_items_for_table()
    {
        $items = get_option($this->option_name, array());
        // Filter out items for disabled features before display
        $features = $this->get_features_object();
        $processed_items = [];

        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('get_items_for_table() - Features object: ' . print_r($features, true));
        }

        if (is_array($items)) {
            foreach ($items as $id => $item_data) {
                if (!is_array($item_data)) continue; // Skip malformed items

                // Ensure item_data has an 'id' key, using array key if necessary (though items should store their own ID)
                if (!isset($item_data['id'])) {
                    $item_data['id'] = $id;
                }

                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log('Processing item: ' . print_r($item_data, true));
                }

                // Skip suggest_products_by_category items if the feature is disabled
                // Use the direct property access on our wrapper object
                $suggested_products_enabled = ($features && isset($features->suggested_products_enabled) && $features->suggested_products_enabled === true);

                if (isset($item_data['relation_type']) &&
                    $item_data['relation_type'] === 'suggest_products_by_category' &&
                    !$suggested_products_enabled) {

                    if (defined('WP_DEBUG') && WP_DEBUG) {
                        error_log('Skipping item due to disabled feature: ' . $item_data['id']);
                    }

                    continue; // Skip this item if the feature is disabled
                }

                $processed_items[$item_data['id']] = $item_data; // Re-key by actual item ID
            }
        }
        return $processed_items;
    }

    /**
     * Gets the product estimator features configuration object
     *
     * This private helper method returns the plugin's feature flags configuration.
     * It uses the global product_estimator_features() function if available,
     * or falls back to default values if the function isn't defined.
     *
     * The method uses static caching to ensure the feature object is only
     * fetched once per request, improving performance when called multiple times.
     *
     * Feature flags control which functionalities are available:
     * - suggested_products_enabled: Controls whether product suggestions are available
     * - Other feature flags may be added in the future
     *
     * @return object Object containing feature flag properties
     */
    private function get_features_object()
    {
        // Static variable persists between method calls for caching
        static $features_obj = null;

        // Debug log
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('ProductAdditionsSettingsModule::get_features_object() called');
        }

        // Only fetch the features once per request
        if ($features_obj === null) {
            // Create a simple object with the feature flags
            $features_obj = new \stdClass();

            // Get features directly from the WordPress option
            $feature_settings = get_option('product_estimator_feature_switches', []);

            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('Feature settings from option: ' . print_r($feature_settings, true));
            }

            // Set the suggested_products_enabled property
            $suggested_products_value = isset($feature_settings['suggested_products_enabled']) ? $feature_settings['suggested_products_enabled'] : 0;
            $features_obj->suggested_products_enabled = ($suggested_products_value == 1);

            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('suggested_products_enabled raw value: ' . $suggested_products_value);
                error_log('suggested_products_enabled set to: ' . ($features_obj->suggested_products_enabled ? 'true' : 'false'));
            }
        }

        return $features_obj;
    }

    /**
     * Defines the columns displayed in the table
     *
     * This method specifies what columns appear in the rules table and their headers.
     * The keys are used in render_table_cell_content() to identify which column
     * is being rendered.
     *
     * Column structure:
     * - 'source_categories': Categories that trigger the rule
     * - 'action_type': The type of action (auto-add, suggest, note)
     * - 'target_details': The result of the action (product, note content, etc.)
     * - 'item_actions': Edit/Delete buttons for each row
     *
     * @return array Associative array of column identifiers and display labels
     */
    protected function get_table_columns()
    {
        return [
            'source_categories' => __('Source Categories', 'product-estimator'),  // Displays category names
            'action_type'       => __('Action', 'product-estimator'),             // Shows action type
            'target_details'    => __('Target/Note', 'product-estimator'),        // Shows target product or note text
            'item_actions'      => __('Actions', 'product-estimator'),            // Shows action buttons
        ];
    }

    /**
     * Prepares item data for populating the edit form
     *
     * This method formats an item's data specifically for displaying in the
     * edit form fields. It performs two key operations:
     *
     * 1. Adds additional display data for special fields:
     *    - For product fields, it adds the product name for display
     *
     * 2. Ensures all form fields have at least a default value:
     *    - Checks against get_item_form_fields_definition()
     *    - Ensures multi-select fields get empty arrays instead of empty strings
     *    - Applies default values from field definitions
     *
     * This method is called by handle_ajax_get_item() when an item is being
     * loaded for editing.
     *
     * @param array $item_data The raw item data from the database
     * @return array Prepared data with all required fields for the form
     */
    protected function prepare_item_for_form_population(array $item_data) {
        // Safety check for malformed data
        if (!is_array($item_data)) {
            return [];
        }

        // For auto-add rules, get the product name for display in the form
        if (!empty($item_data['product_id']) &&
            isset($item_data['relation_type']) &&
            $item_data['relation_type'] === 'auto_add_by_category') {

            // Use WooCommerce function to get product details
            $product = wc_get_product($item_data['product_id']);
            if ($product) {
                // Store formatted name for the product search component to display
                $item_data['product_name_display'] = $product->get_formatted_name();
            } else {
                $item_data['product_name_display'] = __('Product not found', 'product-estimator');
            }
        }

        // Ensure all expected form fields have values
        // This prevents JS errors when populating the form
        $field_defs = $this->get_item_form_fields_definition();
        foreach($field_defs as $def) {
            if (!isset($item_data[$def['id']])) {
                // Set appropriate default values based on field type
                if ($def['type'] === 'select' && !empty($def['attributes']['multiple'])) {
                    // Multi-select fields should default to empty array
                    $item_data[$def['id']] = [];
                } else {
                    // Standard fields get their default or empty string
                    $item_data[$def['id']] = $def['default'] ?? '';
                }
            }
        }

        return $item_data;
    }

    /**
     * Defines the structure of the add/edit item form fields.
     * This is used by SettingsModuleWithTableBase::render_form_fields().
     */
    protected function get_item_form_fields_definition() {
        if ($this->product_categories === null) {
            $this->product_categories = get_terms(['taxonomy' => 'product_cat', 'hide_empty' => false, 'fields' => 'id=>name']);
        }
        $features = $this->get_features_object();

        $action_type_options = [
            '' => __('-- Select Action Type --', 'product-estimator'),
            'auto_add_by_category' => __('Auto-Add Product with Category', 'product-estimator'),
            'auto_add_note_by_category' => __('Auto-Add Note with Category', 'product-estimator'),
        ];

        // Debug feature switches
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('Feature Switches Debug in ProductAdditionsSettingsModule::get_item_form_fields_definition()');
            error_log('Raw feature switches object: ' . print_r($features, true));
        }

        // Check if suggested products feature is enabled
        // We're now using a direct property on our wrapper object
        $suggested_products_enabled = ($features && isset($features->suggested_products_enabled) && $features->suggested_products_enabled === true);

        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('suggested_products_enabled value: ' . ($suggested_products_enabled ? 'true' : 'false'));
        }

        // Only include the suggest_products_by_category option if the feature is enabled
        if ($suggested_products_enabled) {
            error_log('Adding suggest_products_by_category option to action_type_options');
            $action_type_options['suggest_products_by_category'] = __('Suggest Products when Category', 'product-estimator');
        }

        $fields = [
            ['id' => 'item_id', 'type' => 'hidden'], // Standard hidden ID for the item

            [
                'id' => 'relation_type',
                'label' => __('Action Type', 'product-estimator'),
                'type' => 'select',
                'options' => $action_type_options,
                'required' => true,
                'attributes' => ['class' => 'relation-type-select pe-item-form-field'],
            ],
            [
                'id' => 'source_category',
                'label' => __('Source Categories', 'product-estimator'),
                'type' => 'select',
                'options' => $this->product_categories,
                'required' => true,
                'attributes' => [
                    'multiple' => true,
                    'style' => 'width:100%;',
                    'class' => 'pe-select2 source-category-select pe-item-form-field',
                ],
                'description' => __('Select one or more source product categories.', 'product-estimator'),
            ],
            [
                'id' => 'target_category',
                'label' => __('Target Category (for Suggestions/Auto-Add)', 'product-estimator'),
                'type' => 'select',
                'options' => $this->product_categories,
                'placeholder' => __('-- Select Target Category --', 'product-estimator'),
                'attributes' => [
                    'style' => 'width:100%;',
                    'class' => 'pe-select2 target-category-select pe-item-form-field',
                ],
                'row_class' => 'target-category-row',
                'description' => __('Select the category of products to suggest or auto-add from.', 'product-estimator'),
            ],
            [
                'id' => 'product_id', // This is the field ID for the selected product's ID
                'label' => __('Product to Auto-Add', 'product-estimator'),
                'type' => 'custom_callback', // IMPORTANT: Must be 'custom_callback'
                'render_callback' => 'render_product_search_component_callback', // IMPORTANT: Exact name of your callback method
                'attributes' => [
                    'class' => 'pe-product-search-component-wrapper-main', // Class for the outermost div rendered by callback
                ],
                'placeholder' => __('Search products...', 'product-estimator'),
                'row_class' => 'product-search-row',
                'description' => __('Search and select the product to automatically add.', 'product-estimator'),
            ],
            [
                'id' => 'note_text',
                'label' => __('Note Text', 'product-estimator'),
                'type' => 'textarea',
                'attributes' => ['rows' => 4, 'cols' => 50, 'class' => 'pe-item-form-field widefat'],
                'row_class' => 'note-row',
                'description' => __('Enter the note to be automatically added.', 'product-estimator'),
            ]
        ];
        return $fields;
    }

    // class-product-additions-settings-module.php

    /**
     * Returns the unique JavaScript context name for this module's settings.
     *
     * @since    X.X.X
     * @access   protected
     * @return   string The JavaScript context name.
     */
    protected function get_js_context_name() {
        return 'productAdditionsSettings';
    }

    /**
     * Returns an array of script data specific to this module.
     * This data will be merged with common data from the parent class.
     *
     * @since    X.X.X
     * @access   protected
     * @return   array Associative array of module-specific script data.
     */
    protected function get_module_specific_script_data() {
        $features = $this->get_features_object();
        $base_product_search_id = 'product_id'; // Corresponds to the field ID in get_item_form_fields_definition

        // Debug log the features object
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('ProductAdditionsSettingsModule::get_module_specific_script_data() - Features object:');
            error_log(print_r($features, true));
            if ($features) {
                error_log('suggested_products_enabled value for JS: ' .
                    (property_exists($features, 'suggested_products_enabled') && $features->suggested_products_enabled ? 'true' : 'false'));
            }
        }

        // Data that is unique to ProductAdditionsSettingsModule or overrides from common table data
        return [
            // 'option_name', 'tab_id', 'item_id_key', 'nonce' for CRUD are inherited from get_common_table_script_data()
            'actions' => [
                // Item CRUD actions (add_item, update_item, etc.) are inherited.
                // Add only custom actions for this module:
                'search_products' => 'pe_search_products_for_additions', // AJAX action for product search
            ],
            'selectors' => [
                // Generic table selectors (formContainer, addButton etc.) are inherited.
                // Add/Override only selectors specific to ProductAdditions UI:
                'relationTypeSelect'     => '#relation_type', // ID of the select field
                'sourceCategorySelect'   => '#source_category',
                'targetCategorySelect'   => '#target_category',
                'noteTextInput'          => '#note_text',
                // Selectors for the custom product search component
                'productSearchInput'     => '#' . $base_product_search_id . '_search_input',
                'productSearchResults'   => '#' . $base_product_search_id . '_search_results',
                'selectedProductIdInput' => '#' . $base_product_search_id, // The hidden input storing the ID
                'selectedProductDisplay' => '#' . $base_product_search_id . '_selected_display',
                'clearProductButton'     => '#' . $base_product_search_id . '_selected_display .clear-product-button',
                // Row visibility selectors
                'targetCategoryRow'      => '.target-category-row',
                'productSearchRow'       => '.product-search-row',
                'noteRow'                => '.note-row',
            ],
            'i18n' => [
                // Common item i18n (confirmDelete, itemSavedSuccess etc.) are inherited.
                // Add/Override only i18n specific to ProductAdditions:
                'itemSavedSuccess'       => __('Rule saved successfully.', 'product-estimator'),
                'itemDeletedSuccess'     => __('Rule deleted successfully.', 'product-estimator'),
                'errorSavingItem'        => __('Error saving addition.', 'product-estimator'),
                'errorDeletingItem'      => __('Error deleting addition.', 'product-estimator'),
                'errorLoadingItem'       => __('Error loading addition details.', 'product-estimator'),
                'saveChangesButton'      => __('Save Addition', 'product-estimator'),
                'updateChangesButton'    => __('Update Addition', 'product-estimator'),
                'searching'              => __('Searching...', 'product-estimator'),
                'noProductsFound'        => __('No products found matching your criteria.', 'product-estimator'),
                'errorSearching'         => __('Error occurred while searching products.', 'product-estimator'),
                'selectAnOption'         => __('-- Select an Option --', 'product-estimator'),
                'selectAction'           => __('Please select an action type for the rule.', 'product-estimator'),
                'selectSourceCategories' => __('Please select at least one source product category.', 'product-estimator'),
                'selectTargetCategory'   => __('Please select a target product category.', 'product-estimator'),
                'selectProduct'          => __('Please search and select a product.', 'product-estimator'),
                'noteTextRequired'       => __('The note text cannot be empty for this action type.', 'product-estimator'),
            ],
            'feature_flags' => [ // Module-specific flags for JS logic
                'suggested_products_enabled' => ($features && isset($features->suggested_products_enabled) && $features->suggested_products_enabled === true),
            ]
        ];
    }

    protected function register_hooks()
    {
        parent::register_hooks(); // Registers AJAX for item CRUD from SettingsModuleWithTableBase using get_nonce_action_base()

        // AJAX handler for the custom product search component
        add_action('wp_ajax_pe_search_products_for_additions', array($this, 'ajax_handle_product_search_for_additions')); // Renamed handler too for clarity
        add_action('wp_ajax_get_product_details', array($this, 'ajax_get_product_details'));

        // Note: If get_product_details is only for populating search result display, its nonce should be checked too.
        // The main 'get_item' AJAX action (pe_table_product_additions_get_item) is for populating the whole edit form.
    }

    /**
     * Validates product addition rule data
     *
     * This method validates and sanitizes rule data before it is saved.
     * The validation is context-sensitive based on the rule type:
     *
     * 1. For all rules:
     *    - Source categories must be valid category IDs
     *    - Relation type must be a valid option
     *
     * 2. Relation-specific validation:
     *    - auto_add_by_category: Requires a valid product ID
     *    - suggest_products_by_category: Requires a valid target category ID
     *    - auto_add_note_by_category: Requires non-empty note text
     *
     * 3. Feature-based validation:
     *    - Confirms feature flags match rule types (for suggested products)
     *
     * @param array      $raw_item_data     The unvalidated form data
     * @param string|int $item_id           The ID of item being edited (null for new)
     * @param array      $original_item_data The original item data (for edits)
     * @return array|WP_Error               Validated data or error object
     */
    protected function validate_item_data(array $raw_item_data, $item_id = null, $original_item_data = null)
    {
        $sanitized_data = [];
        $errors = new \WP_Error();

        // Source Categories (array of IDs)
        $source_categories_input = $raw_item_data['source_category'] ?? [];
        if (!is_array($source_categories_input)) {
            $source_categories_input = !empty($source_categories_input) ? array_map('trim', explode(',', $source_categories_input)) : [];
        }
        $sanitized_data['source_category'] = array_values(array_unique(array_filter(array_map('absint', $source_categories_input))));
        if (empty($sanitized_data['source_category'])) {
            $errors->add('missing_source_category', __('Please select at least one source category.', 'product-estimator'));
        }

        // Relation Type (string)
        $sanitized_data['relation_type'] = isset($raw_item_data['relation_type']) ? sanitize_text_field($raw_item_data['relation_type']) : '';
        if (empty($sanitized_data['relation_type'])) {
            $errors->add('missing_relation_type', __('Action type is required.', 'product-estimator'));
        }

        // Target Category (single ID or 0)
        $sanitized_data['target_category'] = isset($raw_item_data['target_category']) ? absint($raw_item_data['target_category']) : 0;
        // Product ID (single ID or 0)
        $sanitized_data['product_id'] = isset($raw_item_data['product_id']) ? absint($raw_item_data['product_id']) : 0;
        // Note Text (string)
        $sanitized_data['note_text'] = isset($raw_item_data['note_text']) ? sanitize_textarea_field(trim($raw_item_data['note_text'])) : '';

        $features = $this->get_features_object();

        // Conditional validation based on relation_type
        switch ($sanitized_data['relation_type']) {
            case 'auto_add_by_category':
                // Target category is not strictly required if product implies it, but product_id is.
                if (empty($sanitized_data['product_id'])) {
                    $errors->add('missing_product', __('Please select a product to auto-add.', 'product-estimator'));
                }
                break;
            case 'suggest_products_by_category':
                // Check for feature enabled status using direct property access
                $suggested_products_enabled = ($features && isset($features->suggested_products_enabled) && $features->suggested_products_enabled === true);

                if ($suggested_products_enabled) {
                    if (empty($sanitized_data['target_category'])) {
                        $errors->add('missing_target_category_for_suggest', __('Please select a target category for suggestions.', 'product-estimator'));
                    }
                } else {
                    $errors->add('feature_disabled_suggest', __('Suggest products feature is currently disabled. This rule cannot be saved.', 'product-estimator'));

                    if (defined('WP_DEBUG') && WP_DEBUG) {
                        error_log('Validation failed - Suggest products feature is disabled.');
                        error_log('Features object: ' . print_r($features, true));
                    }
                }
                break;
            case 'auto_add_note_by_category':
                if (empty($sanitized_data['note_text'])) {
                    $errors->add('missing_note_text', __('Please enter the note text.', 'product-estimator'));
                }
                break;
        }

        if (!empty($errors->get_error_codes())) {
            return $errors;
        }
        return $sanitized_data;
    }

    protected function prepare_item_for_response(array $saved_item)
    {
        $response_item = $saved_item;

        if (!empty($saved_item['source_category'])) {
            $source_cat_names = array_map(function ($cat_id) {
                $term = get_term($cat_id, 'product_cat');
                return $term && !is_wp_error($term) ? $term->name : null;
            }, (array)$saved_item['source_category']);
            // This key is 'source_category_display'
            $response_item['source_category_display'] = implode(', ', array_filter($source_cat_names));
        } else {
            $response_item['source_category_display'] = '';
        }

        // This key is 'action_type_display'
        $response_item['action_type_display'] = $this->get_relation_type_label($saved_item['relation_type'] ?? '');
        // This key is 'target_details_display'
        $response_item['target_details_display'] = $this->get_target_details_for_display($saved_item);

        if (!empty($saved_item['product_id']) && ($saved_item['relation_type'] === 'auto_add_by_category')) {
            $product = wc_get_product($saved_item['product_id']);
            if ($product) {
                $response_item['product_name_display'] = $product->get_formatted_name();
            }
        }
        return $response_item;
    }

    protected function get_item_management_capability()
    {
        return 'manage_options'; // Or a more specific capability
    }

    // AJAX handler for product search (used by the 'product_search_component' field)

    /**
     * Add custom actions for product addition items
     * This demonstrates how to extend the standard actions
     *
     * @param array $item The item data
     * @return string HTML for additional actions
     */
    protected function get_additional_item_actions($item) {
        // Only add the view action for certain relation types
        if (isset($item['relation_type']) && $item['relation_type'] === 'auto_add_by_category' && !empty($item['product_id'])) {
            return sprintf(
                '<button type="button" class="button button-small pe-view-product-button" data-id="%s" data-product-id="%s">%s</button>',
                esc_attr($item['id']),
                esc_attr($item['product_id']),
                esc_html__('Edit Product', 'product-estimator')
            );
        }
        return '';
    }}
