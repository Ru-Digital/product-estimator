<?php
namespace RuDigital\ProductEstimator\Includes\Admin\Settings;

/**
 * General Settings Module Class
 *
 * Implements the general settings tab functionality with vertical tabs.
 *
 * @since      1.1.0
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes/admin/settings
 */
final class GeneralSettingsModule extends SettingsModuleWithVerticalTabsBase implements SettingsModuleInterface {

    /**
     * Option name for this module's settings.
     *
     * @since    1.1.0
     * @access   protected
     * @var      string    $option_name    Option name for settings storage
     */
    protected $option_name = 'product_estimator_settings';

    /**
     * Array of settings keys managed by this module
     *
     * @since    1.1.0
     * @access   private
     * @var      array    $module_settings    Settings keys managed by this module
     */
    private $module_settings = [
        'estimate_expiry_days',
        'primary_product_categories',
        'pdf_template',
        'pdf_margin_top',
        'pdf_margin_bottom',
        'pdf_footer_text',
        'pdf_footer_contact_details_content',
        // Add any other settings managed by this module
    ];

    /**
     * Cached product categories to avoid multiple DB calls
     *
     * @since    1.1.0
     * @access   private
     * @var      array    $product_categories    Product categories
     */
    private $product_categories = null;

    /**
     * Set the tab and section details.
     *
     * @since    1.1.0
     * @access   protected
     */
    protected function set_tab_details() {
        $this->tab_id = 'general';
        $this->tab_title = __('General Settings', 'product-estimator');
        $this->section_id = 'estimator_settings';
        $this->section_title = __('General Settings', 'product-estimator');
    }

    /**
     * Define vertical tabs for this module.
     *
     * @since    1.1.0
     * @access   protected
     * @return   array    Array of vertical tabs
     */
    protected function get_vertical_tabs() {
        return [
            [
                'id' => 'settings',
                'title' => __('Settings', 'product-estimator'),
                'description' => __('Configure general estimator settings and defaults.', 'product-estimator'),
            ],
            [
                'id' => 'pdf-settings',
                'title' => __('PDF Settings', 'product-estimator'),
                'description' => __('Configure settings for PDF estimate exports.', 'product-estimator'),
            ],
        ];
    }

