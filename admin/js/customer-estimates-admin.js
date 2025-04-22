/**
 * Customer Estimates Admin JavaScript
 *
 * Handles functionality for the customer estimates admin page
 */
(function($) {
  'use strict';

  // Customer Estimates Admin Module
  const CustomerEstimatesAdmin = {
    init: function() {
      this.bindEvents();
      this.initializeActions();
    },

    bindEvents: function() {
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
    },

    initializeActions: function() {
      // Add responsive table labels for mobile
      this.addResponsiveTableLabels();

      // Initialize search field if empty
      this.handleSearchField();

      // Check for admin notices
      this.handleAdminNotices();
    },

    handleBulkAction: function(e) {
      const action = $(e.target).prev('select').val();

      if (action === 'delete') {
        const checked = $('tbody th.check-column input[type="checkbox"]:checked');

        if (checked.length === 0) {
          e.preventDefault();
          alert('Please select at least one estimate to delete.');
          return false;
        }

        if (!confirm(customerEstimatesAdmin.i18n.confirmBulkDelete)) {
          e.preventDefault();
          return false;
        }
      }
    },

    handleEmailEstimate: function(e) {
      e.preventDefault();

      const $button = $(e.currentTarget);
      const estimateId = $button.data('estimate-id');
      const originalText = $button.text();

      // Show loading state
      $button.text(customerEstimatesAdmin.i18n.emailSending).prop('disabled', true);

      // Send AJAX request
      $.ajax({
        url: customerEstimatesAdmin.ajax_url,
        type: 'POST',
        data: {
          action: 'email_estimate',
          estimate_id: estimateId,
          nonce: customerEstimatesAdmin.nonce
        },
        success: function(response) {
          if (response.success) {
            alert(customerEstimatesAdmin.i18n.emailSuccess);
          } else {
            alert(customerEstimatesAdmin.i18n.emailError + ': ' + response.data.message);
          }
        },
        error: function() {
          alert(customerEstimatesAdmin.i18n.emailError);
        },
        complete: function() {
          $button.text(originalText).prop('disabled', false);
        }
      });
    },

    addResponsiveTableLabels: function() {
      if ($(window).width() <= 782) {
        $('.wp-list-table td').each(function() {
          const $td = $(this);
          const th = $td.closest('table').find('th').eq($td.index());

          if (th.length) {
            $td.attr('data-label', th.text());
          }
        });
      }
    },

    handleSearchField: function() {
      const $searchField = $('#estimate-search-input');

      if ($searchField.length && !$searchField.val()) {
        $searchField.focus();
      }
    },

    handleAdminNotices: function() {
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
          this.showNotice(messageText, messageType);
        }
      }
    },

    showNotice: function(message, type = 'success') {
      const $notice = $(`<div class="notice notice-${type} is-dismissible"><p>${message}</p></div>`);

      $('.wrap h1').after($notice);

      // Make notices dismissible
      if (typeof wp !== 'undefined' && wp.notices) {
        wp.notices.removeDismissed();
      }

      // Add close button if wp.notices is not available
      if (typeof wp === 'undefined' || !wp.notices) {
        const $closeButton = $('<button type="button" class="notice-dismiss"><span class="screen-reader-text">Dismiss this notice.</span></button>');
        $notice.append($closeButton);

        $closeButton.on('click', function() {
          $notice.fadeOut(100, function() {
            $notice.remove();
          });
        });
      }

      // Auto-dismiss after 5 seconds
      setTimeout(() => {
        $notice.fadeOut(500, function() {
          $notice.remove();
        });
      }, 5000);
    },

    // Export functionality
    exportEstimates: function() {
      const filters = {};

      // Get current filter values
      const statusFilter = $('select[name="status_filter"]').val();
      const searchTerm = $('#estimate-search-input').val();

      if (statusFilter) filters.status = statusFilter;
      if (searchTerm) filters.search = searchTerm;

      // Create export URL
      const exportUrl = new URL(customerEstimatesAdmin.ajax_url);
      exportUrl.searchParams.append('action', 'export_estimates');
      exportUrl.searchParams.append('nonce', customerEstimatesAdmin.nonce);

      // Add filters to URL
      for (const key in filters) {
        exportUrl.searchParams.append(key, filters[key]);
      }

      // Trigger download
      window.location.href = exportUrl.toString();
    },

    // Print single estimate
    printEstimate: function(estimateId) {
      const printWindow = window.open('', '_blank');

      // Show loading state
      printWindow.document.write('<html><head><title>Printing Estimate...</title></head>');
      printWindow.document.write('<body><p>Loading estimate for printing...</p></body></html>');

      // Load estimate content via AJAX
      $.ajax({
        url: customerEstimatesAdmin.ajax_url,
        type: 'POST',
        data: {
          action: 'get_estimate_print_view',
          estimate_id: estimateId,
          nonce: customerEstimatesAdmin.nonce
        },
        success: function(response) {
          if (response.success) {
            printWindow.document.write(response.data.html);
            printWindow.document.close();

            // Wait for content to load then print
            printWindow.onload = function() {
              printWindow.print();
            };
          } else {
            printWindow.document.write('<p>Error loading estimate: ' + response.data.message + '</p>');
            printWindow.document.close();
          }
        },
        error: function() {
          printWindow.document.write('<p>Error loading estimate.</p>');
          printWindow.document.close();
        }
      });
    }
  };

  // Initialize when document is ready
  $(document).ready(function() {
    CustomerEstimatesAdmin.init();

    // Make the module available globally for debugging
    window.CustomerEstimatesAdmin = CustomerEstimatesAdmin;
  });

})(jQuery);
