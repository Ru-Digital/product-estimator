<?php
namespace RuDigital\ProductEstimator\Includes\Admin\Settings;

use RuDigital\ProductEstimator\Includes\LabelsMigration;

/**
 * Labels Settings Module Class
 *
 * Implements the labels settings tab functionality with vertical sub-tabs
 * for different label categories.
 *
 * @since      2.0.0
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes/admin/settings
 */
final class LabelsSettingsModule extends SettingsModuleWithVerticalTabsBase implements SettingsModuleInterface {

    protected $option_name = 'product_estimator_labels';
    private $label_categories = [];

    protected function set_tab_details() {
        $this->tab_id    = 'labels';
        $this->tab_title = __( 'Labels', 'product-estimator' );
        $this->section_id = 'labels_settings_section';
        $this->section_title = __( 'Manage Labels', 'product-estimator' );

        $this->label_categories = [
            'buttons' => [
                'id' => 'buttons',
                'title' => __( 'Button Labels', 'product-estimator' ),
                'description' => __( 'Labels for all buttons throughout the estimator.', 'product-estimator' ),
            ],
            'forms' => [
                'id' => 'forms',
                'title' => __( 'Form Fields', 'product-estimator' ),
                'description' => __( 'Labels for form fields, placeholders, and help text.', 'product-estimator' ),
            ],
            'messages' => [
                'id' => 'messages',
                'title' => __( 'Messages', 'product-estimator' ),
                'description' => __( 'Success, error, and confirmation messages.', 'product-estimator' ),
            ],
            'ui_elements' => [
                'id' => 'ui_elements',
                'title' => __( 'UI Elements', 'product-estimator' ),
                'description' => __( 'General user interface text and labels.', 'product-estimator' ),
            ],
            'pdf' => [
                'id' => 'pdf',
                'title' => __( 'PDF Export', 'product-estimator' ),
                'description' => __( 'Labels specific to PDF generation.', 'product-estimator' ),
            ],
        ];

        // Run migration if needed
//        LabelsMigration::migrate();
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
        echo "This section allows administrators to configure and manage all text labels used throughout the Product Estimator. Labels are organized into categories for easier management.";
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

        foreach ( $labels as $label_key => $label_value ) {
            // This is the key difference - we need to store the field ID as "category[key]"
            // instead of "category_key" to match the form data structure
            $field_id = $vertical_tab_id . '[' . $label_key . ']';
            $display_id = $vertical_tab_id . '_' . $label_key; // For display/CSS purposes only
            $label_title = ucwords(str_replace('_', ' ', $label_key));

            $callback_args = [
                'id'          => $display_id, // HTML ID for the element
                'field_id'    => $field_id,   // Actual field ID for data matching
                'type'        => 'text',
                'description' => $this->get_label_description($vertical_tab_id, $label_key),
                'default'     => $label_value,
                'label_for'   => $display_id,
                'category'    => $vertical_tab_id,
                'label_key'   => $label_key,
                'value'       => $label_value, // Make sure value is set for rendering
            ];

            add_settings_field(
                $field_id, // Use the bracketed ID for the field name
                $label_title,
                [$this, 'render_label_field'],
                $page_slug_for_wp_api,
                $this->section_id . '_' . $vertical_tab_id,
                $callback_args
            );

            // Store the field using the bracketed format to match form data structure
            $this->store_field_for_sub_tab($vertical_tab_id, $field_id, $callback_args);
        }

        // Log debug info to ensure fields are being registered properly
        error_log("Registered " . count($labels) . " fields for vertical tab {$vertical_tab_id}");
    }


        public function render_label_field($args) {
            $options = get_option($this->option_name, []);
            $category = $args['category'] ?? '';
            $label_key = $args['label_key'] ?? '';

            // Get the current value with fallback to default
            $current_value = $options[$category][$label_key] ?? $args['default'] ?? '';

            // Field name for nested structure - this is the critical part
            // We need to use $this->option_name[$category][$label_key] format
            $field_name = $this->option_name . "[" . $category . "][" . $label_key . "]";
            
            // Create render args with the proper field_id from callback_args if available
            $render_args = $args;
            if (isset($args['field_id'])) {
                $render_args['id'] = $args['field_id']; // Use the bracketed ID format
            }
            
            // Call parent render_field with our custom field name
            parent::render_field($render_args, $current_value, $field_name);

            // Add description if provided
            if (!empty($args['description'])) {
                printf('<p class="description">%s</p>', esc_html($args['description']));
            }

            // Add preview if applicable
            $this->render_label_preview($category, $label_key);
        }

