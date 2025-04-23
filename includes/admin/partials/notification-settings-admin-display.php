<?php
/**
 * Admin UI for notification settings with vertical sub-tabs
 *
 * @since      1.2.0
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes/admin/partials
 */

// If this file is called directly, abort.
if (!defined('WPINC')) {
    exit;
}

// Get settings
$options = get_option('product_estimator_settings', []);

// Get notification types
$notification_types = $this->get_notification_types();

// Default to general settings as the active sub-tab
$active_sub_tab = isset($_GET['sub_tab']) ? sanitize_key($_GET['sub_tab']) : 'general';

// Ensure the active sub-tab exists, default to general if not
if ($active_sub_tab !== 'general' && !isset($notification_types[$active_sub_tab])) {
    $active_sub_tab = 'general';
}
?>

<div class="notification-settings-wrapper">
    <div class="notification-settings-container">
        <!-- Vertical sub-tabs navigation -->
        <div class="vertical-tabs">
            <ul class="vertical-tabs-nav">
                <li class="tab-item <?php echo $active_sub_tab === 'general' ? 'active' : ''; ?>">
                    <a href="#general" data-tab="general">
                        <?php esc_html_e('General Settings', 'product-estimator'); ?>
                    </a>
                </li>
                <?php foreach ($notification_types as $type => $type_data) : ?>
                    <li class="tab-item <?php echo $active_sub_tab === $type ? 'active' : ''; ?>">
                        <a href="#<?php echo esc_attr($type); ?>" data-tab="<?php echo esc_attr($type); ?>">
                            <?php echo esc_html($type_data['title']); ?>
                        </a>
                    </li>
                <?php endforeach; ?>
            </ul>
        </div>

        <!-- Tab content container -->
        <div class="vertical-tabs-content">
            <!-- General settings tab -->
            <div id="general" class="vertical-tab-content <?php echo $active_sub_tab === 'general' ? 'active' : ''; ?>">
                <h3><?php esc_html_e('General Notification Settings', 'product-estimator'); ?></h3>

                <form method="post" action="javascript:void(0);" class="notification-settings-form general-settings-form">
                    <table class="form-table">
                        <tbody>
                        <tr>
                            <th scope="row">
                                <label for="enable_notifications"><?php esc_html_e('Enable Notifications', 'product-estimator'); ?></label>
                            </th>
                            <td>
                                <input type="checkbox" id="enable_notifications" name="product_estimator_settings[enable_notifications]" value="1" <?php checked(isset($options['enable_notifications']) ? $options['enable_notifications'] : false); ?> />
                                <p class="description"><?php esc_html_e('Enable email notifications for the estimator', 'product-estimator'); ?></p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">
                                <label for="default_designer_email"><?php esc_html_e('Default Designer Email', 'product-estimator'); ?></label>
                            </th>
                            <td>
                                <input type="email" id="default_designer_email" name="product_estimator_settings[default_designer_email]" value="<?php echo esc_attr(isset($options['default_designer_email']) ? $options['default_designer_email'] : get_option('admin_email')); ?>" class="regular-text" />
                                <p class="description"><?php esc_html_e('Fallback email for designer consultation requests', 'product-estimator'); ?></p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">
                                <label for="default_store_email"><?php esc_html_e('Default Store Email', 'product-estimator'); ?></label>
                            </th>
                            <td>
                                <input type="email" id="default_store_email" name="product_estimator_settings[default_store_email]" value="<?php echo esc_attr(isset($options['default_store_email']) ? $options['default_store_email'] : get_option('admin_email')); ?>" class="regular-text" />
                                <p class="description"><?php esc_html_e('Fallback email for store contact requests', 'product-estimator'); ?></p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">
                                <label for="pdf_footer_text"><?php esc_html_e('PDF Footer Text', 'product-estimator'); ?></label>
                            </th>
                            <td>
                                <textarea id="pdf_footer_text" name="product_estimator_settings[pdf_footer_text]" rows="4" class="regular-text"><?php echo esc_textarea(isset($options['pdf_footer_text']) ? $options['pdf_footer_text'] : __('Thank you for your interest in our products. This estimate is valid for [validity] days.', 'product-estimator')); ?></textarea>
                                <p class="description"><?php esc_html_e('Text to appear in the footer of PDF estimates', 'product-estimator'); ?></p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">
                                <label for="company_logo"><?php esc_html_e('Company Logo', 'product-estimator'); ?></label>
                            </th>
                            <td class="company-logo-field">
                                <?php
                                $image_id = isset($options['company_logo']) ? $options['company_logo'] : '';
                                $image_url = $image_id ? wp_get_attachment_image_url($image_id, 'medium') : '';
                                ?>
                                <input type="hidden" id="company_logo" name="product_estimator_settings[company_logo]" value="<?php echo esc_attr($image_id); ?>" />

                                <div class="image-preview-wrapper">
                                    <?php if ($image_url) : ?>
                                        <img src="<?php echo esc_url($image_url); ?>" alt="" style="max-width:100px;max-height:100px;display:block;margin-bottom:10px;" />
                                    <?php endif; ?>
                                </div>

                                <input type="button" class="button image-upload-button" value="<?php esc_attr_e('Upload Image', 'product-estimator'); ?>" data-field-id="company_logo" />
                                <input type="button" class="button image-remove-button <?php echo empty($image_id) ? 'hidden' : ''; ?>" value="<?php esc_attr_e('Remove Image', 'product-estimator'); ?>" data-field-id="company_logo" />

                                <p class="description"><?php esc_html_e('Logo to use in emails and PDF documents', 'product-estimator'); ?></p>
                            </td>
                        </tr>
                        </tbody>
                    </table>

                    <p class="submit">
                        <button type="submit" class="button button-primary save-settings">
                            <?php esc_html_e('Save General Settings', 'product-estimator'); ?>
                        </button>
                        <span class="spinner"></span>
                    </p>
                </form>
            </div>

            <!-- Notification type tabs -->
            <?php foreach ($notification_types as $type => $type_data) : ?>
                <div id="<?php echo esc_attr($type); ?>" class="vertical-tab-content <?php echo $active_sub_tab === $type ? 'active' : ''; ?>">
                    <h3><?php echo esc_html($type_data['title'] . ' ' . __('Notification', 'product-estimator')); ?></h3>
                    <p class="tab-description"><?php echo esc_html($type_data['description']); ?></p>

                    <?php include PRODUCT_ESTIMATOR_PLUGIN_DIR . 'includes/admin/partials/notification-template-tab.php'; ?>
                </div>
            <?php endforeach; ?>
        </div>
    </div>

    <!-- Template tags information -->
    <div class="template-tags-info">
        <h3><?php esc_html_e('Available Template Tags', 'product-estimator'); ?></h3>
        <p><?php esc_html_e('You can use the following tags in your notification templates:', 'product-estimator'); ?></p>
        <ul class="template-tags-list">
            <li><code>[validity]</code> - <?php esc_html_e('Estimate validity period in days', 'product-estimator'); ?></li>
            <li><code>[estimate_id]</code> - <?php esc_html_e('Unique estimate identifier', 'product-estimator'); ?></li>
            <li><code>[estimate_name]</code> - <?php esc_html_e('Name of the estimate', 'product-estimator'); ?></li>
            <li><code>[customer_name]</code> - <?php esc_html_e('Customer\'s name', 'product-estimator'); ?></li>
            <li><code>[customer_email]</code> - <?php esc_html_e('Customer\'s email address', 'product-estimator'); ?></li>
            <li><code>[total]</code> - <?php esc_html_e('Estimate total price', 'product-estimator'); ?></li>
            <li><code>[date]</code> - <?php esc_html_e('Current date', 'product-estimator'); ?></li>
        </ul>
    </div>
</div>
