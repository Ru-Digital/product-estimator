<div class="wrap">
    <h1><?php echo esc_html__('Label Usage Analytics', 'product-estimator'); ?></h1>
    
    <div class="notice notice-info">
        <p>
            <?php echo esc_html__('Label analytics helps you understand how your labels are being used throughout the application.', 'product-estimator'); ?>
            <?php echo esc_html__('This data can be used to optimize performance and improve the user experience.', 'product-estimator'); ?>
        </p>
    </div>
    
    <div class="analytics-dashboard">
        <div class="analytics-actions">
            <a href="<?php echo esc_url(wp_nonce_url(add_query_arg(['page' => 'product-estimator-label-analytics', 'export' => 'csv'], admin_url('admin.php')), 'export_label_analytics_csv')); ?>" class="button">
                <?php echo esc_html__('Export to CSV', 'product-estimator'); ?>
            </a>
            <button id="pe-reset-analytics" class="button button-secondary">
                <?php echo esc_html__('Reset Analytics Data', 'product-estimator'); ?>
            </button>
        </div>
        
        <div class="analytics-summary">
            <div class="analytics-card">
                <h3><?php echo esc_html__('Summary', 'product-estimator'); ?></h3>
                <ul>
                    <li><strong><?php echo esc_html__('Total Tracked Labels', 'product-estimator'); ?>:</strong> <?php echo esc_html($report['total_tracked']); ?></li>
                    <li><strong><?php echo esc_html__('Unused Labels', 'product-estimator'); ?>:</strong> <?php echo esc_html($report['unused_count']); ?></li>
                    <li><strong><?php echo esc_html__('Last Reset', 'product-estimator'); ?>:</strong> <?php echo esc_html($report['last_reset'] ? date_i18n(get_option('date_format') . ' ' . get_option('time_format'), strtotime($report['last_reset'])) : __('Never', 'product-estimator')); ?></li>
                    <li><strong><?php echo esc_html__('Last Update', 'product-estimator'); ?>:</strong> <?php echo esc_html(date_i18n(get_option('date_format') . ' ' . get_option('time_format'), strtotime($report['last_updated']))); ?></li>
                </ul>
            </div>
        </div>
        
        <div class="analytics-charts">
            <div class="chart-container">
                <h3><?php echo esc_html__('Most Used Labels', 'product-estimator'); ?></h3>
                <canvas id="most-used-chart" width="600" height="300"></canvas>
            </div>
            
            <div class="chart-container">
                <h3><?php echo esc_html__('Usage by Category', 'product-estimator'); ?></h3>
                <canvas id="category-chart" width="400" height="300"></canvas>
            </div>
        </div>
        
        <div class="analytics-tables">
            <div class="table-container">
                <h3><?php echo esc_html__('Top 20 Most Used Labels', 'product-estimator'); ?></h3>
                <?php if (!empty($most_used)): ?>
                <table class="widefat striped">
                    <thead>
                        <tr>
                            <th><?php echo esc_html__('Label Key', 'product-estimator'); ?></th>
                            <th><?php echo esc_html__('Category', 'product-estimator'); ?></th>
                            <th><?php echo esc_html__('Usage Count', 'product-estimator'); ?></th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($most_used as $key => $count): ?>
                            <tr>
                                <td><?php echo esc_html($key); ?></td>
                                <td><?php echo esc_html($this->get_label_category($key)); ?></td>
                                <td><?php echo esc_html($count); ?></td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
                <?php else: ?>
                <div class="notice notice-info inline">
                    <p><?php echo esc_html__('No label usage data has been collected yet. Enable the Label Analytics feature switch and use the application to start collecting data.', 'product-estimator'); ?></p>
                </div>
                <?php endif; ?>
            </div>
            
            <div class="table-container">
                <h3><?php echo esc_html__('Unused Labels', 'product-estimator'); ?></h3>
                <p><?php echo esc_html__('These labels are defined but not tracked in usage analytics. They might be unused or have zero usage since analytics was enabled.', 'product-estimator'); ?></p>
                
                <?php if (!empty($unused_labels)): ?>
                    <?php if (count($unused_labels) > 50): ?>
                        <p class="notice notice-warning">
                            <?php printf(esc_html__('Showing 50 of %d unused labels. Export to CSV for complete list.', 'product-estimator'), count($unused_labels)); ?>
                        </p>
                    <?php endif; ?>
                    
                    <table class="widefat striped">
                        <thead>
                            <tr>
                                <th><?php echo esc_html__('Label Key', 'product-estimator'); ?></th>
                                <th><?php echo esc_html__('Category', 'product-estimator'); ?></th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach (array_slice($unused_labels, 0, 50) as $key): ?>
                                <tr>
                                    <td><?php echo esc_html($key); ?></td>
                                    <td><?php echo esc_html($this->get_label_category($key)); ?></td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                <?php else: ?>
                    <div class="notice notice-info inline">
                        <p><?php echo esc_html__('No unused labels detected yet or all labels are already being tracked. Enable the Label Analytics feature switch and use the application to collect more data.', 'product-estimator'); ?></p>
                    </div>
                <?php endif; ?>
            </div>
        </div>
    </div>
</div>

<style>
.analytics-dashboard {
    margin-top: 20px;
    overflow: hidden; /* Prevent any scrolling issues */
}

.analytics-actions {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 20px;
    gap: 10px;
}

.analytics-summary {
    display: flex;
    margin-bottom: 20px;
}

