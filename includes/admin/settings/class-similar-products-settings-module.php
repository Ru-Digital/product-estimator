<?php
namespace RuDigital\ProductEstimator\Includes\Admin\Settings;

/**
 * Similar Products Settings Module
 *
 * Handles settings for defining relationships between product categories and their attributes
 * to display similar products in the product estimator. This module allows administrators to
 * create rules that determine which product attributes should be used to find similar products
 * for specific categories.
 *
 * When a customer adds a product to their estimate, the system uses these rules to identify
 * and suggest similar alternative products based on matching attribute values, enhancing
 * the shopping experience by presenting relevant options.
 *
 * @since      1.0.5
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes/admin/settings
 */
final class SimilarProductsSettingsModule extends SettingsModuleWithTableBase implements SettingsModuleInterface {

    /**
     * Option name for storing similar products settings in the WordPress options table
     *
     * This option stores an array of rules, each defining a relationship between source
     * categories and the product attributes used for finding similar products.
     *
     * @since    1.0.5
     * @access   private
     * @var      string $option_name Option name for settings
     */
    protected $option_name = 'product_estimator_similar_products';

    /**
     * Cached product categories
     *
     * @access private
     * @var array
     */
    private $product_categories = null;


    /**
     * Renders the content for a specific cell in the table
     *
     * @param array  $item        The item data being displayed
     * @param string $column_name The column identifier
     */
    public function render_table_cell_content($item, $column_name) {
        switch ($column_name) {
            case 'source_categories':
                $source_names = [];
                // Handle both new field name and old field name for backward compatibility
                $source_category_ids = isset($item['source_categories']) ? (array)$item['source_categories'] : [];

                // Backward compatibility with source_categories
                if (empty($source_category_ids) && isset($item['source_categories'])) {
                    $source_category_ids = (array)$item['source_categories'];
                }

                // For backward compatibility with old format (single category)
                if (empty($source_category_ids) && isset($item['source_category'])) {
                    $source_category_ids = [(int)$item['source_category']];
                }

                foreach ($source_category_ids as $cat_id) {
                    $term = get_term($cat_id, 'product_cat');
                    if (!is_wp_error($term) && $term) {
                        $source_names[] = $term->name;
                    }
                }
                echo esc_html(implode(', ', $source_names));
                break;

            case 'attributes':
                $attributes = isset($item['attributes']) ? (array)$item['attributes'] : [];
                if (empty($attributes)) {
                    echo '<em>' . esc_html__('None selected', 'product-estimator') . '</em>';
                } else {
                    // Get attribute labels
                    $attribute_labels = [];
                    foreach ($attributes as $attribute) {
                        // Convert attribute name to label (e.g. 'pa_color' to 'Color')
                        $attribute_label = wc_attribute_label('pa_' . $attribute);
                        $attribute_labels[] = $attribute_label;
                    }
                    echo esc_html(implode(', ', $attribute_labels));
                }
                break;

            case 'item_actions':
                echo $this->render_standard_item_actions($item);
                break;
        }
    }

    /**
     * Custom render for the attributes selection field
     *
     * @param array $field_args Field definition
     * @param mixed $current_value Current field value
     * @return void
     */
    public function render_attributes_selection_field($field_args, $current_value) {
        $attributes = [];

        // Convert current value to array if needed
        if (!is_array($current_value)) {
            $current_value = !empty($current_value) ? explode(',', $current_value) : [];
        }

        echo '<div class="product-attributes-to-compare">';
        echo '<h3>' . esc_html__('Product Attributes to Compare', 'product-estimator') . '</h3>';
        echo '<p class="description">' . esc_html__('Select which attributes should be used to determine product similarity.', 'product-estimator') . '</p>';
        echo '</div>';

        // Initialize with loading message - attributes will be loaded via AJAX
        echo '<div class="attributes-selection-container">';
        echo '<div class="attributes-loading">' . esc_html__('Select categories to load available attributes...', 'product-estimator') . '</div>';
        echo '<div class="attributes-list" style="display:none;">';

        // This div will be populated with checkboxes via JavaScript
        echo '</div>';

        // Hidden field to store selected attributes for form submission
        echo '<input type="hidden" name="attributes" class="selected-attributes-input" value="' . esc_attr(implode(',', $current_value)) . '">';
        echo '</div>';
    }

