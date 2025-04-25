<?php
namespace RuDigital\ProductEstimator\Includes\Utilities;

use setasign\Fpdi\Tcpdf\Fpdi;

/**
 * Enhanced PDF Generator with Native TCPDF Methods
 *
 * Handles PDF generation for estimates using native TCPDF/FPDI methods
 * for improved performance and reliability
 *
 * @since      1.1.0
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes/utilities
 */
class PDFGenerator {
    /**
     * Footer text content
     *
     * @var string
     */
    private $footer_text = '';

    /**
     * Footer contact details content
     *
     * @var string
     */
    private $footer_contact_details = '';

    /**
     * Estimate data for headers
     *
     * @var array
     */
    private $estimate_data = [];

    /**
     * Image data cache
     *
     * @var array
     */
    private $image_data = [];

    /**
     * Debug mode
     *
     * @var bool
     */
    private $debug = false;

    /**
     * Font constants
     */
    const FONT_FAMILY = 'helvetica';
    const COLOR_BRAND = [0, 131, 63]; // RGB: #00833F
    const COLOR_TEXT = [51, 51, 51];  // RGB: #333333
    const COLOR_LIGHT_TEXT = [102, 102, 102]; // RGB: #666666
    const COLOR_LIGHTER_TEXT = [136, 136, 136]; // RGB: #888888
    const COLOR_BORDER = [238, 238, 238]; // RGB: #eeeeee
    const COLOR_BG_LIGHT = [249, 249, 249]; // RGB: #f9f9f9
    const COLOR_BG_HEADER = [245, 245, 245]; // RGB: #f5f5f5

    /**
     * Constructor
     */
    public function __construct() {
        $this->debug = defined('WP_DEBUG') && WP_DEBUG;
        $this->image_data = [];
    }

    /**
     * Generate a PDF from an estimate
     *
     * @param array $estimate The estimate data
     * @return string PDF file contents
     */
    public function generate_pdf($estimate) {
        // Store estimate data for use in headers
        $this->estimate_data = $estimate;

        // Get settings for template and margins
        $options = get_option('product_estimator_settings', []);
        $template_id = isset($options['pdf_template']) ? intval($options['pdf_template']) : 0;
        $margin_top = isset($options['pdf_margin_top']) ? intval($options['pdf_margin_top']) : 15;
        $margin_bottom = isset($options['pdf_margin_bottom']) ? intval($options['pdf_margin_bottom']) : 15;

        // Store footer content in class properties for use in footer callback
        $this->footer_text = isset($options['pdf_footer_text']) ? $options['pdf_footer_text'] : '';
        $this->footer_contact_details = isset($options['pdf_footer_contact_details_content']) ? $options['pdf_footer_contact_details_content'] : '';

        // Create PDF object
        $pdf = $this->create_pdf_object();

        // Set document information
        $pdf->SetCreator('Product Estimator');
        $pdf->SetAuthor('Product Estimator');
        $pdf->SetTitle($estimate['name'] . ' - Estimate');
        $pdf->SetSubject('Product Estimate');

        // Setup for header and footer
        $pdf->setPrintHeader(true);
        $pdf->setPrintFooter(true);
        $pdf->setFooterMargin(10);
        $pdf->setHeaderMargin(10);

        // Set margins
        $pdf->SetMargins(15, $margin_top, 15);

        // Enable auto page break
        $pdf->SetAutoPageBreak(true, $margin_bottom + 25);

        // Store template info in the PDF object if we have a valid template
        $has_template = false;
        $template_idx = null;

        if ($template_id > 0 && class_exists('\\setasign\\Fpdi\\Tcpdf\\Fpdi')) {
            $template_path = get_attached_file($template_id);
            if ($template_path && file_exists($template_path)) {
                try {
                    $pdf->setSourceFile($template_path);
                    // Get first page as template
                    $template_idx = $pdf->importPage(1);
                    $has_template = true;

                    // Store template info as property for later use
                    $pdf->templateData = [
                        'has_template' => true,
                        'template_idx' => $template_idx
                    ];

                } catch (\Exception $e) {
                    if ($this->debug) {
                        error_log('Error using template PDF: ' . $e->getMessage());
                    }
                    $has_template = false;
                }
            }
        }

        // Add the first page
        $pdf->AddPage();

        // If we have a template, manually apply it to the first page
        if ($has_template && $template_idx !== null) {
            $pdf->useTemplate($template_idx, 0, 0, $pdf->getPageWidth(), $pdf->getPageHeight());
        }

        // Generate content using native TCPDF methods
        $this->render_content_native($pdf, $estimate);

        // Return the generated PDF
        return $pdf->Output('', 'S');
    }

