<?php
// File: admin/partials/admin-display-table-module.php (New Generic Partial)
/**
 * Generic Partial for rendering settings modules that manage a table of items.
 *
 * This template is included by SettingsModuleWithTableBase::render_module_content().
 *
 * Available variables:
 * @var \RuDigital\ProductEstimator\Includes\Admin\Settings\SettingsModuleWithTableBase $module The instance of the child settings module.
 * @var array  $table_items      Array of items for the table (from $module->get_items_for_table()).
 * @var array  $table_columns    Associative array of column definitions (from $module->get_table_columns()).
 * @var string $add_new_button_label Label for the "Add New" button.
 * @var string $default_form_title Default title for the add/edit form.
 * @var array  $options          Current WordPress options for this module.
 * @var string $plugin_name      The plugin's name/slug.
 * @var string $version          The plugin's version.
 *
 * Child module is responsible for:
 * - Implementing $module->render_form_fields() to output the <input>, <select>, etc. for the form.
 * - Implementing $module->render_table_cell_content() to output the content for each <td>.
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
    die;
}

// Use generic CSS classes that AdminTableManager.js and admin-tables.css expect.
// These can be overridden by the selectors provided in JS localization if needed.
$form_container_class = 'pe-admin-table-form-container';
$form_class = 'pe-item-management-form';
$add_button_class = 'pe-add-new-item-button button button-primary';
$list_container_class = 'pe-admin-list-table-wrapper'; // Wrapper for the table and "no items" message
$table_class = 'pe-admin-list-table wp-list-table widefat fixed striped';
$no_items_class = 'pe-no-items-message';
$form_title_class = 'pe-form-title';
$id_input_name = 'item_id'; // Default name for the hidden ID field in the form, JS can target this.

// Get module-specific selectors from JS localization if available, to allow overrides
// This part is more for JS to know, but useful for consistency if PHP needs to generate some selectors.
// $js_selectors = $module->get_localized_script_data_value('selectors'); // Hypothetical method
// if ($js_selectors) {
//    $form_container_class = $js_selectors['formContainer'] ?? $form_container_class;
//    // ... and so on for other classes
// }

?>
<div class="<?php echo esc_attr( $module->get_tab_id() ); ?>-settings-module-wrapper pe-admin-table-container">
    <?php if($module->get_section_title()): ?>  <h2 class="section-title"><?= $module->get_section_title() ?></h2> <?php endif ?>
    <?php if($module->render_section_description()): ?>  <div class="section-description"><?= $module->render_section_description() ?></div> <?php endif ?>
    <?php
    // Hook for content before the "Add New" button and form
    do_action( "product_estimator_before_table_module_ui_{$module->get_tab_id()}", $module );
    ?>

    <p>
        <button type="button" class="<?php echo esc_attr( $add_button_class ); ?>">
            <?php echo esc_html( $add_new_button_label ); ?>
        </button>
    </p>

    <div class="<?php echo esc_attr( $form_container_class ); ?>" style="display: none;">
        <h3 class="<?php echo esc_attr( $form_title_class ); ?>"><?php echo esc_html( $default_form_title ); ?></h3>
        <form class="<?php echo esc_attr( $form_class ); ?>" method="post" action="javascript:void(0);">
            <input type="hidden" name="<?php echo esc_attr( $id_input_name ); ?>" value="" />

            <?php
            // Child module renders its specific form fields here
            // The $item variable is not available here directly in the partial's scope for the initial render.
            // The JS (populateFormWithData) will handle filling fields for an existing item.
            // For a new item, render_form_fields should render empty/default fields.
            $module->render_form_fields( null );
            ?>

            <div class="form-actions">
                <button type="submit" class="pe-save-item-button button button-primary">
                    <?php esc_html_e( 'Save Changes', 'product-estimator' ); // JS will update this text if needed ?>
                </button>
                <button type="button" class="pe-cancel-form-button button">
                    <?php esc_html_e( 'Cancel', 'product-estimator' ); ?>
                </button>
                <span class="spinner"></span>
            </div>
        </form>
    </div>

    <div class="<?php echo esc_attr( $list_container_class ); ?>">
        <h3><?php echo esc_html( $module->get_tab_title() . ' ' . __( 'List', 'product-estimator' ) ); ?></h3>

        <div class="<?php echo esc_attr( $no_items_class ); ?>" style="<?php echo empty( $table_items ) ? '' : 'display:none;'; ?>">
            <?php esc_html_e( 'No items have been configured yet.', 'product-estimator' ); ?>
        </div>

        <table class="<?php echo esc_attr( $table_class ); ?>" style="<?php echo empty( $table_items ) ? 'display:none;' : ''; ?>">
            <thead>
            <tr>
                <?php foreach ( $table_columns as $column_id => $column_title ) : ?>
                    <th scope="col" id="<?php echo esc_attr( $column_id ); ?>" class="manage-column column-<?php echo esc_attr( $column_id ); ?>">
                        <?php echo esc_html( $column_title ); ?>
                    </th>
                <?php endforeach; ?>
            </tr>
            </thead>
            <tbody id="<?php echo esc_attr( $module->get_tab_id() ); ?>-table-body">
            <?php if ( ! empty( $table_items ) ) : ?>
                <?php foreach ( $table_items as $item_id => $item ) : // Assuming $item_id is the key if items are associative ?>
                    <?php
                    // If $item is an object, ensure it has an 'id' property or adapt.
                    // If $table_items is a numerically indexed array of associative arrays/objects,
                    // then $item_id here is the numerical index. The actual unique ID of the item
                    // should be part of the $item itself (e.g., $item['id'] or $item->id).
                    // The AdminTableManager.js expects rows to have a `data-id` attribute.
                    $current_item_id_for_row = is_array($item) ? ($item['id'] ?? $item_id) : ($item->id ?? $item_id);
                    ?>
                    <tr data-id="<?php echo esc_attr( $current_item_id_for_row ); ?>">
                        <?php foreach ( $table_columns as $column_id => $column_title ) : ?>
                            <td class="column-<?php echo esc_attr( $column_id ); ?>" data-colname="<?php echo esc_attr( $column_title ); ?>">
                                <?php $module->render_table_cell_content( $item, $column_id ); ?>
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
    <?php
    // Hook for content after the table module UI
    do_action( "product_estimator_after_table_module_ui_{$module->get_tab_id()}", $module );
    ?>
</div>
