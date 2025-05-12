<?php
/**
 * Admin settings partial for Similar Products module
 * 
 * This template renders the admin interface for managing similar products rules.
 * It provides a UI for creating and managing rules that define which product
 * attributes should be considered when finding similar products in the estimator.
 * 
 * The interface includes:
 * 1. An explanation of similar products functionality
 * 2. An "Add New Rule" button
 * 3. A list of existing rules
 * 4. A hidden template for generating new rule forms via JavaScript
 * 
 * Expected variables from parent scope:
 * - $settings: Array of existing similar product rules from the database
 * - $categories: Array of WP_Term objects representing product categories
 * - $this: SimilarProductsSettingsModule instance with rendering methods
 *
 * @since      1.0.5
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes/admin/partials
 */

// Get parameters passed from the module class
$settings = isset($settings) ? $settings : [];
$categories = isset($categories) ? $categories : [];
?>

<div class="wrap product-estimator-similar-products-settings">
    <p class="description">
        <?php esc_html_e('Configure rules for finding similar products based on product attributes. This allows the estimator to suggest related products to users.', 'product-estimator'); ?>
    </p>

    <!-- Control button for adding new rules -->
    <div class="similar-products-controls">
        <button type="button" class="button button-primary add-new-rule">
            <?php esc_html_e('Add New Rule', 'product-estimator'); ?>
        </button>
    </div>

    <!-- Container for existing rules -->
    <div class="similar-products-rules">
        <?php if (empty($settings)): ?>
            <!-- Empty state message when no rules exist -->
            <div class="no-rules-message">
                <p><?php esc_html_e('No similar product rules defined yet. Click "Add New Rule" to create your first rule.', 'product-estimator'); ?></p>
            </div>
        <?php else: ?>
            <!-- Render each existing rule using the rule_item partial -->
            <?php foreach ($settings as $rule_id => $rule): ?>
                <?php $this->render_rule_item($rule_id, $rule, $categories); ?>
            <?php endforeach; ?>
        <?php endif; ?>
    </div>

    <!-- Rule Template - Hidden template used by JavaScript to create new rule forms -->
    <div class="rule-template" style="display: none;">
        <?php
        // Use a placeholder ID that will be replaced by JavaScript when creating a new rule
        $this->render_rule_item('TEMPLATE_ID', array(
            'source_categories' => [], // Empty array for new rules
            'attributes' => array()    // Empty array for new rules
        ), $categories);
        ?>
    </div>
</div>