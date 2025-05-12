<?php
// File: class-product-additions-settings-module.php (Ensure this is the version you're using)
namespace RuDigital\ProductEstimator\Includes\Admin\Settings;

final class ProductAdditionsSettingsModule extends SettingsModuleWithTableBase implements SettingsModuleInterface
{
    protected $option_name = 'product_estimator_product_additions';

    protected function set_tab_details()
    {
        $this->tab_id = 'product_additions';
        $this->tab_title = __('Product Additions', 'product-estimator');
        $this->section_id = 'product_additions_settings_section';
        $this->section_title = __('Product Relationship Management', 'product-estimator');
    }

    protected function get_items_for_table()
    {
        $items = get_option($this->option_name, array());
        return is_array($items) ? $items : [];
    }

    protected function get_table_columns()
    {
        return [
            'source_categories' => __('Source Categories', 'product-estimator'),
            'action_type' => __('Action', 'product-estimator'),
            'target_details' => __('Target/Note', 'product-estimator'),
            'item_actions' => __('Actions', 'product-estimator'),
        ];
    }

    public function render_table_cell_content($item, $column_name)
    {
        // ... (Implementation as previously provided, ensure it aligns with data from prepare_item_for_response) ...
        $relation_type = $item['relation_type'] ?? '';
        $features = $this->get_features_object();

        if ($relation_type === "suggest_products_by_category" && $features && !$features->suggested_products_enabled) {
            if ($column_name === 'action_type') {
                echo '<span class="relation-type ' . esc_attr($relation_type) . '">' . esc_html__('Suggest Products (Feature Disabled)', 'product-estimator') . '</span>';
                return;
            } elseif ($column_name === 'target_details') {
                echo ' ';
                return;
            }
        }

        switch ($column_name) {
            case 'source_categories':
                $source_names = [];
                $source_category_ids = isset($item['source_category']) ? (array)$item['source_category'] : [];
                foreach ($source_category_ids as $cat_id) {
                    $term = get_term($cat_id, 'product_cat');
                    if (!is_wp_error($term) && $term) {
                        $source_names[] = $term->name;
                    }
                }
                echo esc_html(implode(', ', $source_names));
                break;
            case 'action_type':
                echo '<span class="relation-type ' . esc_attr($relation_type) . '">' . esc_html($this->get_relation_type_label($relation_type)) . '</span>';
                break;
            case 'target_details':
                echo esc_html($this->get_target_details_for_display($item));
                break;
            case 'item_actions':
                $item_id_for_actions = $item['id'] ?? '';
                ?>
                <button type="button" class="pe-edit-item-button button button-small"
                        data-id="<?php echo esc_attr($item_id_for_actions); ?>">
                    <?php esc_html_e('Edit', 'product-estimator'); ?>
                </button>
                <button type="button" class="pe-delete-item-button button button-small"
                        data-id="<?php echo esc_attr($item_id_for_actions); ?>">
                    <?php esc_html_e('Delete', 'product-estimator'); ?>
                </button>
                <?php
                break;
        }
    }

    protected function prepare_item_for_form_population(array $item_data) {
        // Ensure $item_data is always an array, even if it came in malformed (though the base class check should catch non-arrays now)
        if (!is_array($item_data)) {
            error_log('[ProductAdditions] prepare_item_for_form_population received non-array: ' . gettype($item_data));
            return []; // Return an empty array to prevent fatal errors further down
        }

        // Add product_name if product_id exists and it's for auto_add_by_category type
        if (!empty($item_data['product_id']) && isset($item_data['relation_type']) && $item_data['relation_type'] === 'auto_add_by_category') {
            $product = wc_get_product($item_data['product_id']);
            if ($product) {
                $item_data['product_name'] = $product->get_name();
            } else {
                $item_data['product_name'] = __('Product not found', 'product-estimator');
            }
        }
        // You might also want to ensure all expected keys are present, even if empty, for the JS form population.
        // Example:
        // $item_data['source_category'] = $item_data['source_category'] ?? [];
        // $item_data['target_category'] = $item_data['target_category'] ?? '';
        // $item_data['note_text'] = $item_data['note_text'] ?? '';

        return $item_data;
    }

