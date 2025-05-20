# Labels System Phase 2 Cleanup Plan

## Overview

This document outlines the plan for cleaning up the Labels System Phase 2 implementation to ensure that the import, reset category, and bulk edit functionality work correctly. The export functionality has already been verified as working.

## Issues Identified

1. **Duplicate JavaScript Implementation**:
   - Both `LabelSettingsModule.js` and `LabelsManagement.js` contain almost identical functionality
   - Duplicate event bindings may cause unexpected behavior

2. **Missing PHP AJAX Handler for Search**:
   - The search functionality will not be implemented as part of the current phase

3. **Nonce Handling Inconsistencies**:
   - Inconsistent nonce names and acquisition logic across files

4. **Duplicate PHP Methods**:
   - Methods duplicated between `LabelsSettingsModule` and `LabelsBulkOperations` classes

## Cleanup Plan

### 1. Remove Duplicate JavaScript Code

Since we already verified that the functionality in `LabelSettingsModule.js` works correctly, we will:

- Remove `LabelsManagement.js` file entirely
- Ensure `LabelSettingsModule.js` handles all required functionality:
  - Export/Import
  - Reset Category
  - Bulk Edit

### 2. Address Search Functionality

- Remove search-related code from JavaScript and PHP since it won't be implemented
- Remove search UI elements from HTML templates

### 3. Standardize Nonce Handling

- Use consistent nonce names across JavaScript and PHP
- Simplify nonce acquisition logic in JavaScript

### 4. Refactor PHP Methods for Clarity

- Review duplicate methods between PHP classes
- Consider refactoring to use a single source of truth for shared methods

## Implementation Steps

1. **Update LabelSettingsModule.js**:
   - Clean up any remaining issues
   - Ensure all event bindings work correctly

2. **Update class-labels-settings-module.php**:
   - Remove search-related code
   - Standardize nonce handling
   - Fix any AJAX handler issues

3. **Update class-labels-bulk-operations.php**:
   - Remove search-related code
   - Review duplicate methods

4. **Test the Three Core Features**:
   - Import
   - Reset Category to Defaults
   - Bulk Edit

## Expected Outcome

After implementing these changes, the three core features (import, reset category, and bulk edit) should work correctly without JavaScript errors or PHP warnings. The labels system should maintain data integrity throughout all operations and provide helpful feedback to the user.

## Removed Features

- Search functionality (as per the updated requirements)