    /**
     * Register fields for specific vertical tabs.
     *
     * @since    1.1.0
     * @access   protected
     * @param    string    $vertical_tab_id    The ID of the vertical tab
     * @param    string    $page_slug_for_wp_api    The page slug for WordPress settings API
     */
    protected function register_vertical_tab_fields($vertical_tab_id, $page_slug_for_wp_api) {
        switch ($vertical_tab_id) {
            case 'settings':
                // Get product categories for select2 field
                if ($this->product_categories === null) {
                    $this->product_categories = [];
                    $categories = get_terms(['taxonomy' => 'product_cat', 'hide_empty' => false]);
                    if (!is_wp_error($categories)) {
                        foreach ($categories as $category) {
                            $this->product_categories[$category->term_id] = $category->name;
                        }
                    }
                }

                $fields = [
                    'estimate_expiry_days' => [
                        'title' => __('Estimate Validity (Days)', 'product-estimator'),
                        'type' => 'number',
                        'description' => __('Number of days an estimate remains valid', 'product-estimator'),
                        'default' => 30,
                        'min' => 1,
                        'max' => 365,
                    ],
                    'primary_product_categories' => [
                        'title' => __('Primary Product Categories', 'product-estimator'),
                        'type' => 'select',
                        'description' => __('Only one product from any of these categories can be added to a room', 'product-estimator'),
                        'options' => $this->product_categories,
                        'required' => true,
                        'attributes' => [
                            'multiple' => true,
                            'style' => 'width:100%;',
                            'class' => 'pe-select2 primary-product-categories-select pe-item-form-field',

                        ],
                    ],
                ];
                break;
            case 'pdf-settings':
                $fields = [
                    'pdf_template' => [
                        'title' => __('PDF Template', 'product-estimator'),
                        'type' => 'file',
                        'description' => __('Upload a PDF template file (required)', 'product-estimator'),
                        'accept' => 'application/pdf',
                        'required' => true,
                    ],
                    'pdf_margin_top' => [
                        'title' => __('Margin Top (mm)', 'product-estimator'),
                        'type' => 'number',
                        'description' => __('Top margin for PDF in millimeters', 'product-estimator'),
                        'default' => 15,
                        'min' => 0,
                        'max' => 200,
                    ],
                    'pdf_margin_bottom' => [
                        'title' => __('Margin Bottom (mm)', 'product-estimator'),
                        'type' => 'number',
                        'description' => __('Bottom margin for PDF in millimeters', 'product-estimator'),
                        'default' => 15,
                        'min' => 0,
                        'max' => 200,
                    ],
                    'pdf_footer_text' => [
                        'title' => __('Footer Text', 'product-estimator'),
                        'type' => 'html',
                        'description' => __('Text to display in the footer of PDF estimates', 'product-estimator'),
                    ],
                    'pdf_footer_contact_details_content' => [
                        'title' => __('Footer Contact Details', 'product-estimator'),
                        'type' => 'html',
                        'description' => __('Contact details to display in the footer of PDF estimates', 'product-estimator'),
                    ],
                ];
                break;
            default:
                $fields = [];
        }

        // Create a section for this vertical tab
        add_settings_section(
            $this->section_id . '_' . $vertical_tab_id,
            '', // No title needed as the vertical tab has its own title
            [$this, 'render_section_description_callback'],
            $page_slug_for_wp_api
        );

        // Register fields for this section
        foreach ($fields as $id => $field_args) {
            $callback_args = array_merge($field_args, ['id' => $id, 'label_for' => $id]);
            add_settings_field(
                $id,
                $field_args['title'],
                [$this, 'render_field_callback_proxy'],
                $page_slug_for_wp_api,
                $this->section_id . '_' . $vertical_tab_id,
                $callback_args
            );

            // Store this field for this sub-tab context
            $this->store_field_for_sub_tab($vertical_tab_id, $id, $callback_args);
        }
    }

    /**
     * Check if this module handles a specific setting
     *
     * @since    1.1.0
     * @access   public
     * @param    string    $key    Setting key
     * @return   bool    Whether this module handles the setting
     */
    public function has_setting($key) {
        return in_array($key, $this->module_settings);
    }

    /**
     * Get all checkbox fields for this module
     *
     * @since    1.1.0
     * @access   protected
     * @return   array    Checkbox field keys
     */
    protected function get_checkbox_fields() {
        return [
            // Add checkbox fields here
        ];
    }

    /**
     * Get all email fields for this module
     *
     * @since    1.1.0
     * @access   protected
     * @return   array    Email field keys
     */
    protected function get_email_fields() {
        return [
            // This module doesn't have email fields
        ];
    }

    /**
     * Get all number fields with their constraints for this module
     *
     * @since    1.1.0
     * @access   protected
     * @return   array    Number field keys with constraints
     */
    protected function get_number_fields() {
        return [
            'estimate_expiry_days' => [
                'min' => 1,
                'max' => 365
            ],
            'pdf_margin_top' => [
                'min' => 0,
                'max' => 200
            ],
            'pdf_margin_bottom' => [
                'min' => 0,
                'max' => 200
            ]
        ];
    }

