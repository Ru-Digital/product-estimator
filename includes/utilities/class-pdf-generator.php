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
class PDFGenerator
{
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
    public function __construct()
    {
        $this->debug = defined('WP_DEBUG') && WP_DEBUG;
        $this->image_data = [];
    }

    /**
     * Generate a PDF from an estimate
     *
     * @param array $estimate The estimate data
     * @return string PDF file contents
     */
    public function generate_pdf($estimate)
    {
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
    private function create_pdf_object()
    {
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
            public function __construct($footer_text, $footer_contact_details, $estimate_data, $debug)
            {
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
            public function AddPage($orientation = '', $format = '', $keepmargins = false, $tocpage = false)
            {
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
            public function Header()
            {
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
            public function Footer()
            {
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
     * Render a product card using native TCPDF methods - with dynamic height calculation
     * and margin between cards
     *
     * @param object $pdf TCPDF object
     * @param array $product Product data
     * @param float $default_markup Default markup percentage
     * @param float $room_area Room area in square meters
     */
    private function render_product_card($pdf, $product, $default_markup, $room_area)
    {
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
        $image_width = 15;
        $image_height = 15;

        if (!empty($product['image'])) {
            $image_path = $this->get_image_path($product['image']);
            $has_image = !empty($image_path);
        }

        // Define padding - REDUCED
        $padding = 3; // Reduced from 4 to 3

        // Define margin between cards - NEW
        $card_margin = 3; // 3mm margin between cards

        // Calculate image offset for content positioning
        $image_offset = $has_image ? $image_width + $padding : 0;

        // Check for valid price data
        $has_valid_price = isset($product['min_price_total']) && isset($product['max_price_total']) &&
            !($product['min_price_total'] == 0 && $product['max_price_total'] == 0);

        // Calculate title space needed
        $pdf->SetFont(self::FONT_FAMILY, 'B', 12);
        $price_width = $has_valid_price ? min($contentWidth * 0.25, 70) : 0;
        $title_width = $contentWidth - $image_offset - ($padding * 2) - $price_width;
        $product_name = isset($product['name']) ? $product['name'] : 'Unnamed Product';
        $title_height = $pdf->getStringHeight($title_width, $product_name);

        // Calculate header content height (title or graph)
        $header_height = $title_height;
        if ($has_valid_price) {
            // Add height for price graph if used
            $graph_height = 3; // Graph height in mm
            $header_height = max($header_height, $graph_height + 2); // Include some spacing
        }

        // Calculate notes height with proper dimensions
        $notes_height = 0;
        $has_notes = false;

        if (isset($product['additional_notes']) && is_array($product['additional_notes']) && !empty($product['additional_notes'])) {
            $has_notes = true;
            $note_width = $contentWidth - $image_offset - ($padding * 2);

            foreach ($product['additional_notes'] as $note) {
                $note_text = isset($note['note_text']) ? $note['note_text'] : '';
                if (!empty($note_text)) {
                    // Calculate proper height for this note
                    $pdf->SetFont(self::FONT_FAMILY, '', 9);
                    $note_height = $pdf->getStringHeight($note_width, $note_text);
                    $notes_height += $note_height;
                }
            }

            if ($has_notes) {
                $notes_height += 2; // Add a little spacing between notes section and header
            }
        }

        // Calculate main content area height - the max of image height or header height
        $content_height = max($header_height, $has_image ? $image_height : 0);

        // Calculate total card height - dynamic based on content
        $card_height = $content_height + ($padding * 2) + ($has_notes ? $notes_height : 0);

        // Check if there's enough space for the card on the current page
        if ($pdf->GetY() + $card_height + $card_margin > $pdf->getPageHeight() - $pdf->getMargins()['bottom']) {
            $pdf->AddPage();
        }

        // Position tracking
        $startX = $pdf->GetX();
        $startY = $pdf->GetY();

        // Draw card background with rounded corners and border
        $pdf->SetFillColor(255, 255, 255); // White background for all cards
        $pdf->SetDrawColor(230, 230, 230); // Light gray border
        $pdf->RoundedRect(
            $startX,
            $startY,
            $contentWidth,
            $card_height,
            2, // Reduced corner radius from 3 to 2
            '1111', // All corners rounded
            'FD' // Fill and draw
        );

        // Add image if available - MODIFIED TO SUPPORT TRANSPARENCY
        if ($has_image) {
            $image_x = $startX + $padding;
            $image_y = $startY + $padding;

            // Get file extension to determine image type
            $file_extension = strtolower(pathinfo($image_path, PATHINFO_EXTENSION));

            // Determine if this is a PNG or WebP image that might have transparency
            $has_transparency = in_array($file_extension, ['png', 'webp']);

            if ($has_transparency) {
                // Use the ImagePng method with transparency support
                $pdf->Image(
                    $image_path,
                    $image_x,
                    $image_y,
                    $image_width,
                    $image_height,
                    '', // Determine type from extension
                    '', // URL link (none)
                    '', // Alignment (default)
                    true, // Reset Y position
                    300, // DPI
                    '', // Palette (default)
                    false, // isDataURL
                    false, // Inline
                    0, // Border
                    false, // Fit to page
                    false, // CMYK
                    true  // Preserve alpha channel - THIS IS THE KEY PARAMETER
                );
            } else {
                // Use standard Image method for other formats
                $pdf->Image($image_path, $image_x, $image_y, $image_width, $image_height);
            }
        }

        // Calculate content position
        $content_x = $startX + $image_offset + $padding;
        $content_y = $startY + $padding;
        $pdf->SetXY($content_x, $content_y);

        // Render the product name and price with price graph
        if ($has_valid_price) {
            // Use the price graph for displaying product name and price range - REDUCED GRAPH HEIGHT
            $graph_options = [
                'show_labels' => true,
                'graph_height' => 3, // Reduced from 3 to 2.5
                'round_to' => 100,
                'title_max_width_percent' => 0.7,
                'hide_zero_price' => true,
                'max_width' => $contentWidth - $image_offset - ($padding * 2)
            ];

            $graph_x = $startX + $image_offset + $padding;
            $graph_width = $contentWidth - $image_offset - ($padding * 2);
            $available_width = $contentWidth - $image_offset - ($padding * 2);
            $this->render_price_graph_pdf(
                $pdf,
                $product['min_price_total'],
                $product['max_price_total'],
                $default_markup,
                $product['name'],
                null,
                $pricing_method,
                [
                    'show_labels' => true,
                    'label_count' => 6,
                    'round_to' => 500,
                    'min_bar_width' => 5,
                    'graph_height' => 3,
                    'max_width' => $graph_width, // optional still
                ],
                $graph_x,   // NEW
                $available_width  // NEW
            );

        } else {
            // For products without price
            $title_width = $contentWidth - $image_offset - ($padding * 2);
            $pdf->SetFont(self::FONT_FAMILY, 'B', 11);
            $pdf->SetTextColor(51, 51, 51);
            $pdf->Cell($title_width, 8, $product_name, 0, 1);
        }

        // Add product notes if available with reduced spacing
        if ($has_notes) {
            $notesX = $content_x;
            $notesY = $pdf->GetY() + 0.5; // Reduced from 1 to 0.5
            $pdf->SetXY($notesX, $notesY);
            $pdf->SetFont(self::FONT_FAMILY, '', 9);
            $pdf->SetTextColor(102, 102, 102); // Gray text for notes
            $note_width = $contentWidth - $image_offset - ($padding * 2);

            foreach ($product['additional_notes'] as $note) {
                $note_text = isset($note['note_text']) ? $note['note_text'] : '';
                if (empty($note_text)) {
                    continue;
                }

                $current_note_y = $pdf->GetY();
                $note_height = $pdf->getStringHeight($note_width, $note_text);

                if ($current_note_y + $note_height > $pdf->getPageHeight() - $pdf->getMargins()['bottom']) {
                    $pdf->AddPage();
                    $current_note_y = $pdf->GetY();
                    $pdf->SetX($notesX);
                }

                if (strlen($note_text) < 60 && strpos($note_text, "\n") === false) {
                    $pdf->SetX($notesX);
                    $pdf->Cell($note_width, 3.5, $note_text, 0, 1); // Reduced height from 4 to 3.5
                } else {
                    $pdf->writeHTMLCell(
                        $note_width,
                        0,
                        $notesX,
                        $current_note_y,
                        $note_text,
                        0,
                        1,
                        false,
                        true,
                        'L',
                        false
                    );
                }
                // Removed Ln(0.5) call to reduce spacing between notes
            }
        }

        // Move to the end of the card and add margin between cards - NEW
        $pdf->SetY($startY + $card_height + $card_margin);
    }

    /**
     * Render a room header with correct dimensions formatting
     * and proper product card separation - with reduced spacing
     *
     * @param object $pdf PDF object
     * @param array $room Room data
     * @param float $default_markup Default markup percentage
     */
    private function render_room_native($pdf, $room, $default_markup)
    {
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
                "sqm", // pricing_method
                [
                    'show_labels' => true,
                    'label_count' => 6,
                    'round_to' => 500,
                    'min_bar_width' => 5, // Added for consistency
                    'title_max_width_percent' => 0.5,
                    'graph_height' => 3
                ]
            );
        } else {
            // Fallback if no price data is available
            $pdf->SetFont(self::FONT_FAMILY, 'B', 14);
            $pdf->SetTextColor(self::COLOR_BRAND[0], self::COLOR_BRAND[1], self::COLOR_BRAND[2]);
            $pdf->Cell(0, 10, $room['name'] . ' (' . $room_width . 'm × ' . $room_length . 'm)', 0, 1);
        }

        // Add a bit of space after room header before products - REDUCED
        $pdf->Ln(3); // Reduced from 5 to 3

        // Process products - IMPORTANT: NO ROOM BORDER AROUND ALL PRODUCTS
        if (isset($room['products']) && is_array($room['products'])) {
            // Create separate arrays for main products and notes
            $main_products = [];
            $notes = [];

            // First collect all products and notes
            foreach ($room['products'] as $product) {
                // Separate notes from products
                if (isset($product['type']) && $product['type'] === 'note') {
                    $notes[] = $product;
                } else {
                    $main_products[] = $product;
                }
            }

            // Render main products first
            foreach ($main_products as $main_product) {
                // Render the main product
                $this->render_product_card($pdf, $main_product, $default_markup, $room_area);

                // Render any additional products for this main product
                if (isset($main_product['additional_products']) && is_array($main_product['additional_products'])) {
                    foreach ($main_product['additional_products'] as $add_product) {
                        $this->render_product_card($pdf, $add_product, $default_markup, $room_area);
                    }
                }
            }

            // Render all notes last
            foreach ($notes as $note) {
                $this->render_note_native($pdf, $note);
            }
        } else {
            // No products message
            $pdf->SetFont(self::FONT_FAMILY, 'I', 10);
            $pdf->SetTextColor(136, 136, 136);
            $pdf->Cell(0, 15, 'No products in this room.', 0, 1, 'C'); // Removed border from no products message
        }

        // Add more space between rooms - REDUCED
        $pdf->Ln(10); // Reduced from 15 to 10
    }

    /**
     * Render a note using native TCPDF methods with page break handling
     */
    private function render_note_native($pdf, $note)
    {
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
     * Render content using native TCPDF methods - with improved spacing
     *
     * @param object $pdf PDF object
     * @param array $estimate Estimate data
     */
    private function render_content_native($pdf, $estimate)
    {
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
                $needed_height = 80; // Reduced from 100 to 80 - approximate height needed for a room
                if ($pdf->GetY() + $needed_height > $pdf->getPageHeight() - $pdf->getMargins()['bottom']) {
                    $pdf->AddPage(); // This will now automatically apply the template
                }

                $this->render_room_native($pdf, $room, $default_markup);

                // Add an extra line break after the last room to create more space before the total
                if ($room_count == count($estimate['rooms'])) {
                    $pdf->Ln(5); // Reduced from 10 to 5
                }
            }
        } else {
            // No rooms message
            $pdf->SetFont(self::FONT_FAMILY, 'I', 10);
            $pdf->SetTextColor(136, 136, 136);
            $pdf->Cell(0, 20, 'No rooms or products found in this estimate.', 1, 1, 'C');
        }

        // Total Estimate Section
        // Check if we need a page break before the total section
        $needed_height = 40; // Reduced from 50 to 40 - height needed for total section with spacing
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
     * Render total estimate section with improved spacing
     *
     * @param object $pdf PDF object
     * @param array $estimate Estimate data
     * @param float $default_markup Default markup percentage
     */
    private function render_total_section($pdf, $estimate, $default_markup)
    {
        if (!isset($estimate['min_total']) || !isset($estimate['max_total'])) {
            return;
        }

        // Add extra space before the total section - REDUCED
        $pdf->Ln(10); // Reduced from 15 to 10

        // Green line separator
        $pdf->SetDrawColor(self::COLOR_BRAND[0], self::COLOR_BRAND[1], self::COLOR_BRAND[2]);
        $pdf->SetLineWidth(0.5);
        $pdf->Line($pdf->GetX(), $pdf->GetY(), $pdf->GetX() + ($pdf->GetPageWidth() - $pdf->getMargins()['left'] - $pdf->getMargins()['right']), $pdf->GetY());
        $pdf->Ln(3); // Reduced from 5 to 3

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
                'label_count' => 6,
                'graph_height' => 8,
                'round_to' => 1000,
                'min_bar_width' => 5, // Added for consistency
                'bar_color' => [0, 133, 63],
                'title_max_width_percent' => 0.5
            ]
        );

        // Add space after the total section - REDUCED
        $pdf->Ln(5); // Reduced from 5 to 3

        // --- NEW BLOCK: Render centered footer text ---
        if (!empty($this->footer_text)) {
            $html = '
        <div style="font-size:12pt; text-align:center; color:#333; margin-top:10px;">
            ' . nl2br($this->footer_text) . '
        </div>
        ';

            $pdf->writeHTML($html, true, false, true, false, 'C'); // <-- 'C' centers the block
        }
        $pdf->Ln(3); // Reduced from 5 to 3

    }

    /**
     * Format price for PDF display
     */
    private function format_price_for_pdf($min_price, $max_price, $default_markup)
    {
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
    private function format_currency_for_pdf($price, $markup, $direction = null)
    {
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
     * Get local file path for an image URL with transparency support
     *
     * @param string $url Image URL
     * @return string|false Local file path or false on failure
     */
    private function get_image_path($url)
    {
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
            if ($this->debug) {
                error_log("Processing image URL: $url");
            }

            $temp_file = wp_tempnam('pe_img_');

            $response = wp_remote_get($url, [
                'timeout' => 10,
                'sslverify' => false,
                'user-agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
            ]);

            if (!is_wp_error($response) && wp_remote_retrieve_response_code($response) === 200) {
                $image_data = wp_remote_retrieve_body($response);

                if (!empty($image_data)) {
                    file_put_contents($temp_file, $image_data);

                    if (filesize($temp_file) > 0) {
                        $file_ext = strtolower(pathinfo($temp_file, PATHINFO_EXTENSION));

                        // Convert WebP with transparency to PNG
                        if ($file_ext === 'webp' && function_exists('imagecreatefromwebp')) {
                            $image = imagecreatefromwebp($temp_file);
                            if ($image) {
                                imagealphablending($image, false);
                                imagesavealpha($image, true);

                                $png_file = $temp_file . '.png';
                                imagepng($image, $png_file);
                                imagedestroy($image);
                                unlink($temp_file); // delete original webp
                                $temp_file = $png_file;
                            }
                        }

                        $this->image_data[$url] = $temp_file;
                        return $temp_file;
                    }
                }
            }

            // Try to resolve as WordPress attachment if from uploads
            $uploads_info = wp_upload_dir();
            if (strpos($url, $uploads_info['baseurl']) === 0) {
                $file_path = str_replace($uploads_info['baseurl'], $uploads_info['basedir'], $url);
                if (file_exists($file_path)) {
                    $this->image_data[$url] = $file_path;
                    return $file_path;
                }
            }
        }

        // Handle relative URLs
        if (strpos($url, '/') === 0) {
            $site_path = ABSPATH;
            $file_path = rtrim($site_path, '/') . $url;
            if (file_exists($file_path)) {
                $this->image_data[$url] = $file_path;
                return $file_path;
            }
        }

        // Attachment ID fallback
        if (is_numeric($url)) {
            $attachment_url = wp_get_attachment_url($url);
            if ($attachment_url) {
                return $this->get_image_path($attachment_url);
            }
        }

        // Placeholder fallback
        $placeholder_path = PRODUCT_ESTIMATOR_PLUGIN_DIR . 'assets/images/placeholder.jpg';
        if (file_exists($placeholder_path)) {
            $this->image_data[$url] = $placeholder_path;
            return $placeholder_path;
        }

        if ($this->debug) {
            error_log("Failed to process image: $url");
        }

        return false;
    }

    /**
     * PDF version of the price graph renderer
     * - To be placed in your class-pdf-generator.php file
     */
    private function render_price_graph_pdf($pdf, $min_price, $max_price, $default_markup, $title, $dimensions = null, $pricing_method = null, $options = [], $graph_x = null, $graph_width = null) {
        $defaults = [
            'graph_height' => 5,
            'bar_color' => [76, 175, 80],   // #4CAF50
            'bg_color' => [224, 224, 224],  // #E0E0E0
            'label_count' => 6,
            'round_to' => 1000,
            'min_bar_width' => 5,
            'title_max_width_percent' => 0.7,
            'show_labels' => true,
            'max_width' => null,
            'hide_zero_price' => false
        ];
        $options = array_merge($defaults, $options);

        if (($min_price <= 0 && $max_price <= 0) || $options['hide_zero_price']) {
            return;
        }

        // Adjust min/max for markup first
        $price_min_adjusted = calculate_price_with_markup($min_price, $default_markup, 'down');
        $price_max_adjusted = calculate_price_with_markup($max_price, $default_markup, 'up');

        $position = calculate_price_graph_bar_position($price_min_adjusted, $price_max_adjusted, $options);
        $left_percent = $position['bar_left_percent'];
        $width_percent = $position['bar_width_percent'];
        $step_values = $position['label_values'];

        $formatted_price = $this->format_price_for_pdf($min_price, $max_price, $default_markup);

        $pageWidth = $pdf->getPageWidth();
        $marginLeft = $pdf->getMargins()['left'];
        $marginRight = $pdf->getMargins()['right'];
        $contentWidth = $pageWidth - $marginLeft - $marginRight;

        $startX = $pdf->GetX();
        $startY = $pdf->GetY();

        // Title and dimensions
        $pdf->SetFont(self::FONT_FAMILY, 'B', 10);
        $pdf->SetTextColor(self::COLOR_BRAND[0], self::COLOR_BRAND[1], self::COLOR_BRAND[2]);
        $title_max_width = $contentWidth * $options['title_max_width_percent'];
        $title_width = $pdf->GetStringWidth($title) + 2;
        $pdf->Cell($title_width, 6, $title, 0, 0, 'L');

        if ($dimensions) {
            $dim_parts = explode('x', strtolower(str_replace(' ', '', $dimensions)));
            $room_area = '';
            if (count($dim_parts) == 2) {
                $width = floatval(trim($dim_parts[0]));
                $height = floatval(trim($dim_parts[1]));
                $area = $width * $height;
                $room_area = number_format($area, 1);
            }

            $pdf->SetFont(self::FONT_FAMILY, '', 10);
            $pdf->SetTextColor(self::COLOR_LIGHT_TEXT[0], self::COLOR_LIGHT_TEXT[1], self::COLOR_LIGHT_TEXT[2]);
            $dim_text = ' ' . $dimensions . 'm (' . $room_area . 'm²)';
            $dim_width = $pdf->GetStringWidth($dim_text) + 2;
            $pdf->Cell($dim_width, 6, $dim_text, 0, 0, 'L');
        }

        $pdf->SetFont(self::FONT_FAMILY, '', 9);
        $pdf->SetTextColor(self::COLOR_TEXT[0], self::COLOR_TEXT[1], self::COLOR_TEXT[2]);
        $remaining_width = $contentWidth - ($pdf->GetX() - $marginLeft);
        $pdf->Cell($remaining_width, 6, $formatted_price, 0, 1, 'R');
        $pdf->Ln(2);
        $side_padding = 7;


        // Graph positions
        $graph_y = $pdf->GetY();
//        $graph_x = $marginLeft + $side_padding;
//        $graph_width = $contentWidth - ($side_padding * 2);

        if ($graph_x === null) {
            $graph_x = $marginLeft; // align to start of page margin
        }
        if ($graph_width === null) {
            $graph_width = $contentWidth;
        }


        // Draw graph background (grey)
        $pdf->SetFillColor($options['bg_color'][0], $options['bg_color'][1], $options['bg_color'][2]);
        $pdf->RoundedRect($graph_x, $graph_y, $graph_width, $options['graph_height'], 0.5, '1111', 'F');

        // Calculate bar position
        $bar_x = $graph_x + ($graph_width * $left_percent / 100);
        $bar_width = $graph_width * $width_percent / 100;
        if ($bar_width < 2) {
            $bar_width = 2;
        }

        // Draw green bar (solid)
        $pdf->SetFillColor($options['bar_color'][0], $options['bar_color'][1], $options['bar_color'][2]);
        $pdf->Rect($bar_x, $graph_y, $bar_width, $options['graph_height'], 'F');

        // ✅ Improved Fuzzy Edges using Color Blending (No Alpha)
        $fuzzy_steps = 20;
        $fuzzy_width = 3; // Total width in mm to apply gradient

// Left gradient fade
        for ($i = 0; $i < $fuzzy_steps; $i++) {
            $step_width = $fuzzy_width / $fuzzy_steps;
            $step_x = $bar_x + ($i * $step_width);

            $blend = ($i + 1) / $fuzzy_steps; // from 0 -> 1
            $r = $options['bg_color'][0] + ($options['bar_color'][0] - $options['bg_color'][0]) * $blend;
            $g = $options['bg_color'][1] + ($options['bar_color'][1] - $options['bg_color'][1]) * $blend;
            $b = $options['bg_color'][2] + ($options['bar_color'][2] - $options['bg_color'][2]) * $blend;

            $pdf->SetFillColor($r, $g, $b);
            $pdf->Rect($step_x, $graph_y, $step_width, $options['graph_height'], 'F');
        }

// Right gradient fade
        for ($i = 0; $i < $fuzzy_steps; $i++) {
            $step_width = $fuzzy_width / $fuzzy_steps;
            $step_x = ($bar_x + $bar_width - $fuzzy_width) + ($i * $step_width);

            $blend = 1 - ($i / $fuzzy_steps); // from 1 -> 0
            $r = $options['bg_color'][0] + ($options['bar_color'][0] - $options['bg_color'][0]) * $blend;
            $g = $options['bg_color'][1] + ($options['bar_color'][1] - $options['bg_color'][1]) * $blend;
            $b = $options['bg_color'][2] + ($options['bar_color'][2] - $options['bg_color'][2]) * $blend;

            $pdf->SetFillColor($r, $g, $b);
            $pdf->Rect($step_x, $graph_y, $step_width, $options['graph_height'], 'F');
        }
        // Labels and ticks
        if ($options['show_labels']) {
            $pdf->SetFont(self::FONT_FAMILY, '', 7);
            $pdf->SetTextColor(self::COLOR_LIGHTER_TEXT[0], self::COLOR_LIGHTER_TEXT[1], self::COLOR_LIGHTER_TEXT[2]);

            $inset_percent = 0.03; // 3% padding from each side for first/last label
            $effective_width_percent = 1 - ($inset_percent * 2);

            foreach ($step_values as $index => $step) {
                $effective_steps = max(1, count($step_values) - 1);
                $tick_percent = $inset_percent + ($effective_width_percent * ($index / $effective_steps));
                $tick_x = $graph_x + ($graph_width * $tick_percent);
                $tick_y = $graph_y + $options['graph_height'] + 0.5;

                $pdf->SetLineWidth(0.1);
                $pdf->SetDrawColor(150, 150, 150);
                $pdf->Line($tick_x, $tick_y, $tick_x, $tick_y + 1);

                $label_width = 14;
                $label_x = $tick_x - ($label_width / 2); // Default centered

                $pdf->SetXY($label_x, $tick_y + 1);
                $pdf->Cell($label_width, 3, '$' . number_format($step['value'], 0), 0, 0, 'C');
            }
        }

        // Move below graph
        $pdf->SetY($graph_y + $options['graph_height'] + ($options['show_labels'] ? 7 : 3));
    }}
