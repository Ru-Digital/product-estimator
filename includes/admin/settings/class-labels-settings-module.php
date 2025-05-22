<?php
namespace RuDigital\ProductEstimator\Includes\Admin\Settings;

use RuDigital\ProductEstimator\Includes\LabelsStructure;

/**
 * Labels Settings Module Class
 *
 * Implements the labels settings tab functionality with V3 hierarchical
 * label structures and nested categories.
 *
 * @since      3.0.0
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes/admin/settings
 */
final class LabelsSettingsModule extends SettingsModuleWithVerticalTabsBase implements SettingsModuleInterface {

    protected $option_name = 'product_estimator_labels';
    private $label_categories = [];
    private $hierarchical_structure = [];

    protected function set_tab_details() {
        $this->tab_id    = 'labels';
        $this->tab_title = __( 'Labels', 'product-estimator' );
        $this->section_id = 'labels_settings_section';
        $this->section_title = __( 'Manage Labels', 'product-estimator' );

        // Define the main categories that will appear as vertical tabs (V3 Field-Grouped Structure)
        $this->label_categories = [
            'estimate_management' => [
                'id' => 'estimate_management',
                'title' => __( 'Estimate Management', 'product-estimator' ),
                'description' => __( 'Labels for estimate creation, selection, and actions.', 'product-estimator' ),
            ],
            'room_management' => [
                'id' => 'room_management',
                'title' => __( 'Room Management', 'product-estimator' ),
                'description' => __( 'Labels for room forms, selection, and actions.', 'product-estimator' ),
            ],
            'customer_details' => [
                'id' => 'customer_details',
                'title' => __( 'Customer Details', 'product-estimator' ),
                'description' => __( 'Labels for customer forms and contact methods.', 'product-estimator' ),
            ],
            'product_management' => [
                'id' => 'product_management',
                'title' => __( 'Product Management', 'product-estimator' ),
                'description' => __( 'Labels for product selection and management (Phase 2).', 'product-estimator' ),
            ],
            'common_ui' => [
                'id' => 'common_ui',
                'title' => __( 'Common UI', 'product-estimator' ),
                'description' => __( 'Common buttons, dialogs, and UI elements.', 'product-estimator' ),
            ],
            'modal_system' => [
                'id' => 'modal_system',
                'title' => __( 'Modal System', 'product-estimator' ),
                'description' => __( 'Labels for modal dialogs and popups.', 'product-estimator' ),
            ],
            'search_and_filters' => [
                'id' => 'search_and_filters',
                'title' => __( 'Search & Filters', 'product-estimator' ),
                'description' => __( 'Labels for search controls and filtering (Phase 2).', 'product-estimator' ),
            ],
            'pdf_generation' => [
                'id' => 'pdf_generation',
                'title' => __( 'PDF Generation', 'product-estimator' ),
                'description' => __( 'Labels specific to PDF generation.', 'product-estimator' ),
            ],
        ];

        // Load the current V3 hierarchical structure (values only, no metadata)
        // This is used for merging with saved data and defaults
        $this->hierarchical_structure = LabelsStructure::get_label_values_only();
    }

    public function register_hooks() {
        parent::register_hooks(); // This registers wp_ajax_save_labels_settings through the base class

        // Add AJAX handlers for labels management
        add_action('wp_ajax_pe_export_labels', [$this, 'ajax_export_labels']);
        add_action('wp_ajax_pe_import_labels', [$this, 'ajax_import_labels']);
        add_action('wp_ajax_pe_bulk_update_labels', [$this, 'ajax_bulk_update_labels']);
        add_action('wp_ajax_pe_reset_category_labels', [$this, 'ajax_reset_category_labels']);
        add_action('wp_ajax_pe_clear_label_caches', [$this, 'ajax_clear_label_caches']);
    }

    public function render_section_description() {
        echo '<p>' . esc_html__('This section allows administrators to configure and manage all text labels used throughout the Product Estimator. Labels are organized into a hierarchical structure for easier management.', 'product-estimator') . '</p>';
        echo '<p>' . esc_html__('The new hierarchical structure groups labels by feature and function, making it easier to find and update related labels.', 'product-estimator') . '</p>';
    }

    protected function get_vertical_tabs() {
        $tabs = [];
        foreach ( $this->label_categories as $category_id => $category ) {
            $tabs[] = [
                'id'          => $category_id,
                'title'       => $category['title'],
                'description' => $category['description'] ?? '',
            ];
        }
        return $tabs;
    }

    protected function register_vertical_tab_fields( $vertical_tab_id, $page_slug_for_wp_api ) {
        $labels = $this->get_labels_for_category( $vertical_tab_id );
        $current_section_id = $this->section_id . '_' . $vertical_tab_id;

        // Create a single section for each category
        add_settings_section(
            $this->section_id . '_' . $vertical_tab_id,
            '', // No title needed as category name is already displayed
            [$this, 'render_category_description'],
            $page_slug_for_wp_api
        );

        // Process labels recursively to handle hierarchical structure
        $this->register_hierarchical_fields(
            $labels,
            $vertical_tab_id,
            $page_slug_for_wp_api,
            $current_section_id,
            $vertical_tab_id  // Start the path with the vertical tab ID
        );
    }

