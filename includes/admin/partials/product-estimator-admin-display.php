<?php
/**
 * Provide a admin area view for the plugin
 *
 * This file is used to markup the admin-facing aspects of the plugin.
 *
 * @since      1.0.0
 * @package    Product_Estimator
 * @subpackage Product_Estimator/admin/partials
 */

// If this file is called directly, abort.
if (!defined('WPINC')) {
    die;
}

// Get plugin settings
$options = get_option('product_estimator_settings');

// Get estimate statistics
global $wpdb;
$table_name = $wpdb->prefix . 'product_estimator_estimates';
$total_estimates = $wpdb->get_var("SELECT COUNT(*) FROM {$table_name}");
$recent_estimates = $wpdb->get_results("SELECT * FROM {$table_name} ORDER BY created_at DESC LIMIT 5");
?>

<div class="wrap">
    <h1><?php echo esc_html(get_admin_page_title()); ?></h1>

    <?php settings_errors(); ?>

    <div class="product-estimator-admin-wrapper">
        <!-- Dashboard Overview -->
        <div class="dashboard-widgets-wrap">
            <div id="dashboard-widgets" class="metabox-holder">
                <div class="postbox-container">
                    <div class="meta-box-sortables">

                        <!-- Quick Stats Widget -->
                        <div class="postbox">
                            <h2 class="hndle"><?php esc_html_e('Quick Stats', 'product-estimator'); ?></h2>
                            <div class="inside">
                                <div class="main">
                                    <ul>
                                        <li><?php echo sprintf(esc_html__('Total Estimates: %d', 'product-estimator'), $total_estimates); ?></li>
                                        <li><?php echo sprintf(esc_html__('Plugin Version: %s', 'product-estimator'), PRODUCT_ESTIMATOR_VERSION); ?></li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <!-- Recent Estimates Widget -->
                        <div class="postbox">
                            <h2 class="hndle">
                                <?php esc_html_e('Recent Estimates', 'product-estimator'); ?>
                                <a href="<?php echo esc_url(admin_url('admin.php?page=product-estimator-estimates')); ?>" class="page-title-action" style="top: 5px; position: relative;">
                                    <?php esc_html_e('View All', 'product-estimator'); ?>
                                </a>
                            </h2>
                            <div class="inside">
                                <?php if (!empty($recent_estimates)) : ?>
                                    <table class="widefat">
                                        <thead>
                                        <tr>
                                            <th><?php esc_html_e('Customer', 'product-estimator'); ?></th>
                                            <th><?php esc_html_e('Email', 'product-estimator'); ?></th>
                                            <th><?php esc_html_e('Total', 'product-estimator'); ?></th>
                                            <th><?php esc_html_e('Date', 'product-estimator'); ?></th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        <?php foreach ($recent_estimates as $estimate) : ?>
                                            <tr>
                                                <td>
                                                    <a href="<?php echo esc_url(admin_url('admin.php?page=product-estimator-estimates&action=view&estimate=' . $estimate->id)); ?>">
                                                        <?php echo esc_html($estimate->name); ?>
                                                    </a>
                                                </td>
                                                <td><?php echo esc_html($estimate->email); ?></td>
                                                <td>
                                                    <?php
                                                    if ($estimate->total_min === $estimate->total_max) {
                                                        echo wc_price($estimate->total_min);
                                                    } else {
                                                        echo wc_price($estimate->total_min) . ' - ' . wc_price($estimate->total_max);
                                                    }
                                                    ?>
                                                </td>
                                                <td><?php echo esc_html(date_i18n(get_option('date_format'), strtotime($estimate->created_at))); ?></td>
                                            </tr>
                                        <?php endforeach; ?>
                                        </tbody>
                                    </table>
                                <?php else : ?>
                                    <p><?php esc_html_e('No estimates found.', 'product-estimator'); ?></p>
                                <?php endif; ?>
                            </div>
                        </div>

                        <!-- Quick Links Widget -->
                        <div class="postbox">
                            <h2 class="hndle"><?php esc_html_e('Quick Links', 'product-estimator'); ?></h2>
                            <div class="inside">
                                <ul>
                                    <li><a href="<?php echo esc_url(admin_url('admin.php?page=product-estimator-settings')); ?>"><?php esc_html_e('Plugin Settings', 'product-estimator'); ?></a></li>
                                    <li><a href="<?php echo esc_url(admin_url('admin.php?page=product-estimator-estimates')); ?>"><?php esc_html_e('View All Estimates', 'product-estimator'); ?></a></li>
                                    <li><a href="<?php echo esc_url(admin_url('edit.php?post_type=product')); ?>"><?php esc_html_e('Manage Products', 'product-estimator'); ?></a></li>
                                    <li><a href="<?php echo esc_url('https://github.com/Ru-Digital/product-estimator/wiki'); ?>" target="_blank"><?php esc_html_e('Documentation', 'product-estimator'); ?></a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
