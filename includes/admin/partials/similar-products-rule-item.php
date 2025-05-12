<?php
/**
 * Admin partial for a single Similar Products rule item
 * 
 * This template renders a single rule item in the Similar Products admin interface.
 * Each rule defines which product categories and attributes should be considered
 * when finding similar products in the estimator.
 * 
 * The rule item includes:
 * 1. A header with the rule title (category names) and action buttons
 * 2. A dropdown for selecting source product categories
 * 3. A section for selecting product attributes to compare (loaded via AJAX)
 * 
 * Expected variables from parent scope:
 * - $rule_id: String identifier for the rule
 * - $rule: Array containing the rule configuration data
 * - $categories: Array of WP_Term objects representing product categories
 *
 * @since      1.0.5
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes/admin/partials
 */

// Get parameters passed from the module class
$rule_id = isset($rule_id) ? $rule_id : '';
$rule = isset($rule) ? $rule : [];
$categories = isset($categories) ? $categories : [];

// Get selected categories from the rule data
$selected_categories = isset($rule['source_categories']) ? $rule['source_categories'] : [];
if (empty($selected_categories) && isset($rule['source_category'])) {
    // For backward compatibility with old format (single category)
    $selected_categories = [$rule['source_category']];
}

// Format attributes list as comma-separated string for the hidden field
$attributes_string = !empty($rule['attributes']) ? implode(',', $rule['attributes']) : '';

// Get readable category names for display in the rule header
$category_name = __('Select Categories', 'product-estimator');
if (!empty($selected_categories)) {
    $category_names = [];
    foreach ($selected_categories as $cat_id) {
        foreach ($categories as $category) {
            if ($category->term_id == $cat_id) {
                $category_names[] = $category->name;
                break;
            }
        }
    }
    if (!empty($category_names)) {
        $category_name = implode(', ', $category_names);
    }
}
?>
<div class="similar-products-rule" data-rule-id="<?php echo esc_attr($rule_id); ?>">
    <!-- Rule header with title and action buttons -->
    <div class="rule-header">
        <div class="rule-title" title="<?php echo esc_attr($category_name); ?>">
            <?php echo esc_html($category_name); ?>
        </div>
        <div class="rule-actions">
            <button type="button" class="button save-rule">
                <?php esc_html_e('Save', 'product-estimator'); ?>
            </button>
            <button type="button" class="button delete-rule">
                <?php esc_html_e('Delete', 'product-estimator'); ?>
            </button>
        </div>
    </div>

    <!-- Rule content - category and attribute selection fields -->
    <div class="rule-content">
        <!-- Source Categories Selection -->
        <div class="rule-field">
            <label for="<?php echo esc_attr($rule_id); ?>-source-categories">
                <?php esc_html_e('Source Categories', 'product-estimator'); ?>
            </label>
            <select id="<?php echo esc_attr($rule_id); ?>-source-categories"
                    name="<?php echo esc_attr($rule_id); ?>[source_categories][]"
                    class="widefat source-categories-select"
                    multiple="multiple">
                <?php foreach ($categories as $category): ?>
                    <option value="<?php echo esc_attr($category->term_id); ?>"
                        <?php echo in_array($category->term_id, $selected_categories) ? 'selected' : ''; ?>>
                        <?php echo esc_html($category->name); ?>
                    </option>
                <?php endforeach; ?>
            </select>
            <p class="description">
                <?php esc_html_e('Hold Ctrl/Cmd key to select multiple categories', 'product-estimator'); ?>
            </p>
        </div>

        <!-- Product Attributes Selection (loaded via AJAX) -->
        <div class="rule-field">
            <label><?php esc_html_e('Product Attributes to Compare', 'product-estimator'); ?></label>
            <p class="description">
                <?php esc_html_e('Select which attributes should be used to determine product similarity.', 'product-estimator'); ?>
            </p>

            <!-- Hidden field to store selected attributes for form submission -->
            <input type="hidden" class="selected-attributes"
                   value="<?php echo esc_attr($attributes_string); ?>">

            <!-- Container for attribute checkboxes (populated by JavaScript) -->
            <div class="attributes-list">
                <?php if (empty($selected_categories)): ?>
                    <!-- Message when no categories are selected -->
                    <p><?php esc_html_e('Please select categories first.', 'product-estimator'); ?></p>
                <?php else: ?>
                    <!-- Loading message shown until AJAX loads the attributes -->
                    <p><?php esc_html_e('Loading attributes...', 'product-estimator'); ?></p>
                <?php endif; ?>
            </div>
        </div>
    </div>
</div>