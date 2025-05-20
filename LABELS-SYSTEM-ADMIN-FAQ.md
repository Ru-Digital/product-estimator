# Labels System - Administrator FAQ

## General Questions

### What is the Labels System?
The Labels System allows you to customize text labels throughout the Product Estimator plugin without modifying code. This includes button text, form labels, messages, and other UI elements.

### Where can I find the Labels System?
Navigate to the WordPress admin area, go to Product Estimator settings, and click on the "Labels" tab.

### How are labels organized?
Labels are organized into the following categories:
- **Buttons** - Text for buttons throughout the estimator
- **Forms** - Labels for form fields, placeholders, and help text
- **Messages** - Success, error, and confirmation messages
- **UI Elements** - General user interface text and labels
- **PDF Export** - Labels specific to PDF generation

## Import/Export Features

### How do I export labels?
1. Go to the Labels settings tab
2. Click on the "Export Labels" button in the sidebar
3. A JSON file will be downloaded to your computer with all label settings

### How do I import labels?
1. Go to the Labels settings tab
2. Click on the "Import Labels" button in the sidebar
3. Select the JSON file you want to import
4. Confirm the import operation
5. The page will refresh with the imported labels

### Will importing labels overwrite my existing labels?
Yes, importing will replace all existing labels with the ones from the import file. Make sure to export your current labels first if you want to keep a backup.

### What format should the import file be in?
The import file must be in JSON format with the correct structure. The easiest way to ensure this is to export labels first, modify that file, and then import it back.

## Reset Category Feature

### How do I reset a category to default values?
1. Go to the Labels settings tab
2. Select the category you want to reset (e.g., "Buttons")
3. Click on the "Reset Category to Defaults" button in the sidebar
4. Confirm the reset operation
5. The category will be reset to default values

### Will resetting a category affect other categories?
No, resetting a category only affects labels within that specific category. All other categories will remain unchanged.

### Can I undo a category reset?
There is no built-in undo feature. However, if you exported your labels before resetting, you can import them back to restore the previous values.

## Bulk Edit Feature

### How do I bulk edit labels?
1. Go to the Labels settings tab
2. To add a label to bulk edit, click the edit icon next to each label you want to modify
3. The bulk edit panel will appear with all selected labels
4. Make changes to the labels
5. Click "Apply Changes" to save all modifications at once

### Can I remove a label from bulk edit?
Yes, in the bulk edit panel, click the "Remove" button next to any label you want to remove from the bulk edit operation.

### What happens if I cancel a bulk edit?
Clicking "Cancel" will close the bulk edit panel without applying any changes. Your labels will remain unchanged.

## Label Preview Feature

### What does the label preview show?
The preview displays a contextual example of how the label will appear in the interface, helping you understand where and how each label is used.

### Does the preview update in real-time?
Yes, as you type in a new value for a label, the preview will update in real-time to show how your changes will look.

## Cache and Performance

### Do I need to clear cache after making label changes?
No, the system automatically invalidates the cache when changes are made. Your changes should be visible immediately on the frontend.

### Will label customizations affect performance?
The Labels System is designed to be performance-optimized. Labels are cached for quick access, so customizations should not noticeably affect performance.

## Troubleshooting

### I made changes but don't see them on the frontend
Try the following:
1. Refresh the page completely (Ctrl+F5 or Cmd+Shift+R)
2. Check if you've saved the changes (look for the success message)
3. Verify you're looking at the correct label in the right context

### I'm getting an error during import
Ensure your import file:
1. Is valid JSON format
2. Contains the expected "labels" property
3. Has the correct structure for each category
4. Wasn't modified in a way that broke the format

### Some labels aren't working as expected
Labels must maintain specific formatting for placeholders. If a label contains placeholders like `%s` or `{0}`, make sure to keep these intact when editing.

## Getting Help

If you encounter issues with the Labels System, please contact support with the following information:
1. A screenshot of the issue
2. What you were trying to do when the issue occurred
3. Any error messages displayed
4. Your WordPress and plugin version information