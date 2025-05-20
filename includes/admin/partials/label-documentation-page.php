<div class="wrap">
    <h1><?php echo esc_html__('Label Documentation', 'product-estimator'); ?></h1>
    
    <div class="notice notice-info">
        <p>
            <?php echo esc_html__('This tool allows you to generate comprehensive documentation for the labels system.', 'product-estimator'); ?>
            <?php echo esc_html__('The documentation will include all available labels, their usage, and examples.', 'product-estimator'); ?>
        </p>
    </div>
    
    <div class="card">
        <h2><?php echo esc_html__('Generate Documentation', 'product-estimator'); ?></h2>
        
        <form method="post" action="">
            <?php wp_nonce_field('pe_generate_labels_docs'); ?>
            
            <table class="form-table">
                <tr>
                    <th scope="row"><?php echo esc_html__('Format', 'product-estimator'); ?></th>
                    <td>
                        <fieldset>
                            <label>
                                <input type="radio" name="pe_docs_format" value="html" checked>
                                <span><?php echo esc_html__('HTML', 'product-estimator'); ?></span>
                            </label>
                            <br>
                            <label>
                                <input type="radio" name="pe_docs_format" value="markdown">
                                <span><?php echo esc_html__('Markdown', 'product-estimator'); ?></span>
                            </label>
                            <p class="description"><?php echo esc_html__('HTML is recommended for viewing in a browser, Markdown for including in code repositories.', 'product-estimator'); ?></p>
                        </fieldset>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><?php echo esc_html__('Include Analytics', 'product-estimator'); ?></th>
                    <td>
                        <label>
                            <input type="checkbox" name="pe_include_analytics" checked>
                            <span><?php echo esc_html__('Include usage statistics from analytics', 'product-estimator'); ?></span>
                        </label>
                        <p class="description"><?php echo esc_html__('When enabled, the documentation will show how frequently each label is used.', 'product-estimator'); ?></p>
                    </td>
                </tr>
            </table>
            
            <p class="submit">
                <input type="submit" name="pe_generate_docs" class="button button-primary" value="<?php echo esc_attr__('Generate Documentation', 'product-estimator'); ?>">
            </p>
        </form>
    </div>
    
    <div class="card" style="margin-top: 20px;">
        <h2><?php echo esc_html__('Developer Resources', 'product-estimator'); ?></h2>
        
        <p><?php echo esc_html__('The documentation can also be generated from the command line using the following script:', 'product-estimator'); ?></p>
        
        <pre style="background: #f5f5f5; padding: 15px; border-radius: 3px;">php <?php echo esc_html(PRODUCT_ESTIMATOR_PLUGIN_DIR); ?>bin/generate-labels-docs.php [--format=html|md] [--output=path/to/file] [--no-analytics]</pre>
        
        <h3><?php echo esc_html__('Working with Labels', 'product-estimator'); ?></h3>
        
        <p><?php echo esc_html__('Here are some examples of how to use labels in your code:', 'product-estimator'); ?></p>
        
        <h4><?php echo esc_html__('PHP', 'product-estimator'); ?></h4>
        <pre style="background: #f5f5f5; padding: 15px; border-radius: 3px;">
// Get labels frontend instance
global $product_estimator;
$labels_frontend = $product_estimator->get_component('labels_frontend');

// Get a label
$label = $labels_frontend->get('buttons.save_estimate', 'Default Value');

// Format a label with replacements
$label = $labels_frontend->format('messages.item_added', [
    'item' => $item_name
]);</pre>
        
        <h4><?php echo esc_html__('JavaScript', 'product-estimator'); ?></h4>
        <pre style="background: #f5f5f5; padding: 15px; border-radius: 3px;">
// Import label manager
import { labelManager } from '@utils/labels';

// Get a label
const label = labelManager.get('buttons.save_estimate', 'Default Value');

// Format a label with replacements
const label = labelManager.format('messages.item_added', {
    item: itemName
});</pre>
        
        <h4><?php echo esc_html__('Template', 'product-estimator'); ?></h4>
        <pre style="background: #f5f5f5; padding: 15px; border-radius: 3px;">&lt;button&gt;
    &lt;span data-label="buttons.save_estimate"&gt;Save Estimate&lt;/span&gt;
&lt;/button&gt;</pre>
    </div>
</div>