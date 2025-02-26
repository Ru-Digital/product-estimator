# Product Estimator Modal Usage Guide

This guide explains how to implement and use the global "Add to estimator" modal feature.

## Implementation Steps

1. **Add the Files**

   Place the following files in your plugin directory:

   - `includes/frontend/class-product-estimator-modal.php`
   - `public/js/product-estimator-modal.js`
   - `public/css/product-estimator-modal.css`

2. **Update Your Main Plugin Class**

   Update your `includes/ProductEstimator.php` file to include the new `define_modal_hooks()` method as shown in the integration code.

## Using the Modal

### Shortcode Method

You can add an "Add to estimator" button anywhere on your site using the shortcode:

```
[estimator_button]
```

With optional parameters:

```
[estimator_button text="Get an Estimate" class="my-custom-class" product_id="123"]
```

Parameters:
- `text`: The button text (default: "Add to estimator")
- `class`: Additional CSS classes for styling
- `product_id`: Optional ID of a product to pre-select in the estimator

### PHP Method

You can also add the button directly in your theme templates:

```php
<?php echo do_shortcode('[estimator_button]'); ?>
```

Or for more control:

```php
<?php
echo do_shortcode('[estimator_button text="Custom Text" product_id="123"]');
?>
```

### WooCommerce Integration

To add the button to WooCommerce product pages, add this to your theme's `functions.php`:

```php
function add_estimator_button_to_woocommerce() {
    echo do_shortcode('[estimator_button text="Request Estimate"]');
}
add_action('woocommerce_after_add_to_cart_button', 'add_estimator_button_to_woocommerce');
```

## Customization

### CSS Customization

You can customize the appearance by adding styles to your theme:

```css
/* Change button color */
.product-estimator-button {
    background-color: #your-color;
}

/* Change modal header */
.product-estimator-modal-header {
    background-color: #your-color;
}
```

### JavaScript Events

The modal triggers several events you can hook into:

```javascript
// Listen for modal open
$(document).on('product_estimator_modal_opened', function() {
    console.log('Modal opened');
});

// Listen for modal close
$(document).on('product_estimator_modal_closed', function() {
    console.log('Modal closed');
});
```

## Troubleshooting

### Modal Not Appearing

- Check browser console for JavaScript errors
- Ensure jQuery is loaded on the page
- Verify that the shortcode is correctly implemented

### Form Not Loading

- Check AJAX requests in browser network tab
- Verify the AJAX URL is correct
- Ensure the nonce is being generated correctly

### Style Conflicts

If your theme is causing style conflicts:

1. Increase the CSS specificity in the modal CSS
2. Add `!important` to critical style rules
3. Try changing the z-index value if other elements appear on top of the modal

## Support

For further assistance, contact support@rudigital.com.au
