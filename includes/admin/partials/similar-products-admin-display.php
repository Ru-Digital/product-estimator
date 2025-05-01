<?php
/**
 * Admin settings partial for Similar Products module
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

    <div class="similar-products-controls">
        <button type="button" class="button button-primary add-new-rule">
            <?php esc_html_e('Add New Rule', 'product-estimator'); ?>
        </button>
    </div>

    <div class="similar-products-rules">
        <?php if (empty($settings)): ?>
            <div class="no-rules-message">
                <p><?php esc_html_e('No similar product rules defined yet. Click "Add New Rule" to create your first rule.', 'product-estimator'); ?></p>
            </div>
        <?php else: ?>
            <?php foreach ($settings as $rule_id => $rule): ?>
                <?php $this->render_rule_item($rule_id, $rule, $categories); ?>
            <?php endforeach; ?>
        <?php endif; ?>
    </div>

    <!-- Rule Template (hidden, used by JavaScript) -->
    <div class="rule-template" style="display: none;">
        <?php
        // Use a placeholder ID for the template
        $this->render_rule_item('TEMPLATE_ID', array(
            'source_categories' => [],
            'attributes' => array()
        ), $categories);
        ?>
    </div>
</div>
