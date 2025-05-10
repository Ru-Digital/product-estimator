<?php
/**
 * Partial for rendering settings pages with vertical tabs using generic class names.
 *
 * This template is included by SettingsModuleWithVerticalTabsBase::render_module_content().
 *
 * Available variables:
 * @var array  $vertical_tabs Array of tab definitions (from get_vertical_tabs()).
 * @var string $active_tab_id The ID of the currently active tab.
 * @var string $base_url      The base URL for tab navigation.
 * @var \RuDigital\ProductEstimator\Includes\Admin\Settings\SettingsModuleWithVerticalTabsBase $this The instance of the calling class.
 *
 * @since      X.X.X // TODO: Set appropriate version
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes/admin/partials
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
    die;
}

if ( empty( $vertical_tabs ) ) {
    return;
}
?>
<div class="pe-vtabs-wrapper"> <?php // Generic outer wrapper ?>
    <div class="pe-vtabs-main-container"> <?php // Generic inner container for tabs and content area ?>
        <div class="pe-vtabs-nav-area"> <?php // Generic navigation wrapper ?>
            <ul class="pe-vtabs-nav-list"> <?php // Generic navigation list ?>
                <?php foreach ( $vertical_tabs as $index => $tab_data ) : ?>
                    <?php
                    if ( empty( $tab_data['id'] ) ) {
                        continue; // Skip tab if ID is missing
                    }
                    $tab_url   = add_query_arg( 'sub_tab', $tab_data['id'], $base_url );
                    $is_active = ( $active_tab_id === $tab_data['id'] );
                    $li_class  = 'pe-vtabs-nav-item' . ( $is_active ? ' active' : '' ); // Generic class for li element
                    ?>
                    <li class="<?php echo esc_attr( $li_class ); ?>">
                        <a href="<?php echo esc_url( $tab_url ); ?>" data-tab="<?php echo esc_attr( $tab_data['id'] ); // data-tab can be kept for JS hooks ?>">
                            <?php echo esc_html( $tab_data['title'] ); ?>
                        </a>
                    </li>
                <?php endforeach; ?>
            </ul>
        </div>

        <div class="pe-vtabs-content-area"> <?php // Generic content wrapper ?>
            <?php foreach ( $vertical_tabs as $tab_data ) : ?>
                <?php
                if ( empty( $tab_data['id'] ) ) {
                    continue; // Skip tab if ID is missing
                }
                $is_panel_active = ( $active_tab_id === $tab_data['id'] );
                ?>
                <div id="<?php echo esc_attr( $tab_data['id'] ); ?>"
                     class="pe-vtabs-tab-panel <?php echo $is_panel_active ? 'active' : ''; ?>"
                    <?php if ( ! $is_panel_active ) echo 'style="display:none;"'; // Initially hide non-active tabs ?>
                >
                    <h3><?php echo esc_html( $tab_data['title'] . ' ' . __( 'Settings', 'product-estimator' ) ); ?></h3>
                    <?php if ( ! empty( $tab_data['description'] ) ) : ?>
                        <p class="pe-vtabs-tab-description"><?php echo esc_html( $tab_data['description'] ); ?></p>
                    <?php endif; ?>

                    <form method="post" action="javascript:void(0);" class="pe-vtabs-tab-form product-estimator-form" data-tab="<?php echo esc_attr( $tab_data['id'] ); ?>" data-type="<?php echo esc_attr( $tab_data['id'] ); ?>">
                        <?php
                        // Important: settings_fields() and do_settings_sections() output content.
                        // Ensure they are called for each tab whose content needs to be available.
                        settings_fields( $this->plugin_name . '_options' ); // This might need adjustment if each tab has vastly different option groups. Usually shared.
                        do_settings_sections( $this->plugin_name . '_' . $this->get_tab_id() . '_' . $tab_data['id'] );
                        ?>
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
                </div>
            <?php endforeach; ?>
        </div>
    </div>

    <?php
    // The method render_vertical_tabs_sidebar() is specific to the module extending the base class.
    // It will output its own HTML structure. If that structure needs generic styling for the container,
    // the method itself should use generic classes, or this partial could provide a generic wrapper.
    // For now, this partial calls the method, and the method is responsible for its own classes.
    // The 'label-usage-info' class is specific to the Labels module's sidebar.
    if ( method_exists( $this, 'render_vertical_tabs_sidebar' ) ) {
        // You could wrap this in a generic sidebar container if needed:
        // echo '<div class="pe-vtabs-sidebar-wrapper">';
        $this->render_vertical_tabs_sidebar();
        // echo '</div>';
    }
    ?>
</div>
