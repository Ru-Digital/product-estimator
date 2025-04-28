<?php
namespace RuDigital\ProductEstimator\Includes\Admin\Settings;

/**
 * Interface for settings modules
 */
interface SettingsModuleInterface {
    /**
     * Get the tab ID for this module
     *
     * @return string
     */
    public function get_tab_id();

    /**
     * Get the tab title for display
     *
     * @return string
     */
    public function get_tab_title();

    /**
     * Register settings fields for this module
     *
     * @return void
     */
    public function register_fields();

    /**
     * Render the settings section description
     *
     * @return void
     */
    public function render_section_description();

    /**
     * Validate module-specific settings
     *
     * @param array $input The settings input to validate
     * @return array The validated settings
     */
    public function validate_settings($input);

    /**
     * Render the module content
     *
     * @return void
     */
    public function render_module_content();

    /**
     * Enqueue module-specific scripts
     *
     * @return void
     */
    public function enqueue_scripts();

    /**
     * Enqueue module-specific styles
     *
     * @return void
     */
    public function enqueue_styles();
}
