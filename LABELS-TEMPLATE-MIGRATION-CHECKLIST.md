# Labels System - Template Migration Checklist

## Overview

This checklist will help track the migration of hardcoded text to dynamic labels throughout the Product Estimator plugin. Use this document to track progress and ensure all UI text is properly managed through the Labels System.

## Template Files

### PHP Templates

#### Frontend Core Templates
- [ ] `/public/partials/product-estimator-display.php`
- [ ] `/public/partials/product-estimator-estimate-selection-form.php`
- [x] `/public/partials/product-estimator-estimates-list.php`
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
- [x] `/src/templates/components/room/room-item.html`
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
- [x] `/src/templates/forms/estimate/new-estimate.html`
- [ ] `/src/templates/forms/room/new-room.html`
- [ ] `/src/templates/forms/room/room-selection.html`

#### Layout Templates
- [ ] `/src/templates/layout/modal-container.html`

#### UI Templates
- [ ] `/src/templates/ui/dialog-contact-selection.html`
- [ ] `/src/templates/ui/dialog-content-form.html`
- [ ] `/src/templates/ui/dialog-form-field.html`
- [ ] `/src/templates/ui/dialog-form-fields.html`
- [x] `/src/templates/ui/dialogs/confirmation.html`
- [x] `/src/templates/ui/dialogs/product-selection.html`
- [ ] `/src/templates/ui/dialogs/variation-option.html`
- [ ] `/src/templates/ui/dialogs/variation-swatch.html`
- [ ] `/src/templates/ui/dialogs/variation-swatch-wrapper.html`
- [x] `/src/templates/ui/empty-states/estimates-empty.html`
- [x] `/src/templates/ui/empty-states/products-empty.html`
- [x] `/src/templates/ui/empty-states/rooms-empty.html`
- [ ] `/src/templates/ui/errors/form-error.html`
- [x] `/src/templates/ui/errors/product-error.html`
- [x] `/src/templates/ui/errors/room-error.html`
- [ ] `/src/templates/ui/messages/modal-messages.html`
- [ ] `/src/templates/ui/tooltip-rich.html`
- [ ] `/src/templates/ui/tooltip.html`

## JavaScript Components

### Frontend Core Components
- [x] `/src/js/frontend/ConfirmationDialog.js`
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
- [x] `/src/js/frontend/TemplateEngine.js`
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
- [x] buttons.create_new_estimate
- [x] buttons.confirm
- [x] buttons.cancel
- [x] buttons.contact_email
- [x] buttons.contact_phone
- [x] buttons.delete_estimate
- [x] buttons.remove_room
- [x] buttons.add_new_room
- [x] buttons.print_estimate
- [x] buttons.request_contact
- [x] buttons.request_copy
- [x] buttons.add_to_estimate
- [x] buttons.edit
- [x] buttons.save_changes
- [x] buttons.create_estimate
- [x] buttons.product_includes
- [x] buttons.similar_products
- [x] buttons.suggested_products
- [ ] buttons.add_product
- [ ] buttons.remove_product
- [ ] buttons.edit_product
- [ ] buttons.save_estimate
- [ ] buttons.continue

### Forms
- [x] forms.estimate_name
- [x] forms.customer_name 
- [x] forms.customer_email
- [x] forms.customer_phone
- [x] forms.customer_postcode
- [x] forms.placeholder_estimate_name
- [x] forms.placeholder_name
- [x] forms.placeholder_email
- [x] forms.placeholder_phone
- [x] forms.placeholder_postcode
- [ ] forms.room_name
- [ ] forms.room_width
- [ ] forms.room_length
- [ ] forms.product_quantity

### Messages
- [x] messages.product_load_error
- [x] messages.room_load_error
- [x] messages.confirm_proceed
- [x] messages.select_options
- [ ] messages.product_added
- [ ] messages.estimate_saved
- [ ] messages.estimate_deleted
- [ ] messages.room_added
- [ ] messages.room_deleted
- [ ] messages.showing_results

### UI Elements
- [x] ui_elements.confirm_title
- [x] ui_elements.no_estimates
- [x] ui_elements.no_rooms
- [x] ui_elements.no_products
- [x] ui_elements.price_notice
- [x] ui_elements.select_product_options
- [x] ui_elements.create_new_estimate
- [x] ui_elements.your_details
- [x] ui_elements.saved_details
- [x] ui_elements.edit_your_details
- [x] ui_elements.primary_product
- [x] ui_elements.previous
- [x] ui_elements.next
- [x] ui_elements.previous_suggestions
- [x] ui_elements.next_suggestions
- [x] ui_elements.rooms_heading
- [x] ui_elements.products_heading
- [ ] ui_elements.get_started
- [ ] ui_elements.expand
- [ ] ui_elements.collapse
- [ ] ui_elements.loading

## Implementation Status

| Category      | Total Labels | Implemented | Progress |
|---------------|--------------|------------|----------|
| Buttons       | 22           | 18         | 82%      |
| Forms         | 14           | 10         | 71%      |
| Messages      | 10           | 4          | 40%      |
| UI Elements   | 20           | 17         | 85%      |
| **TOTAL**     | **66**       | **49**     | **74%**  |

## Next Steps

1. Continue migrating template files to use dynamic labels
2. Update the JavaScript components to use the labelManager
3. Test all labels in various contexts
4. Update progress regularly in this checklist

## Notes

- Use the example implementation in `example-labels-usage.php` as a reference
- Always include default fallback values for robustness
- Ensure proper escaping in different contexts
- Document any issues or edge cases encountered during migration