<?php
namespace RuDigital\ProductEstimator\Includes;

/**
 * Handles migration of labels to hierarchical structure
 *
 * @since      3.0.0
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes
 */
class LabelsMigration {
    /**
     * The option name for labels
     */
    const OPTION_NAME = 'product_estimator_labels';

    /**
     * The option name for labels version
     */
    const VERSION_OPTION_NAME = 'product_estimator_labels_version';

    /**
     * Run the migration
     */
    public static function migrate() {
        $existing_labels = get_option(self::OPTION_NAME, []);

        if (empty($existing_labels)) {
            // No existing labels, create default structure
            self::create_default_structure();
            return;
        }

        // Check if already migrated
        $version = get_option(self::VERSION_OPTION_NAME, '0');
        if (version_compare($version, '3.0.0', '>=')) {
            return; // Already migrated
        }

        // Create new hierarchical structure
        $new_structure = self::get_default_structure();

        // Save the new structure
        update_option(self::OPTION_NAME, $new_structure);
        update_option(self::VERSION_OPTION_NAME, '3.0.0');

        // Clear any existing caches
        delete_transient('pe_frontend_labels_cache');
        delete_transient('pe_frontend_frequent_labels');
    }

    /**
     * Get the default hierarchical label structure
     */
    public static function get_default_structure() {
        return [
            'estimate_management' => [
                'estimate_actions' => [
                    'buttons' => [
                        'save_button' => [
                            'label' => __('Save Estimate', 'product-estimator')
                        ],
                        'print_button' => [
                            'label' => __('Print Estimate', 'product-estimator')
                        ],
                        'request_copy_button' => [
                            'label' => __('Request a Copy', 'product-estimator')
                        ],
                        'delete_button' => [
                            'label' => __('Delete Estimate', 'product-estimator')
                        ]
                    ]
                ],
                'create_new_estimate_form' => [
                    'fields' => [
                        'estimate_name_field' => [
                            'label' => __('Estimate Name', 'product-estimator'),
                            'placeholder' => __('Enter estimate name', 'product-estimator')
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
                            'placeholder' => __('Enter room name', 'product-estimator')
                        ],
                        'room_width_field' => [
                            'label' => __('Width (m)', 'product-estimator'),
                            'placeholder' => __('Width', 'product-estimator')
                        ],
                        'room_length_field' => [
                            'label' => __('Length (m)', 'product-estimator'),
                            'placeholder' => __('Length', 'product-estimator')
                        ]
                    ],
                    'buttons' => [
                        'add_button' => [
                            'label' => __('Add Room', 'product-estimator')
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
                            'placeholder' => __('Enter your name', 'product-estimator')
                        ],
                        'customer_email_field' => [
                            'label' => __('Email Address', 'product-estimator'),
                            'placeholder' => __('your@email.com', 'product-estimator')
                        ],
                        'customer_phone_field' => [
                            'label' => __('Phone Number', 'product-estimator'),
                            'placeholder' => __('Your phone number', 'product-estimator')
                        ],
                        'customer_postcode_field' => [
                            'label' => __('Postcode', 'product-estimator'),
                            'placeholder' => __('Your postcode', 'product-estimator')
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
                        'save_button' => [
                            'label' => __('Save', 'product-estimator')
                        ],
                        'cancel_button' => [
                            'label' => __('Cancel', 'product-estimator')
                        ],
                        'close_button' => [
                            'label' => __('Close', 'product-estimator')
                        ],
                        'continue_button' => [
                            'label' => __('Continue', 'product-estimator')
                        ],
                        'back_button' => [
                            'label' => __('Back', 'product-estimator')
                        ],
                        'next_button' => [
                            'label' => __('Next', 'product-estimator')
                        ]
                    ]
                ],
                'confirmation_dialogs' => [
                    'buttons' => [
                        'confirm_button' => [
                            'label' => __('Confirm', 'product-estimator')
                        ],
                        'cancel_button' => [
                            'label' => __('Cancel', 'product-estimator')
                        ]
                    ],
                    'messages' => [
                        'confirm_delete' => [
                            'text' => __('Are you sure you want to delete this?', 'product-estimator')
                        ]
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
     * Create the default label structure
     */
    private static function create_default_structure() {
        $default_structure = self::get_default_structure();

        update_option(self::OPTION_NAME, $default_structure);
        update_option(self::VERSION_OPTION_NAME, '3.0.0');
    }

    /**
     * Update the labels version to refresh caches
     */
    public static function update_labels_version() {
        update_option(self::VERSION_OPTION_NAME, '3.0.0');
        delete_transient('pe_frontend_labels_cache');
        delete_transient('pe_frontend_frequent_labels');
    }
}