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
                .section {
                    margin-bottom: 40px;
                    padding: 20px;
                    background: #f9f9f9;
                    border-radius: 5px;
                    border-left: 4px solid #0073aa;
                }
                .subsection {
                    margin: 30px 0;
                    padding: 15px;
                    background: #fff;
                    border-radius: 3px;
                    border-left: 3px solid #ddd;
                }
                .group {
                    margin: 20px 0;
                    padding: 10px 0;
                }
                .section h1 {
                    margin-top: 0;
                    color: #0073aa;
                    border-bottom: 2px solid #0073aa;
                    padding-bottom: 10px;
                }
                .subsection h2 {
                    margin-top: 0;
                    color: #333;
                    border-bottom: 1px solid #ddd;
                    padding-bottom: 8px;
                }
                .group h3 {
                    margin-top: 0;
                    color: #555;
                    font-size: 18px;
                }
                .usage-example h4 {
                    margin-bottom: 15px;
                    color: #666;
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
                    padding: 20px;
                    border-radius: 5px;
                    margin-bottom: 20px;
                }
                .toc > ul {
                    margin: 0;
                    padding: 0;
                    list-style: none;
                }
                .toc li {
                    margin-bottom: 8px;
                }
                .toc > ul > li {
                    font-weight: bold;
                    margin-bottom: 12px;
                }
                .toc > ul > li > a {
                    color: #0073aa;
                    text-decoration: none;
                    font-size: 16px;
                }
                .toc ul ul {
                    margin: 8px 0 0 20px;
                    padding: 0;
                    list-style: none;
                }
                .toc ul ul li {
                    font-weight: normal;
                    margin-bottom: 4px;
                }
                .toc ul ul a {
                    color: #555;
                    text-decoration: none;
                    font-size: 14px;
                }
                .toc a:hover {
                    text-decoration: underline;
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
                    <?php foreach ($categories as $section_key => $section_data): ?>
                    <li>
                        <a href="#<?php echo esc_attr($section_key); ?>"><?php echo esc_html($section_data['title']); ?></a>
                        <?php if (!empty($section_data['subsections'])): ?>
                        <ul>
                            <?php foreach ($section_data['subsections'] as $subsection_key => $subsection_data): ?>
                            <li><a href="#<?php echo esc_attr($section_key . '-' . $subsection_key); ?>"><?php echo esc_html($subsection_data['title']); ?></a></li>
                            <?php endforeach; ?>
                        </ul>
                        <?php endif; ?>
                    </li>
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
            
            <?php foreach ($categories as $section_key => $section_data): ?>
            <div class="section" id="<?php echo esc_attr($section_key); ?>">
                <h1><?php echo esc_html($section_data['title']); ?></h1>
                <p><?php echo esc_html($section_data['description']); ?></p>
                
                <?php if (!empty($section_data['subsections'])): ?>
                    <?php foreach ($section_data['subsections'] as $subsection_key => $subsection_data): ?>
                    <div class="subsection" id="<?php echo esc_attr($section_key . '-' . $subsection_key); ?>">
                        <h2><?php echo esc_html($subsection_data['title']); ?></h2>
                        <p><?php echo esc_html($subsection_data['description']); ?></p>
                        
                        <?php if (!empty($subsection_data['groups'])): ?>
                            <?php foreach ($subsection_data['groups'] as $group_key => $group_data): ?>
                            <div class="group">
                                <h3><?php echo esc_html($group_data['title']); ?></h3>
                                <p><?php echo esc_html($group_data['description']); ?></p>
                                
                                <?php if (!empty($group_data['labels'])): ?>
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
                                        <?php foreach ($group_data['labels'] as $label_key => $label_value): 
                                            $usage_count = $usage_data[$label_key] ?? 0;
                                            
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
                                            <td class="label-key"><?php echo esc_html($label_key); ?></td>
                                            <td class="label-value"><?php echo esc_html($label_value); ?></td>
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
                                <p>No labels defined in this group.</p>
                                <?php endif; ?>
                            </div>
                            <?php endforeach; ?>
                        <?php else: ?>
                        <p>No label groups defined in this subsection.</p>
                        <?php endif; ?>
                        
                        <h4>Usage Examples</h4>
                        <div class="usage-example">
                            <strong>PHP:</strong>
                            <pre>$label = $labels_frontend->get('<?php echo $section_key . '.' . $subsection_key; ?>.example_key.label', 'Default Value');</pre>
                            
                            <strong>JavaScript:</strong>
                            <pre>const label = labelManager.get('<?php echo $section_key . '.' . $subsection_key; ?>.example_key.label', 'Default Value');</pre>
                            
                            <strong>Template:</strong>
                            <pre>&lt;span data-label="<?php echo $section_key . '.' . $subsection_key; ?>.example_key.label"&gt;Default Value&lt;/span&gt;</pre>
                        </div>
                    </div>
                    <?php endforeach; ?>
                <?php else: ?>
                <p>No subsections defined in this section.</p>
                <?php endif; ?>
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
        foreach ($categories as $section_key => $section_data) {
            $section_anchor = strtolower(str_replace([' ', '_'], '-', $section_key));
            $output .= "- [{$section_data['title']}](#{$section_anchor})\n";
            if (!empty($section_data['subsections'])) {
                foreach ($section_data['subsections'] as $subsection_key => $subsection_data) {
                    $subsection_anchor = strtolower(str_replace([' ', '_'], '-', $section_key . '-' . $subsection_key));
                    $output .= "  - [{$subsection_data['title']}](#{$subsection_anchor})\n";
                }
            }
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
        
        foreach ($categories as $section_key => $section_data) {
            $section_anchor = strtolower(str_replace([' ', '_'], '-', $section_key));
            $output .= "## {$section_data['title']} {#{$section_anchor}}\n\n";
            $output .= "{$section_data['description']}\n\n";
            
            if (!empty($section_data['subsections'])) {
                foreach ($section_data['subsections'] as $subsection_key => $subsection_data) {
                    $subsection_anchor = strtolower(str_replace([' ', '_'], '-', $section_key . '-' . $subsection_key));
                    $output .= "### {$subsection_data['title']} {#{$subsection_anchor}}\n\n";
                    $output .= "{$subsection_data['description']}\n\n";
                    
                    if (!empty($subsection_data['groups'])) {
                        foreach ($subsection_data['groups'] as $group_key => $group_data) {
                            $output .= "#### {$group_data['title']}\n\n";
                            $output .= "{$group_data['description']}\n\n";
                            
                            if (!empty($group_data['labels'])) {
                                $output .= "| Label Key | Value | " . ($include_analytics ? "Usage |" : "") . "\n";
                                $output .= "| --------- | ----- | " . ($include_analytics ? "---- |" : "") . "\n";
                                
                                foreach ($group_data['labels'] as $label_key => $label_value) {
                                    $usage_count = $usage_data[$label_key] ?? 0;
                                    
                                    $output .= "| `{$label_key}` | " . $this->escape_md_table_cell($label_value) . " | ";
                                    if ($include_analytics) {
                                        $output .= "{$usage_count} " . ($usage_count === 1 ? 'use' : 'uses') . " | ";
                                    }
                                    $output .= "\n";
                                }
                                $output .= "\n";
                            } else {
                                $output .= "No labels defined in this group.\n\n";
                            }
                        }
                    } else {
                        $output .= "No label groups defined in this subsection.\n\n";
                    }
                    
                    $output .= "##### Usage Examples\n\n";
                    $output .= "**PHP:**\n\n";
                    $output .= "```php\n";
                    $output .= "\$label = \$labels_frontend->get('{$section_key}.{$subsection_key}.example_key.label', 'Default Value');\n";
                    $output .= "```\n\n";
                    
                    $output .= "**JavaScript:**\n\n";
                    $output .= "```javascript\n";
                    $output .= "const label = labelManager.get('{$section_key}.{$subsection_key}.example_key.label', 'Default Value');\n";
                    $output .= "```\n\n";
                    
                    $output .= "**Template:**\n\n";
                    $output .= "```html\n";
                    $output .= "<span data-label=\"{$section_key}.{$subsection_key}.example_key.label\">Default Value</span>\n";
                    $output .= "```\n\n";
                }
            } else {
                $output .= "No subsections defined in this section.\n\n";
            }
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
        
        foreach ($labels as $section_key => $section_value) {
            // Skip special keys
            if ($section_key === '_version' || $section_key === '_flat' || strpos($section_key, '_') === 0) {
                continue;
            }
            
            if (is_array($section_value)) {
                // Build hierarchical structure that matches admin interface
                $categories[$section_key] = $this->build_hierarchical_section($section_key, $section_value);
            }
        }
        
        return $categories;
    }
    
    /**
     * Build hierarchical section structure matching admin interface
     *
     * @since    3.0.0
     * @access   private
     * @param    string    $section_key     The section key (e.g., 'estimate_management')
     * @param    array     $section_data    The section data
     * @return   array                      Hierarchical section structure
     */
    private function build_hierarchical_section($section_key, $section_data) {
        $section = [
            'title' => $this->get_section_title($section_key),
            'description' => $this->get_section_description($section_key),
            'subsections' => []
        ];
        
        // Process each subsection within the main section
        foreach ($section_data as $subsection_key => $subsection_data) {
            if (is_array($subsection_data)) {
                $subsection = $this->build_subsection($section_key, $subsection_key, $subsection_data);
                if (!empty($subsection)) {
                    $section['subsections'][$subsection_key] = $subsection;
                }
            }
        }
        
        return $section;
    }
    
    /**
     * Build subsection structure (e.g., 'estimate_actions', 'create_new_estimate_form')
     *
     * @since    3.0.0
     * @access   private
     * @param    string    $section_key      The parent section key
     * @param    string    $subsection_key   The subsection key
     * @param    array     $subsection_data  The subsection data
     * @return   array                       Subsection structure
     */
    private function build_subsection($section_key, $subsection_key, $subsection_data) {
        $subsection = [
            'title' => $this->get_subsection_title($subsection_key),
            'description' => $this->get_subsection_description($section_key, $subsection_key),
            'groups' => []
        ];
        
        // Process each group within the subsection (buttons, fields, messages, etc.)
        foreach ($subsection_data as $group_key => $group_data) {
            if (is_array($group_data)) {
                $group = $this->build_group($section_key, $subsection_key, $group_key, $group_data);
                if (!empty($group)) {
                    $subsection['groups'][$group_key] = $group;
                }
            }
        }
        
        return $subsection;
    }
    
    /**
     * Build group structure (e.g., 'buttons', 'fields', 'messages')
     *
     * @since    3.0.0
     * @access   private
     * @param    string    $section_key      The parent section key
     * @param    string    $subsection_key   The parent subsection key
     * @param    string    $group_key        The group key
     * @param    array     $group_data       The group data
     * @return   array                       Group structure
     */
    private function build_group($section_key, $subsection_key, $group_key, $group_data) {
        $group = [
            'title' => $this->get_group_title($group_key),
            'description' => $this->get_group_description($group_key),
            'labels' => []
        ];
        
        // Extract actual label values from this group
        $base_path = $section_key . '.' . $subsection_key . '.' . $group_key;
        $this->extract_labels_recursive($base_path, $group_data, $group['labels']);
        
        return $group;
    }
    
    /**
     * Extract label values recursively from hierarchical structure
     *
     * @since    3.0.0
     * @access   private
     * @param    string    $base_path      Base path for this level
     * @param    array     $data           Data to extract from
     * @param    array     &$flat_labels   Reference to flat labels array
     */
    private function extract_labels_recursive($base_path, $data, &$flat_labels) {
        foreach ($data as $key => $value) {
            if (is_array($value)) {
                // Check if this contains actual label values
                if ($this->is_label_definition($value)) {
                    // This is a label definition, extract the actual values
                    $label_path = $base_path . '.' . $key;
                    
                    if (isset($value['label'])) {
                        $flat_labels[$label_path . '.label'] = $value['label'];
                    }
                    if (isset($value['text'])) {
                        $flat_labels[$label_path . '.text'] = $value['text'];
                    }
                    if (isset($value['placeholder'])) {
                        $flat_labels[$label_path . '.placeholder'] = $value['placeholder'];
                    }
                    if (isset($value['default_option'])) {
                        $flat_labels[$label_path . '.default_option'] = $value['default_option'];
                    }
                    
                    // Handle validation messages
                    if (isset($value['validation']) && is_array($value['validation'])) {
                        foreach ($value['validation'] as $validation_key => $validation_value) {
                            $flat_labels[$label_path . '.validation.' . $validation_key] = $validation_value;
                        }
                    }
                } else {
                    // This is a nested category, recurse deeper
                    $this->extract_labels_recursive($base_path . '.' . $key, $value, $flat_labels);
                }
            } else {
                // This is a direct value (like in PDF section)
                $flat_labels[$base_path . '.' . $key] = $value;
            }
        }
    }
    
    /**
     * Check if an array represents a label definition
     *
     * @since    3.0.0
     * @access   private
     * @param    array     $array   Array to check
     * @return   bool               True if this looks like a label definition
     */
    private function is_label_definition($array) {
        // Label definitions contain keys like 'label', 'text', 'placeholder', 'validation', 'default_option'
        // Also check for 'description' and 'usage' which indicate this is a complete label definition with metadata
        $label_keys = ['label', 'text', 'placeholder', 'validation', 'default_option', 'description', 'usage'];
        return !empty(array_intersect(array_keys($array), $label_keys));
    }
    
    /**
     * Get section title
     *
     * @since    3.0.0
     * @access   private
     * @param    string    $section_key   The section key
     * @return   string                   Formatted section title
     */
    private function get_section_title($section_key) {
        $section_titles = [
            'estimate_management' => 'Estimate Management',
            'room_management' => 'Room Management', 
            'product_management' => 'Product Management',
            'customer_details' => 'Customer Details',
            'common_ui' => 'Common UI',
            'pdf' => 'PDF Generation'
        ];
        
        return $section_titles[$section_key] ?? ucwords(str_replace('_', ' ', $section_key));
    }
    
    /**
     * Get section description
     *
     * @since    3.0.0
     * @access   private
     * @param    string    $section_key   The section key
     * @return   string                   Section description
     */
    private function get_section_description($section_key) {
        $descriptions = [
            'estimate_management' => 'Labels related to creating, managing, and working with estimates.',
            'room_management' => 'Labels for adding, selecting, and managing rooms within estimates.',
            'product_management' => 'Labels for adding, removing, and managing products within rooms.',
            'customer_details' => 'Labels for collecting and managing customer information.',
            'common_ui' => 'Generic UI labels used throughout the application.',
            'pdf' => 'Labels and content used in PDF generation and document formatting.'
        ];
        
        return $descriptions[$section_key] ?? 'Labels for ' . ucwords(str_replace('_', ' ', $section_key)) . '.';
    }
    
    /**
     * Get subsection title
     *
     * @since    3.0.0
     * @access   private
     * @param    string    $subsection_key   The subsection key
     * @return   string                      Formatted subsection title
     */
    private function get_subsection_title($subsection_key) {
        $subsection_titles = [
            'estimate_actions' => 'Estimate Actions',
            'create_new_estimate_form' => 'Create New Estimate Form',
            'estimate_selection_form' => 'Estimate Selection Form',
            'add_new_room_form' => 'Add New Room Form',
            'room_selection_form' => 'Room Selection Form',
            'product_actions' => 'Product Actions',
            'similar_products' => 'Similar Products',
            'product_additions' => 'Product Additions',
            'customer_details_form' => 'Customer Details Form',
            'general_actions' => 'General Actions',
            'confirmation_dialogs' => 'Confirmation Dialogs',
            'product_dialogs' => 'Product Dialogs',
            'loading_states' => 'Loading States',
            'error_messages' => 'Error Messages',
            'empty_states' => 'Empty States',
            'success_messages' => 'Success Messages'
        ];
        
        return $subsection_titles[$subsection_key] ?? ucwords(str_replace('_', ' ', $subsection_key));
    }
    
    /**
     * Get subsection description
     *
     * @since    3.0.0
     * @access   private
     * @param    string    $section_key      The parent section key
     * @param    string    $subsection_key   The subsection key
     * @return   string                      Subsection description
     */
    private function get_subsection_description($section_key, $subsection_key) {
        $key = $section_key . '.' . $subsection_key;
        $descriptions = [
            'estimate_management.estimate_actions' => 'Action buttons and controls for managing estimates (save, print, delete, etc.).',
            'estimate_management.create_new_estimate_form' => 'Form elements for creating new estimates, including field labels and validation messages.',
            'estimate_management.estimate_selection_form' => 'Form elements for selecting existing estimates from a list.',
            'estimate_management.empty_states' => 'Messages displayed when no estimates are available.',
            'estimate_management.success_messages' => 'Success messages for estimate-related operations.',
            
            'room_management.add_new_room_form' => 'Form elements for adding new rooms to estimates, including field labels and validation.',
            'room_management.room_selection_form' => 'Form elements for selecting rooms within an estimate.',
            'room_management.empty_states' => 'Messages displayed when no rooms are available in an estimate.',
            'room_management.success_messages' => 'Success messages for room-related operations.',
            
            'product_management.product_actions' => 'Action buttons for managing products within rooms (add, remove, view details, etc.).',
            'product_management.similar_products' => 'Labels and messages for the similar products feature.',
            'product_management.product_additions' => 'Labels and messages for additional product options and accessories.',
            'product_management.empty_states' => 'Messages displayed when no products are in a room.',
            'product_management.success_messages' => 'Success messages for product-related operations.',
            
            'customer_details.customer_details_form' => 'Form elements for collecting customer information, including validation messages.',
            
            'common_ui.general_actions' => 'Generic action buttons used throughout the application (save, cancel, close, etc.).',
            'common_ui.confirmation_dialogs' => 'Standard confirmation dialog elements and messages.',
            'common_ui.product_dialogs' => 'Specialized dialogs for product-related confirmations and notifications.',
            'common_ui.loading_states' => 'Loading messages and indicators.',
            'common_ui.error_messages' => 'Generic error messages used throughout the application.'
        ];
        
        return $descriptions[$key] ?? ucwords(str_replace('_', ' ', $subsection_key)) . ' labels.';
    }
    
    /**
     * Get group title
     *
     * @since    3.0.0
     * @access   private
     * @param    string    $group_key   The group key
     * @return   string                 Formatted group title
     */
    private function get_group_title($group_key) {
        $group_titles = [
            'buttons' => 'Buttons',
            'fields' => 'Fields',
            'messages' => 'Messages',
            'headings' => 'Headings',
            'labels' => 'Labels',
            'heading' => 'Heading',
            'validation' => 'Validation'
        ];
        
        return $group_titles[$group_key] ?? ucwords(str_replace('_', ' ', $group_key));
    }
    
    /**
     * Get group description
     *
     * @since    3.0.0
     * @access   private
     * @param    string    $group_key   The group key
     * @return   string                 Group description
     */
    private function get_group_description($group_key) {
        $descriptions = [
            'buttons' => 'Button labels and text.',
            'fields' => 'Form field labels, placeholders, help text, and validation messages.',
            'messages' => 'Messages, notifications, and user feedback text.',
            'headings' => 'Section headings and titles.',
            'labels' => 'Descriptive labels and text.',
            'heading' => 'Section heading text.',
            'validation' => 'Form validation messages and error text.'
        ];
        
        return $descriptions[$group_key] ?? ucwords(str_replace('_', ' ', $group_key)) . ' labels.';
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
            // Legacy categories (for backward compatibility)
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
            'success' => 'Success messages shown to users.',
            
            // New hierarchical categories
            'estimate_management.estimate_actions' => 'Action buttons and controls for managing estimates (save, print, delete, etc.).',
            'estimate_management.create_new_estimate_form' => 'Form elements for creating new estimates, including field labels and validation messages.',
            'estimate_management.estimate_selection_form' => 'Form elements for selecting existing estimates from a list.',
            'estimate_management.empty_states' => 'Messages displayed when no estimates are available.',
            'estimate_management.success_messages' => 'Success messages for estimate-related operations.',
            
            'room_management.add_new_room_form' => 'Form elements for adding new rooms to estimates, including field labels and validation.',
            'room_management.room_selection_form' => 'Form elements for selecting rooms within an estimate.',
            'room_management.empty_states' => 'Messages displayed when no rooms are available in an estimate.',
            'room_management.success_messages' => 'Success messages for room-related operations.',
            
            'product_management.product_actions' => 'Action buttons for managing products within rooms (add, remove, view details, etc.).',
            'product_management.similar_products' => 'Labels and messages for the similar products feature.',
            'product_management.product_additions' => 'Labels and messages for additional product options and accessories.',
            'product_management.empty_states' => 'Messages displayed when no products are in a room.',
            'product_management.success_messages' => 'Success messages for product-related operations.',
            
            'customer_details.customer_details_form' => 'Form elements for collecting customer information, including validation messages.',
            
            'common_ui.general_actions' => 'Generic action buttons used throughout the application (save, cancel, close, etc.).',
            'common_ui.confirmation_dialogs' => 'Standard confirmation dialog elements and messages.',
            'common_ui.product_dialogs' => 'Specialized dialogs for product-related confirmations and notifications.',
            'common_ui.loading_states' => 'Loading messages and indicators.',
            'common_ui.error_messages' => 'Generic error messages used throughout the application.',
            
            'pdf' => 'Labels and content specific to PDF generation and document formatting.'
        ];
        
        return $descriptions[$category] ?? 'Labels for ' . ucfirst(str_replace(['_', '.'], [' ', ' - '], $category)) . '.';
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