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

        // If we have a template, try to use it
        if ($template_id > 0 && class_exists('\\setasign\\Fpdi\\Tcpdf\\Fpdi')) {
            $template_path = get_attached_file($template_id);
            if ($template_path && file_exists($template_path)) {
                try {
                    $pdf->setSourceFile($template_path);
                    // Get first page as template
                    $tplIdx = $pdf->importPage(1);

                    // Add new page and use template
                    $pdf->AddPage();
                    $pdf->useTemplate($tplIdx, 0, 0, $pdf->getPageWidth(), $pdf->getPageHeight());
                } catch (\Exception $e) {
                    if ($this->debug) {
                        error_log('Error using template PDF: ' . $e->getMessage());
                    }
                    // Add a regular page if template fails
                    $pdf->AddPage();
                }
            } else {
                // No template found, add regular page
                $pdf->AddPage();
            }
        } else {
            // No template, add regular page
            $pdf->AddPage();
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

        // Create custom PDF class
        return new class($footer_text, $footer_contact_details, $estimate_data, $debug) extends Fpdi {
            protected $footer_text;
            protected $footer_contact_details;
            protected $estimate_data;
            protected $debug;

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
    }

    /**
     * Render the PDF content using native TCPDF methods
     *
     * @param object $pdf PDF object
     * @param array $estimate Estimate data
     */
    private function render_content_native($pdf, $estimate) {
        // Get settings
        $options = get_option('product_estimator_settings', []);
        $default_markup = isset($estimate['default_markup']) ? floatval($estimate['default_markup']) : 0;

        // Summary Section
//        $this->render_summary_section($pdf, $estimate, $default_markup);

        // Process each room
        if (isset($estimate['rooms']) && is_array($estimate['rooms']) && !empty($estimate['rooms'])) {
            foreach ($estimate['rooms'] as $room_id => $room) {
                $this->render_room_native($pdf, $room, $default_markup);
            }
        } else {
            // No rooms message
            $pdf->SetFont(self::FONT_FAMILY, 'I', 10);
            $pdf->SetTextColor(136, 136, 136);
            $pdf->Cell(0, 20, 'No rooms or products found in this estimate.', 1, 1, 'C', true);
        }

        // Total Estimate Section
        $this->render_total_section($pdf, $estimate, $default_markup);
    }

    /**
     * Render a room with its products using native TCPDF methods
     */
    private function render_room_native($pdf, $room, $default_markup) {
        // Calculate room area
        $room_width = isset($room['width']) ? floatval($room['width']) : 0;
        $room_length = isset($room['length']) ? floatval($room['length']) : 0;
        $room_area = $room_width * $room_length;

        // Get page dimensions
        $pageWidth = $pdf->getPageWidth();
        $marginLeft = $pdf->getMargins()['left'];
        $marginRight = $pdf->getMargins()['right'];
        $contentWidth = $pageWidth - $marginLeft - $marginRight;

        // Remember starting position
        $startX = $pdf->GetX();
        $startY = $pdf->GetY();

        // Set up for room name - using bold, brand color
        $pdf->SetFont(self::FONT_FAMILY, 'B', 14);
        $pdf->SetTextColor(self::COLOR_BRAND[0], self::COLOR_BRAND[1], self::COLOR_BRAND[2]);

        // Get width of room name text
        $room_name = $room['name'];
        $room_name_width = $pdf->GetStringWidth($room_name);

        // Write room name
        $pdf->Write(10, $room_name);

        // Position for dimensions - immediately after room name
        $pdf->SetX($startX + $room_name_width + 2); // Small spacing after name

        // Set up for dimensions - using regular weight, gray
        $pdf->SetFont(self::FONT_FAMILY, '', 10);
        $pdf->SetTextColor(102, 102, 102);

        // Create dimensions text
        $dimensions_text = sprintf("%d×%dm (%dm²)", $room['width'], $room['length'], $room_area);

        // Write dimensions
        $pdf->Write(10, $dimensions_text);

        // Get combined width of room name + dimensions
        $combined_width = $room_name_width + $pdf->GetStringWidth($dimensions_text) + 2;

        // Make sure we don't overlap with price area
        $max_allowed_width = $contentWidth * 0.7;
        if ($combined_width > $max_allowed_width) {
            // If combined text is too long, we'll need to truncate
            $pdf->SetXY($startX, $startY);
            $pdf->SetFont(self::FONT_FAMILY, 'B', 14);
            $pdf->SetTextColor(self::COLOR_BRAND[0], self::COLOR_BRAND[1], self::COLOR_BRAND[2]);
            $pdf->Cell($max_allowed_width, 10, $room_name, 0, 0, 'L', false, '', 1); // With text truncation

            // We'll skip dimensions in this case to avoid overlap
        }

        // Position for price - right side
        $pdf->SetXY($startX + $contentWidth - ($contentWidth * 0.3), $startY);

        // Room total price
        $pdf->SetFont(self::FONT_FAMILY, 'B', 12);
        $pdf->SetTextColor(51, 51, 51);

        if (isset($room['min_total']) && isset($room['max_total'])) {
            $price_text = $this->format_price_for_pdf($room['min_total'], $room['max_total'], $default_markup);
            $pdf->Cell($contentWidth * 0.3, 10, $price_text, 0, 0, 'R');
        } else {
            $pdf->Cell($contentWidth * 0.3, 10, '', 0, 0, 'R');
        }

        // Move to next line and add some spacing
        $pdf->Ln(12);

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

        $pdf->Ln(5);
    }

    /**
     * Render a product using native TCPDF methods with notes inside the card
     * Fixed to ensure consistent note alignment
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

        // Position tracking
        $startX = $pdf->GetX();
        $startY = $pdf->GetY();
        $image_offset = $has_image ? $image_width + 5 : 0;

        // No indentation for any products
        $indent = 0;

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
                    $note_width = $contentWidth - $image_offset - 15;
                    $lines = $pdf->getNumLines($note_text, $note_width);
                    $notes_height += $lines * 4 + 2; // 4pt line height + 2pt spacing
                }
            }
        }

        // Card styling - same for all products
        $bg_color = [255, 255, 255]; // White background for all products

        // Card height - dynamic calculation with less padding
        $base_height = 35; // Reduced base height for product name and price
        $card_height = $base_height + ($has_notes ? $notes_height : 0); // No extra padding for notes

        // Store original position to adjust final position later
        $original_y = $pdf->GetY();

        // Draw card background with subtle border for all products
        $pdf->SetFillColor($bg_color[0], $bg_color[1], $bg_color[2]);
        $pdf->SetDrawColor(230, 230, 230); // Light gray border
        $pdf->RoundedRect($startX, $startY, $contentWidth, $card_height, 2, '1111', 'FD');

        // Add image if available - positioned at the top of the card
        if ($has_image) {
            $pdf->Image($image_path, $startX + $indent + 5, $startY + 5, $image_width, $image_height);
        }

        // Set position for product name
        $beforeTextX = $startX + $indent + $image_offset + 5;
        $beforeTextY = $startY + 10; // Top position for text
        $pdf->SetXY($beforeTextX, $beforeTextY);

        // Product name
        $title_width = $contentWidth - $indent - $image_offset - 5 - ($contentWidth * 0.3);
        $pdf->SetFont(self::FONT_FAMILY, 'B', 12);
        $pdf->SetTextColor(51, 51, 51);

        // Make sure we have a product name
        $product_name = isset($product['name']) ? $product['name'] : 'Unnamed Product';
        $pdf->Cell($title_width, 10, $product_name, 0, 1);

        // Price information - with green color for emphasis
        // Position to the right of the product name
        $pdf->SetXY($startX + $contentWidth - ($contentWidth * 0.3), $beforeTextY);
        $pdf->SetFont(self::FONT_FAMILY, 'B', 11);
        $pdf->SetTextColor(0, 133, 63); // Green color for prices

        if (isset($product['min_price_total']) && isset($product['max_price_total'])) {
            $price_text = $this->format_price_for_pdf($product['min_price_total'], $product['max_price_total'], $default_markup);
            $pdf->Cell(($contentWidth * 0.3) - 5, 10, $price_text, 0, 1, 'R');

            // Remove "Per m²" text entirely - no longer displaying pricing method indicator
        } else {
            $pdf->Cell(($contentWidth * 0.3) - 5, 10, '', 0, 1, 'R');
        }

        // Add product notes if available - INSIDE THE CARD
        if ($has_notes) {
            // Set position for notes - below product name and price
            $notesX = $startX + $indent + $image_offset + 5;
            $notesY = $beforeTextY + 15; // Position notes below product name

            // FIXED: Set a consistent starting position for all notes
            $pdf->SetXY($notesX, $notesY);
            $pdf->SetFont(self::FONT_FAMILY, '', 9);
            $pdf->SetTextColor(102, 102, 102); // Gray text for notes

            // Set a fixed width for notes to ensure proper alignment
            $note_width = $contentWidth - $image_offset - 15;

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

                // FIXED: Use Cell for shorter notes to reduce vertical space
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

                // Add minimal space between notes
                $pdf->Ln(1);
            }
        }

        // FIXED: Reduce spacing between products - use actual content height instead of estimated
        // Get the current Y position after all content has been rendered
        $currentY = $pdf->GetY();

        // Calculate the actual content height
        $actual_content_height = $currentY - $startY;

        // Use the greater of actual content height or calculated card height
        // but with minimal added spacing (2pt instead of 5pt)
        $next_y = $startY + max($actual_content_height, $card_height) + 2;
        $pdf->SetY($next_y);
    }

    /**
     * Render a note using native TCPDF methods - Fixed to ensure consistent alignment
     */
    private function render_note_native($pdf, $note) {
        // Get page dimensions
        $pageWidth = $pdf->getPageWidth();
        $marginLeft = $pdf->getMargins()['left'];
        $marginRight = $pdf->getMargins()['right'];
        $contentWidth = $pageWidth - $marginLeft - $marginRight;

        // Position tracking
        $startX = $pdf->GetX();
        $startY = $pdf->GetY();

        // Create a green bar on left side
        $pdf->SetFillColor(self::COLOR_BRAND[0], self::COLOR_BRAND[1], self::COLOR_BRAND[2]);
        $pdf->Rect($startX, $startY, 3, 5, 'F');

        // FIXED: Use writeHTMLCell for consistent text alignment
        $pdf->SetXY($startX + 5, $startY);
        $pdf->SetFont(self::FONT_FAMILY, '', 10);
        $pdf->SetTextColor(51, 51, 51);

        $note_text = isset($note['note_text']) ? $note['note_text'] : '';

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
            true                // autopadding
        );

        $pdf->Ln(2);
    }

    /**
     * Render total estimate section
     */
    private function render_total_section($pdf, $estimate, $default_markup) {
        if (!isset($estimate['min_total']) || !isset($estimate['max_total'])) {
            return;
        }

        // Green line separator
        $pdf->SetDrawColor(self::COLOR_BRAND[0], self::COLOR_BRAND[1], self::COLOR_BRAND[2]);
        $pdf->SetLineWidth(0.5);
        $pdf->Line($pdf->GetX(), $pdf->GetY(), $pdf->GetX() + ($pdf->GetPageWidth() - $pdf->getMargins()['left'] - $pdf->getMargins()['right']), $pdf->GetY());
        $pdf->Ln(5);

        // Total section
        $pageWidth = $pdf->getPageWidth();
        $marginLeft = $pdf->getMargins()['left'];
        $marginRight = $pdf->getMargins()['right'];
        $contentWidth = $pageWidth - $marginLeft - $marginRight;

        // Total Label
        $pdf->SetFont(self::FONT_FAMILY, 'B', 14);
        $pdf->SetTextColor(51, 51, 51);
        $pdf->Cell($contentWidth * 0.7, 10, 'TOTAL ESTIMATE', 0, 0, 'L');

        // Total Value
        $pdf->SetFont(self::FONT_FAMILY, 'B', 16);
        $pdf->SetTextColor(self::COLOR_BRAND[0], self::COLOR_BRAND[1], self::COLOR_BRAND[2]);
        $price_text = $this->format_price_for_pdf($estimate['min_total'], $estimate['max_total'], $default_markup);
        $pdf->Cell($contentWidth * 0.3, 10, $price_text, 0, 1, 'R');
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
}
