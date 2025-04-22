<?php
namespace RuDigital\ProductEstimator\Includes\Admin\Settings;

/**
 * Notification Settings Module Class
 *
 * Implements the notification settings tab functionality.
 *
 * @since      1.1.0
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes/admin/settings
 */
class NotificationSettingsModule extends SettingsModuleBase {

    /**
     * Set the tab and section details.
     *
     * @since    1.1.0
     * @access   protected
     */
    protected function set_tab_details() {
        $this->tab_id = 'notifications';
        $this->tab_title = __('Notifications', 'product-estimator');
        $this->section_id = 'notification_settings';
        $this->section_title = __('Notification Settings', 'product-estimator');
    }

    /**
     * Register the module-specific settings fields.
     *
     * @since    1.1.0
     * @access   protected
     */
    protected function register_fields() {
        $fields = array(
            'enable_notifications' => array(
                'title' => __('Enable Email Notifications', 'product-estimator'),
                'type' => 'checkbox',
                'description' => __('Enable email notifications for new estimates', 'product-estimator'),
                'default' => true
            ),
            'admin_email_notifications' => array(
                'title' => __('Admin Notifications', 'product-estimator'),
                'type' => 'checkbox',
                'description' => __('Send notifications to admin when new estimates are created', 'product-estimator'),
                'default' => true
            ),
            'user_email_notifications' => array(
                'title' => __('User Notifications', 'product-estimator'),
                'type' => 'checkbox',
                'description' => __('Send confirmation emails to users when they create estimates', 'product-estimator'),
                'default' => true
            ),
            'default_designer_email' => array(
                'title' => __('Default Designer Email', 'product-estimator'),
                'type' => 'email',
                'description' => __('Fallback email for designer consultation requests', 'product-estimator'),
                'default' => get_option('admin_email')
            ),
            'default_store_email' => array(
                'title' => __('Default Store Email', 'product-estimator'),
                'type' => 'email',
                'description' => __('Fallback email for store contact requests', 'product-estimator'),
                'default' => get_option('admin_email')
            ),
            'pdf_footer_text' => array(
                'title' => __('PDF Footer Text', 'product-estimator'),
                'type' => 'textarea',
                'description' => __('Text to appear in the footer of PDF estimates', 'product-estimator'),
                'default' => __('Thank you for your interest in our products. This estimate is valid for [validity] days.', 'product-estimator')
            ),
            'email_subject_template' => array(
                'title' => __('Email Subject Template', 'product-estimator'),
                'type' => 'text',
                'description' => __('Template for email subjects. Use [estimate_id] and [estimate_name] as placeholders.', 'product-estimator'),
                'default' => __('Your Estimate #[estimate_id] - [estimate_name]', 'product-estimator')
            ),
            'company_logo' => array(
                'title' => __('Company Logo', 'product-estimator'),
                'type' => 'image',
                'description' => __('Logo to use in emails and PDF documents', 'product-estimator')
            )
        );

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

            add_settings_field(
                $id,
                $field['title'],
                array($this, 'render_field_callback'),
                $this->plugin_name . '_' . $this->tab_id,
                $this->section_id,
                $args
            );
        }
    }

    /**
     * Render a settings field.
     *
     * @since    1.1.0
     * @access   public
     * @param    array    $args    Field arguments.
     */
    public function render_field_callback($args) {
        if ($args['type'] === 'image') {
            $this->render_image_field($args);
        } else {
            $this->render_field($args);
        }
    }

    /**
     * Process form data specific to notification settings
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

        // Fix for checkbox fields - ensure they're properly set to 0 when unchecked
        $checkbox_fields = array('enable_notifications', 'admin_email_notifications', 'user_email_notifications');
        foreach ($checkbox_fields as $field) {
            if (!isset($settings[$field])) {
                $settings[$field] = 0;
            }
        }

        // If notifications are enabled, validate email addresses
        if (isset($settings['enable_notifications']) && $settings['enable_notifications']) {
            // Validate designer email if provided
            if (!empty($settings['default_designer_email']) && !is_email($settings['default_designer_email'])) {
                return new \WP_Error(
                    'invalid_designer_email',
                    __('Please enter a valid email address for the default designer email', 'product-estimator')
                );
            }

            // Validate store email if provided
            if (!empty($settings['default_store_email']) && !is_email($settings['default_store_email'])) {
                return new \WP_Error(
                    'invalid_store_email',
                    __('Please enter a valid email address for the default store email', 'product-estimator')
                );
            }
        }

        // Handle image upload if needed
        if (isset($_FILES['company_logo']) && !empty($_FILES['company_logo']['tmp_name'])) {
            if (!function_exists('wp_handle_upload')) {
                require_once(ABSPATH . 'wp-admin/includes/file.php');
            }

            $upload_overrides = array('test_form' => false);
            $uploaded_file = wp_handle_upload($_FILES['company_logo'], $upload_overrides);

            if (isset($uploaded_file['error'])) {
                return new \WP_Error(
                    'upload_error',
                    $uploaded_file['error']
                );
            }

            // Save the attachment ID
            if (isset($uploaded_file['url'])) {
                $file_name_and_location = $uploaded_file['file'];
                $file_title_for_media_library = sanitize_file_name($_FILES['company_logo']['name']);

                $attachment = array(
                    'post_mime_type' => $uploaded_file['type'],
                    'post_title' => $file_title_for_media_library,
                    'post_content' => '',
                    'post_status' => 'inherit'
                );

                $attachment_id = wp_insert_attachment($attachment, $file_name_and_location);

                if (!is_wp_error($attachment_id)) {
                    if (!function_exists('wp_generate_attachment_metadata')) {
                        require_once(ABSPATH . 'wp-admin/includes/image.php');
                    }

                    $attachment_data = wp_generate_attachment_metadata($attachment_id, $file_name_and_location);
                    wp_update_attachment_metadata($attachment_id, $attachment_data);

                    // Save the attachment ID to the settings
                    $settings['company_logo'] = $attachment_id;
                }
            }
        }

        // Make sure settings preserves company_logo value even when no new upload
        if (!isset($settings['company_logo']) || empty($settings['company_logo'])) {
            $existing_settings = get_option('product_estimator_settings', array());
            if (isset($existing_settings['company_logo']) && !empty($existing_settings['company_logo'])) {
                $settings['company_logo'] = $existing_settings['company_logo'];
            }
        }

        // Update the settings array in the form data for further processing
        $form_data['product_estimator_settings'] = $settings;

        return true;
    }

    /**
     * Additional actions after saving notification settings
     *
     * @since    1.1.0
     * @access   protected
     * @param    array    $form_data    The processed form data
     */
    protected function after_save_actions($form_data) {
        // Clear notification-related caches
        delete_transient('product_estimator_email_templates');
    }

    /**
     * Render an image upload field.
     *
     * @since    1.1.0
     * @access   protected
     * @param    array    $args    Field arguments.
     */
    protected function render_image_field($args) {
        $options = get_option('product_estimator_settings');
        $id = $args['id'];
        $image_id = isset($options[$id]) ? $options[$id] : '';
        $image_url = '';

        if ($image_id) {
            $image_url = wp_get_attachment_image_url($image_id, 'medium');
        }

        // Hidden input to store the attachment ID
        echo '<input type="hidden" id="' . esc_attr($id) . '" name="product_estimator_settings[' . esc_attr($id) . ']" value="' . esc_attr($image_id) . '" />';

        // Image preview
        echo '<div class="image-preview-wrapper">';
        if ($image_url) {
            echo '<img src="' . esc_url($image_url) . '" alt="" style="max-width:100px;max-height:100px;display:block;margin-bottom:10px;" />';
        }
        echo '</div>';

        // Upload button
        echo '<input type="button" class="button image-upload-button" value="' . esc_attr__('Upload Image', 'product-estimator') . '" data-field-id="' . esc_attr($id) . '" />';

        // Remove button (only shown if an image is set)
        echo ' <input type="button" class="button image-remove-button' . ($image_id ? '' : ' hidden') . '" value="' . esc_attr__('Remove Image', 'product-estimator') . '" data-field-id="' . esc_attr($id) . '" />';

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
        echo '<p>' . esc_html__('Configure email notifications and PDF settings.', 'product-estimator') . '</p>';

        // Add template tag helper
        echo '<div class="template-tags-help">';
        echo '<h4>' . esc_html__('Available Template Tags', 'product-estimator') . '</h4>';
        echo '<ul class="template-tags-list">';
        echo '<li><code>[validity]</code> - ' . esc_html__('Estimate validity period in days', 'product-estimator') . '</li>';
        echo '<li><code>[estimate_id]</code> - ' . esc_html__('Unique estimate identifier', 'product-estimator') . '</li>';
        echo '<li><code>[estimate_name]</code> - ' . esc_html__('Name of the estimate', 'product-estimator') . '</li>';
        echo '<li><code>[customer_name]</code> - ' . esc_html__('Customer\'s name', 'product-estimator') . '</li>';
        echo '<li><code>[total]</code> - ' . esc_html__('Estimate total price', 'product-estimator') . '</li>';
        echo '<li><code>[date]</code> - ' . esc_html__('Current date', 'product-estimator') . '</li>';
        echo '</ul>';
        echo '</div>';
    }

    /**
     * Enqueue module-specific scripts.
     *
     * @since    1.1.0
     * @access   public
     */
    public function enqueue_scripts() {
        // Enqueue WordPress media scripts
        wp_enqueue_media();

        wp_enqueue_script(
            $this->plugin_name . '-notification-settings',
            PRODUCT_ESTIMATOR_PLUGIN_URL . 'admin/js/modules/notification-settings.js',
            array('jquery', 'media-upload', $this->plugin_name . '-settings'),
            $this->version,
            true
        );

        // Localize script
        wp_localize_script(
            $this->plugin_name . '-notification-settings',
            'notificationSettings',
            array(
                'tab_id' => $this->tab_id,
                'i18n' => array(
                    'selectImage' => __('Select Image', 'product-estimator'),
                    'useThisImage' => __('Use this image', 'product-estimator'),
                    'validationErrorEmail' => __('Please enter a valid email address', 'product-estimator')
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
            $this->plugin_name . '-notification-settings',
            PRODUCT_ESTIMATOR_PLUGIN_URL . 'admin/css/modules/notification-settings.css',
            array($this->plugin_name . '-settings'),
            $this->version
        );
    }

    /**
     * Handle AJAX save request for this module
     *
     * @since    1.1.0
     * @access   public
     */
    public function handle_ajax_save() {
        // Verify nonce
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'product_estimator_settings_nonce')) {
            wp_send_json_error(array('message' => __('Security check failed', 'product-estimator')));
            return;
        }

        // Check permissions
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => __('You do not have permission to change these settings', 'product-estimator')));
            return;
        }

        // Parse form data
        if (!isset($_POST['form_data'])) {
            wp_send_json_error(array('message' => __('No form data received', 'product-estimator')));
            return;
        }

        parse_str($_POST['form_data'], $form_data);

        // Process the settings specific to this module
        $result = $this->process_form_data($form_data);

        if (is_wp_error($result)) {
            wp_send_json_error(array('message' => $result->get_error_message()));
            return;
        }

        // Update options
        if (isset($form_data['product_estimator_settings'])) {
            // Get existing settings
            $current_settings = get_option('product_estimator_settings', array());

            // Ensure checkbox fields are properly set
            $checkbox_fields = array('enable_notifications', 'admin_email_notifications', 'user_email_notifications');
            foreach ($checkbox_fields as $field) {
                if (!isset($form_data['product_estimator_settings'][$field])) {
                    $form_data['product_estimator_settings'][$field] = 0;
                }
            }

            // Update only the settings for this module
            $updated_settings = array_merge($current_settings, $form_data['product_estimator_settings']);

            // Save updated settings
            update_option('product_estimator_settings', $updated_settings);
        }

        // Allow modules to perform additional actions after saving
        $this->after_save_actions($form_data);

        // Send success response
        wp_send_json_success(array(
            'message' => sprintf(
                __('%s settings saved successfully', 'product-estimator'),
                $this->tab_title
            )
        ));
    }
}
