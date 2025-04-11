<?php
/**
 * Provide an admin area view for the plugin settings
 *
 * This file is used to markup the admin-facing settings page.
 *
 * @since      1.1.0
 * @package    Product_Estimator
 * @subpackage Product_Estimator/admin/partials
 */

// If this file is called directly, abort.
if (!defined('WPINC')) {
    die;
}

// Get all modules from the Settings Manager
$modules = $this->get_modules();
$active_tab = isset($_GET['tab']) ? sanitize_key($_GET['tab']) : 'general';

// Ensure the active tab exists, default to general if not
if (!isset($modules[$active_tab])) {
    $active_tab = 'general';
}
?>

<div class="wrap">
    <h1><?php echo esc_html(get_admin_page_title()); ?></h1>

    <?php settings_errors(); ?>

    <div class="product-estimator-admin-wrapper">
        <!-- Navigation Tabs -->
        <nav class="nav-tab-wrapper">
            <?php foreach ($modules as $tab_id => $module): ?>
                <a href="?page=<?php echo esc_attr($this->plugin_name . '-settings'); ?>&tab=<?php echo esc_attr($tab_id); ?>"
                   class="nav-tab <?php echo $active_tab === $tab_id ? 'nav-tab-active' : ''; ?>"
                   data-tab="<?php echo esc_attr($tab_id); ?>">
                    <?php echo esc_html($module->get_tab_title()); ?>
                </a>
            <?php endforeach; ?>
        </nav>

        <?php foreach ($modules as $tab_id => $module): ?>
            <div id="<?php echo esc_attr($tab_id); ?>"
                 class="tab-content"
                 style="<?php echo $active_tab === $tab_id ? '' : 'display: none;'; ?>">

                <form method="post" action="options.php" class="product-estimator-form" id="product-estimator-<?php echo esc_attr($tab_id); ?>-form">
                    <?php settings_fields($this->plugin_name . '_options'); ?>
                    <?php do_settings_sections($this->plugin_name . '_' . $tab_id); ?>
                    <?php submit_button(); ?>
                </form>
            </div>
        <?php endforeach; ?>
    </div>
</div>
