<?php
/**
 * Partial for rendering settings pages with vertical tabs
 *
 * This template provides a standardized layout for settings pages that use a vertical tab
 * navigation structure. It creates the tabbed interface with navigation on the left and
 * content panels on the right. Each tab can display either a settings form or a table view.
 *
 * The template is included by SettingsModuleWithVerticalTabsBase::render_module_content()
 * and receives its variables from that context.
 *
 * Expected variables from parent scope:
 * - $vertical_tabs: Array of tab definitions with each tab containing:
 *   - id: Unique identifier for the tab
 *   - title: Display title for the tab
 *   - description: Optional description text for the tab
 *   - content_type: Optional type of content ('settings' or 'table', defaults to 'settings')
 * - $active_tab_id: The ID of the currently active tab
 * - $base_url: The base URL for tab navigation links
 * - $this: The SettingsModuleWithVerticalTabsBase instance that called this template
 *
 * @since      1.1.0
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes/admin/partials
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
    die;
}

// Ensure we have tabs to render
if ( empty( $vertical_tabs ) ) {
    return;
}
?>

<?php if($this->get_section_title()): ?>
    <!-- Section title if provided -->
    <h2 class="section-title"><?php echo esc_html($this->get_section_title()); ?></h2>
<?php endif; ?>

<?php
// Check if render_section_description returns content before echoing wrapping div
ob_start();
$this->render_section_description();
$section_description_content = ob_get_clean();
if ( ! empty( trim( $section_description_content ) ) ) :
    ?>
    <div class="section-description">
        <?php echo $section_description_content; // Content is already escaped by the method if needed ?>
    </div>
<?php endif; ?>

<div class="pe-vtabs-wrapper">
    <!-- Main container for vertical tabs layout -->
    <div class="pe-vtabs-main-container">
        <!-- Left sidebar navigation area -->
        <div class="pe-vtabs-nav-area">
            <ul class="pe-vtabs-nav-list">
                <?php foreach ( $vertical_tabs as $index => $tab_data ) : ?>
                    <?php
                    // Skip if tab ID is missing
                    if ( empty( $tab_data['id'] ) ) {
                        continue;
                    }

                    // Generate URL for this tab
                    $tab_url = add_query_arg( 'sub_tab', $tab_data['id'], $base_url );

                    // Check if this is the active tab
                    $is_active = ( $active_tab_id === $tab_data['id'] );

                    // Generate class for list item
                    $li_class = 'pe-vtabs-nav-item' . ( $is_active ? ' active' : '' );
                    ?>
                    <li class="<?php echo esc_attr( $li_class ); ?> pe-vtabs-nav-item-<?php echo esc_attr( $tab_data['id'] ); ?>"
                        data-tab="<?php echo esc_attr( $tab_data['id'] ); ?>"
                        data-tab-query="<?php echo esc_attr( $tab_data['id'] ); ?>"
                        data-tabid="<?php echo esc_attr( $tab_data['id'] ); ?>"
                    >
                        <a href="<?php echo esc_url( $tab_url ); ?>"
                           data-tab="<?php echo esc_attr( $tab_data['id'] ); ?>"
                           data-tab-query="<?php echo esc_attr( $tab_data['id'] ); ?>"
                           data-tabid="<?php echo esc_attr( $tab_data['id'] ); ?>"
                           class="pe-vtabs-link pe-vtabs-link-<?php echo esc_attr( $tab_data['id'] ); ?>">
                            <?php echo esc_html( $tab_data['title'] ); ?>
                        </a>
                    </li>
                <?php endforeach; ?>
            </ul>
        </div>

        <!-- Right content area for tab panels -->
        <div class="pe-vtabs-content-area">
            <?php foreach ( $vertical_tabs as $tab_data ) : ?>
                <?php
                // Skip if tab ID is missing
                if ( empty( $tab_data['id'] ) ) {
                    continue;
                }

                // Check if this is the active panel
                $is_panel_active = ( $active_tab_id === $tab_data['id'] );

                // Determine content type for this tab (settings form or table)
                $content_type = isset($tab_data['content_type']) ? $tab_data['content_type'] : 'settings';
                ?>
                <!-- Tab panel container -->
                <div id="<?php echo esc_attr( $tab_data['id'] ); ?>"
                     class="pe-vtabs-tab-panel <?php echo $is_panel_active ? 'active' : ''; ?> pe-vtabs-tab-panel-<?php echo esc_attr($content_type); ?>"
                    <?php if ( ! $is_panel_active ) echo 'style="display:none;"'; // Initially hide non-active tabs ?>
                >
                    <h3>
                        <?php
                        // Display tab title, adding "Settings" suffix for settings-type tabs
                        echo esc_html( $tab_data['title'] . ( $content_type === 'settings' ? ' ' . __( 'Settings', 'product-estimator' ) : '' ) );
                        ?>
                    </h3>

                    <?php if ( ! empty( $tab_data['description'] ) ) : ?>
                        <!-- Optional tab description -->
                        <p class="pe-vtabs-tab-description"><?php echo esc_html( $tab_data['description'] ); ?></p>
                    <?php endif; ?>

                    <?php if ( $content_type === 'table' ) : ?>
                        <?php
                        // For 'table' type tabs, call a method on the module instance to render table content
                        if ( method_exists( $this, 'render_table_content_for_tab' ) ) {
                            // Pass the specific tab data to the rendering method
                            $this->render_table_content_for_tab( $tab_data );
                        } else {
                            // Display error if module doesn't implement required method
                            echo '<div class="notice notice-error"><p>' . esc_html__( 'Error: This module is not configured to display table content correctly.', 'product-estimator' ) . '</p></div>';
                        }
                        ?>
                    <?php else : // Default to 'settings' content type ?>
                        <!-- Settings form for this tab -->
                        <form method="post" action="javascript:void(0);" class="pe-vtabs-tab-form product-estimator-form"
                              data-tab-id="<?php echo esc_attr($this->get_tab_id()); ?>"
                              data-sub-tab-id="<?php echo esc_attr( $tab_data['id'] ); ?>">
                            <?php
                            // The page slug for settings_fields and do_settings_sections
                            // should match how fields were registered for this specific sub-tab
                            $page_slug_for_wp_api = $this->plugin_name . '_' . $this->get_tab_id() . '_' . $tab_data['id'];

                            // Output WordPress settings fields (nonce, action, option_page) with unique ID for nonce
                            ob_start();
                            settings_fields( $this->option_name );
                            $settings_fields = ob_get_clean();
                            // Add unique ID to _wpnonce field
                            $settings_fields = str_replace('id="_wpnonce"', 'id="_wpnonce_' . esc_attr($tab_data['id']) . '"', $settings_fields);
                            echo $settings_fields;

                            // Output settings sections and fields for this tab
                            do_settings_sections( $page_slug_for_wp_api );
                            ?>
                            <!-- Form submission area -->
                            <p class="submit">
                                <button type="submit" name="submit_<?php echo esc_attr( $this->get_tab_id() . '_' . $tab_data['id'] ); ?>" class="button button-primary save-settings">
                                    <?php
                                    /* translators: %s: Tab title */
                                    printf( esc_html__( 'Save %s Settings', 'product-estimator' ), esc_html( $tab_data['title'] ) );
                                    ?>
                                </button>
                                <span class="spinner"></span>
                            </p>
                        </form>
                    <?php endif; ?>
                </div>
            <?php endforeach; ?>
        </div>
    </div>

    <?php
    // Optional sidebar rendering (if module implements the method)
    if ( method_exists( $this, 'render_vertical_tabs_sidebar' ) ) {
        $this->render_vertical_tabs_sidebar();
    }
    ?>
</div>