    public function render_form_fields($item = null)
    {
        // ... (Implementation as previously provided) ...
        $template_vars = $this->prepare_template_data();
        $categories = $template_vars['categories'] ?? [];
        $features = $template_vars['features'] ?? null;
        ?>
        <input type="hidden" name="item_id" value="<?php echo esc_attr($item['id'] ?? ''); ?>">
        <table class="form-table">
            <tbody>
            <tr>
                <th scope="row"><label
                        for="relation_type"><?php esc_html_e('Action Type', 'product-estimator'); ?></label></th>
                <td>
                    <select id="relation_type" name="relation_type">
                        <option value=""><?php esc_html_e('-- Select Action Type --', 'product-estimator'); ?></option>
                        <option
                            value="auto_add_by_category"><?php esc_html_e('Auto-Add Product with Category', 'product-estimator'); ?></option>
                        <option
                            value="auto_add_note_by_category"><?php esc_html_e('Auto-Add Note with Category', 'product-estimator'); ?></option>
                        <?php if ($features && $features->suggested_products_enabled): ?>
                            <option
                                value="suggest_products_by_category"><?php esc_html_e('Suggest Products when Category', 'product-estimator'); ?></option>
                        <?php endif; ?>
                    </select>
                </td>
            </tr>
            <tr>
                <th scope="row"><label
                        for="source_category"><?php esc_html_e('Source Categories', 'product-estimator'); ?></label>
                </th>
                <td>
                    <select id="source_category" name="source_category[]" multiple="multiple" style="width:100%;">
                        <?php if (!empty($categories)) : foreach ($categories as $cat) : ?>
                            <option
                                value="<?php echo esc_attr($cat->term_id); ?>"><?php echo esc_html($cat->name); ?></option>
                        <?php endforeach; endif; ?>
                    </select>
                </td>
            </tr>
            <tr class="target-category-row" style="display: none;">
                <th scope="row"><label
                        for="target_category"><?php esc_html_e('Target Category', 'product-estimator'); ?></label></th>
                <td>
                    <select id="target_category" name="target_category" style="width:100%;">
                        <option
                            value=""><?php esc_html_e('-- Select Target Category --', 'product-estimator'); ?></option>
                        <?php if (!empty($categories)) : foreach ($categories as $cat) : ?>
                            <option
                                value="<?php echo esc_attr($cat->term_id); ?>"><?php echo esc_html($cat->name); ?></option>
                        <?php endforeach; endif; ?>
                    </select>
                </td>
            </tr>
            <tr class="product-search-row" style="display: none;">
                <th scope="row"><label for="product_search"><?php esc_html_e('Product', 'product-estimator'); ?></label>
                </th>
                <td>
                    <div class="product-search-wrapper">
                        <input type="text" id="product_search"
                               placeholder="<?php esc_attr_e('Search products...', 'product-estimator'); ?>"
                               autocomplete="off">
                        <div id="product-search-results"></div>
                    </div>
                    <input type="hidden" id="selected_product_id" name="product_id">
                    <div id="selected-product" style="display: none;">
                        <div class="selected-product-info"></div>
                        <button type="button"
                                class="clear-product button-link"><?php esc_html_e('Clear Selection', 'product-estimator'); ?></button>
                    </div>
                </td>
            </tr>
            <tr class="note-row" style="display: none;">
                <th scope="row"><label for="note_text"><?php esc_html_e('Note Text', 'product-estimator'); ?></label>
                </th>
                <td><textarea id="note_text" name="note_text" rows="4" cols="50"></textarea></td>
            </tr>
            </tbody>
        </table>
        <?php
    }

