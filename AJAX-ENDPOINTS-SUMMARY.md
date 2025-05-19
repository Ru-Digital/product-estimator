# Product Estimator AJAX Endpoints Summary

## Overview

This document provides a comprehensive list of all AJAX endpoints in the Product Estimator plugin, organized by handler. The plugin uses a modular AJAX architecture where each handler is responsible for a specific domain.

## Frontend JavaScript Service Methods

The `AjaxService.js` provides the following methods for making AJAX requests:

```javascript
// Core methods
getProductDataForStorage(data, bypassCache)
addProductToRoom(data)
replaceProductInRoom(data)
getSimilarProducts(data, bypassCache)
addNewEstimate(data)
addNewRoom(data)
fetchSuggestionsForModifiedRoom(data, bypassCache)
removeProductFromRoom(data)
removeRoom(data)
removeEstimate(data)
getVariationEstimator(data)
```

The `DataService.js` provides high-level wrappers around these:

```javascript
// Product operations
getProductVariationData(productId)
addProductToRoom(roomId, productId, estimateId)
replaceProductInRoom(estimateId, roomId, oldProductId, newProductId, parentProductId, replaceType)
removeProductFromRoom(estimateId, roomId, productIndex, productId)

// Estimate operations
addNewEstimate(formData, productId)
removeEstimate(estimateId)

// Room operations
addNewRoom(formData, estimateId)
removeRoom(estimateId, roomId)

// Data fetching
getSimilarProducts(productId, roomArea, bypassCache)
getSuggestedProducts(estimateId, roomId)
checkEstimatesExist()
getEstimatesData(bypassCache)
getEstimate(estimateId)
getRoomsForEstimate(estimateId, bypassCache)
getProductsForRoom(estimateId, roomId)
```

## Backend PHP AJAX Handlers

### 1. EstimateAjaxHandler

Handles estimate-related database operations and PDF generation:

- `store_single_estimate` - Store estimate data in the database
- `check_estimate_stored` - Check if an estimate is stored in the database
- `get_secure_pdf_url` - Get a secure URL for PDF generation
- `request_copy_estimate` - Request a copy of an estimate

**Removed endpoints** (now handled by localStorage):
- ~~get_estimates_list~~
- ~~get_estimates_data~~
- ~~add_new_estimate~~
- ~~remove_estimate~~
- ~~check_estimates_exist~~

### 2. RoomAjaxHandler

Handles product operations within rooms:

- `add_product_to_room` - Add a product to a room (kept for backward compatibility)
- `remove_product_from_room` - Remove a product from a room (kept for backward compatibility)
- `replace_product_in_room` - Replace a product in a room (kept for backward compatibility)
- `check_primary_category_conflict` - Check for primary category conflicts

**Removed endpoints** (now handled by localStorage):
- ~~get_rooms_for_estimate~~
- ~~add_new_room~~
- ~~remove_room~~

### 3. ProductAjaxHandler

Handles product data operations:

- `get_variation_estimator` - Get variation estimator HTML
- `search_category_products` - Search products within a category
- `get_category_products` - Get products from a category
- `get_product_data_for_storage` - Get comprehensive product data including similar products
- `product_estimator_get_product_variations` - Get product variation data

### 4. FormAjaxHandler

Handles form template rendering:

- `get_estimate_selection_form` - Get estimate selection form HTML
- `get_new_estimate_form` - Get new estimate form HTML
- `get_new_room_form` - Get new room form HTML
- `get_room_selection_form` - Get room selection form HTML

### 5. CustomerAjaxHandler

Handles customer-related operations:

- `update_customer_details` - Update/validate customer details
- `delete_customer_details` - Delete customer details
- `check_customer_details` - Check if customer details exist
- `request_store_contact` - Request store contact

### 6. SuggestionAjaxHandler

Handles product suggestions (only loaded if feature is enabled):

- `fetch_suggestions_for_modified_room` - Get suggestions based on room products
- `get_suggested_products` - Generate product suggestions
- `get_similar_products` - Get similar products for a specific product

## Data Flow

1. **Local Storage First**: Most operations update localStorage first for immediate UI response
2. **Asynchronous Server Sync**: Server requests are made asynchronously after local updates
3. **Cache Management**: The AjaxService maintains caches for frequently accessed data
4. **Validation**: All endpoints include nonce verification and parameter validation

## Critical Endpoints for Core Functionality

### Essential for Product Operations:
- `get_product_data_for_storage` - Critical for fetching product details
- `product_estimator_get_product_variations` - Required for variable products

### Essential for Database Operations:
- `store_single_estimate` - Saves estimates permanently
- `get_secure_pdf_url` - Generates PDF estimates

### Essential for UI:
- Form endpoints - Required for rendering forms
- `get_variation_estimator` - Required for variation selection

## Feature-Dependent Endpoints

- Suggestion endpoints only load when `suggested_products_enabled` is true
- Similar products functionality depends on product settings

## Error Handling

- Primary category conflicts return expected responses (not errors)
- Duplicate product additions return expected responses (not errors)
- All endpoints include proper error messages for validation failures