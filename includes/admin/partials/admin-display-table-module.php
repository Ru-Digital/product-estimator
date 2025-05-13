<?php
/**
 * Generic Partial for rendering settings modules with tabular data management
 *
 * This template provides a standardized layout for admin interfaces that manage
 * collections of items in a table format. It includes the table display of existing
 * items and a form for adding/editing items. The template handles both the structure
 * and the dynamic rendering of form fields based on the module's configuration.
 *
 * The template is included by SettingsModuleWithTableBase::render_table_content_for_tab()
 * or similar methods in modules that display and manage tabular data.
 *
 * Expected variables from parent scope:
 * - $this: The SettingsModuleWithTableBase instance calling this template, with methods:
 *   - get_tab_id(): Returns the current tab identifier
 *   - get_tab_title(): Returns the current tab title
 *   - get_item_form_fields_definition(): Returns field definitions for the form
 *   - render_field(): Renders a form field with given parameters
 *   - render_table_cell_content(): Renders content for a specific table cell
 * - $table_items: Array of items to display in the table
 * - $table_columns: Associative array of column_id => column_title
 * - $add_new_button_label: Text for the add new button
 * - $default_form_title: Default title for the add/edit form
 * - $options: Current WordPress options for this module
 * - $plugin_name: The plugin's name/slug
 * - $version: The plugin's version
 *
 * @since      1.1.0
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes/admin/partials
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
    die;
}

// Define CSS class names for styling and JavaScript interaction
$form_container_class = 'pe-admin-table-form-container';  // Container for the form
$form_tag_class       = 'pe-item-management-form';        // Class for the <form> element
$add_button_class     = 'pe-add-new-item-button button button-primary'; // Add new button
$list_container_class = 'pe-admin-list-table-wrapper';    // Container for the table
$list_table_class     = 'pe-admin-list-table wp-list-table widefat fixed striped'; // Table class
$no_items_class       = 'pe-no-items-message';            // Message shown when no items exist
$form_title_class     = 'pe-form-title';                  // Form title class
$hidden_item_id_name  = 'item_id';                        // Name of hidden item ID field

// Get field definitions for the form
$fields_definition = $this->get_item_form_fields_definition();

// Initialize empty array for item values (used when showing a blank form)
$current_item_values = [];

?>
<div class="<?php echo esc_attr( $this->get_tab_id() ); ?>-settings-module-wrapper pe-admin-table-container">

    <?php
    // Only display section title and description if not in a vertical tabs context
    // (vertical tabs template already shows these at the tab level)
    if (method_exists($this, 'get_section_title') && $this->get_section_title() && empty($is_vertical_tab_context)) {
        echo '<h2 class="pe-main-section-title">' . esc_html($this->get_section_title()) . '</h2>';
    }
    if (method_exists($this, 'render_section_description') && empty($is_vertical_tab_context)) {
        // Section description is omitted as it's typically handled by vertical tabs
    }
    ?>

    <?php 
    // Action hook for adding content before the table module UI
    do_action( "product_estimator_before_table_module_ui_{$this->get_tab_id()}", $this ); 
    ?>

    <!-- Add New Button -->
    <p>
        <button type="button" class="<?php echo esc_attr( $add_button_class ); ?>">
            <?php echo esc_html( $add_new_button_label ); ?>
        </button>
    </p>

    <!-- Form Container - Hidden by default, shown when adding/editing items -->
    <div class="<?php echo esc_attr( $form_container_class ); ?>" style="display: none;">
        <h3 class="<?php echo esc_attr( $form_title_class ); ?>">
            <?php echo esc_html( $default_form_title ); ?>
        </h3>
        
        <!-- Item Management Form -->
        <form class="<?php echo esc_attr( $form_tag_class ); ?>" method="post" action="javascript:void(0);" 
              data-tab-id="<?php echo esc_attr($this->get_tab_id()); ?>" 
              data-sub-tab-id="<?php echo esc_attr(isset($vertical_tab_id) ? $vertical_tab_id : 'rules_table_tab'); ?>">
              
            <!-- Hidden field for item ID, populated when editing -->
            <?php
            // Generate a unique identifier for this form's item_id field
            $unique_field_suffix = $this->get_tab_id() . '_' . (isset($vertical_tab_id) ? $vertical_tab_id : 'rules_table_tab');
            $unique_item_id_name = $hidden_item_id_name . '_' . $unique_field_suffix;
            $unique_item_id_id = $hidden_item_id_name . '_form_' . $unique_field_suffix; // Added 'form_' to ensure uniqueness
            ?>
            <input type="hidden" name="<?php echo esc_attr( $unique_item_id_name ); ?>" 
                   id="<?php echo esc_attr( $unique_item_id_id ); ?>" 
                   value="" class="pe-item-id-input" data-original-name="<?php echo esc_attr( $hidden_item_id_name ); ?>" />

            <?php
            // Form Field Rendering Logic
            if ( empty( $fields_definition ) ) {
                // Show message if no fields defined
                echo '<p>' . esc_html__( 'No form fields have been configured for this item type.', 'product-estimator' ) . '</p>';
            } else {
                // First render any hidden fields
                foreach ( $fields_definition as $field_args ) {
                    if ( empty( $field_args['id'] ) ) continue;
                    $field_type = isset($field_args['type']) ? $field_args['type'] : 'text';
                    
                    if ( $field_type === 'hidden' ) {
                        // Get current value or default
                        $_current_value = isset($current_item_values[$field_args['id']]) 
                                       ? $current_item_values[$field_args['id']] 
                                       : (isset($field_args['default']) ? $field_args['default'] : null);
                                       
                        $_name_override = $field_args['id'];
                        
                        // Ensure field has ID attribute with unique suffix
                        $field_unique_id = $field_args['id'] . '_field_' . $unique_field_suffix;
                        $field_args['attributes']['id'] = $field_unique_id;
                        
                        // Render the hidden field
                        $this->render_field( $field_args, $_current_value, $_name_override );
                    }
                }

                // Next render any full-width custom HTML fields
                foreach ($fields_definition as $field_args) {
                    if (empty($field_args['id'])) continue;
                    $field_type = isset($field_args['type']) ? $field_args['type'] : 'text';
                    
                    if ($field_type === 'custom_html_full_width') {
                        $_current_value = isset($current_item_values[$field_args['id']]) 
                                       ? $current_item_values[$field_args['id']] 
                                       : (isset($field_args['default']) ? $field_args['default'] : null);
                                       
                        // Use custom render callback if provided
                        if (isset($field_args['render_callback']) && is_callable([$this, $field_args['render_callback']])) {
                            call_user_func([$this, $field_args['render_callback']], $field_args, $_current_value);
                        } elseif (isset($field_args['html'])) {
                            // Or use provided HTML directly
                            echo $field_args['html']; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
                        }
                    }
                }

                // Check if there are visible fields to show in the table
                $has_visible_table_fields = false;
                foreach ( $fields_definition as $field_args_check ) {
                    $field_type_check = isset($field_args_check['type']) ? $field_args_check['type'] : 'text';
                    if ( $field_type_check !== 'hidden' && $field_type_check !== 'custom_html_full_width' ) {
                        $has_visible_table_fields = true;
                        break;
                    }
                }

                // If there are visible fields, render them in a table layout
                if ( $has_visible_table_fields ) :
                    ?>
                    <table class="form-table pe-item-form-fields-table">
                        <tbody>
                        <?php foreach ( $fields_definition as $field_args ) : ?>
                            <?php
                            // Skip fields without ID or already rendered types
                            if ( empty( $field_args['id'] ) ) continue;
                            $field_id = $field_args['id'];
                            $field_type = isset($field_args['type']) ? $field_args['type'] : 'text';

                            if ( $field_type === 'hidden' || $field_type === 'custom_html_full_width' ) continue;

                            // Get current value or default
                            $_current_value = isset($current_item_values[$field_id]) 
                                         ? $current_item_values[$field_id] 
                                         : (isset($field_args['default']) ? $field_args['default'] : null);
                                         
                            // Set row class if specified
                            $_row_class_attr = isset($field_args['row_class']) ? ' class="' . esc_attr($field_args['row_class']) . '"' : '';
                            
                            // Prepare field name, adding [] for multiple selects
                            $_name_override = $field_id;
                            if ( $field_type === 'select' && !empty($field_args['attributes']['multiple']) ) {
                                $_name_override .= '[]';
                            }
                            
                            // Ensure field has ID attribute with unique suffix
                            $field_unique_id = $field_id . '_field_' . $unique_field_suffix;
                            $field_args['attributes']['id'] = $field_unique_id;
                            
                            // Get HTML element ID and set up description ID if needed
                            $_html_element_id = $field_args['attributes']['id'];
                            $_description_html_id = '';
                            if ( !empty($field_args['description']) ) {
                                $_description_html_id = $_html_element_id . '-description';
                                $field_args['description_id'] = $_description_html_id;
                            }
                            ?>
                            <tr<?php echo $_row_class_attr; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
                                <th scope="row">
                                    <?php if ( !empty($field_args['label']) ) : ?>
                                        <label for="<?php echo esc_attr($_html_element_id); ?>">
                                            <?php echo esc_html($field_args['label']); ?>
                                            <?php if ( !empty($field_args['required']) ) : ?>
                                                <span class="required" aria-label="<?php esc_attr_e('Required', 'product-estimator'); ?>">*</span>
                                            <?php endif; ?>
                                        </label>
                                    <?php endif; ?>
                                </th>
                                <td>
                                    <?php 
                                    // Render the field using the module's render_field method
                                    $this->render_field($field_args, $_current_value, $_name_override); 
                                    ?>
                                    <?php if ( !empty($field_args['description']) ) : ?>
                                        <p class="description" id="<?php echo esc_attr($_description_html_id); ?>">
                                            <?php echo wp_kses_post($field_args['description']); ?>
                                        </p>
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

            <!-- Form Action Buttons -->
            <div class="form-actions">
                <button type="submit" class="pe-save-item-button button button-primary">
                    <?php esc_html_e('Save Changes', 'product-estimator'); ?>
                </button>
                <button type="button" class="pe-cancel-form-button button">
                    <?php esc_html_e('Cancel', 'product-estimator'); ?>
                </button>
                <span class="spinner"></span>
            </div>
        </form>
    </div>

    <!-- Item List Table Container -->
    <div class="<?php echo esc_attr($list_container_class); ?>">
        <?php
        // Determine list title - use section_title if available, otherwise tab_title
        $list_heading = (method_exists($this, 'get_section_title') && $this->get_section_title())
            ? $this->get_section_title()
            : $this->get_tab_title();
        ?>
        <h3><?php echo esc_html($list_heading . ' ' . __('List', 'product-estimator')); ?></h3>

        <!-- Empty state message (shown when no items exist) -->
        <div class="<?php echo esc_attr($no_items_class); ?>" style="<?php echo empty($table_items) ? '' : 'display:none;'; ?>">
            <?php esc_html_e('No items have been configured yet.', 'product-estimator'); ?>
        </div>

        <!-- Items Table (hidden when empty) -->
        <table class="<?php echo esc_attr($list_table_class); ?>" style="<?php echo empty($table_items) ? 'display:none;' : ''; ?>">
            <thead>
            <tr>
                <?php foreach ($table_columns as $column_id => $column_title) : ?>
                    <th scope="col" id="column-<?php echo esc_attr($column_id); ?>" class="manage-column column-<?php echo esc_attr($column_id); ?>">
                        <?php echo esc_html($column_title); ?>
                    </th>
                <?php endforeach; ?>
            </tr>
            </thead>
            <tbody id="<?php echo esc_attr($this->get_tab_id()); ?>-table-body">
            <?php if (!empty($table_items)) : ?>
                <?php foreach ($table_items as $item_id_key => $item_data_row) : ?>
                    <?php
                    // Get unique ID for this row, either from 'id' property or using the array key
                    $current_item_id_for_row = isset($item_data_row['id']) ? $item_data_row['id'] : $item_id_key;
                    ?>
                    <tr data-id="<?php echo esc_attr($current_item_id_for_row); ?>">
                        <?php foreach ($table_columns as $column_id => $column_title) : ?>
                            <td class="column-<?php echo esc_attr($column_id); ?>" data-colname="<?php echo esc_attr($column_title); ?>">
                                <?php 
                                // Render cell content using the module's render_table_cell_content method
                                $this->render_table_cell_content($item_data_row, $column_id); 
                                ?>
                            </td>
                        <?php endforeach; ?>
                    </tr>
                <?php endforeach; ?>
            <?php endif; ?>
            </tbody>
            <tfoot>
            <tr>
                <?php foreach ($table_columns as $column_id => $column_title) : ?>
                    <th scope="col" class="manage-column column-<?php echo esc_attr($column_id); ?>">
                        <?php echo esc_html($column_title); ?>
                    </th>
                <?php endforeach; ?>
            </tr>
            </tfoot>
        </table>
    </div>
    
    <?php 
    // Action hook for adding content after the table module UI
    do_action("product_estimator_after_table_module_ui_{$this->get_tab_id()}", $this); 
    ?>
</div>