    protected function prepare_template_data()
    {
        $data = parent::prepare_template_data();
        $features = $this->get_features_object();
        $processed_items = [];
        if (!empty($data['table_items'])) {
            foreach ($data['table_items'] as $id => $item_data) {
                if (isset($item_data['relation_type']) && $item_data['relation_type'] === 'suggest_products_by_category' && $features && !$features->suggested_products_enabled) {
                    continue;
                }
                $item_data['id'] = $id; // Ensure ID is part of the item array
                $processed_items[$id] = $item_data;
            }
        }
        $data['table_items'] = $processed_items;
        $data['categories'] = get_terms(['taxonomy' => 'product_cat', 'hide_empty' => false]);
        $data['features'] = $features;
        return $data;
    }

    public function enqueue_scripts()
    {
        parent::enqueue_scripts(); // From SettingsModuleWithTableBase, which calls SettingsModuleBase
        wp_enqueue_script('select2', 'https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js', array('jquery'), '4.1.0-rc.0', true);

        $item_action_prefix = 'pe_table_' . $this->get_tab_id();
        $localized_settings = [
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce($this->get_nonce_action_base() . '_nonce'),
            'option_name' => $this->option_name,
            'tab_id' => $this->tab_id,
            'actions' => [
                'add_item' => $item_action_prefix . '_add_item',
                'update_item' => $item_action_prefix . '_update_item',
                'delete_item' => $item_action_prefix . '_delete_item',
                'get_item' => $item_action_prefix . '_get_item', // Used by AdminTableManager to fetch item data for edit form
                // ProductAdditions specific AJAX actions for its custom UI features
                'search_products' => 'search_category_products', // For product search input
                // 'get_product_details' is an old action, 'get_item' should handle fetching full item data for edit.
                // If 'get_product_details' is used by a different part of UI, keep it. Otherwise, it might be redundant.
                // For now, assume 'get_product_details_for_search' is more descriptive if it's for product search results.
                'get_product_details_for_search' => 'get_product_details',
            ],
            'i18n' => [
                'confirmDelete' => __('Are you sure you want to delete this relationship?', 'product-estimator'),
                'itemSavedSuccess' => __('Relationship saved successfully.', 'product-estimator'),
                'itemDeletedSuccess' => __('Relationship deleted successfully.', 'product-estimator'),
                'errorSavingItem' => __('Error saving relationship.', 'product-estimator'),
                'errorDeletingItem' => __('Error deleting relationship.', 'product-estimator'),
                'errorLoadingItem' => __('Error loading relationship details.', 'product-estimator'),
                'addItemButtonLabel' => $this->get_add_new_button_label(),
                'editItemFormTitle' => $this->get_form_title(true),
                'addItemFormTitle' => $this->get_form_title(false),
                'saveChangesButton' => __('Save Relationship', 'product-estimator'),
                'updateChangesButton' => __('Update Relationship', 'product-estimator'),
                'cancelButton' => __('Cancel', 'product-estimator'),
                'saving' => __('Saving...', 'product-estimator'),
                'deleting' => __('Deleting...', 'product-estimator'),
                'editButtonLabel' => __('Edit', 'product-estimator'),
                'deleteButtonLabel' => __('Delete', 'product-estimator'),
                'fieldRequired' => __('This field is required.', 'product-estimator'),
                'selectAction' => __('Please select an action type', 'product-estimator'),
                'selectSourceCategories' => __('Please select at least one source category', 'product-estimator'),
                'selectTargetCategory' => __('Please select a target category', 'product-estimator'),
                'selectProduct' => __('Please select a product', 'product-estimator'),
                'searching' => __('Searching...', 'product-estimator'),
                'noProductsFound' => __('No products found', 'product-estimator'),
                'errorSearching' => __('Error searching products', 'product-estimator'),
                'errorLoadingProduct' => __('Error loading product details.', 'product-estimator'),
                'noteTextRequired' => __('Note text is required.', 'product-estimator'),
            ],
            'selectors' => [
                'formContainer' => '.pe-admin-table-form-container',
                'form' => '.pe-item-management-form',
                'addButton' => '.pe-add-new-item-button',
                'listTableContainer' => '.pe-admin-list-table-wrapper',
                'listTable' => '.pe-admin-list-table',
                'listTableBody' => '#' . $this->tab_id . '-table-body',
                'listItemRow' => 'tr[data-id]',
                'editButton' => '.pe-edit-item-button',
                'deleteButton' => '.pe-delete-item-button',
                'cancelButton' => '.pe-cancel-form-button',
                'noItemsMessage' => '.pe-no-items-message',
                'formTitle' => '.pe-form-title', // Changed from '.form-title' to match generic partial
                'saveButton' => '.pe-save-item-button',
                'idInput' => 'input[name="item_id"]', // Matches the hidden input in render_form_fields

                'relationTypeSelect' => '#relation_type',
                'sourceCategorySelect' => '#source_category',
                'targetCategorySelect' => '#target_category',
                'productSearchInput' => '#product_search',
                'productSearchResults' => '#product-search-results',
                'selectedProductIdInput' => '#selected_product_id',
                'selectedProductDisplay' => '#selected-product',
                'clearProductButton' => '.clear-product',
                'noteTextInput' => '#note_text',
                'targetCategoryRow' => '.target-category-row',
                'productSearchRow' => '.product-search-row',
                'noteRow' => '.note-row',
            ],
            'feature_flags' => [
                'suggested_products_enabled' => $this->get_features_object()->suggested_products_enabled ?? false,
            ]
        ];
        $this->add_script_data('productAdditionsSettings', $localized_settings); // Name matches JS
    }

