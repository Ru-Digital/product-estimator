# AJAX Handler Migration Plan

This document outlines the plan for migrating the large `class-ajax-handler.php` file into smaller, more focused handler classes.

## Completed Tasks
- Created base AJAX handler class structure
- Created specialized AJAX handler classes for each functionality area
- Created a loader class for AJAX handlers
- Updated main plugin class to support new AJAX handler structure

## Migration Strategy

To minimize risk, we'll implement this refactoring in phases:

### Phase 1: Set Up Structure and Backwards Compatibility
- [x] Create new class structure
- [x] Create AjaxHandlerNew class that loads the new handler structure
- [x] Create ProductEstimator-new.php with updated code

### Phase 2: Move Methods (Group by Group)
- [x] Move Estimate-related methods to EstimateAjaxHandler
- [x] Move Room-related methods to RoomAjaxHandler
- [x] Move Product-related methods to ProductAjaxHandler
- [x] Move Form-related methods to FormAjaxHandler
- [x] Move Customer-related methods to CustomerAjaxHandler
- [x] Move Suggestion-related methods to SuggestionAjaxHandler
- [x] Move Upgrade-related methods to UpgradeAjaxHandler

### Phase 3: Testing and Switch Over
- [ ] Test all handlers to ensure they're working correctly
- [x] Rename files to replace the originals:
  - [x] Rename class-ajax-handler-new.php to class-ajax-handler.php
  - [x] Rename class-product-estimator-new.php to class-product-estimator.php

### Phase 4: Cleanup and Documentation
- [ ] Remove this migration plan file
- [ ] Update CLAUDE.md to document the new architecture
- [ ] Add additional AJAX handler types as needed

## Method Mapping

Below is a mapping of methods from the original AjaxHandler class to their new homes:

### EstimateAjaxHandler
- getEstimatesList
- getEstimatesData
- addNewEstimate
- removeEstimate
- checkEstimatesExist
- store_single_estimate
- check_estimate_stored
- get_secure_pdf_url
- request_copy_estimate
- updateTotals (private helper method)

### RoomAjaxHandler
- getRoomsForEstimate
- addNewRoom
- removeRoom
- addProductToRoom
- removeProductFromRoom
- replaceProductInRoom
- prepareAndAddProductToRoom

### ProductAjaxHandler
- getVariationEstimator
- ajaxSearchCategoryProducts
- get_category_products
- get_product_data_for_storage
- getPricingRuleForProduct (private helper method)
- getPricingMethodForProduct (private helper method)
- prepareAdditionalProductData (private helper method)

### FormAjaxHandler
- getEstimateSelectionForm
- getNewEstimateForm
- getNewRoomForm
- getRoomSelectionForm

### CustomerAjaxHandler
- updateCustomerDetails
- deleteCustomerDetails
- check_customer_details
- request_store_contact
- send_store_contact_email (private helper method)
- send_estimate_email (private helper method)

### SuggestionAjaxHandler
- handle_fetch_suggestions_for_modified_room
- generateSuggestions
- get_similar_products
- fetch_and_format_similar_products (private helper method)

### UpgradeAjaxHandler
- get_product_upgrades

## Implementation Notes

1. **Helper Methods**: Private helper methods should generally move with the public methods they support
2. **Shared Functionality**: Methods needed by multiple handlers should be moved to the base class or a utility trait
3. **Dependencies**: Update requires/uses as needed in each new class
4. **Testing**: Test each handler thoroughly after method migration

## Fallback Plan

If issues are encountered during the migration:
1. Revert to the original class-ajax-handler.php file
2. Remove the new AjaxHandlerNew reference from the ProductEstimator class
3. Diagnose and fix issues before attempting migration again
