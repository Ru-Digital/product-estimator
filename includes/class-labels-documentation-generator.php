<?php
namespace RuDigital\ProductEstimator\Includes;

use RuDigital\ProductEstimator\Includes\Frontend\LabelsFrontend;

/**
 * Labels Documentation Generator
 *
 * Generates comprehensive documentation for the labels system
 * to help developers understand available labels and their usage.
 *
 * @since      2.4.0
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes
 */
class LabelsDocumentationGenerator {
    /**
     * The plugin name
     *
     * @since    2.4.0
     * @access   private
     * @var      string    $plugin_name    The plugin name
     */
    private $plugin_name;
    
    /**
     * The plugin version
     *
     * @since    2.4.0
     * @access   private
     * @var      string    $version    The plugin version
     */
    private $version;
    
    /**
     * Labels frontend instance
     *
     * @since    2.4.0
     * @access   private
     * @var      LabelsFrontend    $labels_frontend    Labels frontend instance
     */
    private $labels_frontend;
    
    /**
     * Analytics instance
     *
     * @since    2.4.0
     * @access   private
     * @var      LabelsUsageAnalytics    $analytics    Analytics instance
     */
    private $analytics;
    
    /**
     * Initialize the class and set its properties.
     *
     * @since    2.4.0
     * @param    string              $plugin_name      The name of this plugin.
     * @param    string              $version          The version of this plugin.
     * @param    LabelsFrontend      $labels_frontend  The labels frontend instance.
     * @param    LabelsUsageAnalytics $analytics       The analytics instance (optional).
     */
    public function __construct($plugin_name, $version, $labels_frontend, $analytics = null) {
        $this->plugin_name = $plugin_name;
        $this->version = $version;
        $this->labels_frontend = $labels_frontend;
        $this->analytics = $analytics;
    }
    
    /**
     * Generate documentation as HTML
     *
     * @since    2.4.0
     * @access   public
     * @param    bool    $include_analytics    Whether to include analytics data
     * @return   string                        Generated HTML documentation
     */
    public function generate_html($include_analytics = true) {
        $labels = $this->labels_frontend->get_all_labels_with_cache();
        $categories = $this->get_categories($labels);
        
        // Get analytics data if available
        $usage_data = [];
        if ($include_analytics && $this->analytics) {
            $usage_data = $this->analytics->get_analytics_data()['access_counts'] ?? [];
        }
        
        ob_start();
        ?>
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Product Estimator Labels Documentation</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
                    color: #333;
                    line-height: 1.5;
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 20px;
                }
                h1 {
                    color: #0073aa;
                    border-bottom: 1px solid #eee;
                    padding-bottom: 10px;
                }
                h2 {
                    color: #0073aa;
                    margin-top: 30px;
                }
                h3 {
                    margin-top: 25px;
                    color: #23282d;
                }
                .category {
                    margin-bottom: 30px;
                    padding: 20px;
                    background: #f9f9f9;
                    border-radius: 5px;
                    border-left: 4px solid #0073aa;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 15px 0;
                }
                th, td {
                    text-align: left;
                    padding: 8px 12px;
                    border: 1px solid #ddd;
                }
                th {
                    background-color: #f2f2f2;
                }
                tr:nth-child(even) {
                    background-color: #f9f9f9;
                }
                .usage-count {
                    font-size: 0.9em;
                    color: #777;
                    min-width: 80px;
                    text-align: center;
                }
                .high-usage {
                    color: #46b450;
                    font-weight: bold;
                }
                .medium-usage {
                    color: #ffb900;
                }
                .low-usage {
                    color: #dc3232;
                }
                .no-usage {
                    color: #999;
                    font-style: italic;
                }
                .label-key {
                    font-family: monospace;
                    background: #f1f1f1;
                    padding: 2px 4px;
                    border-radius: 3px;
                }
                .label-value {
                    max-width: 400px;
                    overflow-wrap: break-word;
                }
                .usage-example {
                    background: #f5f5f5;
                    padding: 15px;
                    border-radius: 3px;
                    font-family: monospace;
                    margin: 10px 0;
                    overflow: auto;
                    font-size: 14px;
                }
                .code-block {
                    background: #f5f5f5;
                    padding: 15px;
                    border-radius: 3px;
                    font-family: monospace;
                    margin: 10px 0;
                    overflow: auto;
                    font-size: 14px;
                }
                .metadata {
                    margin-top: 20px;
                    font-size: 0.9em;
                    color: #777;
                }
                .toc {
                    background: #f5f5f5;
                    padding: 15px;
                    border-radius: 5px;
                    margin-bottom: 20px;
                }
                .toc ul {
                    column-count: 2;
                }
                .search-box {
                    margin: 20px 0;
                    padding: 10px;
                    width: 100%;
                    max-width: 400px;
                    font-size: 16px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                }
                @media print {
                    body {
                        font-size: 12px;
                    }
                    .category {
                        page-break-inside: avoid;
                        border-left: none;
                        border-top: 2px solid #0073aa;
                    }
                    .usage-example {
                        page-break-inside: avoid;
                    }
                }
            </style>
        </head>
        <body>
            <h1>Product Estimator Labels Documentation</h1>
            <p>This documentation provides a comprehensive reference of all available labels in the Product Estimator plugin.</p>
            
