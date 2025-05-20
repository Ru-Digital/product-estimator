# Labels System - Template Migration Checklist

## Overview

This checklist will help track the migration of hardcoded text to dynamic labels throughout the Product Estimator plugin. Use this document to track progress and ensure all UI text is properly managed through the Labels System.

## Template Files

### PHP Templates

#### Frontend Core Templates
- [ ] `/public/partials/product-estimator-display.php`
- [ ] `/public/partials/product-estimator-estimate-selection-form.php`
- [ ] `/public/partials/product-estimator-estimates-list.php`
- [ ] `/public/partials/product-estimator-modal-template.php`
- [ ] `/public/partials/product-estimator-new-estimate-form.php`
- [ ] `/public/partials/product-estimator-new-room-form.php`
- [ ] `/public/partials/product-estimator-print-template.php`
- [ ] `/public/partials/product-estimator-product-item.php`
- [ ] `/public/partials/product-estimator-room-list-item.php`
- [ ] `/public/partials/product-estimator-room-selection-form.php`

#### Carousel Templates
- [ ] `/public/partials/product-estimator-similar-products-carousel.php`
- [ ] `/public/partials/product-estimator-suggestions-carousel.php`

### JavaScript Templates

#### Component Templates
- [ ] `/src/templates/components/common/loading.html`
- [ ] `/src/templates/components/common/select-option.html`
- [ ] `/src/templates/components/common/toggle/hide.html`
- [ ] `/src/templates/components/common/toggle/show.html`
- [ ] `/src/templates/components/estimate/estimate-item.html`
- [x] `/src/templates/components/room/room-item.html` (Partially done)
- [ ] `/src/templates/components/room/actions-footer.html`
- [ ] `/src/templates/components/room/rooms-container.html`
- [ ] `/src/templates/components/product/additional-product-option.html`
- [ ] `/src/templates/components/product/additional-products-section.html`
- [ ] `/src/templates/components/product/include-item.html`
- [ ] `/src/templates/components/product/note-item.html`
- [ ] `/src/templates/components/product/similar-item.html`
- [ ] `/src/templates/components/product/suggestion-item.html`

#### Form Templates
- [ ] `/src/templates/forms/estimate/estimate-selection.html`
- [ ] `/src/templates/forms/estimate/new-estimate.html`
- [ ] `/src/templates/forms/room/new-room.html`
- [ ] `/src/templates/forms/room/room-selection.html`

#### Layout Templates
- [ ] `/src/templates/layout/modal-container.html`

#### UI Templates
- [ ] `/src/templates/ui/dialog-contact-selection.html`
- [ ] `/src/templates/ui/dialog-content-form.html`
- [ ] `/src/templates/ui/dialog-form-field.html`
- [ ] `/src/templates/ui/dialog-form-fields.html`
- [ ] `/src/templates/ui/dialogs/confirmation.html`
- [ ] `/src/templates/ui/dialogs/product-selection.html`
- [ ] `/src/templates/ui/dialogs/variation-option.html`
- [ ] `/src/templates/ui/dialogs/variation-swatch-wrapper.html`
- [ ] `/src/templates/ui/dialogs/variation-swatch.html`
- [ ] `/src/templates/ui/empty-states/estimates-empty.html`
- [ ] `/src/templates/ui/empty-states/products-empty.html`
- [ ] `/src/templates/ui/empty-states/rooms-empty.html`
- [ ] `/src/templates/ui/errors/form-error.html`
- [ ] `/src/templates/ui/errors/product-error.html`
- [ ] `/src/templates/ui/errors/room-error.html`
- [ ] `/src/templates/ui/messages/modal-messages.html`
- [ ] `/src/templates/ui/tooltip-rich.html`
- [ ] `/src/templates/ui/tooltip.html`

## JavaScript Components

### Frontend Core Components
- [ ] `/src/js/frontend/AjaxService.js`
- [ ] `/src/js/frontend/ConfirmationDialog.js`
- [ ] `/src/js/frontend/CustomerDetailsManager.js`
- [ ] `/src/js/frontend/CustomerStorage.js`
- [ ] `/src/js/frontend/DataService.js`
- [ ] `/src/js/frontend/EstimateActions.js`
- [ ] `/src/js/frontend/EstimateStorage.js`
- [ ] `/src/js/frontend/EstimatorCore.js`
- [ ] `/src/js/frontend/InfiniteCarousel.js`
- [ ] `/src/js/frontend/ProductDetailsToggle.js`
- [ ] `/src/js/frontend/ProductSelectionDialog.js`
- [ ] `/src/js/frontend/SuggestionsCarousel.js`
- [ ] `/src/js/frontend/TemplateEngine.js`
- [ ] `/src/js/frontend/Tooltip.js`
- [ ] `/src/js/frontend/VariationHandler.js`

### Frontend Managers
- [ ] `/src/js/frontend/managers/EstimateManager.js`
- [ ] `/src/js/frontend/managers/FormManager.js`
- [ ] `/src/js/frontend/managers/ModalManager.js`
- [ ] `/src/js/frontend/managers/ProductManager.js`
- [ ] `/src/js/frontend/managers/RoomManager.js`
- [ ] `/src/js/frontend/managers/UIManager.js`

## Label Categories Progress

### Buttons
- [ ] save_estimate
- [ ] print_estimate
- [ ] request_copy
- [ ] similar_products
- [ ] product_includes
- [ ] suggested_products
- [ ] add_product
- [ ] remove_product
- [ ] edit_product
- [ ] cancel
- [ ] continue

### Forms
- [ ] estimate_name
- [ ] placeholder_email
- [ ] customer_name
- [ ] customer_phone
- [ ] room_name
- [ ] room_width
- [ ] room_length
- [ ] product_quantity

### Messages
- [ ] product_added
- [ ] estimate_saved
- [ ] estimate_deleted
- [ ] room_added
- [ ] room_deleted
- [ ] confirm_delete
- [ ] showing_results

### UI Elements
- [ ] get_started
- [ ] expand
- [ ] collapse
- [ ] price_notice
- [ ] empty_estimates
- [ ] empty_rooms
- [ ] empty_products
- [ ] loading

## Implementation Status

| Category      | Total Labels | Implemented | Progress |
|---------------|--------------|------------|----------|
| Buttons       | 0            | 0          | 0%       |
| Forms         | 0            | 0          | 0%       |
| Messages      | 0            | 0          | 0%       |
| UI Elements   | 0            | 0          | 0%       |
| **TOTAL**     | **0**        | **0**      | **0%**   |

## Next Steps

1. Complete the inventory of all text strings in templates
2. Update the table above with accurate counts
3. Start migration with high-priority templates
4. Test labels in various contexts
5. Update progress regularly

## Notes

- Use the example implementation in `example-labels-usage.php` as a reference
- Always include default fallback values for robustness
- Ensure proper escaping in different contexts
- Document any issues or edge cases encountered during migration