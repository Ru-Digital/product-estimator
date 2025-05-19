# AJAX Handler Analysis

## Currently Used AJAX Endpoints (from frontend JavaScript)

Based on analysis of DataService.js and AjaxService.js:

### Product AJAX Handler (class-product-ajax-handler.php)
- ✓ **get_product_data_for_storage** - Used extensively for product data, variations, and suggestions
- ✓ **product_estimator_get_product_variations** - Used for getting variation data
- ❌ **get_variation_estimator** - Not used in current frontend
- ❌ **search_category_products** - Not used in current frontend  
- ❌ **get_category_products** - Not used in current frontend

### Storage AJAX Handler (class-storage-ajax-handler.php)
- ❌ **store_single_estimate** - Not used (localStorage is now primary storage)
- ❌ **check_estimate_stored** - Not used
- ❌ **get_secure_pdf_url** - Not used
- ❌ **request_copy_estimate** - Not used
- ❌ **request_store_contact** - Not used

### Suggestion AJAX Handler (class-suggestion-ajax-handler.php)
- ✓ **fetch_suggestions_for_modified_room** - Used when removing products
- ✓ **get_similar_products** - Used for getting similar products
- ❌ **get_suggested_products** - Not used (uses the other method)

### UI AJAX Handler (class-ui-ajax-handler.php)
- ❌ **get_estimate_selection_form** - Not used (templates loaded directly)
- ❌ **get_new_estimate_form** - Not used (templates loaded directly)
- ❌ **get_new_room_form** - Not used (templates loaded directly)
- ❌ **get_room_selection_form** - Not used (templates loaded directly)

### Validation AJAX Handler (class-validation-ajax-handler.php)
- ❌ **check_primary_category_conflict** - Not used (validation done client-side)
- ❌ **check_customer_details** - Not used

## Recommendations

1. **Keep ProductAjaxHandler** but remove unused methods:
   - Remove: getVariationEstimator, ajaxSearchCategoryProducts, get_category_products

2. **Remove entire handlers**:
   - StorageAjaxHandler - Not needed since localStorage is primary storage
   - UIAjaxHandler - Templates are loaded directly, not via AJAX
   - ValidationAjaxHandler - Validation is done client-side

3. **Simplify SuggestionAjaxHandler**:
   - Keep: fetch_suggestions_for_modified_room, get_similar_products
   - Remove: generateSuggestions (deprecated)

4. **Clean up ProductAjaxHandler**:
   - Simplify the get_product_data_for_storage method to remove duplicate logic
   - Remove the isProductInPrimaryCategories method (duplicated in multiple handlers)