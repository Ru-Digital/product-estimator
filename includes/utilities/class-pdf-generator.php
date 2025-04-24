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

        // Store footer content in class properties for use in footer callback
        $this->footer_text = isset($options['pdf_footer_text']) ? $options['pdf_footer_text'] : '';
        $this->footer_contact_details = isset($options['pdf_footer_contact_details_content']) ? $options['pdf_footer_contact_details_content'] : '';

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
     * Extend TCPDF with a custom footer and page template support
     */
    private function createCustomPDF() {
        // Create a custom PDF class that extends TCPDF/FPDI to handle custom footer
        $footer_text = $this->footer_text;
        $footer_contact_details = $this->footer_contact_details;

        return new class($footer_text, $footer_contact_details) extends Fpdi {
            protected $footer_text;
            protected $footer_contact_details;
            protected $template_id = null;
            protected $tpl_idx = null;

            public function __construct($footer_text, $footer_contact_details) {
                parent::__construct();
                $this->footer_text = $footer_text;
                $this->footer_contact_details = $footer_contact_details;
            }

            // Set template info
            public function setTemplateFile($template_path) {
                $this->setSourceFile($template_path);
                // Store template info for later use in other pages
                $this->template_id = $template_path;
                // Import first page as template - store the index
                $this->tpl_idx = $this->importPage(1);
                return $this->tpl_idx;
            }

            // Override AddPage to apply template to each new page
            public function AddPage($orientation = '', $format = '', $keepmargins = false, $tocpage = false) {
                // First add the page
                parent::AddPage($orientation, $format, $keepmargins, $tocpage);

                // If we have a template, apply it to the new page
                if ($this->tpl_idx !== null) {
                    $this->useTemplate($this->tpl_idx, 0, 0, $this->getPageWidth(), $this->getPageHeight());
                }
            }

            // Page footer
            public function Footer() {
                // Position at 15 mm from bottom
                $this->SetY(-32);

                // Set font
                $this->SetFont('helvetica', '', 9);

                // Draw line
                $this->Ln(1);

                // Footer content with 40% width contact details
                $this->StartTransform();

                // Left side - Main footer text (60% width)
                $this->SetX(15);
                $html_footer = '';

                ob_start();
                include PRODUCT_ESTIMATOR_PLUGIN_DIR . 'public/partials/pdf-templates/pdf-footer.php';
                $html_footer = ob_get_clean();

                $this->writeHTML($html_footer, true, false, true, false, '');
                $this->StopTransform();

                // Add generation info
                $this->Ln(2);

                // Page number
                $this->Ln(4);
                $this->Cell(0, 0, 'Page ' . $this->getAliasNumPage() . ' of ' . $this->getAliasNbPages(), 0, 0, 'C');
            }
        };
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
        // Create FPDI instance with custom footer
        $pdf = $this->createCustomPDF();

        // Set document information
        $pdf->SetCreator('Product Estimator');
        $pdf->SetAuthor('Product Estimator');
        $pdf->SetTitle($estimate['name'] . ' - Estimate');
        $pdf->SetSubject('Product Estimate');

        // Setup for footer
        $pdf->setPrintHeader(false);
        $pdf->setPrintFooter(true);
        $pdf->setFooterMargin(10);

        // Set margins
        $pdf->SetMargins(15, $margin_top, 15);

        // Enable auto page break
        $pdf->SetAutoPageBreak(true, $margin_bottom + 25); // Add extra space for footer

        // Set up the template for all pages
        $pdf->setTemplateFile($template_path);

        // Add a page - the template will be applied automatically in the overridden AddPage method
        $pdf->AddPage();

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
