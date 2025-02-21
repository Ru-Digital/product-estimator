<?php

class Product_Estimator {
    public function __construct() {
        add_action('admin_menu', array($this, 'add_plugin_menu'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
    }

    public function add_plugin_menu() {
        add_menu_page(
            'Product Estimator Settings',
            'Product Estimator',
            'manage_options',
            'product-estimator',
            array($this, 'plugin_settings_page'),
            'dashicons-calculator',
            25
        );
    }

    public function plugin_settings_page() {
        echo "<h1>Product Estimator Settings</h1>";
        echo "<p>Customize your estimator settings here.</p>";
    }

    public function enqueue_scripts() {
        wp_enqueue_style('product-estimator-css', plugin_dir_url(__FILE__) . '../assets/css/style.css');
        wp_enqueue_script('product-estimator-js', plugin_dir_url(__FILE__) . '../assets/js/script.js', array('jquery'), false, true);
    }

    public function run() {
        // Any additional initialization code
    }
}