    /**
     * Register fields recursively to handle hierarchical structure
     *
     * @param array  $labels        The labels array (possibly nested)
     * @param string $vertical_tab_id The current vertical tab ID
     * @param string $page_slug     The page slug for WordPress API
     * @param string $section_id    The current section ID
     * @param string $parent_path   The parent path for nested fields
     * @param int    $depth         Current depth in hierarchy
     */
    protected function register_hierarchical_fields($labels, $vertical_tab_id, $page_slug, $section_id, $parent_path = '', $depth = 0) {
        $has_fields_heading = false;

        foreach ($labels as $key => $value) {
            // Generate the field path
            $field_path = $parent_path ? $parent_path . '.' . $key : $key;

            // If the value is an array, it could be a nested category or a field with properties
            if (is_array($value)) {
                // Check if this is a field with properties (has label, placeholder, validation_*, etc.)
                if ($this->is_field_with_properties($value)) {
                    // Add "Fields" heading before the first field if we haven't already
                    if (!$has_fields_heading && $depth === 1) {
                        $this->add_fields_section_heading($page_slug, $section_id, $depth);
                        $has_fields_heading = true;
                    }

                    // Add a field heading first
                    $this->add_field_heading($key, $field_path, $page_slug, $section_id, $depth);

                    // Register each property of the field (label, placeholder, validation_*, etc.)
                    foreach ($value as $prop_key => $prop_value) {
                        $prop_path = $field_path . '.' . $prop_key;

                        // Handle validation arrays specially
                        if ($prop_key === 'validation' && is_array($prop_value)) {
                            // Register each validation rule as a separate field
                            foreach ($prop_value as $validation_key => $validation_value) {
                                $validation_path = $prop_path . '.' . $validation_key;
                                $this->register_label_field($vertical_tab_id, $validation_key, $validation_value, $validation_path, $page_slug, $section_id, $depth + 1);
                            }
                        } else {
                            $this->register_label_field($vertical_tab_id, $prop_key, $prop_value, $prop_path, $page_slug, $section_id, $depth + 1);
                        }
                    }
                } else {
                    // It's a nested category - add subheading and process nested labels
                    $this->add_subcategory_heading($key, $field_path, $page_slug, $section_id, $depth);

                    // Process the nested labels
                    $this->register_hierarchical_fields(
                        $value,
                        $vertical_tab_id,
                        $page_slug,
                        $section_id,
                        $field_path,
                        $depth + 1
                    );
                }
            } else {
                // It's a leaf node (actual label value)
                $this->register_label_field(
                    $vertical_tab_id,
                    $key,
                    $value,
                    $field_path,
                    $page_slug,
                    $section_id,
                    $depth
                );
            }
        }
    }

    /**
     * Check if an array represents a field with properties rather than a category
     *
     * @param array $value The array to check
     * @return bool True if it's a field with properties
     */
    private function is_field_with_properties($value) {
        // Check for common field properties (form fields)
        $field_properties = ['label', 'placeholder', 'description'];

        // Check for button, message, and heading properties
        $ui_element_properties = ['text']; // buttons have 'label', messages/headings have 'text'

        // Check for validation properties
        $has_validation = false;
        foreach ($value as $key => $val) {
            if (strpos($key, 'validation_') === 0) {
                $has_validation = true;
                break;
            }
        }

        // Check if it has any field properties
        $has_field_properties = false;
        foreach ($field_properties as $property) {
            if (isset($value[$property])) {
                $has_field_properties = true;
                break;
            }
        }

        // Check if it has UI element properties (buttons, messages, headings)
        $has_ui_element_properties = false;
        foreach ($ui_element_properties as $property) {
            if (isset($value[$property])) {
                $has_ui_element_properties = true;
                break;
            }
        }

        // Also check for 'label' property (used by buttons)
        if (isset($value['label'])) {
            $has_ui_element_properties = true;
        }

        return $has_field_properties || $has_validation || $has_ui_element_properties;
    }


    /**
     * Add a "Fields" section heading
     *
     * @param string $page_slug  The page slug for WordPress API
     * @param string $section_id The current section ID
     * @param int    $depth      Current depth in hierarchy
     */
    protected function add_fields_section_heading($page_slug, $section_id, $depth) {
        // Create a unique ID for this heading
        $heading_id = 'fields_section_heading_' . $section_id;

        // Register a custom field for the heading
        add_settings_field(
            $heading_id,
            '', // No label needed
            [$this, 'render_fields_section_heading'],
            $page_slug,
            $section_id,
            [
                'heading_text' => 'Fields',
                'depth' => $depth, // Same depth as other subcategories
                'is_fields_section' => true,
            ]
        );
    }

    /**
     * Add a field heading for a field with properties
     *
     * @param string $key        The field key
     * @param string $field_path The full path to this field
     * @param string $page_slug  The page slug for WordPress API
     * @param string $section_id The current section ID
     * @param int    $depth      Current depth in hierarchy
     */
    protected function add_field_heading($key, $field_path, $page_slug, $section_id, $depth) {
        // Format the field key for display - remove '_field' suffix if present
        $display_name = str_replace('_field', '', $key);
        $display_name = ucwords(str_replace('_', ' ', $display_name));

        // Create a unique ID for this heading
        $heading_id = 'field_heading_' . sanitize_key($field_path);

        // Register a custom field for the heading
        add_settings_field(
            $heading_id,
            '', // No label needed
            [$this, 'render_field_heading'],
            $page_slug,
            $section_id,
            [
                'heading_text' => $display_name,
                'field_path' => $field_path,
                'depth' => $depth,
                'is_field' => true,
            ]
        );
    }

    /**
     * Add a subcategory heading
     *
     * @param string $key        The subcategory key
     * @param string $field_path The full path to this subcategory
     * @param string $page_slug  The page slug for WordPress API
     * @param string $section_id The current section ID
     * @param int    $depth      Current depth in hierarchy
     */
    protected function add_subcategory_heading($key, $field_path, $page_slug, $section_id, $depth) {
        // Format the subcategory key for display
        $display_name = ucwords(str_replace('_', ' ', $key));

        // Create a unique ID for this heading
        $heading_id = 'heading_' . sanitize_key($field_path);

        // Register a custom field for the heading
        add_settings_field(
            $heading_id,
            '', // No label needed
            [$this, 'render_subcategory_heading'],
            $page_slug,
            $section_id,
            [
                'heading_text' => $display_name,
                'field_path' => $field_path,
                'depth' => $depth,
            ]
        );
    }

