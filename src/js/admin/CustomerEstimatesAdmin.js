/**
 * Customer Estimates Admin JavaScript
 *
 * Handles functionality for the customer estimates admin page
 */
import { ajax, dom, format, validation } from '@utils';
import { createLogger } from '@utils';
const logger = createLogger('CustomerEstimatesAdmin');

class CustomerEstimatesAdmin {
  /**
   * Initialize the class
   */
  constructor() {
    // Init properties
    this.settings = {
      ajaxUrl: window.customerEstimatesAdmin?.ajax_url || (typeof ajaxurl !== 'undefined' ? ajaxurl : '/wp-admin/admin-ajax.php'),
      nonce: window.customerEstimatesAdmin?.nonce || '',
      i18n: window.customerEstimatesAdmin?.i18n || {}
    };

    // Initialize when document is ready
    jQuery(document).ready(() => this.init());
  }

  /**
   * Initialize the module
   */
  init() {
    this.bindEvents();
    this.initializeActions();
  }

  /**
   * Bind event handlers
   */
  bindEvents() {
    const $ = jQuery;

    // Handle bulk action form submission
    $('#doaction, #doaction2').on('click', this.handleBulkAction.bind(this));

    // Handle email estimate button click
    $('.email-estimate').on('click', this.handleEmailEstimate.bind(this));

    // Handle status filter change
    $('select[name="status_filter"]').on('change', function() {
      $(this).closest('form').submit();
    });

    // Add table row hover effect
    $('.wp-list-table tbody tr').hover(
      function() { $(this).addClass('row-hover'); },
      function() { $(this).removeClass('row-hover'); }
    );

    // Initialize tooltips if present
    if (typeof $.fn.tooltip === 'function') {
      $('.tooltip-trigger').tooltip();
    }

    // Add export button click handler
    $('#export-estimates-btn').on('click', this.exportEstimates.bind(this));

    // Add print button click handler
    $('.print-estimate-btn').on('click', (e) => {
      e.preventDefault();
      const estimateId = $(e.currentTarget).data('estimate-id');
      if (estimateId) {
        this.printEstimate(estimateId);
      }
    });
  }

  /**
   * Initialize actions
   */
  initializeActions() {
    // Add responsive table labels for mobile
    this.addResponsiveTableLabels();

    // Initialize search field if empty
    this.handleSearchField();

    // Check for admin notices
    this.handleAdminNotices();
  }

  /**
   * Handle bulk action
   * @param {Event} e Click event
   * @returns {boolean} Whether to continue with the action
   */
  handleBulkAction(e) {
    const $ = jQuery;
    const action = $(e.target).prev('select').val();

    if (action === 'delete') {
      const checked = $('tbody th.check-column input[type="checkbox"]:checked');

      if (checked.length === 0) {
        e.preventDefault();
        alert('Please select at least one estimate to delete.');
        return false;
      }

      if (!confirm(this.settings.i18n.confirmBulkDelete)) {
        e.preventDefault();
        return false;
      }
    }
  }

  /**
   * Handle email estimate button click
   * @param {Event} e Click event
   */
  handleEmailEstimate(e) {
    e.preventDefault();
    const $ = jQuery;

    const $button = $(e.currentTarget);
    const estimateId = $button.data('estimate-id');
    const originalText = $button.text();

    // Show loading state
    $button.text(this.settings.i18n.emailSending).prop('disabled', true);

    // Send AJAX request using our ajax utility
    ajax.ajaxRequest({
      url: this.settings.ajaxUrl,
      data: {
        action: 'email_estimate',
        estimate_id: estimateId,
        nonce: this.settings.nonce
      }
    })
      .then(data => {
        // Use validation utility to show success message
        validation.showNotice(this.settings.i18n.emailSuccess, 'success');
      })
      .catch(error => {
        // Use validation utility to show error message
        const errorMessage = this.settings.i18n.emailError +
          (error.data?.message ? ': ' + error.data.message : '');
        validation.showNotice(errorMessage, 'error');
      })
      .finally(() => {
        // Reset button state
        $button.text(originalText).prop('disabled', false);
      });
  }

  /**
   * Add responsive table labels for mobile
   */
  addResponsiveTableLabels() {
    const $ = jQuery;

    if ($(window).width() <= 782) {
      $('.wp-list-table td').each(function() {
        const $td = $(this);
        const th = $td.closest('table').find('th').eq($td.index());

        if (th.length) {
          $td.attr('data-label', th.text());
        }
      });
    }
  }

  /**
   * Handle search field
   */
  handleSearchField() {
    const $ = jQuery;
    const $searchField = $('#estimate-search-input');

    if ($searchField.length && !$searchField.val()) {
      $searchField.focus();
    }
  }