    /**
     * Create the PDF object with custom header/footer handlers
     *
     * @return object PDF object
     */
    private function create_pdf_object() {
        // Get class properties to use in anonymous class
        $footer_text = $this->footer_text;
        $footer_contact_details = $this->footer_contact_details;
        $estimate_data = $this->estimate_data;
        $debug = $this->debug;

        // Create custom PDF class with extended functionality
        $pdf = new class($footer_text, $footer_contact_details, $estimate_data, $debug) extends Fpdi {
            protected $footer_text;
            protected $footer_contact_details;
            protected $estimate_data;
            protected $debug;
            public $templateData = null;

            /**
             * Constructor
             */
            public function __construct($footer_text, $footer_contact_details, $estimate_data, $debug) {
                parent::__construct();
                $this->footer_text = $footer_text;
                $this->footer_contact_details = $footer_contact_details;
                $this->estimate_data = $estimate_data;
                $this->debug = $debug;
            }

            /**
             * Override AddPage to ensure template is applied to each new page
             *
             * @param string $orientation Page orientation (P=portrait, L=landscape)
             * @param mixed $format Page format or array with width and height
             * @param bool $keepmargins If true, current margins are preserved
             * @param bool $tocpage If true, the page is a TOC page
             */
            public function AddPage($orientation='', $format='', $keepmargins=false, $tocpage=false) {
                // Call parent method to add the page
                parent::AddPage($orientation, $format, $keepmargins, $tocpage);

                // Apply template to the newly created page if template data exists
                if ($this->templateData !== null && $this->templateData['has_template']) {
                    try {
                        // Get the current page number
                        $currentPage = $this->getPage();

                        // Skip page 1 as it's already handled in generate_pdf
                        if ($currentPage > 1) {
                            // Apply template using the stored template index
                            $this->useTemplate(
                                $this->templateData['template_idx'],
                                0,                      // x position
                                0,                      // y position
                                $this->getPageWidth(),  // width
                                $this->getPageHeight(), // height
                                true                    // use original size
                            );
                        }

                        if ($this->debug) {
                            error_log("Applied template to page {$currentPage}");
                        }
                    } catch (\Exception $e) {
                        if ($this->debug) {
                            error_log('Error applying template to page: ' . $e->getMessage());
                        }
                    }
                }
            }

            /**
             * Page header - Using HTML for flexibility
             */
            public function Header() {
                // Position at the top margin
                $this->SetY(10);

                // Buffer to get HTML content from the header template
                ob_start();
                include PRODUCT_ESTIMATOR_PLUGIN_DIR . 'public/partials/pdf-templates/pdf-header-template.php';
                $header_html = ob_get_clean();

                // Apply the HTML header
                $this->writeHTML($header_html, true, false, true, false, '');

                // Add space after header
                $this->SetY(max($this->GetY(), 42));
                $this->Ln(5);
            }

            /**
             * Page footer - Using HTML for flexibility
             */
            public function Footer() {
                // Position at 15 mm from bottom
                $this->SetY(-32);

                // Set font
                $this->SetFont('helvetica', '', 9);

                // Footer content
                $this->StartTransform();
                $this->SetX(15);

                ob_start();
                include PRODUCT_ESTIMATOR_PLUGIN_DIR . 'public/partials/pdf-templates/pdf-footer-template.php';
                $html_footer = ob_get_clean();

                $this->writeHTML($html_footer, true, false, true, false, '');
                $this->StopTransform();

                // Page number
                $this->Ln(4);
                $this->Cell(0, 0, 'Page ' . $this->getAliasNumPage() . ' of ' . $this->getAliasNbPages(), 0, 0, 'C');
            }
        };

        return $pdf;
    }

    /**
     * Render the PDF content using native TCPDF methods
     * with improved page break handling and section spacing
     *
     * @param object $pdf PDF object
     * @param array $estimate Estimate data
     */
    private function render_content_native($pdf, $estimate) {
        // Get settings
        $options = get_option('product_estimator_settings', []);
        $default_markup = isset($estimate['default_markup']) ? floatval($estimate['default_markup']) : 0;

        // Process each room
        if (isset($estimate['rooms']) && is_array($estimate['rooms']) && !empty($estimate['rooms'])) {
            $room_count = 0;
            foreach ($estimate['rooms'] as $room_id => $room) {
                // Track which room we're on
                $room_count++;

                // Check if we need a page break before this room
                $needed_height = 100; // Approximate height needed for a room heading and at least one product
                if ($pdf->GetY() + $needed_height > $pdf->getPageHeight() - $pdf->getMargins()['bottom']) {
                    $pdf->AddPage(); // This will now automatically apply the template
                }

                $this->render_room_native($pdf, $room, $default_markup);

                // Add an extra line break after the last room to create more space before the total
                if ($room_count == count($estimate['rooms'])) {
                    $pdf->Ln(10);
                }
            }
        } else {
            // No rooms message
            $pdf->SetFont(self::FONT_FAMILY, 'I', 10);
            $pdf->SetTextColor(136, 136, 136);
            $pdf->Cell(0, 20, 'No rooms or products found in this estimate.', 1, 1, 'C', true);
        }

        // Total Estimate Section
        // Check if we need a page break before the total section
        $needed_height = 50; // Increased height needed for total section with spacing
        if ($pdf->GetY() + $needed_height > $pdf->getPageHeight() - $pdf->getMargins()['bottom']) {
            $pdf->AddPage(); // This will now automatically apply the template
        }

        // Clear any leftover content that might cause interference
        $current_x = $pdf->GetX();
        $current_y = $pdf->GetY();
        $pdf->SetFillColor(255, 255, 255); // White background
        $pdf->Rect($current_x, $current_y, $pdf->getPageWidth() - $pdf->getMargins()['left'] - $pdf->getMargins()['right'], 2, 'F');

        // Now render the total section with enough space
        $this->render_total_section($pdf, $estimate, $default_markup);
    }