    /**
     * Register an individual label field
     *
     * @param string $vertical_tab_id The current vertical tab ID
     * @param string $key          The label key
     * @param string $value        The label value
     * @param string $field_path   The full path to this field
     * @param string $page_slug    The page slug for WordPress API
     * @param string $section_id   The current section ID
     * @param int    $depth        Current depth in hierarchy
     */
    protected function register_label_field($vertical_tab_id, $key, $value, $field_path, $page_slug, $section_id, $depth) {
        // Format the key for display
        $label_title = ucwords(str_replace('_', ' ', $key));

        // Generate HTML ID from the field path
        $display_id = 'label_' . sanitize_key($field_path);

        // Field ID is the path in brackets notation for proper form submission
        // e.g., "ui.buttons.save" becomes "ui[buttons][save]"
        $field_id = $this->path_to_brackets($field_path);

        $callback_args = [
            'id'          => $display_id, // HTML ID for the element
            'field_id'    => $field_id,   // Field ID for data matching
            'field_path'  => $field_path, // Full path for reference
            'type'        => 'text',
            'description' => $this->get_label_description($vertical_tab_id, $field_path),
            'default'     => $value,
            'label_for'   => $display_id,
            'category'    => $vertical_tab_id,
            'label_key'   => $key,
            'value'       => $value,
            'depth'       => $depth,
        ];

        add_settings_field(
            $display_id,
            $label_title,
            [$this, 'render_label_field'],
            $page_slug,
            $section_id,
            $callback_args
        );

        // Store the field for use in validation
        $this->store_field_for_sub_tab($vertical_tab_id, $field_id, $callback_args);
    }

    /**
     * Render a "Fields" section heading
     *
     * @param array $args The arguments for the heading
     */
    public function render_fields_section_heading($args) {
        $heading_text = $args['heading_text'] ?? 'Fields';
        $depth = $args['depth'] ?? 0;

        // Calculate indentation based on depth
        $indent_style = $depth > 0 ? 'margin-left: ' . ($depth * 20) . 'px;' : '';

        // Use the same rendering as subcategory headings for consistency
        $heading_tag = 'h4';
        $heading_class = 'pe-label-subcategory-heading depth-' . $depth . ' section-header-needs-colspan';

        echo '<' . $heading_tag . ' class="' . esc_attr($heading_class) . '" style="' . esc_attr($indent_style) . '">';
        echo esc_html($heading_text);
        echo '</' . $heading_tag . '>';

        // Add a data attribute for JavaScript interaction
        echo '<div class="pe-label-subcategory-data" data-path="fields" style="display:none;"></div>';
    }

    /**
     * Render a field heading (for fields with properties)
     *
     * @param array $args The arguments for the heading
     */
    public function render_field_heading($args) {
        $heading_text = $args['heading_text'] ?? '';
        $depth = $args['depth'] ?? 0;
        $field_path = $args['field_path'] ?? '';

        // Calculate indentation based on depth
        $indent_style = $depth > 0 ? 'margin-left: ' . ($depth * 20) . 'px;' : '';

        // Use a distinct styling for field headings
        echo '<div class="pe-field-heading depth-' . esc_attr($depth) . ' section-header-needs-colspan" style="' . esc_attr($indent_style) . '">';
        echo '<h4 class="pe-field-heading-title">' . esc_html($heading_text) . '</h4>';
        echo '</div>';

        // Add a data attribute for JavaScript interaction
        echo '<div class="pe-field-heading-data" data-path="' . esc_attr($field_path) . '" style="display:none;"></div>';
    }

    /**
     * Render a subcategory heading
     *
     * @param array $args The arguments for the heading
     */
    public function render_subcategory_heading($args) {
        $heading_text = $args['heading_text'] ?? '';
        $depth = $args['depth'] ?? 0;
        $field_path = $args['field_path'] ?? '';

        // Calculate indentation based on depth
        $indent_style = $depth > 0 ? 'margin-left: ' . ($depth * 20) . 'px;' : '';

        // Use section header for main categories, regular headings for subcategories
        if ($depth === 0) {
            // For section headers, we'll use JavaScript to modify the table structure
            echo '<div class="section-header section-header-needs-colspan pe-main-section-header" style="' . esc_attr($indent_style) . '" data-heading="' . esc_attr($heading_text) . '">';
            echo esc_html($heading_text);
            echo '</div>';
        } else {
            // Different heading levels based on depth
            $heading_tag = 'h4';
            $heading_class = 'pe-label-subcategory-heading depth-' . $depth . ' section-header-needs-colspan';

            echo '<' . $heading_tag . ' class="' . esc_attr($heading_class) . '" style="' . esc_attr($indent_style) . '">';
            echo esc_html($heading_text);
            echo '</' . $heading_tag . '>';
        }

        // Add a data attribute for JavaScript interaction
        echo '<div class="pe-label-subcategory-data" data-path="' . esc_attr($field_path) . '" style="display:none;"></div>';
    }

    /**
     * Convert a dot-notation path to brackets notation for form fields
     *
     * @param string $path Dot-notation path (e.g., "ui.buttons.save")
     * @return string Brackets notation (e.g., "ui[buttons][save]")
     */
    protected function path_to_brackets($path) {
        $parts = explode('.', $path);

        if (empty($parts)) {
            return '';
        }

        $result = array_shift($parts); // First part without brackets

        foreach ($parts as $part) {
            $result .= '[' . $part . ']';
        }

        return $result;
    }

