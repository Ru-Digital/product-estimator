/**
 * ProductSelectionDialog Component
 * 
 * Handles product selection with variations
 * Displays variation swatches and options
 * Manages user selection before adding to estimate
 */
class ProductSelectionDialog {
    constructor(modalManager, templateEngine) {
        this.modalManager = modalManager;
        this.templateEngine = templateEngine;
        this.dialogElement = null;
        this.backdropElement = null;
        this.currentProduct = null;
        this.selectedVariations = {};
        this.availableVariations = null;
        this.selectedVariationId = null;
        this.onSelectCallback = null;
        this.onCancelCallback = null;
    }

    /**
     * Show the product selection dialog
     * @param {object} options - Dialog options
     * @param {object} options.product - Product data
     * @param {Array} options.variations - Available variations
     * @param {object} options.attributes - Product attributes
     * @param {string} options.action - The action being performed ('add' or 'replace')
     * @param {Function} options.onSelect - Callback when variation is selected
     * @param {Function} options.onCancel - Callback when dialog is cancelled
     */
    show(options) {
        this.currentProduct = options.product;
        this.availableVariations = options.variations || [];
        this.attributes = options.attributes || {};
        this.action = options.action || 'add';
        this.onSelectCallback = options.onSelect;
        this.onCancelCallback = options.onCancel;
        this.selectedVariations = {};
        this.selectedVariationId = null;

        this.create();
        
        // Check if dialog creation succeeded
        if (!this.dialogElement || !this.backdropElement) {
            throw new Error('Failed to create product selection dialog');
        }
        
        // If we're transitioning from loading state, hide it first
        if (this.dialogElement && this.dialogElement.classList.contains('loading')) {
            this.hideLoading();
        }
        
        this.populateDialog();
        this.showDialog();
    }

    create() {
        if (this.dialogElement) {
            return;
        }

        // Get template element
        const template = this.templateEngine.getTemplate('product-selection-template');
        if (!template) {
            console.error('ProductSelectionDialog: Product selection template not found');
            throw new Error('Product selection template not found');
        }

        // Create dialog from template using the create method
        const dialogFragment = this.templateEngine.create('product-selection-template', {});
        
        // Create a wrapper div to hold the fragment content
        const wrapper = document.createElement('div');
        wrapper.appendChild(dialogFragment);
        
        // Extract the elements
        this.backdropElement = wrapper.querySelector('.pe-dialog-backdrop');
        this.dialogElement = wrapper.querySelector('.pe-product-selection-dialog');

        if (!this.backdropElement || !this.dialogElement) {
            console.error('ProductSelectionDialog: Failed to create dialog elements');
            throw new Error('Failed to create dialog elements');
        }

        // Move the backdrop element directly to body
        document.body.appendChild(this.backdropElement);

        // Bind events
        this.bindEvents();
    }

    bindEvents() {
        if (!this.dialogElement) return;

        // Close button
        const closeButton = this.dialogElement.querySelector('.pe-dialog-close');
        if (closeButton) {
            closeButton.addEventListener('click', () => this.cancel());
        }

        // Cancel button
        const cancelButton = this.dialogElement.querySelector('.pe-dialog-cancel');
        if (cancelButton) {
            cancelButton.addEventListener('click', () => this.cancel());
        }

        // Confirm button
        const confirmButton = this.dialogElement.querySelector('.pe-dialog-confirm');
        if (confirmButton) {
            confirmButton.addEventListener('click', () => this.confirm());
        }

        // Backdrop click
        this.backdropElement.addEventListener('click', (e) => {
            if (e.target === this.backdropElement) {
                this.cancel();
            }
        });
    }

