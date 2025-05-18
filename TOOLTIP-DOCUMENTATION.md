# Tooltip System Documentation

This document describes the tooltip system implemented in the Product Estimator plugin. The system supports both simple instructional tooltips and rich content tooltips for displaying complex information like product notes.

## Overview

The tooltip system consists of:
- `Tooltip.js` - The main JavaScript class that handles tooltip functionality
- `tooltip.html` - Template for simple tooltips
- `tooltip-rich.html` - Template for rich content tooltips
- `Tooltip.scss` - Styles for both tooltip types

## Features

1. **Simple Tooltips**: Small informational tooltips that appear on hover
2. **Rich Content Tooltips**: Larger tooltips with structured content (notes, details, etc.)
3. **Automatic positioning**: Tooltips position themselves to stay within viewport
4. **Keyboard accessibility**: Tooltips appear on focus for keyboard navigation
5. **Event delegation**: Handles dynamic content without rebinding events

## Usage

### Simple Tooltips

To add a simple tooltip to any element:

```html
<span data-tooltip="This is a helpful tip" data-tooltip-position="top">
  Hover over me
</span>
```

#### Attributes:
- `data-tooltip`: The tooltip text to display
- `data-tooltip-position`: Position relative to element (top, bottom, left, right)

#### JavaScript API:
```javascript
// Add a tooltip dynamically
modalManager.tooltip.addTooltip(element, 'Tooltip text', {
  position: 'top'
});

// Update tooltip text
modalManager.tooltip.updateTooltip(element, 'New tooltip text');

// Remove tooltip
modalManager.tooltip.removeTooltip(element);
```

### Rich Content Tooltips

Rich tooltips are activated by click and can display structured content:

```html
<span class="pe-info-button" 
      data-tooltip-type="rich" 
      data-tooltip-position="right"
      data-tooltip-title="Product Information">
  <span class="dashicons dashicons-info"></span>
</span>
```

#### Attributes:
- `data-tooltip-type="rich"`: Marks this as a rich tooltip
- `data-tooltip-position`: Position preference (top, bottom, left, right)
- `data-tooltip-title`: Title for the tooltip header
- `data-tooltip-notes`: Custom notes content (optional)
- `data-tooltip-details`: Custom details content (optional)

#### JavaScript API:
```javascript
// Add a rich tooltip dynamically
modalManager.tooltip.addTooltip(element, null, {
  type: 'rich',
  position: 'right',
  title: 'Product Information',
  notes: 'Custom notes content',
  details: 'Custom details content'
});

// Update rich tooltip content
modalManager.tooltip.updateTooltip(element, {
  title: 'New Title',
  notes: 'Updated notes',
  details: 'Updated details'
});
```

### Product Notes in Include Items

The include-item template has been updated to show product notes in a rich tooltip:

```html
<div class="include-item" data-product-id="">
  <span class="product-includes-icon">
    <span class="dashicons dashicons-plus-alt"></span>
  </span>
  <div class="include-item-name product-name"></div>
  <span class="pe-info-button" 
        data-tooltip-type="rich" 
        data-tooltip-position="right" 
        data-tooltip-title="Product Information">
  </span>
  <div class="include-item-prices">
    <div class="include-item-total-price product-price"></div>
  </div>
</div>
```

The Tooltip component automatically retrieves product data from the room's product collection.

## Styling Classes

### Simple Tooltips
- `.pe-tooltip`: Base tooltip class
- `.pe-tooltip-top/bottom/left/right`: Position variants
- `.pe-tooltip-content`: Content container
- `.pe-tooltip-arrow`: Arrow element

### Rich Tooltips
- `.pe-tooltip-rich`: Rich tooltip class
- `.pe-tooltip-header`: Header section
- `.pe-tooltip-title`: Title text
- `.pe-tooltip-close`: Close button
- `.pe-tooltip-notes-content`: Notes section
- `.pe-tooltip-details-content`: Details section

### Helper Elements
- `.pe-tooltip-icon`: Simple info icon with tooltip
- `.pe-info-button`: Clickable info button for rich tooltips

## Implementation Notes

1. **Template Loading**: Tooltip templates must be registered in `template-loader.js`
2. **Initialization**: The Tooltip component is initialized in `ModalManager.initializeManagers()`
3. **Global Access**: Available globally via `window.productEstimator.tooltip`
4. **Event Handling**: Uses event delegation for dynamic content
5. **Positioning**: Automatically adjusts position to stay within viewport

## Adding Tooltips to New Elements

To add tooltips to new elements:

1. For simple tooltips, add the required data attributes:
   ```html
   <span data-tooltip="Help text" data-tooltip-position="top">Element</span>
   ```

2. For rich tooltips, use the info button pattern:
   ```html
   <span class="pe-info-button" 
         data-tooltip-type="rich"
         data-tooltip-position="right"
         data-tooltip-title="Title">
   </span>
   ```

3. Or use the JavaScript API after the element is rendered:
   ```javascript
   const element = document.querySelector('.my-element');
   modalManager.tooltip.addTooltip(element, 'Tooltip text', {
     position: 'bottom'
   });
   ```

## Best Practices

1. **Keep simple tooltips brief**: Use them for short explanatory text
2. **Use rich tooltips for complex data**: Product details, notes, multi-line content
3. **Position appropriately**: Consider the element's location on screen
4. **Ensure accessibility**: Include aria-label attributes on trigger elements
5. **Test positioning**: Verify tooltips display correctly near viewport edges
6. **Use semantic HTML**: Use appropriate elements for tooltip triggers

## Example Use Cases

1. **Form Field Help**:
   ```html
   <label>
     Email Address
     <span data-tooltip="We'll never share your email" 
           data-tooltip-position="right"
           class="pe-tooltip-icon">
     </span>
   </label>
   ```

2. **Product Information**:
   ```html
   <div class="product-card">
     <h3>Product Name</h3>
     <span class="pe-info-button"
           data-tooltip-type="rich"
           data-tooltip-position="right"
           data-tooltip-title="Product Details">
     </span>
   </div>
   ```

3. **Dynamic Content**:
   ```javascript
   // After rendering dynamic content
   const newElement = document.createElement('span');
   newElement.textContent = 'Dynamic content';
   container.appendChild(newElement);
   
   // Add tooltip
   modalManager.tooltip.addTooltip(newElement, 'This was added dynamically', {
     position: 'top'
   });
   ```

## Troubleshooting

1. **Tooltip not appearing**: 
   - Check that the tooltip templates are loaded
   - Verify the Tooltip instance is initialized
   - Ensure data attributes are correct

2. **Position issues**:
   - Check viewport boundaries
   - Verify z-index in CSS
   - Test different position values

3. **Content not updating**:
   - Use updateTooltip() method for dynamic updates
   - Ensure product data is available for rich tooltips
   - Check data attribute values

4. **Click events not working**:
   - Verify data-tooltip-type="rich" is set
   - Check event delegation is working
   - Ensure no other click handlers are preventing propagation