    /**
     * Render a room header with correct dimensions formatting
     *
     * @param object $pdf PDF object
     * @param array $room Room data
     * @param float $default_markup Default markup percentage
     */
    private function render_room_native($pdf, $room, $default_markup) {
        // Calculate room area
        $room_width = isset($room['width']) ? floatval($room['width']) : 0;
        $room_length = isset($room['length']) ? floatval($room['length']) : 0;
        $room_area = $room_width * $room_length;

        // Remember starting position
        $startX = $pdf->GetX();
        $startY = $pdf->GetY();

        // Use price graph for room header instead of title + price text
        if (isset($room['min_total']) && isset($room['max_total'])) {
            // FORMAT FIX: Create dimensions string correctly
            $dimensions = $room_width . "x" . $room_length;
            $area = number_format($room_area, 1);
            // Fixed format - no duplicate text
            $dimensionsWithArea = $dimensions;

            // Use more constrained options for room headers
            $this->render_price_graph_pdf(
                $pdf,
                $room['min_total'],
                $room['max_total'],
                $default_markup,
                $room['name'],
                $dimensionsWithArea,
                null, // Don't pass 'm' as pricing_method here, as we've included it in dimensionsWithArea
                [
                    'show_labels' => true,
                    'label_count' => 3,       // Reduced number of labels
                    'round_to' => 500,        // Use smaller rounding
                    'title_max_width_percent' => 0.5, // Constrain title width
                    'graph_height' => 5       // Standard height for room headers
                ]
            );
        } else {
            // Fallback if no price data is available
            $pdf->SetFont(self::FONT_FAMILY, 'B', 14);
            $pdf->SetTextColor(self::COLOR_BRAND[0], self::COLOR_BRAND[1], self::COLOR_BRAND[2]);
            $pdf->Cell(0, 10, $room['name'] . ' (' . $room_width . 'm × ' . $room_length . 'm)', 0, 1);
        }

        // Process products
        if (isset($room['products']) && is_array($room['products'])) {
            // Create a consolidated array of products
            $all_products = [];
            $notes = [];

            foreach ($room['products'] as $product) {
                // Separate notes from products
                if (isset($product['type']) && $product['type'] === 'note') {
                    $notes[] = $product;
                    continue;
                }

                // Add main product
                $all_products[] = [
                    'product_data' => $product,
                    'is_addition' => false,
                    'parent_name' => null
                ];

                // Add additional products
                if (isset($product['additional_products']) && is_array($product['additional_products'])) {
                    foreach ($product['additional_products'] as $add_product) {
                        $all_products[] = [
                            'product_data' => $add_product,
                            'is_addition' => true,
                            'parent_name' => $product['name']
                        ];
                    }
                }
            }

            // Process each product
            foreach ($all_products as $product_item) {
                $this->render_product_native($pdf, $product_item, $default_markup, $room_area);
            }

            // Process standalone notes
            foreach ($notes as $note) {
                $this->render_note_native($pdf, $note);
            }
        } else {
            // No products message
            $pdf->SetFont(self::FONT_FAMILY, 'I', 10);
            $pdf->SetTextColor(136, 136, 136);
            $pdf->Cell(0, 15, 'No products in this room.', 1, 1, 'C', false);
        }

        // Add more space between rooms
        $pdf->Ln(15);
    }