            <div class="metadata">
                <p><strong>Version:</strong> <?php echo esc_html($this->version); ?></p>
                <p><strong>Generated:</strong> <?php echo esc_html(date('Y-m-d H:i:s')); ?></p>
                <?php if ($include_analytics && !empty($usage_data)): ?>
                <p><strong>Analytics:</strong> Included (showing real usage data)</p>
                <?php endif; ?>
            </div>
            
            <input type="text" class="search-box" id="labelSearch" placeholder="Search labels..." onkeyup="filterLabels()">
            
            <div class="toc">
                <h2>Table of Contents</h2>
                <ul>
                    <?php foreach ($categories as $category => $data): ?>
                    <li><a href="#<?php echo esc_attr($category); ?>"><?php echo esc_html($data['title']); ?></a></li>
                    <?php endforeach; ?>
                </ul>
            </div>
            
            <h2>Overview</h2>
            <p>The Product Estimator uses a dynamic labels system that allows all text in the application to be customized without code changes. Labels are organized into categories and can be accessed using dot notation.</p>
            
            <div class="code-block">
                <h3>PHP Usage</h3>
                <pre>// Get a label in PHP
$label = $labels_frontend->get('buttons.save_estimate', 'Default Value');

// Format a label with replacements
$label = $labels_frontend->format('messages.item_added', [
    'item' => $item_name
]);</pre>
                
                <h3>JavaScript Usage</h3>
                <pre>// Get a label in JavaScript
const label = labelManager.get('buttons.save_estimate', 'Default Value');

// Format a label with replacements
const label = labelManager.format('messages.item_added', {
    item: itemName
});</pre>
                
                <h3>Template Usage</h3>
                <pre>&lt;button&gt;
    &lt;span data-label="buttons.save_estimate"&gt;Save Estimate&lt;/span&gt;
&lt;/button&gt;</pre>
            </div>
            
            <?php foreach ($categories as $category => $data): ?>
            <div class="category" id="<?php echo esc_attr($category); ?>">
                <h2><?php echo esc_html($data['title']); ?></h2>
                <p><?php echo esc_html($data['description']); ?></p>
                
                <?php if (!empty($data['labels'])): ?>
                <table>
                    <thead>
                        <tr>
                            <th>Label Key</th>
                            <th>Value</th>
                            <?php if ($include_analytics): ?>
                            <th>Usage</th>
                            <?php endif; ?>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($data['labels'] as $key => $value): 
                            $full_key = $category . '.' . $key;
                            $usage_count = $usage_data[$full_key] ?? 0;
                            
                            // Determine usage class
                            $usage_class = 'no-usage';
                            if ($usage_count > 50) {
                                $usage_class = 'high-usage';
                            } elseif ($usage_count > 10) {
                                $usage_class = 'medium-usage';
                            } elseif ($usage_count > 0) {
                                $usage_class = 'low-usage';
                            }
                        ?>
                        <tr class="label-row">
                            <td class="label-key"><?php echo esc_html($full_key); ?></td>
                            <td class="label-value"><?php echo esc_html($value); ?></td>
                            <?php if ($include_analytics): ?>
                            <td class="usage-count <?php echo esc_attr($usage_class); ?>">
                                <?php echo esc_html($usage_count); ?> <?php echo $usage_count === 1 ? 'use' : 'uses'; ?>
                            </td>
                            <?php endif; ?>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
                <?php else: ?>
                <p>No labels defined in this category.</p>
                <?php endif; ?>
                
                <h3>Usage Examples</h3>
                <div class="usage-example">
                    <strong>PHP:</strong>
                    <pre>$label = $labels_frontend->get('<?php echo $category; ?>.example_key', 'Default Value');</pre>
                    
