<?php
namespace RuDigital\ProductEstimator\Includes\Admin\Settings;

/**
 * Product Upgrades Settings Module Class
 *
 * Implements functionality for managing product upgrade configurations in the admin area.
 * This module allows administrators to define relationships between product categories,
 * where products from one category can be upgraded to products from another category.
 * 
 * Product upgrades are displayed to customers when they add a product from a "base"
 * category to their estimate, offering them the option to upgrade to products from
 * the associated "upgrade" categories.
 *
 * @since      1.1.0
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes/admin/settings
 */
final class ProductUpgradesSettingsModule extends SettingsModuleWithTableBase implements SettingsModuleInterface {

    /**
     * Option name for storing product upgrades settings in the WordPress options table
     * 
     * This option stores an array of upgrade configurations, each with a unique key
     * and containing base categories, upgrade categories, display settings, and text.
     *
     * @since    1.1.0
     * @access   protected
     * @var      string $option_name Option name for storing product upgrade configurations
     */
    protected $option_name = 'product_estimator_product_upgrades';

    /**
     * Cache for product categories to prevent multiple taxonomy queries
     * 
     * @since    1.1.0
     * @access   private
     * @var      array|null $product_categories Array of product categories
     */
    private $product_categories = null;

    /**
     * Initialize the class and set its properties.
     * 
     * @since    1.1.0
     * @param    string    $plugin_name    The name of the plugin.
     * @param    string    $version        The version of this plugin.
     */
    public function __construct($plugin_name, $version) {
        parent::__construct($plugin_name, $version);
    }

    /**
     * Set the tab and section details for the admin interface.
     * 
     * Defines the tab ID, title, section ID, and section title for the product upgrades settings.
     *
     * @since    1.1.0
     * @access   protected
     */
    protected function set_tab_details() {
        $this->tab_id = 'product_upgrades';
        $this->tab_title = __('Product Upgrades', 'product-estimator');
        $this->section_id = 'product_upgrades_settings';
        $this->section_title = __('Product Upgrades Settings', 'product-estimator');
    }

    /**
     * Defines the vertical tabs structure for this module
     *
     * @since    1.1.0
     * @access   protected
     * @return   array    Array of tab definitions
     */
    protected function get_vertical_tabs() {
        return [
            // Main rules management table tab
            [
                'id'          => 'upgrade_rules_table',
                'title'       => $this->section_title,
                'description' => __('Manage product upgrade configurations for the estimator.', 'product-estimator'),
                'content_type'=> 'table',
            ],
            // Additional settings could be added here in the future
        ];
    }

    /**
     * Registers vertical tab fields - not needed for table-based tab
     *
     * @since    1.1.0
     * @access   protected
     * @param    string    $vertical_tab_id     Current tab ID being registered
     * @param    string    $page_slug_for_wp_api Page slug for WordPress Settings API
     */
    protected function register_vertical_tab_fields($vertical_tab_id, $page_slug_for_wp_api) {
        // No settings fields needed for the table tab
    }

    /**
     * Check if this module handles a specific setting
     * 
     * @param string $key Setting key to check
     * @return bool Whether this module handles the setting
     */
    public function has_setting($key) {
        // Handle all settings that start with upgrade_ prefix
        if (is_string($key) && strpos($key, 'upgrade_') === 0) {
            return true;
        }
        
        return false;
    }

    /**
     * Render the section description.
     *
     * @since    1.1.0
     * @access   public
     */
    public function render_section_description() {
        echo '<p>' . esc_html__('Manage product upgrades based on product categories. This allows customers to upgrade products to higher-tier alternatives.', 'product-estimator') . '</p>';
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
        
        // Use the parent class method to set up common script data and localization
        $this->provide_script_data_for_localization();
    }