    /**
     * Render a product using native TCPDF methods with minimal padding
     * Fixes excessive bottom padding in product cards
     *
     * @param object $pdf TCPDF object
     * @param array $product_item Product item data
     * @param float $default_markup Default markup percentage
     * @param float $room_area Room area in square meters
     */
    private function render_product_native($pdf, $product_item, $default_markup, $room_area) {
        $product = $product_item['product_data'];
        $is_addition = $product_item['is_addition'];
        $parent_name = $product_item['parent_name'];

        // Get page dimensions
        $pageWidth = $pdf->getPageWidth();
        $marginLeft = $pdf->getMargins()['left'];
        $marginRight = $pdf->getMargins()['right'];
        $contentWidth = $pageWidth - $marginLeft - $marginRight;

        // Get product pricing method
        $pricing_method = isset($product['pricing_method']) ? $product['pricing_method'] : 'fixed';

        // Process image
        $has_image = false;
        $image_path = '';
        $image_width = 30;
        $image_height = 30;

        if (!empty($product['image'])) {
            $image_path = $this->get_image_path($product['image']);
            $has_image = !empty($image_path);
        }

        // No indentation for all products
        $indent = 0;

        // Define minimal padding
        $padding = 5; // Minimal padding for compact layout

        // Calculate notes height first to determine card size
        $notes_height = 0;
        $has_notes = false;

        if (!$is_addition && isset($product['additional_notes']) && is_array($product['additional_notes']) && !empty($product['additional_notes'])) {
            $has_notes = true;
            foreach ($product['additional_notes'] as $note) {
                $note_text = isset($note['note_text']) ? $note['note_text'] : '';
                if (!empty($note_text)) {
                    // Calculate approximately how much height this note will need
                    $pdf->SetFont(self::FONT_FAMILY, '', 9);
                    $image_offset = $has_image ? $image_width + 5 : 0;
                    $note_width = $contentWidth - $indent - $image_offset - 15;
                    $lines = $pdf->getNumLines($note_text, $note_width);
                    $notes_height += $lines * 4 + 2; // 4pt line height + 2pt spacing
                }
            }
        }

        // Content height estimation - calculate more accurately based on what we'll actually render
        $content_height = 0;

        // Estimate title height
        $content_height += $is_addition ? 10 : 12; // Title height

        // Add notes height if applicable
        if ($has_notes) {
            $content_height += $notes_height + 2; // Notes + a little spacing
        }

        // Calculate card height dynamically based on content
        // This is key to fixing the excessive padding
        $card_height = max(
            $content_height + ($padding * 2), // Content + padding top/bottom
            $has_image ? $image_height + ($padding * 2) : 0 // Image height + padding if there's an image
        );

        // Ensure minimum card height
        $card_height = max($card_height, 20); // Less minimum height than before

        // For additional products (is_addition), make cards even more compact
        if ($is_addition) {
            $card_height = max($content_height + ($padding * 1.5), 20); // Even less padding for additions
        }

        // Check if there's enough space for the card on the current page
        if ($pdf->GetY() + $card_height > $pdf->getPageHeight() - $pdf->getMargins()['bottom']) {
            $pdf->AddPage();
        }

        // Position tracking - get AFTER potential page break
        $startX = $pdf->GetX();
        $startY = $pdf->GetY();
        $image_offset = $has_image ? $image_width + 5 : 0;

        // Card styling - different for main vs additional products
        $bg_color = $is_addition ? [248, 248, 248] : [255, 255, 255]; // Lighter bg for additions

        // Draw card background with subtle border
        $pdf->SetFillColor($bg_color[0], $bg_color[1], $bg_color[2]);
        $pdf->SetDrawColor(230, 230, 230); // Light gray border
        $pdf->RoundedRect($startX + $indent, $startY, $contentWidth - $indent, $card_height, 2, '1111', 'FD');

        // Add image if available - positioned at the left side with consistent padding
        if ($has_image) {
            $image_x = $startX + $indent + $padding;
            $image_y = $startY + $padding; // Consistent top padding

            $pdf->Image($image_path, $image_x, $image_y, $image_width, $image_height);
        }

        // Set content area starting position with consistent top padding
        $content_x = $startX + $indent + ($has_image ? $image_offset + $padding : $padding);
        $content_y = $startY + $padding; // Consistent top padding
        $pdf->SetXY($content_x, $content_y);

        // Check if the product has a valid price that should be displayed
        $has_valid_price = true;
        if (isset($product['min_price_total']) && isset($product['max_price_total'])) {
            // Consider the price invalid (for display) if both min and max are zero
            if ($product['min_price_total'] == 0 && $product['max_price_total'] == 0) {
                $has_valid_price = false;
            }
        }

        if ($has_valid_price && isset($product['min_price_total']) && isset($product['max_price_total'])) {
            // For both main and additional products, use the price graph
            // Just adjust settings to make it slightly smaller for additional products
            $graph_options = [
                'show_labels' => false, // No labels for product cards to save space
                'graph_height' => $is_addition ? 3 : 4, // Smaller graph for additional products
                'round_to' => 100,      // Smaller rounding for better precision
                'title_max_width_percent' => 0.7, // Increased space for title
                'hide_zero_price' => true // Hide price if it's zero
            ];

            // Ensure graph stays within page boundaries by limiting width
            $graph_width = $contentWidth - $indent - $image_offset - ($padding * 2); // Account for padding on both sides
            $graph_options['max_width'] = $graph_width;

            $this->render_price_graph_pdf(
                $pdf,
                $product['min_price_total'],
                $product['max_price_total'],
                $default_markup,
                $product['name'], // Product name without room area
                null,             // No dimensions needed for product
                $pricing_method,
                $graph_options
            );
        } else {
            // Fallback or zero price case - just show the product name
            $title_width = $contentWidth - $indent - $image_offset - ($padding * 2);
            $pdf->SetFont(self::FONT_FAMILY, 'B', 12);
            $pdf->SetTextColor(51, 51, 51);

            // Make sure we have a product name
            $product_name = isset($product['name']) ? $product['name'] : 'Unnamed Product';
            $pdf->Cell($title_width, 10, $product_name, 0, 1);
        }

        // Add product notes if available - INSIDE THE CARD
        if ($has_notes) {
            // Set position for notes - below product name and price
            $notesX = $content_x; // Use the same X position as the content for alignment
            $notesY = $pdf->GetY() + 2; // Small space between title/price and notes

            // Set a consistent starting position for all notes
            $pdf->SetXY($notesX, $notesY);
            $pdf->SetFont(self::FONT_FAMILY, '', 9);
            $pdf->SetTextColor(102, 102, 102); // Gray text for notes

            // Set a fixed width for notes to ensure proper alignment
            $note_width = $contentWidth - $indent - $image_offset - ($padding * 2);

            // Track the last note's bottom position
            $last_note_bottom = $notesY;

            foreach ($product['additional_notes'] as $note) {
                // Get note text
                $note_text = isset($note['note_text']) ? $note['note_text'] : '';
                if (empty($note_text)) {
                    continue; // Skip empty notes
                }

                // Position at current Y
                $current_note_y = $pdf->GetY();

                // Check for page break before adding note
                $note_height = $pdf->getStringHeight($note_width, $note_text);
                if ($current_note_y + $note_height > $pdf->getPageHeight() - $pdf->getMargins()['bottom']) {
                    $pdf->AddPage();
                    $current_note_y = $pdf->GetY();
                    $pdf->SetX($notesX);
                }

                // Use Cell for shorter notes to reduce vertical space
                if (strlen($note_text) < 60 && strpos($note_text, "\n") === false) {
                    $pdf->SetX($notesX);
                    $pdf->Cell($note_width, 4, $note_text, 0, 1);
                } else {
                    // Use writeHTMLCell for longer or multi-line notes
                    $pdf->writeHTMLCell(
                        $note_width,      // width
                        0,                // height (0 = auto-calculate)
                        $notesX,          // x position (consistent for all notes)
                        $current_note_y,  // y position (current Y position)
                        $note_text,       // content
                        0,                // border (0 = no border)
                        1,                // ln (1 = move to next line after cell)
                        false,            // fill
                        true,             // reset Y (true = reset)
                        'L',              // alignment (L = left)
                        false             // no autopadding - reduce vertical space
                    );
                }

                // Track the last note's bottom position
                $last_note_bottom = $pdf->GetY();

                // Minimal space between notes (reduced from 1 to 0.5)
                $pdf->Ln(0.5);
            }
        }

        // Calculate the actual content end position
        $content_end_y = $pdf->GetY();

        // For additional products, we want almost no space after content
        $space_after = $is_addition ? 2 : 3;

        // Add minimal spacing between products
        $pdf->Ln($space_after);
    }

