<?php
namespace RuDigital\ProductEstimator\Includes;

/**
 * Centralized hierarchical label structure definition
 *
 * This class provides the single source of truth for all label structure
 * definitions used throughout the plugin.
 *
 * @since      3.0.0
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes
 */
class LabelsStructure {

    /**
     * Get the complete hierarchical label structure
     *
     * @since    3.0.0
     * @return   array    Complete hierarchical label structure
     */
    public static function get_structure() {
        return [
            'estimate_management' => [
                'estimate_actions' => [
                    'buttons' => [
                        'save_button' => [
                            'label' => __('Save Estimate', 'product-estimator'),
                            'description' => __('Button text for saving the current estimate', 'product-estimator'),
                            'usage' => __('Used in the estimate editor toolbar and form submission', 'product-estimator')
                        ],
                        'print_button' => [
                            'label' => __('Print Estimate', 'product-estimator'),
                            'description' => __('Button text for printing the estimate as PDF', 'product-estimator'),
                            'usage' => __('Used in estimate view and actions menu for PDF generation', 'product-estimator')
                        ],
                        'request_copy_button' => [
                            'label' => __('Request a Copy', 'product-estimator'),
                            'description' => __('Button text for requesting a copy of the estimate', 'product-estimator'),
                            'usage' => __('Used in estimate sharing options and customer actions', 'product-estimator')
                        ],
                        'delete_button' => [
                            'label' => __('Delete Estimate', 'product-estimator'),
                            'description' => __('Button text for deleting the current estimate', 'product-estimator'),
                            'usage' => __('Used in estimate management interfaces and confirmation dialogs', 'product-estimator')
                        ]
                    ]
                ],
                'create_new_estimate_form' => [
                    'fields' => [
                        'estimate_name_field' => [
                            'label' => __('Estimate Name', 'product-estimator'),
                            'placeholder' => __('Enter estimate name', 'product-estimator'),
                            'validation' => [
                                'required' => __('Estimate name is required', 'product-estimator'),
                                'min_length' => __('Estimate name must be at least 2 characters', 'product-estimator')
                            ]
                        ]
                    ],
                    'buttons' => [
                        'create_button' => [
                            'label' => __('Create Estimate', 'product-estimator')
                        ]
                    ],
                    'heading' => [
                        'title' => __('Create New Estimate', 'product-estimator')
                    ]
                ],
                'estimate_selection_form' => [
                    'fields' => [
                        'estimate_choice_field' => [
                            'label' => __('Choose an estimate:', 'product-estimator'),
                            'default_option' => __('-- Select an Estimate --', 'product-estimator')
                        ]
                    ],
                    'buttons' => [
                        'start_new_button' => [
                            'label' => __('Start New Estimate', 'product-estimator')
                        ]
                    ],
                    'heading' => [
                        'title' => __('Select an estimate', 'product-estimator')
                    ],
                    'messages' => [
                        'no_estimates_available_message' => [
                            'text' => __('No estimates available', 'product-estimator')
                        ]
                    ]
                ],
                'empty_states' => [
                    'no_estimates_message' => [
                        'text' => __('You don\'t have any estimates yet.', 'product-estimator')
                    ]
                ],
                'success_messages' => [
                    'estimate_saved' => [
                        'text' => __('Estimate saved successfully', 'product-estimator')
                    ]
                ]
            ],
            'room_management' => [
                'add_new_room_form' => [
                    'fields' => [
                        'room_name_field' => [
                            'label' => __('Room Name', 'product-estimator'),
                            'placeholder' => __('Enter room name', 'product-estimator'),
                            'validation' => [
                                'required' => __('Room name is required', 'product-estimator'),
                                'min_length' => __('Room name must be at least 2 characters', 'product-estimator')
                            ]
                        ],
                        'room_width_field' => [
                            'label' => __('Width (m)', 'product-estimator'),
                            'placeholder' => __('Width', 'product-estimator'),
                            'validation' => [
                                'invalid' => __('Please enter a valid width', 'product-estimator')
                            ]
                        ],
                        'room_length_field' => [
                            'label' => __('Length (m)', 'product-estimator'),
                            'placeholder' => __('Length', 'product-estimator'),
                            'validation' => [
                                'invalid' => __('Please enter a valid length', 'product-estimator')
                            ]
                        ]
                    ],
                    'buttons' => [
                        'add_button' => [
                            'label' => __('Add Room', 'product-estimator')
                        ],
                        'add_product_and_room_button' => [
                            'label' => __('Add Room & Product', 'product-estimator')
                        ]
                    ]
                ],
                'room_selection_form' => [
                    'fields' => [
                        'room_choice_field' => [
                            'label' => __('Choose a room:', 'product-estimator'),
                            'default_option' => __('-- Select a Room --', 'product-estimator')
                        ]
                    ],
                    'buttons' => [
                        'continue_shopping_button' => [
                            'label' => __('Continue Shopping', 'product-estimator')
                        ],
                        'done_shopping_button' => [
                            'label' => __('Done Shopping', 'product-estimator')
                        ],
                        'create_new_room_button' => [
                            'label' => __('+ Add New Room', 'product-estimator')
                        ]
                    ],
                    'heading' => [
                        'title' => __('Select Room', 'product-estimator')
                    ],
                    'messages' => [
                        'no_rooms_message' => [
                            'text' => __('No rooms available. Create a new room to get started.', 'product-estimator')
                        ]
                    ]
                ],
                'empty_states' => [
                    'no_rooms_message' => [
                        'text' => __('No rooms added to this estimate yet.', 'product-estimator')
                    ]
                ],
                'success_messages' => [
                    'room_added' => [
                        'text' => __('Room added successfully', 'product-estimator')
                    ]
                ]
            ],
            'product_management' => [
                'product_actions' => [
                    'buttons' => [
                        'add_to_room_button' => [
                            'label' => __('Add to Room', 'product-estimator')
                        ],
                        'remove_from_room_button' => [
                            'label' => __('Remove', 'product-estimator')
                        ],
                        'view_details_button' => [
                            'label' => __('View Details', 'product-estimator')
                        ],
                        'select_variation_button' => [
                            'label' => __('Select Variation', 'product-estimator')
                        ]
                    ]
                ],
                'similar_products' => [
                    'buttons' => [
                        'view_similar_button' => [
                            'label' => __('View Similar', 'product-estimator'),
                            'description' => __('Button to view similar products', 'product-estimator'),
                            'usage' => __('Used in product detail view to show similar products', 'product-estimator')
                        ],
                        'add_similar_button' => [
                            'label' => __('Add Similar Product', 'product-estimator'),
                            'description' => __('Button to add a similar product to the room', 'product-estimator'),
                            'usage' => __('Used in similar products carousel', 'product-estimator')
                        ]
                    ],
                    'headings' => [
                        'similar_products_heading' => [
                            'text' => __('Similar Products', 'product-estimator'),
                            'description' => __('Heading for similar products section', 'product-estimator'),
                            'usage' => __('Used in product detail view for similar products section', 'product-estimator')
                        ]
                    ],
                    'messages' => [
                        'no_similar_products_message' => [
                            'text' => __('No similar products available', 'product-estimator'),
                            'description' => __('Message shown when no similar products exist', 'product-estimator'),
                            'usage' => __('Used in similar products section when empty', 'product-estimator')
                        ],
                        'similar_product_added_message' => [
                            'text' => __('Similar product added to room', 'product-estimator'),
                            'description' => __('Success message when similar product is added', 'product-estimator'),
                            'usage' => __('Shown after successfully adding a similar product', 'product-estimator')
                        ]
                    ]
                ],
                'product_additions' => [
                    'buttons' => [
                        'view_additions_button' => [
                            'label' => __('View Additions', 'product-estimator'),
                            'description' => __('Button to view additional products', 'product-estimator'),
                            'usage' => __('Used in product detail view to show additional products', 'product-estimator')
                        ],
                        'add_addition_button' => [
                            'label' => __('Add to Room', 'product-estimator'),
                            'description' => __('Button to add an additional product to the room', 'product-estimator'),
                            'usage' => __('Used in product additions section', 'product-estimator')
                        ],
                        'remove_addition_button' => [
                            'label' => __('Remove Addition', 'product-estimator'),
                            'description' => __('Button to remove an additional product', 'product-estimator'),
                            'usage' => __('Used in room view for additional products', 'product-estimator')
                        ]
                    ],
                    'headings' => [
                        'additional_products_heading' => [
                            'text' => __('Additional Products', 'product-estimator'),
                            'description' => __('Heading for additional products section', 'product-estimator'),
                            'usage' => __('Used in product detail view for additional products section', 'product-estimator')
                        ],
                        'recommended_additions_heading' => [
                            'text' => __('Recommended Additions', 'product-estimator'),
                            'description' => __('Heading for recommended additional products', 'product-estimator'),
                            'usage' => __('Used in product detail view for recommended additions', 'product-estimator')
                        ]
                    ],
                    'messages' => [
                        'no_additions_message' => [
                            'text' => __('No additional products available', 'product-estimator'),
                            'description' => __('Message shown when no additional products exist', 'product-estimator'),
                            'usage' => __('Used in additional products section when empty', 'product-estimator')
                        ],
                        'addition_added_message' => [
                            'text' => __('Additional product added to room', 'product-estimator'),
                            'description' => __('Success message when additional product is added', 'product-estimator'),
                            'usage' => __('Shown after successfully adding an additional product', 'product-estimator')
                        ],
                        'addition_removed_message' => [
                            'text' => __('Additional product removed from room', 'product-estimator'),
                            'description' => __('Success message when additional product is removed', 'product-estimator'),
                            'usage' => __('Shown after successfully removing an additional product', 'product-estimator')
                        ]
                    ],
                    'labels' => [
                        'price_label' => [
                            'text' => __('Price:', 'product-estimator'),
                            'description' => __('Label for additional product price', 'product-estimator'),
                            'usage' => __('Used in additional product displays', 'product-estimator')
                        ],
                        'total_price_label' => [
                            'text' => __('Total with additions:', 'product-estimator'),
                            'description' => __('Label for total price including additions', 'product-estimator'),
                            'usage' => __('Used in product pricing display when additions are included', 'product-estimator')
                        ]
                    ]
                ],
                // Product-related dialogs
                'product_added_success_dialog' => [
                    'title' => [
                        'text' => __('Success', 'product-estimator'),
                        'description' => __('Dialog title for successful product addition', 'product-estimator'),
                        'usage' => __('Used when a product is successfully added to a room', 'product-estimator')
                    ],
                    'message' => [
                        'text' => __('Product added successfully!', 'product-estimator'),
                        'description' => __('Success message when product is added', 'product-estimator'),
                        'usage' => __('Shown after successfully adding a product to room', 'product-estimator')
                    ]
                ],
                'product_add_error_dialog' => [
                    'title' => [
                        'text' => __('Error', 'product-estimator'),
                        'description' => __('Dialog title for product addition error', 'product-estimator'),
                        'usage' => __('Used when there is an error adding a product', 'product-estimator')
                    ],
                    'message' => [
                        'text' => __('Error adding product. Please try again.', 'product-estimator'),
                        'description' => __('Error message when product cannot be added', 'product-estimator'),
                        'usage' => __('Shown when product addition fails', 'product-estimator')
                    ]
                ],
                'product_remove_error_dialog' => [
                    'title' => [
                        'text' => __('Error', 'product-estimator'),
                        'description' => __('Dialog title for product removal error', 'product-estimator'),
                        'usage' => __('Used when there is an error removing a product', 'product-estimator')
                    ],
                    'message' => [
                        'text' => __('Error removing product. Please try again.', 'product-estimator'),
                        'description' => __('Error message when product cannot be removed', 'product-estimator'),
                        'usage' => __('Shown when product removal fails', 'product-estimator')
                    ]
                ],
                'product_exists_dialog' => [
                    'title' => [
                        'text' => __('Product Already Exists', 'product-estimator'),
                        'description' => __('Dialog title when a product already exists in the room', 'product-estimator'),
                        'usage' => __('Used in ProductManager when attempting to add a duplicate product', 'product-estimator')
                    ],
                    'message' => [
                        'text' => __('This product already exists in the selected room.', 'product-estimator'),
                        'description' => __('Dialog message when a product already exists in the room', 'product-estimator'),
                        'usage' => __('Used in ProductManager to inform user about duplicate product', 'product-estimator')
                    ]
                ],
                'primary_conflict_dialog' => [
                    'title' => [
                        'text' => __('A flooring product already exists in the selected room', 'product-estimator'),
                        'description' => __('Dialog title for primary category conflict', 'product-estimator'),
                        'usage' => __('Used when adding a primary category product that conflicts with existing one', 'product-estimator')
                    ],
                    'message' => [
                        'text' => __('The {room_name} Room already contains "{existing_product_name}". Would you like to replace it with "{new_product_name}"?', 'product-estimator'),
                        'description' => __('Message for primary category conflict with placeholders', 'product-estimator'),
                        'usage' => __('Used when primary category conflict is detected', 'product-estimator')
                    ],
                    'buttons' => [
                        'replace_existing_button' => [
                            'label' => __('Replace the existing product', 'product-estimator'),
                            'description' => __('Button to replace existing product with new one', 'product-estimator'),
                            'usage' => __('Used in primary category conflict dialog', 'product-estimator')
                        ],
                        'go_back_button' => [
                            'label' => __('Go back to room select', 'product-estimator'),
                            'description' => __('Button to return to room selection', 'product-estimator'),
                            'usage' => __('Used in primary category conflict dialog to cancel and go back', 'product-estimator')
                        ]
                    ]
                ],
                'remove_product_dialog' => [
                    'title' => [
                        'text' => __('Remove Product', 'product-estimator'),
                        'description' => __('Dialog title for product removal confirmation', 'product-estimator'),
                        'usage' => __('Used when user wants to remove a product from room', 'product-estimator')
                    ],
                    'message' => [
                        'text' => __('Are you sure you want to remove this product from the room?', 'product-estimator'),
                        'description' => __('Confirmation message for product removal', 'product-estimator'),
                        'usage' => __('Used in product removal confirmation dialog', 'product-estimator')
                    ]
                ],
                'product_replaced_dialog' => [
                    'title' => [
                        'text' => __('Product Replaced Successfully', 'product-estimator'),
                        'description' => __('Success dialog title when product is replaced', 'product-estimator'),
                        'usage' => __('Used after successful product replacement', 'product-estimator')
                    ],
                    'message' => [
                        'text' => __('The product has been successfully replaced in your estimate.', 'product-estimator'),
                        'description' => __('Success message when product is replaced', 'product-estimator'),
                        'usage' => __('Used in success dialog after product replacement', 'product-estimator')
                    ]
                ],
                'empty_states' => [
                    'no_products_message' => [
                        'text' => __('No products added to this room yet.', 'product-estimator')
                    ]
                ],
                'success_messages' => [
                    'product_added' => [
                        'text' => __('Product added successfully', 'product-estimator')
                    ]
                ]
            ],
            'customer_details' => [
                'customer_details_form' => [
                    'fields' => [
                        'customer_name_field' => [
                            'label' => __('Customer Name', 'product-estimator'),
                            'placeholder' => __('Enter your name', 'product-estimator'),
                            'validation' => [
                                'required' => __('Customer name is required', 'product-estimator'),
                                'min_length' => __('Customer name must be at least 2 characters', 'product-estimator')
                            ]
                        ],
                        'customer_email_field' => [
                            'label' => __('Email Address', 'product-estimator'),
                            'placeholder' => __('your@email.com', 'product-estimator'),
                            'validation' => [
                                'required' => __('Email address is required', 'product-estimator'),
                                'invalid' => __('Please enter a valid email address', 'product-estimator')
                            ]
                        ],
                        'customer_phone_field' => [
                            'label' => __('Phone Number', 'product-estimator'),
                            'placeholder' => __('Your phone number', 'product-estimator'),
                            'validation' => [
                                'required' => __('Phone number required', 'product-estimator'),
                                'invalid' => __('Please enter a valid phone number', 'product-estimator')
                            ]
                        ],
                        'customer_postcode_field' => [
                            'label' => __('Postcode', 'product-estimator'),
                            'placeholder' => __('Your postcode', 'product-estimator'),
                            'validation' => [
                                'required' => __('Postcode required', 'product-estimator'),
                                'invalid' => __('Please enter a valid postcode', 'product-estimator')
                            ]
                        ]
                    ],
                    'heading' => [
                        'title' => __('Your Details', 'product-estimator')
                    ]
                ]
            ],
            'common_ui' => [
                'general_actions' => [
                    'buttons' => [
                        // Basic action buttons
                        'save_button' => [
                            'label' => __('Save', 'product-estimator'),
                            'description' => __('Generic save button text', 'product-estimator'),
                            'usage' => __('Used for save actions across the application', 'product-estimator')
                        ],
                        'cancel_button' => [
                            'label' => __('Cancel', 'product-estimator'),
                            'description' => __('Generic cancel button text', 'product-estimator'),
                            'usage' => __('Used for cancel actions in forms and dialogs', 'product-estimator')
                        ],
                        'close_button' => [
                            'label' => __('Close', 'product-estimator'),
                            'description' => __('Generic close button text', 'product-estimator'),
                            'usage' => __('Used to close windows, modals, or panels', 'product-estimator')
                        ],
                        'continue_button' => [
                            'label' => __('Continue', 'product-estimator'),
                            'description' => __('Generic continue button text', 'product-estimator'),
                            'usage' => __('Used in multi-step processes', 'product-estimator')
                        ],
                        'back_button' => [
                            'label' => __('Back', 'product-estimator'),
                            'description' => __('Generic back button text', 'product-estimator'),
                            'usage' => __('Used for navigation to previous step or page', 'product-estimator')
                        ],
                        'previous_button' => [
                            'label' => __('Previous', 'product-estimator'),
                            'description' => __('Generic previous button text', 'product-estimator'),
                            'usage' => __('Used in paginated or stepped interfaces', 'product-estimator')
                        ],
                        'next_button' => [
                            'label' => __('Next', 'product-estimator'),
                            'description' => __('Generic next button text', 'product-estimator'),
                            'usage' => __('Used in paginated or stepped interfaces', 'product-estimator')
                        ],
                        // Action-specific buttons
                        'confirm_button' => [
                            'label' => __('Confirm', 'product-estimator'),
                            'description' => __('Generic confirm button text', 'product-estimator'),
                            'usage' => __('Used in confirmation dialogs', 'product-estimator')
                        ],
                        'ok_button' => [
                            'label' => __('OK', 'product-estimator'),
                            'description' => __('Generic OK button text', 'product-estimator'),
                            'usage' => __('Used in alert dialogs and acknowledgments', 'product-estimator')
                        ],
                        'yes_button' => [
                            'label' => __('Yes', 'product-estimator'),
                            'description' => __('Yes button for yes/no confirmations', 'product-estimator'),
                            'usage' => __('Used in yes/no confirmation dialogs', 'product-estimator')
                        ],
                        'no_button' => [
                            'label' => __('No', 'product-estimator'),
                            'description' => __('No button for yes/no confirmations', 'product-estimator'),
                            'usage' => __('Used in yes/no confirmation dialogs', 'product-estimator')
                        ],
                        // Destructive action buttons
                        'delete_button' => [
                            'label' => __('Delete', 'product-estimator'),
                            'description' => __('Delete button for destructive actions', 'product-estimator'),
                            'usage' => __('Used in delete confirmation dialogs', 'product-estimator')
                        ],
                        'remove_button' => [
                            'label' => __('Remove', 'product-estimator'),
                            'description' => __('Remove button for removal actions', 'product-estimator'),
                            'usage' => __('Used in removal confirmation dialogs', 'product-estimator')
                        ],
                        'replace_button' => [
                            'label' => __('Replace', 'product-estimator'),
                            'description' => __('Replace button for replacement actions', 'product-estimator'),
                            'usage' => __('Used in replacement confirmation dialogs', 'product-estimator')
                        ]
                    ],
                    'loading_states' => [
                        'generic_loading' => [
                            'text' => __('Loading...', 'product-estimator')
                        ]
                    ],
                    'error_messages' => [
                        'general_error' => [
                            'text' => __('An error occurred. Please try again.', 'product-estimator')
                        ],
                        'network_error' => [
                            'text' => __('Network error. Please check your connection.', 'product-estimator')
                        ],
                        'save_failed' => [
                            'text' => __('Failed to save. Please try again.', 'product-estimator')
                        ]
                    ]
                ],
                // Generic dialog structures (buttons reference general_actions.buttons)
                'generic_confirm_dialog' => [
                    'title' => [
                        'text' => __('Confirm Action', 'product-estimator'),
                        'description' => __('Default title for generic confirmation dialogs', 'product-estimator'),
                        'usage' => __('Used when no specific title is provided', 'product-estimator')
                    ],
                    'message' => [
                        'text' => __('Are you sure you want to proceed?', 'product-estimator'),
                        'description' => __('Default confirmation message', 'product-estimator'),
                        'usage' => __('Used when no specific message is provided', 'product-estimator')
                    ]
                    // Uses: general_actions.buttons.confirm_button and general_actions.buttons.cancel_button
                ],
                'generic_delete_dialog' => [
                    'title' => [
                        'text' => __('Confirm Delete', 'product-estimator'),
                        'description' => __('Default title for delete confirmation dialogs', 'product-estimator'),
                        'usage' => __('Used for generic delete confirmations', 'product-estimator')
                    ],
                    'message' => [
                        'text' => __('Are you sure you want to delete this?', 'product-estimator'),
                        'description' => __('Generic delete confirmation message', 'product-estimator'),
                        'usage' => __('Default message for delete confirmation dialogs', 'product-estimator')
                    ]
                    // Uses: general_actions.buttons.delete_button and general_actions.buttons.cancel_button
                ],
                'generic_alert_dialog' => [
                    'title' => [
                        'text' => __('Alert', 'product-estimator'),
                        'description' => __('Default title for alert dialogs', 'product-estimator'),
                        'usage' => __('Used for informational alerts', 'product-estimator')
                    ]
                    // Uses: general_actions.buttons.ok_button
                ],
                'generic_yes_no_dialog' => [
                    'title' => [
                        'text' => __('Confirm', 'product-estimator'),
                        'description' => __('Default title for yes/no dialogs', 'product-estimator'),
                        'usage' => __('Used for yes/no confirmations', 'product-estimator')
                    ]
                    // Uses: general_actions.buttons.yes_button and general_actions.buttons.no_button
                ]
            ],
            'pdf' => [
                'title' => __('Product Estimate', 'product-estimator'),
                'customer_details' => __('Customer Details', 'product-estimator'),
                'estimate_summary' => __('Estimate Summary', 'product-estimator'),
                'price_range' => __('Price Range', 'product-estimator'),
                'from' => __('From', 'product-estimator'),
                'to' => __('To', 'product-estimator'),
                'date' => __('Date', 'product-estimator'),
                'page' => __('Page', 'product-estimator'),
                'of' => __('of', 'product-estimator'),
                'company_name' => get_bloginfo('name'),
                'company_phone' => '',
                'company_email' => get_bloginfo('admin_email'),
                'company_website' => get_bloginfo('url'),
                'footer_text' => __('Thank you for your business', 'product-estimator'),
                'disclaimer' => __('This estimate is valid for 30 days', 'product-estimator')
            ]
        ];
    }

