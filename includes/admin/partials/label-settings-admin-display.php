<?php
/**
 * Admin UI for label settings with vertical sub-tabs
 *
 * @since      1.2.0
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes/admin/partials
 */

// If this file is called directly, abort.
if (!defined('WPINC')) {
    exit;
}

// Get settings - use the correct option name
$labels = get_option($this->option_name, []);

// Get label types
$label_types = $this->get_label_types();

// Default to label_general settings as the active sub-tab
$active_sub_tab = isset($_GET['sub_tab']) ? sanitize_key($_GET['sub_tab']) : 'labels-general';

// Ensure the active sub-tab exists, default to general if not
if (!isset($label_types[$active_sub_tab])) {
    $active_sub_tab = 'labels-general';
}
?>

<div class="label-settings-wrapper">
    <div class="label-settings-container">
        <!-- Vertical sub-tabs navigation -->
        <div class="vertical-tabs">
            <ul class="vertical-tabs-nav">
                <?php foreach ($label_types as $type => $type_data) : ?>
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
            <!-- Label type tabs -->
            <?php foreach ($label_types as $type => $type_data) : ?>
                <div id="<?php echo esc_attr($type); ?>" class="vertical-tab-content <?php echo $active_sub_tab === $type ? 'active' : ''; ?>">
                    <h3><?php echo esc_html($type_data['title'] . ' ' . __('Labels', 'product-estimator')); ?></h3>
                    <p class="tab-description"><?php echo esc_html($type_data['description']); ?></p>

                    <form method="post" action="javascript:void(0);" class="label-settings-form label-type-form" data-type="<?php echo esc_attr($type); ?>">
                        <?php
                        settings_fields($this->plugin_name . '_options');
                        do_settings_sections($this->plugin_name . '_' . $this->tab_id . '_' . $type);
                        ?>
                        <p class="submit">
                            <button type="submit" class="button button-primary save-settings">
                                <?php printf(esc_html__('Save %s Labels', 'product-estimator'), esc_html($type_data['title'])); ?>
                            </button>
                            <span class="spinner"></span>
                        </p>
                    </form>
                </div>
            <?php endforeach; ?>
        </div>
    </div>

    <!-- Label usage information sidebar -->
    <div class="label-usage-info">
        <h3><?php esc_html_e('Label Usage Information', 'product-estimator'); ?></h3>
        <p><?php esc_html_e('Labels are used throughout the Product Estimator plugin to customize the text displayed to users.', 'product-estimator'); ?></p>

        <div class="label-usage-section">
            <h4><?php esc_html_e('Using Labels in Templates', 'product-estimator'); ?></h4>
            <p><?php esc_html_e('In PHP templates, use the following function to display labels:', 'product-estimator'); ?></p>
            <code>product_estimator_get_label('label_key');</code>
        </div>

        <div class="label-usage-section">
            <h4><?php esc_html_e('Using Labels in JavaScript', 'product-estimator'); ?></h4>
            <p><?php esc_html_e('In JavaScript, access labels through the global object:', 'product-estimator'); ?></p>
            <code>productEstimatorLabels.label_key</code>
        </div>

        <div class="label-usage-section">
            <h4><?php esc_html_e('Placeholder Variables', 'product-estimator'); ?></h4>
            <p><?php esc_html_e('Some labels support the following placeholder variables:', 'product-estimator'); ?></p>
            <ul>
                <li><code>{product_name}</code> - <?php esc_html_e('The name of the product', 'product-estimator'); ?></li>
                <li><code>{estimate_name}</code> - <?php esc_html_e('The name of the estimate', 'product-estimator'); ?></li>
                <li><code>{customer_name}</code> - <?php esc_html_e('The customer\'s name', 'product-estimator'); ?></li>
                <li><code>{price}</code> - <?php esc_html_e('The formatted price', 'product-estimator'); ?></li>
            </ul>
        </div>
    </div>
</div>
