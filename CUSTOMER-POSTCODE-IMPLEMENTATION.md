# Customer Postcode Implementation

This document describes the implementation of customer postcode management during estimate creation.

## Overview

When creating a new estimate, the system now checks if the customer already has a postcode stored in their details. If they do, the postcode field is hidden. If they don't have a postcode and provide one during estimate creation, it's saved to their customer details for future use.

## Implementation Details

### 1. CustomerDetailsManager Updates

Added new methods to `CustomerDetailsManager.js`:

- `getCustomerDetails()`: Returns the current customer details from localStorage
- `hasPostcode()`: Checks if the customer already has a postcode
- `updatePostcodeIfNew(postcode)`: Updates the customer's postcode if it's new or different

```javascript
/**
 * Check if customer has a postcode
 * @returns {boolean} True if customer has a postcode
 */
hasPostcode() {
  const details = this.getCustomerDetails();
  return details.postcode && details.postcode.trim() !== '';
}

/**
 * Update customer details with postcode if new
 * @param {string} postcode - The postcode to add
 * @returns {boolean} True if postcode was added/updated
 */
updatePostcodeIfNew(postcode) {
  // Updates localStorage and sends to server
  // Dispatches 'customer_details_updated' event
}
```

### 2. EstimateManager Updates

Modified `showNewEstimateForm()` in `EstimateManager.js` to:

- Check if customer already has a postcode using CustomerDetailsManager
- Hide the customer details section if postcode exists
- Set appropriate data attributes on the form

```javascript
// Check if customer already has a postcode
const customerDetailsManager = window.productEstimator?.core?.customerDetailsManager;
if (customerDetailsManager && customerDetailsManager.hasPostcode()) {
  // Hide the entire customer details section since we have postcode
  const customerDetailsSection = formElement.querySelector('.customer-details-section');
  if (customerDetailsSection) {
    customerDetailsSection.style.display = 'none';
  }
  formElement.dataset.hasPostcode = 'true';
}
```

### 3. FormManager Updates

Modified `bindNewEstimateFormEvents()` in `FormManager.js` to:

- Extract postcode from form submission
- Update customer details if a new postcode is provided
- Include postcode in estimate creation data

```javascript
// Check if we need to update customer data with postcode
const customerDetailsManager = window.productEstimator?.core?.customerDetailsManager;
if (customerDetailsManager && postcode && postcode.trim() !== '') {
  // Update postcode in customer details if it's new or different
  customerDetailsManager.updatePostcodeIfNew(postcode);
}
```

## Data Flow

1. **Estimate Form Display**:
   - EstimateManager checks if customer has postcode via CustomerDetailsManager
   - If postcode exists, hides the postcode field
   - If no postcode, shows the field

2. **Form Submission**:
   - FormManager extracts postcode value
   - If postcode provided, updates customer details via CustomerDetailsManager
   - CustomerDetailsManager saves to localStorage and sends to server
   - Dispatches `customer_details_updated` event

3. **Data Persistence**:
   - Postcode stored in `productEstimatorCustomerData` localStorage key
   - Asynchronously synced to server via AJAX
   - Available for future estimate creations

## Event System

The implementation uses custom events to notify other components:

- `customer_details_updated`: Fired when customer details are updated
  - Contains the updated details in the event detail
  - Allows other components to react to changes

## Testing

A test file `test-customer-postcode.html` is provided to verify the functionality:

1. Check if customer has a postcode
2. Update/add a postcode
3. Clear customer data
4. View current customer details

## Benefits

1. **Better UX**: Customers don't need to re-enter their postcode for subsequent estimates
2. **Progressive Enhancement**: Builds up customer profile over time
3. **Backwards Compatible**: Works with existing customer data structure
4. **Event-Driven**: Other components can react to customer data changes
5. **Persistent**: Data saved to localStorage and synchronized with server

## Future Enhancements

1. Add similar handling for other customer fields (name, email, phone)
2. Add UI feedback when postcode is auto-filled
3. Allow users to override saved postcode if needed
4. Add validation for postcode format
</content>
</invoke>