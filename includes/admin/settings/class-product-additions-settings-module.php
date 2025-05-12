<?php
// File: class-product-additions-settings-module.php (Refactored)
namespace RuDigital\ProductEstimator\Includes\Admin\Settings;

// SettingsModuleWithTableBase is its parent.
// SettingsModuleInterface is implemented.
final class ProductAdditionsSettingsModule extends SettingsModuleWithTableBase implements SettingsModuleInterface
{
    protected $option_name = 'product_estimator_product_additions';
    private $product_categories = null; // Cache categories

    protected function set_tab_details()
    {
        $this->tab_id = 'product_additions';
        $this->tab_title = __('Product Additions', 'product-estimator');
        // This section_title can be used as the title for the single vertical tab.
        $this->section_id = 'product_additions_rules_section';
        $this->section_title = __('Product Relationship Rules', 'product-estimator');
    }

    /**
     * Defines the vertical tabs for this module.
     * This module will display its table content within a single vertical tab.
     */
    protected function get_vertical_tabs() {
        return [
            [
                'id'          => 'rules_table_tab', // Unique ID for this tab panel
                'title'       => $this->section_title, // Use the main section title for the tab
                'description' => __('Manage rules for product additions and suggestions based on categories.', 'product-estimator'),
                'content_type'=> 'table', // Key: This tab will render table content
            ],

            // Add other tabs here if ProductAdditionsSettingsModule ever needs them.
            // Example:
             [
                 'id'          => 'pa_general_settings',
                 'title'       => __('General PA Settings', 'product-estimator'),
                 'content_type'=> 'settings', // This would use register_vertical_tab_fields
             ],
        ];
    }

    /**
     * Registers settings sections and fields for a specific vertical tab.
     * Since our only tab ('rules_table_tab') is of type 'table',
     * no standard WordPress settings fields are registered via this method for that tab.
     */
    protected function register_vertical_tab_fields($vertical_tab_id, $page_slug_for_wp_api) {
        if ($vertical_tab_id === 'rules_table_tab') {
            // No settings fields to register for the tab that displays the table.
            // The table and its item form are handled by other mechanisms.
        }
        else if ($vertical_tab_id === 'pa_general_settings') {
            $section_id = $this->section_id . '_pa_general';
            add_settings_section(
                $section_id,
                __('General Settings Section Title', 'product-estimator'),
                [$this, 'your_section_callback_function'], // Assuming this method now exists
                $page_slug_for_wp_api
            );

            // Define actual field arguments for your field
            $field_args_for_general = [
                'id'          => 'my_pa_setting_field_id', // The ID should be part of the field args for render_field
                'title'       => __('Enable Feature X', 'product-estimator'), // Not directly used by render_field unless you customize
                'type'        => 'checkbox',
                'description' => __('Tick to enable Feature X for product additions.', 'product-estimator'), // Not directly used by render_field
                'default'     => '0',
                'option_name' => $this->option_name, // Often useful for the render_field to know where to get the value
                // Any other attributes required by your render_field method or the HTML structure
                'attributes' => ['id' => 'my_pa_setting_field_id_html'], // Actual HTML id if different from setting key
                'checkbox_label' => __('Enable this awesome feature', 'product-estimator') // Example if your render_field supports it
            ];

            add_settings_field(
                'my_pa_setting_field_id', // Unique ID for the setting field
                __('Enable Feature X Label', 'product-estimator'), // Label displayed next to the field
                [$this, 'render_field'], // <--- CORRECTED CALLBACK
                $page_slug_for_wp_api,
                $section_id,
                $field_args_for_general // This array is passed as the first argument to $this->render_field()
            );

            // Ensure the ID used here matches the ID within $field_args_for_general for consistency
            $this->store_field_for_sub_tab($vertical_tab_id, 'my_pa_setting_field_id', $field_args_for_general);
        }
    }

    public function your_section_callback_function() {
        // Output HTML for the section description, if any.
        // For example:
        echo '<p>' . esc_html__('These are the general settings for Product Additions.', 'product-estimator') . '</p>';
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
        if ($features && property_exists($features, 'suggested_products_enabled') && $features->suggested_products_enabled) {
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

    // In class-product-additions-settings-module.php
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


    // The render_form_fields($item = null) method is now inherited from SettingsModuleWithTableBase
    // and will use the definition from get_item_form_fields_definition().

    protected function get_items_for_table()
    {
        $items = get_option($this->option_name, array());
        // Filter out items for disabled features before display
        $features = $this->get_features_object();
        $processed_items = [];
        if (is_array($items)) {
            foreach ($items as $id => $item_data) {
                if (!is_array($item_data)) continue; // Skip malformed items

                // Ensure item_data has an 'id' key, using array key if necessary (though items should store their own ID)
                if (!isset($item_data['id'])) {
                    $item_data['id'] = $id;
                }

                if (isset($item_data['relation_type']) &&
                    $item_data['relation_type'] === 'suggest_products_by_category' &&
                    $features && property_exists($features, 'suggested_products_enabled') &&
                    !$features->suggested_products_enabled) {
                    continue; // Skip this item if the feature is disabled
                }
                $processed_items[$item_data['id']] = $item_data; // Re-key by actual item ID
            }
        }
        return $processed_items;
    }

    protected function get_table_columns()
    {
        return [
            'source_categories' => __('Source Categories', 'product-estimator'),
            'action_type' => __('Action', 'product-estimator'),
            'target_details' => __('Target/Note', 'product-estimator'),
            'item_actions' => __('Actions', 'product-estimator'),
        ];
    }

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
                $item_id_for_actions = $item['id'] ?? '';
                ?>
                <button type="button" class="pe-edit-item-button button button-small"
                        data-id="<?php echo esc_attr($item_id_for_actions); ?>"
                        aria-label="<?php esc_attr_e('Edit this item', 'product-estimator'); ?>">
                    <?php esc_html_e('Edit', 'product-estimator'); ?>
                </button>
                <button type="button" class="pe-delete-item-button button button-small"
                        data-id="<?php echo esc_attr($item_id_for_actions); ?>"
                        aria-label="<?php esc_attr_e('Delete this item', 'product-estimator'); ?>">
                    <?php esc_html_e('Delete', 'product-estimator'); ?>
                </button>
                <?php
                break;
        }
    }

