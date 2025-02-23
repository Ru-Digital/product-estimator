<?php
namespace RuDigital\ProductEstimator\Includes;

/**
 * Define the internationalization functionality.
 *
 * Loads and defines the internationalization files for this plugin
 * so that it is ready for translation.
 *
 * @since      1.0.0
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes
 */
class I18n {

    /**
     * The domain specified for this plugin.
     *
     * @since    1.0.0
     * @access   private
     * @var      string    $domain    The domain identifier for this plugin.
     */
    private $domain;

    /**
     * The locale of the site.
     *
     * @since    1.0.0
     * @access   private
     * @var      string    $locale    The current locale.
     */
    private $locale;

    /**
     * Initialize the class and set its properties.
     *
     * @since    1.0.0
     */
    public function __construct() {
        $this->domain = 'product-estimator';
        $this->locale = determine_locale();
    }

    /**
     * Load the plugin text domain for translation.
     *
     * @since    1.0.0
     */
    public function load_plugin_textdomain() {
        load_plugin_textdomain(
            $this->domain,
            false,
            dirname(dirname(plugin_basename(__FILE__))) . '/languages/'
        );
    }

    /**
     * Set the domain for the plugin's translations.
     *
     * @since     1.0.0
     * @param     string    $domain    The domain that represents the locale of this plugin.
     */
    public function set_domain($domain) {
        $this->domain = $domain;
    }

    /**
     * Get the text domain.
     *
     * @since     1.0.0
     * @return    string    The text domain.
     */
    public function get_domain() {
        return $this->domain;
    }

    /**
     * Load custom translation files.
     *
     * @since    1.0.0
     */
    public function load_custom_translations() {
        // Check for custom translations in wp-content/languages/product-estimator/
        $custom_directory = WP_LANG_DIR . '/product-estimator';

        if (is_dir($custom_directory)) {
            $custom_mofile = $custom_directory . "/{$this->domain}-{$this->locale}.mo";

            if (file_exists($custom_mofile)) {
                load_textdomain($this->domain, $custom_mofile);
                return true;
            }
        }

        return false;
    }

    /**
     * Load plugin translations for JavaScript.
     *
     * @since    1.0.0
     */
    public function load_js_translations() {
        // Register scripts translations
        if (function_exists('wp_set_script_translations')) {
            wp_set_script_translations(
                'product-estimator-public',
                $this->domain,
                plugin_dir_path(dirname(__FILE__)) . 'languages'
            );

            wp_set_script_translations(
                'product-estimator-admin',
                $this->domain,
                plugin_dir_path(dirname(__FILE__)) . 'languages'
            );
        }
    }

    /**
     * Get translated strings for JavaScript.
     *
     * @since     1.0.0
     * @return    array    Array of translated strings.
     */
    public function get_js_translations() {
        return array(
            'error' => array(
                'general' => __('An error occurred.', 'product-estimator'),
                'required' => __('This field is required.', 'product-estimator'),
                'numeric' => __('Please enter a valid number.', 'product-estimator'),
                'min' => __('Value must be greater than %s.', 'product-estimator'),
                'max' => __('Value must be less than %s.', 'product-estimator'),
            ),
            'success' => array(
                'save' => __('Settings saved successfully.', 'product-estimator'),
                'calculate' => __('Calculation completed.', 'product-estimator'),
            ),
            'confirm' => array(
                'delete' => __('Are you sure you want to delete this item?', 'product-estimator'),
                'reset' => __('Are you sure you want to reset all settings?', 'product-estimator'),
            ),
            'buttons' => array(
                'calculate' => __('Calculate', 'product-estimator'),
                'calculating' => __('Calculating...', 'product-estimator'),
                'save' => __('Save Changes', 'product-estimator'),
                'saving' => __('Saving...', 'product-estimator'),
            ),
            'labels' => array(
                'quantity' => __('Quantity', 'product-estimator'),
                'price' => __('Price', 'product-estimator'),
                'total' => __('Total', 'product-estimator'),
            )
        );
    }

    /**
     * Check if translation exists.
     *
     * @since     1.0.0
     * @param     string    $locale    The locale to check.
     * @return    boolean             True if translation exists, false otherwise.
     */
    public function translation_exists($locale) {
        $mofile = WP_LANG_DIR . '/plugins/' . $this->domain . '-' . $locale . '.mo';

        if (file_exists($mofile)) {
            return true;
        }

        $mofile = plugin_dir_path(dirname(__FILE__)) . 'languages/' . $this->domain . '-' . $locale . '.mo';

        return file_exists($mofile);
    }

    /**
     * Get available translations.
     *
     * @since     1.0.0
     * @return    array    List of available translations.
     */
    public function get_available_translations() {
        $translations = array();
        $language_dir = plugin_dir_path(dirname(__FILE__)) . 'languages/';

        if (is_dir($language_dir)) {
            $files = scandir($language_dir);

            foreach ($files as $file) {
                if (preg_match('/^' . $this->domain . '-([a-z]{2}_[A-Z]{2})\.mo$/', $file, $matches)) {
                    $locale = $matches[1];
                    $translations[$locale] = $this->get_language_name($locale);
                }
            }
        }

        return $translations;
    }

    /**
     * Get language name from locale.
     *
     * @since     1.0.0
     * @param     string    $locale    The locale.
     * @return    string              The language name.
     */
    private function get_language_name($locale) {
        if (!class_exists('Locale')) {
            require_once(ABSPATH . 'wp-admin/includes/ms.php');
        }

        $languages = get_available_languages();

        if (in_array($locale, $languages)) {
            return \Locale::getDisplayName($locale, $locale);
        }

        return $locale;
    }
}