        public function render_category_description() {
        echo '<p class="description">Update the text labels for this category. Changes will be reflected throughout the estimator.</p>';
          }

    public function render_label_preview($category, $label_key) {
        // Show a preview of where this label is used
        $usage = $this->get_label_usage($category, $label_key);
        if (!empty($usage)) {
            echo '<div class="label-usage-preview">';
            echo '<strong>Used in:</strong> ' . esc_html($usage);
            echo '</div>';
        }
    }

    private function get_labels_for_category( $category ) {
        $all_labels = get_option($this->option_name, []);

        // If no labels exist, get defaults
        if (empty($all_labels)) {
            $all_labels = LabelsMigration::get_default_structure();
        }

        return $all_labels[$category] ?? [];
    }

    private function get_label_description($category, $label_key) {
        $descriptions = [
            'buttons' => [
                'similar_products' => 'Text for the similar products expand button',
                'product_includes' => 'Text for the product includes expand button',
                'save_estimate' => 'Text for the save estimate button',
                'print_estimate' => 'Text for the print estimate button',
            ],
            'forms' => [
                'estimate_name' => 'Label for the estimate name field',
                'customer_email' => 'Label for the customer email field',
                'placeholder_email' => 'Placeholder text for email input',
            ],
            'messages' => [
                'product_added' => 'Message shown when a product is added',
                'confirm_delete' => 'Confirmation message for delete actions',
            ],
            // Add more descriptions as needed
        ];

        return $descriptions[$category][$label_key] ?? '';
    }

    private function get_label_usage($category, $label_key) {
        $usage_map = [
            'buttons' => [
                'similar_products' => 'Room template, product display',
                'product_includes' => 'Room template, product details',
                'save_estimate' => 'Estimate form, main toolbar',
            ],
            'forms' => [
                'estimate_name' => 'New estimate form, edit estimate form',
                'customer_email' => 'Customer details form',
            ],
            // Add more usage mappings
        ];

        return $usage_map[$category][$label_key] ?? '';
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
                    <?php echo esc_html(get_option('product_estimator_labels_version', '2.0.0')); ?>
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
            'defaultSubTabId'     => 'buttons',
            'ajaxActionPrefix'    => 'save_' . $this->tab_id,
            'categories'          => array_keys($this->label_categories),
            'managementNonce'     => wp_create_nonce('pe_labels_management'),
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
        ];

