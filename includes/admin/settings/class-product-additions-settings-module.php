<?php
// File: class-product-additions-settings-module.php (Revised)
namespace RuDigital\ProductEstimator\Includes\Admin\Settings;

/**
 * Product Additions Settings Module Class
 *
 * Implements the product additions settings tab functionality using the generic table module structure.
 *
 * @since      1.1.0 (Original)
 * @since      1.6.0 (Updated to use generic table partial)
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes/admin/settings
 */
class ProductAdditionsSettingsModule extends SettingsModuleWithTableBase implements SettingsModuleInterface
{

    protected $option_name = 'product_estimator_product_additions';

    protected function set_tab_details()
    {
        $this->tab_id = 'product_additions';
        $this->tab_title = __('Product Additions', 'product-estimator');
        // section_id and section_title are less relevant when not using WP Settings API for fields
        $this->section_id = 'product_additions_settings_section';
        $this->section_title = __('Product Relationship Management', 'product-estimator');
    }

    protected function get_items_for_table()
    {
        $relations = get_option($this->option_name, array());
        return is_array($relations) ? $relations : [];
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

    /**
     * Get the label for the "Add New Item" button for Product Additions.
     */
    protected function get_add_new_button_label()
    {
        return __('Add New Relationship', 'product-estimator');
    }

    /**
     * Get the title for the add/edit form for Product Additions.
     */
    protected function get_form_title($is_edit_mode = false)
    {
        return $is_edit_mode ? __('Edit Relationship', 'product-estimator') : __('Add New Relationship', 'product-estimator');
    }

    /**
     * Render the content for a specific table cell for Product Additions.
     *
     * @param array $item The relation data for the current row.
     * @param string $column_name The key of the current column.
     */
    public function render_table_cell_content($item, $column_name)
    {
        $relation_type = $item['relation_type'] ?? '';
        $features = $this->get_features_object(); // Use helper to get features

        // If the feature for 'suggest_products_by_category' is disabled,
        // we adjust rendering for that type.
        if ($relation_type === "suggest_products_by_category" && $features && !$features->suggested_products_enabled) {
            if ($column_name === 'action_type') {
                echo '<span class="relation-type ' . esc_attr($relation_type) . '">' . esc_html__('Suggest Products (Feature Disabled)', 'product-estimator') . '</span>';
                return;
            } elseif ($column_name === 'target_details') {
                // Optionally show the target category but indicate feature is off, or show nothing.
                // For now, let's show nothing for target_details if feature is off.
                echo ' ';
                return;
            }
            // For 'source_categories' and 'item_actions', we might still want to render them.
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
                $relation_type_label = $this->get_relation_type_label($relation_type);
                echo '<span class="relation-type ' . esc_attr($relation_type) . '">' . esc_html($relation_type_label) . '</span>';
                break;

            case 'target_details':
                if ($relation_type === 'auto_add_by_category' && isset($item['product_id'])) {
                    $product = wc_get_product($item['product_id']);
                    if ($product) {
                        echo esc_html($product->get_name());
                    } elseif (isset($item['target_category'])) {
                        $target_cat = get_term($item['target_category'], 'product_cat');
                        echo !is_wp_error($target_cat) && $target_cat ? esc_html($target_cat->name . ' (Category)') : '';
                    }
                } elseif ($relation_type === 'auto_add_note_by_category' && isset($item['note_text'])) {
                    echo esc_html(wp_trim_words($item['note_text'], 10, '...'));
                } elseif ($relation_type === 'suggest_products_by_category' && isset($item['target_category'])) {
                    // This will only be reached if the feature is enabled due to the check at the start of the function for this relation_type
                    $target_cat = get_term($item['target_category'], 'product_cat');
                    echo !is_wp_error($target_cat) && $target_cat ? esc_html($target_cat->name . ' (Category)') : '';
                }
                break;

            case 'item_actions':
                $relation_id_for_actions = $item['id'] ?? '';

                ?>
                <button type="button" class="pe-edit-item-button button button-small"
                        data-id="<?php echo esc_attr($relation_id_for_actions); ?>"
                        data-source="<?php echo esc_attr(implode(',', (array)($item['source_category'] ?? []))); ?>"
                        data-target="<?php echo esc_attr($item['target_category'] ?? ''); ?>"
                        data-product-id="<?php echo esc_attr($item['product_id'] ?? ''); ?>"
                        data-type="<?php echo esc_attr($item['relation_type'] ?? ''); ?>"
                        data-note-text="<?php echo esc_attr($item['note_text'] ?? ''); ?>">
                    <?php esc_html_e('Edit', 'product-estimator'); ?>
                </button>
                <button type="button" class="pe-delete-item-button button button-small"
                        data-id="<?php echo esc_attr($relation_id_for_actions); ?>">
                    <?php esc_html_e('Delete', 'product-estimator'); ?>
                </button>
                <?php
                break;

            default:
                do_action("product_estimator_render_product_additions_table_cell_{$column_name}", $item, $this);
                break;
        }
    }


    /**
     * Render the fields for the add/edit form for Product Additions.
     *
     * @param array|null $item The relation item being edited, or null if adding.
     */
    public function render_form_fields($item = null)
    {
        // $categories and $features are made available to this scope
        // by the generic partial which extracts them from $this->prepare_template_data().
        $template_vars = $this->prepare_template_data(); // Call it to ensure data is loaded for this context
        $categories = $template_vars['categories'] ?? [];
        $features = $template_vars['features'] ?? null; // This is the features object

        ?>
        <table class="form-table">
            <tbody>
            <tr>
                <th scope="row">
                    <label for="relation_type"><?php esc_html_e('Action Type', 'product-estimator'); ?></label>
                </th>
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
                    <p class="description"><?php esc_html_e('Select what action should occur.', 'product-estimator'); ?></p>
                </td>
            </tr>
            <tr>
                <th scope="row">
                    <label for="source_category"><?php esc_html_e('Source Categories', 'product-estimator'); ?></label>
                </th>
                <td>
                    <select id="source_category" name="source_category[]" multiple="multiple" style="width:100%;">
                        <?php if (!empty($categories) && is_array($categories)) : ?>
                            <?php foreach ($categories as $category_item) : // Renamed to avoid conflict with $category from outer scope if any ?>
                                <option
                                    value="<?php echo esc_attr($category_item->term_id); ?>"><?php echo esc_html($category_item->name); ?></option>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </select>
                    <p class="description"><?php esc_html_e('When products from these categories are added.', 'product-estimator'); ?></p>
                </td>
            </tr>
            <tr class="target-category-row" style="display: none;">
                <th scope="row">
                    <label for="target_category"><?php esc_html_e('Target Category', 'product-estimator'); ?></label>
                </th>
                <td>
                    <select id="target_category" name="target_category" style="width:100%;">
                        <option
                            value=""><?php esc_html_e('-- Select Target Category --', 'product-estimator'); ?></option>
                        <?php if (!empty($categories) && is_array($categories)) : ?>
                            <?php foreach ($categories as $category_item) : // Renamed ?>
                                <option
                                    value="<?php echo esc_attr($category_item->term_id); ?>"><?php echo esc_html($category_item->name); ?></option>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </select>
                    <p class="description"><?php esc_html_e('The target category for product selection/suggestions.', 'product-estimator'); ?></p>
                </td>
            </tr>
            <tr class="product-search-row" style="display: none;">
                <th scope="row">
                    <label for="product_search"><?php esc_html_e('Product', 'product-estimator'); ?></label>
                </th>
                <td>
                    <div class="product-search-wrapper">
                        <input type="text" id="product_search" name="product_search_input_ignore"
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
                    <p class="description"><?php esc_html_e('Search and select a product to automatically add.', 'product-estimator'); ?></p>
                </td>
            </tr>
            <tr class="note-row" style="display: none;">
                <th scope="row">
                    <label for="note_text"><?php esc_html_e('Note Text', 'product-estimator'); ?></label>
                </th>
                <td>
                    <textarea id="note_text" name="note_text" rows="4" cols="50"></textarea>
                    <p class="description"><?php esc_html_e('This note will be automatically added.', 'product-estimator'); ?></p>
                </td>
            </tr>
            </tbody>
        </table>
        <?php
    }

    /**
     * Prepare template data by ensuring each item has its ID and filtering based on features.
     */
    protected function prepare_template_data()
    {
        $data = parent::prepare_template_data(); // Gets initial 'table_items' and 'table_columns'
        $features = $this->get_features_object();

        $processed_items = [];
        if (!empty($data['table_items'])) {
            foreach ($data['table_items'] as $id => $item_data) {
                // Filter out items whose features are disabled
                if (isset($item_data['relation_type']) && $item_data['relation_type'] === 'suggest_products_by_category' && $features && !$features->suggested_products_enabled) {
                    continue; // Skip this item
                }

                if (is_array($item_data)) {
                    $item_data['id'] = $id;
                } elseif (is_object($item_data)) {
                    $item_data->id = $id;
                }
                $processed_items[$id] = $item_data;
            }
        }
        $data['table_items'] = $processed_items;

        $data['categories'] = get_terms(array(
            'taxonomy' => 'product_cat',
            'hide_empty' => false,
        ));
        $data['features'] = $features;

        $data['relations'] = $data['table_items'];

        return $data;
    }


    public function enqueue_scripts()
    {
        parent::enqueue_scripts();

        wp_enqueue_script('select2', 'https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js', array('jquery'), '4.1.0-rc.0', true);

        $script_data = [
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce($this->get_nonce_action_base() . '_nonce'),
            'option_name' => $this->option_name,
            'tab_id' => $this->tab_id,
            'actions' => [
                'save_item' => 'save_category_relation',
                'delete_item' => 'delete_category_relation',
                'get_item' => 'get_product_details',
                'search_products' => 'search_category_products',
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
                'formTitle' => '.form-title',
                'saveButton' => '.pe-save-item-button',
                'idInput' => 'input[name="item_id"]',
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
                // Use the helper method to get the features object
                'suggested_products_enabled' => $this->get_features_object()->suggested_products_enabled ?? false,
            ]
        ];
        $this->add_script_data('productAdditionsSettingsData', $script_data);
    }

    /**
     * Helper to get features object, memoized for the request.
     * @return object|null
     */
    private function get_features_object()
    {
        static $features_obj = null;
        if ($features_obj === null && function_exists('product_estimator_features')) {
            $features_obj = product_estimator_features();
        }
        return $features_obj;
    }


    public function enqueue_styles()
    {
        parent::enqueue_styles();

        wp_enqueue_style('select2', 'https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css', array(), '4.1.0-rc.0');

        wp_enqueue_style(
            $this->plugin_name . '-product-additions-settings',
            PRODUCT_ESTIMATOR_PLUGIN_URL . 'admin/css/modules/product-additions-settings.css',
            array($this->plugin_name . '-admin-tables'),
            $this->version
        );
    }

    protected function get_nonce_action_base()
    {
        return 'product_estimator_product_additions';
    }

    protected function register_hooks()
    {
        add_action('admin_enqueue_scripts', array($this, 'maybe_enqueue_assets'));
        add_action('wp_ajax_save_category_relation', array($this, 'ajax_save_category_relation'));
        add_action('wp_ajax_delete_category_relation', array($this, 'ajax_delete_category_relation'));
        add_action('wp_ajax_search_category_products', array($this, 'ajax_search_category_products'));
        add_action('wp_ajax_get_product_details', array($this, 'ajax_get_product_details'));
        add_action('product_estimator_before_localize_scripts', array($this, 'collect_module_script_data'), 10, 2);
    }

    public function ajax_save_category_relation()
    {
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], $this->get_nonce_action_base() . '_nonce')) {
            wp_send_json_error(array('message' => __('Security check failed.', 'product-estimator')));
            return;
        }
        if (!current_user_can('manage_product_terms')) {
            wp_send_json_error(array('message' => __('You do not have permission to perform this action.', 'product-estimator')));
            return;
        }

        $relation_id = isset($_POST['item_id']) && !empty($_POST['item_id']) ?
            sanitize_text_field($_POST['item_id']) : uniqid('rel_');

        $source_categories = array();
        if (isset($_POST['source_category']) && is_array($_POST['source_category'])) {
            foreach ($_POST['source_category'] as $cat_id) {
                $source_categories[] = absint($cat_id);
            }
        } elseif (isset($_POST['source_category'])) {
            $source_categories[] = absint($_POST['source_category']);
        }

        $relation_type = isset($_POST['relation_type']) ? sanitize_text_field($_POST['relation_type']) : '';
        $target_category = isset($_POST['target_category']) ? absint($_POST['target_category']) : 0;
        $product_id = isset($_POST['product_id']) ? absint($_POST['product_id']) : 0; // from name="product_id"
        $note_text = isset($_POST['note_text']) ? sanitize_textarea_field($_POST['note_text']) : '';

        if (empty($relation_type)) {
            wp_send_json_error(array('message' => __('Please select an action type.', 'product-estimator')));
            return;
        }
        if (empty($source_categories)) {
            wp_send_json_error(array('message' => __('Please select at least one source category.', 'product-estimator')));
            return;
        }
        if ($relation_type === 'auto_add_by_category') {
            if (empty($target_category)) {
                wp_send_json_error(array('message' => __('Please select a target category.', 'product-estimator')));
                return;
            }
            if (empty($product_id)) {
                wp_send_json_error(array('message' => __('Please select a product.', 'product-estimator')));
                return;
            }
        } elseif ($relation_type === 'suggest_products_by_category') {
            if (empty($target_category)) {
                wp_send_json_error(array('message' => __('Please select a target category.', 'product-estimator')));
                return;
            }
        } elseif ($relation_type === 'auto_add_note_by_category') {
            if (empty($note_text)) {
                wp_send_json_error(array('message' => __('Please enter a note text.', 'product-estimator')));
                return;
            }
        }

        $relations = get_option($this->option_name, array());
        if (!is_array($relations)) $relations = [];
        $relation_data = ['source_category' => $source_categories, 'relation_type' => $relation_type, 'id' => $relation_id];
        if ($relation_type === 'auto_add_by_category') {
            $relation_data['target_category'] = $target_category;
            $relation_data['product_id'] = $product_id;
        } elseif ($relation_type === 'suggest_products_by_category') {
            $relation_data['target_category'] = $target_category;
        } elseif ($relation_type === 'auto_add_note_by_category') {
            $relation_data['note_text'] = $note_text;
        }
        $relations[$relation_id] = $relation_data;
        update_option($this->option_name, $relations);

        $source_cat_names = array_map(function ($cat_id) {
            $term = get_term($cat_id, 'product_cat');
            return $term && !is_wp_error($term) ? $term->name : null;
        }, $source_categories);
        $source_cat_names = array_filter($source_cat_names);
        $relation_type_label = $this->get_relation_type_label($relation_type);

        $response_item = $relation_data;
        $response_item['source_name'] = implode(', ', $source_cat_names);
        $response_item['relation_type_label'] = $relation_type_label;

        if ($target_category && ($relation_type === 'auto_add_by_category' || $relation_type === 'suggest_products_by_category')) {
            $target_cat = get_term($target_category, 'product_cat');
            if ($target_cat && !is_wp_error($target_cat)) {
                $response_item['target_name'] = $target_cat->name;
            }
        }
        if ($product_id && $relation_type === 'auto_add_by_category') {
            $product = wc_get_product($product_id);
            if ($product) {
                $response_item['product_name'] = $product->get_name();
            }
        }

        wp_send_json_success(['message' => __('Relationship saved successfully.', 'product-estimator'), 'item' => $response_item]);
    }

    private function get_relation_type_label($relation_type_key)
    {
        $labels = [
            'auto_add_by_category' => __('Auto-Add Product with Category', 'product-estimator'),
            'auto_add_note_by_category' => __('Auto-Add Note with Category', 'product-estimator'),
            'suggest_products_by_category' => __('Suggest Products when Category', 'product-estimator'),
        ];
        return $labels[$relation_type_key] ?? $relation_type_key;
    }

    public function ajax_delete_category_relation()
    {
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], $this->get_nonce_action_base() . '_nonce')) {
            wp_send_json_error(array('message' => __('Security check failed.', 'product-estimator')));
            return;
        }
        if (!current_user_can('manage_product_terms')) {
            wp_send_json_error(array('message' => __('You do not have permission to perform this action.', 'product-estimator')));
            return;
        }
        $relation_id = isset($_POST['item_id']) ? sanitize_text_field($_POST['item_id']) : ''; // From AdminTableManager
        if (empty($relation_id)) {
            wp_send_json_error(array('message' => __('Invalid relationship ID.', 'product-estimator')));
            return;
        }
        $relations = get_option($this->option_name, array());
        if (!is_array($relations)) $relations = [];
        if (!isset($relations[$relation_id])) {
            wp_send_json_error(array('message' => __('Relationship not found.', 'product-estimator')));
            return;
        }
        unset($relations[$relation_id]);
        update_option($this->option_name, $relations);
        wp_send_json_success(array('message' => __('Relationship deleted successfully.', 'product-estimator')));
    }

    public function ajax_search_category_products()
    {
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], $this->get_nonce_action_base() . '_nonce')) {
            wp_send_json_error(array('message' => __('Security check failed [Product Search].', 'product-estimator')));
            return;
        }
        if (!current_user_can('manage_product_terms')) {
            wp_send_json_error(array('message' => __('You do not have permission to perform this action.', 'product-estimator')));
            return;
        }
        $search_term = isset($_POST['search']) ? sanitize_text_field($_POST['search']) : '';
        $category_id = isset($_POST['category']) ? absint($_POST['category']) : 0;
        if (empty($search_term) || empty($category_id)) {
            wp_send_json_error(array('message' => __('Invalid search parameters.', 'product-estimator')));
            return;
        }
        $args = ['post_type' => 'product', 'post_status' => 'publish', 'posts_per_page' => 20, 's' => $search_term,
            'tax_query' => [['taxonomy' => 'product_cat', 'field' => 'term_id', 'terms' => $category_id,],],];
        $query = new \WP_Query($args);
        $products = array();
        if ($query->have_posts()) {
            while ($query->have_posts()) {
                $query->the_post();
                $product_id_from_query = get_the_ID();
                $product = wc_get_product($product_id_from_query);
                if ($product) {
                    $products[] = ['id' => $product_id_from_query, 'name' => $product->get_name(),];
                }
            }
            wp_reset_postdata();
        }
        wp_send_json_success(array('products' => $products));
    }

    public function ajax_get_product_details()
    {
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], $this->get_nonce_action_base() . '_nonce')) {
            wp_send_json_error(array('message' => __('Security check failed [Get Product].', 'product-estimator')));
            return;
        }
        if (!current_user_can('manage_product_terms')) {
            wp_send_json_error(array('message' => __('You do not have permission to perform this action.', 'product-estimator')));
            return;
        }
        $product_id_to_fetch = 0;
        if (isset($_POST['item_id'])) {
            $product_id_to_fetch = absint($_POST['item_id']);
        } elseif (isset($_POST['product_id'])) {
            $product_id_to_fetch = absint($_POST['product_id']);
        }
        if (empty($product_id_to_fetch)) {
            wp_send_json_error(array('message' => __('Invalid product ID for fetching details.', 'product-estimator')));
            return;
        }
        $product = wc_get_product($product_id_to_fetch);
        if (!$product) {
            wp_send_json_error(array('message' => __('Product not found.', 'product-estimator')));
            return;
        }
        wp_send_json_success(['item' => ['id' => $product_id_to_fetch, 'name' => $product->get_name(),],]);
    }
}
