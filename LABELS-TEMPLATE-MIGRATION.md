# Labels Template Migration Guide

This document provides guidance on migrating templates to use the new hierarchical label structure.

## Overview

As part of the label reorganization, we've created a new hierarchical structure for labels to improve organization and maintainability. To ensure all templates use the new structure, we've developed a migration tool and process.

## Migration Tool

A template migration tool has been created to automate the process of updating templates to use the new label structure. The tool is located at `/tools/migrate-template-labels.js`.

### Features

- Automatically updates `data-label` attributes in HTML templates
- Also updates related attributes like `data-aria-label`, `data-title-label`, and `data-placeholder-label`
- Creates backups of modified files
- Supports dry-run mode to preview changes
- Provides detailed reports on changes made

### Usage

```bash
# Basic usage (processes all templates in src/templates)
node tools/migrate-template-labels.js

# Specify a different directory
node tools/migrate-template-labels.js src/views

# Dry run mode (no files will be modified)
node tools/migrate-template-labels.js --dry-run
# or
node tools/migrate-template-labels.js -d

# Skip creating backup files
node tools/migrate-template-labels.js --no-backup
# or
node tools/migrate-template-labels.js -n
```

## Manual Migration Process

If you prefer to manually update templates, follow these steps:

1. Look for any `data-label` attributes in your template
2. Check the corresponding mapping in `LABELS-PATH-MAPPING.md`
3. Replace the old path with the new hierarchical path
4. Also update any related attributes like `data-aria-label` or `data-placeholder-label`

## New Label Structure

The new label structure follows this pattern:

```
category.subcategory.key
```

For example:
- `buttons.core.save` instead of `buttons.save`
- `forms.estimate.name.label` instead of `forms.estimate_name`
- `ui.empty_states.no_products` instead of `ui_elements.no_products`

## Key Mapping Categories

### Button Labels

All button labels are now organized by function:

- `buttons.core.*` - Universal button actions (save, cancel, confirm, etc.)
- `buttons.estimate.*` - Estimate-related buttons
- `buttons.product.*` - Product-related buttons
- `buttons.room.*` - Room-related buttons
- `buttons.dialogs.*` - Dialog-specific buttons

### Form Labels

Form labels now include form type and field structure:

- `forms.estimate.*` - Estimate form fields
- `forms.room.*` - Room form fields
- `forms.customer.*` - Customer form fields
- `forms.validation.*` - Validation messages
- `forms.placeholders.*` - Default placeholders

Fields have subkeys for different aspects:
- `forms.estimate.name.label` - Field label
- `forms.estimate.name.placeholder` - Field placeholder
- `forms.estimate.name.help_text` - Field help text

### UI Element Labels

UI element labels are now more logically categorized:

- `ui.headings.*` - Section headings
- `ui.labels.*` - Text labels
- `ui.toggles.*` - Toggle buttons
- `ui.empty_states.*` - Empty state messages
- `ui.loading.*` - Loading indicators
- `ui.dialogs.*` - Dialog components
  - `ui.dialogs.titles.*` - Dialog titles
  - `ui.dialogs.bodies.*` - Dialog body content

### Message Labels

Messages are now categorized by type:

- `messages.success.*` - Success messages
- `messages.error.*` - Error messages
- `messages.warning.*` - Warning messages
- `messages.info.*` - Informational messages
- `messages.confirm.*` - Confirmation messages

## Common Issues During Migration

1. **Missing mappings**: If you encounter a label that doesn't have a mapping, check `LABELS-PATH-MAPPING.md` for the most complete list.

2. **Overlapping concepts**: Some concepts might appear in multiple categories (e.g., both as a button and a UI element). Use the appropriate category based on the context.

3. **Javascript references**: Don't forget to update any JavaScript files that directly reference labels.

## Testing After Migration

After migrating templates, perform these tests:

1. **Visual inspection**: Check all UI components to ensure labels are displayed correctly
2. **Dynamic content**: Test dynamic content that uses labels
3. **Form validation**: Test form validation messages
4. **Analytics**: If using label analytics, check that tracking still works

## Need Help?

If you encounter any issues during migration, check:

1. The path mapping document (`LABELS-PATH-MAPPING.md`)
2. The default values document (`LABELS-DEFAULT-VALUES.md`)
3. The label reorganization plan (`LABELS-REORGANIZATION-PLAN.md`)