<div class="wrap">
    <h1><?php echo esc_html__('Label Migration Tool', 'product-estimator'); ?></h1>
    
    <div class="notice notice-info">
        <p>
            <?php echo esc_html__('This tool helps you add new labels to the system and manage label categories.', 'product-estimator'); ?>
            <?php echo esc_html__('Use this when integrating new features or extending existing functionality.', 'product-estimator'); ?>
        </p>
    </div>
    
    <div id="pe-label-tool-tabs" class="nav-tab-wrapper">
        <a href="#add-label" class="nav-tab nav-tab-active"><?php echo esc_html__('Add New Label', 'product-estimator'); ?></a>
        <a href="#create-category" class="nav-tab"><?php echo esc_html__('Create Category', 'product-estimator'); ?></a>
        <a href="#bulk-import" class="nav-tab"><?php echo esc_html__('Bulk Import', 'product-estimator'); ?></a>
    </div>
    
    <div id="pe-label-tool-content">
        <!-- Add New Label Tab -->
        <div id="add-label" class="tab-content active">
            <div class="card">
                <h2><?php echo esc_html__('Add New Label', 'product-estimator'); ?></h2>
                
                <form id="pe-add-label-form">
                    <?php wp_nonce_field('pe_label_migration_tool', 'pe_label_migration_nonce'); ?>
                    
                    <table class="form-table">
                        <tr>
                            <th scope="row"><?php echo esc_html__('Category', 'product-estimator'); ?></th>
                            <td>
                                <select name="pe_label_category" id="pe-label-category" required>
                                    <option value=""><?php echo esc_html__('Select a category', 'product-estimator'); ?></option>
                                    <?php foreach ($categories as $cat_key => $cat_data): ?>
                                    <option value="<?php echo esc_attr($cat_key); ?>">
                                        <?php echo esc_html($cat_data['title']); ?> (<?php echo esc_html($cat_data['count']); ?>)
                                    </option>
                                    <?php endforeach; ?>
                                </select>
                                <p class="description"><?php echo esc_html__('Select the category where this label belongs.', 'product-estimator'); ?></p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row"><?php echo esc_html__('Key', 'product-estimator'); ?></th>
                            <td>
                                <input type="text" name="pe_label_key" id="pe-label-key" required 
                                       class="regular-text" pattern="^[a-z][a-z0-9_]*$"
                                       placeholder="save_button">
                                <p class="description"><?php echo esc_html__('The unique key for this label (snake_case).', 'product-estimator'); ?></p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row"><?php echo esc_html__('Value', 'product-estimator'); ?></th>
                            <td>
                                <textarea name="pe_label_value" id="pe-label-value" required
                                          class="large-text" rows="3"
                                          placeholder="Save Button"></textarea>
                                <p class="description"><?php echo esc_html__('The text content of this label.', 'product-estimator'); ?></p>
                            </td>
                        </tr>
                    </table>
                    
                    <div class="submit-wrapper">
                        <input type="submit" class="button button-primary" value="<?php echo esc_attr__('Add Label', 'product-estimator'); ?>">
                        <span class="spinner"></span>
                    </div>
                </form>
                
                <div id="pe-add-label-result" class="tool-result" style="display: none;"></div>
                
                <div id="pe-usage-examples" class="usage-examples" style="display: none;">
                    <h3><?php echo esc_html__('Usage Examples', 'product-estimator'); ?></h3>
                    <div class="example-code">
                        <h4><?php echo esc_html__('PHP', 'product-estimator'); ?></h4>
                        <pre id="pe-php-example"></pre>
                        
                        <h4><?php echo esc_html__('JavaScript', 'product-estimator'); ?></h4>
                        <pre id="pe-js-example"></pre>
                        
                        <h4><?php echo esc_html__('Template', 'product-estimator'); ?></h4>
                        <pre id="pe-template-example"></pre>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Create Category Tab -->
        <div id="create-category" class="tab-content">
            <div class="card">
                <h2><?php echo esc_html__('Create New Category', 'product-estimator'); ?></h2>
                
                <form id="pe-create-category-form">
                    <?php wp_nonce_field('pe_label_migration_tool', 'pe_category_migration_nonce'); ?>
                    
                    <table class="form-table">
                        <tr>
                            <th scope="row"><?php echo esc_html__('Category Name', 'product-estimator'); ?></th>
                            <td>
                                <input type="text" name="pe_category_name" id="pe-category-name" required 
                                       class="regular-text" pattern="^[a-z][a-z0-9_]*$"
                                       placeholder="new_category">
                                <p class="description"><?php echo esc_html__('The name for the new category (snake_case).', 'product-estimator'); ?></p>
                            </td>
                        </tr>
                    </table>
                    
                    <div class="submit-wrapper">
                        <input type="submit" class="button button-primary" value="<?php echo esc_attr__('Create Category', 'product-estimator'); ?>">
                        <span class="spinner"></span>
                    </div>
                </form>
                
                <div id="pe-create-category-result" class="tool-result" style="display: none;"></div>
            </div>
            
            <div class="card" style="margin-top: 20px;">
                <h2><?php echo esc_html__('Existing Categories', 'product-estimator'); ?></h2>
                
                <table class="widefat striped">
                    <thead>
                        <tr>
                            <th><?php echo esc_html__('Category', 'product-estimator'); ?></th>
                            <th><?php echo esc_html__('Title', 'product-estimator'); ?></th>
                            <th><?php echo esc_html__('Label Count', 'product-estimator'); ?></th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($categories as $cat_key => $cat_data): ?>
                        <tr>
                            <td><code><?php echo esc_html($cat_key); ?></code></td>
                            <td><?php echo esc_html($cat_data['title']); ?></td>
                            <td><?php echo esc_html($cat_data['count']); ?></td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- Bulk Import Tab -->
        <div id="bulk-import" class="tab-content">
            <div class="card">
                <h2><?php echo esc_html__('Bulk Import Labels', 'product-estimator'); ?></h2>
                
                <p><?php echo esc_html__('This feature allows you to import multiple labels at once using JSON format.', 'product-estimator'); ?></p>
                
                <form id="pe-bulk-import-form">
                    <?php wp_nonce_field('pe_label_migration_tool', 'pe_bulk_import_nonce'); ?>
                    
                    <table class="form-table">
                        <tr>
                            <th scope="row"><?php echo esc_html__('Import Format', 'product-estimator'); ?></th>
                            <td>
                                <fieldset>
                                    <label>
                                        <input type="radio" name="pe_import_format" value="json" checked>
                                        <?php echo esc_html__('JSON', 'product-estimator'); ?>
                                    </label>
                                </fieldset>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row"><?php echo esc_html__('Import Data', 'product-estimator'); ?></th>
                            <td>
                                <textarea name="pe_import_data" id="pe-import-data" required
                                          class="large-text code" rows="10"
                                          placeholder='{"buttons": {"new_button": "New Button Text"}, "messages": {"new_message": "New message text"}}'></textarea>
                                <p class="description"><?php echo esc_html__('Enter label data in JSON format. Example:', 'product-estimator'); ?></p>
                                <pre>{
  "buttons": {
    "new_button": "New Button Text",
    "another_button": "Another Button"
  },
  "messages": {
    "new_message": "This is a new message"
  }
}</pre>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row"><?php echo esc_html__('Import Options', 'product-estimator'); ?></th>
                            <td>
                                <fieldset>
                                    <label>
                                        <input type="checkbox" name="pe_merge_existing" checked>
                                        <?php echo esc_html__('Merge with existing labels (overwrite duplicates)', 'product-estimator'); ?>
                                    </label>
                                </fieldset>
                            </td>
                        </tr>
                    </table>
                    
                    <div class="submit-wrapper">
                        <input type="submit" class="button button-primary" value="<?php echo esc_attr__('Import Labels', 'product-estimator'); ?>">
                        <span class="spinner"></span>
                    </div>
                </form>
                
                <div id="pe-bulk-import-result" class="tool-result" style="display: none;"></div>
            </div>
            
            <div class="card" style="margin-top: 20px;">
                <h2><?php echo esc_html__('CLI Alternative', 'product-estimator'); ?></h2>
                
                <p><?php echo esc_html__('You can also use the command-line tool to add new labels:', 'product-estimator'); ?></p>
                
                <pre style="background: #f5f5f5; padding: 15px; border-radius: 3px;">php <?php echo esc_html(PRODUCT_ESTIMATOR_PLUGIN_DIR); ?>bin/add-new-label.php --category=buttons --key=new_button --value="New Button Text"</pre>
            </div>
        </div>
    </div>