    /**
     * Render a note using native TCPDF methods with page break handling
     */
    private function render_note_native($pdf, $note) {
        // Get page dimensions
        $pageWidth = $pdf->getPageWidth();
        $marginLeft = $pdf->getMargins()['left'];
        $marginRight = $pdf->getMargins()['right'];
        $contentWidth = $pageWidth - $marginLeft - $marginRight;

        // Estimate the note height
        $note_text = isset($note['note_text']) ? $note['note_text'] : '';
        $note_height = $pdf->getStringHeight($contentWidth - 5, $note_text) + 2; // Reduced padding

        // Check if we need a page break
        if ($pdf->GetY() + $note_height > $pdf->getPageHeight() - $pdf->getMargins()['bottom']) {
            $pdf->AddPage(); // Will automatically apply template to new page
        }

        // Position tracking
        $startX = $pdf->GetX();
        $startY = $pdf->GetY();

        // Create a green bar on left side
        $pdf->SetFillColor(self::COLOR_BRAND[0], self::COLOR_BRAND[1], self::COLOR_BRAND[2]);
        $pdf->Rect($startX, $startY, 3, 5, 'F');

        // Use writeHTMLCell for consistent text alignment
        $pdf->SetXY($startX + 5, $startY);
        $pdf->SetFont(self::FONT_FAMILY, '', 10);
        $pdf->SetTextColor(51, 51, 51);

        // Use writeHTMLCell for better line alignment
        $pdf->writeHTMLCell(
            $contentWidth - 5,  // width
            0,                  // height (0 = auto-calculate)
            $startX + 5,        // x position
            $startY,            // y position
            $note_text,         // content
            0,                  // border (0 = no border)
            1,                  // ln (1 = move to next line after cell)
            false,              // fill
            true,               // reset Y
            'L',                // alignment (L = left)
            false               // disable autopadding to reduce extra space
        );

        // Only add minimal vertical space (0.5mm instead of 2mm)
        $pdf->Ln(0.5);
    }

    /**
     * Render total estimate section with improved spacing
     *
     * @param object $pdf PDF object
     * @param array $estimate Estimate data
     * @param float $default_markup Default markup percentage
     */
    private function render_total_section($pdf, $estimate, $default_markup) {
        if (!isset($estimate['min_total']) || !isset($estimate['max_total'])) {
            return;
        }

        // Add extra space before the total section
        $pdf->Ln(15);

        // Green line separator
        $pdf->SetDrawColor(self::COLOR_BRAND[0], self::COLOR_BRAND[1], self::COLOR_BRAND[2]);
        $pdf->SetLineWidth(0.5);
        $pdf->Line($pdf->GetX(), $pdf->GetY(), $pdf->GetX() + ($pdf->GetPageWidth() - $pdf->getMargins()['left'] - $pdf->getMargins()['right']), $pdf->GetY());
        $pdf->Ln(5);

        // Use price graph for total section (larger size for emphasis)
        // For the total, use more constrained options to ensure it fits
        $this->render_price_graph_pdf(
            $pdf,
            $estimate['min_total'],
            $estimate['max_total'],
            $default_markup,
            'ESTIMATE TOTAL',
            null,
            null,
            [
                'show_labels' => true,
                'label_count' => 3,      // Reduced label count to fit page width
                'graph_height' => 8,     // Taller graph for emphasis
                'round_to' => 1000,      // Round to nearest thousand for the total
                'bar_color' => [0, 133, 63], // Darker green for total
                'title_max_width_percent' => 0.5 // Constrain title width
            ]
        );

        // Add space after the total section
        $pdf->Ln(5);
    }

    /**
     * Format price for PDF display
     */
    private function format_price_for_pdf($min_price, $max_price, $default_markup) {
        if ($min_price === $max_price) {
            return $this->format_currency_for_pdf($min_price, $default_markup, "up");
        } else {
            return $this->format_currency_for_pdf($min_price, $default_markup, "down") . ' - ' .
                $this->format_currency_for_pdf($max_price, $default_markup, "up");
        }
    }


    /**
     * Format currency for PDF display
     */
    private function format_currency_for_pdf($price, $markup, $direction = null) {
        $final_price = $price;

        // Apply markup if specified
        if ($direction === 'up') {
            $final_price = $price * (1 + ($markup / 100));
        } else if ($direction === 'down') {
            $final_price = $price * (1 - ($markup / 100));
        }

        // Round and format
        $final_price = round($final_price);

        // Use WordPress currency formatting if available
        if (function_exists('wc_price')) {
            // Get price as string with HTML, then decode entities properly
            $formatted = wc_price($final_price);
            // First strip tags to remove HTML
            $formatted = strip_tags($formatted);
            // Then decode HTML entities to get proper symbols
            $formatted = html_entity_decode($formatted, ENT_QUOTES, 'UTF-8');
            return $formatted;
        }

        // Fallback formatting
        return '$' . number_format($final_price, 0);
    }