    populateDialog() {
        if (!this.dialogElement || !this.currentProduct) return;

        // Set product name
        const productNameEl = this.dialogElement.querySelector('.pe-dialog-product-name');
        if (productNameEl) {
            productNameEl.textContent = this.currentProduct.name || 'Select Product Options';
        }
        
        // Update confirm button text based on action
        const confirmButton = this.dialogElement.querySelector('.pe-dialog-confirm');
        if (confirmButton) {
            confirmButton.textContent = this.action === 'replace' ? 'Replace Product' : 'Add to Estimate';
        }

        // Clear and populate variation options
        const variationContainer = this.dialogElement.querySelector('.pe-variation-options');
        if (!variationContainer) return;

        variationContainer.innerHTML = '';

        // If no variations, show simple confirmation
        if (!this.availableVariations || this.availableVariations.length === 0) {
            const message = this.dialogElement.querySelector('.pe-dialog-message');
            if (message) {
                message.textContent = 'Add this product to your estimate?';
            }
            this.updateConfirmButton(true);
            return;
        }

        // Create variation option groups
        Object.entries(this.attributes).forEach(([attributeName, attributeData]) => {
            // Create variation group from template
            const groupFragment = this.templateEngine.create('variation-option-template', {
                attributeName: attributeName,
                attributeLabel: attributeData.label || attributeName
            });

            // Convert fragment to element
            const tempDiv = document.createElement('div');
            tempDiv.appendChild(groupFragment);
            const variationGroup = tempDiv.firstElementChild;

            if (!variationGroup) return;

            // Add swatches for each option
            const swatchContainer = variationGroup.querySelector('.pe-variation-swatches');
            if (swatchContainer && attributeData.options) {
                attributeData.options.forEach(option => {
                    const swatch = this.createSwatch(attributeName, option, attributeData.type);
                    if (swatch) {
                        swatchContainer.appendChild(swatch);
                    }
                });
            }

            variationContainer.appendChild(variationGroup);
        });
    }

    createSwatch(attributeName, option, type = 'label') {
        // Create swatch from template
        const swatchFragment = this.templateEngine.create('variation-swatch-template', {
            attributeName: attributeName,
            value: option.value,
            type: type,
            label: option.label || option.value,
            selected: '' // Empty for unselected
        });

        // Convert fragment to element
        const tempDiv = document.createElement('div');
        tempDiv.appendChild(swatchFragment);
        const swatchElement = tempDiv.firstElementChild;

        if (!swatchElement) return null;

        // Add the content based on type
        const contentEl = swatchElement.querySelector('.pe-swatch-content');
        if (contentEl) {
            switch (type) {
                case 'color': {
                    const colorSpan = document.createElement('span');
                    colorSpan.className = 'pe-swatch-color';
                    colorSpan.style.backgroundColor = option.color || option.value;
                    contentEl.appendChild(colorSpan);
                    break;
                }
                case 'image': {
                    const img = document.createElement('img');
                    img.className = 'pe-swatch-image';
                    img.src = option.image || option.value;
                    img.alt = option.label || option.value;
                    contentEl.appendChild(img);
                    break;
                }
                default:
                    contentEl.textContent = option.label || option.value;
            }
        }

        // Add click handler
        if (!option.disabled) {
            swatchElement.addEventListener('click', () => this.selectVariation(attributeName, option.value));
        } else {
            swatchElement.disabled = true;
        }

        return swatchElement;
    }

    selectVariation(attributeName, value) {
        // Update selected variations
        this.selectedVariations[attributeName] = value;

        // Update UI to show selection
        const swatches = this.dialogElement.querySelectorAll(`.pe-variation-swatch[data-attribute-name="${attributeName}"]`);
        swatches.forEach(swatch => {
            if (swatch.dataset.value === value) {
                swatch.classList.add('selected');
            } else {
                swatch.classList.remove('selected');
            }
        });

        // Find matching variation
        this.findMatchingVariation();
        
        // Update confirm button state
        this.updateConfirmButton();
        
        // Update selected summary
        this.updateSelectedSummary();
    }

    findMatchingVariation() {
        if (!this.availableVariations || this.availableVariations.length === 0) {
            return;
        }

        // Find variation that matches all selected attributes
        const matchingVariation = this.availableVariations.find(variation => {
            return Object.entries(this.selectedVariations).every(([attr, value]) => {
                // Check for both attribute formats (with and without 'attribute_' prefix)
                const attrKey = `attribute_${attr}`;
                return variation.attributes[attr] === value || variation.attributes[attrKey] === value;
            });
        });

        if (matchingVariation) {
            this.selectedVariationId = matchingVariation.variation_id;
        } else {
            this.selectedVariationId = null;
        }
    }

