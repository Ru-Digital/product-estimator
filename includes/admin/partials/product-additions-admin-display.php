<?php
/**
 * Provide a admin area view for the plugin
 *
 * This file is used to markup the admin-facing aspects of the plugin.
 *
 * @link       https://rudigital.com.au
 * @since      1.0.3
 *
 * @package    Product_Estimator
 * @subpackage Product_Estimator/admin/partials
 */

// If this file is called directly, abort.
if (!defined('ABSPATH')) {
    exit;
}
?>

<div class="wrap product-estimator-additions">
    <h1><?php echo esc_html(get_admin_page_title()); ?></h1>

    <div class="notice notice-info">
        <p><?php _e('Create relationships between product categories to automatically add related products to estimates.', 'product-estimator'); ?></p>
        <ul class="ul-disc">
            <li><?php _e('<strong>Auto add product with Category:</strong> A specific product from the selected category will be automatically added when a product from the source category is added to an estimate.', 'product-estimator'); ?></li>
            <li><?php _e('<strong>Auto add note with Category:</strong> A custom note will be automatically added when a product from the source category is added to an estimate.', 'product-estimator'); ?></li>
        </ul>
    </div>

    <div class="product-additions-container">
        <div class="product-additions-controls">
            <button type="button" class="button button-primary add-new-relation">
                <span class="dashicons dashicons-plus"></span> <?php _e('Add New Relationship', 'product-estimator'); ?>
            </button>
        </div>

        <div class="product-additions-form" style="display: none;">
            <h3 class="form-title"><?php _e('Add New Product Addition', 'product-estimator'); ?></h3>
            <form id="product-addition-form">
                <input type="hidden" name="relation_id" id="relation_id" value="">
                <input type="hidden" name="selected_product_id" id="selected_product_id" value="">

                <table class="form-table">
                    <tr>
                        <th scope="row">
                            <label for="relation_type"><?php _e('Action', 'product-estimator'); ?></label>
                        </th>
                        <td>
                            <select name="relation_type" id="relation_type" class="regular-text" required>
                                <option value=""><?php _e('Please Select', 'product-estimator'); ?></option>
                                <option value="auto_add_by_category"><?php _e('Auto add product with Category', 'product-estimator'); ?></option>
                                <option value="auto_add_note_by_category"><?php _e('Auto add note with Category', 'product-estimator'); ?></option>
                                <option value="suggest_products_by_category"><?php _e('Suggest products when Category', 'product-estimator'); ?></option>
                            </select>
                            <p class="description"><?php _e('Select how the related products or notes are added to the estimate.', 'product-estimator'); ?></p>
                        </td>
                    </tr>

                    <tr>
                        <th scope="row">
                            <label for="source_category"><?php _e('Source Categories', 'product-estimator'); ?></label>
                        </th>
                        <td>
                            <select name="source_category[]" id="source_category" class="regular-text" multiple="multiple" required>
                                <?php foreach ($categories as $category) : ?>
                                    <option value="<?php echo esc_attr($category->term_id); ?>">
                                        <?php echo esc_html($category->name); ?>
                                    </option>
                                <?php endforeach; ?>
                            </select>
                            <p class="description"><?php _e('When a product from any of these categories is added to an estimate...', 'product-estimator'); ?></p>
                        </td>
                    </tr>

                    <!-- Target Category Row (initially hidden, will be shown for auto_add_by_category) -->
                    <tr class="target-category-row" style="display: none;">
                        <th scope="row">
                            <label for="target_category"><?php _e('Product Addition Category', 'product-estimator'); ?></label>
                        </th>
                        <td>
                            <select name="target_category" id="target_category" class="regular-text">
                                <option value=""><?php _e('Select a category', 'product-estimator'); ?></option>
                                <?php foreach ($categories as $category) : ?>
                                    <option value="<?php echo esc_attr($category->term_id); ?>">
                                        <?php echo esc_html($category->name); ?>
                                    </option>
                                <?php endforeach; ?>
                            </select>
                            <p class="description"><?php _e('Select the category to find products from.', 'product-estimator'); ?></p>
                        </td>
                    </tr>

                    <!-- Product Search Row (initially hidden) -->
                    <tr class="product-search-row" style="display: none;">
                        <th scope="row">
                            <label for="product_search"><?php _e('Product', 'product-estimator'); ?></label>
                        </th>
                        <td>
                            <div class="product-search-wrapper">
                                <input type="text" id="product_search" class="regular-text" placeholder="<?php _e('Search for products...', 'product-estimator'); ?>">
                                <div id="product-search-results"></div>
                            </div>
                            <div id="selected-product" style="display: none;">
                                <div class="selected-product-info"></div>
                                <button type="button" class="button clear-product"><?php _e('Clear', 'product-estimator'); ?></button>
                            </div>
                            <p class="description"><?php _e('Select a product to be automatically added.', 'product-estimator'); ?></p>
                        </td>
                    </tr>

                    <!-- Note Row (initially hidden, will be shown for auto_add_note_by_category) -->
                    <tr class="note-row" style="display: none;">
                        <th scope="row">
                            <label for="note_text"><?php _e('Note Text', 'product-estimator'); ?></label>
                        </th>
                        <td>
                            <textarea name="note_text" id="note_text" class="regular-text" rows="5" style="width: 100%;" placeholder="<?php _e('Enter the note text to be automatically added...', 'product-estimator'); ?>"></textarea>
                            <p class="description"><?php _e('Enter the note text that will be automatically added to the estimate when products from the source categories are added.', 'product-estimator'); ?></p>
                        </td>
                    </tr>
                </table>

                <div class="form-actions">
                    <button type="submit" class="button button-primary save-relation">
                        <?php _e('Save Relationship', 'product-estimator'); ?>
                    </button>
                    <button type="button" class="button cancel-form">
                        <?php _e('Cancel', 'product-estimator'); ?>
                    </button>
                </div>
            </form>
        </div>

        <div class="product-additions-list">
            <h3><?php _e('Existing Product Additions', 'product-estimator'); ?></h3>
            <?php if (empty($relations)) : ?>
                <div class="no-items">
                    <?php _e('No relationships have been created yet.', 'product-estimator'); ?>
                </div>
            <?php else : ?>
                <table class="wp-list-table widefat fixed striped product-additions-table">
                    <thead>
                    <tr>
                        <th scope="col"><?php _e('Source Categories', 'product-estimator'); ?></th>
                        <th scope="col"><?php _e('Action', 'product-estimator'); ?></th>
                        <th scope="col"><?php _e('Target/Note', 'product-estimator'); ?></th>
                        <th scope="col"><?php _e('Actions', 'product-estimator'); ?></th>
                    </tr>
                    </thead>
                    <tbody>
                    <?php foreach ($relations as $relation_id => $relation) :
                        echo "<pre>";
                    print_r($relation);
                    echo "</pre>";
                        // For backward compatibility, ensure source_category is always an array
                        $source_categories = isset($relation['source_category']) ? (array)$relation['source_category'] : array();

                        // Get source category names
                        $source_names = array();
                        foreach ($source_categories as $cat_id) {
                            $term = get_term($cat_id, 'product_cat');
                            if (!is_wp_error($term) && $term) {
                                $source_names[] = $term->name;
                            }
                        }

                        // Get target product info or note text (if applicable)
                        $target_info = '';
                        if (isset($relation['relation_type']) && $relation['relation_type'] === 'auto_add_note_by_category') {
                            // For note type, show a preview of the note
                            if (isset($relation['note_text'])) {
                                $target_info = strlen($relation['note_text']) > 50 ?
                                    substr($relation['note_text'], 0, 50) . '...' :
                                    $relation['note_text'];
                            }
                        } else {
                            // For product type
                            if (isset($relation['product_id']) && $relation['product_id'] > 0) {
                                $product = wc_get_product($relation['product_id']);
                                if ($product) {
                                    $target_info = $product->get_name();
                                }
                            } else if (isset($relation['target_category'])) {
                                // For backward compatibility - show category instead
                                $target_cat = get_term($relation['target_category'], 'product_cat');
                                if (!is_wp_error($target_cat) && $target_cat) {
                                    $target_info = $target_cat->name . ' ' . __('(Category)', 'product-estimator');
                                }
                            }
                        }

                        if (empty($source_names)) {
                            continue;
                        }

                        // Determine relation type label
                        $relation_type_label = '';
                        if (isset($relation['relation_type'])) {
                            if ($relation['relation_type'] === 'auto_add_by_category') {
                                $relation_type_label = __('Auto add product with Category', 'product-estimator');
                            } elseif ($relation['relation_type'] === 'auto_add_note_by_category') {
                                $relation_type_label = __('Auto add note with Category', 'product-estimator');
                            } elseif ($relation['relation_type'] === 'suggest_products_by_category') {
                                $relation_type_label = __('Suggest products when Category', 'product-estimator');
                            } else {
                                $relation_type_label = $relation['relation_type'];
                            }
                        }
                        ?>
                        <tr data-id="<?php echo esc_attr($relation_id); ?>">
                            <td>
                                <?php echo esc_html(implode(', ', $source_names)); ?>
                            </td>
                            <td>
                                <span class="relation-type <?php echo esc_attr($relation['relation_type']); ?>">
                                    <?php echo esc_html($relation_type_label); ?>
                                </span>
                            </td>
                            <td>
                                <?php echo esc_html($target_info); ?>
                            </td>
                            <td class="actions">
                                <button type="button" class="button button-small edit-relation"
                                        data-id="<?php echo esc_attr($relation_id); ?>"
                                        data-source="<?php echo esc_attr(implode(',', $source_categories)); ?>"
                                        data-target="<?php echo esc_attr($relation['target_category'] ?? ''); ?>"
                                        data-product-id="<?php echo esc_attr($relation['product_id'] ?? ''); ?>"
                                        data-type="<?php echo esc_attr($relation['relation_type']); ?>"
                                        data-note-text="<?php echo esc_attr($relation['note_text'] ?? ''); ?>">
                                    <?php _e('Edit', 'product-estimator'); ?>
                                </button>
                                <button type="button" class="button button-small delete-relation"
                                        data-id="<?php echo esc_attr($relation_id); ?>">
                                    <?php _e('Delete', 'product-estimator'); ?>
                                </button>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                    </tbody>
                </table>
            <?php endif; ?>
        </div>
    </div>
</div>