    /**
     * AJAX handler to get product attributes for selected categories
     */
    public function ajax_get_category_attributes() {
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], $this->get_nonce_action_base() . '_nonce')) {
            wp_send_json_error(['message' => __('Security check failed.', 'product-estimator')]);
            return;
        }

        if (!current_user_can('manage_options')) {
            wp_send_json_error(['message' => __('You do not have permission to perform this action.', 'product-estimator')]);
            return;
        }

        // Get category IDs - support for multiple categories
        $category_ids = isset($_POST['category_ids']) && is_array($_POST['category_ids'])
            ? array_map('absint', $_POST['category_ids'])
            : [];

        if (empty($category_ids)) {
            wp_send_json_error(['message' => __('No categories specified.', 'product-estimator')]);
            return;
        }

        // Get attributes for these categories
        $attributes = $this->get_category_product_attributes($category_ids);

        wp_send_json_success([
            'attributes' => $attributes
        ]);
    }

    /**
     * Get the nonce action base for AJAX requests
     *
     * @return string Nonce action base
     */
    protected function get_nonce_action_base() {
        return 'product_estimator_similar_products';
    }

    /**
     * Get product attributes for specific categories
     *
     * @param array $category_ids Array of category IDs
     * @return array List of attributes
     */
    private function get_category_product_attributes($category_ids) {
        if (!is_array($category_ids)) {
            $category_ids = [$category_ids];
        }

        // Query products in these categories
        $args = [
            'post_type'      => 'product',
            'posts_per_page' => 50,
            'tax_query'      => [
                [
                    'taxonomy' => 'product_cat',
                    'field'    => 'term_id',
                    'terms'    => $category_ids,
                    'operator' => 'IN'
                ]
            ]
        ];

        $products = get_posts($args);
        $attributes = [];
        $processed_attributes = [];

        foreach ($products as $product) {
            $product_obj = wc_get_product($product->ID);
            if (!$product_obj) continue;

            $product_attributes = $product_obj->get_attributes();
            foreach ($product_attributes as $attribute_name => $attribute) {
                if (isset($processed_attributes[$attribute_name])) continue;

                $processed_attributes[$attribute_name] = true;
                $attribute_tax_name = str_replace('pa_', '', $attribute_name);
                $attribute_label = wc_attribute_label($attribute_name);

                $attributes[] = [
                    'name'  => $attribute_tax_name,
                    'label' => $attribute_label
                ];
            }
        }

        // Sort attributes by label
        usort($attributes, function ($a, $b) {
            return strcmp($a['label'], $b['label']);
        });

        return $attributes;
    }

    /**
     * Render a section description
     */
    public function render_section_description() {
        echo '<p>' . esc_html__('Configure rules for finding similar products based on product attributes. This allows the estimator to suggest related products to users.', 'product-estimator') . '</p>';
    }

    /**
     * Provide script data for localization
     * This method uses the parent class implementation which leverages shared selectors
     *
     * @return array The combined script data
     */
    public function provide_script_data_for_localization() {
        // Call parent implementation which will properly combine all the data
        // This will use get_common_table_script_data() from SettingsModuleWithTableBase
        // and get_module_specific_script_data() from this class
        return parent::provide_script_data_for_localization();
    }

    /**
     * Enqueue module-specific scripts
     */
    public function enqueue_scripts() {
        // Enqueue Select2
        wp_enqueue_script('select2', 'https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js', array('jquery'), '4.1.0-rc.0', true);

        // This single call handles getting common data, module-specific data, merging, and localizing
        $this->provide_script_data_for_localization();
    }

    /**
     * Enqueue module-specific styles
     */
    public function enqueue_styles() {
        parent::enqueue_styles(); // Enqueues admin-tables.css

        // Select2 CSS
        wp_enqueue_style(
            'select2-css',
            'https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css',
            [],
            '4.1.0-rc.0'
        );

        // Module-specific CSS
        wp_enqueue_style(
            $this->plugin_name . '-similar-products-settings',
            PRODUCT_ESTIMATOR_PLUGIN_URL . 'admin/css/modules/similar-products-settings.css',
            [$this->plugin_name . '-admin-tables', 'select2-css'],
            $this->version
        );
    }

    /**
     * Set the tab and section details for the admin interface.
     *
     * Defines the tab ID, title, section ID, and section title for the similar
     * products settings in the admin interface.
     *
     * @since    1.1.0
     * @access   protected
     */
    protected function set_tab_details() {
        $this->tab_id = 'similar_products';
        $this->tab_title = __('Similar Products', 'product-estimator');
        $this->section_id = 'similar_products_rules_section';
        $this->section_title = __('Similar Products Settings', 'product-estimator');
    }

    /**
     * Defines the vertical tabs structure for this module
     *
     * @return array Array of tab definitions
     */
    protected function get_vertical_tabs() {
        return [
            // Main rules management table tab
            [
                'id'           => 'rules_table_tab',
                'title'        => __('Similar Products Rules', 'product-estimator'),
                'description'  => __('Configure rules for finding similar products based on product attributes. This allows the estimator to suggest related products to users.', 'product-estimator'),
                'content_type' => 'table',  // This tab displays table-based content
            ],
            // Additional settings tab could be added here if needed
        ];
    }

    /**
     * Registers settings fields for vertical tabs
     *
     * @param string $vertical_tab_id     Current tab ID being registered
     * @param string $page_slug_for_wp_api Page slug for WordPress Settings API
     * @return void
     */
    protected function register_vertical_tab_fields($vertical_tab_id, $page_slug_for_wp_api) {
        // The table-type tab doesn't need WordPress settings fields
        if ($vertical_tab_id === 'rules_table_tab') {
            // No settings fields to register - table content is handled separately
            return;
        }
    }

    /**
     * Defines the columns to display in the table
     *
     * @return array Associative array of column identifiers and their display headers
     */
    protected function get_table_columns() {
        return [
            'source_categories' => __('Source Categories', 'product-estimator'),
            'attributes'        => __('Attributes to Compare', 'product-estimator'),
            'item_actions'      => __('Actions', 'product-estimator'),
        ];
    }

    /**
     * Get additional item actions
     *
     * @param array $item The item data
     * @return string HTML for additional actions
     */
    protected function get_additional_item_actions($item) {
        return '';
    }

    /**
     * Defines the structure of the add/edit item form fields
     *
     * @return array Array of form field definitions
     */
    protected function get_item_form_fields_definition() {
        if ($this->product_categories === null) {
            $this->product_categories = [];
            $categories = get_terms(['taxonomy' => 'product_cat', 'hide_empty' => false]);
            if (!is_wp_error($categories)) {
                foreach ($categories as $cat) {
                    $this->product_categories[$cat->term_id] = $cat->name;
                }
            }
        }

        $fields = [
            ['id' => 'item_id',  'type'  => 'hidden' ],
            [
                'id'         => 'source_categories',
                'label'      => __('Source Categories', 'product-estimator'),
                'type'       => 'select',
                'options'    => $this->product_categories,
                'required'   => true,
                'attributes' => [
                    'multiple' => true,
                    'style'    => 'width:100%;',
                    'class'    => 'pe-select2 similar-product-source-categories-select pe-item-form-field',
                    'id'       => 'similar-product-source-categories',
                ],

                'description' => __('Select one or more source product categories. Hold Ctrl/Cmd key to select multiple categories.', 'product-estimator'),
            ]
            ,
            [
                'id'         => 'attributes',
                'label'      => __('Product Attributes to Compare', 'product-estimator'),
                'type'       => 'custom_callback',
                'render_callback' => 'render_attributes_selection_field',
                'required'   => true,
                'description' => __('Select which attributes should be used to determine product similarity.', 'product-estimator'),
            ]
        ];
        return $fields;
    }

    /**
     * Validates and sanitizes item data before saving
     *
     * @param array $raw_item_data The unvalidated data from form submission
     * @param string|int $item_id The ID of the item being edited (null for new items)
     * @param array $original_item_data The original item data (for edit operations)
     * @return array|WP_Error Validated data or error object
     */
    protected function validate_item_data(array $raw_item_data, $item_id = null, $original_item_data = null) {
        error_log("[DEBUG][VALIDATE_DATA]");
        $validated_data = [];
        $errors = new \WP_Error();

        // Validate source categories
        if (isset($raw_item_data['source_categories']) && is_array($raw_item_data['source_categories'])) {
            $validated_data['source_categories'] = array_map('absint', $raw_item_data['source_categories']);
        } elseif (isset($raw_item_data['source_categories']) && !empty($raw_item_data['source_categories'])) {
            // Handle comma-separated string if sent that way
            $categories = explode(',', $raw_item_data['source_categories']);
            $validated_data['source_categories'] = array_map('absint', $categories);
        }
        // Backward compatibility with old field name
        elseif (isset($raw_item_data['source_categories']) && is_array($raw_item_data['source_categories'])) {
            $validated_data['source_categories'] = array_map('absint', $raw_item_data['source_categories']);
        } elseif (isset($raw_item_data['source_categories']) && !empty($raw_item_data['source_categories'])) {
            // Handle comma-separated string if sent that way
            $categories = explode(',', $raw_item_data['source_categories']);
            $validated_data['source_categories'] = array_map('absint', $categories);
        } else {
            $errors->add('missing_source_categories', __('Please select at least one source category.', 'product-estimator'));
        }

        // Keep source_categories field for backward compatibility
        if (isset($validated_data['source_categories'])) {
            $validated_data['source_categories'] = $validated_data['source_categories'];
        }

        // Validate attributes
        if (isset($raw_item_data['attributes'])) {
            if (is_array($raw_item_data['attributes'])) {
                $validated_data['attributes'] = array_map('sanitize_text_field', $raw_item_data['attributes']);
            } elseif (!empty($raw_item_data['attributes'])) {
                // Handle comma-separated string if sent that way
                $attributes = explode(',', $raw_item_data['attributes']);
                $validated_data['attributes'] = array_map('sanitize_text_field', $attributes);
            } else {
                $validated_data['attributes'] = [];
            }
        } else {
            $validated_data['attributes'] = [];
        }


        if (!empty($errors->get_error_codes())) {
            return $errors;
        }

        error_log("[DEBUG][DATA]: ". print_r($validated_data, true));
        return $validated_data;
    }

    /**
     * Prepares item data for populating the edit form
     *
     * @param array $item_data The item data
     * @return array Prepared data for form
     */
    protected function prepare_item_for_form_population(array $item_data) {
        // Ensure all required fields exist
        if (!isset($item_data['source_categories'])) {
            // Check for backward compatibility with old field name
            if (isset($item_data['source_categories'])) {
                $item_data['source_categories'] = $item_data['source_categories'];
            }
            // Check for legacy format (single category)
            else if (isset($item_data['source_category'])) {
                $item_data['source_categories'] = [(int)$item_data['source_category']];
            } else {
                $item_data['source_categories'] = [];
            }
        }

        // Also maintain the old field name for backward compatibility
        if (!isset($item_data['source_categories'])) {
            $item_data['source_categories'] = $item_data['source_categories'];
        }

        if (!isset($item_data['attributes'])) {
            $item_data['attributes'] = [];
        }

        // Get attributes data for display - This will be loaded via AJAX when the form is displayed,
        // but we need to ensure the selected attributes data is available
        if (!empty($item_data['attributes'])) {
            // Convert attributes from array to comma-separated string for the hidden input
            if (is_array($item_data['attributes'])) {
                $item_data['attributes_string'] = implode(',', $item_data['attributes']);
            } else {
                $item_data['attributes_string'] = $item_data['attributes'];
                // Also ensure attributes is an array for internal use
                $item_data['attributes'] = explode(',', $item_data['attributes']);
            }

            // Get attribute labels for display
            $attribute_labels = [];
            foreach ($item_data['attributes'] as $attribute) {
                $attribute_label = wc_attribute_label('pa_' . $attribute);
                $attribute_labels[] = $attribute_label;
            }

            $item_data['attribute_labels'] = $attribute_labels;
        } else {
            $item_data['attributes_string'] = '';
            $item_data['attribute_labels'] = [];
        }

        // Debug information
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('SimilarProductsSettingsModule::prepare_item_for_form_population - Item data prepared: ' . print_r($item_data, true));
        }

        return $item_data;
    }

    /**
     * Prepares item for response after saving
     *
     * @param array $saved_item The saved item data
     * @return array Prepared item for response
     */
    protected function prepare_item_for_response(array $saved_item) {
        error_log("[DEBUG][PREPARE_ITEM_FOR_RESPONSE]" . print_r($saved_item, true));
        $response_item = $saved_item;

        // Add formatted source categories
        $source_names = [];
        if (!empty($saved_item['source_categories'])) {
            foreach ($saved_item['source_categories'] as $cat_id) {
                $term = get_term($cat_id, 'product_cat');
                if (!is_wp_error($term) && $term) {
                    $source_names[] = $term->name;
                }
            }
        }
        // Backward compatibility
        else if (!empty($saved_item['source_categories'])) {
            foreach ($saved_item['source_categories'] as $cat_id) {
                $term = get_term($cat_id, 'product_cat');
                if (!is_wp_error($term) && $term) {
                    $source_names[] = $term->name;
                }
            }
        }
        $response_item['source_categories_display'] = implode(', ', $source_names);
        // Keep old field name for backward compatibility
        $response_item['source_categories_display'] = $response_item['source_categories_display'];

        // Add formatted attributes
        $attribute_labels = [];
        if (!empty($saved_item['attributes'])) {
            foreach ($saved_item['attributes'] as $attribute) {
                $attribute_label = wc_attribute_label('pa_' . $attribute);
                $attribute_labels[] = $attribute_label;
            }
        }
        $response_item['attributes_display'] = implode(', ', $attribute_labels);

        return $response_item;
    }

    /**
     * Get the label for the "Add New" button
     *
     * @return string Button label
     */
    protected function get_add_new_button_label() {
        return __('Add New Rule', 'product-estimator');
    }

    /**
     * Get the form title
     *
     * @param bool $is_edit_mode Whether the form is in edit mode
     * @return string Form title
     */
    protected function get_form_title($is_edit_mode = false) {
        return $is_edit_mode ? __('Edit Similar Products Rule', 'product-estimator') : __('Add New Similar Products Rule', 'product-estimator');
    }

    /**
     * Get the human-readable label for the item type managed by this module.
     *
     * @since X.X.X
     * @return string The item type label (singular)
     */
    protected function get_item_type_label()
    {
        return __('rule', 'product-estimator');
    }

    /**
     * Generate a unique ID for new items
     *
     * @param array $validated_item_data The validated item data
     * @return string New unique ID
     */
    protected function generate_item_id(array $validated_item_data) {
        return (string)time();  // Use timestamp as unique ID
    }

    /**
     * Get items to display in the table
     *
     * @return array Array of items to display in the table
     */
    protected function get_items_for_table() {
        $option_data = get_option($this->option_name, []);

        // Ensure we're working with an array
        if (!is_array($option_data)) {
            $option_data = [];
        }

        // Sort items by source categories for better user experience
        uasort($option_data, function($a, $b) {
            // Get first category from each item for comparison
            $a_cat = isset($a['source_categories'][0]) ? $a['source_categories'][0] :
                    (isset($a['source_categories'][0]) ? $a['source_categories'][0] : 0);

            $b_cat = isset($b['source_categories'][0]) ? $b['source_categories'][0] :
                    (isset($b['source_categories'][0]) ? $b['source_categories'][0] : 0);

            // Get category names for comparison
            $a_name = '';
            $b_name = '';

            if ($a_cat) {
                $term = get_term($a_cat, 'product_cat');
                if (!is_wp_error($term) && $term) {
                    $a_name = $term->name;
                }
            }

            if ($b_cat) {
                $term = get_term($b_cat, 'product_cat');
                if (!is_wp_error($term) && $term) {
                    $b_name = $term->name;
                }
            }

            return strcasecmp($a_name, $b_name);
        });

        return $option_data;
    }

    /**
     * Register module-specific hooks
     */
    protected function register_hooks() {
        parent::register_hooks(); // This registers the table CRUD AJAX handlers

        // Add AJAX handler for getting product attributes
        add_action('wp_ajax_pe_get_category_attributes', array($this, 'ajax_get_category_attributes'));
    }

    /**
     * Returns the JavaScript context name for this module
     *
     * @return string JS context name
     */
    protected function get_js_context_name() {
        return 'similarProductsSettings';
    }

    /**
     * Get module-specific script data
     *
     * @return array Script data
     */
    protected function get_module_specific_script_data() {

        return [
            'actions' => [
                'get_attributes' => 'pe_get_category_attributes',
            ],
            'selectors' => [
                'sourceCategoriesSelect'  => '#similar-product-source-categories',
                'attributesContainer'     => '.attributes-selection-container',
                'attributesList'          => '.attributes-list',
                'attributesLoading'       => '.attributes-loading',
                'selectedAttributesInput' => '.selected-attributes-input',
            ],
            'i18n' => [
                'loadingAttributes'      => __('Loading attributes...', 'product-estimator'),
                'selectCategory'         => __('Please select categories first.', 'product-estimator'),
                'noAttributes'           => __('No product attributes found for these categories.', 'product-estimator'),
                'errorLoading'           => __('Error loading attributes. Please try again.', 'product-estimator'),
                'selectCategoryError'    => __('Please select at least one source category.', 'product-estimator'),
                'selectAttributesError'  => __('Please select at least one attribute.', 'product-estimator'),
                'addRuleButtonLabel'     => __('Add New Rule', 'product-estimator'),
                'saveRuleButtonLabel'    => __('Save Rule', 'product-estimator'),
                'updateRuleButtonLabel'  => __('Update Rule', 'product-estimator'),
                'ruleSavedSuccess'       => __('Rule saved successfully!', 'product-estimator'),
                'ruleDeletedSuccess'     => __('Rule deleted successfully!', 'product-estimator'),
                'selectTargetCategory'   => __('Please select a target product category.', 'product-estimator'),
                // Common table actions i18n
                'cancelButtonLabel'     => __('Cancel', 'product-estimator'),
                'confirmDelete'         => __('Are you sure you want to delete this item?', 'product-estimator'),
                'itemAdded'             => __('Item added successfully!', 'product-estimator'),
                'itemUpdated'           => __('Item updated successfully!', 'product-estimator'),
                'itemDeleted'           => __('Item deleted successfully!', 'product-estimator'),
                'errorSaving'           => __('Error saving item.', 'product-estimator'),
                'errorDeleting'         => __('Error deleting item.', 'product-estimator'),
                'itemSaveSuccess'       => __('Item saved successfully!', 'product-estimator'),
                'formConfirmDelete'     => __('Are you sure you want to delete this item?', 'product-estimator'),
                'errorSavingItem'       => __('Error saving item.', 'product-estimator'),
                'errorDeletingItem'     => __('Error deleting item.', 'product-estimator'),
                'editItemFormTitle'     => __('Edit Item', 'product-estimator'),
                'addItemFormTitle'      => __('Add New Item', 'product-estimator'),
                'saveChangesButton'     => __('Save Changes', 'product-estimator'),
                'updateChangesButton'   => __('Update Changes', 'product-estimator'),
                'confirmCancelEditing'  => __('You have unsaved changes. Are you sure you want to cancel?', 'product-estimator'),
                'errorLoadingItem'      => __('Error loading item details.', 'product-estimator'),
                'deleteButtonLabel'     => __('Delete', 'product-estimator'),
                'editButtonLabel'       => __('Edit', 'product-estimator'),
                'saving'                => __('Saving...', 'product-estimator'),
                'deleting'              => __('Deleting...', 'product-estimator'),
                'validationFailed'      => __('Please correct the errors in the form.', 'product-estimator'),
                'fieldRequired'         => __('This field is required.', 'product-estimator'),
            ],
            'table_columns' => [
                'source_categories' => __('Source Categories', 'product-estimator'),
                'attributes' => __('Attributes to Compare', 'product-estimator'),
                'item_actions' => __('Actions', 'product-estimator'),
            ]
        ];
    }
}
