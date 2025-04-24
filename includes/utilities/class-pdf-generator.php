<?php
namespace RuDigital\ProductEstimator\Includes\Utilities;

use setasign\Fpdi\Tcpdf\Fpdi;

/**
 * PDF Generator with FPDI
 *
 * Handles PDF generation for estimates using FPDI to incorporate templates
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
        // Get settings for template and margins
        $options = get_option('product_estimator_settings', []);
        $template_id = isset($options['pdf_template']) ? intval($options['pdf_template']) : 0;
        $margin_top = isset($options['pdf_margin_top']) ? intval($options['pdf_margin_top']) : 15;
        $margin_bottom = isset($options['pdf_margin_bottom']) ? intval($options['pdf_margin_bottom']) : 15;

        error_log("margin-top: ". $margin_top);

        // Check if FPDI is available (it extends TCPDF)
        if (class_exists('\\setasign\\Fpdi\\Tcpdf\\Fpdi') && $template_id > 0) {
            // Get the template PDF file path
            $template_path = get_attached_file($template_id);

            if ($template_path && file_exists($template_path)) {
                try {
                    // Use template-based PDF generation
                    return $this->generate_template_based_pdf($estimate, $template_path, $margin_top, $margin_bottom);
                } catch (\Exception $e) {
                    // Log error and continue with regular PDF generation
                    if (defined('WP_DEBUG') && WP_DEBUG) {
                        error_log('Error generating template PDF: ' . $e->getMessage());
                    }
                }
            }
        }
    }

    /**
     * Generate a PDF using an uploaded template PDF as the base
     *
     * @param array $estimate The estimate data
     * @param string $template_path Path to the template PDF
     * @param int $margin_top Top margin in mm
     * @param int $margin_bottom Bottom margin in mm
     * @return string PDF file contents
     */
    private function generate_template_based_pdf($estimate, $template_path, $margin_top = 15, $margin_bottom = 15) {
        // Create FPDI instance
        $pdf = new Fpdi();

        // Disable auto page break initially (we'll handle it manually)
        $pdf->SetAutoPageBreak(false);

        // Set document information
        $pdf->SetCreator('Product Estimator');
        $pdf->SetAuthor('Product Estimator');
        $pdf->SetTitle($estimate['name'] . ' - Estimate');
        $pdf->SetSubject('Product Estimate');

        // Import the template - get page count
        $pageCount = $pdf->setSourceFile($template_path);

        // Import first page as template
        $tplIdx = $pdf->importPage(1);

        // Add a page and use the template
        $pdf->AddPage();
        $pdf->useTemplate($tplIdx, 0, 0, $pdf->getPageWidth(), $pdf->getPageHeight());

        // Reset margins for content
        $pdf->SetMargins(15, $margin_top, 15);
        $pdf->SetAutoPageBreak(true, $margin_bottom);

        // Move to position after the margin
        $pdf->SetY($margin_top);

        // Generate the dynamic content HTML
        ob_start();
        include PRODUCT_ESTIMATOR_PLUGIN_DIR . 'public/partials/pdf-templates/pdf-content-template.php';
        $html = ob_get_clean();

        // Write the HTML content on top of the template
        $pdf->writeHTML($html, true, false, true, false, '');

        // Return the generated PDF
        return $pdf->Output('', 'S');
    }
}
