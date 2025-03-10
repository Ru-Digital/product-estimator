(function($) {
  'use strict';

  class ProductEstimatorModal {
    constructor() {
      // Ensure we only initialize once
      if (window.productEstimatorModalInitialized) {
        console.log('Product Estimator Modal already initialized, skipping');
        return;
      }

      // Cache DOM elements - make sure they exist
      this.$modal = $('#product-estimator-modal');

      if (this.$modal.length === 0) {
        console.error('Modal element not found in DOM');
        return;
      }

      this.$overlay = this.$modal.find('.product-estimator-modal-overlay');
      this.$closeButton = this.$modal.find('.product-estimator-modal-close');
      this.$modalContainer = this.$modal.find('.product-estimator-modal-form-container');
      this.$loading = this.$modal.find('.product-estimator-modal-loading');

      // Initialize view containers references
      this.$estimatesList = this.$modalContainer.find('#estimates');
      this.$estimateSelection = this.$modalContainer.find('#estimate-selection-wrapper');
      this.$estimateSelectionForm = this.$modalContainer.find('#estimate-selection-form-wrapper');
      this.$roomSelectionForm = this.$modalContainer.find('#room-selection-form-wrapper');
      this.$newEstimateForm = this.$modalContainer.find('#new-estimate-form-wrapper');
      this.$newRoomForm = this.$modalContainer.find('#new-room-form-wrapper');

      // Set initialization flag
      window.productEstimatorModalInitialized = true;

      // Initialize modal
      this.initEvents();
      this.setupAccordion();

      console.log('Product Estimator Modal initialized');
    }

    initEvents() {
      // Modal control events
      this.$closeButton.on('click', () => this.closeModal());
      this.$overlay.on('click', () => this.closeModal());

      // Handle estimate selection form submission
      $(document).on('submit', '#estimate-selection-form', (e) => {
        e.preventDefault();

        // Directly extract the value to avoid any jQuery oddities
        const dropdown = document.getElementById('estimate-dropdown');
        const selectedId = dropdown ? dropdown.value : '';

        // Prevent submission if no estimate selected
        if (!selectedId) {
          // alert('Please select an estimate');
          return;
        }

        this.showLoading();

        // Get product ID from modal (if set)
        const productId = this.$modal.attr('data-product-id') || 0;

        // Send AJAX request to get rooms
        $.ajax({
          url: productEstimatorVars.ajax_url,
          type: 'POST',
          data: {
            action: 'get_rooms_for_estimate',
            nonce: productEstimatorVars.nonce,
            estimate_id: selectedId,
            product_id: productId
          },
          success: (response) => {
            console.log('Get Rooms AJAX response:', response);

            if (response.success) {
              // Check if the estimate has no rooms
              if (!response.data.has_rooms) {
                // No rooms exist, prepare to create a new room
                console.log('No rooms found for estimate. Preparing room creation.');

                // Hide estimate selection views
                this.$estimateSelection.hide();
                this.$estimateSelectionForm.hide();

                // Set estimate ID for new room form
                this.$newRoomForm.attr('data-estimate-id', response.data.estimate_id);

                // If a product ID is available, pass it to the form
                if (response.data.product_id) {
                  this.$newRoomForm.attr('data-product-id', response.data.product_id);
                }

                // Remove any existing notices
                this.$newRoomForm.find('.notice').remove();

                // Add a notice explaining the context
                const $notice = $('<div class="notice">')
                  .text(response.data.message || 'No rooms exist for this estimate. Please create a room.');
                this.$newRoomForm.prepend($notice);

                // Show new room form
                this.$newRoomForm.show();
              } else {
                // Populate room dropdown
                const $roomSelect = $('#room-dropdown');
                $roomSelect.empty();
                $roomSelect.append('<option value="">-- Select a Room --</option>');

                response.data.rooms.forEach(room => {
                  const option = $('<option>')
                    .val(String(room.id))
                    .text(`${room.name} (${room.dimensions})`);
                  $roomSelect.append(option);
                });

                // Store estimate ID for room selection
                this.$roomSelectionForm.attr('data-estimate-id', response.data.estimate_id);

                // If a product ID is available, pass it to the form
                if (response.data.product_id) {
                  this.$roomSelectionForm.attr('data-product-id', response.data.product_id);
                }

                // Hide estimates list and show room selection
                this.$estimatesList.hide();
                this.$estimateSelection.show();
                this.$roomSelectionForm.show();
              }
            } else {
              // Handle error
              const errorMessage = response.data?.message || 'Error loading rooms';
              console.error('Error response:', response);

              // Show more detailed error if debug info is available
              if (response.data && response.data.debug) {
                console.error('Debug info:', response.data.debug);
              }
            }
          },
          error: (xhr, status, error) => {
            console.error('AJAX error:', status, error);
            console.error('Response:', xhr.responseText);
          },
          complete: () => {
            this.hideLoading();
          }
        });
      });

      // Handle room selection form submission
      $(document).on('submit', '#room-selection-form', (e) => {
        e.preventDefault();
        console.log('Room selection form submitted');
        this.handleRoomSelection();
      });

      // Handle new estimate form submission
      $(document).on('submit', '#new-estimate-form', (e) => {
        e.preventDefault();
        console.log('New estimate form submitted');
        this.handleNewEstimateSubmission(e);
      });

      // Handle new room form submission
      $(document).on('submit', '#new-room-form', (e) => {
        e.preventDefault();
        console.log('New room form submitted');
        this.handleNewRoomSubmission(e);
      });

      // Handle "Add New Room" button click
      $(document).on('click', '.add-room', (e) => {
        e.preventDefault();
        console.log('Add room button clicked');
        this.showNewRoomForm($(e.currentTarget).data('estimate'));
      });

      // Handle "Create New Estimate" button click
      $(document).on('click', '#create-estimate-btn', (e) => {
        e.preventDefault();
        console.log('Create estimate button clicked');
        this.showNewEstimateForm();
      });

      // Back buttons
      $(document).on('click', '.back-btn', (e) => {
        e.preventDefault();
        const target = $(e.currentTarget).data('target');
        console.log('Back button clicked, target:', target);
        this.navigateBack(target);
      });

      // Cancel buttons for forms
      $(document).on('click', '.cancel-btn', (e) => {
        e.preventDefault();
        const formType = $(e.currentTarget).data('form-type');
        console.log('Cancel button clicked, form type:', formType);
        this.cancelForm(formType);
      });

      // Escape key to close modal
      $(document).on('keydown', (e) => {
        if (e.key === 'Escape') this.closeModal();
      });
    }

    // Set up accordion functionality - SIMPLIFIED APPROACH
    setupAccordion() {
      // Direct click handler for accordion headers
      $(document).on('click', '.accordion-header', function(e) {
        e.preventDefault();

        const $content = $(this).next('.accordion-content');

        // Toggle the active class on the header
        $(this).toggleClass('active');

        // Simply show/hide the content
        if ($content.is(':visible')) {
          $content.slideUp();
        } else {
          $content.slideDown();
        }
      });
    }

    showLoading() {
      this.$loading.show();
    }

    hideLoading() {
      this.$loading.hide();
    }

    handleRoomSelection() {
      // Force room ID to string, handle '0' case with explicit conversion
      const roomId = String($('#room-dropdown').val() || '0');
      const productId = this.$modal.attr('data-product-id');

      console.log('Room selection details:');
      console.log('Room ID:', roomId, 'Type:', typeof roomId);
      console.log('Product ID:', productId);
      console.log('Room dropdown value:', $('#room-dropdown').val());

      if (!roomId) {
        // alert('Please select a room from the dropdown.');
        return;
      }

      if (!productId) {
        // alert('No product selected.');
        return;
      }

      this.showLoading();

      // Ensure both IDs are strings to maintain consistency
      const roomIdParam = String(roomId);
      const productIdParam = String(productId);

      console.log('Sending room ID as:', roomIdParam);
      console.log('Sending product ID as:', productIdParam);

      $.ajax({
        url: productEstimatorVars.ajax_url,
        type: 'POST',
        data: {
          action: 'add_product_to_room',
          nonce: productEstimatorVars.nonce,
          room_id: roomIdParam,
          product_id: productIdParam
        },
        success: (response) => {
          console.log('AJAX response:', response);

          if (response.success) {
            // Hide selection forms
            this.$estimateSelection.hide();
            this.$roomSelectionForm.hide();
            this.$estimateSelectionForm.hide();

            // Make an additional request to get the latest session data
            this.refreshEstimatesList(() => {
              // Show success message
              // alert('Product added successfully!');
            });
          } else {
            const errorMessage = response.data?.message || 'Error adding product to room';
            console.error('Error response:', response);

            // Show more detailed error if debug info is available
            if (response.data && response.data.debug) {
              console.error('Debug info:', response.data.debug);
            }
          }
        },
        error: (xhr, status, error) => {
          console.error('AJAX error:', status, error);
          console.error('Response:', xhr.responseText);
        },
        complete: () => this.hideLoading()
      });
    }

    handleNewEstimateSubmission(e) {
      const formData = $(e.target).serialize();
      const productId = this.$modal.attr('data-product-id');

      this.showLoading();

      $.ajax({
        url: productEstimatorVars.ajax_url,
        type: 'POST',
        data: {
          action: 'add_new_estimate',
          nonce: productEstimatorVars.nonce,
          form_data: formData,
          product_id: productId
        },
        success: (response) => {
          if (response.success) {
            // Clear form
            $(e.target)[0].reset();

            if (productId) {
              // If we have a product ID, we need to show the room form for the new estimate
              this.$newEstimateForm.hide();

              // Set the estimate ID for the room form
              this.$newRoomForm.attr('data-estimate-id', response.data.estimate_id);
              this.$newRoomForm.show();
            } else {
              // Just refresh the estimates list
              this.refreshEstimatesList(() => {
                // Show success message
                // alert('Estimate created successfully!');

                // Hide the form
                this.$newEstimateForm.hide();
                this.$estimatesList.show();
              });
            }
          } else {
            // alert(response.data?.message || 'Error creating estimate');
          }
        },
        error: () => {
          // alert('Error creating estimate. Please try again.');
        },
        complete: () => this.hideLoading()
      });
    }

    handleNewRoomSubmission(e) {
      const formData = $(e.target).serialize();
      const estimateId = this.$newRoomForm.attr('data-estimate-id') ||
        this.$roomSelectionForm.attr('data-estimate-id');
      const productId = this.$modal.attr('data-product-id');

      if (!estimateId) {
        // alert('No estimate selected for this room.');
        return;
      }

      this.showLoading();

      $.ajax({
        url: productEstimatorVars.ajax_url,
        type: 'POST',
        data: {
          action: 'add_new_room',
          nonce: productEstimatorVars.nonce,
          form_data: formData,
          estimate_id: estimateId,
          product_id: productId // Pass the product ID if we're in the flow of adding a product
        },
        success: (response) => {
          if (response.success) {
            // Clear form
            $(e.target)[0].reset();

            if (productId) {
              // If we have a product ID and it was successfully added
              if (response.data.product_added) {
                // Product was added to the new room
                this.$newRoomForm.hide();

                // Refresh the estimates list to show the updated data
                this.refreshEstimatesList(() => {
                  // alert('Room created and product added successfully!');
                  this.$estimatesList.show();
                });
              } else {
                // Room was created but product wasn't added
                // Show room selection form to manually add the product
                this.$newRoomForm.hide();

                // Populate room dropdown with the newly created room
                const $roomSelect = $('#room-dropdown');
                $roomSelect.empty();
                $roomSelect.append(
                  `<option value="${response.data.room_id}">
                    ${$('#room-name').val()} (${$('#room-width').val()}m x ${$('#room-length').val()}m)
                  </option>`
                );

                // Set the estimate and product IDs
                this.$roomSelectionForm.attr('data-estimate-id', estimateId);
                this.$roomSelectionForm.attr('data-product-id', productId);

                this.$roomSelectionForm.show();
                // alert('Room created. Please select the room to add the product.');
              }
            } else {
              // Just refresh the estimates list
              this.refreshEstimatesList(() => {
                // alert('Room added successfully!');
                this.$newRoomForm.hide();
                this.$estimatesList.show();
              });
            }
          } else {
            // alert(response.data?.message || 'Error adding room');
          }
        },
        error: () => {
          // alert('Error adding room. Please try again.');
        },
        complete: () => this.hideLoading()});
    }

    openModal(productId = null) {
      // Check if modal is already open
      if (this.$modal.is(':visible')) {
        console.log('Modal already open, just updating product ID');
        if (productId) {
          this.$modal.attr('data-product-id', productId);
        }
        return;
      }

      this.showLoading();
      console.log('Opening modal with product ID:', productId);

      // Reset modal state
      this.resetModalState();

      // If we have a product ID, we're in "add to estimator" mode
      if (productId) {
        this.$modal.attr('data-product-id', productId);

        // Check if we have any existing estimates
        $.ajax({
          url: productEstimatorVars.ajax_url,
          type: 'POST',
          data: {
            action: 'check_estimates_exist',
            nonce: productEstimatorVars.nonce
          },
          success: (response) => {
            if (response.success) {
              if (response.data.has_estimates) {
                // We have estimates, show the estimate selection form
                this.$estimatesList.hide();
                this.$estimateSelection.show();
                this.$estimateSelectionForm.show();
              } else {
                // No estimates, show the new estimate form
                this.$estimatesList.hide();
                this.$estimateSelection.hide();
                this.$newEstimateForm.show();
              }
            } else {
              // alert(response.data?.message || 'Error checking estimates');
            }
          },
          error: () => {
            // alert('Error checking for existing estimates. Please try again.');
          },
          complete: () => {
            this.hideLoading();
          }
        });
      } else {
        // Just show estimates list
        this.refreshEstimatesList();
      }

      // Show the modal
      this.$modal.show();
      $('body').addClass('modal-open');
    }

    refreshEstimatesList(callback) {
      this.showLoading();

      $.ajax({
        url: productEstimatorVars.ajax_url,
        type: 'POST',
        data: {
          action: 'get_estimates_list',
          nonce: productEstimatorVars.nonce
        },
        success: (response) => {
          if (response.success) {
            // Update and show estimates view with latest data
            this.$estimatesList.html(response.data.html).show();

            // Hide other views
            this.$estimateSelection.hide();
            this.$newEstimateForm.hide();
            this.$newRoomForm.hide();
          } else {
            console.error('Failed to refresh estimates list:', response.data?.message);
          }
        },
        error: () => {
          console.error('AJAX error when refreshing estimates list');
        },
        complete: () => {
          this.hideLoading();
          if (typeof callback === 'function') {
            callback();
          }
        }
      });
    }

    showNewEstimateForm() {
      this.$estimatesList.hide();
      this.$estimateSelection.hide();
      this.$newEstimateForm.show();
    }

    showNewRoomForm(estimateId) {
      // Store the estimate ID with the form
      this.$newRoomForm.attr('data-estimate-id', estimateId);

      // If we're coming from the estimates list
      if (this.$estimatesList.is(':visible')) {
        this.$estimatesList.hide();
      }

      // If we're coming from the room selection form
      if (this.$roomSelectionForm.is(':visible')) {
        this.$roomSelectionForm.hide();
      }

      this.$newRoomForm.show();
    }

    navigateBack(target) {
      // Hide all views first
      this.$estimatesList.hide();
      this.$estimateSelection.hide();
      this.$estimateSelectionForm.hide();
      this.$roomSelectionForm.hide();
      this.$newEstimateForm.hide();
      this.$newRoomForm.hide();

      // Show the target view
      switch (target) {
        case 'estimates':
          this.$estimatesList.show();
          break;
        case 'estimate-selection':
          this.$estimateSelection.show();
          this.$estimateSelectionForm.show();
          break;
        default:
          // Default to showing the estimates list
          this.$estimatesList.show();
      }
    }

    cancelForm(formType) {
      switch (formType) {
        case 'estimate':
          this.$newEstimateForm.hide();

          // If we have a product ID, go back to estimate selection if it exists
          if (this.$modal.attr('data-product-id') && this.$estimateSelectionForm.find('option').length > 1) {
            this.$estimateSelectionForm.show();
          } else {
            this.$estimatesList.show();
          }
          break;
        case 'room':
          this.$newRoomForm.hide();

          // If we have a product ID and came from room selection
          if (this.$modal.attr('data-product-id') && this.$roomSelectionForm.attr('data-estimate-id')) {
            this.$roomSelectionForm.show();
          } else {
            this.$estimatesList.show();
          }
          break;
      }
    }

    closeModal() {
      this.$modal.hide();
      this.$modal.removeAttr('data-product-id');
      $('body').removeClass('modal-open');
      this.resetModalState();
    }

    resetModalState() {
      // Hide all views
      this.$estimatesList.hide();
      this.$estimateSelection.hide();
      this.$estimateSelectionForm.hide();
      this.$roomSelectionForm.hide();
      this.$newEstimateForm.hide();
      this.$newRoomForm.hide();

      // Clear any stored data attributes
      this.$roomSelectionForm.removeAttr('data-estimate-id');
      this.$newRoomForm.removeAttr('data-estimate-id');
    }
  }

  // Initialize on document ready
  $(document).ready(function() {
    // Check if modal HTML exists in the DOM
    if ($('#product-estimator-modal').length === 0) {
      console.log('Modal HTML not found in the DOM');
      return;
    }

    // Ensure only one modal instance exists
    if (!window.productEstimatorModalInstance) {
      console.log('Creating new ProductEstimatorModal instance');
      window.productEstimatorModalInstance = new ProductEstimatorModal();
    }

    // Unbind any existing click handlers to prevent duplicates
    $(document).off('click', '.open-estimator-modal, .single_add_to_estimator_button, .product-estimator-button');

    // Bind click event to all modal trigger buttons
    $(document).on('click', '.open-estimator-modal, .single_add_to_estimator_button, .product-estimator-button', function(e) {
      e.preventDefault();

      // Prevent event bubbling
      e.stopPropagation();

      const productId = $(this).data('product-id') || null;
      console.log('Button clicked with product ID:', productId);

      if (window.productEstimatorModalInstance) {
        window.productEstimatorModalInstance.openModal(productId);
      } else {
        console.error('Modal instance not initialized');

        // Don't try to load the script again if we're already in it
        // This prevents potential recursive loading
        if (typeof ProductEstimatorModal === 'undefined') {
          $.getScript(productEstimatorVars.plugin_url + 'public/js/product-estimator-modal.js')
            .done(function() {
              console.log('Modal script loaded successfully');
              window.productEstimatorModalInstance = new ProductEstimatorModal();
              window.productEstimatorModalInstance.openModal(productId);
            })
            .fail(function() {
              console.error('Failed to load modal script');
              // alert('Could not open estimator. Please refresh the page and try again.');
            });
        }
      }
    });
  });

  // Expose class globally
  window.ProductEstimatorModal = ProductEstimatorModal;

})(jQuery);
