<?php
/**
 * Admin partial for a single Similar Products rule item
 *
 * @since      1.0.5
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes/admin/partials
 */

// Get parameters passed from the module class
$rule_id = isset($rule_id) ? $rule_id : '';
$rule = isset($rule) ? $rule : [];
$categories = isset($categories) ? $categories : [];

// Get selected categories
$selected_categories = isset($rule['source_categories']) ? $rule['source_categories'] : [];
if (empty($selected_categories) && isset($rule['source_category'])) {
    // For backward compatibility with old format
    $selected_categories = [$rule['source_category']];
}

// Format attributes for hidden field
$attributes_string = !empty($rule['attributes']) ? implode(',', $rule['attributes']) : '';

// Set default threshold
$threshold = isset($rule['similarity_threshold']) ? $rule['similarity_threshold'] : 0.5;

// Get a readable category name for display in the rule header
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
    <div class="rule-header">
        <div class="rule-title"><?php echo esc_html($category_name); ?></div>
        <div class="rule-actions">
            <button type="button" class="button save-rule"><?php esc_html_e('Save', 'product-estimator'); ?></button>
            <button type="button" class="button delete-rule"><?php esc_html_e('Delete', 'product-estimator'); ?></button>
        </div>
    </div>

    <div class="rule-content">
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

        <div class="rule-field">
            <label><?php esc_html_e('Product Attributes to Compare', 'product-estimator'); ?></label>
            <p class="description">
                <?php esc_html_e('Select which attributes should be used to determine product similarity.', 'product-estimator'); ?>
            </p>

            <input type="hidden" class="selected-attributes"
                   value="<?php echo esc_attr($attributes_string); ?>">

            <div class="attributes-list">
                <?php if (empty($selected_categories)): ?>
                    <p><?php esc_html_e('Please select categories first.', 'product-estimator'); ?></p>
                <?php else: ?>
                    <p><?php esc_html_e('Loading attributes...', 'product-estimator'); ?></p>
                <?php endif; ?>
            </div>
        </div>

        <div class="rule-field">
            <label for="<?php echo esc_attr($rule_id); ?>-similarity-threshold">
                <?php esc_html_e('Similarity Threshold', 'product-estimator'); ?>
            </label>
            <p class="description">
                <?php esc_html_e('Products with attribute similarity above this threshold will be considered similar.', 'product-estimator'); ?>
            </p>

            <div class="slider-container">
                <input type="range" id="<?php echo esc_attr($rule_id); ?>-similarity-threshold"
                       name="<?php echo esc_attr($rule_id); ?>[similarity_threshold]"
                       class="similarity-threshold"
                       min="0" max="1" step="0.05"
                       value="<?php echo esc_attr($threshold); ?>">
                <span class="similarity-threshold-value"><?php echo esc_html($threshold); ?></span>
            </div>
        </div>
    </div>
</div>