    /**
     * Get a specific section of the label structure
     *
     * @since    3.0.0
     * @param    string  $section  Section name (e.g., 'estimate_management', 'common_ui')
     * @return   array             Section structure or empty array if not found
     */
    public static function get_section($section) {
        $structure = self::get_structure();
        return $structure[$section] ?? [];
    }

    /**
     * Get all available section names
     *
     * @since    3.0.0
     * @return   array    Array of section names
     */
    public static function get_section_names() {
        return array_keys(self::get_structure());
    }

    /**
     * Validate if a label path exists in the structure
     *
     * @since    3.0.0
     * @param    string  $path  Dot notation path (e.g., 'common_ui.general_actions.buttons.save_button.label')
     * @return   bool           True if path exists
     */
    public static function path_exists($path) {
        $keys = explode('.', $path);
        $current = self::get_structure();

        foreach ($keys as $key) {
            if (!isset($current[$key])) {
                return false;
            }
            $current = $current[$key];
        }

        return true;
    }

    /**
     * Get a flattened version of the structure for performance
     *
     * @since    3.0.0
     * @return   array    Flattened structure with dot notation keys
     */
    public static function get_flattened() {
        $structure = self::get_structure();
        $flattened = [];

        self::flatten_recursive($structure, '', $flattened);

        return $flattened;
    }

