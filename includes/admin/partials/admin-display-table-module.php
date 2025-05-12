<?php
/**
 * Generic Partial for rendering settings modules that manage a table of items,
 * including the add/edit item form structure.
 *
 * This template is included by SettingsModuleWithTableBase::render_table_content_for_tab()
 * or a similar method in modules that display a table of manageable items.
 *
 * Available variables:
 * @var \RuDigital\ProductEstimator\Includes\Admin\Settings\SettingsModuleWithTableBase $this The instance of the settings module.
 * @var array  $table_items         Array of items for the table (from $this->get_items_for_table()).
 * @var array  $table_columns       Associative array of column definitions (from $this->get_table_columns()).
 * @var string $add_new_button_label Label for the "Add New" button.
 * @var string $default_form_title  Default title for the add/edit form.
 * @var array  $options             Current WordPress options for this module (less commonly used here as item data is primary).
 * @var string $plugin_name         The plugin's name/slug.
 * @var string $version             The plugin's version.
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
    die;
}

// Class names based on your original partial for JS/CSS compatibility
$form_container_class = 'pe-admin-table-form-container';
$form_tag_class       = 'pe-item-management-form'; // Class for the <form> tag
$add_button_class     = 'pe-add-new-item-button button button-primary';
$list_container_class = 'pe-admin-list-table-wrapper';
$list_table_class     = 'pe-admin-list-table wp-list-table widefat fixed striped'; // Class for the items <table>
$no_items_class       = 'pe-no-items-message';
$form_title_class     = 'pe-form-title';
$hidden_item_id_name  = 'item_id'; // Name attribute for the hidden item_id input in the form

// Fetch field definitions for the item form
$fields_definition = $this->get_item_form_fields_definition();
// Initial state for current_item_values (for a new item form, typically hidden)
$current_item_values = [];

?>
<div class="<?php echo esc_attr( $this->get_tab_id() ); ?>-settings-module-wrapper pe-admin-table-container">

    <?php
    // Optional: Display overall section title and description from the module
    // These are for the entire table module, not the form specifically.
    if (method_exists($this, 'get_section_title') && $this->get_section_title() && empty($is_vertical_tab_context)) {
        // Only show if not already shown by vertical tab parent
        echo '<h2 class="pe-main-section-title">' . esc_html($this->get_section_title()) . '</h2>';
    }
    if (method_exists($this, 'render_section_description') && empty($is_vertical_tab_context)) {
        // $this->render_section_description(); // Assuming it echoes and handles its own wrapper + escaping
    }
    ?>

    <?php do_action( "product_estimator_before_table_module_ui_{$this->get_tab_id()}", $this ); ?>

    <p>
        <button type="button" class="<?php echo esc_attr( $add_button_class ); ?>">
            <?php echo esc_html( $add_new_button_label ); ?>
        </button>
    </p>

    <div class="<?php echo esc_attr( $form_container_class ); ?>" style="display: none;">
        <h3 class="<?php echo esc_attr( $form_title_class ); ?>"><?php echo esc_html( $default_form_title ); ?></h3>
        <form class="<?php echo esc_attr( $form_tag_class ); ?>" method="post" action="javascript:void(0);" data-tab-id="<?php echo esc_attr($this->get_tab_id()); ?>" data-sub-tab-id="<?php echo esc_attr(isset($vertical_tab_id) ? $vertical_tab_id : 'rules_table_tab'); ?>">
            <?php // This hidden input is crucial for AdminTableManager.js to distinguish add/edit and get the ID. ?>
            <input type="hidden" name="<?php echo esc_attr( $hidden_item_id_name ); ?>" value="" class="pe-item-id-input" />

            <?php
            // --- Inlined Form Field Rendering Logic ---
            if ( empty( $fields_definition ) ) {
                echo '<p>' . esc_html__( 'No form fields have been configured for this item type.', 'product-estimator' ) . '</p>';
            } else {
                // Render Hidden Fields defined in get_item_form_fields_definition
                foreach ( $fields_definition as $field_args ) {
                    if ( empty( $field_args['id'] ) ) continue;
                    $field_type = $field_args['type'] ?? 'text';
                    if ( $field_type === 'hidden' ) {
                        $_current_value = $current_item_values[ $field_args['id'] ] ?? ( $field_args['default'] ?? null );
                        $_name_override = $field_args['id'];
                        if ( ! isset( $field_args['attributes']['id'] ) ) {
                            $field_args['attributes']['id'] = $field_args['id'];
                        }
                        $this->render_field( $field_args, $_current_value, $_name_override );
                    }
                }

                // Render Full-Width Custom HTML Fields
                foreach ($fields_definition as $field_args) {
                    if (empty($field_args['id'])) continue;
                    $field_type = $field_args['type'] ?? 'text';
                    if ($field_type === 'custom_html_full_width') {
                        $_current_value = $current_item_values[$field_args['id']] ?? ($field_args['default'] ?? null);
                        if (isset($field_args['render_callback']) && is_callable([$this, $field_args['render_callback']])) {
                            call_user_func([$this, $field_args['render_callback']], $field_args, $_current_value);
                        } elseif (isset($field_args['html'])) {
                            echo $field_args['html']; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
                        }
                    }
                }

                $has_visible_table_fields = false;
                foreach ( $fields_definition as $field_args_check ) {
                    $field_type_check = $field_args_check['type'] ?? 'text';
                    if ( $field_type_check !== 'hidden' && $field_type_check !== 'custom_html_full_width' ) {
                        $has_visible_table_fields = true;
                        break;
                    }
                }

                if ( $has_visible_table_fields ) :
                    ?>
                    <table class="form-table pe-item-form-fields-table"> <?php // Standard WP class + custom class ?>
                        <tbody>
                        <?php foreach ( $fields_definition as $field_args ) : ?>
                            <?php
                            if ( empty( $field_args['id'] ) ) continue;
                            $field_id      = $field_args['id'];
                            $field_type    = $field_args['type'] ?? 'text';

                            if ( $field_type === 'hidden' || $field_type === 'custom_html_full_width' ) continue;

                            $_current_value = $current_item_values[ $field_id ] ?? ( $field_args['default'] ?? null );
                            $_row_class_attr = isset( $field_args['row_class'] ) ? ' class="' . esc_attr( $field_args['row_class'] ) . '"' : '';
                            $_name_override = $field_id;
                            if ( $field_type === 'select' && ! empty( $field_args['attributes']['multiple'] ) ) {
                                $_name_override .= '[]';
                            }
                            if ( ! isset( $field_args['attributes']['id'] ) ) {
                                $field_args['attributes']['id'] = $field_id;
                            }
                            $_html_element_id = $field_args['attributes']['id'];
                            $_description_html_id = '';
                            if ( ! empty( $field_args['description'] ) ) {
                                $_description_html_id = $_html_element_id . '-description';
                                $field_args['description_id'] = $_description_html_id;
                            }
                            ?>
                            <tr<?php echo $_row_class_attr; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
                                <th scope="row">
                                    <?php if ( ! empty( $field_args['label'] ) ) : ?>
                                        <label for="<?php echo esc_attr( $_html_element_id ); ?>">
                                            <?php echo esc_html( $field_args['label'] ); ?>
                                            <?php if ( ! empty( $field_args['required'] ) ) : ?>
                                                <span class="required" aria-label="<?php esc_attr_e( 'Required', 'product-estimator' ); ?>">*</span>
                                            <?php endif; ?>
                                        </label>
                                    <?php endif; ?>
                                </th>
                                <td>
                                    <?php $this->render_field( $field_args, $_current_value, $_name_override ); ?>
                                    <?php if ( ! empty( $field_args['description'] ) ) : ?>
                                        <p class="description" id="<?php echo esc_attr( $_description_html_id ); ?>"><?php echo wp_kses_post( $field_args['description'] ); ?></p>
                                    <?php endif; ?>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                        </tbody>
                    </table>
                <?php
                endif; // End if ($has_visible_table_fields)
            } // End else (if !empty($fields_definition))
            ?>

            <div class="form-actions">
                <button type="submit" class="pe-save-item-button button button-primary">
                    <?php esc_html_e( 'Save Changes', 'product-estimator' ); /* JS might update this to "Add Item" or "Update Item" */ ?>
                </button>
                <button type="button" class="pe-cancel-form-button button">
                    <?php esc_html_e( 'Cancel', 'product-estimator' ); ?>
                </button>
                <span class="spinner"></span>
            </div>
        </form>
    </div>

    <div class="<?php echo esc_attr( $list_container_class ); ?>">
        <?php
        // Determine list title. Use section_title if available and more specific than tab_title.
        $list_heading = (method_exists($this, 'get_section_title') && $this->get_section_title())
            ? $this->get_section_title()
            : $this->get_tab_title();
        ?>
        <h3><?php echo esc_html( $list_heading . ' ' . __( 'List', 'product-estimator' ) ); ?></h3>

        <div class="<?php echo esc_attr( $no_items_class ); ?>" style="<?php echo empty( $table_items ) ? '' : 'display:none;'; ?>">
            <?php esc_html_e( 'No items have been configured yet.', 'product-estimator' ); ?>
        </div>

        <table class="<?php echo esc_attr( $list_table_class ); ?>" style="<?php echo empty( $table_items ) ? 'display:none;' : ''; ?>">
            <thead>
            <tr>
                <?php foreach ( $table_columns as $column_id => $column_title ) : ?>
                    <th scope="col" id="column-<?php echo esc_attr( $column_id ); ?>" class="manage-column column-<?php echo esc_attr( $column_id ); ?>">
                        <?php echo esc_html( $column_title ); ?>
                    </th>
                <?php endforeach; ?>
            </tr>
            </thead>
            <tbody id="<?php echo esc_attr( $this->get_tab_id() ); ?>-table-body">
            <?php if ( ! empty( $table_items ) ) : ?>
                <?php foreach ( $table_items as $item_id_key => $item_data_row ) : ?>
                    <?php
                    $current_item_id_for_row = $item_data_row['id'] ?? $item_id_key;
                    ?>
                    <tr data-id="<?php echo esc_attr( $current_item_id_for_row ); ?>">
                        <?php foreach ( $table_columns as $column_id => $column_title ) : ?>
                            <td class="column-<?php echo esc_attr( $column_id ); ?>" data-colname="<?php echo esc_attr( $column_title ); ?>">
                                <?php $this->render_table_cell_content( $item_data_row, $column_id ); ?>
                            </td>
                        <?php endforeach; ?>
                    </tr>
                <?php endforeach; ?>
            <?php endif; ?>
            </tbody>
            <tfoot>
            <tr>
                <?php foreach ( $table_columns as $column_id => $column_title ) : ?>
                    <th scope="col" class="manage-column column-<?php echo esc_attr( $column_id ); ?>">
                        <?php echo esc_html( $column_title ); ?>
                    </th>
                <?php endforeach; ?>
            </tr>
            </tfoot>
        </table>
    </div>
    <?php do_action( "product_estimator_after_table_module_ui_{$this->get_tab_id()}", $this ); ?>
</div>
