#!/bin/bash

# Base directory for templates
BASE_DIR="/Users/rudigital/Documents/Projects/andersens/app/public/wp-content/plugins/product-estimator/src/templates"

# Create a backup directory
BACKUP_DIR="/Users/rudigital/Documents/Projects/andersens/app/public/wp-content/plugins/product-estimator/template-backup"
mkdir -p "$BACKUP_DIR"

echo "Creating backup of original templates in $BACKUP_DIR"
cp -r "$BASE_DIR"/* "$BACKUP_DIR"

echo "Moving templates to their new locations..."

# Common components
echo "Moving common components..."
mv "$BASE_DIR/components/loading-placeholder.html" "$BASE_DIR/components/common/loading.html"
mv "$BASE_DIR/components/select-option.html" "$BASE_DIR/components/common/select-option.html"

# Estimate components
echo "Moving estimate components..."
mv "$BASE_DIR/components/estimate-item.html" "$BASE_DIR/components/estimate/estimate-item.html"

# Product components
echo "Moving product components..."
mv "$BASE_DIR/components/product-item.html" "$BASE_DIR/components/product/product-item.html"
mv "$BASE_DIR/components/include-item.html" "$BASE_DIR/components/product/include-item.html"
mv "$BASE_DIR/components/note-item.html" "$BASE_DIR/components/product/note-item.html"
mv "$BASE_DIR/components/product-upgrade-item.html" "$BASE_DIR/components/product/upgrade-item.html"
mv "$BASE_DIR/components/similar-item.html" "$BASE_DIR/components/product/similar-item.html"
mv "$BASE_DIR/components/suggestion-item.html" "$BASE_DIR/components/product/suggestion-item.html"

# Room components
echo "Moving room components..."
mv "$BASE_DIR/components/room-item.html" "$BASE_DIR/components/room/room-item.html"
mv "$BASE_DIR/components/rooms-container.html" "$BASE_DIR/components/room/rooms-container.html"
mv "$BASE_DIR/components/room-actions-footer.html" "$BASE_DIR/components/room/actions-footer.html"

# Estimate forms
echo "Moving estimate forms..."
mv "$BASE_DIR/forms/new-estimate-form.html" "$BASE_DIR/forms/estimate/new-estimate.html"
mv "$BASE_DIR/forms/estimate-selection.html" "$BASE_DIR/forms/estimate/estimate-selection.html"

# Room forms
echo "Moving room forms..."
mv "$BASE_DIR/forms/new-room-form.html" "$BASE_DIR/forms/room/new-room.html"
mv "$BASE_DIR/forms/room-selection-form.html" "$BASE_DIR/forms/room/room-selection.html"

# Layout
echo "Moving layout templates..."
mv "$BASE_DIR/ui/modal-container.html" "$BASE_DIR/layout/modal-container.html"

# UI - Dialogs
echo "Moving dialog templates..."
mv "$BASE_DIR/ui/confirmation-dialog.html" "$BASE_DIR/ui/dialogs/confirmation.html"

# UI - Empty states
echo "Moving empty state templates..."
mv "$BASE_DIR/ui/estimates-empty.html" "$BASE_DIR/ui/empty-states/estimates-empty.html"
mv "$BASE_DIR/ui/products-empty.html" "$BASE_DIR/ui/empty-states/products-empty.html"
mv "$BASE_DIR/ui/rooms-empty.html" "$BASE_DIR/ui/empty-states/rooms-empty.html"

# UI - Errors
echo "Moving error templates..."
mv "$BASE_DIR/ui/form-error.html" "$BASE_DIR/ui/errors/form-error.html"
mv "$BASE_DIR/ui/product-error.html" "$BASE_DIR/ui/errors/product-error.html"
mv "$BASE_DIR/ui/room-error.html" "$BASE_DIR/ui/errors/room-error.html"

# UI - Messages
echo "Moving message templates..."
mv "$BASE_DIR/ui/modal-messages.html" "$BASE_DIR/ui/messages/modal-messages.html"

# UI - Toggle buttons
echo "Moving toggle button templates..."
mkdir -p "$BASE_DIR/components/common/toggle"
mv "$BASE_DIR/ui/toggle-button-hide.html" "$BASE_DIR/components/common/toggle/hide.html"
mv "$BASE_DIR/ui/toggle-button-show.html" "$BASE_DIR/components/common/toggle/show.html"

echo "Template reorganization complete!"