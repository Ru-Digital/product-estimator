<?php
namespace RuDigital\ProductEstimator\Includes\Admin\Settings;

/**
 * General Settings Module Class
 *
 * Implements the general settings tab functionality.
 *
 * @since      1.1.0
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes/admin/settings
 */
class GeneralSettingsModule extends SettingsModuleBase {

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
        $this->section_title = __('Estimator Settings', 'product-estimator');
    }

    /**
     * Register the module-specific settings fields.
     *
     * @since    1.1.0
     * @access   protected
     */
    protected function register_fields() {
        $fields = array(
            'default_markup' => array(
                'title' => __('Default Markup (%)', 'product-estimator'),
                'type' => 'number',
                'description' => __('Default markup percentage for price ranges', 'product-estimator'),
                'default' => 10,
                'min' => 0,
                'max' => 100
            ),
        );

        // Add fields
        foreach ($fields as $id => $field) {
            $args = array(
                'id' => $id,
                'type' => $field['type'],
                'description' => $field['description']
            );

            // Add additional parameters if they exist
            if (isset($field['default'])) {
                $args['default'] = $field['default'];
            }
            if (isset($field['min'])) {
                $args['min'] = $field['min'];
            }
            if (isset($field['max'])) {
                $args['max'] = $field['max'];
            }
            if (isset($field['options'])) {
                $args['options'] = $field['options'];
            }

            add_settings_field(
                $id,
                $field['title'],
                array($this, 'render_field_callback'),
                $this->plugin_name . '_' . $this->tab_id,
                $this->section_id,
                $args
            );
        }

        // Add PDF Settings section
        add_settings_section(
            'pdf_settings',
            __('PDF Settings', 'product-estimator'),
            array($this, 'render_pdf_section_description'),
            $this->plugin_name . '_' . $this->tab_id
        );

        // PDF Settings fields
        $pdf_fields = array(
            'pdf_template' => array(
                'title' => __('PDF Template', 'product-estimator'),
                'type' => 'file',
                'description' => __('Upload a PDF template file (optional)', 'product-estimator'),
                'accept' => 'application/pdf',
                'required' => true
            ),
            'pdf_margin_top' => array(
                'title' => __('Margin Top (mm)', 'product-estimator'),
                'type' => 'number',
                'description' => __('Top margin for PDF in millimeters', 'product-estimator'),
                'default' => 15,
                'min' => 0,
                'max' => 200
            ),
            'pdf_margin_bottom' => array(
                'title' => __('Margin Bottom (mm)', 'product-estimator'),
                'type' => 'number',
                'description' => __('Bottom margin for PDF in millimeters', 'product-estimator'),
                'default' => 15,
                'min' => 0,
                'max' => 200
            ),
            'estimate_expiry_days' => array(
                'title' => __('Estimate Validity (Days)', 'product-estimator'),
                'type' => 'number',
                'description' => __('Number of days an estimate remains valid', 'product-estimator'),
                'default' => 30,
                'min' => 1,
                'max' => 365
            ),
            'pdf_footer_text' => array(
                'title' => __('Footer Text', 'product-estimator'),
                'type' => 'html',
                'description' => __('Text to display in the footer of PDF estimates', 'product-estimator')
            ),
            'pdf_footer_contact_details_content' => array(
                'title' => __('Footer Contact Details', 'product-estimator'),
                'type' => 'html',
                'description' => __('Contact details to display in the footer of PDF estimates', 'product-estimator')
            ),
        );

        // Add PDF fields
        foreach ($pdf_fields as $id => $field) {
            $args = array(
                'id' => $id,
                'type' => $field['type'],
                'description' => $field['description']
            );

            // Add additional parameters if they exist
            if (isset($field['default'])) {
                $args['default'] = $field['default'];
            }
            if (isset($field['min'])) {
                $args['min'] = $field['min'];
            }
            if (isset($field['max'])) {
                $args['max'] = $field['max'];
            }
            if (isset($field['accept'])) {
                $args['accept'] = $field['accept'];
            }

            add_settings_field(
                $id,
                $field['title'],
                array($this, 'render_field_callback'),
                $this->plugin_name . '_' . $this->tab_id,
                'pdf_settings',
                $args
            );
        }
    }

    /**
     * Render PDF settings section description.
     *
     * @since    1.1.0
     * @access   public
     */
    public function render_pdf_section_description() {
        echo '<p>' . esc_html__('Configure settings for PDF estimate generation.', 'product-estimator') . '</p>';
    }

    /**
     * Render a settings field.
     *
     * @since    1.1.0
     * @access   public
     * @param    array    $args    Field arguments.
     */
    public function render_field_callback($args) {
        if ($args['type'] === 'file') {
            $this->render_file_field($args);
        } elseif ($args['type'] === 'textarea') {
            $this->render_textarea_field($args);
        } elseif ($args['type'] === 'html') {
            $this->render_html_field($args);
        } else {
            $this->render_field($args);
        }
    }

    /**
     * Render a rich text editor field.
     *
     * @since    1.1.0
     * @access   protected
     * @param    array    $args    Field arguments.
     */
    protected function render_html_field($args) {
        $options = get_option('product_estimator_settings');
        $id = $args['id'];
        $value = isset($options[$id]) ? $options[$id] : '';

        if (empty($value) && isset($args['default'])) {
            $value = $args['default'];
        }

        // Use WordPress rich text editor
        $editor_id = $id;
        $editor_settings = array(
            'textarea_name' => "product_estimator_settings[{$id}]",
            'media_buttons' => false,
            'textarea_rows' => 10,
            'teeny'         => false, // Set to false to get more formatting options
        );
        wp_editor($value, $editor_id, $editor_settings);

        if (isset($args['description'])) {
            echo '<p class="description">' . esc_html($args['description']) . '</p>';
        }
    }

    /**
     * Render a file upload field.
     *
     * @since    1.1.0
     * @access   protected
     * @param    array    $args    Field arguments.
     */
    protected function render_file_field($args) {
        $options = get_option('product_estimator_settings');
        $id = $args['id'];
        $file_id = isset($options[$id]) ? $options[$id] : '';
        $file_url = '';
        $is_required = isset($args['required']) && $args['required'];

        if ($file_id) {
            $file_url = wp_get_attachment_url($file_id);
        }

        // Hidden input to store the attachment ID
        echo '<input type="hidden" id="' . esc_attr($id) . '" name="product_estimator_settings[' . esc_attr($id) . ']" value="' . esc_attr($file_id) . '"' . ($is_required ? ' required' : '') . ' />';

        // File preview
        echo '<div class="file-preview-wrapper">';
        if ($file_url) {
            echo '<p class="file-preview"><a href="' . esc_url($file_url) . '" target="_blank">' . esc_html(basename($file_url)) . '</a></p>';
        } else if ($is_required) {
            echo '<p class="file-required-notice">' . esc_html__('A PDF template is required', 'product-estimator') . '</p>';
        }
        echo '</div>';

        // Upload button
        echo '<input type="button" class="button file-upload-button" value="' . esc_attr__('Upload PDF', 'product-estimator') . '" data-field-id="' . esc_attr($id) . '" data-accept="' . esc_attr($args['accept']) . '" />';

        // Remove button (only shown if a file is set)
        echo ' <input type="button" class="button file-remove-button' . ($file_id ? '' : ' hidden') . '" value="' . esc_attr__('Remove PDF', 'product-estimator') . '" data-field-id="' . esc_attr($id) . '" />';

        if (isset($args['description'])) {
            echo '<p class="description">' . esc_html($args['description']) . ($is_required ? ' <span class="required">*</span>' : '') . '</p>';
        }
    }

    /**
     * Render a textarea field.
     *
     * @since    1.1.0
     * @access   protected
     * @param    array    $args    Field arguments.
     */
    protected function render_textarea_field($args) {
        $options = get_option('product_estimator_settings');
        $id = $args['id'];
        $value = isset($options[$id]) ? $options[$id] : '';

        if (empty($value) && isset($args['default'])) {
            $value = $args['default'];
        }

        echo '<textarea id="' . esc_attr($id) . '" name="product_estimator_settings[' . esc_attr($id) . ']" rows="5" cols="50">' . esc_textarea($value) . '</textarea>';

        if (isset($args['description'])) {
            echo '<p class="description">' . esc_html($args['description']) . '</p>';
        }
    }

    /**
     * Process form data specific to general settings
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

        // Validate the default_markup field
        if (isset($settings['default_markup'])) {
            $markup = intval($settings['default_markup']);
            if ($markup < 0 || $markup > 100) {
                return new \WP_Error(
                    'invalid_markup',
                    __('Default markup must be between 0 and 100', 'product-estimator')
                );
            }
        }

        // Validate the estimate_expiry_days field
        if (isset($settings['estimate_expiry_days'])) {
            $days = intval($settings['estimate_expiry_days']);
            if ($days < 1 || $days > 365) {
                return new \WP_Error(
                    'invalid_expiry',
                    __('Estimate validity must be between 1 and 365 days', 'product-estimator')
                );
            }
        }

        // Validate PDF margin fields
        if (isset($settings['pdf_margin_top'])) {
            $margin = intval($settings['pdf_margin_top']);
            if ($margin < 0 || $margin > 200) {
                return new \WP_Error(
                    'invalid_margin_top',
                    __('Top margin must be between 0 and 200mm', 'product-estimator')
                );
            }
        }

        if (isset($settings['pdf_margin_bottom'])) {
            $margin = intval($settings['pdf_margin_bottom']);
            if ($margin < 0 || $margin > 200) {
                return new \WP_Error(
                    'invalid_margin_bottom',
                    __('Bottom margin must be between 0 and 200mm', 'product-estimator')
                );
            }
        }

        // Validate the PDF template field (required)
        if (empty($settings['pdf_template'])) {
            return new \WP_Error(
                'missing_pdf_template',
                __('A PDF template file is required', 'product-estimator')
            );
        }

        // Process HTML fields
        foreach ($settings as $key => $value) {
            // For HTML content fields like the rich editor
            if ($key === 'pdf_footer_text' || $key === 'pdf_footer_contact_details_content') {
                // Use wp_kses_post which allows safe HTML tags but removes scripts
                $settings[$key] = wp_kses_post($value);
            }
        }

        // Update the settings array in the form data for further processing
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
        // Clear any caches related to general settings
        if (function_exists('wp_cache_delete')) {
            wp_cache_delete('product_estimator_settings', 'options');
        }

        // Update transients if needed
        delete_transient('product_estimator_general_settings');
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

        echo '<select id="' . esc_attr($id) . '" name="product_estimator_settings[' . esc_attr($id) . ']">';

        foreach ($args['options'] as $value => $label) {
            echo '<option value="' . esc_attr($value) . '" ' . selected($current_value, $value, false) . '>' . esc_html($label) . '</option>';
        }

        echo '</select>';

        if (isset($args['description'])) {
            echo '<p class="description">' . esc_html($args['description']) . '</p>';
        }
    }

    /**
     * Render the section description.
     *
     * @since    1.1.0
     * @access   public
     */
    public function render_section_description() {
        echo '<p>' . esc_html__('Configure general estimator settings and defaults.', 'product-estimator') . '</p>';
    }

    /**
     * Enqueue module-specific scripts.
     *
     * @since    1.1.0
     * @access   public
     */
    public function enqueue_scripts() {
        wp_enqueue_script(
            $this->plugin_name . '-general-settings',
            PRODUCT_ESTIMATOR_PLUGIN_URL . 'admin/js/modules/general-settings.js',
            array('jquery', $this->plugin_name . '-settings'),
            $this->version,
            true
        );

        // Enqueue WordPress media scripts for file uploads
        wp_enqueue_media();

        // Enqueue the WordPress editor scripts
        wp_enqueue_editor();

        // Add localization for this module's specific needs
        wp_localize_script(
            $this->plugin_name . '-general-settings',
            'generalSettingsData',
            array(
                'tab_id' => $this->tab_id,
                'i18n' => array(
                    'validationErrorMarkup' => __('Markup percentage must be between 0 and 100', 'product-estimator'),
                    'validationErrorExpiry' => __('Validity must be between 1 and 365 days', 'product-estimator')
                )
            )
        );
    }

    /**
     * Enqueue module-specific styles.
     *
     * @since    1.1.0
     * @access   public
     */
    public function enqueue_styles() {
        wp_enqueue_style(
            $this->plugin_name . '-general-settings',
            PRODUCT_ESTIMATOR_PLUGIN_URL . 'admin/css/modules/general-settings.css',
            array($this->plugin_name . '-settings'),
            $this->version
        );
    }
}