    /**
     * Get local file path for an image URL
     *
     * @param string $url Image URL
     * @return string|false Local file path or false on failure
     */
    private function get_image_path($url) {
        // Check if we already processed this URL
        if (isset($this->image_data[$url])) {
            return $this->image_data[$url];
        }

        // If it's already a file path and exists
        if (file_exists($url)) {
            $this->image_data[$url] = $url;
            return $url;
        }

        // If it's a URL, download it
        if (filter_var($url, FILTER_VALIDATE_URL)) {
            // Log the URL we're trying to process
            if ($this->debug) {
                error_log("Processing image URL: $url");
            }

            // Create temp file
            $temp_file = wp_tempnam('pe_img_');

            // Try to get the image
            $response = wp_remote_get($url, [
                'timeout' => 10,
                'sslverify' => false,
                'user-agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            ]);

            if (!is_wp_error($response) && wp_remote_retrieve_response_code($response) === 200) {
                $image_data = wp_remote_retrieve_body($response);

                if (!empty($image_data)) {
                    file_put_contents($temp_file, $image_data);

                    // Verify it's a valid image
                    if (filesize($temp_file) > 0) {
                        $this->image_data[$url] = $temp_file;
                        return $temp_file;
                    }
                }
            }

            // Download failed, try to resolve as WordPress attachment
            global $wpdb;

            // Check if this is a WP media URL
            $uploads_info = wp_upload_dir();
            if (strpos($url, $uploads_info['baseurl']) === 0) {
                // Try to find the attachment
                $file_path = str_replace($uploads_info['baseurl'], $uploads_info['basedir'], $url);

                if (file_exists($file_path)) {
                    $this->image_data[$url] = $file_path;
                    return $file_path;
                }
            }
        }

        // Try to handle relative URLs
        if (strpos($url, '/') === 0) {
            $site_path = ABSPATH;
            $file_path = rtrim($site_path, '/') . $url;

            if (file_exists($file_path)) {
                $this->image_data[$url] = $file_path;
                return $file_path;
            }
        }

        // Try to handle attachment IDs
        if (is_numeric($url)) {
            $attachment_url = wp_get_attachment_url($url);
            if ($attachment_url) {
                return $this->get_image_path($attachment_url);
            }
        }

        // Try to provide a placeholder if available
        $placeholder_path = PRODUCT_ESTIMATOR_PLUGIN_DIR . 'assets/images/placeholder.jpg';
        if (file_exists($placeholder_path)) {
            $this->image_data[$url] = $placeholder_path;
            return $placeholder_path;
        }

        // Log the failure
        if ($this->debug) {
            error_log("Failed to process image: $url");
        }

        return false;
    }

    /**
     * Render a price range graph in PDF - Fixed version with improved width constraints
     * and zero price handling
     *
     * @param object $pdf TCPDF/FPDI object
     * @param float $min_price Minimum price
     * @param float $max_price Maximum price
     * @param float $default_markup Markup percentage
     * @param string $title Product/room title
     * @param string $dimensions Room dimensions (if applicable)
     * @param string $pricing_method Pricing method (sqm or fixed)
     * @param array $options Optional display options
     */
    private function render_price_graph_pdf($pdf, $min_price, $max_price, $default_markup, $title, $dimensions = null, $pricing_method = null, $options = []) {
        // Default options
        $defaults = [
            'graph_height' => 5,      // Height of the bar in mm
            'bar_color' => [76, 175, 80],  // Green color (RGB) - #4CAF50
            'bg_color' => [224, 224, 224], // Light gray background (RGB) - #e0e0e0
            'label_count' => 5,       // Number of labels to show
            'round_to' => 1000,       // Round values to nearest thousand
            'min_bar_width' => 20,    // Minimum width percentage for small ranges (as percentage)
            'min_display_range' => 0.3, // Minimum display range as fraction of price
            'title_max_width_percent' => 0.7, // Maximum width for title as percentage of content width
            'show_labels' => true,    // Whether to show the price labels
            'max_width' => null,      // Maximum width for the graph (null = use content width)
            'hide_zero_price' => false // Whether to hide price if it's zero
        ];

        // Merge user options with defaults
        $options = array_merge($defaults, $options);

        // Check if price should be hidden (if both min and max are zero and hide_zero_price is true)
        $hide_price = $options['hide_zero_price'] && $min_price == 0 && $max_price == 0;

        // Get page dimensions
        $pageWidth = $pdf->getPageWidth();
        $marginLeft = $pdf->getMargins()['left'];
        $marginRight = $pdf->getMargins()['right'];
        $contentWidth = $pageWidth - $marginLeft - $marginRight;

        // Apply max_width constraint if provided
        if ($options['max_width'] !== null && $options['max_width'] > 0) {
            $contentWidth = min($contentWidth, $options['max_width']);
        }

        // Starting position
        $startX = $pdf->GetX();
        $startY = $pdf->GetY();

        // Format prices for display
        $formatted_min = $this->format_currency_for_pdf($min_price, $default_markup, "down");
        $formatted_max = $this->format_currency_for_pdf($max_price, $default_markup, "up");

        // Calculate available space for different components
        $price_width = $hide_price ? 0 : min($contentWidth * 0.25, 70); // Zero width if price is hidden
        $dimensions_width = ($dimensions !== null) ? 35 : 0; // Fixed width for dimensions if present

        // Calculate maximum width for title based on available space
        $title_max_width = $contentWidth - $price_width - $dimensions_width - 10; // 10pt padding

        // Set title font to bold green
        $pdf->SetFont(self::FONT_FAMILY, 'B', 12);
        $pdf->SetTextColor(self::COLOR_BRAND[0], self::COLOR_BRAND[1], self::COLOR_BRAND[2]);

        // Now print title with dimensions if provided
        if ($dimensions !== null) {
            // Calculate room area from dimensions (assuming dimensions is in format "WxH")
            $dim_parts = explode('x', $dimensions);
            $room_area = '';
            if (count($dim_parts) == 2) {
                $width = floatval(trim($dim_parts[0]));
                $height = floatval(trim($dim_parts[1]));
                $area = $width * $height;
                $room_area = number_format($area, 1);
            }

            // Print just the title first in bold green
            $pdf->Cell($pdf->GetStringWidth($title), 8, $title, 0, 0, 'L');

            // Switch to non-bold dark text for dimensions
            $pdf->SetFont(self::FONT_FAMILY, '', 12);
            $pdf->SetTextColor(51, 51, 51); // Dark gray for dimensions

            // Add dimensions and area
            $dimensions_text = ' ' . $dimensions . 'm (' . $room_area . 'm²)';
            $pdf->Cell($title_max_width - $pdf->GetStringWidth($title), 8, $dimensions_text, 0, 0, 'L');
        } else {
            // Just the title if no dimensions
            $pdf->Cell($title_max_width, 8, $title, 0, 0, 'L');
        }

        // Price range on the right - only if not hidden
        if (!$hide_price) {
            $pdf->SetFont(self::FONT_FAMILY, 'B', 11);
            $pdf->SetTextColor(0, 133, 63); // Green color for prices

            $price_text = "";
            if ($min_price === $max_price) {
                $price_text = $formatted_min;
            } else {
                $price_text = $formatted_min . ' - ' . $formatted_max;
            }

            // Truncate price text if it's too long
            $price_text_width = $pdf->GetStringWidth($price_text);
            if ($price_text_width > $price_width) {
                // Use a smaller font for prices if they're too long
                $pdf->SetFont(self::FONT_FAMILY, 'B', 9);
                $price_text_width = $pdf->GetStringWidth($price_text);

                // If still too long, truncate
                if ($price_text_width > $price_width) {
                    $price_text = $formatted_min; // Fall back to just showing min price
                }
            }

            // Add the price with right alignment and fixed width
            $pdf->Cell($price_width, 8, $price_text, 0, 0, 'R');
        }

        // End the line after title (and price if shown)
        $pdf->Ln();

        // Skip the graph if prices are invalid or if we should hide zero prices
        if (($min_price <= 0 && $max_price <= 0) || $hide_price) {
            return;
        }

        // ----- Price Range Calculation -----
        // For very close min/max prices, create an artificial range for better visualization
        $price_range = $max_price - $min_price;
        $is_narrow_range = $price_range < ($min_price * 0.05); // If range is less than 5% of min price

        // Calculate the center point of our price range
        $center_price = ($min_price + $max_price) / 2;

        // For narrow ranges, create a symmetric display range around the center point
        if ($is_narrow_range) {
            $range_padding = $center_price * $options['min_display_range'];
            $display_min = max(0, $center_price - $range_padding);
            $display_max = $center_price + $range_padding;
        } else {
            // Calculate rounded range with reasonable padding for normal ranges
            $round_to = $options['round_to'];

            // Use a smaller rounding factor for products with smaller price ranges
            if ($price_range < $round_to) {
                $round_to = max(100, ceil($price_range / 4 / 100) * 100); // Make divisible by 100
            }

            $display_min = floor($min_price / $round_to) * $round_to;
            $display_min = max(0, $display_min - $round_to); // Ensure at least one step below min

            $display_max = ceil($max_price / $round_to) * $round_to; // At least one step above max
        }

        $display_range = $display_max - $display_min;

        // Calculate percentages for the green bar - ensure we have a valid range
        if ($display_range > 0) {
            $left_percent = ($min_price - $display_min) / $display_range * 100;
            $width_percent = ($max_price - $min_price) / $display_range * 100;

            // Ensure small ranges are still clearly visible
            if ($width_percent < $options['min_bar_width']) {
                // If bar is too narrow, increase its width
                $adjustment = ($options['min_bar_width'] - $width_percent) / 2;
                $left_percent = max(0, $left_percent - $adjustment);
                $width_percent = $options['min_bar_width'];

                // Make sure the adjusted bar doesn't exceed 100%
                if ($left_percent + $width_percent > 100) {
                    $left_percent = 100 - $width_percent;
                }
            }
        } else {
            $left_percent = 35; // Center the bar more if range calculation fails
            $width_percent = $options['min_bar_width']; // Use minimum width
        }

        // Ensure we have reasonable values (fallback for edge cases)
        $left_percent = max(0, min(80, $left_percent));
        $width_percent = max($options['min_bar_width'], min(100 - $left_percent, $width_percent));

        // Move down for graph
        $pdf->SetY($pdf->GetY() + 2);
        $graph_y = $pdf->GetY();

        // Calculate actual dimensions for the graph - use contentWidth with padding
        $graph_width = $contentWidth - 10; // Slight padding on sides (5pt on each side)
        $graph_x = $startX + 5;

        // Draw the background bar
        $pdf->SetFillColor($options['bg_color'][0], $options['bg_color'][1], $options['bg_color'][2]);
        $pdf->RoundedRect($graph_x, $graph_y, $graph_width, $options['graph_height'], 2, '1111', 'F');

        // Calculate the green bar position and width
        $green_x = $graph_x + ($graph_width * $left_percent / 100);
        $green_width = $graph_width * $width_percent / 100;

        // Draw the green range bar
        $pdf->SetFillColor($options['bar_color'][0], $options['bar_color'][1], $options['bar_color'][2]);
        $pdf->RoundedRect($green_x, $graph_y, $green_width, $options['graph_height'], 2, '1111', 'F');

        // Add price labels below the graph if enabled and space allows
        if ($options['show_labels']) {
            $pdf->SetY($graph_y + $options['graph_height'] + 2);
            $label_y = $pdf->GetY();

            $pdf->SetFont(self::FONT_FAMILY, '', 8);
            $pdf->SetTextColor(102, 102, 102);

            // Reduce number of labels for smaller graph widths
            $max_label_count = min(floor($graph_width / 30), 5); // Ensure at least 30pt per label
            $label_count = min($options['label_count'], $max_label_count);

            // For narrow ranges, use friendlier increments
            if ($is_narrow_range) {
                if ($label_count > 4) {
                    $label_count = 4;
                }

                // Determine a nice round step value based on the price range
                $range_magnitude = $display_range / ($label_count - 1);

                // Choose step sizes that make sense based on magnitude for narrow ranges
                if ($range_magnitude >= 2000) {
                    $step = 1000; // Use $1000 increments for larger ranges
                } elseif ($range_magnitude >= 1000) {
                    $step = 500; // Use $500 increments for medium ranges
                } elseif ($range_magnitude >= 200) {
                    $step = 200; // Use $200 increments
                } elseif ($range_magnitude >= 100) {
                    $step = 100; // Use $100 increments
                } elseif ($range_magnitude >= 50) {
                    $step = 50; // Use $50 increments
                } elseif ($range_magnitude >= 20) {
                    $step = 20; // Use $20 increments
                } elseif ($range_magnitude >= 10) {
                    $step = 10; // Use $10 increments
                } else {
                    $step = 5; // Use $5 increments for very small ranges
                }

                // Adjust display range to start and end on nice round numbers
                $display_min = floor($min_price / $step) * $step;

                // For cases where we need extra space on the low end
                if ($display_min > $min_price - ($step * 0.5)) {
                    $display_min -= $step;
                }

                // Calculate how many steps we need for a clean display
                $total_steps = ceil(($max_price - $display_min) / $step) + 1;

                // Make sure we have at least the minimum number of steps for good visualization
                $total_steps = max($total_steps, $label_count);

                // Calculate the max based on steps
                $display_max = $display_min + ($step * ($total_steps - 1));

                // Calculate how many labels to actually display (usually equal to label_count)
                $labels_to_show = min($total_steps, $label_count);

                // Calculate the step between each displayed label
                $display_step = ($total_steps - 1) / ($labels_to_show - 1);

                // Use a simplified approach for label distribution
                // Only show first, middle and last labels for very tight spaces
                if ($labels_to_show <= 3) {
                    $positions = [0];
                    if ($labels_to_show >= 2) {
                        $positions[] = $total_steps - 1;
                    }
                    if ($labels_to_show >= 3) {
                        $positions[] = floor(($total_steps - 1) / 2);
                    }

                    foreach ($positions as $step_index) {
                        $current_value = $display_min + ($step_index * $step);
                        $percent_position = ($step_index / ($total_steps - 1)) * 100;
                        $percent_position = max(0, min(100, $percent_position));

                        $x_position = $graph_x + ($graph_width * $percent_position / 100);
                        $formatted_value = '$' . number_format($current_value, 0);

                        // Draw tick mark
                        $pdf->Line($x_position, $label_y, $x_position, $label_y - 2);

                        // Calculate label width - ensure it doesn't go off page
                        $label_width = min(40, $graph_width / $labels_to_show);
                        $label_x = $x_position - ($label_width / 2);

                        // Make sure label stays within bounds
                        $label_x = max($graph_x - 5, min($label_x, $graph_x + $graph_width - $label_width + 5));

                        $pdf->SetXY($label_x, $label_y);
                        $pdf->Cell($label_width, 5, $formatted_value, 0, 0, 'C');
                    }
                } else {
                    // For more space, distribute labels evenly
                    for ($i = 0; $i < $labels_to_show; $i++) {
                        // Get the label index (evenly distributed across the range)
                        $step_index = round($i * $display_step);

                        // Calculate the actual value and position
                        $current_value = $display_min + ($step_index * $step);
                        $percent_position = ($step_index / ($total_steps - 1)) * 100;
                        $percent_position = max(0, min(100, $percent_position));

                        $x_position = $graph_x + ($graph_width * $percent_position / 100);
                        $formatted_value = '$' . number_format($current_value, 0);

                        // Draw tick mark
                        $pdf->Line($x_position, $label_y, $x_position, $label_y - 2);

                        // Calculate label width based on available space
                        $label_width = $graph_width / $labels_to_show;
                        $label_x = $x_position - ($label_width / 2);

                        // Make sure label stays within bounds
                        $label_x = max($graph_x, min($label_x, $graph_x + $graph_width - $label_width));

                        $pdf->SetXY($label_x, $label_y);
                        $pdf->Cell($label_width, 5, $formatted_value, 0, 0, 'C');
                    }
                }
            } else {
                // For normal ranges, use standard evenly spaced labels
                // Calculate a maximum of 5 price points to show for normal ranges
                $label_count = min(5, $label_count);

                // Make sure we don't overcrowd small graphs
                if ($graph_width < 150) {
                    $label_count = min(3, $label_count);
                }

                // Generate label positions
                for ($i = 0; $i < $label_count; $i++) {
                    $percent_position = ($i / ($label_count - 1)) * 100;
                    $current_value = $display_min + ($display_range * ($i / ($label_count - 1)));
                    $x_position = $graph_x + ($graph_width * $percent_position / 100);

                    // Format the price without decimals
                    $formatted_value = '$' . number_format($current_value, 0);

                    // Draw tick mark
                    $pdf->Line($x_position, $label_y, $x_position, $label_y - 2);

                    // Draw label - with cell width constraints to prevent overlap
                    $label_width = min(40, $graph_width / $label_count * 0.9); // Smaller width for smaller graphs
                    $label_x = $x_position - ($label_width / 2); // Center label at tick mark

                    // Ensure label stays within page margins
                    $label_x = max($graph_x, min($label_x, $graph_x + $graph_width - $label_width));

                    $pdf->SetXY($label_x, $label_y);
                    $pdf->Cell($label_width, 5, $formatted_value, 0, 0, 'C');
                }
            }

            // Advance Y position past the labels
            $pdf->SetY($label_y + 6);
        } else {
            // If no labels, just add some space after the graph
            $pdf->SetY($graph_y + $options['graph_height'] + 2);
        }
    }
}
