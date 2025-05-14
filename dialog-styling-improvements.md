# Dialog Styling System Improvements

## Overview

This document describes the improvements made to the dialog system in the Product Estimator plugin. The changes standardize dialog styling across the application and create a consistent API for showing different types of dialogs.

## Key Improvements

1. **Consistent Dialog Styling**
   - Added a `default` style for standard dialogs
   - Standardized styling for `success`, `warning`, `error`, and `delete` dialog types
   - Ensured consistent visual appearance across all manager components

2. **Helper Functions**
   - Created standardized helper functions for all dialog types:
     - `showSuccessDialog`: For success messages (green styling)
     - `showErrorDialog`: For error messages (red styling)
     - `showWarningDialog`: For warning/partial success messages (orange styling)
     - `showDeleteConfirmDialog`: For delete confirmations (red styling with Delete button)
     - `showConfirmDialog`: For standard confirmations (blue/primary styling)

3. **Refactored ConfirmationDialog**
   - Updated to always apply an action-specific class
   - Added normalization of action types for consistent styling
   - Improved handling of action types with automatic mapping

4. **Updated Manager Components**
   - Modified `EstimateManager` to use the standardized dialog helper functions
   - Updated `FormManager` to use the standardized dialog helper functions
   - Ensured consistent API usage across all manager components

## Usage Example

```javascript
// Import helper functions
import { showSuccessDialog, showErrorDialog, showWarningDialog, showDeleteConfirmDialog } from '@utils';

// Show a success dialog
showSuccessDialog(
  this.modalManager, 
  'Operation completed successfully.',
  'entity-type', 
  () => console.log('Dialog closed')
);

// Show an error dialog
showErrorDialog(
  this.modalManager,
  'An error occurred while processing your request.',
  'entity-type',
  () => console.log('Error acknowledged')
);

// Show a delete confirmation
showDeleteConfirmDialog(
  this.modalManager,
  'Are you sure you want to delete this item? This action cannot be undone.',
  () => {
    // Perform deletion
    console.log('Item deleted');
  },
  'entity-type',
  () => console.log('Deletion cancelled'),
  'Delete Item' // Custom title
);
```

## CSS Classes

The dialog system uses the following CSS classes for styling:

- `.pe-dialog-action-default`: Standard primary-colored dialogs
- `.pe-dialog-action-success`: Green success dialogs
- `.pe-dialog-action-warning`: Orange warning dialogs
- `.pe-dialog-action-error`: Red error dialogs
- `.pe-dialog-action-delete`: Red delete confirmation dialogs

## Benefits

1. **Consistency**: All dialogs throughout the application have consistent styling based on their purpose
2. **Maintainability**: Changes to dialog styling can be made in one place
3. **Developer Experience**: Simple API for showing different types of dialogs
4. **User Experience**: Users receive visual cues about the nature of dialogs through consistent coloring

## Future Improvements

1. Replace deprecated SASS `darken()` functions with `color.adjust()` functions
2. Add more specialized dialog types if needed
3. Implement dialog animation options
4. Add support for dialog icons