                    <strong>JavaScript:</strong>
                    <pre>const label = labelManager.get('<?php echo $category; ?>.example_key', 'Default Value');</pre>
                    
                    <strong>Template:</strong>
                    <pre>&lt;span data-label="<?php echo $category; ?>.example_key"&gt;Default Value&lt;/span&gt;</pre>
                </div>
            </div>
            <?php endforeach; ?>
            
            <script>
            function filterLabels() {
                const input = document.getElementById('labelSearch');
                const filter = input.value.toLowerCase();
                const rows = document.getElementsByClassName('label-row');
                
                for (let i = 0; i < rows.length; i++) {
                    const keyCell = rows[i].getElementsByClassName('label-key')[0];
                    const valueCell = rows[i].getElementsByClassName('label-value')[0];
                    
                    if (keyCell && valueCell) {
                        const key = keyCell.textContent || keyCell.innerText;
                        const value = valueCell.textContent || valueCell.innerText;
                        
                        if (key.toLowerCase().indexOf(filter) > -1 || 
                            value.toLowerCase().indexOf(filter) > -1) {
                            rows[i].style.display = "";
                        } else {
                            rows[i].style.display = "none";
                        }
                    }
                }
            }
            </script>
        </body>
        </html>
        <?php
        return ob_get_clean();
    }
    
    /**
     * Generate documentation as Markdown
     *
     * @since    2.4.0
     * @access   public
     * @param    bool    $include_analytics    Whether to include analytics data
     * @return   string                        Generated Markdown documentation
     */
    public function generate_markdown($include_analytics = true) {
        $labels = $this->labels_frontend->get_all_labels_with_cache();
        $categories = $this->get_categories($labels);
        
        // Get analytics data if available
        $usage_data = [];
        if ($include_analytics && $this->analytics) {
            $usage_data = $this->analytics->get_analytics_data()['access_counts'] ?? [];
        }
        
        $output = "# Product Estimator Labels Documentation\n\n";
        $output .= "This documentation provides a comprehensive reference of all available labels in the Product Estimator plugin.\n\n";
        
        $output .= "- **Version:** {$this->version}\n";
        $output .= "- **Generated:** " . date('Y-m-d H:i:s') . "\n";
        if ($include_analytics && !empty($usage_data)) {
            $output .= "- **Analytics:** Included (showing real usage data)\n";
        }
        $output .= "\n";
        
        $output .= "## Table of Contents\n\n";
        foreach ($categories as $category => $data) {
            $output .= "- [{$data['title']}](#" . strtolower(str_replace(' ', '-', $data['title'])) . ")\n";
        }
        $output .= "\n";
        
        $output .= "## Overview\n\n";
        $output .= "The Product Estimator uses a dynamic labels system that allows all text in the application to be customized without code changes. Labels are organized into categories and can be accessed using dot notation.\n\n";
        
        $output .= "### PHP Usage\n\n";
        $output .= "```php\n";
        $output .= "// Get a label in PHP\n";
        $output .= "\$label = \$labels_frontend->get('buttons.save_estimate', 'Default Value');\n\n";
        $output .= "// Format a label with replacements\n";
        $output .= "\$label = \$labels_frontend->format('messages.item_added', [\n";
        $output .= "    'item' => \$item_name\n";
        $output .= "]);\n";
        $output .= "```\n\n";
        
        $output .= "### JavaScript Usage\n\n";
        $output .= "```javascript\n";
        $output .= "// Get a label in JavaScript\n";
        $output .= "const label = labelManager.get('buttons.save_estimate', 'Default Value');\n\n";
        $output .= "// Format a label with replacements\n";
        $output .= "const label = labelManager.format('messages.item_added', {\n";
        $output .= "    item: itemName\n";
        $output .= "});\n";
        $output .= "```\n\n";
        
        $output .= "### Template Usage\n\n";
        $output .= "```html\n";
        $output .= "<button>\n";
        $output .= "    <span data-label=\"buttons.save_estimate\">Save Estimate</span>\n";
        $output .= "</button>\n";
        $output .= "```\n\n";
        
        foreach ($categories as $category => $data) {
            $output .= "## {$data['title']}\n\n";
            $output .= "{$data['description']}\n\n";
            
            if (!empty($data['labels'])) {
                $output .= "| Label Key | Value | " . ($include_analytics ? "Usage |" : "") . "\n";
                $output .= "| --------- | ----- | " . ($include_analytics ? "---- |" : "") . "\n";
                
                foreach ($data['labels'] as $key => $value) {
                    $full_key = $category . '.' . $key;
                    $usage_count = $usage_data[$full_key] ?? 0;
                    
                    $output .= "| `{$full_key}` | " . $this->escape_md_table_cell($value) . " | ";
                    if ($include_analytics) {
                        $output .= "{$usage_count} " . ($usage_count === 1 ? 'use' : 'uses') . " | ";
                    }
                    $output .= "\n";
                }
                $output .= "\n";
            } else {
                $output .= "No labels defined in this category.\n\n";
            }
            
            $output .= "### Usage Examples\n\n";
            $output .= "**PHP:**\n\n";
            $output .= "```php\n";
            $output .= "\$label = \$labels_frontend->get('{$category}.example_key', 'Default Value');\n";
            $output .= "```\n\n";
            
            $output .= "**JavaScript:**\n\n";
            $output .= "```javascript\n";
            $output .= "const label = labelManager.get('{$category}.example_key', 'Default Value');\n";
            $output .= "```\n\n";
            
            $output .= "**Template:**\n\n";
            $output .= "```html\n";
            $output .= "<span data-label=\"{$category}.example_key\">Default Value</span>\n";
            $output .= "```\n\n";
        }
        
        return $output;
    }
    
    /**
     * Generate documentation and save to file
     *
     * @since    2.4.0
     * @access   public
     * @param    string    $format             The format to generate ('html' or 'markdown')
     * @param    string    $file_path          The file path to save to
     * @param    bool      $include_analytics  Whether to include analytics data
     * @return   bool                          Whether the file was saved successfully
     */
    public function generate_and_save($format = 'html', $file_path = null, $include_analytics = true) {
        if (!$file_path) {
            $upload_dir = wp_upload_dir();
            $basename = 'product-estimator-labels-documentation';
            
            if ($format === 'markdown' || $format === 'md') {
                $file_path = $upload_dir['basedir'] . '/' . $basename . '.md';
                $content = $this->generate_markdown($include_analytics);
            } else {
                $file_path = $upload_dir['basedir'] . '/' . $basename . '.html';
                $content = $this->generate_html($include_analytics);
            }
        } else {
            if ($format === 'markdown' || $format === 'md') {
                $content = $this->generate_markdown($include_analytics);
            } else {
                $content = $this->generate_html($include_analytics);
            }
        }
        
        $result = file_put_contents($file_path, $content);
        return $result !== false;
    }
    
    /**
     * Extract categories from labels array
     *
     * @since    2.4.0
     * @access   private
     * @param    array    $labels   The labels array
     * @return   array              The categories array
     */
    private function get_categories($labels) {
        $categories = [];
        
        foreach ($labels as $key => $value) {
            // Skip special keys
            if ($key === '_version' || $key === '_flat') {
                continue;
            }
            
            if (is_array($value)) {
                $title = ucfirst(str_replace('_', ' ', $key));
                $description = $this->get_category_description($key);
                
                $categories[$key] = [
                    'title' => $title,
                    'description' => $description,
                    'labels' => $value
                ];
            }
        }
        
        return $categories;
    }
    
    /**
     * Get description for a category
     *
     * @since    2.4.0
     * @access   private
     * @param    string    $category   The category key
     * @return   string                The category description
     */
    private function get_category_description($category) {
        $descriptions = [
            'buttons' => 'Labels used for buttons throughout the application.',
            'forms' => 'Form field labels, placeholders, and help text.',
            'messages' => 'Success, error, warning, and confirmation messages.',
            'ui' => 'General UI text and labels.',
            'pdf' => 'Labels specific to PDF generation.',
            'tooltips' => 'Help text and tooltips.',
            'dialogs' => 'Text used in modal dialogs and popups.',
            'emails' => 'Email template content.',
            'headers' => 'Header and title text.',
            'errors' => 'Error messages shown to users.',
            'success' => 'Success messages shown to users.'
        ];
        
        return $descriptions[$category] ?? 'Labels for ' . ucfirst(str_replace('_', ' ', $category)) . '.';
    }
    
    /**
     * Escape markdown table cell content
     *
     * @since    2.4.0
     * @access   private
     * @param    string    $text   The text to escape
     * @return   string            The escaped text
     */
    private function escape_md_table_cell($text) {
        // Replace pipe with HTML entity to avoid breaking table
        $text = str_replace('|', '&#124;', $text);
        // Replace newlines with <br> to avoid breaking table
        $text = str_replace(["\r\n", "\r", "\n"], '<br>', $text);
        return $text;
    }
}