    /**
     * Get all file fields with their constraints for this module
     *
     * @since    1.1.0
     * @access   protected
     * @return   array    File field keys with constraints
     */
    protected function get_file_fields() {
        return [
            'pdf_template' => [
                'required' => true,
                'accept' => 'application/pdf'
            ]
        ];
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
        if (!isset($form_data['product_estimator_settings'])) {
            return new \WP_Error('missing_data', __('No settings data received', 'product-estimator'));
        }

        $settings = $form_data['product_estimator_settings'];

        // Explicitly handle HTML fields
        $html_fields = ['pdf_footer_text', 'pdf_footer_contact_details_content'];

        foreach ($html_fields as $field) {
            if (isset($settings[$field])) {
                // Ensure HTML entities are properly decoded
                $settings[$field] = html_entity_decode($settings[$field], ENT_QUOTES);

                // Check for specific issues with the content
                if (strpos($settings[$field], '&lt;br') !== false ||
                    strpos($settings[$field], '&amp;') !== false) {
                    // Fix double-encoded HTML
                    $settings[$field] = html_entity_decode($settings[$field], ENT_QUOTES);
                }
            }
        }

        // Handle primary product categories (convert from string to array if needed)
        if (isset($settings['primary_product_categories'])) {
            $primary_categories = $settings['primary_product_categories'];
            if (!is_array($primary_categories)) {
                $primary_categories = !empty($primary_categories) ?
                    array_map('trim', explode(',', $primary_categories)) : [];
            }
            $settings['primary_product_categories'] = array_values(
                array_unique(array_filter(array_map('absint', $primary_categories)))
            );
        }

        // Update the form data
        $form_data['product_estimator_settings'] = $settings;

        return true;
    }

    /**
     * Additional actions after saving general settings
     *
     * @since    1.1.0
     * @access   protected
     * @param    array    $form_data    The processed form data
     */
    protected function after_save_actions($form_data) {
        if (method_exists(parent::class, 'after_save_actions')) {
            parent::after_save_actions($form_data);
        }
        delete_transient('product_estimator_general_settings');
    }

    /**
     * Verify HTML content is stored correctly and fix if needed
     *
     * @since    1.1.0
     * @access   private
     */
    private function verify_html_content_storage() {
        // The fields we need to check
        $html_fields = ['pdf_footer_text', 'pdf_footer_contact_details_content'];

        // Get current settings
        $settings = get_option('product_estimator_settings');
        $updated = false;

        foreach ($html_fields as $field) {
            if (isset($settings[$field])) {
                // Check if the field contains escaped HTML that needs fixing
                $original = $settings[$field];
                $decoded = html_entity_decode($original, ENT_QUOTES | ENT_HTML5);

                // Look for HTML entities that need decoding
                if ($decoded !== $original &&
                    (strpos($original, '&lt;') !== false ||
                        strpos($original, '&gt;') !== false ||
                        strpos($original, '&amp;') !== false)) {

                    // Fix the field by using the decoded version
                    $settings[$field] = $decoded;
                    $updated = true;

                    // Log for debugging
                    if (defined('WP_DEBUG') && WP_DEBUG) {
                        error_log("Fixed HTML content in field {$field}");
                        error_log("Original: " . $original);
                        error_log("Fixed: " . $decoded);
                    }
                }
            }
        }

        // Update settings if we fixed something
        if ($updated) {
            update_option('product_estimator_settings', $settings);
        }
    }

    /**
     * Field render callback proxy
     *
     * @since    1.1.0
     * @access   public
     * @param    array    $args    Field arguments
     */
    public function render_field_callback_proxy($args) {
        parent::render_field($args);
    }