        return $data;
    }

    public function enqueue_scripts() {
        // Make sure to provide the script data
        $this->provide_script_data_for_localization();

        // The LabelsManagement module is bundled into the main admin script via webpack
        // No need to enqueue it separately
    }



    /**
     * Get fields for a given context (sub-tab) in a format compatible with the parent class methods.
     * This method is specially designed to handle the nested category[key] format used in the labels settings.
     * 
     * @since    2.0.0
     * @access   protected
     * @param    string|null $context_id    The sub_tab_id (category name)
     * @return   array       Field definitions for the specified context
     */
    protected function get_fields_for_context($context_id = null) {
        if ($context_id === null) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log(get_class($this) . ': get_fields_for_context called with null context_id for labels module.');
            }
            return []; // Return empty array when context is missing
        }

        $context_fields = [];
        $category_labels = $this->get_labels_for_category($context_id);

        // For each label in this category, create a field definition
        foreach ($category_labels as $label_key => $label_value) {
            // Important: For the context fields, use just the label_key as the field_id
            // This is because the handle_ajax_save method expects to find these keys directly in the input data
            $display_id = $context_id . '_' . $label_key;
            
            $context_fields[$label_key] = [
                'id' => $display_id,              // HTML ID for the element
                'field_id' => $label_key,         // Key for matching in validation
                'type' => 'text',                 // All labels are text fields
                'description' => $this->get_label_description($context_id, $label_key),
                'default' => $label_value,
                'label_for' => $display_id,
                'category' => $context_id,
                'label_key' => $label_key,
                'value' => $label_value,
                'sub_tab_id' => $context_id       // Required for parent class filtering
            ];
        }

        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('LabelsSettingsModule::get_fields_for_context for ' . $context_id . ' returning ' . count($context_fields) . ' fields');
        }

        return $context_fields;
    }

    /**
     * Override the handle_ajax_save method from the parent class to properly handle the nested structure
     * of the labels settings.
     */
    public function handle_ajax_save() {
        if (defined('WP_DEBUG') && WP_DEBUG) { error_log('--- AJAX SAVE START (' . get_class($this) . ') ---'); }

        if (!isset($_POST['nonce']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['nonce'])), 'product_estimator_settings_nonce')) {
            wp_send_json_error(array('message' => __('Security check failed', 'product-estimator')), 403); exit;
        }
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => __('You do not have permission to change these settings', 'product-estimator')), 403); exit;
        }
        if (!isset($_POST['form_data'])) {
            if (defined('WP_DEBUG') && WP_DEBUG) { error_log('form_data not in POST.'); }
            wp_send_json_error(array('message' => __('No form data received', 'product-estimator')), 400); exit;
        }

        parse_str(wp_unslash($_POST['form_data']), $parsed_form_data);
        if (defined('WP_DEBUG') && WP_DEBUG) { error_log('Parsed form_data: ' . print_r($parsed_form_data, true)); }

        // Get the current category (sub-tab) being updated
        $current_context_id = isset($_POST['sub_tab_id']) ? sanitize_key($_POST['sub_tab_id']) : null;
        if (defined('WP_DEBUG') && WP_DEBUG) { 
            error_log('Attempted to read "sub_tab_id" from POST. Value for $current_context_id: "' . 
                ($current_context_id === null ? 'NULL' : $current_context_id) . '"'); 
        }
        
        if (empty($current_context_id) || !isset($this->label_categories[$current_context_id])) {
            if (defined('WP_DEBUG') && WP_DEBUG) { 
                error_log(get_class($this) . ': AJAX save error - $current_context_id is invalid for labels module.'); 
            }
            wp_send_json_error(['message' => __('Error: Invalid category context.', 'product-estimator')]); exit;
        }
        
        // Get the submission data for the current category
        $category_data = $parsed_form_data[$this->option_name][$current_context_id] ?? [];
        if (empty($category_data)) {
            if (defined('WP_DEBUG') && WP_DEBUG) { 
                error_log(get_class($this) . ': AJAX save error - No data found for category ' . $current_context_id); 
            }
            wp_send_json_error(['message' => __('Error: No data received for this category.', 'product-estimator')]); exit;
        }
        
        if (defined('WP_DEBUG') && WP_DEBUG) { 
            error_log('Category data for validation: ' . print_r($category_data, true));
        }
        
        // Get existing options to merge with
        $existing_options = get_option($this->option_name, []);
        if (!is_array($existing_options)) { $existing_options = []; }
        $new_options = $existing_options;
        
        // Ensure the category exists in the options
        if (!isset($new_options[$current_context_id])) {
            $new_options[$current_context_id] = [];
        }
        
        // Process and sanitize the category data
        foreach ($category_data as $label_key => $label_value) {
            $new_options[$current_context_id][$label_key] = sanitize_text_field($label_value);
        }
        
        // Save the updated options
        update_option($this->option_name, $new_options);
        
        // Increment version for cache busting
        update_option('product_estimator_labels_version', time());
        
        // Clear caches
        delete_transient('pe_frontend_labels_cache');
        
        if (defined('WP_DEBUG') && WP_DEBUG) { error_log('--- AJAX SAVE SUCCESS (' . get_class($this) . ') ---'); }
        wp_send_json_success([
            'message' => sprintf(
                __('%s labels saved successfully.', 'product-estimator'),
                $this->label_categories[$current_context_id]['title']
            )
        ]);
        exit;
    }

    public function validate_settings($input, $fields = array()) {
        error_log('LabelSettingsModule::validate_settings called with input: ' . print_r($input, true));

        // Get existing options to merge with
        $existing_options = get_option($this->option_name, []);
        $validated = $existing_options;

        // With the new field name structure, input should be in nested format:
        // { buttons: { save: "Save", cancel: "Cancel", ... }, forms: { ... } }
        
        // Process the input data
        foreach ($input as $category => $values) {
            // Only process valid categories
            if (isset($this->label_categories[$category])) {
                if (!isset($validated[$category])) {
                    $validated[$category] = [];
                }
                
                // Process all values for this category
                if (is_array($values)) {
                    foreach ($values as $label_key => $label_value) {
                        // Sanitize each label value
                        $validated[$category][$label_key] = sanitize_text_field($label_value);
                    }
                }
            }
        }

        // Increment version for cache busting
        update_option('product_estimator_labels_version', time());

        // Clear caches
        delete_transient('pe_frontend_labels_cache');

        error_log('LabelSettingsModule::validate_settings returning validated data: ' . print_r($validated, true));

        return $validated;
    }

