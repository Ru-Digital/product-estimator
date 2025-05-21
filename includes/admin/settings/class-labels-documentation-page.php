<?php
namespace RuDigital\ProductEstimator\Includes\Admin\Settings;

use RuDigital\ProductEstimator\Includes\LabelsDocumentationGenerator;

/**
 * Labels Documentation Page
 *
 * Provides admin UI for generating and viewing labels documentation
 *
 * @since      2.4.0
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes/admin/settings
 */
class LabelsDocumentationPage {
    /**
     * The plugin name
     *
     * @since    2.4.0
     * @access   private
     * @var      string $plugin_name The name of this plugin
     */
    private $plugin_name;
    
    /**
     * The plugin version
     *
     * @since    2.4.0
     * @access   private
     * @var      string $version The version of this plugin
     */
    private $version;
    
    /**
     * Documentation generator instance
     *
     * @since    2.4.0
     * @access   private
     * @var      LabelsDocumentationGenerator $generator Documentation generator
     */
    private $generator;
    
    /**
     * Initialize the class and set its properties.
     *
     * @since    2.4.0
     * @param    string                        $plugin_name    The name of this plugin.
     * @param    string                        $version        The version of this plugin.
     * @param    LabelsDocumentationGenerator  $generator      Documentation generator.
     */
    public function __construct($plugin_name, $version, $generator) {
        $this->plugin_name = $plugin_name;
        $this->version = $version;
        $this->generator = $generator;
        
        // Add submenu page
        add_action('admin_menu', [$this, 'add_documentation_page'], 30);
        
        // Register AJAX handlers
        add_action('wp_ajax_pe_generate_labels_docs', [$this, 'ajax_generate_documentation']);
    }
    
    /**
     * Add documentation page to admin menu
     *
     * @since    2.4.0
     * @access   public
     */
    public function add_documentation_page() {
        add_submenu_page(
            'product-estimator',
            __('Label Documentation', 'product-estimator'),
            __('Label Documentation', 'product-estimator'),
            'manage_options',
            'product-estimator-label-docs',
            [$this, 'render_documentation_page']
        );
    }
    
    /**
     * Render the documentation page
     *
     * @since    2.4.0
     * @access   public
     */
    public function render_documentation_page() {
        if (!current_user_can('manage_options')) {
            wp_die(__('You do not have sufficient permissions to access this page.', 'product-estimator'));
        }
        
        // Handle form submission
        if (isset($_POST['pe_generate_docs']) && check_admin_referer('pe_generate_labels_docs')) {
            $format = isset($_POST['pe_docs_format']) ? sanitize_text_field($_POST['pe_docs_format']) : 'html';
            $include_analytics = isset($_POST['pe_include_analytics']);
            
            // Generate documentation
            $result = $this->generator->generate_and_save($format, null, $include_analytics);
            
            if ($result) {
                $extension = ($format === 'markdown' || $format === 'md') ? '.md' : '.html';
                $path = wp_upload_dir()['basedir'] . '/product-estimator-labels-documentation' . $extension;
                $url = wp_upload_dir()['baseurl'] . '/product-estimator-labels-documentation' . $extension;
                
                // Show success message
                echo '<div class="notice notice-success"><p>' . 
                     sprintf(__('Documentation generated successfully. <a href="%s" target="_blank">View Documentation</a>', 'product-estimator'), esc_url($url)) . 
                     '</p></div>';
            } else {
                // Show error message
                echo '<div class="notice notice-error"><p>' . 
                     __('Error: Documentation generation failed.', 'product-estimator') . 
                     '</p></div>';
            }
        }
        
        // Include template
        include PRODUCT_ESTIMATOR_PLUGIN_DIR . 'includes/admin/partials/label-documentation-page.php';
    }
    
    /**
     * Handle AJAX request to generate documentation
     *
     * @since    2.4.0
     * @access   public
     */
    public function ajax_generate_documentation() {
        // Verify nonce
        check_ajax_referer('pe_generate_labels_docs', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error(['message' => __('Permission denied.', 'product-estimator')]);
            return;
        }
        
        // Parse data
        $format = isset($_POST['format']) ? sanitize_text_field($_POST['format']) : 'html';
        $include_analytics = isset($_POST['include_analytics']) && $_POST['include_analytics'] === 'true';
        
        // Generate documentation
        $result = $this->generator->generate_and_save($format, null, $include_analytics);
        
        if ($result) {
            $extension = ($format === 'markdown' || $format === 'md') ? '.md' : '.html';
            $path = wp_upload_dir()['basedir'] . '/product-estimator-labels-documentation' . $extension;
            $url = wp_upload_dir()['baseurl'] . '/product-estimator-labels-documentation' . $extension;
            
            wp_send_json_success([
                'message' => __('Documentation generated successfully.', 'product-estimator'),
                'path' => $path,
                'url' => $url
            ]);
        } else {
            wp_send_json_error([
                'message' => __('Error: Documentation generation failed.', 'product-estimator')
            ]);
        }
    }
}