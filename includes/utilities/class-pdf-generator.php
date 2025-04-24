<?php
namespace RuDigital\ProductEstimator\Includes\Utilities;

use setasign\Fpdi\Tcpdf\Fpdi;

/**
 * PDF Generator with FPDI
 *
 * Handles PDF generation for estimates using FPDI to incorporate templates
 * With enhanced image handling to ensure images display properly
 * Image placement is to the left of product title for better layout
 *
 * @since      1.0.0
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

        // Generate content and directly process product images
        $this->render_content($pdf, $estimate);

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
             * Page header
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
             * Page footer
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
     * Render the PDF content with direct image processing
     *
     * @param object $pdf PDF object
     * @param array $estimate Estimate data
     */
    private function render_content($pdf, $estimate) {
        // Get settings
        $options = get_option('product_estimator_settings', []);
        $default_markup = isset($estimate['default_markup']) ? floatval($estimate['default_markup']) : 0;

        // Define color variables for consistency
        $brand_green = '#00833F';
        $border_light = '#eeeeee';
        $bg_light = '#f9f9f9';
        $text_dark = '#333333';
        $text_light = '#666666';
        $text_lighter = '#888888';

        // Summary Section
        $summary_html = '<div style="margin-bottom: 25px;">
            <h2 style="font-size: 16pt; color: #333333; margin-top: 20px; margin-bottom: 10px; font-weight: 600; padding-bottom: 5px; border-bottom: 1px solid #eeeeee;">Estimate Summary</h2>
            <table width="100%" border="0" cellspacing="0" cellpadding="5">
                <tr>
                    <td style="font-weight: bold; font-size: 14pt; text-align: left;">' . esc_html($estimate['name']) . '</td>
                    <td style="font-weight: bold; color: ' . $brand_green . '; text-align: right;">';

        if (isset($estimate['min_total']) && isset($estimate['max_total'])) {
            if ($estimate['min_total'] === $estimate['max_total']) {
                $summary_html .= display_price_with_markup($estimate['min_total'], $default_markup, "up");
            } else {
                $summary_html .= display_price_with_markup($estimate['min_total'], $default_markup, "down") . ' - ' .
                    display_price_with_markup($estimate['max_total'], $default_markup, "up");
            }
        }

        $summary_html .= '</td>
                </tr>
            </table>
        </div>';

        $pdf->writeHTML($summary_html, true, false, true, false, '');

        // Rooms Header
        $rooms_header = '<h2 style="font-size: 16pt; color: #333333; margin-top: 20px; margin-bottom: 10px; font-weight: 600; padding-bottom: 5px; border-bottom: 1px solid #eeeeee;">Room Details</h2>';
        $pdf->writeHTML($rooms_header, true, false, true, false, '');

        // Process each room
        if (isset($estimate['rooms']) && is_array($estimate['rooms']) && !empty($estimate['rooms'])) {
            foreach ($estimate['rooms'] as $room_id => $room) {
                $this->render_room($pdf, $room, $default_markup, $brand_green, $border_light, $bg_light);
            }
        } else {
            $no_rooms_html = '<div style="font-style: italic; color: #888888; text-align: center; padding: 20px; border: 1px dashed #dddddd; margin: 15px 0;">No rooms or products found in this estimate.</div>';
            $pdf->writeHTML($no_rooms_html, true, false, true, false, '');
        }

        // Total Estimate Section
        if (isset($estimate['min_total']) && isset($estimate['max_total'])) {
            $total_html = '<hr style="border: none; border-top: 2px solid ' . $brand_green . '; margin: 30px 0 15px 0;">
            <table width="100%" border="0" cellspacing="0" cellpadding="5">
                <tr>
                    <td style="font-size: 14pt; font-weight: bold;">TOTAL ESTIMATE</td>
                    <td style="font-size: 16pt; font-weight: bold; color: ' . $brand_green . '; text-align: right;">';

            if ($estimate['min_total'] === $estimate['max_total']) {
                $total_html .= display_price_with_markup($estimate['min_total'], $default_markup, "up");
            } else {
                $total_html .= display_price_with_markup($estimate['min_total'], $default_markup, "down") . ' - ' .
                    display_price_with_markup($estimate['max_total'], $default_markup, "up");
            }

            $total_html .= '</td>
                </tr>
            </table>';

            $pdf->writeHTML($total_html, true, false, true, false, '');
        }
    }

    /**
     * Render a room with its products
     *
     * @param object $pdf PDF object
     * @param array $room Room data
     * @param float $default_markup Default markup percentage
     * @param string $brand_green Green color code
     * @param string $border_light Border light color
     * @param string $bg_light Background light color
     */
    private function render_room($pdf, $room, $default_markup, $brand_green, $border_light, $bg_light) {
        // Calculate room area
        $room_width = isset($room['width']) ? floatval($room['width']) : 0;
        $room_length = isset($room['length']) ? floatval($room['length']) : 0;
        $room_area = $room_width * $room_length;

        // Room header
        $room_header = '<div style="margin-bottom: 25px; page-break-inside: avoid;">
            <table width="100%" border="0" cellspacing="0" cellpadding="5">
                <tr>
                    <td style="font-weight: bold; font-size: 14pt; color: ' . $brand_green . '; text-align: left;">
                        ' . esc_html($room['name']) . '
                        <span style="background: #f5f5f5; padding: 3px 8px; border-radius: 4px; font-size: 10pt; color: #666666; display: inline-block; margin-left: 8px;">
                            ' . esc_html($room['width']) . '×' . esc_html($room['length']) . 'm
                            (' . number_format($room_area, 2) . 'm²)
                        </span>
                    </td>
                    <td style="font-weight: bold; text-align: right; font-size: 12pt;">';

        if (isset($room['min_total']) && isset($room['max_total'])) {
            if ($room['min_total'] === $room['max_total']) {
                $room_header .= display_price_with_markup($room['min_total'], $default_markup, "up");
            } else {
                $room_header .= display_price_with_markup($room['min_total'], $default_markup, "down") . ' - ' .
                    display_price_with_markup($room['max_total'], $default_markup, "up");
            }
        }

        $room_header .= '</td>
                </tr>
            </table>';

        $pdf->writeHTML($room_header, true, false, true, false, '');

        // Process products
        if (isset($room['products']) && is_array($room['products'])) {
            // Create a consolidated array of products
            $all_products = [];

            foreach ($room['products'] as $product) {
                // Skip notes - process separately
                if (isset($product['type']) && $product['type'] === 'note') {
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
                $this->render_product($pdf, $product_item, $default_markup, $brand_green, $border_light, $bg_light);
            }

            // Process standalone notes
            foreach ($room['products'] as $product) {
                if (isset($product['type']) && $product['type'] === 'note') {
                    $note_html = '<div style="margin: 8px 0; padding: 8px 10px; background-color: #f8f8f8; border-left: 3px solid ' . $brand_green . '; font-size: 10pt;">
                        <table border="0" cellspacing="0" cellpadding="2">
                            <tr>
                                <td width="15" style="vertical-align: top; color: ' . $brand_green . ';">•</td>
                                <td style="vertical-align: top;">' . esc_html($product['note_text']) . '</td>
                            </tr>
                        </table>
                    </div>';

                    $pdf->writeHTML($note_html, true, false, true, false, '');
                }
            }
        } else {
            $no_products_html = '<div style="font-style: italic; color: #888888; text-align: center; padding: 20px; border: 1px dashed #dddddd; margin: 15px 0;">No products in this room.</div>';
            $pdf->writeHTML($no_products_html, true, false, true, false, '');
        }

        $pdf->writeHTML('</div>', true, false, true, false, '');
    }

    /**
     * Render a product item with image to the left of title and content
     *
     * @param object $pdf PDF object
     * @param array $product_item Product item data
     * @param float $default_markup Default markup percentage
     * @param string $brand_green Green color code
     * @param string $border_light Border light color
     * @param string $bg_light Background light color
     */
    private function render_product($pdf, $product_item, $default_markup, $brand_green, $border_light, $bg_light) {
        $product = $product_item['product_data'];
        $is_addition = $product_item['is_addition'];
        $parent_name = $product_item['parent_name'];

        // Get product pricing method
        $pricing_method = isset($product['pricing_method']) ? $product['pricing_method'] : 'fixed';

        // Start product container
        $product_start = '<div style="margin-bottom: 15px; border: 1px solid ' . $border_light . '; overflow: hidden; background: #fff; page-break-inside: avoid;">';
        $pdf->writeHTML($product_start, true, false, true, false, '');

        // Process image first if available
        $has_image = false;
        $image_height = 0;
        $image_width = 0;

        if (!empty($product['image'])) {
            // Get image path and details
            $image_path = $this->get_image_path($product['image']);

            if ($image_path) {
                $has_image = true;

                // Get current position
                $start_x = $pdf->GetX();
                $start_y = $pdf->GetY();

                // Image dimensions (mm)
                $image_width = 18;  // ~68px
                $image_height = 18; // ~68px

                // Add image at current position + margins
                $pdf->Image($image_path, $start_x + 5, $start_y + 5, $image_width, $image_height);

                // Reset position
                $pdf->SetY($start_y);
            }
        }

        // Product header with title and price - adjusted for image
        $header_html = '<table width="100%" border="0" cellspacing="0" cellpadding="10" style="border-bottom: 1px solid ' . $border_light . '; background: ' . $bg_light . ';">';

        // If there's an image, adjust the first cell with padding
        if ($has_image) {
            $header_html .= '<tr>
                <td width="' . ($image_width + 10) . 'mm"></td>
                <td style="font-weight: bold; font-size: 12pt; text-align: left; padding-left: 0;">
                    ' . esc_html($product['name']) . '
                </td>';
        } else {
            $header_html .= '<tr>
                <td style="font-weight: bold; font-size: 12pt; text-align: left;">
                    ' . esc_html($product['name']) . '
                </td>';
        }

        // Add price cell
        $header_html .= '<td style="font-weight: bold; color: ' . $brand_green . '; text-align: right;">';

        if (isset($product['min_price_total']) && isset($product['max_price_total'])) {
            if ($product['min_price_total'] === $product['max_price_total']) {
                $header_html .= display_price_with_markup($product['min_price_total'], $default_markup, "up");
            } else {
                $header_html .= display_price_with_markup($product['min_price_total'], $default_markup, "down") . ' - ' .
                    display_price_with_markup($product['max_price_total'], $default_markup, "up");
            }
        }

        $header_html .= '</td></tr></table>';

        $pdf->writeHTML($header_html, true, false, true, false, '');

        // Product details content
        $content_html = '<table width="100%" border="0" cellspacing="0" cellpadding="10"><tr>';

        // If there's an image, add cell spacer to align with the image
        if ($has_image) {
            $content_html .= '<td width="' . ($image_width + 10) . 'mm"></td>';
        }

        // Details cell
        $content_html .= '<td style="vertical-align: top;">';

        if ($pricing_method === 'fixed') {
            $content_html .= '<div style="font-style: italic; color: #888888; font-size: 9pt; margin-bottom: 8px;">Fixed price product</div>';
        }

        // Add notes if available
        if (!$is_addition && isset($product['additional_notes']) && is_array($product['additional_notes']) && !empty($product['additional_notes'])) {
            $content_html .= '<div style="margin: 8px 0; padding: 8px 10px; background-color: #f8f8f8; border-left: 3px solid ' . $brand_green . '; font-size: 10pt;">';

            foreach ($product['additional_notes'] as $note) {
                $content_html .= '<table border="0" cellspacing="0" cellpadding="2"><tr>
                    <td width="15" style="vertical-align: top; color: ' . $brand_green . ';">•</td>
                    <td style="vertical-align: top;">' . esc_html($note['note_text']) . '</td>
                </tr></table>';
            }

            $content_html .= '</div>';
        }

        $content_html .= '</td></tr></table></div>';

        $pdf->writeHTML($content_html, true, false, true, false, '');
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