    public function enqueue_styles()
    { /* ... as before ... */
    }

    protected function get_nonce_action_base()
    {
        return 'product_estimator_product_additions';
    }

    protected function register_hooks()
    {
        parent::register_hooks(); // Registers generic item AJAX handlers
        // Custom AJAX for product search (not covered by generic item handlers)
        add_action('wp_ajax_search_category_products', array($this, 'ajax_search_category_products'));
        // The generic 'get_item' (pe_table_product_additions_get_item) should handle fetching product details
        // for the edit form if 'item_id' is treated as product_id in that context.
        // If ajax_get_product_details is for a different UI purpose (e.g., updating search result display), keep it.
        add_action('wp_ajax_get_product_details', array($this, 'ajax_get_product_details'));
    }

    /**
     * Render the settings section description.
     * This content appears after the section title and before the module's main content.
     */
    public function render_section_description()
    {
        // You can add any HTML content you want here.
        // For example, a paragraph explaining what this section is for.
        echo 'Manage rules for automatically adding or suggesting products and notes based on product categories in the cart. Use the table below to create, view, edit, or delete these relationships.';

        // If you need more complex content, you can include a partial file or build more HTML.
    }

    // OLD ajax_save_category_relation and ajax_delete_category_relation should be REMOVED.
    // Their logic is now in validate_item_data, prepare_item_for_response, etc.