    /**
     * Get structure with only label values (no metadata like description/usage)
     * This is used for storing in the database - we don't need to store admin metadata
     *
     * @return array Structure with only label values
     */
    public static function get_label_values_only() {
        $structure = self::get_structure();
        return self::strip_metadata($structure);
    }

    /**
     * Recursively strip metadata from structure, keeping only label values
     *
     * @param array $structure Structure to clean
     * @return array Cleaned structure
     */
    private static function strip_metadata($structure) {
        $cleaned = [];

        foreach ($structure as $key => $value) {
            if (is_array($value)) {
                // Check if this is a label definition (has 'label', 'text', 'placeholder', etc.)
                if (self::is_label_definition($value)) {
                    // Keep only the actual label values, strip metadata
                    $cleaned[$key] = self::filter_label_values($value);
                } else {
                    // This is a category/group, recurse
                    $cleaned[$key] = self::strip_metadata($value);
                }
            } else {
                // Keep primitive values as-is
                $cleaned[$key] = $value;
            }
        }

        return $cleaned;
    }

    /**
     * Check if an array represents a label definition
     *
     * @param array $array Array to check
     * @return bool True if this looks like a label definition
     */
    private static function is_label_definition($array) {
        // Label definitions contain keys like 'label', 'text', 'placeholder'
        $label_keys = ['label', 'text', 'placeholder', 'validation', 'default_option'];
        return !empty(array_intersect(array_keys($array), $label_keys));
    }