.analytics-card {
    background: #fff;
    border: 1px solid #ccd0d4;
    box-shadow: 0 1px 1px rgba(0,0,0,0.04);
    padding: 15px;
    flex: 1;
}

.analytics-charts {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    margin-bottom: 20px;
}

.chart-container {
    background: #fff;
    border: 1px solid #ccd0d4;
    box-shadow: 0 1px 1px rgba(0,0,0,0.04);
    padding: 15px;
    flex: 1;
    min-width: 300px;
    position: relative;
    height: 350px; /* Fixed height for all chart containers */
    overflow: hidden; /* Prevent overflow */
    display: flex;
    flex-direction: column;
}

.analytics-tables {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
}

.table-container {
    background: #fff;
    border: 1px solid #ccd0d4;
    box-shadow: 0 1px 1px rgba(0,0,0,0.04);
    padding: 15px;
    flex: 1;
    min-width: 300px;
}

/* Style for the empty data messages */
.no-data-message {
    text-align: center;
    padding: 20px;
    color: #666;
    font-style: italic;
}

/* Make sure tables don't overflow their containers */
.table-container table {
    width: 100%;
    table-layout: fixed;
    word-wrap: break-word;
}

/* Responsive adjustments for smaller screens */
@media screen and (max-width: 782px) {
    .analytics-charts, 
    .analytics-tables {
        flex-direction: column;
    }
    
    .chart-container,
    .table-container {
        margin-bottom: 20px;
    }
}
</style>

<script>
jQuery(document).ready(function($) {
    // Most used labels chart
    <?php 
    // Make sure we have data
    $has_most_used_data = !empty($most_used);
    $chart_labels = $has_most_used_data ? array_keys(array_slice($most_used, 0, 10, true)) : [];
    $chart_data = $has_most_used_data ? array_values(array_slice($most_used, 0, 10, true)) : [];
    ?>
    
    // Only create chart if we have data
    <?php if ($has_most_used_data): ?>
    try {
        var mostUsedCtx = document.getElementById('most-used-chart').getContext('2d');
        var mostUsedChart = new Chart(mostUsedCtx, {
            type: 'bar',
            data: {
                labels: <?php echo json_encode($chart_labels); ?>,
                datasets: [{
                    label: '<?php echo esc_js(__('Usage Count', 'product-estimator')); ?>',
                    data: <?php echo json_encode($chart_data); ?>,
                    backgroundColor: <?php echo json_encode(array_slice($colors, 0, 10)); ?>,
                    borderColor: <?php echo json_encode(array_map(function($color) {
                        return str_replace('0.5', '1', $color);
                    }, array_slice($colors, 0, 10))); ?>,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false, // Changed to false for better container sizing
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    } catch (e) {
        console.error('Error creating most used chart:', e);
        $('#most-used-chart').parent().append('<p class="no-data-message"><?php echo esc_js(__('Error creating chart. Please try again later.', 'product-estimator')); ?></p>');
        $('#most-used-chart').hide();
    }
    <?php else: ?>
    // If no data, show a message
    $('#most-used-chart').parent().append('<p class="no-data-message"><?php echo esc_js(__('No usage data available yet. Enable label analytics and use the application to collect data.', 'product-estimator')); ?></p>');
    $('#most-used-chart').hide();
    <?php endif; ?>

    // Usage by category chart
    try {
        var categoryData = <?php 
            // Make sure we have data before creating the chart
            $category_data = !empty($report['most_used']) ? $this->get_usage_by_category($report['most_used']) : [];
            echo json_encode($category_data ?: new stdClass()); // Ensure it's at least an empty object
        ?>;
        
        // Only create chart if we have data
        if (Object.keys(categoryData).length > 0) {
            var categoryCtx = document.getElementById('category-chart').getContext('2d');
            var categoryChart = new Chart(categoryCtx, {
                type: 'pie',
                data: {
                    labels: Object.keys(categoryData),
                    datasets: [{
                        data: Object.values(categoryData),
                        backgroundColor: <?php echo json_encode($colors); ?>,
                        borderColor: <?php echo json_encode(array_map(function($color) {
                            return str_replace('0.5', '1', $color);
                        }, $colors)); ?>,
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false, // Changed to false for better container sizing
                    plugins: {
                        legend: {
                            position: 'right',
                        }
                    }
                }
            });
        } else {
            // If no data, display a message
            $('#category-chart').parent().append('<p class="no-data-message"><?php echo esc_js(__('No category data available yet. Enable label analytics and use the application to collect data.', 'product-estimator')); ?></p>');
            $('#category-chart').hide();
        }
    } catch (e) {
        console.error('Error creating category chart:', e);
        $('#category-chart').parent().append('<p class="no-data-message"><?php echo esc_js(__('Error creating chart. Please try again later.', 'product-estimator')); ?></p>');
        $('#category-chart').hide();
    }

    // Reset analytics button
    $('#pe-reset-analytics').click(function() {
        if (confirm('<?php echo esc_js(__('Are you sure you want to reset all analytics data? This cannot be undone.', 'product-estimator')); ?>')) {
            $.ajax({
                url: ajaxurl,
                type: 'POST',
                data: {
                    action: 'pe_reset_label_analytics',
                    nonce: '<?php echo wp_create_nonce('product_estimator_label_analytics_nonce'); ?>'
                },
                success: function(response) {
                    if (response.success) {
                        alert(response.data.message);
                        location.reload();
                    } else {
                        alert(response.data.message);
                    }
                }
            });
        }
    });
});
</script>