    /**
     * Render a label field
     *
     * @param array $args The arguments for the field
     */
    public function render_label_field($args) {
        $options = get_option($this->option_name, []);
        $field_path = $args['field_path'] ?? '';
        $depth = $args['depth'] ?? 0;


        // Get the current value with fallback to default
        $current_value = $this->get_value_from_path($options, $field_path, $args['default'] ?? '');

        // Field name for nested structure based on brackets notation
        // Include the category in the field name structure
        $category = $args['category'] ?? '';
        $field_name = $this->option_name . '[' . $category . '][' . $args['field_id'] . ']';

        // Calculate indentation based on depth
        $indent_style = $depth > 0 ? 'margin-left: ' . ($depth * 20) . 'px;' : '';

        // Create enhanced wrapper with better structure
        echo '<div class="form-field pe-label-field-wrapper depth-' . esc_attr($depth) . '" style="' . esc_attr($indent_style) . '">';

        // Field label
        echo '<label class="field-label" for="' . esc_attr($args['id']) . '">';
        echo esc_html($args['label'] ?? ucfirst(str_replace('_', ' ', $field_path)));
        echo '</label>';

        // Path indicator to show hierarchy
        if ($depth > 0) {
            echo '<div class="field-meta">';
            echo '<div class="field-key">' . esc_html($field_path) . '</div>';
            echo '</div>';
        }

        // Input group
        echo '<div class="field-input-group">';
        echo '<input type="text" id="' . esc_attr($args['id']) . '" name="' . esc_attr($field_name) . '" value="' . esc_attr($current_value) . '" class="regular-text" data-path="' . esc_attr($field_path) . '" />';
        echo '</div>';

        // Add description if provided
        if (!empty($args['description'])) {
            echo '<div class="field-description">' . esc_html($args['description']) . '</div>';
        }


        // Add usage info in meta box
        echo '<div class="field-meta">';
        $this->render_label_usage($args['category'], $field_path);
        echo '</div>';

        echo '</div>';
    }

    /**
     * Get a value from a nested array using dot notation path
     *
     * @param array  $array The array to search in
     * @param string $path  The dot notation path
     * @param mixed  $default The default value if path not found
     * @return mixed The value at the path or default
     */
    protected function get_value_from_path($array, $path, $default = '') {
        $parts = explode('.', $path);
        $current = $array;

        foreach ($parts as $part) {
            if (!is_array($current) || !isset($current[$part])) {
                return $default;
            }
            $current = $current[$part];
        }

        return $current;
    }

    public function render_category_description() {
        echo '<p class="description">' . esc_html__('Update the text labels for this category. Changes will be reflected throughout the estimator.', 'product-estimator') . '</p>';
        echo '<p class="description">' . esc_html__('Labels are organized hierarchically by feature and function.', 'product-estimator') . '</p>';
    }

    public function render_label_usage($category, $field_path) {
        // Show a preview of where this label is used
        $usage = $this->get_label_usage($category, $field_path);
        if (!empty($usage)) {
            echo '<div class="label-usage-preview">';
            echo '<strong>' . esc_html__('Used in:', 'product-estimator') . '</strong> ' . esc_html($usage);
            echo '</div>';
        }
    }

    /**
     * Get the labels for a specific category from the hierarchical structure
     *
     * @param string $category The category ID
     * @return array The labels for this category
     */
    private function get_labels_for_category($category) {
        // Get saved labels from DB
        $saved_labels = get_option($this->option_name, []);

        // Get default hierarchical structure
        $default_structure = $this->hierarchical_structure[$category] ?? [];

        // If there's no saved data for this category, use defaults
        if (!isset($saved_labels[$category])) {
            return $default_structure;
        }

        // Merge default structure with saved labels to ensure we have all fields
        // This is a deep merge that preserves structure but prioritizes saved values
        return $this->deep_merge($default_structure, $saved_labels[$category]);
    }

    /**
     * Deep merge two arrays preserving keys and nested structure
     *
     * @param array $default Default structure with all keys
     * @param array $custom  Custom values to override defaults
     * @return array Merged array
     */
    private function deep_merge($default, $custom) {
        $result = $default;

        foreach ($custom as $key => $value) {
            // If both are arrays, recursively merge
            if (isset($result[$key]) && is_array($result[$key]) && is_array($value)) {
                $result[$key] = $this->deep_merge($result[$key], $value);
            }
            // Otherwise, custom value overrides default
            else {
                $result[$key] = $value;
            }
        }

        return $result;
    }

    private function get_label_description($category, $field_path) {
        // Use centralized structure for descriptions
        $description = LabelsStructure::get_description($field_path);

        // If no description found, generate a generic one
        if (empty($description)) {
            $parts = explode('.', $field_path);
            $humanized = str_replace('_', ' ', end($parts));
            return sprintf(
                __('Text for %s in the %s section', 'product-estimator'),
                $humanized,
                $category
            );
        }

        return $description;
    }

    private function get_label_usage($category, $field_path) {
        // Use centralized structure for usage information
        $usage = LabelsStructure::get_usage($field_path);

        // If no usage found, generate a generic one
        if (empty($usage)) {
            $parts = explode('.', $field_path);
            $section = isset($parts[1]) ? ucwords(str_replace('_', ' ', $parts[1])) : '';
            $context = isset($parts[0]) ? ucwords(str_replace('_', ' ', $parts[0])) : '';

            if ($section && $context) {
                return sprintf(
                    __('Used in %s section of the %s interface', 'product-estimator'),
                    $section,
                    $context
                );
            }
        }

        return $usage;
    }

