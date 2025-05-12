<?php
namespace RuDigital\ProductEstimator\Includes\Admin\Settings;

/**
 * Pricing Rules Settings Module Class
 *
 * Implements the pricing rules settings tab functionality for the Product Estimator.
 * This module allows administrators to define pricing methods and sources for products
 * based on their categories. It provides both default pricing settings that apply
 * globally and category-specific rules that override the defaults.
 *
 * Pricing Methods:
 * - Fixed Price: Product has a single price regardless of dimensions
 * - Per Square Meter: Product price is calculated based on its area
 *
 * Pricing Sources:
 * - Website: Uses WooCommerce product prices
 * - NetSuite: Retrieves pricing from NetSuite integration
 *
 * @since      1.1.0
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes/admin/settings
 */
final class PricingRulesSettingsModule extends SettingsModuleWithTableBase implements SettingsModuleInterface {
    /**
     * Option name in WordPress options table where pricing rules are stored
     * This is the key in wp_options for this module's settings collection
     */
    protected $option_name = 'product_estimator_pricing_rules';

    /**
     * Set the tab and section details for the admin interface.
     *
     * Defines the tab ID, title, section ID, and section title for this settings module.
     * These values are used to register and identify this module in the admin interface.
     *
     * @since    1.1.0
     * @access   protected
     */
    protected function set_tab_details() {
        $this->tab_id = 'pricing_rules';
        $this->tab_title = __('Pricing Rules', 'product-estimator');
        $this->section_id = 'pricing_rules_settings';
        $this->section_title = __('Pricing Rules Settings', 'product-estimator');
    }

    /**
     * Determines if this module handles a specific setting key
     *
     * This method is crucial for the validation process as it identifies which
     * settings keys belong to this module. It handles two types of keys:
     *
     * 1. Settings fields like 'default_pricing_method' and 'default_pricing_source'
     * 2. Table items which typically have a prefix (rule_) or are full rule IDs
     *
     * @since    1.1.0
     * @access   public
     * @param    string    $key    Setting key to check
     * @return   bool      Whether this module handles the setting
     */
    public function has_setting($key) {
        // Check if it's a default setting field
        if ($key === 'default_pricing_method' || $key === 'default_pricing_source') {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('PricingRulesSettingsModule: has_setting: TRUE for default setting ' . $key);
            }
            return true;
        }

