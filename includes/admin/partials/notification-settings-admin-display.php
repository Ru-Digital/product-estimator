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

// Default to notification_general settings as the active sub-tab
$active_sub_tab = isset($_GET['sub_tab']) ? sanitize_key($_GET['sub_tab']) : 'notification_general';

// Ensure the active sub-tab exists, default to general if not
if ($active_sub_tab !== 'notification_general' && !isset($notification_types[$active_sub_tab])) {
    $active_sub_tab = 'notification_general';
}
?>

<div class="notification-settings-wrapper">
    <div class="notification-settings-container">
        <!-- Vertical sub-tabs navigation -->
        <div class="vertical-tabs">
            <ul class="vertical-tabs-nav <?php echo !isset($options['enable_notifications']) || !$options['enable_notifications'] ? 'disabled' : ''; ?>">
                <li class="tab-item <?php echo $active_sub_tab === 'notification_general' ? 'active' : ''; ?>">
                    <a href="#notification_general" data-tab="notification_general">
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
            <div id="notification_general" class="vertical-tab-content <?php echo $active_sub_tab === 'notification_general' ? 'active' : ''; ?>">
                <h3><?php esc_html_e('General Notification Settings', 'product-estimator'); ?></h3>
                <p class="tab-description"><?php esc_html_e('Configure global notification settings that apply to all email types', 'product-estimator'); ?></p>

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
                                <label for="from_email"><?php esc_html_e('From Email', 'product-estimator'); ?></label>
                            </th>
                            <td>
                                <input type="email" id="from_email" name="product_estimator_settings[from_email]" value="<?php echo esc_attr(isset($options['from_email']) ? $options['from_email'] : get_option('admin_email')); ?>" class="regular-text" />
                                <p class="description"><?php esc_html_e('Email address used as the sender for all notifications', 'product-estimator'); ?></p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">
                                <label for="from_name"><?php esc_html_e('From Name', 'product-estimator'); ?></label>
                            </th>
                            <td>
                                <input type="text" id="from_name" name="product_estimator_settings[from_name]" value="<?php echo esc_attr(isset($options['from_name']) ? $options['from_name'] : get_bloginfo('name')); ?>" class="regular-text" />
                                <p class="description"><?php esc_html_e('Name displayed as the sender for all notifications', 'product-estimator'); ?></p>
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
            <li><code>[site_name]</code> - <?php esc_html_e('Your website name', 'product-estimator'); ?></li>
            <li><code>[site_url]</code> - <?php esc_html_e('Your website URL', 'product-estimator'); ?></li>
        </ul>
    </div>
</div>
