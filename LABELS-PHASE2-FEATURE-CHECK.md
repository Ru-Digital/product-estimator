# Labels System Phase 2 Feature Check

## Overview

This document outlines the plan for testing and fixing the three key features of the Labels System Phase 2 implementation: import, reset category to defaults, and bulk edit. The export functionality has already been verified as working correctly.

## Current Implementation Status

Based on our analysis:

1. **LabelSettingsModule.js** is the primary JavaScript file being used in the admin interface.
2. **LabelsManagement.js** exists but doesn't appear to be actively used.
3. Bulk functions exist in both class-labels-bulk-operations.php and class-labels-settings-module.php.

## Testing Plan

### 1. Import Functionality

**Implementation Files:**
- PHP: class-labels-settings-module.php (ajax_import_labels method)
- JS: LabelSettingsModule.js (handleImport method)

**Test Steps:**
1. Export current labels first to create a valid JSON file
2. Make some changes to the exported JSON file
3. Import the modified file using the "Import Labels" button
4. Verify that changes are applied correctly after page refresh

**Expected Outcome:**
- Labels should be successfully imported
- Success message should be displayed
- Version number should be updated
- Changes should be visible after page refresh

### 2. Reset Category to Defaults Functionality

**Implementation Files:**
- PHP: class-labels-settings-module.php (ajax_reset_category_labels method)
- JS: LabelSettingsModule.js (handleResetCategory method)

**Test Steps:**
1. Make changes to several labels in a category (e.g., "Buttons")
2. Click "Reset Category to Defaults" button while on that category tab
3. Confirm the warning dialog
4. Check if labels in that category are reset to default values

**Expected Outcome:**
- Labels in the selected category should be reset to default values
- Success message should be displayed
- Only the selected category should be affected
- Changes should be visible immediately or after page refresh

### 3. Bulk Edit Functionality

**Implementation Files:**
- PHP: class-labels-settings-module.php (ajax_bulk_update_labels method)
- JS: LabelSettingsModule.js (handleBulkEditTrigger, showBulkEditSection, handleBulkUpdate methods)

**Test Steps:**
1. Trigger bulk edit on several labels (need to verify how this is initiated in the UI)
2. Make changes to the labels in the bulk edit form
3. Click "Apply Changes" button
4. Verify changes are applied correctly

**Expected Outcome:**
- Bulk edit section should be shown with the selected labels
- Changes should be successfully applied
- Success message should be displayed
- Changes should be visible immediately or after page refresh

## Potential Issues and Fixes

### Import Issues
- Verify correct nonce is being sent from JavaScript
- Check if file data is properly read and parsed

### Reset Category Issues
- Current category detection logic in JavaScript is complex and may fail
- Improve category selection logic if needed

### Bulk Edit Issues
- Verify how bulk edit is triggered in the UI (possibly through a custom button or option)
- Check data format consistency between JavaScript and PHP

## Action Plan

1. **Clean Up Duplicate Code:**
   - Remove redundant code in class-labels-bulk-operations.php if all functionality is duplicated
   - Remove LabelsManagement.js if it's not being used

2. **Test Each Feature:**
   - Follow test steps above for each feature
   - Document any issues encountered

3. **Fix Issues:**
   - Make targeted fixes for any problems found
   - Test again to ensure functionality works correctly

## Next Steps

After verification and fixes, update the documentation to reflect the current state of the implementation and any changes made.