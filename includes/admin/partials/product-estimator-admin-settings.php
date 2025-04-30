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
$active_tab = isset($_GET['tab']) ? sanitize_key($_GET['tab']) : '';

// Ensure the active tab exists, default to general if not
if (empty($active_tab) || !isset($modules[$active_tab])) {
    // Get first module as default
    reset($modules);
    $active_tab = key($modules);
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

        <!-- Tab Content -->
        <?php foreach ($modules as $tab_id => $module): ?>
            <div id="<?php echo esc_attr($tab_id); ?>" class="tab-content" style="display: <?php echo $active_tab === $tab_id ? 'block' : 'none'; ?>;">
                <?php
                // For modules with custom content rendering
                if (method_exists($module, 'render_module_content')) {
                    // Custom rendering for modules with special UI
                    $module->render_module_content();
                } else {
                    // Standard settings form
                    ?>
                    <form method="post" action="javascript:void(0);" class="product-estimator-form" data-tab="<?php echo esc_attr($tab_id); ?>">
                        <?php
                        // Output section heading and fields
                        settings_fields($this->plugin_name . '_options');
                        do_settings_sections($this->plugin_name . '_' . $tab_id);
                        ?>
                        <p class="submit">
                            <button type="submit" class="button button-primary save-settings">
                                <?php esc_html_e('Save Settings', 'product-estimator'); ?>
                            </button>
                            <span class="spinner"></span>
                        </p>
                    </form>
                    <?php
                }
                ?>
            </div>
        <?php endforeach; ?>
    </div>
</div>
