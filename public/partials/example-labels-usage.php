<?php
/**
 * Example template demonstrating label usage
 * 
 * This file shows how to use the dynamic labels system in PHP templates
 *
 * @since      2.0.0
 * @package    Product_Estimator
 * @subpackage Product_Estimator/public/partials
 */

// If this file is called directly, abort.
if (!defined('WPINC')) {
    die;
}
?>

<div class="product-estimator-example">
    <h2><?php product_estimator_label('ui_elements.get_started'); ?></h2>
    
    <!-- Example 1: Simple label usage -->
    <div class="actions">
        <button type="button" class="pe-button pe-button-primary">
            <?php product_estimator_label('buttons.save_estimate'); ?>
        </button>
        
        <button type="button" class="pe-button">
            <?php product_estimator_label('buttons.print_estimate'); ?>
        </button>
        
        <button type="button" class="pe-button">
            <?php product_estimator_label('buttons.request_copy'); ?>
        </button>
    </div>
    
    <!-- Example 2: Label with fallback -->
    <div class="product-list-header">
        <h3><?php product_estimator_label('buttons.similar_products', 'Similar Products'); ?></h3>
        <button class="toggle-button">
            <?php product_estimator_label('ui_elements.expand'); ?>
        </button>
    </div>
    
    <!-- Example 3: Formatted label with placeholders -->
    <div class="status-message">
        <?php 
        // Example with placeholder replacements
        product_estimator_label_format(
            'messages.showing_results', 
            ['count' => 5], 
            'Showing {count} results'
        ); 
        ?>
    </div>
    
    <!-- Example 4: Using labels in attributes -->
    <input 
        type="email" 
        class="pe-input" 
        placeholder="<?php echo product_estimator_label_attr('forms.placeholder_email'); ?>"
    />
    
    <!-- Example 5: Using labels with HTML allowed -->
    <div class="price-notice">
        <?php product_estimator_label_html('ui_elements.price_notice'); ?>
    </div>
    
    <!-- Example 6: JavaScript usage -->
    <script type="text/javascript">
        jQuery(document).ready(function($) {
            // Using label in JavaScript
            const saveButtonText = '<?php echo product_estimator_label_js('buttons.save'); ?>';
            
            $('.save-button').text(saveButtonText);
            
            // Success message
            const message = '<?php echo product_estimator_label_js('messages.estimate_saved'); ?>';
            console.log(message);
        });
    </script>
    
    <!-- Example 7: Conditional label display -->
    <?php if (product_estimator_label_exists('messages.welcome')): ?>
        <div class="welcome-message">
            <?php product_estimator_label('messages.welcome'); ?>
        </div>
    <?php endif; ?>
    
    <!-- Example 8: Getting multiple labels from a category -->
    <?php 
    $button_labels = product_estimator_get_category_labels('buttons');
    foreach ($button_labels as $key => $label): 
    ?>
        <button data-action="<?php echo esc_attr($key); ?>">
            <?php echo esc_html($label); ?>
        </button>
    <?php endforeach; ?>
</div>