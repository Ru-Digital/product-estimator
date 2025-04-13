<?php
/**
 * Pricing Rules Admin UI
 *
 * @since      1.1.0
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes/admin/partials
 */

// If this file is called directly, abort.
if (!defined('WPINC')) {
    exit;
}
?>

<div class="product-estimator-pricing-rules">
    <h3><?php esc_html_e('Pricing Rules Management', 'product-estimator'); ?></h3>

    <p><?php esc_html_e('Configure pricing methods for products based on their categories. These rules determine how prices are calculated in the estimator.', 'product-estimator'); ?></p>

    <!-- Add New Button -->
    <p><button type="button" class="add-new-rule button button-primary"><?php esc_html_e('Add New Pricing Rule', 'product-estimator'); ?></button></p>

    <!-- Rule Form -->
    <div class="pricing-rules-form" style="display: none;">
        <h3 class="form-title"><?php esc_html_e('Add New Pricing Rule', 'product-estimator'); ?></h3>

        <form id="pricing-rule-form" method="post">
            <input type="hidden" id="rule_id" name="rule_id" value="">

            <table class="form-table">
                <tbody>
                <tr>
                    <th scope="row">
                        <label for="categories"><?php esc_html_e('Categories', 'product-estimator'); ?></label>
                    </th>
                    <td>
                        <select id="categories" name="categories[]" multiple="multiple">
                            <?php foreach ($categories as $category) : ?>
                                <option value="<?php echo esc_attr($category->term_id); ?>"><?php echo esc_html($category->name); ?></option>
                            <?php endforeach; ?>
                        </select>
                        <p class="description"><?php esc_html_e('Select categories to which this pricing method should apply.', 'product-estimator'); ?></p>
                    </td>
                </tr>

                <tr>
                    <th scope="row">
                        <label for="pricing_method"><?php esc_html_e('Pricing Method', 'product-estimator'); ?></label>
                    </th>
                    <td>
                        <select id="pricing_method" name="pricing_method">
                            <option value=""><?php esc_html_e('-- Select Pricing Method --', 'product-estimator'); ?></option>
                            <?php foreach ($this->get_pricing_methods() as $value => $label) : ?>
                                <option value="<?php echo esc_attr($value); ?>"><?php echo esc_html($label); ?></option>
                            <?php endforeach; ?>
                        </select>
                        <p class="description"><?php esc_html_e('Select how pricing should be calculated for products in the selected categories.', 'product-estimator'); ?></p>
                    </td>
                </tr>
                <tr>
                    <th scope="row">
                        <label for="pricing_source"><?php esc_html_e('Pricing Source', 'product-estimator'); ?></label>
                    </th>
                    <td>
                        <select id="pricing_source" name="pricing_source">
                            <option value=""><?php esc_html_e('-- Select Pricing Source --', 'product-estimator'); ?></option>
                            <?php foreach ($this->get_pricing_sources() as $value => $label) : ?>
                                <option value="<?php echo esc_attr($value); ?>"><?php echo esc_html($label); ?></option>
                            <?php endforeach; ?>
                        </select>
                        <p class="description"><?php esc_html_e('Select where the price data should be sourced from.', 'product-estimator'); ?></p>
                    </td>
                </tr>
                </tbody>
            </table>

            <div class="form-actions">
                <button type="submit" class="save-rule button button-primary"><?php esc_html_e('Save Pricing Rule', 'product-estimator'); ?></button>
                <button type="button" class="cancel-form button"><?php esc_html_e('Cancel', 'product-estimator'); ?></button>
            </div>
        </form>
    </div>

    <!-- Rules List -->
    <div class="pricing-rules-list">
        <h3><?php esc_html_e('Existing Pricing Rules', 'product-estimator'); ?></h3>

        <?php if (empty($pricing_rules)) : ?>
            <div class="no-items"><?php esc_html_e('No pricing rules have been created yet.', 'product-estimator'); ?></div>
        <?php else : ?>
            <table class="wp-list-table widefat fixed striped pricing-rules-table">
                <thead>
                <tr>
                    <th scope="col"><?php esc_html_e('Categories', 'product-estimator'); ?></th>
                    <th scope="col"><?php esc_html_e('Pricing Method', 'product-estimator'); ?></th>
                    <th scope="col"><?php esc_html_e('Actions', 'product-estimator'); ?></th>
                </tr>
                </thead>
                <tbody>
                <?php foreach ($pricing_rules as $rule_id => $rule) : ?>
                    <tr data-id="<?php echo esc_attr($rule_id); ?>">
                        <td>
                            <?php
                            $category_names = array();
                            $categories_array = isset($rule['categories']) ? (array)$rule['categories'] : array();

                            foreach ($categories_array as $cat_id) {
                                $term = get_term($cat_id, 'product_cat');
                                if (!is_wp_error($term) && $term) {
                                    $category_names[] = $term->name;
                                }
                            }

                            echo esc_html(implode(', ', $category_names));
                            ?>
                        </td>
                        <td>
                            <?php
                            $pricing_method = isset($rule['pricing_method']) ? $rule['pricing_method'] : '';
                            $pricing_source = isset($rule['pricing_source']) ? $rule['pricing_source'] : '';
                            echo esc_html($this->get_pricing_label($pricing_method, $pricing_source));
                            ?>
                        </td>
                        <td class="actions">
                            <button type="button"
                                    class="button button-small edit-rule"
                                    data-id="<?php echo esc_attr($rule_id); ?>"
                                    data-categories="<?php echo esc_attr(implode(',', $categories_array)); ?>"
                                    data-method="<?php echo esc_attr($pricing_method); ?>"
                                    data-source="<?php echo esc_attr($pricing_source); ?>">
                                <?php esc_html_e('Edit', 'product-estimator'); ?>
                            </button>

                            <button type="button"
                                    class="button button-small delete-rule"
                                    data-id="<?php echo esc_attr($rule_id); ?>">
                                <?php esc_html_e('Delete', 'product-estimator'); ?>
                            </button>
                        </td>
                    </tr>
                <?php endforeach; ?>
                </tbody>
            </table>
        <?php endif; ?>
    </div>
</div>