    updateConfirmButton(enabled = null) {
        const confirmButton = this.dialogElement.querySelector('.pe-dialog-confirm');
        if (!confirmButton) return;

        if (enabled !== null) {
            confirmButton.disabled = !enabled;
            return;
        }

        // Check if all required attributes are selected
        const allAttributesSelected = Object.keys(this.attributes).every(attr => {
            return this.selectedVariations[attr] !== undefined;
        });

        confirmButton.disabled = !allAttributesSelected || !this.selectedVariationId;
    }

    updateSelectedSummary() {
        // Removed - we don't need to show the selected attributes summary
    }

    showDialog() {
        if (!this.backdropElement || !this.dialogElement) return;

        this.backdropElement.style.display = 'flex';
        this.backdropElement.classList.add('visible');
        this.dialogElement.classList.add('visible');
    }

    hideDialog() {
        if (!this.backdropElement || !this.dialogElement) return;

        this.backdropElement.classList.remove('visible');
        this.dialogElement.classList.remove('visible');
        
        setTimeout(() => {
            this.backdropElement.style.display = 'none';
        }, 300);
    }

    confirm() {
        const selectedData = {
            productId: this.currentProduct.id,
            variationId: this.selectedVariationId,
            selectedAttributes: this.selectedVariations,
            product: this.currentProduct
        };

        this.hideDialog();

        if (this.onSelectCallback) {
            this.onSelectCallback(selectedData);
        }
    }

    cancel() {
        this.hideDialog();

        if (this.onCancelCallback) {
            this.onCancelCallback();
        }
    }

    destroy() {
        if (this.backdropElement) {
            this.backdropElement.remove();
            this.backdropElement = null;
        }
        this.dialogElement = null;
        this.currentProduct = null;
        this.selectedVariations = {};
        this.selectedVariationId = null;
    }

    /**
     * Show loading state
     */
    showLoading() {
        // Create minimal structure if not already created
        if (!this.backdropElement || !this.dialogElement) {
            this.create();
        }

        // Show backdrop immediately
        if (this.backdropElement) {
            this.backdropElement.style.display = 'flex';
            this.backdropElement.classList.add('visible');
        }

        // Show dialog with loading state
        if (this.dialogElement) {
            this.dialogElement.classList.add('visible', 'loading');
            
            // Update header title
            const titleEl = this.dialogElement.querySelector('.pe-dialog-title');
            if (titleEl) {
                titleEl.textContent = 'Loading...';
            }
            
            // Update content to show loading message
            const body = this.dialogElement.querySelector('.pe-dialog-body');
            if (body) {
                body.innerHTML = '<div class="pe-loading-message">Loading product variations...</div>';
            }
            
            // Hide buttons during loading
            const confirmBtn = this.dialogElement.querySelector('.pe-dialog-confirm');
            const cancelBtn = this.dialogElement.querySelector('.pe-dialog-cancel');
            if (confirmBtn) {
                confirmBtn.style.display = 'none';
            }
            if (cancelBtn) {
                cancelBtn.style.display = 'none';
            }
        }
    }

    /**
     * Hide loading state
     */
    hideLoading() {
        if (this.dialogElement) {
            this.dialogElement.classList.remove('loading');
            
            // Restore original title
            const titleEl = this.dialogElement.querySelector('.pe-dialog-title');
            if (titleEl) {
                titleEl.textContent = 'Select Product Options';
            }
            
            // Restore original dialog body structure
            const body = this.dialogElement.querySelector('.pe-dialog-body');
            if (body) {
                // Recreate the original structure needed for populateDialog
                body.innerHTML = `
                    <div class="pe-dialog-product-name"></div>
                    <div class="pe-dialog-variations">
                        <p class="pe-dialog-message">Please select your options below:</p>
                        <div class="pe-variation-options">
                            <!-- Variation options will be dynamically inserted here -->
                        </div>
                    </div>
                `;
            }
            
            // Re-show buttons
            const confirmBtn = this.dialogElement.querySelector('.pe-dialog-confirm');
            const cancelBtn = this.dialogElement.querySelector('.pe-dialog-cancel');
            if (confirmBtn) {
                confirmBtn.style.display = '';
            }
            if (cancelBtn) {
                cancelBtn.style.display = '';
            }
        }
    }
}

export default ProductSelectionDialog;