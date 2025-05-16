# Product Variation Dialog Feature

This feature adds a product variation selection dialog that appears when clicking the "Add to Estimator" button for products with variations. Users can select their desired variation options (size, color, etc.) through swatches before the product is added to the estimate.

## Implementation Summary

### Files Created:

1. **Frontend JavaScript Components:**
   - `/src/js/frontend/ProductSelectionDialog.js` - Main dialog component that handles variation selection

2. **HTML Templates:**
   - `/src/templates/ui/dialogs/product-selection.html` - Main product selection dialog template
   - `/src/templates/ui/dialogs/variation-option.html` - Template for variation option groups
   - `/src/templates/ui/dialogs/variation-swatch.html` - Template for individual variation swatches

### Files Modified:

1. **Frontend JavaScript:**
   - `/src/js/frontend/managers/ModalManager.js`
     - Added ProductSelectionDialog initialization
     - Modified `openModal()` to check for product variations first
     - Added `proceedWithModalOpen()` to continue flow after variation selection
   
   - `/src/js/frontend/DataService.js`
     - Added `getProductVariationData()` method to fetch variation data from backend
   
   - `/src/js/frontend/template-loader.js`
     - Registered new templates for product selection dialog

2. **PHP Backend:**
   - `/includes/ajax/class-product-ajax-handler.php`
     - Added `get_product_variations()` method to handle AJAX requests for variation data
     - Registered new AJAX endpoint

3. **Styles:**
   - `/src/styles/frontend/Dialog.scss`
     - Added comprehensive styles for product selection dialog
     - Included swatch styles for color, image, and label variations
     - Added mobile responsive styles

## How It Works:

1. When a user clicks the "Add to Estimator" button for a product with variations:
   - The system fetches variation data via AJAX
   - The ProductSelectionDialog is displayed with all available options

2. The dialog shows:
   - Product name
   - Variation attributes (size, color, etc.) as swatches
   - Selected options summary
   - Disabled "Add to Estimate" button until all options are selected

3. After selection:
   - The selected variation ID is passed to the regular estimate flow
   - The estimate selection form appears as usual

## Technical Features:

- **Swatch Support:** Color swatches, image swatches, and text labels
- **Template-Based:** Uses HTML templates following project standards
- **Responsive:** Works on mobile devices with adapted layout
- **Accessible:** Keyboard navigation and screen reader support
- **Real-time Updates:** Shows selected options and enables/disables confirm button
- **Fallback Handling:** Gracefully handles products without variations

## Usage:

The feature is automatically enabled for all variable products. No configuration needed.

### For WooCommerce Store Owners:
- Set up product variations as usual in WooCommerce
- Use color or image attributes for visual swatches
- The dialog will automatically display when customers try to add variable products

### For Developers:
- Extend swatch types by modifying the `createSwatch()` method
- Customize dialog appearance in `Dialog.scss`
- Add new variation metadata support in the PHP handler

## Future Enhancements:

1. Add price display for each variation
2. Show stock status for variations
3. Add tooltips for swatch descriptions
4. Support for grouped products
5. Remember last selected variation for products