    /**
     * Enqueue module-specific styles.
     *
     * @since    1.1.0
     * @access   public
     */
    public function enqueue_styles() {
        parent::enqueue_styles(); // Enqueues common table styles
        
        // Load Select2 CSS for enhanced dropdowns
        wp_enqueue_style('select2', 'https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css', array(), '4.1.0-rc.0');

        // Load module-specific styles
        wp_enqueue_style(
            $this->plugin_name . '-product-upgrades',
            PRODUCT_ESTIMATOR_PLUGIN_URL . 'admin/css/modules/product-upgrades-settings.css',
            array($this->plugin_name . '-settings', $this->plugin_name . '-admin-tables', 'select2'),
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
        return 'productUpgradesSettings';
    }

    /**
     * Returns module-specific script data for JavaScript
     *
     * @since    1.1.0
     * @access   protected
     * @return   array    Module-specific data for JS
     */
    protected function get_module_specific_script_data() {
        return [
            'i18n' => [
                'confirmDelete' => __('Are you sure you want to delete this upgrade configuration?', 'product-estimator'),
                'itemSavedSuccess' => __('Upgrade configuration saved successfully.', 'product-estimator'),
                'itemDeletedSuccess' => __('Upgrade configuration deleted successfully.', 'product-estimator'),
                'errorSavingItem' => __('Error saving upgrade configuration.', 'product-estimator'),
                'errorDeletingItem' => __('Error deleting upgrade configuration.', 'product-estimator'),
                'errorLoadingItem' => __('Error loading upgrade configuration details.', 'product-estimator'),
                'saveChangesButton' => __('Save Configuration', 'product-estimator'),
                'updateChangesButton' => __('Update Configuration', 'product-estimator'),
                'selectBaseCategories' => __('Please select at least one base category', 'product-estimator'),
                'selectUpgradeCategories' => __('Please select at least one upgrade category', 'product-estimator'),
            ],
            'selectors' => [
                // Updated selector names to match JS expectations
                'baseCategories' => '#base_categories',
                'upgradeCategories' => '#upgrade_categories',
                'upgradeTitle' => '#upgrade_title',
                'upgradeDescription' => '#upgrade_description',
            ]
        ];
    }

    /**
     * Get items for display in the table
     *
     * @since    1.1.0
     * @access   protected
     * @return   array    Array of items for the table
     */
    protected function get_items_for_table() {
        $upgrades = get_option($this->option_name, array());
        
        // Process upgrades to ensure each has an ID key
        $processed_upgrades = [];
        foreach ($upgrades as $id => $upgrade) {
            if (!is_array($upgrade)) continue;
            
            // Ensure item has an ID field (needed for table rendering)
            if (!isset($upgrade['id'])) {
                $upgrade['id'] = $id;
            }
            
            $processed_upgrades[$id] = $upgrade;
        }
        
        return $processed_upgrades;
    }

    /**
     * Define table columns for the upgrades table
     *
     * @since    1.1.0
     * @access   protected
     * @return   array    Array of column definitions
     */
    protected function get_table_columns() {
        return [
            'base_categories' => __('Base Categories', 'product-estimator'),
            'upgrade_categories' => __('Upgrade Categories', 'product-estimator'),
            'item_actions' => __('Actions', 'product-estimator')
        ];
    }

    /**
     * Render content for a specific cell in the table
     *
     * @since    1.1.0
     * @access   public
     * @param    array     $item        The upgrade configuration
     * @param    string    $column_name The column being rendered
     */
    public function render_table_cell_content($item, $column_name) {
        switch ($column_name) {
            case 'base_categories':
                $category_names = $this->get_category_names($item['base_categories'] ?? []);
                echo esc_html(implode(', ', $category_names));
                break;
                
            case 'upgrade_categories':
                $category_names = $this->get_category_names($item['upgrade_categories'] ?? []);
                echo esc_html(implode(', ', $category_names));
                break;
                
                
            case 'item_actions':
                echo $this->render_standard_item_actions($item);
                break;
        }
    }

    /**
     * Get the "Add New" button label
     *
     * @since    1.1.0
     * @access   protected
     * @return   string    Button label
     */
    protected function get_add_new_button_label() {
        return __('Add New Upgrade Configuration', 'product-estimator');
    }

    /**
     * Get the form title based on mode
     *
     * @since    1.1.0
     * @access   protected
     * @param    bool      $is_edit_mode Whether in edit mode
     * @return   string    Form title
     */
    protected function get_form_title($is_edit_mode = false) {
        return $is_edit_mode 
            ? __('Edit Upgrade Configuration', 'product-estimator') 
            : __('Add New Upgrade Configuration', 'product-estimator');
    }

    /**
     * Define form fields for adding/editing upgrade configurations
     *
     * @since    1.1.0
     * @access   protected
     * @return   array    Form field definitions
     */
    protected function get_item_form_fields_definition() {
        // Load product categories if not already loaded
        if ($this->product_categories === null) {
            $categories = get_terms([
                'taxonomy' => 'product_cat', 
                'hide_empty' => false
            ]);
            
            $this->product_categories = [];
            foreach ($categories as $category) {
                $this->product_categories[$category->term_id] = $category->name;
            }
        }
        
        // Display mode options removed
        
        // Define form fields
        return [
            // Hidden ID field
            [
                'id' => 'item_id',
                'type' => 'hidden'
            ],
            
            // Base Categories field (multi-select)
            [
                'id' => 'base_categories',
                'label' => __('Base Categories', 'product-estimator'),
                'type' => 'select',
                'options' => $this->product_categories,
                'required' => true,
                'attributes' => [
                    'multiple' => true,
                    'style' => 'width:100%;',
                    'class' => 'pe-select2 base-categories-select pe-item-form-field',
                ],
                'description' => __('Select categories containing products that can be upgraded.', 'product-estimator'),
            ],
            
            // Upgrade Categories field (multi-select)
            [
                'id' => 'upgrade_categories',
                'label' => __('Upgrade Categories', 'product-estimator'),
                'type' => 'select',
                'options' => $this->product_categories,
                'required' => true,
                'attributes' => [
                    'multiple' => true,
                    'style' => 'width:100%;',
                    'class' => 'pe-select2 upgrade-categories-select pe-item-form-field',
                ],
                'description' => __('Select categories containing products that will be offered as upgrades.', 'product-estimator'),
            ],
            
            // Display Mode field removed
            
            // Title field
            [
                'id' => 'upgrade_title',  // Changed from 'title' to match HTML ID
                'label' => __('Title', 'product-estimator'),
                'type' => 'text',
                'attributes' => [
                    'class' => 'regular-text pe-item-form-field',
                ],
                'description' => __('Title to display above upgrade options (optional).', 'product-estimator'),
            ],

            // Description field
            [
                'id' => 'upgrade_description',  // Changed from 'description' to match HTML ID
                'label' => __('Description', 'product-estimator'),
                'type' => 'textarea',
                'attributes' => [
                    'rows' => 3,
                    'class' => 'regular-text pe-item-form-field',
                ],
                'description' => __('Description text to display with upgrade options (optional).', 'product-estimator'),
            ],
        ];
    }

    /**
     * Validate item data before saving
     *
     * @since    1.1.0
     * @access   protected
     * @param    array     $raw_item_data     Raw data from form
     * @param    string    $item_id           Item ID (null for new items)
     * @param    array     $original_item_data Original item data (for edits)
     * @return   array|\WP_Error             Validated data or error
     */
    protected function validate_item_data(array $raw_item_data, $item_id = null, $original_item_data = null) {
        $sanitized_data = [];
        $errors = new \WP_Error();
        
        // Base Categories (required, array of IDs)
        $base_categories_input = $raw_item_data['base_categories'] ?? [];
        if (!is_array($base_categories_input)) {
            $base_categories_input = !empty($base_categories_input) ? array_map('trim', explode(',', $base_categories_input)) : [];
        }
        $sanitized_data['base_categories'] = array_values(array_unique(array_filter(array_map('absint', $base_categories_input))));
        if (empty($sanitized_data['base_categories'])) {
            $errors->add('missing_base_categories', __('Please select at least one base category.', 'product-estimator'));
        }
        
        // Upgrade Categories (required, array of IDs)
        $upgrade_categories_input = $raw_item_data['upgrade_categories'] ?? [];
        if (!is_array($upgrade_categories_input)) {
            $upgrade_categories_input = !empty($upgrade_categories_input) ? array_map('trim', explode(',', $upgrade_categories_input)) : [];
        }
        $sanitized_data['upgrade_categories'] = array_values(array_unique(array_filter(array_map('absint', $upgrade_categories_input))));
        if (empty($sanitized_data['upgrade_categories'])) {
            $errors->add('missing_upgrade_categories', __('Please select at least one upgrade category.', 'product-estimator'));
        }
        
        // Display Mode field removed
        
        // Title (optional string)
        $sanitized_data['title'] = isset($raw_item_data['upgrade_title']) ? sanitize_text_field($raw_item_data['upgrade_title']) : '';

        // Description (optional string)
        $sanitized_data['description'] = isset($raw_item_data['upgrade_description']) ? sanitize_textarea_field($raw_item_data['upgrade_description']) : '';
        
        if (!empty($errors->get_error_codes())) {
            return $errors;
        }
        
        return $sanitized_data;
    }

    /**
     * Prepare item data for edit form
     *
     * @since    1.1.0
     * @access   protected
     * @param    array     $item_data    Item data from database
     * @return   array     Prepared data for form
     */
    protected function prepare_item_for_form_population(array $item_data) {
        // Ensure we have proper array structure
        if (!is_array($item_data)) {
            return [];
        }

        // Get field definitions to ensure all expected fields are present
        $field_defs = $this->get_item_form_fields_definition();
        $prepared_data = $item_data;

        // Map internal field names to form field names
        if (isset($prepared_data['title'])) {
            $prepared_data['upgrade_title'] = $prepared_data['title'];
        }

        if (isset($prepared_data['description'])) {
            $prepared_data['upgrade_description'] = $prepared_data['description'];
        }

        // Ensure all expected form fields have values
        foreach ($field_defs as $def) {
            if (!isset($prepared_data[$def['id']])) {
                // Set appropriate default values based on field type
                if ($def['type'] === 'select' && !empty($def['attributes']['multiple'])) {
                    // Multi-select fields default to empty array
                    $prepared_data[$def['id']] = [];
                } else {
                    // Standard fields get default or empty string
                    $prepared_data[$def['id']] = $def['default'] ?? '';
                }
            }
        }

        return $prepared_data;
    }

    /**
     * Prepare item for display in response
     *
     * @since    1.1.0
     * @access   protected
     * @param    array     $saved_item    The saved item
     * @return   array     Item with display data
     */
    protected function prepare_item_for_response(array $saved_item) {
        $response_item = $saved_item;

        // Add base category names
        if (!empty($saved_item['base_categories'])) {
            $response_item['base_category_names'] = implode(', ', $this->get_category_names($saved_item['base_categories']));
            // Also add display-specific fields for direct table column mapping
            $response_item['base_categories_display'] = $response_item['base_category_names'];
        } else {
            $response_item['base_category_names'] = '';
            $response_item['base_categories_display'] = '';
        }

        // Add upgrade category names
        if (!empty($saved_item['upgrade_categories'])) {
            $response_item['upgrade_category_names'] = implode(', ', $this->get_category_names($saved_item['upgrade_categories']));
            // Also add display-specific fields for direct table column mapping
            $response_item['upgrade_categories_display'] = $response_item['upgrade_category_names'];
        } else {
            $response_item['upgrade_category_names'] = '';
            $response_item['upgrade_categories_display'] = '';
        }

        // Display Mode removed from response

        // Make a debugging log of the response structure for easier debugging
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('Product Upgrades prepare_item_for_response structure: ' . print_r($response_item, true));
        }

        return $response_item;
    }

    /**
     * Helper to get category names from IDs
     *
     * @since    1.1.0
     * @access   private
     * @param    array     $category_ids    Array of category IDs
     * @return   array     Array of category names
     */
    private function get_category_names($category_ids) {
        $category_names = [];
        
        if (!is_array($category_ids)) {
            $category_ids = [$category_ids];
        }
        
        foreach ($category_ids as $cat_id) {
            $term = get_term($cat_id, 'product_cat');
            if (!is_wp_error($term) && $term) {
                $category_names[] = $term->name;
            }
        }
        
        return $category_names;
    }

    /**
     * Action to perform after saving settings
     *
     * @since    1.1.0
     * @access   protected
     * @param    array     $form_data    The form data
     */
    protected function after_save_actions($form_data) {
        // Clear any caches for product upgrades
        delete_transient('product_estimator_upgrade_options');
    }
}