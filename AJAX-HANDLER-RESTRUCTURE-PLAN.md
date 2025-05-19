# AJAX Handler Restructuring Plan

## Current State Analysis

After removing session-based endpoints, we have the following active AJAX handlers:

### 1. EstimateAjaxHandler
**Active Endpoints:**
- `store_single_estimate` - Stores estimate data in database
- `check_estimate_stored` - Checks if estimate exists in database
- `get_secure_pdf_url` - Gets PDF generation URL
- `request_copy_estimate` - Requests estimate copy

### 2. ProductAjaxHandler
**Active Endpoints:**
- `get_variation_estimator` - Gets variation estimator HTML
- `search_category_products` - Searches products in category
- `get_category_products` - Gets products from category
- `get_product_data_for_storage` - Gets complete product data
- `product_estimator_get_product_variations` - Gets product variations

### 3. RoomAjaxHandler
**Active Endpoints:**
- `check_primary_category_conflict` - Validates primary category rules

### 4. CustomerAjaxHandler
**Active Endpoints:**
- `delete_customer_details` - Deletes customer details
- `check_customer_details` - Checks customer details
- `request_store_contact` - Requests store contact

### 5. FormAjaxHandler
**Active Endpoints:**
- `get_estimate_selection_form` - Gets estimate selection form
- `get_new_estimate_form` - Gets new estimate form
- `get_new_room_form` - Gets new room form
- `get_room_selection_form` - Gets room selection form

### 6. SuggestionAjaxHandler
**Active Endpoints:**
- `fetch_suggestions_for_modified_room` - Gets room suggestions
- `get_suggested_products` - Generates product suggestions
- `get_similar_products` - Gets similar products

## Restructuring Plan

Since we've removed most session-related endpoints, we can consolidate the handlers:

### 1. Consolidate into Fewer Handlers

**StorageAjaxHandler** (for database operations)
- Move from EstimateAjaxHandler:
  - `store_single_estimate`
  - `check_estimate_stored`
  - `get_secure_pdf_url`
  - `request_copy_estimate`
- Move from CustomerAjaxHandler:
  - `request_store_contact`

**ProductAjaxHandler** (keep as is)
- All current endpoints remain

**ValidationAjaxHandler** (for validation operations)
- Move from RoomAjaxHandler:
  - `check_primary_category_conflict`
- Move from CustomerAjaxHandler:
  - `check_customer_details`

**UIAjaxHandler** (for UI components)
- All FormAjaxHandler endpoints
- Can be renamed from FormAjaxHandler

**SuggestionAjaxHandler** (keep as is)
- All current endpoints remain

### 2. Remove Unused Handlers

- **CustomerAjaxHandler** - After moving endpoints, only `delete_customer_details` remains
  - This endpoint appears unused (no JS calls found)
  - Can be removed entirely

- **RoomAjaxHandler** - After moving `check_primary_category_conflict`
  - Can be removed entirely

- **EstimateAjaxHandler** - After moving all endpoints
  - Can be removed entirely

### 3. Benefits of Restructuring

1. **Clearer Organization**: Endpoints grouped by function
2. **Fewer Files**: Reduced from 6 handlers to 4
3. **Better Naming**: Handler names reflect their purpose
4. **Easier Maintenance**: Related functionality in same file

### 4. Implementation Steps

1. Create new handler files:
   - `class-storage-ajax-handler.php`
   - `class-validation-ajax-handler.php`

2. Move endpoints to new handlers

3. Update `AjaxHandlerLoader` to load new handlers

4. Remove old unused handlers

5. Update any references in other files

### 5. Final Structure

```
includes/ajax/
├── class-ajax-handler-base.php      (base class)
├── class-ajax-handler-loader.php    (loader)
├── class-storage-ajax-handler.php   (database operations)
├── class-product-ajax-handler.php   (product data)
├── class-validation-ajax-handler.php (validation)
├── class-ui-ajax-handler.php        (forms/UI)
└── class-suggestion-ajax-handler.php (suggestions)
```