  /**
   * Handle admin notices
   */
  handleAdminNotices() {
    const urlParams = new URLSearchParams(window.location.search);
    const message = urlParams.get('message');

    if (message) {
      let messageText = '';
      let messageType = 'success';

      switch (message) {
        case 'email_sent':
          messageText = 'Email sent successfully!';
          break;
        case 'email_failed':
          messageText = 'Failed to send email.';
          messageType = 'error';
          break;
        case 'deleted':
          messageText = 'Estimate deleted successfully!';
          break;
        case 'delete_failed':
          messageText = 'Failed to delete estimate.';
          messageType = 'error';
          break;
        case 'duplicated':
          messageText = 'Estimate duplicated successfully!';
          break;
        case 'duplicate_failed':
          messageText = 'Failed to duplicate estimate.';
          messageType = 'error';
          break;
      }

      if (messageText) {
        // Use validation utility to show notice
        validation.showNotice(messageText, messageType);
      }
    }
  }

  /**
   * Show a notice message using validation utility
   * @param {string} message The message to display
   * @param {string} type The notice type ('success' or 'error')
   */
  showNotice(message, type = 'success') {
    // Use the validation utility function
    validation.showNotice(message, type);
  }

  /**
   * Export estimates
   */
  exportEstimates() {
    const filters = {};

    // Get current filter values
    const statusFilter = jQuery('select[name="status_filter"]').val();
    const searchTerm = jQuery('#estimate-search-input').val();

    if (statusFilter) filters.status = statusFilter;
    if (searchTerm) filters.search = searchTerm;

    // Create export URL using format utility
    const exportUrl = new URL(this.settings.ajaxUrl);
    exportUrl.searchParams.append('action', 'export_estimates');
    exportUrl.searchParams.append('nonce', this.settings.nonce);

    // Add filters to URL
    for (const key in filters) {
      exportUrl.searchParams.append(key, filters[key]);
    }

    // Trigger download
    window.location.href = exportUrl.toString();
  }

  /**
   * Print single estimate
   * @param {number} estimateId The estimate ID to print
   */
  printEstimate(estimateId) {
    const $ = jQuery;
    const printWindow = window.open('', '_blank');

    // Show loading state
    printWindow.document.write('<html><head><title>Printing Estimate...</title></head>');
    printWindow.document.write('<body><p>Loading estimate for printing...</p></body></html>');

    // Load estimate content via AJAX using ajax utility
    ajax.ajaxRequest({
      url: this.settings.ajaxUrl,
      data: {
        action: 'get_estimate_print_view',
        estimate_id: estimateId,
        nonce: this.settings.nonce
      }
    })
      .then(response => {
        printWindow.document.write(response.html);
        printWindow.document.close();

        // Wait for content to load then print
        printWindow.onload = function() {
          printWindow.print();
        };
      })
      .catch(error => {
        printWindow.document.write('<p>Error loading estimate: ' +
          (error.data?.message || 'Unknown error') + '</p>');
        printWindow.document.close();
      });
  }

  /**
   * Handle estimate duplication
   * @param {number} estimateId The estimate ID to duplicate
   */
  duplicateEstimate(estimateId) {
    if (!estimateId) return;

    // Confirm duplication
    if (!confirm(this.settings.i18n.duplicateConfirm)) {
      return;
    }

    // Use ajax utility for the request
    ajax.wpAjax('duplicate_estimate', {
      estimate_id: estimateId
    })
      .then(response => {
        // Show success message
        this.showNotice(response.message || 'Estimate duplicated successfully!');

        // Reload page to show the duplicated estimate
        window.location.reload();
      })
      .catch(error => {
        // Show error message
        this.showNotice(error.message || 'Failed to duplicate estimate', 'error');
      });
  }

  /**
   * Format date for display
   * @param {string} dateString Date string from server
   * @returns {string} Formatted date
   */
  formatDate(dateString) {
    // Use format utility
    return format.formatDate(dateString, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Format price for display
   * @param {number|string} amount Price amount
   * @returns {string} Formatted price
   */
  formatPrice(amount) {
    // Use format utility
    return format.formatPrice(amount, '$');
  }

  /**
   * Safely truncate text with ellipsis
   * @param {string} text Text to truncate
   * @param {number} maxLength Maximum length
   * @returns {string} Truncated text
   */
  truncateText(text, maxLength = 50) {
    // Use format utility
    return format.truncateText(text, maxLength);
  }
}

// Initialize the module
jQuery(document).ready(function() {
  const module = new CustomerEstimatesAdmin();

  // Make the module available globally for debugging
  window.CustomerEstimatesAdmin = module;
});

export default CustomerEstimatesAdmin;
