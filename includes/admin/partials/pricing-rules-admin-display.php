<?php
/**
 * Pricing Rules Admin UI
 * 
 * This template renders the admin interface for managing product pricing rules.
 * It allows administrators to define category-specific pricing methods and sources
 * that override the default pricing settings. The UI consists of:
 * 
 * 1. An "Add New" button to create new rules
 * 2. A form for adding/editing rules (hidden by default)
 * 3. A table listing existing rules with edit/delete options
 * 
 * Expected variables from the parent scope:
 * - $pricing_rules: Array of pricing rules from the database
 * - $categories: Array of WP_Term objects representing product categories
 * - $this: PricingRulesSettingsModule instance with helper methods
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

    <!-- Add New Button - Triggers the display of the pricing rule form -->
    <p><button type="button" class="add-new-rule button button-primary"><?php esc_html_e('Add New Pricing Rule', 'product-estimator'); ?></button></p>

    <!-- Rule Form - Hidden by default, shown when adding or editing rules -->
    <div class="pricing-rules-form" style="display: none;">
        <h3 class="form-title"><?php esc_html_e('Add New Pricing Rule', 'product-estimator'); ?></h3>

        <form id="pricing-rule-form" method="post">
            <!-- Hidden field stores the rule ID when editing an existing rule -->
            <input type="hidden" id="rule_id" name="rule_id" value="">

            <table class="form-table">
                <tbody>
                <tr>
                    <th scope="row">
                        <label for="categories"><?php esc_html_e('Categories', 'product-estimator'); ?></label>
                    </th>
                    <td>
                        <!-- Multiple select for choosing product categories -->
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
                        <!-- Select menu for pricing method (e.g., fixed, per square meter) -->
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
                        <!-- Select menu for pricing source (e.g., website, NetSuite) -->
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

    <!-- Rules List - Displays existing pricing rules in a table -->
    <div class="pricing-rules-list">
        <h3><?php esc_html_e('Existing Pricing Rules', 'product-estimator'); ?></h3>

        <?php if (empty($pricing_rules)) : ?>
            <!-- Empty state message when no rules exist -->
            <div class="no-items"><?php esc_html_e('No pricing rules have been created yet.', 'product-estimator'); ?></div>
        <?php else : ?>
            <!-- Table of existing pricing rules -->
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
                            // Get and display category names for this rule
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
                            // Display the pricing method and source in a readable format
                            $pricing_method = isset($rule['pricing_method']) ? $rule['pricing_method'] : '';
                            $pricing_source = isset($rule['pricing_source']) ? $rule['pricing_source'] : '';
                            echo esc_html($this->get_pricing_label($pricing_method, $pricing_source));
                            ?>
                        </td>
                        <td class="actions">
                            <!-- Edit button with data attributes for populating the form -->
                            <button type="button"
                                    class="button button-small edit-rule"
                                    data-id="<?php echo esc_attr($rule_id); ?>"
                                    data-categories="<?php echo esc_attr(implode(',', $categories_array)); ?>"
                                    data-method="<?php echo esc_attr($pricing_method); ?>"
                                    data-source="<?php echo esc_attr($pricing_source); ?>">
                                <?php esc_html_e('Edit', 'product-estimator'); ?>
                            </button>

                            <!-- Delete button with rule ID for identifying which rule to delete -->
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