</div>

<style>
/* Fix tab display */
.tab-content {
    display: none;
    padding: 15px 0;
}

.tab-content.active {
    display: block !important;
}

.submit-wrapper {
    margin-top: 20px;
}

.submit-wrapper .spinner {
    float: none;
    margin-top: 4px;
    margin-left: 10px;
}

.tool-result {
    margin-top: 20px;
    padding: 15px;
    background: #f8f8f8;
    border-left: 4px solid #46b450;
}

.tool-result.error {
    border-left-color: #dc3232;
}

.usage-examples {
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid #ddd;
}

.example-code pre {
    background: #f5f5f5;
    padding: 15px;
    border-radius: 3px;
    font-family: monospace;
    margin-bottom: 20px;
    overflow: auto;
}
</style>

<script>
jQuery(document).ready(function($) {
    // Initialize tabs - clean & simple approach
    function initTabs() {
        console.log("Initializing tabs");
        
        // First make sure all tab content is hidden and tabs are inactive
        $('.tab-content').hide().removeClass('active');
        $('#pe-label-tool-tabs a').removeClass('nav-tab-active');
        
        // Get the active tab from URL or default to first tab
        let activeTab = '#add-label'; // Default tab
        
        // Check URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const tabParam = urlParams.get('tab');
        
        if (tabParam && $('#' + tabParam).length) {
            activeTab = '#' + tabParam;
            console.log("Found tab in URL:", activeTab);
        }
        
        // Activate the tab
        console.log("Activating tab:", activeTab);
        $(activeTab).show().addClass('active');
        $('#pe-label-tool-tabs a[href="' + activeTab + '"]').addClass('nav-tab-active');
    }
    
    // Tab click handler
    $('#pe-label-tool-tabs a').on('click', function(e) {
        e.preventDefault();
        const targetTab = $(this).attr('href');
        
        console.log("Tab clicked:", targetTab);
        
        // Don't do anything if clicking the active tab
        if ($(this).hasClass('nav-tab-active')) {
            console.log("Already active, skipping");
            return;
        }
        
        // Hide all tabs and remove active class
        $('.tab-content').hide().removeClass('active');
        $('#pe-label-tool-tabs a').removeClass('nav-tab-active');
        
        // Show the selected tab and add active class
        console.log("Showing tab:", targetTab);
        $(targetTab).show().addClass('active');
        $(this).addClass('nav-tab-active');
        
        // Update URL
        const tabName = targetTab.substring(1); // remove the # character
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set('tab', tabName);
        history.pushState({}, '', newUrl.toString());
    });
    
    // Initialize on page load with a slight delay to ensure DOM is ready
    setTimeout(initTabs, 100);
    
    // Add label form submission
    $('#pe-add-label-form').on('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const category = $('#pe-label-category').val();
        const key = $('#pe-label-key').val();
        const value = $('#pe-label-value').val();
        
        // Validate
        if (!category || !key || !value) {
            showResult('#pe-add-label-result', 'All fields are required.', true);
            return;
        }
        
        // Show spinner
        $('#pe-add-label-form .spinner').addClass('is-active');
        
        // Send AJAX request
        $.ajax({
            url: ajaxurl,
            type: 'POST',
            data: {
                action: 'pe_add_new_label',
                nonce: $('#pe_label_migration_nonce').val(),
                category: category,
                key: key,
                value: value
            },
            success: function(response) {
                if (response.success) {
                    showResult('#pe-add-label-result', response.data.message);
                    
                    // Show usage examples
                    $('#pe-usage-examples').show();
                    $('#pe-php-example').text(`$label = $labels_frontend->get('${response.data.category}.${response.data.key}');`);
                    $('#pe-js-example').text(`const label = labelManager.get('${response.data.category}.${response.data.key}');`);
                    $('#pe-template-example').text(`<span data-label="${response.data.category}.${response.data.key}">${response.data.value}</span>`);
                } else {
                    showResult('#pe-add-label-result', response.data.message, true);
                }
            },
            error: function() {
                showResult('#pe-add-label-result', 'An error occurred. Please try again.', true);
            },
            complete: function() {
                $('#pe-add-label-form .spinner').removeClass('is-active');
            }
        });
    });
    
    // Create category form submission
    $('#pe-create-category-form').on('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const category = $('#pe-category-name').val();
        
        // Validate
        if (!category) {
            showResult('#pe-create-category-result', 'Category name is required.', true);
            return;
        }
        
        // Show spinner
        $('#pe-create-category-form .spinner').addClass('is-active');
        
        // Send AJAX request
        $.ajax({
            url: ajaxurl,
            type: 'POST',
            data: {
                action: 'pe_create_label_category',
                nonce: $('#pe_category_migration_nonce').val(),
                category: category
            },
            success: function(response) {
                if (response.success) {
                    showResult('#pe-create-category-result', response.data.message);
                    
                    // Reload page after short delay to update category list
                    setTimeout(function() {
                        location.reload();
                    }, 1500);
                } else {
                    showResult('#pe-create-category-result', response.data.message, true);
                }
            },
            error: function() {
                showResult('#pe-create-category-result', 'An error occurred. Please try again.', true);
            },
            complete: function() {
                $('#pe-create-category-form .spinner').removeClass('is-active');
            }
        });
    });
    
    // Bulk import form submission
    $('#pe-bulk-import-form').on('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const importData = $('#pe-import-data').val();
        const mergeExisting = $('input[name="pe_merge_existing"]').is(':checked');
        
        // Validate
        if (!importData) {
            showResult('#pe-bulk-import-result', 'Import data is required.', true);
            return;
        }
        
        // Validate JSON
        try {
            JSON.parse(importData);
        } catch (error) {
            showResult('#pe-bulk-import-result', 'Invalid JSON format: ' + error.message, true);
            return;
        }
        
        // Show spinner
        $('#pe-bulk-import-form .spinner').addClass('is-active');
        
        // Send AJAX request
        $.ajax({
            url: ajaxurl,
            type: 'POST',
            data: {
                action: 'pe_bulk_import_labels',
                nonce: $('#pe_bulk_import_nonce').val(),
                data: importData,
                merge_existing: mergeExisting ? 1 : 0
            },
            success: function(response) {
                if (response.success) {
                    showResult('#pe-bulk-import-result', response.data.message);
                } else {
                    showResult('#pe-bulk-import-result', response.data.message, true);
                }
            },
            error: function() {
                showResult('#pe-bulk-import-result', 'An error occurred. Please try again.', true);
            },
            complete: function() {
                $('#pe-bulk-import-form .spinner').removeClass('is-active');
            }
        });
    });
    
    // Helper function to show result
    function showResult(selector, message, isError = false) {
        const resultElement = $(selector);
        resultElement.html(message);
        
        if (isError) {
            resultElement.addClass('error');
        } else {
            resultElement.removeClass('error');
        }
        
        resultElement.show();
    }
});
</script>