//    /**
//     * AJAX handler for saving labels by category
//     */
//    public function ajax_save_labels_category() {
//        check_ajax_referer('pe_save_labels', 'nonce');
//
//        if (!current_user_can('manage_options')) {
//            wp_die('Unauthorized');
//        }
//
//        $category = sanitize_text_field($_POST['category'] ?? '');
//        $labels = $_POST['labels'] ?? [];
//
//        if (empty($category) || !isset($this->label_categories[$category])) {
//            wp_send_json_error('Invalid category');
//        }
//
//        // Get current options
//        $options = get_option($this->option_name, []);
//
//        // Update the specific category
//        $options[$category] = array_map('sanitize_text_field', $labels);
//
//        // Save
//        update_option($this->option_name, $options);
//
//        // Clear caches
//        delete_transient('pe_frontend_labels_cache');
//        update_option('product_estimator_labels_version', time());
//
//        wp_send_json_success([
//            'message' => __('Labels saved successfully', 'product-estimator'),
//            'category' => $category,
//        ]);
//    }

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
            'version' => get_option('product_estimator_labels_version', '2.0.0'),
            'exported_at' => current_time('mysql'),
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
        $valid_categories = ['buttons', 'forms', 'messages', 'ui_elements', 'pdf'];
        $validated_data = [];
        
        foreach ($data as $category => $labels) {
            if (!in_array($category, $valid_categories)) {
                continue;
            }
            
            if (!is_array($labels)) {
                continue;
            }
            
            $validated_data[$category] = [];
            
            foreach ($labels as $key => $value) {
                // Sanitize key to ensure it's valid
                $clean_key = sanitize_key($key);
                if ($clean_key !== '') {
                    $validated_data[$category][$clean_key] = sanitize_text_field($value);
                }
            }
        }
        
        return empty($validated_data) ? false : $validated_data;
    }
    
    /**
     * Count total labels across all categories
     * 
     * @param array $labels Labels array
     * @return int Total count
     */
    private function count_labels($labels) {
        $count = 0;
        foreach ($labels as $category => $category_labels) {
            if (is_array($category_labels)) {
                $count += count($category_labels);
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
            
            // Update labels
            update_option('product_estimator_labels', $validated_labels);
            
            // Update version to trigger cache invalidation
            $new_version = time() . '.0.0';
            update_option('product_estimator_labels_version', $new_version);
            
            // Clear transients
            delete_transient('pe_labels_' . get_option('product_estimator_labels_version'));
            
            return [
                'success' => true, 
                'message' => 'Labels imported successfully',
                'count' => $this->count_labels($validated_labels)
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
            $parts = explode('.', $path);
            if (count($parts) !== 2) {
                continue;
            }
            
            $category = $parts[0];
            $key = $parts[1];
            
            if (isset($labels[$category][$key])) {
                $labels[$category][$key] = sanitize_text_field($new_value);
                $updated_count++;
            }
        }
        
        if ($updated_count > 0) {
            update_option('product_estimator_labels', $labels);
            
            // Update version to trigger cache invalidation
            $new_version = time() . '.0.0';
            update_option('product_estimator_labels_version', $new_version);
            
            // Clear transients
            delete_transient('pe_labels_' . get_option('product_estimator_labels_version'));
        }
        
        return [
            'success' => true,
            'updated_count' => $updated_count
        ];
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

        // Get default structure
        $defaults = LabelsMigration::get_default_structure();

        // Get current options
        $options = get_option($this->option_name, []);

        // Reset the specific category
        $options[$category] = $defaults[$category] ?? [];

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
}