    protected function prepare_item_for_form_population(array $item_data) {
        if (!is_array($item_data)) { return []; }

        if (!empty($item_data['product_id']) && isset($item_data['relation_type']) && $item_data['relation_type'] === 'auto_add_by_category') {
            $product = wc_get_product($item_data['product_id']);
            if ($product) {
                $item_data['product_name_display'] = $product->get_formatted_name(); // For product_search_component
            } else {
                $item_data['product_name_display'] = __('Product not found', 'product-estimator');
            }
        }
        // Ensure all field IDs from get_item_form_fields_definition are present in $item_data
        // This helps JS populate the form correctly, even if some values are empty.
        $field_defs = $this->get_item_form_fields_definition();
        foreach($field_defs as $def) {
            if (!isset($item_data[$def['id']])) {
                $item_data[$def['id']] = $def['default'] ?? ( ($def['type'] === 'select' && !empty($def['attributes']['multiple'])) ? [] : '' ) ;
            }
        }
        return $item_data;
    }


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
                'errorSavingItem'        => __('Error saving rule.', 'product-estimator'),
                'errorDeletingItem'      => __('Error deleting rule.', 'product-estimator'),
                'errorLoadingItem'       => __('Error loading rule details.', 'product-estimator'),
                'saveChangesButton'      => __('Save Rule', 'product-estimator'),
                'updateChangesButton'    => __('Update Rule', 'product-estimator'),
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
                'suggested_products_enabled' => ($features && property_exists($features, 'suggested_products_enabled')) ? $features->suggested_products_enabled : false,
            ]
        ];
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

    protected function get_nonce_action_base()
    {
        // This nonce is used for the item CRUD operations (add, update, delete, get)
        // It should be unique to this module's item management.
        return 'product_estimator_pa_items'; // Changed from 'product_estimator_product_additions' to be more specific for items
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

    public function render_section_description()
    {
        // This description appears above the vertical tab navigation (if this module is the primary one)
        // or as part of the main settings page structure.
        // Since ProductAdditionsSettingsModule now renders within a tab, this might not be directly visible
        // unless the main settings page explicitly calls it for the 'product_additions' main tab.
        // The description for the *vertical tab itself* is set in get_vertical_tabs().
        echo '<p>' . esc_html__('Define rules to automatically add related products or notes, or suggest alternative products, based on the categories of items added to an estimate.', 'product-estimator') . '</p>';
    }

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
                if ($features && property_exists($features, 'suggested_products_enabled') && $features->suggested_products_enabled) {
                    if (empty($sanitized_data['target_category'])) {
                        $errors->add('missing_target_category_for_suggest', __('Please select a target category for suggestions.', 'product-estimator'));
                    }
                } else {
                    $errors->add('feature_disabled_suggest', __('Suggest products feature is currently disabled. This rule cannot be saved.', 'product-estimator'));
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

    // class-product-additions-settings-module.php
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

    private function get_features_object()
    {
        static $features_obj = null;
        if ($features_obj === null) { // Ensure it's fetched only once per request
            if (function_exists('product_estimator_features')) {
                $features_obj = product_estimator_features();
            } else {
                // Fallback or default if the global function/object isn't available
                $features_obj = (object)['suggested_products_enabled' => false]; // Example default
            }
        }
        return $features_obj;
    }

    private function get_relation_type_label($relation_type_key) {
        $labels = [
            'auto_add_by_category' => __('Auto-Add Product with Category', 'product-estimator'),
            'auto_add_note_by_category' => __('Auto-Add Note with Category', 'product-estimator'),
            'suggest_products_by_category' => __('Suggest Products when Category', 'product-estimator'),
        ];
        return $labels[$relation_type_key] ?? ucfirst(str_replace('_', ' ', $relation_type_key));
    }

    private function get_target_details_for_display(array $item) {
        $relation_type = $item['relation_type'] ?? '';
        if ($relation_type === 'auto_add_by_category' && !empty($item['product_id'])) {
            $product = wc_get_product($item['product_id']);
            return $product ? esc_html($product->get_name()) : __('Product not found', 'product-estimator');
        } elseif ($relation_type === 'auto_add_note_by_category' && !empty($item['note_text'])) {
            return esc_html(wp_trim_words($item['note_text'], 10, '...'));
        } elseif ($relation_type === 'suggest_products_by_category' && !empty($item['target_category'])) {
            $target_cat = get_term($item['target_category'], 'product_cat');
            return ($target_cat && !is_wp_error($target_cat)) ? esc_html($target_cat->name . ' (Category)') : __('Category not found', 'product-estimator');
        }
        return '';
    }

    protected function get_item_management_capability()
    {
        return 'manage_options'; // Or a more specific capability
    }

    // AJAX handler for product search (used by the 'product_search_component' field)
// class-product-additions-settings-module.php
// Rename this function to match the new hook
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
    }}
