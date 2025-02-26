<?php
// includes/admin/partials/product-estimator-admin-settings.php

/**
 * Provide an admin area view for the plugin settings
 *
 * This file is used to markup the admin-facing settings page.
 *
 * @since      1.0.0
 * @package    Product_Estimator
 * @subpackage Product_Estimator/admin/partials
 *
 * @var string $plugin_name The name/ID of the plugin
 */

// If this file is called directly, abort.
if (!defined('WPINC')) {
    die;
}
?>

<div class="wrap">
    <h1><?php echo esc_html(get_admin_page_title()); ?></h1>

    <?php settings_errors(); ?>

    <div class="product-estimator-admin-wrapper">
        <!-- Navigation Tabs -->
        <nav class="nav-tab-wrapper">
            <a href="#general" class="nav-tab nav-tab-active" data-tab="general">
                <?php esc_html_e('General Settings', 'product-estimator'); ?>
            </a>
            <a href="#netsuite" class="nav-tab" data-tab="netsuite">
                <?php esc_html_e('NetSuite Integration', 'product-estimator'); ?>
            </a>
            <a href="#notifications" class="nav-tab" data-tab="notifications">
                <?php esc_html_e('Notifications', 'product-estimator'); ?>
            </a>
        </nav>

        <form method="post" action="options.php" class="product-estimator-form">
            <?php
            settings_fields($plugin_name . '_options');
            ?>

            <!-- General Settings Tab -->
            <div id="general" class="tab-content active">
                <?php
                do_settings_sections($plugin_name);
                ?>
            </div>

            <!-- NetSuite Tab -->
            <div id="netsuite" class="tab-content" style="display: none;">
                <?php
                do_settings_sections($plugin_name . '_netsuite');
                ?>
            </div>

            <!-- Notifications Tab -->
            <div id="notifications" class="tab-content" style="display: none;">
                <?php
                do_settings_sections($plugin_name . '_notifications');
                ?>
            </div>

            <?php submit_button(); ?>
        </form>
    </div>
</div>

<script>
    jQuery(document).ready(function($) {
        // Tab switching functionality
        $('.nav-tab').on('click', function(e) {
            e.preventDefault();

            // Update active tab
            $('.nav-tab').removeClass('nav-tab-active');
            $(this).addClass('nav-tab-active');

            // Show correct content
            $('.tab-content').hide();
            $('#' + $(this).data('tab')).show();
        });
    });
</script>
