<?php
namespace RuDigital\ProductEstimator\Includes\Admin\Settings;

/**
 * Labels Bulk Operations Handler
 *
 * Handles bulk operations for labels including import, export, 
 * bulk edit, and search functionality.
 *
 * @since      2.0.0
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes/admin/settings
 */
class LabelsBulkOperations {
    
    /**
     * Export labels to JSON format
     * 
     * @param array $labels Labels array to export
     * @return string JSON string
     */
    public static function export_labels($labels = null) {
        if ($labels === null) {
            $labels = get_option('product_estimator_labels', []);
        }
        
        $export_data = [
            'version' => get_option('product_estimator_labels_version', '2.0.0'),
            'exported_at' => current_time('mysql'),
            'labels' => $labels
        ];
        
        return json_encode($export_data, JSON_PRETTY_PRINT);
    }
    
    /**
     * Import labels from JSON string
     * 
     * @param string $json_string JSON string containing labels
     * @return array Result of the import operation
     */
    public static function import_labels($json_string) {
        try {
            $data = json_decode($json_string, true);
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                return ['success' => false, 'message' => 'Invalid JSON format'];
            }
            
            if (!isset($data['labels'])) {
                return ['success' => false, 'message' => 'No labels found in import data'];
            }
            
            // Validate label structure
            $validated_labels = self::validate_import_data($data['labels']);
            
            if (!$validated_labels) {
                return ['success' => false, 'message' => 'Invalid label structure'];
            }
            
            // Update labels
            update_option('product_estimator_labels', $validated_labels);
            
            // Update version to trigger cache invalidation
            $new_version = time() . '.0.0';
            update_option('product_estimator_labels_version', $new_version);
            
            // Clear transients
            delete_transient('pe_labels_' . get_option('product_estimator_labels_version'));
            
            return [
                'success' => true, 
                'message' => 'Labels imported successfully',
                'count' => self::count_labels($validated_labels)
            ];
            
        } catch (\Exception $e) {
            return ['success' => false, 'message' => 'Import failed: ' . $e->getMessage()];
        }
    }
    
    /**
     * Search labels by key or value
     * 
     * @param string $search_term Search term
     * @param array $labels Optional labels array to search in
     * @return array Matching labels with their paths
     */
    public static function search_labels($search_term, $labels = null) {
        if ($labels === null) {
            $labels = get_option('product_estimator_labels', []);
        }
        
        $results = [];
        $search_term = strtolower($search_term);
        
        foreach ($labels as $category => $category_labels) {
            if (!is_array($category_labels)) {
                continue;
            }
            
            foreach ($category_labels as $key => $value) {
                if (strpos(strtolower($key), $search_term) !== false || 
                    strpos(strtolower($value), $search_term) !== false) {
                    $results[] = [
                        'category' => $category,
                        'key' => $key,
                        'value' => $value,
                        'path' => "{$category}.{$key}"
                    ];
                }
            }
        }
        
        return $results;
    }
    
    /**
     * Bulk update multiple labels
     * 
     * @param array $updates Array of label updates ['path' => 'new value']
     * @return array Result of the operation
     */
    public static function bulk_update_labels($updates) {
        $labels = get_option('product_estimator_labels', []);
        $updated_count = 0;
        
        foreach ($updates as $path => $new_value) {
            $parts = explode('.', $path);
            if (count($parts) !== 2) {
                continue;
            }
            
            $category = $parts[0];
            $key = $parts[1];
            
            if (isset($labels[$category][$key])) {
                $labels[$category][$key] = sanitize_text_field($new_value);
                $updated_count++;
            }
        }
        
        if ($updated_count > 0) {
            update_option('product_estimator_labels', $labels);
            
            // Update version to trigger cache invalidation
            $new_version = time() . '.0.0';
            update_option('product_estimator_labels_version', $new_version);
            
            // Clear transients
            delete_transient('pe_labels_' . get_option('product_estimator_labels_version'));
        }
        
        return [
            'success' => true,
            'updated_count' => $updated_count
        ];
    }
    
    /**
     * Validate import data structure
     * 
     * @param array $data Import data to validate
     * @return array|false Validated data or false if invalid
     */
    private static function validate_import_data($data) {
        $valid_categories = ['buttons', 'forms', 'messages', 'ui_elements', 'pdf'];
        $validated_data = [];
        
        foreach ($data as $category => $labels) {
            if (!in_array($category, $valid_categories)) {
                continue;
            }
            
            if (!is_array($labels)) {
                continue;
            }
            
            $validated_data[$category] = [];
            
            foreach ($labels as $key => $value) {
                // Sanitize key to ensure it's valid
                $clean_key = sanitize_key($key);
                if ($clean_key !== '') {
                    $validated_data[$category][$clean_key] = sanitize_text_field($value);
                }
            }
        }
        
        return empty($validated_data) ? false : $validated_data;
    }
    
    /**
     * Count total labels across all categories
     * 
     * @param array $labels Labels array
     * @return int Total count
     */
    private static function count_labels($labels) {
        $count = 0;
        foreach ($labels as $category => $category_labels) {
            if (is_array($category_labels)) {
                $count += count($category_labels);
            }
        }
        return $count;
    }
}