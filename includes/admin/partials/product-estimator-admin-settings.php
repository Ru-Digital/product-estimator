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
    <?php
        foreach ($modules as $module) {
        $tab_id = $module->get_tab_id();
        $display_style = ($current_tab === $tab_id) ? 'block' : 'none';
        ?>
        <div id="<?php echo esc_attr($tab_id); ?>" class="tab-content" style="display: <?php echo esc_attr($display_style); ?>;">
            <?php
            // For standard settings tabs with fields
            if (method_exists($module, 'render_module_content')) {
                // Custom rendering for modules with special UI
                $module->render_module_content();
            } else {
                // Standard settings form
                ?>
                <form method="post" action="javascript:void(0);" class="product-estimator-form">
                    <?php
                    // Output section heading and fields
                    settings_fields($this->plugin_name . '_options');
                    do_settings_sections($this->plugin_name . '_' . $tab_id);
                    ?>
                    <p class="submit">
                        <button type="submit" class="button button-primary">
                            <?php esc_html_e('Save Settings', 'product-estimator'); ?>
                        </button>
                    </p>
                </form>
                <?php
            }
            ?>
        </div>
        <?php
    }
    ?>
    </div>
</div>