    protected function validate_item_data(array $raw_item_data, $item_id = null, $original_item_data = null)
    {
        // ... (Implementation as previously provided - very important) ...
        $sanitized_data = [];
        $errors = new \WP_Error();

        $source_categories = [];
        if (isset($raw_item_data['source_category']) && is_array($raw_item_data['source_category'])) {
            foreach ($raw_item_data['source_category'] as $cat_id) {
                $source_categories[] = absint($cat_id);
            }
        } elseif (isset($raw_item_data['source_category'])) {
            $source_categories[] = absint($raw_item_data['source_category']);
        }

        if (empty($source_categories)) {
            $errors->add('missing_source_category', __('Please select at least one source category.', 'product-estimator'));
        } else {
            $sanitized_data['source_category'] = array_values(array_unique(array_filter($source_categories)));
        }

        $sanitized_data['relation_type'] = isset($raw_item_data['relation_type']) ? sanitize_text_field($raw_item_data['relation_type']) : '';
        if (empty($sanitized_data['relation_type'])) {
            $errors->add('missing_relation_type', __('Relation type is required.', 'product-estimator'));
        }

        $sanitized_data['target_category'] = isset($raw_item_data['target_category']) ? absint($raw_item_data['target_category']) : 0;
        $sanitized_data['product_id'] = isset($raw_item_data['product_id']) ? absint($raw_item_data['product_id']) : 0;
        $sanitized_data['note_text'] = isset($raw_item_data['note_text']) ? sanitize_textarea_field($raw_item_data['note_text']) : '';

        $features = $this->get_features_object();

        if ($sanitized_data['relation_type'] === 'auto_add_by_category') {
            if (empty($sanitized_data['target_category'])) {
                $errors->add('missing_target_category', __('Please select a target category.', 'product-estimator'));
            }
            if (empty($sanitized_data['product_id'])) {
                $errors->add('missing_product', __('Please select a product.', 'product-estimator'));
            }
        } elseif ($sanitized_data['relation_type'] === 'suggest_products_by_category') {
            if ($features && $features->suggested_products_enabled) {
                if (empty($sanitized_data['target_category'])) {
                    $errors->add('missing_target_category_for_suggest', __('Please select a target category for suggestions.', 'product-estimator'));
                }
            } else { // If feature is off, this relation type should ideally not be submitted
                $errors->add('feature_disabled_suggest', __('Suggest products feature is currently disabled.', 'product-estimator'));
            }
        } elseif ($sanitized_data['relation_type'] === 'auto_add_note_by_category') {
            if (empty($sanitized_data['note_text'])) {
                $errors->add('missing_note_text', __('Please enter a note text.', 'product-estimator'));
            }
        }

        if (!empty($errors->get_error_codes())) {
            return $errors;
        }
        return $sanitized_data;
    }

    protected function prepare_item_for_response(array $saved_item)
    {
        // ... (Implementation as previously provided - very important) ...
        $response_item = $saved_item;
        if (!empty($saved_item['source_category'])) {
            $source_cat_names = array_map(function ($cat_id) {
                $term = get_term($cat_id, 'product_cat');
                return $term && !is_wp_error($term) ? $term->name : null;
            }, (array)$saved_item['source_category']);
            $response_item['source_name'] = implode(', ', array_filter($source_cat_names));
        } else {
            $response_item['source_name'] = '';
        }
        $response_item['relation_type_label'] = $this->get_relation_type_label($saved_item['relation_type'] ?? '');
        $response_item['target_details_display'] = $this->get_target_details_for_display($saved_item);
        // If product_id is set and product_name is needed for edit form population via get_item
        if (!empty($saved_item['product_id']) && $saved_item['relation_type'] === 'auto_add_by_category' && !isset($response_item['product_name'])) {
            $product = wc_get_product($saved_item['product_id']);
            if ($product) {
                $response_item['product_name'] = $product->get_name();
            }
        }
        return $response_item;
    }

    // Helper method from previous step
    private function get_features_object()
    {
        static $features_obj = null;
        if ($features_obj === null && function_exists('product_estimator_features')) {
            $features_obj = product_estimator_features();
        }
        return $features_obj;
    }

    private function get_relation_type_label($relation_type_key) {
        $labels = [
            'auto_add_by_category' => __('Auto-Add Product with Category', 'product-estimator'),
            'auto_add_note_by_category' => __('Auto-Add Note with Category', 'product-estimator'),
            'suggest_products_by_category' => __('Suggest Products when Category', 'product-estimator'),
        ];
        return $labels[$relation_type_key] ?? $relation_type_key;
    }

    private function get_target_details_for_display(array $item) {
        $relation_type = $item['relation_type'] ?? '';
        if ($relation_type === 'auto_add_by_category' && isset($item['product_id'])) {
            $product = wc_get_product($item['product_id']);
            return $product ? esc_html($product->get_name()) : '';
        } elseif ($relation_type === 'auto_add_note_by_category' && isset($item['note_text'])) {
            return esc_html(wp_trim_words($item['note_text'], 10, '...'));
        } elseif ($relation_type === 'suggest_products_by_category' && isset($item['target_category'])) {
            $target_cat = get_term($item['target_category'], 'product_cat');
            return ($target_cat && !is_wp_error($target_cat)) ? esc_html($target_cat->name . ' (Category)') : '';
        }
        return '';
    }


    protected function get_item_management_capability()
    {
        return 'manage_options';
    }

}