        // Check if it's a table item - rule items typically start with 'rule_' prefix
        // or are full rule IDs like 'pricing_rules_XXXXXXX'
        if (is_string($key) && (strpos($key, 'rule_') === 0 || strpos($key, 'pricing_rules_') === 0)) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('PricingRulesSettingsModule: has_setting: TRUE for rule item ' . $key);
            }
            return true;
        }

        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('PricingRulesSettingsModule: has_setting: FALSE for ' . $key);
        }
        return false;
    }

    /**
     * Get the vertical tabs for this module
     *
     * Defines the structure of vertical tabs displayed within this module's main tab
     *
     * @since    1.1.0
     * @access   protected
     * @return   array    Array of vertical tab definitions
     */
    protected function get_vertical_tabs() {
        return [
            // Settings tab - contains default pricing options
            // Pricing rules table tab
            [
                'id' => 'pricing_rules_table',
                'title' => __('Pricing Rules', 'product-estimator'),
                'description' => __('Manage category-specific pricing rules', 'product-estimator'),
                'content_type' => 'table', // Table-based interface
            ],
            [
                'id' => 'settings',
                'title' => __('Settings', 'product-estimator'),
                'description' => __('Configure default pricing settings', 'product-estimator'),
                'content_type' => 'settings', // Standard fields display
            ],
        ];
    }

    /**
     * Register fields for a vertical tab
     *
     * Defines and registers the fields that appear in a specific vertical tab
     *
     * @since    1.1.0
     * @access   protected
     * @param    string    $vertical_tab_id    ID of the vertical tab
     * @param    string    $page_slug_for_wp_api    Page slug used by WordPress settings API
     */
    protected function register_vertical_tab_fields($vertical_tab_id, $page_slug_for_wp_api) {
        // The table-type tab doesn't need WordPress settings fields
        if ($vertical_tab_id === 'pricing_rules_table') {
            // No settings fields to register - table content is handled separately
            // via render_table_content_for_tab() from SettingsModuleWithTableBase
            return;
        }

        if ($vertical_tab_id === 'settings') {
            // Create a unique section ID by combining the base section ID with a suffix
            $section_id = $this->section_id . '_settings';

            // Register fields for the settings tab
            add_settings_section(
                $section_id,
                __('Default Pricing Settings', 'product-estimator'),
                [$this, 'render_default_settings_section_description'],
                $page_slug_for_wp_api
            );

            // Add default pricing method and source fields
            $default_fields = array(
                'default_pricing_method' => array(
                    'id' => 'default_pricing_method',
                    'title' => __('Default Pricing Method', 'product-estimator'),
                    'type' => 'select',
                    'description' => __('Select the default pricing method to use when no specific rules apply.', 'product-estimator'),
                    'default' => 'sqm',
                    'options' => $this->get_pricing_methods(),
                    'option_name' => $this->option_name,
                    'attributes' => [
                        'id' => 'default_pricing_method',
                        'class' => 'regular-text'
                    ]
                ),
                'default_pricing_source' => array(
                    'id' => 'default_pricing_source',
                    'title' => __('Default Pricing Source', 'product-estimator'),
                    'type' => 'select',
                    'description' => __('Select the default pricing source to use when no specific rules apply.', 'product-estimator'),
                    'default' => 'website',
                    'options' => $this->get_pricing_sources(),
                    'option_name' => $this->option_name,
                    'attributes' => [
                        'id' => 'default_pricing_source',
                        'class' => 'regular-text'
                    ]
                ),
            );

            foreach ($default_fields as $id => $field_args) {
                add_settings_field(
                    $id,
                    $field_args['title'],
                    [$this, 'render_field'],
                    $page_slug_for_wp_api,
                    $section_id,
                    $field_args
                );

                // Store field data in module for validation and form handling
                $this->store_field_for_sub_tab($vertical_tab_id, $id, $field_args);

                // Debug logging
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log('Pricing Rules: Stored field for tab ' . $vertical_tab_id . ': ' . $id);
                }
            }
        }
    }

    /**
     * Define the table columns for the pricing rules table
     *
     * @since    1.1.0
     * @access   protected
     * @return   array    Associative array of column IDs and labels
     */
    protected function get_table_columns() {
        return [
            'categories' => __('Categories', 'product-estimator'),
            'pricing_method' => __('Pricing Method', 'product-estimator'),
            'item_actions' => __('Actions', 'product-estimator')
        ];
    }

    /**
     * Render content for a specific cell in the pricing rules table
     *
     * @since    1.1.0
     * @access   public
     * @param    array     $item          The item data being displayed
     * @param    string    $column_name   The column identifier
     */
    public function render_table_cell_content($item, $column_name) {
        switch ($column_name) {
            case 'categories':
                // Get and display category names for this rule
                $category_names = isset($item['category_names']) ? $item['category_names'] : '';
                echo esc_html($category_names);
                break;

            case 'pricing_method':
                // Display the pricing method and source in a readable format
                $pricing_method = isset($item['pricing_method']) ? $item['pricing_method'] : '';
                $pricing_source = isset($item['pricing_source']) ? $item['pricing_source'] : '';
                echo esc_html($this->get_pricing_label($pricing_method, $pricing_source));
                break;

            case 'item_actions':
                // Use the standard action buttons from the parent class
                echo $this->render_standard_item_actions($item);
                break;

            default:
                // For any other column, output the raw value if it exists
                if (isset($item[$column_name])) {
                    echo esc_html($item[$column_name]);
                } else {
                    echo '—'; // Em dash as placeholder for empty cells
                }
                break;
        }
    }


    /**
     * Define the structure of form fields for adding/editing pricing rules
     *
     * @since    1.1.0
     * @access   protected
     * @return   array    Array of field definitions
     */
    protected function get_item_form_fields_definition() {
        $categories = get_terms(['taxonomy' => 'product_cat', 'hide_empty' => false]);
        $category_options = [];

        if (!is_wp_error($categories)) {
            foreach ($categories as $category) {
                $category_options[$category->term_id] = $category->name;
            }
        }

        return [
            [
                'id' => 'item_id',
                'type' => 'hidden',
                'attributes' => [
                    'class' => 'pe-item-form-field',
                    'id' => 'item_id',
                ],
            ],
            [
                'id' => 'categories',
                'label' => __('Categories', 'product-estimator'),
                'type' => 'select',
                'required' => true,
                'multiple' => true,
                'options' => $category_options,
                'attributes' => [
                    'class' => 'pe-item-form-field',
                    'id' => 'categories',
                    'name' => 'categories[]', // Use array notation for multiple select
                    'data-placeholder' => __('Select categories', 'product-estimator'),
                ],
                'description' => __('Select categories to which this pricing method should apply.', 'product-estimator'),
            ],
            [
                'id' => 'pricing_method',
                'label' => __('Pricing Method', 'product-estimator'),
                'type' => 'select',
                'required' => true,
                'options' => $this->get_pricing_methods(),
                'attributes' => [
                    'class' => 'pe-item-form-field',
                    'id' => 'pricing_method',
                ],
                'description' => __('Select how pricing should be calculated for products in the selected categories.', 'product-estimator'),
            ],
            [
                'id' => 'pricing_source',
                'label' => __('Pricing Source', 'product-estimator'),
                'type' => 'select',
                'required' => true,
                'options' => $this->get_pricing_sources(),
                'attributes' => [
                    'class' => 'pe-item-form-field',
                    'id' => 'pricing_source',
                ],
                'description' => __('Select where the price data should be sourced from.', 'product-estimator'),
            ],
        ];
    }

    /**
     * Get items for the pricing rules table
     *
     * @since    1.1.0
     * @access   protected
     * @return   array    Array of pricing rule items with formatted data
     */
    protected function get_items_for_table() {
        // Get the pricing rules with a fallback to empty array
        $pricing_rules = get_option('product_estimator_pricing_rules', []);

        // Ensure pricing_rules is an array
        if (!is_array($pricing_rules)) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('PricingRulesSettingsModule: pricing_rules option is not an array');
                error_log('Value: ' . print_r($pricing_rules, true));
            }
            $pricing_rules = [];
        }

        $formatted_rules = [];

        // These are keys that should be excluded from the table as they're settings, not rules
        $excluded_keys = ['default_pricing_method', 'default_pricing_source'];

        foreach ($pricing_rules as $rule_id => $rule) {
            // Skip default settings - they should only appear in the Settings tab
            if (in_array($rule_id, $excluded_keys)) {
                continue;
            }

            // Skip if the rule doesn't have categories (it's not a valid rule)
            if (!isset($rule['categories']) || empty($rule['categories'])) {
                continue;
            }

            // Get category names for display
            $category_names = [];
            $categories_array = isset($rule['categories']) ? (array)$rule['categories'] : [];

            foreach ($categories_array as $cat_id) {
                $term = get_term($cat_id, 'product_cat');
                if (!is_wp_error($term) && $term) {
                    $category_names[] = $term->name;
                }
            }

            // Ensure $rule is an array before merging
            if (!is_array($rule)) {
                // Log error for debugging
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log('PricingRulesSettingsModule: Rule data is not an array for rule_id: ' . $rule_id);
                    error_log('Rule value: ' . print_r($rule, true));
                }
                $rule = array(); // Convert to empty array to prevent array_merge error
            }

            // Add formatted data to the rule
            $formatted_rules[$rule_id] = array_merge($rule, [
                'id' => $rule_id,
                'category_names' => implode(', ', $category_names),
                'pricing_label' => $this->get_pricing_label(
                    $rule['pricing_method'] ?? '',
                    $rule['pricing_source'] ?? ''
                ),
            ]);
        }

        return $formatted_rules;
    }

    /**
     * Validate pricing rule data before saving
     *
     * @since    1.1.0
     * @access   protected
     * @param    array           $raw_item_data      The unvalidated data from form submission
     * @param    string|int|null $item_id            The ID of the item being edited (null for new items)
     * @param    array|null      $original_item_data The original item data (for edit operations)
     * @return   array|\WP_Error                     Validated data or error object
     */
    protected function validate_item_data(array $raw_item_data, $item_id = null, $original_item_data = null) {
        // Debug logging
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('PricingRulesSettingsModule - validate_item_data called with:');
            error_log('Raw item data: ' . print_r($raw_item_data, true));
            error_log('Item ID: ' . ($item_id ?? 'null'));
            error_log('Original item data: ' . ($original_item_data ? print_r($original_item_data, true) : 'null'));
        }

        $validated_data = [];
        $error_messages = [];

        // Validate categories (required, must be valid term IDs)
        // Handle both string and array input for categories
        $categories_input = $raw_item_data['categories'] ?? null;

        // Log raw input for debugging
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('PricingRulesSettingsModule - Raw categories input: ' . print_r($categories_input, true));
        }

        // Convert to array if it's a string (single value) or comma-separated list
        if (!is_array($categories_input)) {
            if (is_string($categories_input) && !empty($categories_input)) {
                // Handle comma-separated values or single value
                $categories_input = strpos($categories_input, ',') !== false ?
                    explode(',', $categories_input) :
                    [$categories_input];
            } else {
                $categories_input = [];
            }
        }

        if (empty($categories_input)) {
            $error_messages[] = __('Please select at least one category.', 'product-estimator');
        } else {
            $valid_categories = [];
            foreach ($categories_input as $cat_id) {
                $cat_id = absint($cat_id);
                $term = get_term($cat_id, 'product_cat');
                if (!is_wp_error($term) && $term) {
                    $valid_categories[] = $cat_id;
                }
            }

            if (empty($valid_categories)) {
                $error_messages[] = __('Please select valid product categories.', 'product-estimator');
            } else {
                $validated_data['categories'] = $valid_categories;
            }
        }

        // Validate pricing method (required, must be in allowed list)
        if (empty($raw_item_data['pricing_method'])) {
            $error_messages[] = __('Please select a pricing method.', 'product-estimator');
        } else {
            $method = sanitize_text_field($raw_item_data['pricing_method']);
            $valid_methods = array_keys($this->get_pricing_methods());

            if (!in_array($method, $valid_methods)) {
                $error_messages[] = __('Invalid pricing method selected.', 'product-estimator');
            } else {
                $validated_data['pricing_method'] = $method;
            }
        }

        // Validate pricing source (required, must be in allowed list)
        if (empty($raw_item_data['pricing_source'])) {
            $error_messages[] = __('Please select a pricing source.', 'product-estimator');
        } else {
            $source = sanitize_text_field($raw_item_data['pricing_source']);
            $valid_sources = array_keys($this->get_pricing_sources());

            if (!in_array($source, $valid_sources)) {
                $error_messages[] = __('Invalid pricing source selected.', 'product-estimator');
            } else {
                $validated_data['pricing_source'] = $source;
            }
        }

        // Return error if any validation failed
        if (!empty($error_messages)) {
            return new \WP_Error('validation_failed', implode('<br>', $error_messages));
        }

        return $validated_data;
    }

    /**
     * Prepare item data for response after saving
     *
     * Adds additional data needed for proper display in the table UI
     *
     * @since    1.1.0
     * @access   protected
     * @param    array    $saved_item    The saved item data
     * @return   array    Enhanced item data for UI display
     */
    protected function prepare_item_for_response(array $saved_item) {
        // Calculate category names
        $category_names = [];
        $categories_array = isset($saved_item['categories']) ? (array)$saved_item['categories'] : [];

        foreach ($categories_array as $cat_id) {
            $term = get_term($cat_id, 'product_cat');
            if (!is_wp_error($term) && $term) {
                $category_names[] = $term->name;
            }
        }

        // Create formatted data
        $formatted_data = [
            'category_names' => implode(', ', $category_names),
            'pricing_label' => $this->get_pricing_label(
                $saved_item['pricing_method'] ?? '',
                $saved_item['pricing_source'] ?? ''
            ),
        ];

        // Add UI-specific fields - ensure we're merging arrays
        if (!is_array($saved_item)) {
            // Log error for debugging
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('PricingRulesSettingsModule: prepare_item_for_response received non-array item');
                error_log('Item value: ' . print_r($saved_item, true));
            }
            // Since $saved_item is typed as array, this shouldn't happen under normal conditions
            // but we protect against PHP type errors just in case
            return $formatted_data;
        }

        return array_merge($saved_item, $formatted_data);
    }

    /**
     * Customize the "Add New" button label
     *
     * @since    1.1.0
     * @access   protected
     * @return   string    The button label
     */
    protected function get_add_new_button_label() {
        return __('Add New Pricing Rule', 'product-estimator');
    }

    /**
     * Customize the form title
     *
     * @since    1.1.0
     * @access   protected
     * @param    bool      $is_edit_mode    Whether the form is in edit mode
     * @return   string    The form title
     */
    protected function get_form_title($is_edit_mode = false) {
        return $is_edit_mode
            ? __('Edit Pricing Rule', 'product-estimator')
            : __('Add New Pricing Rule', 'product-estimator');
    }

    /**
     * Customize the success message for adding an item
     *
     * @since    1.1.0
     * @access   protected
     * @return   string    The success message
     */
    protected function get_item_added_message() {
        return __('Pricing rule added successfully.', 'product-estimator');
    }

    /**
     * Customize the success message for updating an item
     *
     * @since    1.1.0
     * @access   protected
     * @return   string    The success message
     */
    protected function get_item_updated_message() {
        return __('Pricing rule updated successfully.', 'product-estimator');
    }

    /**
     * Customize the success message for deleting an item
     *
     * @since    1.1.0
     * @access   protected
     * @return   string    The success message
     */
    protected function get_item_deleted_message() {
        return __('Pricing rule deleted successfully.', 'product-estimator');
    }

    /**
     * Render the default settings section description.
     *
     * Displays explanatory text for the default pricing settings section.
     *
     * @since    1.1.0
     * @access   public
     */
    public function render_default_settings_section_description() {
        echo '<p>' . esc_html__('Set the default pricing method and source to use when no specific category rules apply.', 'product-estimator') . '</p>';
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('Rendering default settings section description for Pricing Rules');
        }
    }

    // This function is no longer needed as we're using render_default_settings_section_description instead

    /**
     * Validate module-specific settings
     *
     * Ensures that submitted settings have valid values before they are saved.
     * This validation is applied to settings saved through the main settings form,
     * primarily the default pricing method and source.
     *
     * @since    1.1.0
     * @access   public
     * @param    array    $input    The settings to validate
     * @param    array    $context_field_definitions    Field definitions for additional context
     * @return   array|\WP_Error    The validated settings or error object
     */
    public function validate_settings($input, $context_field_definitions = null) {
        // First use parent's validation for standard fields (select options, etc.)
        $validated = parent::validate_settings($input, $context_field_definitions);

        if(is_wp_error($validated)) {
            return $validated;
        }

        // Additional validation for default_pricing_method
        if (isset($validated['default_pricing_method'])) {
            $valid_methods = array_keys($this->get_pricing_methods());
            if (!in_array($validated['default_pricing_method'], $valid_methods)) {
                add_settings_error($this->option_name, 'invalid_pricing_method', __('Invalid default pricing method selected.', 'product-estimator'));
                // If invalid, we could revert to a safe default here if needed
            }
        }

        // Additional validation for default_pricing_source
        if (isset($validated['default_pricing_source'])) {
            $valid_sources = array_keys($this->get_pricing_sources());
            if (!in_array($validated['default_pricing_source'], $valid_sources)) {
                add_settings_error($this->option_name, 'invalid_pricing_source', __('Invalid default pricing source selected.', 'product-estimator'));
            }
        }

        return $validated;
    }

    /**
     * Get combined pricing method and source label
     *
     * Creates a human-readable description of a pricing configuration
     * by combining the method and source labels.
     *
     * @since    1.1.0
     * @access   private
     * @param    string    $method    The pricing method key (e.g., 'fixed', 'sqm')
     * @param    string    $source    The pricing source key (e.g., 'website', 'netsuite')
     * @return   string    The combined human-readable label
     */
    private function get_pricing_label($method, $source) {
        $method_label = $this->get_pricing_method_label($method);
        $source_label = $this->get_pricing_source_label($source);

        return sprintf('%s from %s', $method_label, $source_label);
    }

    /**
     * Get human-readable label for pricing method
     *
     * Converts a pricing method key into a user-friendly label.
     *
     * @since    1.1.0
     * @access   private
     * @param    string    $method    The pricing method key (e.g., 'fixed', 'sqm')
     * @return   string    The human-readable label
     */
    private function get_pricing_method_label($method) {
        $methods = array(
            'fixed' => __('Fixed Price', 'product-estimator'),
            'sqm' => __('Per Square Meter', 'product-estimator'),
        );

        return isset($methods[$method]) ? $methods[$method] : $method;
    }

    /**
     * Get human-readable label for pricing source
     *
     * Converts a pricing source key into a user-friendly label.
     *
     * @since    1.1.0
     * @access   private
     * @param    string    $source    The pricing source key (e.g., 'website', 'netsuite')
     * @return   string    The human-readable label
     */
    private function get_pricing_source_label($source) {
        $sources = array(
            'website' => __('Website', 'product-estimator'),
            'netsuite' => __('NetSuite', 'product-estimator'),
        );

        return isset($sources[$source]) ? $sources[$source] : $source;
    }

    /**
     * Get available pricing methods
     *
     * Returns an array of all supported pricing methods with their labels.
     * Used for populating select fields in the UI.
     *
     * @since    1.1.0
     * @access   public
     * @return   array    Array of pricing methods as key-value pairs
     */
    public function get_pricing_methods() {
        return array(
            'fixed' => __('Fixed Price', 'product-estimator'),
            'sqm' => __('Per Square Meter', 'product-estimator'),
        );
    }

    /**
     * Get available pricing sources
     *
     * Returns an array of all supported pricing sources with their labels.
     * Used for populating select fields in the UI.
     *
     * @since    1.1.0
     * @access   public
     * @return   array    Array of pricing sources as key-value pairs
     */
    public function get_pricing_sources() {
        return array(
            'website' => __('Website', 'product-estimator'),
            'netsuite' => __('NetSuite', 'product-estimator'),
        );
    }

    /**
     * Enqueue module-specific scripts.
     *
     * Loads JavaScript libraries and adds data needed by the admin interface.
     * This includes the Select2 library for enhanced dropdowns and localized
     * data like AJAX URLs and translatable strings.
     *
     * @since    1.1.0
     * @access   public
     */
    public function enqueue_scripts() {
        parent::enqueue_scripts();

        // Enqueue Select2 for enhanced multi-select functionality
        wp_enqueue_script('select2', 'https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js', ['jquery'], '4.1.0-rc.0', true);

        // This single call handles getting common data, module-specific data, merging, and localizing.
        // It relies on get_common_table_script_data() from SettingsModuleWithTableBase,
        // get_module_specific_script_data() and get_js_context_name() from this class.
        $this->provide_script_data_for_localization();
    }

    /**
     * Enqueue module-specific styles.
     *
     * Loads CSS files needed for the pricing rules interface, including
     * the Select2 styles and module-specific customizations.
     *
     * @since    1.1.0
     * @access   public
     */
    public function enqueue_styles() {
        parent::enqueue_styles();

        // Enqueue Select2 CSS for enhanced dropdowns
        wp_enqueue_style('select2', 'https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css', [], '4.1.0-rc.0');

        // Enqueue module-specific styles
        wp_enqueue_style(
            $this->plugin_name . '-pricing-rules',
            PRODUCT_ESTIMATOR_PLUGIN_URL . 'admin/css/modules/pricing-rules.css',
            array($this->plugin_name . '-settings'),
            $this->version
        );
    }

    /**
     * Returns the unique JavaScript context name for this module's settings.
     *
     * @since    1.1.0
     * @access   protected
     * @return   string The JavaScript context name.
     */
    protected function get_js_context_name() {
        return 'pricingRulesSettings';
    }

    /**
     * Returns the base string used for nonce actions
     * This provides a consistent namespace for nonce generation and verification
     *
     * @since    1.1.0
     * @access   protected
     * @return   string The nonce action base
     */
    protected function get_nonce_action_base() {
        return 'product_estimator_pricing_rules_items';
    }

    /**
     * Returns an array of script data specific to this module.
     * This data will be merged with common data from the parent class.
     *
     * @since    1.1.0
     * @access   protected
     * @return   array Associative array of module-specific script data.
     */
    protected function get_module_specific_script_data() {
        // Add module-specific data
        return [
            'selectors' => [
                'categoriesSelect' => '#categories',
                'pricingMethodSelect' => '#pricing_method',
                'pricingSourceSelect' => '#pricing_source',
            ],
            'i18n' => [
                'selectCategories' => __('Please select categories', 'product-estimator'),
                'selectPricingMethod' => __('Please select a pricing method', 'product-estimator'),
                'selectPricingSource' => __('Please select a pricing source', 'product-estimator'),
                'confirmDelete' => __('Are you sure you want to delete this pricing rule?', 'product-estimator'),
                'addNew' => __('Add New Pricing Rule', 'product-estimator'),
                'saveChanges' => __('Save Changes', 'product-estimator'),
                'itemSavedSuccess' => __('Pricing rule saved successfully.', 'product-estimator'),
                'itemDeletedSuccess' => __('Pricing rule deleted successfully.', 'product-estimator'),
                'errorSavingItem' => __('Error saving pricing rule.', 'product-estimator'),
                'errorDeletingItem' => __('Error deleting pricing rule.', 'product-estimator'),
                'errorLoadingItem' => __('Error loading pricing rule details.', 'product-estimator'),
                'saveChangesButton' => __('Save Pricing Rule', 'product-estimator'),
                'updateChangesButton' => __('Update Pricing Rule', 'product-estimator'),
            ],
        ];
    }
}