    /**
     * Render a select field.
     *
     * @since    1.1.0
     * @access   protected
     * @param    array    $args    Field arguments.
     */
    protected function render_select_field($args) {
        $options = get_option('product_estimator_settings');
        $id = $args['id'];
        $current_value = isset($options[$id]) ? $options[$id] : '';

        if (empty($current_value) && isset($args['default'])) {
            $current_value = $args['default'];
        }

        // Build attributes
        $attrs = '';
        if (isset($args['attributes']) && is_array($args['attributes'])) {
            foreach ($args['attributes'] as $attr_name => $attr_value) {
                $attrs .= ' ' . esc_attr($attr_name) . '="' . esc_attr($attr_value) . '"';
            }
        }

        // Add required attribute if needed
        if (!empty($args['required'])) {
            $attrs .= ' required="required"';
        }

        // Add class attribute if specified
        if (!empty($args['class'])) {
            $attrs .= ' class="' . esc_attr($args['class']) . '"';
        }

        // Determine if multiple select and adjust name appropriately
        $is_multiple = !empty($args['multiple']) || (isset($args['attributes']['multiple']) && $args['attributes']['multiple']);
        $field_name = 'product_estimator_settings[' . esc_attr($id) . ']';
        if ($is_multiple) {
            $field_name .= '[]';
        }

        echo '<select id="' . esc_attr($id) . '" name="' . $field_name . '"' . $attrs . '>';

        foreach ($args['options'] as $value => $label) {
            $selected = '';
            if ($is_multiple && is_array($current_value)) {
                $selected = in_array($value, $current_value) ? 'selected="selected"' : '';
            } else {
                $selected = selected($current_value, $value, false);
            }
            echo '<option value="' . esc_attr($value) . '" ' . $selected . '>' . esc_html($label) . '</option>';
        }
        echo '</select>';

        if (isset($args['description'])) {
            echo '<p class="description">' . esc_html($args['description']) . '</p>';
        }
    }

    /**
     * Render the section description callback.
     *
     * @since    1.1.0
     * @access   public
     * @param    array    $args    Section arguments
     */
    public function render_section_description_callback($args) {
        $section_id = $args['id'] ?? '';

        if (strpos($section_id, 'settings') !== false) {
            echo '<p>' . esc_html__('Configure general estimator settings and defaults.', 'product-estimator') . '</p>';
        } elseif (strpos($section_id, 'pdf-settings') !== false) {
            echo '<p>' . esc_html__('Configure settings for PDF estimate exports.', 'product-estimator') . '</p>';
        }
    }

    /**
     * Enqueue module-specific scripts.
     *
     * @since    1.1.0
     * @access   public
     */
    public function enqueue_scripts() {
        // Enqueue Select2 for the product categories field
        wp_enqueue_script('select2', 'https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js', array('jquery'), '4.1.0', true);

        $this->provide_script_data_for_localization();
    }

    /**
     * Enqueue module-specific styles.
     *
     * @since    1.1.0
     * @access   public
     */
    public function enqueue_styles() {
        // Enqueue Select2 CSS
        wp_enqueue_style('select2', 'https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css', array(), '4.1.0');

        if (method_exists(parent::class, 'enqueue_styles')) {
            parent::enqueue_styles();
        }
    }

    /**
     * Get the JavaScript context name for this module.
     *
     * @since    1.1.0
     * @access   protected
     * @return   string    The JavaScript context name
     */
    protected function get_js_context_name() {
        return 'generalSettings';
    }

    /**
     * Get module-specific script data.
     *
     * @since    1.1.0
     * @access   protected
     * @return   array    Module-specific script data
     */
    protected function get_module_specific_script_data() {
        return [
            'option_name' => $this->option_name,
            'defaultSubTabId' => 'settings',
            'ajaxActionPrefix' => 'save_' . $this->tab_id,
            'i18n' => [
                'saveSuccess' => __('General settings saved successfully.', 'product-estimator'),
                'saveError' => __('Error saving general settings.', 'product-estimator'),
                'validationErrorMarkup' => __('Markup value must be within the valid range.', 'product-estimator'),
                'validationErrorExpiry' => __('Expiry days must be within the valid range.', 'product-estimator'),
                'validationErrorRequired' => __('This field is required.', 'product-estimator'),
                'selectCategories' => __('Select product categories', 'product-estimator'),
                'noResults' => __('No matching categories found', 'product-estimator'),
            ],
            'categories' => $this->product_categories ? $this->product_categories : [],
        ];
    }

    /**
     * Validate module-specific settings
     *
     * @since    1.1.0
     * @access   public
     * @param    array    $input    Settings to validate
     * @param    array    $context_field_definitions    Field definitions for the context
     * @return   array    Validated settings
     */
    public function validate_settings($input, $context_field_definitions = null) {
        $validated = parent::validate_settings($input, $context_field_definitions);

        if (is_wp_error($validated)) {
            return $validated;
        }

        return $validated;
    }
}
