# Test Plan: Replace Button Variation Check

## Overview
We've implemented variation checking for the replace button in the similar products carousel. When a user clicks the "Replace" button for a product that has variations, they should see a variation selection dialog before the replacement is performed.

## Implementation Details
Modified `RoomManager.js` to call `handleProductVariationSelection` instead of directly calling `replaceProductInRoom`. This ensures that:
1. If the product has variations, a selection dialog appears
2. If no variations exist, the replacement proceeds directly

## Test Scenarios

### 1. Replace Product Without Variations
- Click replace button on a simple product (no variations)
- Expected: Product is replaced immediately without any dialog

### 2. Replace Product With Variations
- Click replace button on a variable product
- Expected: 
  - Variation selection dialog appears
  - User must select a variation
  - After selection, the product is replaced with the selected variation

### 3. Cancel Variation Selection
- Click replace button on a variable product
- When variation dialog appears, click cancel
- Expected: 
  - Dialog closes
  - No replacement occurs
  - Original product remains in the room

### 4. Loading States
- During variation check and replacement
- Expected:
  - Replace button shows loading state
  - Button is disabled during process
  - Button returns to normal state after completion

### 5. Error Handling
- Test with a non-existent product ID
- Expected:
  - Appropriate error message is displayed
  - UI returns to normal state

## Code Changes Made

### RoomManager.js
Changed the replace button click handler from:
```javascript
this.modalManager.productManager.replaceProductInRoom(estimateId, roomId, replaceProductId, productId);
```

To:
```javascript
this.modalManager.productManager.handleProductVariationSelection(productId, {
  action: 'replace',
  estimateId: estimateId,
  roomId: roomId,
  replaceProductId: replaceProductId,
  button: replaceButton
});
```

## Testing Instructions

1. Clear browser cache and reload the plugin
2. Create an estimate with at least one room
3. Add a product to the room
4. View similar products for that product
5. Test replacing with both simple and variable products
6. Verify the variation dialog appears for variable products
7. Test all scenarios listed above

## Verification Checklist

- [ ] Replace simple product works without dialog
- [ ] Replace variable product shows variation selection
- [ ] Cancel button closes dialog without replacing
- [ ] Loading state appears during process
- [ ] Button state is properly managed
- [ ] Success message appears after replacement
- [ ] Similar products are refreshed after replacement
- [ ] Room totals are updated correctly