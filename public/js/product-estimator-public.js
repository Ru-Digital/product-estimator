(function($) {
    'use strict';

    class ProductEstimator {
        constructor(element) {
            // Store main container element
            this.container = element;

            // Initialize properties
            this.form = this.container.find('.estimator-form');
            this.productSelect = this.form.find('#product-type');
            this.quantityInput = this.form.find('#quantity');
            this.optionsGroup = this.form.find('.options-group');
            this.resultsContainer = this.form.find('.calculation-results');
            this.errorContainer = this.form.find('.error-messages');
            this.loadingOverlay = this.container.find('.loading-overlay');

            // Store templates
            this.templates = {
                optionGroup: $('#option-group-template').html(),
                optionItem: $('#option-item-template').html(),
                tooltip: $('#tooltip-template').html()
            };

            // Initialize state
            this.state = {
                currentProduct: null,
                options: [],
                calculations: {
                    basePrice: 0,
                    optionsTotal: 0,
                    quantity: 0,
                    total: 0
                }
            };

            // Bind events
            this.bindEvents();

            // Initialize tooltips if enabled
            if (productEstimatorPublic.enableTooltips) {
                this.initializeTooltips();
            }
        }

        bindEvents() {
            // Form submission
            this.form.on('submit', (e) => {
                e.preventDefault();
                this.handleCalculation();
            });

            // Product selection change
            this.productSelect.on('change', () => {
                this.handleProductChange();
            });

            // Quantity input change
            this.quantityInput.on('input', () => {
                this.validateQuantity();
            });

            // Option changes
            this.form.on('change', 'input[name="options[]"]', () => {
                this.updateCalculations();
            });

            // Reset button
            this.form.find('.reset-button').on('click', () => {
                this.resetForm();
            });

            // PDF download
            this.form.find('.download-pdf').on('click', () => {
                this.generatePDF();
            });
        }

        handleProductChange() {
            const productId = this.productSelect.val();

            if (!productId) {
                this.optionsGroup.hide();
                this.resetCalculations();
                return;
            }

            this.loadProductOptions(productId);
        }

        loadProductOptions(productId) {
            this.showLoading();

            $.ajax({
                url: productEstimatorPublic.ajax_url,
                type: 'POST',
                data: {
                    action: 'get_product_options',
                    nonce: productEstimatorPublic.nonce,
                    product_id: productId
                },
                success: (response) => {
                    if (response.success) {
                        this.renderOptions(response.data);
                    } else {
                        this.showError(response.data.message);
                    }
                },
                error: () => {
                    this.showError(productEstimatorPublic.i18n.error_loading_options);
                },
                complete: () => {
                    this.hideLoading();
                }
            });
        }

        renderOptions(options) {
            const optionsContainer = this.form.find('#product-options');
            optionsContainer.empty();

            if (!options.length) {
                this.optionsGroup.hide();
                return;
            }

            // Group options by category
            const groupedOptions = this.groupOptionsByCategory(options);

            // Render each group
            Object.entries(groupedOptions).forEach(([category, options]) => {
                const groupElement = $(this.templates.optionGroup);

                groupElement.find('.option-group-title').text(category);

                const itemsContainer = groupElement.find('.option-items');

                options.forEach(option => {
                    const itemElement = $(this.templates.optionItem);

                    itemElement.find('input').val(option.id);
                    itemElement.find('.option-title').text(option.title);
                    itemElement.find('.option-price').text(
                        this.formatCurrency(option.price)
                    );

                    if (option.description) {
                        itemElement.find('.option-description').text(option.description);
                    }

                    itemsContainer.append(itemElement);
                });

                optionsContainer.append(groupElement);
            });

            this.optionsGroup.show();
            this.updateCalculations();
        }

        handleCalculation() {
            if (!this.validateForm()) {
                return;
            }

            this.showLoading();

            const formData = this.form.serializeArray();
            formData.push({
                name: 'action',
                value: 'calculate_estimate'
            }, {
                name: 'nonce',
                value: productEstimatorPublic.nonce
            });

            $.ajax({
                url: productEstimatorPublic.ajax_url,
                type: 'POST',
                data: formData,
                success: (response) => {
                    if (response.success) {
                        this.displayResults(response.data);
                    } else {
                        this.showError(response.data.message);
                    }
                },
                error: () => {
                    this.showError(productEstimatorPublic.i18n.error_calculation);
                },
                complete: () => {
                    this.hideLoading();
                }
            });
        }

        validateForm() {
            let isValid = true;
            this.errorContainer.find('.error-content').empty();

            // Validate product selection
            if (!this.productSelect.val()) {
                this.addError(productEstimatorPublic.i18n.select_product);
                isValid = false;
            }

            // Validate quantity
            const quantity = parseInt(this.quantityInput.val());
            const min = parseInt(this.quantityInput.attr('min'));
            const max = parseInt(this.quantityInput.attr('max'));

            if (isNaN(quantity) || quantity < min || quantity > max) {
                this.addError(
                    productEstimatorPublic.i18n.invalid_quantity
                        .replace('%min%', min)
                        .replace('%max%', max)
                );
                isValid = false;
            }

            if (!isValid) {
                this.errorContainer.show();
            }

            return isValid;
        }

        updateCalculations() {
            const selectedProduct = this.productSelect.find('option:selected');
            const basePrice = parseFloat(selectedProduct.data('base-price')) || 0;
            const quantity = parseInt(this.quantityInput.val()) || 0;

            // Calculate options total
            let optionsTotal = 0;
            this.form.find('input[name="options[]"]:checked').each(function() {
                const price = parseFloat($(this).closest('.option-item')
                    .find('.option-price').text().replace(/[^0-9.-]+/g, ''));
                optionsTotal += price;
            });

            // Update state
            this.state.calculations = {
                basePrice: basePrice,
                optionsTotal: optionsTotal,
                quantity: quantity,
                total: (basePrice + optionsTotal) * quantity
            };

            this.updateDisplay();
        }

        updateDisplay() {
            const calc = this.state.calculations;

            this.resultsContainer.find('.base-price-value')
                .text(this.formatCurrency(calc.basePrice));
            this.resultsContainer.find('.options-total-value')
                .text(this.formatCurrency(calc.optionsTotal));
            this.resultsContainer.find('.quantity-value')
                .text(calc.quantity);
            this.resultsContainer.find('.total-price-value')
                .text(this.formatCurrency(calc.total));

            this.resultsContainer.show();
            this.form.find('.reset-button, .download-pdf').show();
        }

        generatePDF() {
            // Implementation would depend on your PDF generation strategy
            // This is a placeholder that could be implemented based on requirements
            console.log('PDF generation not implemented');
        }

        resetForm() {
            this.form[0].reset();
            this.optionsGroup.hide();
            this.resultsContainer.hide();
            this.errorContainer.hide();
            this.form.find('.reset-button, .download-pdf').hide();
            this.resetCalculations();
        }

        // Utility Methods
        formatCurrency(amount) {
            return productEstimatorPublic.currency +
                amount.toFixed(productEstimatorPublic.decimal_points);
        }

        groupOptionsByCategory(options) {
            return options.reduce((groups, option) => {
                const category = option.category || 'Other';
                if (!groups[category]) {
                    groups[category] = [];
                }
                groups[category].push(option);
                return groups;
            }, {});
        }

        showLoading() {
            this.loadingOverlay.show();
        }

        hideLoading() {
            this.loadingOverlay.hide();
        }

        showError(message) {
            this.errorContainer.find('.error-content').html(message);
            this.errorContainer.show();
        }

        addError(message) {
            const errorContent = this.errorContainer.find('.error-content');
            errorContent.append($('<div>').text(message));
        }

        validateQuantity() {
            const value = this.quantityInput.val();
            const min = parseInt(this.quantityInput.attr('min'));
            const max = parseInt(this.quantityInput.attr('max'));

            if (value && (parseInt(value) < min || parseInt(value) > max)) {
                this.quantityInput.addClass('error');
            } else {
                this.quantityInput.removeClass('error');
            }

            this.updateCalculations();
        }

        resetCalculations() {
            this.state.calculations = {
                basePrice: 0,
                optionsTotal: 0,
                quantity: 0,
                total: 0
            };
        }

        initializeTooltips() {
            this.container.on('mouseenter', '[data-tooltip]', (e) => {
                const element = $(e.currentTarget);
                const content = element.data('tooltip');

                if (!content) return;

                const tooltip = $(this.templates.tooltip);
                tooltip.find('.tooltip-content').text(content);

                $('body').append(tooltip);

                const position = element.offset();
                const elementWidth = element.outerWidth();
                const elementHeight = element.outerHeight();

                tooltip.css({
                    top: position.top + elementHeight + 5,
                    left: position.left + (elementWidth / 2) - (tooltip.outerWidth() / 2)
                });
            });

            this.container.on('mouseleave', '[data-tooltip]', () => {
                $('.estimator-tooltip').remove();
            });
        }
    }

    // Initialize all product estimators on the page
    $(document).ready(() => {
        $('.product-estimator-container').each(function() {
            new ProductEstimator($(this));
        });
    });

})(jQuery);