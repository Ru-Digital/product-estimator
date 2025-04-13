<?php
/**
 * Product Additions Admin UI
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

<div class="product-estimator-additions">
    <h3><?php esc_html_e('Product Relationship Management', 'product-estimator'); ?></h3>

    <p><?php esc_html_e('Configure product relationships for automatic additions and suggestions when products from specific categories are added to an estimate.', 'product-estimator'); ?></p>

    <!-- Add New Button -->
    <p><button type="button" class="add-new-relation button button-primary"><?php esc_html_e('Add New Relationship', 'product-estimator'); ?></button></p>

    <!-- Relationship Form -->
    <div class="product-additions-form" style="display: none;">
        <h3 class="form-title"><?php esc_html_e('Add New Relationship', 'product-estimator'); ?></h3>

        <form id="product-addition-form" method="post">
            <input type="hidden" id="relation_id" name="relation_id" value="">

            <table class="form-table">
                <tbody>
                <tr>
                    <th scope="row">
                        <label for="relation_type"><?php esc_html_e('Action Type', 'product-estimator'); ?></label>
                    </th>
                    <td>
                        <select id="relation_type" name="relation_type">
                            <option value=""><?php esc_html_e('-- Select Action Type --', 'product-estimator'); ?></option>
                            <option value="auto_add_by_category"><?php esc_html_e('Auto-Add Product with Category', 'product-estimator'); ?></option>
                            <option value="auto_add_note_by_category"><?php esc_html_e('Auto-Add Note with Category', 'product-estimator'); ?></option>
                            <option value="suggest_products_by_category"><?php esc_html_e('Suggest Products when Category', 'product-estimator'); ?></option>
                        </select>
                        <p class="description"><?php esc_html_e('Select what action should occur when products from the source category are added to an estimate.', 'product-estimator'); ?></p>
                    </td>
                </tr>

                <tr>
                    <th scope="row">
                        <label for="source_category"><?php esc_html_e('Source Categories', 'product-estimator'); ?></label>
                    </th>
                    <td>
                        <select id="source_category" name="source_category[]" multiple="multiple">
                            <?php foreach ($categories as $category) : ?>
                                <option value="<?php echo esc_attr($category->term_id); ?>"><?php echo esc_html($category->name); ?></option>
                            <?php endforeach; ?>
                        </select>
                        <p class="description"><?php esc_html_e('When products from these categories are added to an estimate, the selected action will occur.', 'product-estimator'); ?></p>
                    </td>
                </tr>

                <tr class="target-category-row" style="display: none;">
                    <th scope="row">
                        <label for="target_category"><?php esc_html_e('Target Category', 'product-estimator'); ?></label>
                    </th>
                    <td>
                        <select id="target_category" name="target_category">
                            <option value=""><?php esc_html_e('-- Select Target Category --', 'product-estimator'); ?></option>
                            <?php foreach ($categories as $category) : ?>
                                <option value="<?php echo esc_attr($category->term_id); ?>"><?php echo esc_html($category->name); ?></option>
                            <?php endforeach; ?>
                        </select>
                        <p class="description"><?php esc_html_e('The target category for product selection or suggestions.', 'product-estimator'); ?></p>
                    </td>
                </tr>

                <tr class="product-search-row" style="display: none;">
                    <th scope="row">
                        <label for="product_search"><?php esc_html_e('Product', 'product-estimator'); ?></label>
                    </th>
                    <td>
                        <div class="product-search-wrapper">
                            <input type="text" id="product_search" name="product_search" placeholder="<?php esc_attr_e('Search products...', 'product-estimator'); ?>" autocomplete="off">
                            <div id="product-search-results"></div>
                        </div>

                        <input type="hidden" id="selected_product_id" name="selected_product_id" value="">

                        <div id="selected-product" style="display: none;">
                            <div class="selected-product-info"></div>
                            <button type="button" class="clear-product button-link"><?php esc_html_e('Clear Selection', 'product-estimator'); ?></button>
                        </div>

                        <p class="description"><?php esc_html_e('Search and select a product to automatically add.', 'product-estimator'); ?></p>
                    </td>
                </tr>

                <tr class="note-row" style="display: none;">
                    <th scope="row">
                        <label for="note_text"><?php esc_html_e('Note Text', 'product-estimator'); ?></label>
                    </th>
                    <td>
                        <textarea id="note_text" name="note_text" rows="4" cols="50"></textarea>
                        <p class="description"><?php esc_html_e('This note will be automatically added when products from the source categories are added.', 'product-estimator'); ?></p>
                    </td>
                </tr>
                </tbody>
            </table>

            <div class="form-actions">
                <button type="submit" class="save-relation button button-primary"><?php esc_html_e('Save Relationship', 'product-estimator'); ?></button>
                <button type="button" class="cancel-form button"><?php esc_html_e('Cancel', 'product-estimator'); ?></button>
            </div>
        </form>
    </div>

    <!-- Relationships List -->
    <div class="product-additions-list">
        <h3><?php esc_html_e('Existing Relationships', 'product-estimator'); ?></h3>

        <?php if (empty($relations)) : ?>
            <div class="no-items"><?php esc_html_e('No relationships have been created yet.', 'product-estimator'); ?></div>
        <?php else : ?>
            <table class="wp-list-table widefat fixed striped product-additions-table">
                <thead>
                <tr>
                    <th scope="col"><?php esc_html_e('Source Categories', 'product-estimator'); ?></th>
                    <th scope="col"><?php esc_html_e('Action', 'product-estimator'); ?></th>
                    <th scope="col"><?php esc_html_e('Target/Note', 'product-estimator'); ?></th>
                    <th scope="col"><?php esc_html_e('Actions', 'product-estimator'); ?></th>
                </tr>
                </thead>
                <tbody>
                <?php foreach ($relations as $relation_id => $relation) : ?>
                    <tr data-id="<?php echo esc_attr($relation_id); ?>">
                        <td>
                            <?php
                            $source_names = array();
                            $source_categories = isset($relation['source_category']) ? (array)$relation['source_category'] : array();

                            foreach ($source_categories as $cat_id) {
                                $term = get_term($cat_id, 'product_cat');
                                if (!is_wp_error($term) && $term) {
                                    $source_names[] = $term->name;
                                }
                            }

                            echo esc_html(implode(', ', $source_names));
                            ?>
                        </td>
                        <td>
                            <?php
                            $relation_type = isset($relation['relation_type']) ? $relation['relation_type'] : '';
                            $relation_type_label = '';

                            if ($relation_type === 'auto_add_by_category') {
                                $relation_type_label = __('Auto add product with Category', 'product-estimator');
                            } elseif ($relation_type === 'auto_add_note_by_category') {
                                $relation_type_label = __('Auto add note with Category', 'product-estimator');
                            } elseif ($relation_type === 'suggest_products_by_category') {
                                $relation_type_label = __('Suggest products when Category', 'product-estimator');
                            }
                            ?>
                            <span class="relation-type <?php echo esc_attr($relation_type); ?>">
                                    <?php echo esc_html($relation_type_label); ?>
                                </span>
                        </td>
                        <td>
                            <?php
                            if ($relation_type === 'auto_add_by_category' && isset($relation['product_id'])) {
                                $product = wc_get_product($relation['product_id']);
                                if ($product) {
                                    echo esc_html($product->get_name());
                                } elseif (isset($relation['target_category'])) {
                                    $target_cat = get_term($relation['target_category'], 'product_cat');
                                    if (!is_wp_error($target_cat) && $target_cat) {
                                        echo esc_html($target_cat->name . ' (Category)');
                                    }
                                }
                            } elseif ($relation_type === 'auto_add_note_by_category' && isset($relation['note_text'])) {
                                // Show a preview of the note text
                                $note_preview = strlen($relation['note_text']) > 50 ?
                                    substr($relation['note_text'], 0, 50) . '...' :
                                    $relation['note_text'];
                                echo esc_html($note_preview);
                            } elseif ($relation_type === 'suggest_products_by_category' && isset($relation['target_category'])) {
                                $target_cat = get_term($relation['target_category'], 'product_cat');
                                if (!is_wp_error($target_cat) && $target_cat) {
                                    echo esc_html($target_cat->name . ' (Category)');
                                }
                            }
                            ?>
                        </td>
                        <td class="actions">
                            <button type="button"
                                    class="button button-small edit-relation"
                                    data-id="<?php echo esc_attr($relation_id); ?>"
                                    data-source="<?php echo esc_attr(implode(',', $source_categories)); ?>"
                                    data-target="<?php echo esc_attr(isset($relation['target_category']) ? $relation['target_category'] : ''); ?>"
                                    data-product-id="<?php echo esc_attr(isset($relation['product_id']) ? $relation['product_id'] : ''); ?>"
                                    data-type="<?php echo esc_attr($relation_type); ?>"
                                    data-note-text="<?php echo esc_attr(isset($relation['note_text']) ? $relation['note_text'] : ''); ?>">
                                <?php esc_html_e('Edit', 'product-estimator'); ?>
                            </button>

                            <button type="button"
                                    class="button button-small delete-relation"
                                    data-id="<?php echo esc_attr($relation_id); ?>">
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
