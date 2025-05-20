# Labels System Testing Plan

## Overview

This document outlines the testing plan for the remaining features of Phase 2 of the Labels System implementation. The export functionality has already been verified as working correctly. This plan focuses on testing import, reset category, and bulk edit functionality.

## 1. Import Labels Testing

### Test Cases

1. **Valid Import**
   - Export current labels first to create a valid JSON file
   - Make some changes to the exported JSON file
   - Import the modified file
   - Verify that the changes are applied correctly
   - Check that the version number is updated
   - Verify cache invalidation (a page refresh should show the new labels)

2. **Invalid Import Format**
   - Create an invalid JSON file with syntax errors
   - Try to import the invalid file
   - Verify appropriate error message is displayed

3. **Missing Labels Structure**
   - Create a valid JSON file without the expected "labels" property
   - Try to import the file
   - Verify appropriate error message is displayed

4. **Permission Testing**
   - Logout and login as a non-admin user
   - Try to access the import functionality
   - Verify it's not accessible to unauthorized users

## 2. Reset Category to Defaults Testing

### Test Cases

1. **Reset Buttons Category**
   - Make changes to several label fields in the "Buttons" category
   - Click "Reset Category to Defaults" while on the Buttons tab
   - Confirm the warning dialog
   - Verify all button labels are reset to their default values
   - Check that other categories remain unchanged

2. **Reset Messages Category**
   - Make changes to several label fields in the "Messages" category
   - Click "Reset Category to Defaults" while on the Messages tab
   - Confirm the warning dialog
   - Verify all message labels are reset to their default values
   - Check that other categories remain unchanged

3. **Cancel Reset**
   - Attempt to reset a category
   - Cancel the confirmation dialog
   - Verify no changes are made

## 3. Bulk Edit Testing

### Test Cases

1. **Multiple Label Bulk Edit**
   - Add several labels from different categories to the bulk edit section
   - Make changes to each label
   - Click "Apply Changes"
   - Verify changes are applied correctly to all edited labels

2. **Bulk Edit Without Changes**
   - Add labels to the bulk edit section
   - Make no changes
   - Click "Apply Changes"
   - Verify appropriate "No changes to apply" message is shown

3. **Remove Items from Bulk Edit**
   - Add several labels to the bulk edit section
   - Remove one label using the "Remove" button
   - Verify only the remaining labels are shown in the bulk edit section

4. **Cancel Bulk Edit**
   - Add labels to the bulk edit section
   - Click "Cancel"
   - Verify bulk edit section is hidden
   - Verify no changes are made to any labels

## 4. Integration Testing

### Test Cases

1. **Combined Operations**
   - Export current labels
   - Make changes using bulk edit
   - Reset a category
   - Import modified labels
   - Verify all operations work correctly in sequence

2. **Frontend Label Display**
   - Make changes to labels using all available methods
   - Navigate to the frontend
   - Verify that changes appear correctly in the UI

3. **Performance Testing**
   - Make changes to labels
   - Measure page load time on frontend pages that use labels
   - Verify no significant performance degradation

## Test Environment

- WordPress Admin interface
- Test on Chrome, Firefox, and Safari browsers
- Desktop and mobile views (responsive design)

## Expected Results

All functionality should work as described without JavaScript errors or PHP warnings. The labels system should maintain data integrity throughout all operations and provide helpful feedback to the user.

## Reporting Issues

Document any issues found during testing, including:
- Exact steps to reproduce
- Expected outcome
- Actual outcome
- Screenshots if applicable
- Browser/device information