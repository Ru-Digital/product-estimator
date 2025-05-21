# Labels UI Elements Implementation Tracking

This document tracks the UI elements that need to be implemented using the Product Estimator label system.

## Implementation Progress

We're working on adding labels for various UI elements that are not currently using the label system. Here's the progress:

### Backend Setup

- [x] Added button labels in `LabelsSettingsModule.php`:
  - `select_additional_product`
  - `selected_additional_product`
  - `add_product_and_room`

- [x] Added message labels in `LabelsSettingsModule.php`:
  - `product_replaced_success`
  - `primary_product_conflict` 
  - `product_already_exists`

- [x] Added UI element labels in `LabelsSettingsModule.php`:
  - `product_replaced_title`
  - `primary_product_conflict_title`
  - `product_already_exists_title`
  - `add_new_room_title`

- [ ] Need to update `LabelsMigration.php` to include default values for the new labels (in progress)

### Frontend Implementation 

#### Single Product Page
- [ ] Add to Estimate button - `button.single_add_to_estimator_button`

#### Product Estimator Modal
- [ ] Modal Title - `.product-estimator-modal-header h2`
- [ ] Request contact from store button - `.request-contact-estimate span`
- [ ] Delete Room Button - `button.remove-room`
- [ ] Delete Estimate Button - `button.remove-estimate`

#### Similar Products
- [ ] Replace Product Button - `.replace-product-in-room`
- [ ] Select Product Options (Dialog Title) - `.pe-dialog-title`
- [ ] Select Product Options (Replace Product Button) - `.pe-dialog-confirm`
- [ ] Select Product Options (Dialog Message) - `.pe-dialog-message`

#### Product Replaced Successfully Dialog
- [ ] Dialog Title - `.pe-dialog-title`
- [ ] Dialog Message - `.pe-dialog-message`
- [ ] OK Button - `.pe-dialog-confirm.full-width`

#### Additional Product Buttons
- [ ] "Select" Button - `.replace-product-in-room[data-replace-type="additional_products"]`
- [ ] "Selected" Button - `.replace-product-in-room[data-replace-type="additional_products"]`

#### Add New Room Form
- [ ] Form Title
- [ ] Width and Length field labels
- [ ] "Add Product & Room" button

## Next Steps

1. Continue updating the `LabelsMigration.php` class to include default values for the new labels
2. Find and modify the HTML templates to use the data-label attributes
3. Test the implementation to make sure it works as expected