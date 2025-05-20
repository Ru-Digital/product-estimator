/**
 * Example file demonstrating label usage in JavaScript
 * 
 * This file shows how to use the dynamic labels system in JavaScript
 *
 * @since 2.0.0
 */

import { labelManager } from '@utils/labels';

// Example 1: Getting a simple label
const saveButtonText = labelManager.get('buttons.save_estimate');
document.querySelector('.save-button').textContent = saveButtonText;

// Example 2: Getting a label with fallback
const printText = labelManager.get('buttons.print_estimate', 'Print Estimate');
console.log(printText);

// Example 3: Formatting a label with replacements
const resultsMessage = labelManager.format(
    'messages.showing_results',
    { count: 10 },
    'Showing {count} results'
);
document.querySelector('.results-count').textContent = resultsMessage;

// Example 4: Getting all labels for a category
const formLabels = labelManager.getCategory('forms');
console.log('All form labels:', formLabels);

// Example 5: Checking if a label exists
if (labelManager.exists('messages.welcome')) {
    const welcomeMsg = labelManager.get('messages.welcome');
    showNotification(welcomeMsg);
}

// Example 6: Using legacy label format (for backward compatibility)
const legacyLabel = labelManager.getLegacy('label_similar_products');
console.log('Legacy label:', legacyLabel);

// Example 7: Updating DOM elements with labels
// This will find all elements with data-label attributes and update their text
labelManager.updateDOM(document.querySelector('.product-estimator'));

// Example 8: Getting labels for a specific component
const componentLabels = labelManager.getComponentLabels('ProductManager', [
    'buttons.add',
    'buttons.remove',
    'messages.product_added',
    'messages.product_removed'
]);

// Use in component
class ProductManager {
    constructor() {
        this.labels = componentLabels;
    }
    
    addProduct() {
        // Show success message
        showNotification(this.labels['messages.product_added']);
    }
    
    removeProduct() {
        // Show confirmation dialog
        if (confirm(labelManager.get('messages.confirm_remove_product'))) {
            // Remove product
            showNotification(this.labels['messages.product_removed']);
        }
    }
}

// Example 9: Using labels in templates with data attributes
const template = `
    <div class="product-item">
        <h3 data-label="ui_elements.product_details">Product Details</h3>
        <button data-label="buttons.add_to_cart">Add to Cart</button>
        <span data-label="ui_elements.price_notice">Price notice here</span>
    </div>
`;

// Insert template
const container = document.querySelector('.products-container');
container.innerHTML = template;

// Process labels in the new content
labelManager.updateDOM(container);

// Example 10: Complex formatting with multiple replacements
const complexMessage = labelManager.format(
    'messages.order_summary',
    {
        count: 3,
        total: '$150.00',
        customer: 'John Doe'
    },
    '{customer} ordered {count} items for {total}'
);

// Example 11: Search for labels (useful for debugging)
const searchResults = labelManager.search('product');
console.log('Labels containing "product":', searchResults);

// Example 12: Export labels for backup or debugging
const allLabels = labelManager.export();
console.log('All labels:', JSON.parse(allLabels));

// Example 13: Get debug information
const debugInfo = labelManager.getDebugInfo();
console.log('Label system info:', debugInfo);

// Example 14: Using labels in error handling
try {
    // Some operation
} catch (error) {
    const errorMessage = labelManager.format(
        'messages.general_error',
        { error: error.message },
        'An error occurred: {error}'
    );
    showNotification(errorMessage, 'error');
}

// Example 15: React/Component usage pattern
const useLabels = (labelKeys) => {
    const labels = {};
    labelKeys.forEach(key => {
        labels[key] = labelManager.get(key);
    });
    return labels;
};

// In a component
const MyComponent = () => {
    const labels = useLabels([
        'buttons.save',
        'buttons.cancel',
        'messages.unsaved_changes'
    ]);
    
    return (
        <div>
            <button>{labels['buttons.save']}</button>
            <button>{labels['buttons.cancel']}</button>
            <p>{labels['messages.unsaved_changes']}</p>
        </div>
    );
};