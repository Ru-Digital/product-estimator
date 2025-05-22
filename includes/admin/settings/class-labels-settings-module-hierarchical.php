<?php
namespace RuDigital\ProductEstimator\Includes\Admin\Settings;

use RuDigital\ProductEstimator\Includes\LabelsMigration;

/**
 * Hierarchical Labels Settings Module Class
 *
 * Implements the labels settings tab functionality with support for hierarchical
 * label structures and nested categories.
 *
 * @since      2.5.0
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes/admin/settings
 */
final class LabelsSettingsModuleHierarchical extends SettingsModuleWithVerticalTabsBase implements SettingsModuleInterface {

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

        // Load the current V3 hierarchical structure from database
        $this->hierarchical_structure = $this->get_current_v3_structure();
    }

    public function register_hooks() {
        parent::register_hooks(); // This registers wp_ajax_save_labels_settings through the base class

        // Add AJAX handlers for labels management
        add_action('wp_ajax_pe_export_labels', [$this, 'ajax_export_labels']);
        add_action('wp_ajax_pe_import_labels', [$this, 'ajax_import_labels']);
        add_action('wp_ajax_pe_bulk_update_labels', [$this, 'ajax_bulk_update_labels']);
        add_action('wp_ajax_pe_reset_category_labels', [$this, 'ajax_reset_category_labels']);
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
            $current_section_id
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
                        $this->register_label_field($vertical_tab_id, $prop_key, $prop_value, $prop_path, $page_slug, $section_id, $depth + 1);
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
        $field_name = $this->option_name . '[' . $args['field_id'] . ']';

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
     * Get all registered fields (helper method)
     *
     * @return array Array of all registered fields
     */
    private function get_all_registered_fields() {
        // This would need to be implemented to return all registered fields
        // For now, return empty array as we're focusing on the structure change
        return [];
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
        // This could be replaced with a more comprehensive mapping
        // or loaded from a configuration file
        $descriptions = [
            'common' => [
                'common.buttons.save' => 'Generic save button text used throughout the interface',
                'common.buttons.cancel' => 'Generic cancel button text used throughout the interface',
                'common.buttons.delete' => 'Generic delete button text',
                'common.buttons.edit' => 'Generic edit button text',
                'common.buttons.close' => 'Generic close button text',
                'common.buttons.confirm' => 'Generic confirmation button text',
                'common.buttons.back' => 'Generic back button text',
                'common.buttons.next' => 'Generic next button text',
                'common.buttons.continue' => 'Generic continue button text',
                'common.buttons.ok' => 'Generic OK button text',
                'common.messages.success' => 'Generic success message',
                'common.messages.error' => 'Generic error message',
                'common.messages.warning' => 'Generic warning message',
                'common.messages.info' => 'Generic information message',
                'common.messages.confirm' => 'Generic confirmation message',
            ],
            'ui' => [
                'ui.loading' => 'Loading indicator text',
                'ui.empty_state' => 'Generic empty state message',
                'ui.no_results' => 'Message shown when search returns no results',
                'ui.search.placeholder' => 'Placeholder text for search input',
                'ui.search.button' => 'Search button text',
                'ui.search.results_count' => 'Text showing number of search results found',
                'ui.tooltips.close' => 'Close button text for tooltips',
                'ui.pagination.previous' => 'Previous page button text',
                'ui.pagination.next' => 'Next page button text',
                'ui.pagination.page_count' => 'Page count indicator text (e.g., "Page X of Y")',
                'ui.errors.not_found' => 'Not found error message',
                'ui.errors.server_error' => 'Server error message',
                'ui.errors.validation_error' => 'Form validation error message',
                'ui.errors.network_error' => 'Network connectivity error message',
            ],
            'estimate' => [
                'estimate.title' => 'Estimate page title',
                'estimate.buttons.create' => 'Create estimate button text',
                'estimate.buttons.save' => 'Save estimate button text',
                'estimate.buttons.delete' => 'Delete estimate button text',
                'estimate.buttons.print' => 'Print estimate button text',
                'estimate.buttons.email' => 'Email estimate button text',
                'estimate.buttons.share' => 'Share estimate button text',
                'estimate.forms.name' => 'Estimate name field label',
                'estimate.forms.name_placeholder' => 'Placeholder text for estimate name input',
                'estimate.messages.created' => 'Message shown when estimate is created',
                'estimate.messages.saved' => 'Message shown when estimate is saved',
                'estimate.messages.deleted' => 'Message shown when estimate is deleted',
                'estimate.messages.empty' => 'Message shown when estimate has no rooms',
                'estimate.messages.confirm_delete' => 'Confirmation message when deleting an estimate',
                'estimate.headings.summary' => 'Estimate summary section heading',
                'estimate.headings.rooms' => 'Rooms section heading in estimate view',
                'estimate.headings.details' => 'Estimate details section heading',
            ],
            'room' => [
                'room.title' => 'Room page title',
                'room.buttons.add' => 'Add room button text',
                'room.buttons.edit' => 'Edit room button text',
                'room.buttons.delete' => 'Delete room button text',
                'room.buttons.products' => 'Manage room products button text',
                'room.forms.name' => 'Room name field label',
                'room.forms.name_placeholder' => 'Placeholder text for room name input',
                'room.forms.width' => 'Room width field label',
                'room.forms.width_placeholder' => 'Placeholder text for room width input',
                'room.forms.length' => 'Room length field label',
                'room.forms.length_placeholder' => 'Placeholder text for room length input',
                'room.messages.created' => 'Message shown when room is created',
                'room.messages.updated' => 'Message shown when room is updated',
                'room.messages.deleted' => 'Message shown when room is deleted',
                'room.messages.empty' => 'Message shown when room has no products',
                'room.messages.confirm_delete' => 'Confirmation message when deleting a room',
                'room.headings.dimensions' => 'Room dimensions section heading',
                'room.headings.products' => 'Products section heading in room view',
            ],
            'product' => [
                'product.buttons.add' => 'Add product button text',
                'product.buttons.remove' => 'Remove product button text',
                'product.buttons.details' => 'View product details button text',
                'product.buttons.variations' => 'Select product variations button text',
                'product.buttons.includes' => 'Product includes button text',
                'product.buttons.similar' => 'Similar products button text',
                'product.buttons.suggested' => 'Suggested products button text',
                'product.buttons.additional' => 'Additional products button text',
                'product.messages.added' => 'Message shown when product is added',
                'product.messages.removed' => 'Message shown when product is removed',
                'product.messages.confirm_remove' => 'Confirmation message when removing a product',
                'product.messages.load_error' => 'Error message when products fail to load',
                'product.messages.no_variations' => 'Message shown when product has no variations',
                'product.messages.no_includes' => 'Message shown when product has no inclusions',
                'product.messages.no_suggestions' => 'Message shown when there are no product suggestions',
                'product.messages.no_similar' => 'Message shown when there are no similar products',
                'product.headings.details' => 'Product details section heading',
                'product.headings.notes' => 'Product notes section heading',
                'product.headings.includes' => 'Product includes section heading',
                'product.headings.variations' => 'Product variations section heading',
                'product.headings.similar' => 'Similar products section heading',
                'product.headings.suggested' => 'Suggested products section heading',
                'product.headings.additional' => 'Additional products section heading',
                'product.pricing.price' => 'Product price label',
                'product.pricing.total' => 'Total price label',
                'product.pricing.per_unit' => 'Per unit price indicator',
                'product.pricing.price_range' => 'Price range label',
            ],
            'customer' => [
                'customer.forms.name' => 'Customer name field label',
                'customer.forms.name_placeholder' => 'Placeholder text for customer name input',
                'customer.forms.email' => 'Customer email field label',
                'customer.forms.email_placeholder' => 'Placeholder text for customer email input',
                'customer.forms.phone' => 'Customer phone field label',
                'customer.forms.phone_placeholder' => 'Placeholder text for customer phone input',
                'customer.forms.postcode' => 'Customer postcode field label',
                'customer.forms.postcode_placeholder' => 'Placeholder text for customer postcode input',
                'customer.messages.details_required' => 'Message explaining why customer details are required',
                'customer.messages.email_required' => 'Message explaining why email is required',
                'customer.messages.phone_required' => 'Message explaining why phone number is required',
                'customer.messages.saved' => 'Message shown when customer details are saved',
                'customer.headings.details' => 'Customer details section heading',
                'customer.headings.saved_details' => 'Saved customer details section heading',
                'customer.headings.edit_details' => 'Edit customer details section heading',
            ],
            'modal' => [
                'modal.title' => 'Default modal title',
                'modal.buttons.close' => 'Close modal button text',
                'modal.headings.product_selection' => 'Product selection modal heading',
                'modal.headings.room_selection' => 'Room selection modal heading',
                'modal.headings.estimate_selection' => 'Estimate selection modal heading',
                'modal.headings.customer_details' => 'Customer details modal heading',
                'modal.headings.product_added' => 'Product added success dialog heading',
                'modal.headings.product_removed' => 'Product removed success dialog heading',
                'modal.headings.product_conflict' => 'Product conflict dialog heading',
                'modal.headings.confirmation' => 'Confirmation dialog heading',
                'modal.headings.error' => 'Error dialog heading',
                'modal.headings.success' => 'Success dialog heading',
                'modal.messages.not_found' => 'Error message when modal cannot be found or loaded',
            ],
            'pdf' => [
                'pdf.title' => 'PDF document title',
                'pdf.customer_details' => 'Customer details section heading in PDF',
                'pdf.estimate_summary' => 'Estimate summary section heading in PDF',
                'pdf.price_range' => 'Price range label in PDF',
                'pdf.from' => 'From label in price range',
                'pdf.to' => 'To label in price range',
                'pdf.date' => 'Date label in PDF',
                'pdf.page' => 'Page label in PDF footer',
                'pdf.of' => 'Of text in page numbering',
                'pdf.company_name' => 'Company name in PDF header',
                'pdf.company_phone' => 'Company phone in PDF header',
                'pdf.company_email' => 'Company email in PDF header',
                'pdf.company_website' => 'Company website in PDF header',
                'pdf.footer_text' => 'Text in PDF footer',
                'pdf.disclaimer' => 'Legal disclaimer text in PDF',
            ],
        ];

        // Check if a description exists for this path
        foreach ($descriptions as $cat => $paths) {
            if (isset($paths[$field_path])) {
                return $paths[$field_path];
            }
        }

        // If no specific description is found, create a generic one
        $parts = explode('.', $field_path);
        $label_name = end($parts);
        $humanized = ucwords(str_replace('_', ' ', $label_name));

        return sprintf(
            __('Text for %s in the %s section', 'product-estimator'),
            $humanized,
            $category
        );
    }

    private function get_label_usage($category, $field_path) {
        // This is a simplified mapping that could be expanded or loaded from a configuration
        $usage_map = [
            'common' => [
                'common.buttons.save' => 'Used in various forms and edit interfaces throughout the application',
                'common.buttons.cancel' => 'Used in forms, dialogs, and confirmation prompts',
                'common.buttons.delete' => 'Used in deletion interfaces, confirmation dialogs',
                'common.buttons.edit' => 'Used in list views, detail views, and management interfaces',
                'common.buttons.close' => 'Used in dialogs, modals, pop-ups, and notification windows',
                'common.buttons.confirm' => 'Used in confirmation dialogs for important actions',
                'common.buttons.back' => 'Used in multi-step flows and navigation',
                'common.buttons.next' => 'Used in multi-step flows and pagination',
                'common.buttons.continue' => 'Used in multi-step forms and processes',
                'common.buttons.ok' => 'Used in notification dialogs and alerts',
                'common.messages.success' => 'Used for generic operation success notifications',
                'common.messages.error' => 'Used for generic error notifications',
                'common.messages.warning' => 'Used for warning alerts and notifications',
                'common.messages.info' => 'Used for informational messages and notifications',
                'common.messages.confirm' => 'Used for general confirmation prompts',
            ],
            'estimate' => [
                'estimate.title' => 'Main estimate page heading',
                'estimate.buttons.create' => 'Used in the estimator home page and empty states',
                'estimate.buttons.save' => 'Used in the estimate editor and toolbar',
                'estimate.buttons.delete' => 'Used in estimate management interfaces',
                'estimate.buttons.print' => 'Used in estimate view and actions menu',
                'estimate.buttons.email' => 'Used in estimate sharing options',
                'estimate.buttons.share' => 'Used in estimate view and actions menu',
                'estimate.forms.name' => 'Used in new estimate and edit estimate forms',
                'estimate.forms.name_placeholder' => 'Used in estimate name input field',
                'estimate.messages.created' => 'Shown after successful estimate creation',
                'estimate.messages.saved' => 'Shown after successfully saving an estimate',
                'estimate.messages.deleted' => 'Shown after successfully deleting an estimate',
                'estimate.messages.empty' => 'Shown when an estimate contains no rooms',
                'estimate.messages.confirm_delete' => 'Shown when confirming estimate deletion',
                'estimate.headings.summary' => 'Used in estimate view for the summary section',
                'estimate.headings.rooms' => 'Used in estimate view for the rooms list section',
                'estimate.headings.details' => 'Used in estimate view for the details section',
            ],
            'room' => [
                'room.title' => 'Room management page heading',
                'room.buttons.add' => 'Used in estimate view and empty states',
                'room.buttons.edit' => 'Used in room list and room detail views',
                'room.buttons.delete' => 'Used in room management interfaces',
                'room.buttons.products' => 'Used in room detail view',
                'room.forms.name' => 'Used in new room and edit room forms',
                'room.forms.name_placeholder' => 'Used in room name input field',
                'room.forms.width' => 'Used in room dimensions section of forms',
                'room.forms.width_placeholder' => 'Used in room width input field',
                'room.forms.length' => 'Used in room dimensions section of forms',
                'room.forms.length_placeholder' => 'Used in room length input field',
                'room.messages.created' => 'Shown after successful room creation',
                'room.messages.updated' => 'Shown after successfully updating a room',
                'room.messages.deleted' => 'Shown after successfully deleting a room',
                'room.messages.empty' => 'Shown when a room contains no products',
                'room.messages.confirm_delete' => 'Shown when confirming room deletion',
                'room.headings.dimensions' => 'Used in room form for the dimensions section',
                'room.headings.products' => 'Used in room view for the products list section',
            ],
            'product' => [
                'product.buttons.add' => 'Used in product listings and search results',
                'product.buttons.remove' => 'Used in room product list and management interfaces',
                'product.buttons.details' => 'Used in product listings and room product list',
                'product.buttons.variations' => 'Used in product selection dialogs',
                'product.buttons.includes' => 'Used in product detail view',
                'product.buttons.similar' => 'Used in product detail view',
                'product.buttons.suggested' => 'Used in room view and product listings',
                'product.buttons.additional' => 'Used in product detail view and checkout flow',
                'product.messages.added' => 'Shown after adding a product to a room',
                'product.messages.removed' => 'Shown after removing a product from a room',
                'product.messages.confirm_remove' => 'Shown when confirming product removal',
                'product.messages.load_error' => 'Shown when products fail to load',
                'product.messages.no_variations' => 'Shown when a product has no variations',
                'product.messages.no_includes' => 'Shown when a product has no inclusions',
                'product.messages.no_suggestions' => 'Shown when there are no product suggestions',
                'product.messages.no_similar' => 'Shown when there are no similar products',
                'product.headings.details' => 'Used in product detail view',
                'product.headings.notes' => 'Used in product detail view',
                'product.headings.includes' => 'Used in product detail view for the includes section',
                'product.headings.variations' => 'Used in product selection dialog',
                'product.headings.similar' => 'Used in product detail view for similar products section',
                'product.headings.suggested' => 'Used in room view for suggested products section',
                'product.headings.additional' => 'Used in product detail view for additional products section',
                'product.pricing.price' => 'Used in product listings and detail view',
                'product.pricing.total' => 'Used in product detail view and checkout',
                'product.pricing.per_unit' => 'Used in product pricing display',
                'product.pricing.price_range' => 'Used for variable product pricing display',
            ],
            'customer' => [
                'customer.forms.name' => 'Used in customer details forms',
                'customer.forms.name_placeholder' => 'Used in customer name input field',
                'customer.forms.email' => 'Used in customer details forms',
                'customer.forms.email_placeholder' => 'Used in customer email input field',
                'customer.forms.phone' => 'Used in customer details forms',
                'customer.forms.phone_placeholder' => 'Used in customer phone input field',
                'customer.forms.postcode' => 'Used in customer details forms',
                'customer.forms.postcode_placeholder' => 'Used in customer postcode input field',
                'customer.messages.details_required' => 'Shown when prompting for customer details',
                'customer.messages.email_required' => 'Shown when email is required for an action',
                'customer.messages.phone_required' => 'Shown when phone is required for an action',
                'customer.messages.saved' => 'Shown after saving customer details',
                'customer.headings.details' => 'Used in customer details section',
                'customer.headings.saved_details' => 'Used when displaying saved customer information',
                'customer.headings.edit_details' => 'Used in edit customer details form',
            ],
            'modal' => [
                'modal.title' => 'Default title for modal dialogs',
                'modal.buttons.close' => 'Used in modal header and footer',
                'modal.headings.product_selection' => 'Used in product selection modal',
                'modal.headings.room_selection' => 'Used in room selection modal',
                'modal.headings.estimate_selection' => 'Used in estimate selection modal',
                'modal.headings.customer_details' => 'Used in customer details modal',
                'modal.headings.product_added' => 'Used in success dialog after adding a product',
                'modal.headings.product_removed' => 'Used in success dialog after removing a product',
                'modal.headings.product_conflict' => 'Used in product conflict resolution dialog',
                'modal.headings.confirmation' => 'Used in confirmation dialogs',
                'modal.headings.error' => 'Used in error notification dialogs',
                'modal.headings.success' => 'Used in success notification dialogs',
                'modal.messages.not_found' => 'Shown when a modal fails to load',
            ],
            'pdf' => [
                'pdf.title' => 'Used as the main heading in PDF documents',
                'pdf.customer_details' => 'Used in the customer section of PDF documents',
                'pdf.estimate_summary' => 'Used in the summary section of PDF documents',
                'pdf.price_range' => 'Used for price range display in PDFs',
                'pdf.from' => 'Used in price range minimum indicator',
                'pdf.to' => 'Used in price range maximum indicator',
                'pdf.date' => 'Used for date display in PDF documents',
                'pdf.page' => 'Used in PDF pagination',
                'pdf.of' => 'Used in PDF page count (e.g., "Page X of Y")',
                'pdf.company_name' => 'Used in PDF header for company information',
                'pdf.company_phone' => 'Used in PDF header for company contact details',
                'pdf.company_email' => 'Used in PDF header for company contact details',
                'pdf.company_website' => 'Used in PDF header for company contact details',
                'pdf.footer_text' => 'Used in the footer of PDF documents',
                'pdf.disclaimer' => 'Used for legal disclaimer in PDF documents',
            ],
        ];

        // Look for exact match in the mapping
        foreach ($usage_map as $cat => $paths) {
            if (isset($paths[$field_path])) {
                return $paths[$field_path];
            }
        }

        // If not found, generate generic usage info
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

        return '';
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

        // Add custom CSS for hierarchical labels interface
        wp_add_inline_style('product-estimator-admin', $this->get_hierarchical_styles());
    }

    /**
     * Add custom CSS for the hierarchical labels interface
     *
     * @return string CSS styles
     */
    private function get_hierarchical_styles() {
        return "
        .pe-label-subcategory-heading {
            margin-top: 20px;
            margin-bottom: 10px;
            padding-bottom: 5px;
            border-bottom: 1px solid #ccc;
        }

        .pe-label-subcategory-heading.depth-0 {
            font-size: 18px;
            border-bottom: 2px solid #2271b1;
        }

        .pe-label-subcategory-heading.depth-1 {
            font-size: 16px;
            border-bottom: 1px solid #c3c4c7;
            margin-top: 15px;
        }

        .pe-label-subcategory-heading.depth-2 {
            font-size: 14px;
            border-bottom: 1px dotted #c3c4c7;
            margin-top: 10px;
        }

        .pe-label-field-wrapper {
            padding: 8px 0;
            border-bottom: 1px solid #f6f7f7;
        }

        .pe-label-path-indicator {
            color: #646970;
            font-size: 11px;
            margin-bottom: 4px;
        }

        .pe-label-path-indicator code {
            background: #f0f0f1;
            padding: 2px 4px;
            border-radius: 2px;
        }

        /* Search results highlighting */
        .label-search-highlight {
            background-color: #ffff00;
            padding: 2px;
        }

        #label-search-results {
            margin-top: 10px;
            max-height: 200px;
            overflow-y: auto;
            border: 1px solid #dcdcde;
            padding: 10px;
            background: #f6f7f7;
            display: none;
        }

        .search-result-item {
            margin-bottom: 5px;
            padding-bottom: 5px;
            border-bottom: 1px solid #eee;
        }

        .search-result-item .path {
            font-weight: bold;
        }

        .search-result-item .value {
            color: #646970;
        }

        .search-result-item .go-to {
            display: block;
            margin-top: 3px;
            text-decoration: none;
        }

        /* Toggle buttons for expanding/collapsing sections */
        .section-toggle-buttons {
            margin: 10px 0;
        }
        ";
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
        $current[$path_parts[count($path_parts) - 1]] = sanitize_text_field($value);
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
            'version' => get_option('product_estimator_labels_version', '2.5.0'),
            'exported_at' => current_time('mysql'),
            'structure' => 'hierarchical',
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

            // Check if we're importing hierarchical or flat structure
            $is_hierarchical = isset($data['structure']) && $data['structure'] === 'hierarchical';

            // If importing flat structure, convert to hierarchical
            $labels_to_import = $is_hierarchical ? $data['labels'] : $this->convert_flat_to_hierarchical($data['labels']);

            // Validate label structure
            $validated_labels = $this->validate_import_data($labels_to_import);

            if (!$validated_labels) {
                return ['success' => false, 'message' => 'Invalid label structure'];
            }

            // Get current labels and default structure
            $current_labels = get_option('product_estimator_labels', []);
            $default_labels = $this->hierarchical_structure;

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
     * Convert flat structure to hierarchical
     *
     * @param array $flat_labels Flat labels structure
     * @return array Hierarchical structure
     */
    private function convert_flat_to_hierarchical($flat_labels) {
        // This is a simplified conversion that maps from old categories to new
        $mapping = [
            'buttons' => 'common.buttons',
            'forms' => 'common.forms',
            'messages' => 'common.messages',
            'ui_elements' => 'ui',
            'pdf' => 'pdf'
        ];

        $hierarchical = [];

        foreach ($flat_labels as $old_category => $labels) {
            // Determine where to put these labels
            $new_category = $mapping[$old_category] ?? 'common';
            $path_parts = explode('.', $new_category);

            // Build the hierarchical structure
            if (count($path_parts) === 1) {
                if (!isset($hierarchical[$path_parts[0]])) {
                    $hierarchical[$path_parts[0]] = [];
                }

                $hierarchical[$path_parts[0]] = array_merge($hierarchical[$path_parts[0]], $labels);
            } elseif (count($path_parts) === 2) {
                if (!isset($hierarchical[$path_parts[0]])) {
                    $hierarchical[$path_parts[0]] = [];
                }

                if (!isset($hierarchical[$path_parts[0]][$path_parts[1]])) {
                    $hierarchical[$path_parts[0]][$path_parts[1]] = [];
                }

                $hierarchical[$path_parts[0]][$path_parts[1]] = array_merge(
                    $hierarchical[$path_parts[0]][$path_parts[1]],
                    $labels
                );
            }
        }

        return $hierarchical;
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

        // Get default structure for this category
        $defaults = $this->hierarchical_structure;
        $default_category = $defaults[$category] ?? [];

        // Get current options
        $options = get_option($this->option_name, []);

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
     * Get the current V3 field-grouped structure from database
     *
     * @return array Current V3 hierarchical structure
     */
    private function get_current_v3_structure() {
        // Get the current labels from database (should be V3 structure now)
        $current_labels = get_option('product_estimator_labels', []);

        // If we have V3 structure, return it
        if (!empty($current_labels) && $this->is_v3_structure($current_labels)) {
            return $current_labels;
        }

        // If no V3 structure or empty, return default V3 structure
        return $this->get_default_v3_admin_structure();
    }

    /**
     * Check if labels are in V3 field-grouped structure
     *
     * @param array $labels The labels to check
     * @return bool True if V3 structure
     */
    private function is_v3_structure($labels) {
        // V3 structure has top-level keys like estimate_management, room_management, customer_details
        return isset($labels['estimate_management']) ||
               isset($labels['room_management']) ||
               isset($labels['customer_details']);
    }

    /**
     * Get default V3 field-grouped structure for admin display
     *
     * @return array Default V3 structure
     */
    private function get_default_v3_admin_structure() {
        return [
            'estimate_management' => [
                'create_new_estimate_form' => [
                    'estimate_name_field' => [
                        'label' => __('Estimate Name', 'product-estimator'),
                        'placeholder' => __('Enter estimate name', 'product-estimator'),
                        'validation_required' => __('Estimate name is required', 'product-estimator'),
                    ],
                    'buttons' => [
                        'create_button' => [
                            'label' => __('Create Estimate', 'product-estimator'),
                        ],
                    ],
                    'headings' => [
                        'create_heading' => [
                            'text' => __('Create New Estimate', 'product-estimator'),
                        ],
                    ],
                ],
                'estimate_selection' => [
                    'estimate_choice_field' => [
                        'label' => __('Choose an estimate:', 'product-estimator'),
                        'options' => __('-- Select an Estimate --', 'product-estimator'),
                    ],
                    'buttons' => [
                        'start_new_button' => [
                            'label' => __('Start New Estimate', 'product-estimator'),
                        ],
                    ],
                    'headings' => [
                        'select_heading' => [
                            'text' => __('Select an estimate', 'product-estimator'),
                        ],
                    ],
                    'messages' => [
                        'no_estimates_available_message' => [
                            'text' => __('No estimates available', 'product-estimator'),
                        ],
                    ],
                ],
                'estimate_actions' => [
                    'buttons' => [
                        'save_button' => [
                            'label' => __('Save Estimate', 'product-estimator'),
                        ],
                        'print_button' => [
                            'label' => __('Print Estimate', 'product-estimator'),
                        ],
                        'delete_button' => [
                            'label' => __('Delete Estimate', 'product-estimator'),
                        ],
                        'request_copy_button' => [
                            'label' => __('Request a Copy', 'product-estimator'),
                        ],
                    ],
                    'messages' => [
                        'saved_message' => [
                            'text' => __('Estimate saved successfully', 'product-estimator'),
                        ],
                        'deleted_message' => [
                            'text' => __('Estimate deleted successfully', 'product-estimator'),
                        ],
                        'removed_message' => [
                            'text' => __('This estimate has been removed successfully', 'product-estimator'),
                        ],
                    ],
                ],
                'estimate_display' => [
                    'headings' => [
                        'rooms_heading' => [
                            'text' => __('Rooms', 'product-estimator'),
                        ],
                        'summary_heading' => [
                            'text' => __('Estimate Summary', 'product-estimator'),
                        ],
                    ],
                    'messages' => [
                        'empty_message' => [
                            'text' => __('No rooms in this estimate', 'product-estimator'),
                        ],
                    ],
                ],
            ],
            'room_management' => [
                'add_new_room_form' => [
                    'room_name_field' => [
                        'label' => __('Room Name', 'product-estimator'),
                        'placeholder' => __('Enter room name', 'product-estimator'),
                        'validation' => [
                            'required' => __('Room name is required', 'product-estimator'),
                            'min_length' => __('Room name must be at least 2 characters', 'product-estimator'),
                        ],
                    ],
                    'room_width_field' => [
                        'label' => __('Room Width', 'product-estimator'),
                        'placeholder' => __('Width (m)', 'product-estimator'),
                        'validation' => [
                            'number_required' => __('Please enter a valid number', 'product-estimator'),
                            'positive_number' => __('Width must be a positive number', 'product-estimator'),
                        ],
                    ],
                    'room_length_field' => [
                        'label' => __('Room Length', 'product-estimator'),
                        'placeholder' => __('Length (m)', 'product-estimator'),
                        'validation' => [
                            'number_required' => __('Please enter a valid number', 'product-estimator'),
                            'positive_number' => __('Length must be a positive number', 'product-estimator'),
                        ],
                    ],
                    'room_dimensions_field' => [
                        'label' => __('Room Dimensions', 'product-estimator'),
                        'placeholder' => __('e.g., 4m x 3m', 'product-estimator'),
                        'validation' => [
                            'valid_format' => __('Please enter dimensions in format like "4m x 3m"', 'product-estimator'),
                        ],
                    ],
                    'buttons' => [
                        'add_button' => [
                            'label' => __('Add Room', 'product-estimator'),
                        ],
                        'add_with_product_button' => [
                            'label' => __('Add Room & Product', 'product-estimator'),
                        ],
                    ],
                    'messages' => [
                        'added_message' => [
                            'text' => __('Room added successfully', 'product-estimator'),
                        ],
                        'created_message' => [
                            'text' => __('Room created successfully', 'product-estimator'),
                        ],
                        'created_with_product_message' => [
                            'text' => __('Room and product added successfully', 'product-estimator'),
                        ],
                    ],
                ],
                'room_selection_form' => [
                    'room_choice_field' => [
                        'label' => __('Choose a room:', 'product-estimator'),
                        'options' => __('-- Select a Room --', 'product-estimator'),
                        'validation' => [
                            'room_required' => __('Please select a room', 'product-estimator'),
                        ],
                    ],
                    'buttons' => [
                        'select_button' => [
                            'label' => __('Select Room', 'product-estimator'),
                        ],
                        'back_to_select_button' => [
                            'label' => __('Back to Room Selection', 'product-estimator'),
                        ],
                    ],
                    'headings' => [
                        'select_heading' => [
                            'text' => __('Select a room', 'product-estimator'),
                        ],
                    ],
                    'messages' => [
                        'no_rooms_available_message' => [
                            'text' => __('No rooms available', 'product-estimator'),
                        ],
                    ],
                ],
                'room_actions' => [
                    'buttons' => [
                        'delete_button' => [
                            'label' => __('Remove Room', 'product-estimator'),
                        ],
                    ],
                    'messages' => [
                        'deleted_message' => [
                            'text' => __('Room deleted successfully', 'product-estimator'),
                        ],
                        'load_error_message' => [
                            'text' => __('Error loading room data', 'product-estimator'),
                        ],
                    ],
                ],
                'room_display' => [
                    'headings' => [
                        'products_heading' => [
                            'text' => __('Products', 'product-estimator'),
                        ],
                        'summary_heading' => [
                            'text' => __('Room Summary', 'product-estimator'),
                        ],
                    ],
                    'messages' => [
                        'empty_message' => [
                            'text' => __('No products in this room', 'product-estimator'),
                        ],
                    ],
                ],
                'room_navigation' => [
                    'buttons' => [
                        'back_to_list_button' => [
                            'label' => __('Back to Rooms', 'product-estimator'),
                        ],
                    ],
                ],
            ],
            'customer_details' => [
                'customer_details_form' => [
                    'customer_name_field' => [
                        'label' => __('Your Name', 'product-estimator'),
                        'placeholder' => __('Enter your name', 'product-estimator'),
                        'validation' => [
                            'required' => __('Name is required', 'product-estimator'),
                        ],
                    ],
                    'customer_email_field' => [
                        'label' => __('Email Address', 'product-estimator'),
                        'placeholder' => __('Enter your email', 'product-estimator'),
                        'validation' => [
                            'invalid_email' => __('Please enter a valid email address', 'product-estimator'),
                            'email_required' => __('Email is required', 'product-estimator'),
                        ],
                    ],
                    'customer_phone_field' => [
                        'label' => __('Phone Number', 'product-estimator'),
                        'placeholder' => __('Enter your phone', 'product-estimator'),
                        'validation' => [
                            'invalid_phone' => __('Please enter a valid phone number', 'product-estimator'),
                            'phone_required' => __('Phone is required', 'product-estimator'),
                        ],
                    ],
                    'customer_postcode_field' => [
                        'label' => __('Postcode', 'product-estimator'),
                        'placeholder' => __('Enter your postcode', 'product-estimator'),
                        'validation' => [
                            'postcode_required' => __('Postcode is required', 'product-estimator'),
                            'invalid_postcode' => __('Please enter a valid postcode', 'product-estimator'),
                        ],
                    ],
                    'buttons' => [
                        'contact_email_button' => [
                            'label' => __('Email', 'product-estimator'),
                        ],
                        'contact_phone_button' => [
                            'label' => __('Phone', 'product-estimator'),
                        ],
                        'request_contact_button' => [
                            'label' => __('Request contact from store', 'product-estimator'),
                        ],
                    ],
                    'headings' => [
                        'details_heading' => [
                            'text' => __('Your Details', 'product-estimator'),
                        ],
                        'saved_details_heading' => [
                            'text' => __('Saved Details', 'product-estimator'),
                        ],
                        'edit_details_heading' => [
                            'text' => __('Edit Your Details', 'product-estimator'),
                        ],
                        'customer_details_heading' => [
                            'text' => __('Customer Details', 'product-estimator'),
                        ],
                        'email_details_heading' => [
                            'text' => __('Email Details Required', 'product-estimator'),
                        ],
                        'phone_details_heading' => [
                            'text' => __('Phone Details Required', 'product-estimator'),
                        ],
                        'contact_information_heading' => [
                            'text' => __('Contact Information Required', 'product-estimator'),
                        ],
                        'contact_method_estimate_heading' => [
                            'text' => __('Choose Contact Method', 'product-estimator'),
                        ],
                        'contact_method_heading' => [
                            'text' => __('Contact Method', 'product-estimator'),
                        ],
                    ],
                    'messages' => [
                        'contact_method_estimate_message' => [
                            'text' => __('How would you like to receive your estimate?', 'product-estimator'),
                        ],
                        'contact_method_message' => [
                            'text' => __('How would you like to be contacted?', 'product-estimator'),
                        ],
                        'email_sent_message' => [
                            'text' => __('Email sent successfully', 'product-estimator'),
                        ],
                    ],
                ],
                'general_validation' => [
                    'messages' => [
                        'details_required_message' => [
                            'text' => __('Please provide your contact details', 'product-estimator'),
                        ],
                        'email_required_message' => [
                            'text' => __('Email is required for this action', 'product-estimator'),
                        ],
                        'phone_required_message' => [
                            'text' => __('Phone is required for SMS notifications', 'product-estimator'),
                        ],
                        'email_details_required_message' => [
                            'text' => __('Please provide your email details', 'product-estimator'),
                        ],
                        'phone_details_required_message' => [
                            'text' => __('Please provide your phone details', 'product-estimator'),
                        ],
                        'email_required_for_estimate_message' => [
                            'text' => __('Email is required to receive your estimate', 'product-estimator'),
                        ],
                    ],
                ],
            ],
            'common_ui' => [
                'confirmation_dialogs' => [
                    'buttons' => [
                        'confirm_button' => [
                            'label' => __('Confirm', 'product-estimator'),
                        ],
                        'cancel_button' => [
                            'label' => __('Cancel', 'product-estimator'),
                        ],
                        'ok_button' => [
                            'label' => __('OK', 'product-estimator'),
                        ],
                    ],
                    'messages' => [
                        'confirm_delete_message' => [
                            'text' => __('Are you sure you want to delete this?', 'product-estimator'),
                        ],
                        'confirm_message' => [
                            'text' => __('Are you sure you want to proceed?', 'product-estimator'),
                        ],
                    ],
                ],
                'general_actions' => [
                    'buttons' => [
                        'close_button' => [
                            'label' => __('Close', 'product-estimator'),
                        ],
                        'save_button' => [
                            'label' => __('Save', 'product-estimator'),
                        ],
                        'save_changes_button' => [
                            'label' => __('Save Changes', 'product-estimator'),
                        ],
                        'delete_button' => [
                            'label' => __('Delete', 'product-estimator'),
                        ],
                        'edit_button' => [
                            'label' => __('Edit', 'product-estimator'),
                        ],
                        'add_button' => [
                            'label' => __('Add', 'product-estimator'),
                        ],
                        'remove_button' => [
                            'label' => __('Remove', 'product-estimator'),
                        ],
                    ],
                    'messages' => [
                        'settings_saved_message' => [
                            'text' => __('Settings saved successfully', 'product-estimator'),
                        ],
                    ],
                ],
                'navigation' => [
                    'buttons' => [
                        'continue_button' => [
                            'label' => __('Continue', 'product-estimator'),
                        ],
                        'back_button' => [
                            'label' => __('Back', 'product-estimator'),
                        ],
                    ],
                ],
                'loading_states' => [
                    'messages' => [
                        'generic_message' => [
                            'text' => __('Loading...', 'product-estimator'),
                        ],
                    ],
                ],
                'error_handling' => [
                    'messages' => [
                        'error_message' => [
                            'text' => __('An error occurred. Please try again.', 'product-estimator'),
                        ],
                        'save_failed_message' => [
                            'text' => __('Failed to save. Please try again.', 'product-estimator'),
                        ],
                        'network_error_message' => [
                            'text' => __('Network error. Please check your connection.', 'product-estimator'),
                        ],
                        'permission_denied_message' => [
                            'text' => __('You do not have permission to perform this action', 'product-estimator'),
                        ],
                    ],
                ],
                'validation' => [
                    'messages' => [
                        'required_field_message' => [
                            'text' => __('This field is required', 'product-estimator'),
                        ],
                        'min_length_message' => [
                            'text' => __('Minimum {min} characters required', 'product-estimator'),
                        ],
                        'max_length_message' => [
                            'text' => __('Maximum {max} characters allowed', 'product-estimator'),
                        ],
                        'invalid_format_message' => [
                            'text' => __('Invalid format', 'product-estimator'),
                        ],
                        'number_required_message' => [
                            'text' => __('Please enter a valid number', 'product-estimator'),
                        ],
                    ],
                ],
            ],
            'modal_system' => [
                'confirmation_dialogs' => [
                    'headings' => [
                        'confirmation_heading' => [
                            'text' => __('Confirm Action', 'product-estimator'),
                        ],
                    ],
                ],
                'error_dialogs' => [
                    'headings' => [
                        'error_heading' => [
                            'text' => __('Error', 'product-estimator'),
                        ],
                    ],
                ],
                'success_dialogs' => [
                    'headings' => [
                        'success_heading' => [
                            'text' => __('Success', 'product-estimator'),
                        ],
                    ],
                ],
                'room_dialogs' => [
                    'headings' => [
                        'add_room_heading' => [
                            'text' => __('Add New Room', 'product-estimator'),
                        ],
                        'room_created_heading' => [
                            'text' => __('Room Created', 'product-estimator'),
                        ],
                        'remove_room_heading' => [
                            'text' => __('Remove Room', 'product-estimator'),
                        ],
                        'select_room_heading' => [
                            'text' => __('Select Room', 'product-estimator'),
                        ],
                    ],
                ],
            ],
        ];
    }
}