    public function render_vertical_tabs_sidebar() {
        ?>
        <div class="pe-vtabs-sidebar-panel label-management-tools">
            <h3><?php esc_html_e( 'Label Management', 'product-estimator' ); ?></h3>

            <div class="label-tools-section">
                <h4><?php esc_html_e( 'Quick Actions', 'product-estimator' ); ?></h4>
                <button type="button" class="button" id="export-labels">
                    <?php esc_html_e( 'Export Labels', 'product-estimator' ); ?>
                </button>
                <button type="button" class="button" id="import-labels">
                    <?php esc_html_e( 'Import Labels', 'product-estimator' ); ?>
                </button>
                <input type="file" id="import-file" style="display: none;" accept=".json" />
                <button type="button" class="button" id="reset-category-defaults">
                    <?php esc_html_e( 'Reset Category to Defaults', 'product-estimator' ); ?>
                </button>
                <button type="button" class="button button-secondary" id="clear-label-caches">
                    <?php esc_html_e( 'Clear Label Caches', 'product-estimator' ); ?>
                </button>
            </div>

            <div class="label-search-section">
                <h4><?php esc_html_e( 'Search Labels', 'product-estimator' ); ?></h4>
                <input type="text" id="label-search" placeholder="<?php esc_attr_e( 'Search labels...', 'product-estimator' ); ?>" class="regular-text" />
                <p class="description"><?php esc_html_e( 'Search by label key or value', 'product-estimator' ); ?></p>
                <div id="label-search-results"></div>
            </div>

            <div class="label-bulk-edit-section" style="display: none;">
                <h4><?php esc_html_e( 'Bulk Edit', 'product-estimator' ); ?></h4>
                <div id="bulk-edit-items"></div>
                <button type="button" class="button button-primary" id="apply-bulk-edits">
                    <?php esc_html_e( 'Apply Changes', 'product-estimator' ); ?>
                </button>
                <button type="button" class="button" id="cancel-bulk-edit">
                    <?php esc_html_e( 'Cancel', 'product-estimator' ); ?>
                </button>
            </div>

            <div class="label-info-section">
                <h4><?php esc_html_e( 'Information', 'product-estimator' ); ?></h4>
                <p><?php esc_html_e( 'Labels are automatically cached for performance. Changes will be reflected immediately on the frontend.', 'product-estimator' ); ?></p>
                <p>
                    <strong><?php esc_html_e( 'Version:', 'product-estimator' ); ?></strong>
                    <?php echo esc_html(get_option('product_estimator_labels_version', '2.5.0')); ?>
                </p>
                <p>
                    <strong><?php esc_html_e( 'Structure:', 'product-estimator' ); ?></strong>
                    <?php esc_html_e( 'Hierarchical', 'product-estimator' ); ?>
                </p>
            </div>
        </div>
        <?php
    }

    protected function get_js_context_name() {
        return 'labelSettings';
    }

    protected function get_module_specific_script_data() {
        $data = [
            'option_name'         => $this->option_name,
            'defaultSubTabId'     => 'common',
            'ajaxActionPrefix'    => 'save_' . $this->tab_id,
            'categories'          => array_keys($this->label_categories),
            'managementNonce'     => wp_create_nonce('pe_labels_management'),
            'hierarchical'        => true, // Flag to indicate hierarchical structure
        ];

        $data['i18n'] = [
            'saveSuccess' => __('Label settings saved successfully.', 'product-estimator'),
            'saveError'   => __('Error saving label settings.', 'product-estimator'),
            'resetConfirm' => __('Are you sure you want to reset this category to default values?', 'product-estimator'),
            'exportSuccess' => __('Labels exported successfully.', 'product-estimator'),
            'importSuccess' => __('Labels imported successfully.', 'product-estimator'),
            'importError' => __('Error importing labels. Please check the file format.', 'product-estimator'),
            'bulkUpdateSuccess' => __('Labels updated successfully.', 'product-estimator'),
            'bulkUpdateError' => __('Error updating labels.', 'product-estimator'),
            'confirmImport' => __('This will replace all existing labels. Are you sure?', 'product-estimator'),
            'searchNoResults' => __('No labels found matching your search.', 'product-estimator'),
            'searchResultsCount' => __('%d labels found.', 'product-estimator'),
            'expandAll' => __('Expand All', 'product-estimator'),
            'collapseAll' => __('Collapse All', 'product-estimator'),
        ];

        return $data;
    }

    public function enqueue_scripts() {
        // Make sure to provide the script data
        $this->provide_script_data_for_localization();
    }


