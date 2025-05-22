<?php
namespace RuDigital\ProductEstimator\Includes;

/**
 * Handles migration of labels to hierarchical structure
 *
 * @since      3.0.0
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes
 */
class LabelsMigration {
    /**
     * The option name for labels
     */
    const OPTION_NAME = 'product_estimator_labels';

    /**
     * The option name for labels version
     */
    const VERSION_OPTION_NAME = 'product_estimator_labels_version';

    /**
     * Run the migration
     */
    public static function migrate() {
        $existing_labels = get_option(self::OPTION_NAME, []);

        if (empty($existing_labels)) {
            // No existing labels, create default structure
            self::create_default_structure();
            return;
        }

        // Check if already migrated
        $version = get_option(self::VERSION_OPTION_NAME, '0');
        if (version_compare($version, '3.0.0', '>=')) {
            return; // Already migrated
        }

        // Create new hierarchical structure
        $new_structure = self::get_default_structure();

        // Save the new structure
        update_option(self::OPTION_NAME, $new_structure);
        update_option(self::VERSION_OPTION_NAME, '3.0.0');

        // Clear any existing caches
        delete_transient('pe_frontend_labels_cache');
        delete_transient('pe_frontend_frequent_labels');
    }

    /**
     * Get the default hierarchical label structure (values only, no metadata)
     */
    public static function get_default_structure() {
        return LabelsStructure::get_label_values_only();
    }

    /**
     * Create the default label structure
     */
    private static function create_default_structure() {
        $default_structure = self::get_default_structure();

        update_option(self::OPTION_NAME, $default_structure);
        update_option(self::VERSION_OPTION_NAME, '3.0.0');
    }

    /**
     * Update the labels version to refresh caches
     */
    public static function update_labels_version() {
        update_option(self::VERSION_OPTION_NAME, '3.0.0');
        delete_transient('pe_frontend_labels_cache');
        delete_transient('pe_frontend_frequent_labels');
    }
}