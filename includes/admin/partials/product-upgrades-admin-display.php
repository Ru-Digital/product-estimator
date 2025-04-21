<?php
/**
 * Admin UI display for Product Upgrades settings
 *
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes/admin/partials
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// This template expects $upgrades and $categories variables from the parent scope
?>

<div class="product-estimator-upgrades">
    <div class="upgrade-settings-header">
        <h3><?php esc_html_e('Product Upgrade Configurations', 'product-estimator'); ?></h3>
        <button type="button" class="button add-new-upgrade">
            <?php esc_html_e('Add New Upgrade Configuration', 'product-estimator'); ?>
        </button>
    </div>

    <!-- Upgrade Configuration Form -->
    <div class="product-upgrades-form" style="display: none;">
        <h3 class="form-title"><?php esc_html_e('Add New Upgrade Configuration', 'product-estimator'); ?></h3>

        <form id="product-upgrade-form" method="post" action="javascript:void(0);" class="product-estimator-form">
            <input type="hidden" id="upgrade_id" name="upgrade_id" value="">

            <table class="form-table">
                <tbody>
                <tr>
                    <th scope="row">
                        <label for="base_categories"><?php esc_html_e('Base Categories', 'product-estimator'); ?></label>
                    </th>
                    <td>
                        <select id="base_categories" name="base_categories[]" class="base-categories-select" multiple="multiple">
                            <?php foreach ($categories as $category) : ?>
                                <option value="<?php echo esc_attr($category->term_id); ?>">
                                    <?php echo esc_html($category->name); ?>
                                </option>
                            <?php endforeach; ?>
                        </select>
                        <p class="description">
                            <?php esc_html_e('Select categories containing products that can be upgraded.', 'product-estimator'); ?>
                        </p>
                    </td>
                </tr>

                <tr>
                    <th scope="row">
                        <label for="upgrade_categories"><?php esc_html_e('Upgrade Categories', 'product-estimator'); ?></label>
                    </th>
                    <td>
                        <select id="upgrade_categories" name="upgrade_categories[]" class="upgrade-categories-select" multiple="multiple">
                            <?php foreach ($categories as $category) : ?>
                                <option value="<?php echo esc_attr($category->term_id); ?>">
                                    <?php echo esc_html($category->name); ?>
                                </option>
                            <?php endforeach; ?>
                        </select>
                        <p class="description">
                            <?php esc_html_e('Select categories containing products that will be offered as upgrades.', 'product-estimator'); ?>
                        </p>
                    </td>
                </tr>

                <tr>
                    <th scope="row">
                        <label for="display_mode"><?php esc_html_e('Display Mode', 'product-estimator'); ?></label>
                    </th>
                    <td>
                        <select id="display_mode" name="display_mode">
                            <option value="dropdown"><?php esc_html_e('Dropdown', 'product-estimator'); ?></option>
                            <option value="radio"><?php esc_html_e('Radio Buttons', 'product-estimator'); ?></option>
                            <option value="tiles"><?php esc_html_e('Image Tiles', 'product-estimator'); ?></option>
                        </select>
                        <p class="description">
                            <?php esc_html_e('How upgrade options should be displayed to the user.', 'product-estimator'); ?>
                        </p>
                    </td>
                </tr>

                <tr>
                    <th scope="row">
                        <label for="upgrade_title"><?php esc_html_e('Title', 'product-estimator'); ?></label>
                    </th>
                    <td>
                        <input type="text" id="upgrade_title" name="upgrade_title" class="regular-text">
                        <p class="description">
                            <?php esc_html_e('Title to display above upgrade options (optional).', 'product-estimator'); ?>
                        </p>
                    </td>
                </tr>

                <tr>
                    <th scope="row">
                        <label for="upgrade_description"><?php esc_html_e('Description', 'product-estimator'); ?></label>
                    </th>
                    <td>
                        <textarea id="upgrade_description" name="upgrade_description" rows="3" class="regular-text"></textarea>
                        <p class="description">
                            <?php esc_html_e('Description text to display with upgrade options (optional).', 'product-estimator'); ?>
                        </p>
                    </td>
                </tr>
                </tbody>
            </table>

            <div class="form-actions">
                <button type="submit" class="button button-primary save-upgrade">
                    <?php esc_html_e('Save Configuration', 'product-estimator'); ?>
                </button>
                <button type="button" class="button cancel-form">
                    <?php esc_html_e('Cancel', 'product-estimator'); ?>
                </button>
            </div>
        </form>
    </div>

    <!-- Upgrade Configurations List -->
    <div class="product-upgrades-list">
        <?php if (empty($upgrades)) : ?>
            <div class="no-items">
                <?php esc_html_e('No upgrade configurations have been created yet.', 'product-estimator'); ?>
            </div>
        <?php else : ?>
            <table class="wp-list-table widefat fixed striped product-upgrades-table">
                <thead>
                <tr>
                    <th scope="col"><?php esc_html_e('Base Categories', 'product-estimator'); ?></th>
                    <th scope="col"><?php esc_html_e('Upgrade Categories', 'product-estimator'); ?></th>
                    <th scope="col"><?php esc_html_e('Display Mode', 'product-estimator'); ?></th>
                    <th scope="col"><?php esc_html_e('Actions', 'product-estimator'); ?></th>
                </tr>
                </thead>
                <tbody>
                <?php foreach ($upgrades as $id => $upgrade) :
                    // Get category names for display
                    $base_cat_names = array();
                    if (!empty($upgrade['base_categories'])) {
                        foreach ($upgrade['base_categories'] as $cat_id) {
                            $term = get_term($cat_id, 'product_cat');
                            if (!is_wp_error($term) && $term) {
                                $base_cat_names[] = $term->name;
                            }
                        }
                    }

                    $upgrade_cat_names = array();
                    if (!empty($upgrade['upgrade_categories'])) {
                        foreach ($upgrade['upgrade_categories'] as $cat_id) {
                            $term = get_term($cat_id, 'product_cat');
                            if (!is_wp_error($term) && $term) {
                                $upgrade_cat_names[] = $term->name;
                            }
                        }
                    }

                    // Format display mode for readability
                    $display_modes = array(
                        'dropdown' => __('Dropdown', 'product-estimator'),
                        'radio' => __('Radio Buttons', 'product-estimator'),
                        'tiles' => __('Image Tiles', 'product-estimator')
                    );
                    $display_mode = isset($upgrade['display_mode']) && isset($display_modes[$upgrade['display_mode']])
                        ? $display_modes[$upgrade['display_mode']]
                        : __('Dropdown', 'product-estimator');
                    ?>
                    <tr data-id="<?php echo esc_attr($id); ?>">
                        <td><?php echo esc_html(implode(', ', $base_cat_names)); ?></td>
                        <td><?php echo esc_html(implode(', ', $upgrade_cat_names)); ?></td>
                        <td><?php echo esc_html($display_mode); ?></td>
                        <td class="actions">
                            <button type="button" class="button button-small edit-upgrade"
                                    data-id="<?php echo esc_attr($id); ?>"
                                    data-base="<?php echo esc_attr(implode(',', isset($upgrade['base_categories']) ? $upgrade['base_categories'] : array())); ?>"
                                    data-upgrade="<?php echo esc_attr(implode(',', isset($upgrade['upgrade_categories']) ? $upgrade['upgrade_categories'] : array())); ?>"
                                    data-mode="<?php echo esc_attr(isset($upgrade['display_mode']) ? $upgrade['display_mode'] : 'dropdown'); ?>"
                                    data-title="<?php echo esc_attr(isset($upgrade['title']) ? $upgrade['title'] : ''); ?>"
                                    data-description="<?php echo esc_attr(isset($upgrade['description']) ? $upgrade['description'] : ''); ?>">
                                <?php esc_html_e('Edit', 'product-estimator'); ?>
                            </button>
                            <button type="button" class="button button-small delete-upgrade"
                                    data-id="<?php echo esc_attr($id); ?>">
                                <?php esc_html_e('Delete', 'product-estimator'); ?>
                            </button>
                        </td>
                    </tr>
                <?php endforeach; ?>
                </tbody>
            </table>
        <?php endif; ?>
    </div>

    <!-- Documentation Section -->
    <div class="upgrade-documentation">
        <h3><?php esc_html_e('Usage Guide', 'product-estimator'); ?></h3>
        <div class="documentation-content">
            <p>
                <?php esc_html_e('Product upgrades allow you to define relationships between product categories, where products from one category can be upgraded to products from another category.', 'product-estimator'); ?>
            </p>
            <ol>
                <li><?php esc_html_e('Select "base" categories containing products that can be upgraded', 'product-estimator'); ?></li>
                <li><?php esc_html_e('Select "upgrade" categories containing products that will be offered as upgrades', 'product-estimator'); ?></li>
                <li><?php esc_html_e('Choose a display mode for how upgrade options will appear to customers', 'product-estimator'); ?></li>
                <li><?php esc_html_e('Optionally add a title and description to help customers understand the upgrade options', 'product-estimator'); ?></li>
            </ol>
            <p>
                <?php esc_html_e('When a product from a "base" category is added to an estimate, customers will be offered upgrade options from the "upgrade" categories.', 'product-estimator'); ?>
            </p>
        </div>
    </div>
</div>