    /**
     * Override the handle_ajax_save method to handle hierarchical structure
     */
    public function handle_ajax_save() {
        if (defined('WP_DEBUG') && WP_DEBUG) { error_log('--- HIERARCHICAL AJAX SAVE START (' . get_class($this) . ') ---'); }

        if (!isset($_POST['nonce']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['nonce'])), 'product_estimator_settings_nonce')) {
            wp_send_json_error(['message' => __('Security check failed', 'product-estimator')], 403); exit;
        }

        if (!current_user_can('manage_options')) {
            wp_send_json_error(['message' => __('You do not have permission to change these settings', 'product-estimator')], 403); exit;
        }

        if (!isset($_POST['form_data'])) {
            if (defined('WP_DEBUG') && WP_DEBUG) { error_log('form_data not in POST.'); }
            wp_send_json_error(['message' => __('No form data received', 'product-estimator')], 400); exit;
        }

        parse_str(wp_unslash($_POST['form_data']), $parsed_form_data);
        if (defined('WP_DEBUG') && WP_DEBUG) { error_log('Parsed form_data: ' . print_r($parsed_form_data, true)); }

        // Get the current category (sub-tab) being updated
        $current_context_id = isset($_POST['sub_tab_id']) ? sanitize_key($_POST['sub_tab_id']) : null;
        if (!$current_context_id || !isset($this->label_categories[$current_context_id])) {
            wp_send_json_error(['message' => __('Error: Invalid category context.', 'product-estimator')]); exit;
        }

        // Get existing options
        $existing_options = get_option($this->option_name, []);
        if (!is_array($existing_options)) { $existing_options = []; }

        // Get the submitted data for the current category from form data
        $category_data = $parsed_form_data[$this->option_name][$current_context_id] ?? [];

        if (empty($category_data)) {
            wp_send_json_error(['message' => __('Error: No data received for this category.', 'product-estimator')]); exit;
        }

        // Create/update the category in existing options
        $existing_options[$current_context_id] = $this->process_hierarchical_data(
            $category_data,
            $existing_options[$current_context_id] ?? []
        );

        // Save the updated options
        update_option($this->option_name, $existing_options);

        // Increment version for cache busting
        update_option('product_estimator_labels_version', time());

        // Clear caches
        delete_transient('pe_frontend_labels_cache');

        wp_send_json_success([
            'message' => sprintf(
                __('%s labels saved successfully.', 'product-estimator'),
                $this->label_categories[$current_context_id]['title']
            )
        ]);
        exit;
    }

    /**
     * Process hierarchical data from form submission
     *
     * @param array $submitted_data The data submitted in the form
     * @param array $existing_data  Existing data for this category
     * @return array The processed hierarchical data
     */
    private function process_hierarchical_data($submitted_data, $existing_data) {
        $processed_data = $existing_data;

        // Process each key in the submitted data
        foreach ($submitted_data as $key => $value) {
            // Check if the key contains brackets indicating a nested structure
            if (strpos($key, '[') !== false) {
                // Extract the path from the bracketed key format
                $path = $this->brackets_to_path($key);
                $path_parts = explode('.', $path);

                // Set the value at the specified path
                $this->set_value_at_path($processed_data, $path_parts, $value);
            } else {
                // It's a top-level key
                $processed_data[$key] = sanitize_text_field($value);
            }
        }

        return $processed_data;
    }

    /**
     * Convert brackets notation to dot notation path
     *
     * @param string $bracketed_key Key with brackets (e.g., "buttons[save]")
     * @return string Dot notation path (e.g., "buttons.save")
     */
    private function brackets_to_path($bracketed_key) {
        // Remove all closing brackets
        $path = str_replace(']', '', $bracketed_key);
        // Replace opening brackets with dots
        $path = str_replace('[', '.', $path);
        return $path;
    }

    /**
     * Set a value at a specific path in a nested array
     *
     * @param array  &$array Reference to the array to modify
     * @param array  $path_parts Parts of the path to traverse
     * @param mixed  $value Value to set
     * @return void
     */
    private function set_value_at_path(&$array, $path_parts, $value) {
        $current = &$array;

        // Traverse the path to find the target location
        for ($i = 0; $i < count($path_parts) - 1; $i++) {
            $part = $path_parts[$i];

            if (!isset($current[$part]) || !is_array($current[$part])) {
                $current[$part] = [];
            }

            $current = &$current[$part];
        }

        // Set the value at the final location
        $final_key = $path_parts[count($path_parts) - 1];

        if (is_array($value)) {
            // Recursively sanitize array values
            $current[$final_key] = $this->sanitize_array_recursively($value);
        } else {
            // Sanitize scalar values
            $current[$final_key] = sanitize_text_field($value);
        }
    }

    /**
     * Recursively sanitize array values
     *
     * @param array $array Array to sanitize
     * @return array Sanitized array
     */
    private function sanitize_array_recursively($array) {
        $sanitized = [];

        foreach ($array as $key => $value) {
            $clean_key = sanitize_key($key);

            if (is_array($value)) {
                $sanitized[$clean_key] = $this->sanitize_array_recursively($value);
            } else {
                $sanitized[$clean_key] = sanitize_text_field($value);
            }
        }

        return $sanitized;
    }

    /**
     * Export labels to JSON format
     *
     * @param array $labels Labels array to export
     * @return string JSON string
     */
    private function export_labels($labels = null) {
        if ($labels === null) {
            $labels = get_option('product_estimator_labels', []);
        }

        $export_data = [
            'version' => get_option('product_estimator_labels_version', '3.0.0'),
            'exported_at' => current_time('mysql'),
            'structure' => 'hierarchical',
            'structure_version' => 'v3',
            'labels' => $labels
        ];

        return json_encode($export_data, JSON_PRETTY_PRINT);
    }

    /**
     * AJAX handler for exporting labels
     */
    public function ajax_export_labels() {
        check_ajax_referer('pe_labels_management', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_die('Unauthorized');
        }

        $labels = get_option($this->option_name, []);
        $json_data = $this->export_labels($labels);

        wp_send_json_success([
            'filename' => 'product-estimator-labels-' . date('Y-m-d') . '.json',
            'data' => $json_data
        ]);
    }

    /**
     * Validate import data structure
     *
     * @param array $data Import data to validate
     * @return array|false Validated data or false if invalid
     */
    private function validate_import_data($data) {
        $valid_categories = array_keys($this->label_categories);
        $validated_data = [];

        foreach ($data as $category => $labels) {
            if (!in_array($category, $valid_categories)) {
                continue;
            }

            if (!is_array($labels)) {
                continue;
            }

            // Recursively sanitize and validate the hierarchical structure
            $validated_data[$category] = $this->sanitize_hierarchical_structure($labels);
        }

        return empty($validated_data) ? false : $validated_data;
    }

    /**
     * Recursively sanitize and validate a hierarchical structure
     *
     * @param array $structure The structure to sanitize
     * @return array Sanitized structure
     */
    private function sanitize_hierarchical_structure($structure) {
        $sanitized = [];

        foreach ($structure as $key => $value) {
            // Sanitize the key
            $clean_key = sanitize_key($key);

            if ($clean_key === '') {
                continue;
            }

            // If value is an array, process it recursively
            if (is_array($value)) {
                $sanitized[$clean_key] = $this->sanitize_hierarchical_structure($value);
            } else {
                // It's a leaf node (actual label value)
                $sanitized[$clean_key] = sanitize_text_field($value);
            }
        }

        return $sanitized;
    }

    /**
     * Count total labels across hierarchical structure
     *
     * @param array $labels Labels array
     * @return int Total count
     */
    private function count_labels($labels) {
        $count = 0;

        foreach ($labels as $key => $value) {
            if (is_array($value)) {
                // Recursively count labels in nested structure
                $count += $this->count_labels($value);
            } else {
                // It's a leaf node (actual label)
                $count++;
            }
        }

        return $count;
    }

    /**
     * Import labels from JSON string
     *
     * @param string $json_string JSON string containing labels
     * @return array Result of the import operation
     */
    private function import_labels($json_string) {
        try {
            $data = json_decode($json_string, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                return ['success' => false, 'message' => 'Invalid JSON format'];
            }

            if (!isset($data['labels'])) {
                return ['success' => false, 'message' => 'No labels found in import data'];
            }

            // Validate label structure
            $validated_labels = $this->validate_import_data($data['labels']);

            if (!$validated_labels) {
                return ['success' => false, 'message' => 'Invalid label structure'];
            }

            // Get current labels and default structure (values only, no metadata)
            $current_labels = get_option('product_estimator_labels', []);
            $default_labels = LabelsStructure::get_label_values_only();

            // Deep merge the structures
            $merged_labels = [];

            // Add all categories from defaults, current, and imported
            $all_categories = array_unique(array_merge(
                array_keys($default_labels),
                array_keys($current_labels),
                array_keys($validated_labels)
            ));

            foreach ($all_categories as $category) {
                if (!isset($merged_labels[$category])) {
                    $merged_labels[$category] = [];
                }

                // Start with defaults
                if (isset($default_labels[$category])) {
                    $merged_labels[$category] = $default_labels[$category];
                }

                // Then add current values
                if (isset($current_labels[$category])) {
                    $merged_labels[$category] = $this->deep_merge($merged_labels[$category], $current_labels[$category]);
                }

                // Finally add imported values
                if (isset($validated_labels[$category])) {
                    $merged_labels[$category] = $this->deep_merge($merged_labels[$category], $validated_labels[$category]);
                }
            }

            // Update labels with the merged result
            update_option('product_estimator_labels', $merged_labels);

            // Update version to trigger cache invalidation
            update_option('product_estimator_labels_version', time());

            // Clear transients
            delete_transient('pe_frontend_labels_cache');

            return [
                'success' => true,
                'message' => 'Labels imported successfully',
                'count' => $this->count_labels($merged_labels)
            ];

        } catch (\Exception $e) {
            return ['success' => false, 'message' => 'Import failed: ' . $e->getMessage()];
        }
    }

    /**
     * AJAX handler for importing labels
     */
    public function ajax_import_labels() {
        check_ajax_referer('pe_labels_management', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_die('Unauthorized');
        }

        $json_data = stripslashes($_POST['import_data'] ?? '');

        if (empty($json_data)) {
            wp_send_json_error(__('No import data provided', 'product-estimator'));
        }

        $result = $this->import_labels($json_data);

        if ($result['success']) {
            wp_send_json_success($result);
        } else {
            wp_send_json_error($result['message']);
        }
    }

    /**
     * Bulk update multiple labels
     *
     * @param array $updates Array of label updates ['path' => 'new value']
     * @return array Result of the operation
     */
    private function bulk_update_labels($updates) {
        $labels = get_option('product_estimator_labels', []);
        $updated_count = 0;

        foreach ($updates as $path => $new_value) {
            // Split the path into parts
            $path_parts = explode('.', $path);

            // Get the category (first part of the path)
            $category = array_shift($path_parts);

            // Skip if category doesn't exist
            if (!isset($labels[$category])) {
                continue;
            }

            // Update the value at the path
            $updated = $this->update_value_at_path($labels[$category], $path_parts, sanitize_text_field($new_value));

            if ($updated) {
                $updated_count++;
            }
        }

        if ($updated_count > 0) {
            update_option('product_estimator_labels', $labels);

            // Update version to trigger cache invalidation
            update_option('product_estimator_labels_version', time());

            // Clear transients
            delete_transient('pe_frontend_labels_cache');
        }

        return [
            'success' => true,
            'updated_count' => $updated_count
        ];
    }

    /**
     * Update a value at a specific path in a nested array
     *
     * @param array  &$array Reference to the array to modify
     * @param array  $path_parts Parts of the path to traverse
     * @param mixed  $value Value to set
     * @return bool True if updated, false otherwise
     */
    private function update_value_at_path(&$array, $path_parts, $value) {
        // Clone the path parts to avoid modifying the original
        $parts = $path_parts;

        // Empty path - can't update
        if (empty($parts)) {
            return false;
        }

        // Get the current key
        $current_key = array_shift($parts);

        // If this is the last part, update the value
        if (empty($parts)) {
            if (isset($array[$current_key])) {
                // Only update if the value would actually change
                if ($array[$current_key] !== $value) {
                    $array[$current_key] = $value;
                    return true;
                }
            }
            return false;
        }

        // Otherwise, continue traversing
        if (isset($array[$current_key]) && is_array($array[$current_key])) {
            return $this->update_value_at_path($array[$current_key], $parts, $value);
        }

        return false;
    }

    /**
     * AJAX handler for bulk updating labels
     */
    public function ajax_bulk_update_labels() {
        check_ajax_referer('pe_labels_management', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_die('Unauthorized');
        }

        $updates = $_POST['updates'] ?? [];

        if (empty($updates)) {
            wp_send_json_error(__('No updates provided', 'product-estimator'));
        }

        $result = $this->bulk_update_labels($updates);

        wp_send_json_success($result);
    }

    /**
     * AJAX handler for resetting category to defaults
     */
    public function ajax_reset_category_labels() {
        check_ajax_referer('pe_labels_management', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_die('Unauthorized');
        }

        $category = sanitize_text_field($_POST['category'] ?? '');

        if (empty($category) || !isset($this->label_categories[$category])) {
            wp_send_json_error(__('Invalid category', 'product-estimator'));
        }

        // Get default structure for this category (values only, no metadata)
        $defaults = LabelsStructure::get_label_values_only();

        // Ensure defaults is an array
        if (!is_array($defaults)) {
            error_log('ERROR: Default structure is not an array: ' . gettype($defaults));
            wp_send_json_error(__('Invalid default structure', 'product-estimator'));
        }

        // Check if category exists in defaults
        if (!isset($defaults[$category])) {
            error_log('ERROR: Category "' . $category . '" not found. Available: ' . implode(', ', array_keys($defaults)));
            wp_send_json_error(__('Category not found in default structure: ' . $category, 'product-estimator'));
        }

        $default_category = $defaults[$category];

        // Get current options
        $options = get_option($this->option_name, []);

        // Ensure options is an array
        if (!is_array($options)) {
            error_log('ERROR: Options is not an array: ' . gettype($options) . ' for option: ' . $this->option_name);

            // Try to handle different data formats
            if (is_string($options)) {
                // First try JSON decode
                $decoded = json_decode($options, true);
                if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                    error_log('INFO: Successfully decoded JSON string to array');
                    $options = $decoded;
                } else {
                    // Try PHP unserialize (WordPress sometimes stores serialized data)
                    $unserialized = @unserialize($options);
                    if ($unserialized !== false && is_array($unserialized)) {
                        error_log('INFO: Successfully unserialized PHP string to array');
                        $options = $unserialized;
                    } else {
                        error_log('INFO: Could not decode string data, creating empty array');
                        $options = [];
                    }
                }
            } else {
                error_log('INFO: Unknown data type, creating empty array');
                $options = [];
            }
        }

        // Reset the specific category to defaults
        $options[$category] = $default_category;

        // Save
        update_option($this->option_name, $options);

        // Clear caches
        delete_transient('pe_frontend_labels_cache');
        update_option('product_estimator_labels_version', time());

        wp_send_json_success([
            'message' => __('Category reset to defaults successfully', 'product-estimator'),
            'category' => $category,
            'labels' => $options[$category]
        ]);
    }

    /**
     * Clear all label caches via AJAX
     */
    public function ajax_clear_label_caches() {
        // Verify nonce for security
        if (!wp_verify_nonce($_POST['nonce'], 'pe_labels_management')) {
            wp_send_json_error(['message' => __('Invalid nonce', 'product-estimator')]);
            return;
        }

        // Check user permissions
        if (!current_user_can('manage_options')) {
            wp_send_json_error(['message' => __('Insufficient permissions', 'product-estimator')]);
            return;
        }

        $cleared_caches = [];
        $errors = [];

        try {
            // Get current labels version for cache key generation
            $version = get_option('product_estimator_labels_version', '3.0.0');

            // Clear all known label cache keys
            $cache_keys_to_clear = [
                'pe_frontend_labels_' . $version,
                'pe_frontend_labels_3.0.0',
                'pe_frontend_labels_2.3.0',
                'pe_frontend_labels_2.0.0',
                'pe_frontend_frequent_labels',
                'pe_frontend_labels_cache',
                'product_estimator_labels_cache',
                'product_estimator_frontend_labels'
            ];

            foreach ($cache_keys_to_clear as $key) {
                $deleted = delete_transient($key);
                $cleared_caches[] = [
                    'key' => $key,
                    'cleared' => $deleted
                ];
            }

            // Clear object cache if available
            if (function_exists('wp_cache_flush')) {
                wp_cache_flush();
                $cleared_caches[] = [
                    'key' => 'wp_cache_flush',
                    'cleared' => true
                ];
            }

            // Access labels frontend and clear its cache
            global $product_estimator;
            if (isset($product_estimator) && method_exists($product_estimator, 'get_loader')) {
                $loader = $product_estimator->get_loader();
                $labels_frontend = $loader->get_component('labels_frontend');

                if ($labels_frontend && method_exists($labels_frontend, 'invalidate_cache')) {
                    $labels_frontend->invalidate_cache();
                    $cleared_caches[] = [
                        'key' => 'labels_frontend_cache',
                        'cleared' => true
                    ];
                }
            }

            // Remove _flat structure from main labels option if present
            $labels_option = get_option('product_estimator_labels', []);
            $had_flat = false;
            if (is_array($labels_option) && isset($labels_option['_flat'])) {
                unset($labels_option['_flat']);
                update_option('product_estimator_labels', $labels_option);
                $had_flat = true;
                $cleared_caches[] = [
                    'key' => 'removed_flat_structure',
                    'cleared' => true
                ];
            }

            // Clear old analytics data that contains v1/v2 key usage from before compatibility removal
            $analytics_cleared = delete_option('product_estimator_label_analytics');
            $analytics_reset_cleared = delete_option('product_estimator_label_analytics_last_reset');

            $cleared_caches[] = [
                'key' => 'analytics_data_cleared',
                'cleared' => $analytics_cleared
            ];

            if ($analytics_reset_cleared) {
                $cleared_caches[] = [
                    'key' => 'analytics_reset_data_cleared',
                    'cleared' => true
                ];
            }

            // Force cache busting by updating version
            $new_version = '3.0.' . time();
            update_option('product_estimator_labels_version', $new_version);
            $cleared_caches[] = [
                'key' => 'labels_version_updated',
                'cleared' => true,
                'new_version' => $new_version
            ];

            wp_send_json_success([
                'message' => __('Label caches cleared successfully', 'product-estimator'),
                'cleared_caches' => $cleared_caches,
                'had_flat_structure' => $had_flat,
                'new_version' => $new_version
            ]);

        } catch (Exception $e) {
            wp_send_json_error([
                'message' => __('Error clearing caches: ', 'product-estimator') . $e->getMessage(),
                'cleared_caches' => $cleared_caches
            ]);
        }
    }
}
