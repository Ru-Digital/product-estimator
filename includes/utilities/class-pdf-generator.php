<?php
namespace RuDigital\ProductEstimator\Includes\Utilities;

/**
 * PDF Generator
 *
 * Handles PDF generation for estimates
 *
 * @since      1.0.0
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes/utilities
 */
class PDFGenerator {
    /**
     * Generate a PDF from an estimate
     *
     * @param array $estimate The estimate data
     * @return string PDF file contents
     */
    public function generate_pdf($estimate) {
        // Check if DOMPDF library is available through Composer
        if (!class_exists('\Dompdf\Dompdf')) {
            // Log error and fallback to a simpler solution
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('DOMPDF library not available. Using basic PDF generation.');
            }

            return $this->generate_basic_pdf($estimate);
        }

        // Initialize DOMPDF
        $dompdf = new \Dompdf\Dompdf([
            'enable_remote' => true,
            'isRemoteEnabled' => true,
            'defaultFont' => 'sans'
        ]);

        // Start output buffering to capture HTML
        ob_start();

        // Include the PDF template
        include PRODUCT_ESTIMATOR_PLUGIN_DIR . 'public/partials/pdf-templates/estimate-pdf-template.php';

        // Get HTML
        $html = ob_get_clean();

        // Load HTML into DOMPDF
        $dompdf->loadHtml($html);

        // Set paper size and orientation
        $dompdf->setPaper('A4', 'portrait');

        // Render the PDF
        $dompdf->render();

        // Return the generated PDF
        return $dompdf->output();
    }

    /**
     * Fallback method to generate a basic PDF if DOMPDF is not available
     *
     * @param array $estimate The estimate data
     * @return string PDF file contents
     */
    private function generate_basic_pdf($estimate) {
        // Check if TCPDF is available through Composer
        if (!class_exists('\TCPDF')) {
            // Fatal error - no PDF library available
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('No PDF library available. Cannot generate PDF.');
            }

            return false;
        }

        // Initialize TCPDF
        $pdf = new \TCPDF(PDF_PAGE_ORIENTATION, PDF_UNIT, PDF_PAGE_FORMAT, true, 'UTF-8', false);

        // Set document information
        $pdf->SetCreator('Product Estimator');
        $pdf->SetAuthor('Product Estimator');
        $pdf->SetTitle($estimate['name'] . ' - Estimate');
        $pdf->SetSubject('Product Estimate');

        // Set margins
        $pdf->SetMargins(15, 15, 15);
        $pdf->SetHeaderMargin(5);
        $pdf->SetFooterMargin(10);

        // Set auto page breaks
        $pdf->SetAutoPageBreak(TRUE, 15);

        // Add a page
        $pdf->AddPage();

        // Set font
        $pdf->SetFont('helvetica', '', 10);

        // Start building the content
        $html = '<h1>Estimate: ' . esc_html($estimate['name']) . '</h1>';

        // Add customer details if available
        if (isset($estimate['customer_details'])) {
            $html .= '<h2>Customer Details</h2>';
            $html .= '<p>';
            $html .= '<strong>Name:</strong> ' . esc_html($estimate['customer_details']['name']) . '<br>';
            $html .= '<strong>Email:</strong> ' . esc_html($estimate['customer_details']['email']) . '<br>';

            if (!empty($estimate['customer_details']['phone'])) {
                $html .= '<strong>Phone:</strong> ' . esc_html($estimate['customer_details']['phone']) . '<br>';
            }

            $html .= '<strong>Postcode:</strong> ' . esc_html($estimate['customer_details']['postcode']);
            $html .= '</p>';
        }

        // Add rooms and products
        if (isset($estimate['rooms']) && is_array($estimate['rooms'])) {
            $html .= '<h2>Rooms</h2>';

            foreach ($estimate['rooms'] as $room_id => $room) {
                $html .= '<h3>' . esc_html($room['name']) . ' (' . esc_html($room['width']) . 'm x ' . esc_html($room['length']) . 'm)</h3>';

                if (isset($room['products']) && is_array($room['products'])) {
                    $html .= '<table border="1" cellpadding="5">';
                    $html .= '<tr><th>Product</th><th>Price</th></tr>';

                    foreach ($room['products'] as $product) {
                        // Skip notes
                        if (isset($product['type']) && $product['type'] === 'note') {
                            continue;
                        }

                        $html .= '<tr>';
                        $html .= '<td>' . esc_html($product['name']) . '</td>';

                        // Display price range
                        if ($product['min_price_total'] === $product['max_price_total']) {
                            $html .= '<td>$' . number_format($product['min_price_total'], 2) . '</td>';
                        } else {
                            $html .= '<td>$' . number_format($product['min_price_total'], 2) . ' - $' . number_format($product['max_price_total'], 2) . '</td>';
                        }

                        $html .= '</tr>';
                    }

                    $html .= '</table>';
                }
            }
        }

        // Add total
        if (isset($estimate['min_total']) && isset($estimate['max_total'])) {
            $html .= '<h2>Total</h2>';

            if ($estimate['min_total'] === $estimate['max_total']) {
                $html .= '<p><strong>Total:</strong> $' . number_format($estimate['min_total'], 2) . '</p>';
            } else {
                $html .= '<p><strong>Total:</strong> $' . number_format($estimate['min_total'], 2) . ' - $' . number_format($estimate['max_total'], 2) . '</p>';
            }
        }

        // Write the HTML to the PDF
        $pdf->writeHTML($html, true, false, true, false, '');

        // Return the generated PDF
        return $pdf->Output('estimate.pdf', 'S');
    }
}
