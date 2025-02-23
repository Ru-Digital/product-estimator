(function($) {
    'use strict';

    /**
     * Admin JavaScript functionality
     */
    class ProductEstimatorAdmin {
        /**
         * Initialize the admin functionality
         */
        constructor() {
            this.initializeVariables();
            this.bindEvents();
            this.initializeTabs();
        }

        /**
         * Initialize class variables
         */
        initializeVariables() {
            this.formChanged = false;
            this.currentTab = 'settings';
            this.reportData = null;
            this.chart = null;
        }

        /**
         * Bind event listeners
         */
        bindEvents() {
            // Tab switching
            $('.nav-tab-wrapper').on('click', '.nav-tab', this.handleTabClick.bind(this));

            // Form change tracking
            $('.product-estimator-form').on('change', 'input, select, textarea', () => {
                this.formChanged = true;
            });

            // Form submission
            $('.product-estimator-form').on('submit', this.handleFormSubmit.bind(this));

            // Report generation
            $('#generate_report').on('click', this.handleReportGeneration.bind(this));

            // Export functionality
            $('#export_calculations').on('click', this.handleExport.bind(this));

            // Real-time validation
            this.initializeValidation();

            // Window beforeunload
            $(window).on('beforeunload', this.handleBeforeUnload.bind(this));
        }

        /**
         * Initialize tab functionality
         */
        initializeTabs() {
            $('.tab-content').not('#settings').hide();

            // Check for URL parameters
            const urlParams = new URLSearchParams(window.location.search);
            const tab = urlParams.get('tab');

            if (tab) {
                this.switchTab(tab);
            }
        }

        /**
         * Handle tab clicks
         * @param {Event} e - Click event
         */
        handleTabClick(e) {
            e.preventDefault();
            const tab = $(e.currentTarget).data('tab');

            if (this.formChanged) {
                if (confirm(productEstimatorAdmin.i18n.unsavedChanges)) {
                    this.switchTab(tab);
                }
            } else {
                this.switchTab(tab);
            }
        }

        /**
         * Switch to specified tab
         * @param {string} tab - Tab identifier
         */
        switchTab(tab) {
            $('.nav-tab').removeClass('nav-tab-active');
            $(`.nav-tab[data-tab="${tab}"]`).addClass('nav-tab-active');

            $('.tab-content').hide();
            $(`#${tab}`).show();

            this.currentTab = tab;

            // Update URL without reload
            const url = new URL(window.location);
            url.searchParams.set('tab', tab);
            window.history.pushState({}, '', url);

            // Load tab-specific content
            if (tab === 'reports' && !this.reportData) {
                this.loadInitialReport();
            }
        }

        /**
         * Handle form submission
         * @param {Event} e - Submit event
         */
        handleFormSubmit(e) {
            e.preventDefault();

            const $form = $(e.currentTarget);
            const $submitButton = $form.find(':submit');

            // Disable submit button
            $submitButton.prop('disabled', true);

            // Prepare form data
            const formData = new FormData($form[0]);
            formData.append('action', 'save_product_estimator_settings');
            formData.append('nonce', productEstimatorAdmin.nonce);

            // Send AJAX request
            $.ajax({
                url: productEstimatorAdmin.ajax_url,
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                success: (response) => {
                    if (response.success) {
                        this.showNotice(productEstimatorAdmin.i18n.saveSuccess, 'success');
                        this.formChanged = false;
                    } else {
                        this.showNotice(response.data.message || productEstimatorAdmin.i18n.saveError, 'error');
                    }
                },
                error: () => {
                    this.showNotice(productEstimatorAdmin.i18n.saveError, 'error');
                },
                complete: () => {
                    $submitButton.prop('disabled', false);
                }
            });
        }

        /**
         * Handle report generation
         * @param {Event} e - Click event
         */
        handleReportGeneration(e) {
            e.preventDefault();

            const $button = $(e.currentTarget);
            const reportType = $('select[name="report_type"]').val();
            const startDate = $('input[name="start_date"]').val();
            const endDate = $('input[name="end_date"]').val();

            // Validate dates
            if (!this.validateDateRange(startDate, endDate)) {
                this.showNotice(productEstimatorAdmin.i18n.invalidDateRange, 'error');
                return;
            }

            // Disable button
            $button.prop('disabled', true);

            // Show loading indicator
            $('#report-placeholder').html('<div class="loading">Loading...</div>');

            // Send AJAX request
            $.ajax({
                url: productEstimatorAdmin.ajax_url,
                type: 'POST',
                data: {
                    action: 'generate_product_estimator_report',
                    nonce: productEstimatorAdmin.nonce,
                    report_type: reportType,
                    start_date: startDate,
                    end_date: endDate
                },
                success: (response) => {
                    if (response.success) {
                        this.displayReport(response.data);
                    } else {
                        this.showNotice(response.data.message, 'error');
                    }
                },
                error: () => {
                    this.showNotice(productEstimatorAdmin.i18n.reportError, 'error');
                },
                complete: () => {
                    $button.prop('disabled', false);
                }
            });
        }

        /**
         * Handle data export
         * @param {Event} e - Click event
         */
        handleExport(e) {
            e.preventDefault();

            const $button = $(e.currentTarget);

            // Disable button
            $button.prop('disabled', true);

            // Send AJAX request
            $.ajax({
                url: productEstimatorAdmin.ajax_url,
                type: 'POST',
                data: {
                    action: 'export_product_estimator_data',
                    nonce: productEstimatorAdmin.nonce
                },
                success: (response) => {
                    if (response.success) {
                        // Create and click download link
                        const link = document.createElement('a');
                        link.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(response.data.csv);
                        link.download = 'product-estimator-export.csv';
                        link.click();
                    } else {
                        this.showNotice(response.data.message, 'error');
                    }
                },
                error: () => {
                    this.showNotice(productEstimatorAdmin.i18n.exportError, 'error');
                },
                complete: () => {
                    $button.prop('disabled', false);
                }
            });
        }

        /**
         * Initialize form validation
         */
        initializeValidation() {
            const $form = $('.product-estimator-form');

            // Real-time email validation
            $form.find('input[type="email"]').on('change', (e) => {
                const $input = $(e.currentTarget);
                const email = $input.val();

                if (email && !this.validateEmail(email)) {
                    this.showFieldError($input, productEstimatorAdmin.i18n.invalidEmail);
                } else {
                    this.clearFieldError($input);
                }
            });

            // Number range validation
            $form.find('input[type="number"]').on('change', (e) => {
                const $input = $(e.currentTarget);
                const value = parseInt($input.val());
                const min = parseInt($input.attr('min'));
                const max = parseInt($input.attr('max'));

                if (value < min || value > max) {
                    this.showFieldError($input, productEstimatorAdmin.i18n.numberRange
                        .replace('%min%', min)
                        .replace('%max%', max));
                } else {
                    this.clearFieldError($input);
                }
            });
        }

        /**
         * Handle window beforeunload event
         * @param {Event} e - BeforeUnload event
         */
        handleBeforeUnload(e) {
            if (this.formChanged) {
                e.preventDefault();
                return productEstimatorAdmin.i18n.unsavedChanges;
            }
        }

        /**
         * Display report data
         * @param {Object} data - Report data
         */
        displayReport(data) {
            this.reportData = data;

            // Clear previous chart if exists
            if (this.chart) {
                this.chart.destroy();
            }

            // Create report HTML
            const $reportContent = $('#report-placeholder');
            $reportContent.html(`
                <div class="report-summary">
                    <h3>${productEstimatorAdmin.i18n.reportSummary}</h3>
                    <p>${productEstimatorAdmin.i18n.totalCalculations}: ${data.total_calculations}</p>
                    <p>${productEstimatorAdmin.i18n.averageValue}: ${data.average_value}</p>
                </div>
                <canvas id="reportChart"></canvas>
            `);

            // Initialize chart
            const ctx = document.getElementById('reportChart').getContext('2d');
            this.chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: data.labels,
                    datasets: [{
                        label: productEstimatorAdmin.i18n.calculations,
                        data: data.values,
                        borderColor: '#2271b1',
                        tension: 0.1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
        }

        /**
         * Show admin notice
         * @param {string} message - Notice message
         * @param {string} type - Notice type (success/error)
         */
        showNotice(message, type = 'success') {
            const $notice = $(`<div class="notice notice-${type} is-dismissible"><p>${message}</p></div>`);
            $('.wrap h1').after($notice);

            // Initialize WordPress dismissible notices
            if (window.wp && window.wp.notices) {
                window.wp.notices.init();
            }

            // Auto-dismiss after 5 seconds
            setTimeout(() => {
                $notice.fadeOut(() => $notice.remove());
            }, 5000);
        }

        /**
         * Show field error
         * @param {jQuery} $field - Field element
         * @param {string} message - Error message
         */
        showFieldError($field, message) {
            const $error = $(`<span class="field-error">${message}</span>`);
            this.clearFieldError($field);
            $field.after($error);
            $field.addClass('error');
        }

        /**
         * Clear field error
         * @param {jQuery} $field - Field element
         */
        clearFieldError($field) {
            $field.next('.field-error').remove();
            $field.removeClass('error');
        }

        /**
         * Validate email address
         * @param {string} email - Email address
         * @returns {boolean} - Validation result
         */
        validateEmail(email) {
            const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(String(email).toLowerCase());
        }

        /**
         * Validate date range
         * @param {string} startDate - Start date
         * @param {string} endDate - End date
         * @returns {boolean} - Validation result
         */
        validateDateRange(startDate, endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            return start <= end;
        }
    }

    // Initialize when document is ready
    $(document).ready(() => {
        new ProductEstimatorAdmin();
    });

})(jQuery);