    /**
     * Filter label values, removing metadata keys
     *
     * @param array $label_def Label definition array
     * @return array Filtered array with only label values
     */
    private static function filter_label_values($label_def) {
        // Keep only actual label values, remove metadata
        $allowed_keys = ['label', 'text', 'placeholder', 'validation', 'default_option'];
        $filtered = [];

        foreach ($label_def as $key => $value) {
            if (in_array($key, $allowed_keys)) {
                $filtered[$key] = $value;
            }
        }

        return $filtered;
    }

    /**
     * Get description for a specific label path
     *
     * @param string $path Dot notation path to the label
     * @return string Label description or empty string if not found
     */
    public static function get_description($path) {
        return self::get_metadata($path, 'description');
    }

    /**
     * Get usage information for a specific label path
     *
     * @param string $path Dot notation path to the label
     * @return string Label usage info or empty string if not found
     */
    public static function get_usage($path) {
        return self::get_metadata($path, 'usage');
    }

    /**
     * Get metadata for a specific label path and key
     *
     * @param string $path Dot notation path to the label
     * @param string $key Metadata key (description, usage, etc.)
     * @return string Metadata value or empty string if not found
     */
    public static function get_metadata($path, $key) {
        $structure = self::get_structure();
        $keys = explode('.', $path);
        $current = $structure;

        // Navigate to the label
        foreach ($keys as $k) {
            if (isset($current[$k])) {
                $current = $current[$k];
            } else {
                return '';
            }
        }

        // Return the requested metadata key
        if (is_array($current) && isset($current[$key])) {
            return $current[$key];
        }

        return '';
    }

    /**
     * Recursively flatten the structure
     *
     * @since    3.0.0
     * @access   private
     * @param    array   $array      Array to flatten
     * @param    string  $prefix     Current path prefix
     * @param    array   &$result    Reference to result array
     */
    private static function flatten_recursive($array, $prefix, &$result) {
        foreach ($array as $key => $value) {
            $path = $prefix ? "{$prefix}.{$key}" : $key;

            if (is_array($value)) {
                self::flatten_recursive($value, $path, $result);
            } else {
                $result[$path] = $value;
            }
        }
    }
}
