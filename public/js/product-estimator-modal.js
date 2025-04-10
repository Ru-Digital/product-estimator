(function($) {
  'use strict';

  // A flag to track initialization state
  let isInitialized = false;

  class ProductEstimatorModal {
    /**
     * Initialize the modal functionality
     */
    constructor() {
      // Prevent multiple initializations
      if (isInitialized) {
        console.log('Product Estimator Modal already initialized');
        return;
      }

      // Cache DOM elements
      this.$modal = $('#product-estimator-modal');

      // If modal doesn't exist in the DOM, exit early
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

      // Initialize state
      this.hasEstimates = false;

      // Set initialization flag - both for the class instance and globally
      isInitialized = true;
      this.isInitialized = true;

      // Initialize event handlers and accordion
      this.initEvents();
      this.setupAccordion();

      console.log('Product Estimator Modal initialized');
    }

    /**
     * Initialize event handlers
     */
    initEvents() {
      // Clean up any existing handlers first to prevent duplicates
      this.$closeButton.off('click');
      this.$overlay.off('click');
      $(document).off('submit', '#estimate-selection-form');
      $(document).off('submit', '#room-selection-form');
      $(document).off('submit', '#new-estimate-form');
      $(document).off('submit', '#new-room-form');
      $(document).off('click', '.accordion-header');
      $(document).off('click', '.add-room');
      $(document).off('click', '#create-estimate-btn');
      $(document).off('click', '.back-btn');
      $(document).off('click', '.cancel-btn');
      $(document).off('click', '.remove-estimate');
      $(document).off('click', '.remove-room');
      $(document).off('click', '.remove-product');

      // Modal control events
      this.$closeButton.on('click', () => this.closeModal());
      this.$overlay.on('click', () => this.closeModal());

      // Form submission handlers - using event delegation
      $(document).on('submit', '#estimate-selection-form', (e) => {
        e.preventDefault();
        this.handleEstimateSelection(e);
      });

      $(document).on('submit', '#room-selection-form', (e) => {
        e.preventDefault();
        this.handleRoomSelection(e);
      });

      $(document).on('submit', '#new-estimate-form', (e) => {
        e.preventDefault();
        this.handleNewEstimateSubmission(e);
      });

      $(document).on('submit', '#new-room-form', (e) => {
        e.preventDefault();
        this.handleNewRoomSubmission(e);
      });

      // Button and action handlers - using event delegation
      $(document).on('click', '.add-room', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const estimateId = $(e.currentTarget).data('estimate');
        this.showNewRoomForm(estimateId);
      });

      $(document).on('click', '#create-estimate-btn', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.showNewEstimateForm();
      });

      $(document).on('click', '.back-btn', (e) => {
        e.preventDefault();
        const target = $(e.currentTarget).data('target');
        this.navigateBack(target);
      });

      $(document).on('click', '.cancel-btn', (e) => {
        e.preventDefault();
        const formType = $(e.currentTarget).data('form-type');
        this.cancelForm(formType);
      });

      // Delete handlers
      $(document).on('click', '.remove-estimate', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const estimateId = $(e.currentTarget).data('estimate-id');
        this.confirmDelete('estimate', estimateId);
      });

      $(document).on('click', '.remove-room', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const estimateId = $(e.currentTarget).data('estimate-id');
        const roomId = $(e.currentTarget).data('room-id');
        this.confirmDelete('room', estimateId, roomId);
      });

      $(document).on('click', '.remove-product', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const estimateId = $(e.currentTarget).data('estimate-id');
        const roomId = $(e.currentTarget).data('room-id');
        const productIndex = $(e.currentTarget).data('product-index');
        this.confirmDelete('product', estimateId, roomId, productIndex);
      });

      // Add handler for suggested products
      $(document).on('click', '.add-suggestion-to-room', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const $button = $(e.currentTarget);
        const productId = $button.data('product-id');
        const estimateId = $button.data('estimate-id');
        const roomId = $button.data('room-id');

        // Disable the button and show loading state
        $button.prop('disabled', true).text('Adding...');

        // Call the existing AJAX endpoint to add product to room
        $.ajax({
          url: productEstimatorVars.ajax_url,
          type: 'POST',
          data: {
            action: 'add_product_to_room',
            nonce: productEstimatorVars.nonce,
            product_id: productId,
            room_id: roomId
          },
          success: (response) => {
            if (response.success) {
              // Show temporary success indicator
              $button.removeClass('button').addClass('added').text('Added!');

              // After a delay, refresh the estimates list to show the updated content
              setTimeout(() => {
                this.refreshEstimatesList();
              }, 1500);
            } else {
              // Reset button on error
              $button.prop('disabled', false).text('Try Again');
              console.error('Error adding suggested product:', response.data?.message);
            }
          },
          error: (xhr, status, error) => {
            // Reset button on error
            $button.prop('disabled', false).text('Try Again');
            console.error('AJAX error:', status, error);
          }
        });
      });

      // Escape key to close modal
      $(document).on('keydown', (e) => {
        if (e.key === 'Escape' && this.$modal.is(':visible')) {
          this.closeModal();
        }
      });
    }

    /**
     * Set up accordion functionality
     */
    setupAccordion() {
      // Use event delegation for accordion headers to handle dynamically added content
      $(document).off('click', '.accordion-header').on('click', '.accordion-header', function(e) {
        e.preventDefault();
        e.stopPropagation();

        $(this).toggleClass('active');
        const $content = $(this).closest('.accordion-item').find('.accordion-content');
        $content.slideToggle();
      });
    }

    /**
     * Open the modal
     * @param {number|string|null} productId - Product ID or null for list view
     * @param {boolean} forceListView - Whether to force showing the list view
     */
    openModal(productId = null, forceListView = false) {
      console.log(`Opening modal with productId: ${productId}, forceListView: ${forceListView}`);

      // Reset any previous modal state
      this.resetModalState();

      // Set product ID if provided (only when not forcing list view)
      if (productId && !forceListView) {
        this.$modal.attr('data-product-id', productId);
      } else {
        this.$modal.removeAttr('data-product-id');
      }

      // Always start with loader visible
      this.showLoading();

      // Make sure modal is visible
      this.$modal.show();

      // Add modal-open class to body
      $('body').addClass('modal-open');

      // Prepare content based on context
      if (productId && !forceListView) {
        // Product-specific mode
        this.updateEstimatesState().then(hasEstimates => {
          if (hasEstimates) {
            // Show estimate selection if estimates exist
            this.$estimatesList.hide();
            this.$estimateSelection.show();
            this.$estimateSelectionForm.show();
            this.refreshEstimatesData();
          } else {
            // Show new estimate form if no estimates exist
            this.$estimatesList.hide();
            this.$estimateSelection.hide();
            this.$newEstimateForm.show();
          }
          this.hideLoading();
        });
      } else {
        // List view mode (always show the list of estimates)
        this.refreshEstimatesList(() => {
          this.hideLoading();
        });
      }
    }

    /**
     * Close the modal and reset state
     */
    closeModal() {
      this.$modal.hide();
      this.$modal.removeAttr('data-product-id');
      $('body').removeClass('modal-open');
      this.resetModalState();
    }

    /**
     * Reset modal state
     */
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
      this.$newRoomForm.removeAttr('data-product-id');
    }

    /**
     * Handle estimate selection
     */
    handleEstimateSelection(e) {
      const estimateId = $('#estimate-dropdown').val();
      const productId = this.$modal.attr('data-product-id');

      if (!estimateId) {
        console.log('Please select an estimate');
        return;
      }

      this.showLoading();

      // Get rooms for the selected estimate
      $.ajax({
        url: productEstimatorVars.ajax_url,
        type: 'POST',
        data: {
          action: 'get_rooms_for_estimate',
          nonce: productEstimatorVars.nonce,
          estimate_id: estimateId,
          product_id: productId
        },
        success: (response) => {
          if (response.success) {
            // Hide estimate selection form
            this.$estimateSelectionForm.hide();

            // If the estimate has rooms, show room selection form
            if (response.data.has_rooms) {
              // Populate room dropdown
              const $roomDropdown = $('#room-dropdown');
              $roomDropdown.empty();
              $roomDropdown.append('<option value="">-- Select a Room --</option>');

              $.each(response.data.rooms, function(index, room) {
                $roomDropdown.append(
                  `<option value="${room.id}">${room.name} (${room.dimensions})</option>`
                );
              });

              // Store estimate ID with the form
              this.$roomSelectionForm.attr('data-estimate-id', estimateId);

              // IMPORTANT: Also set the data-estimate attribute on the Add New Room button
              $('#add-new-room-from-selection').attr('data-estimate', estimateId);

              // Show room selection form
              this.$roomSelectionForm.show();
            } else {
              // No rooms, show new room form
              this.$newRoomForm.attr('data-estimate-id', estimateId);
              this.$newRoomForm.attr('data-product-id', productId);
              this.$newRoomForm.show();
            }
          } else {
            // Show error
            console.error('Error getting rooms:', response.data?.message);
            console.log('Error getting rooms. Please try again.');
          }
        },
        error: (xhr, status, error) => {
          console.error('AJAX error:', status, error);
          console.log('Error getting rooms. Please try again.');
        },
        complete: () => {
          this.hideLoading();
        }
      });
    }

    /**
     * Handle room selection
     */
    handleRoomSelection() {
      // Force room ID to string
      const roomId = String($('#room-dropdown').val() || '0');
      const productId = this.$modal.attr('data-product-id');

      if (!roomId) {
        console.log('Please select a room');
        return;
      }

      this.showLoading();

      $.ajax({
        url: productEstimatorVars.ajax_url,
        type: 'POST',
        data: {
          action: 'add_product_to_room',
          nonce: productEstimatorVars.nonce,
          room_id: roomId,
          product_id: productId
        },
        success: (response) => {
          if (response.success) {
            // Hide selection forms
            this.$estimateSelection.hide();
            this.$roomSelectionForm.hide();

            // Refresh estimates list and show it
            this.refreshEstimatesList(() => {
              // After refreshing the list, check if we should show suggestions
              const estimateId = this.$roomSelectionForm.attr('data-estimate-id');
              if (estimateId) {
                this.updateSuggestionVisibility(estimateId, roomId);
              }

              // Show success message
              console.log('Product added successfully!');
            });
          } else {
            const errorMessage = response.data?.message || 'Error adding product to room';
            console.error('Error response:', response);
            console.log(errorMessage);
          }
        },
        error: (xhr, status, error) => {
          console.error('AJAX error:', status, error);
          console.log('Error adding product to room. Please try again.');
        },
        complete: () => {
          this.hideLoading();
        }
      });
    }

    /**
     * Handle new estimate submission
     */
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

            // Update our local state to reflect that we now have estimates
            this.updateEstimatesState(true);


            // Hide new estimate form
            this.$newEstimateForm.hide();

            if (productId) {
              // Show new room form for the new estimate
              this.$newRoomForm.attr('data-estimate-id', response.data.estimate_id);
              this.$newRoomForm.attr('data-product-id', productId);
              this.$newRoomForm.show();
            } else {
              // Just refresh the estimates list
              this.refreshEstimatesList();
            }
          } else {
            console.error('Error creating estimate:', response.data?.message);
            console.log('Error creating estimate: ' + (response.data?.message || 'Unknown error'));
          }
        },
        error: (xhr, status, error) => {
          console.error('AJAX error:', status, error);
          console.log('Error creating estimate. Please try again.');
        },
        complete: () => {
          this.hideLoading();
        }
      });
    }

    /**
     * Update the hasEstimates state
     * @param {boolean} value - New value, or undefined to check with the server
     */
    updateEstimatesState(value) {
      if (typeof value === 'boolean') {
        // Directly set the value if provided
        this.hasEstimates = value;
        return Promise.resolve(value);
      } else {
        // Check with the server
        return new Promise((resolve) => {
          this.checkEstimatesExist((hasEstimates) => {
            resolve(hasEstimates);
          });
        });
      }
    }

    /**
     * Handle new room submission
     */
    handleNewRoomSubmission(e) {
      const formData = $(e.target).serialize();
      const estimateId = this.$newRoomForm.attr('data-estimate-id');
      const productId = this.$modal.attr('data-product-id');

      if (!estimateId) {
        console.log('No estimate selected for this room.');
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
          product_id: productId
        },
        success: (response) => {
          if (response.success) {
            // Clear form
            $(e.target)[0].reset();

            // Hide new room form
            this.$newRoomForm.hide();

            if (productId) {
              if (response.data.product_added) {
                // Product was added to the new room - refresh the estimates list
                this.refreshEstimatesList(() => {
                  // After refreshing, check if we should show suggestions for the new room
                  if (response.data.has_suggestions) {
                    // Find the new room in the DOM and expand it to show suggestions
                    const $room = $(`.accordion-item[data-room-id="${response.data.room_id}"]`);
                    if ($room.length) {
                      $room.find('.accordion-header').addClass('active');
                      $room.find('.accordion-content').show();
                    }
                  }
                });              } else {
                // Room was created but product wasn't added - show room selection
                const $roomSelect = $('#room-dropdown');
                $roomSelect.empty();
                $roomSelect.append(
                  `<option value="${response.data.room_id}" selected>
                  ${$('#room-name').val()} (${$('#room-width').val()}m x ${$('#room-length').val()}m)
                </option>`
                );

                // Set the estimate and product IDs
                this.$roomSelectionForm.attr('data-estimate-id', estimateId);
                this.$roomSelectionForm.show();
              }
            } else {
              // Just refresh the estimates list
              this.refreshEstimatesList();
            }
          } else {
            console.error('Error adding room:', response.data?.message);
            console.log('Error adding room: ' + (response.data?.message || 'Unknown error'));
          }
        },
        error: (xhr, status, error) => {
          console.error('AJAX error:', status, error);
          console.log('Error adding room. Please try again.');
        },
        complete: () => {
          this.hideLoading();
        }
      });
    }

    /**
     * Check if any estimates exist in the session
     * @param {Function} callback - Callback function with boolean result
     */
    checkEstimatesExist(callback) {
      $.ajax({
        url: productEstimatorVars.ajax_url,
        type: 'POST',
        data: {
          action: 'check_estimates_exist',
          nonce: productEstimatorVars.nonce
        },
        success: (response) => {
          if (response.success) {
            // Update our local state
            this.hasEstimates = response.data.has_estimates;

            // Call the callback with the result
            if (typeof callback === 'function') {
              callback(response.data.has_estimates);
            }
          } else {
            console.error('Failed to check if estimates exist:', response.data?.message);
            this.hasEstimates = false;
            if (typeof callback === 'function') {
              callback(false);
            }
          }
        },
        error: (xhr, status, error) => {
          console.error('AJAX error:', status, error);
          this.hasEstimates = false;
          if (typeof callback === 'function') {
            callback(false);
          }
        }
      });
    }

    /**
     * Refresh estimates data for dropdowns
     * @param {Function} callback - Optional callback function
     */
    refreshEstimatesData(callback) {
      $.ajax({
        url: productEstimatorVars.ajax_url,
        type: 'POST',
        data: {
          action: 'get_estimates_data',
          nonce: productEstimatorVars.nonce
        },
        success: (response) => {
          if (response.success) {
            // Update the estimates dropdown
            const $dropdown = $('#estimate-dropdown');
            $dropdown.empty();
            $dropdown.append('<option value="">' +
              (productEstimatorVars.i18n.select_estimate || '-- Select an Estimate --') + '</option>');

            // Check if we have any estimates
            const hasEstimates = response.data.estimates && response.data.estimates.length > 0;

            // Update our local state
            this.updateEstimatesState(hasEstimates);

            if (hasEstimates) {
              // Populate the dropdown with estimates
              response.data.estimates.forEach(estimate => {
                const roomCount = estimate.rooms ? Object.keys(estimate.rooms).length : 0;
                const roomText = roomCount === 1 ?
                  '1 room' : roomCount + ' rooms';

                $dropdown.append(
                  '<option value="' + estimate.id + '">' +
                  estimate.name + ' (' + roomText + ')' +
                  '</option>'
                );
              });
            }

            // Call the callback if provided
            if (typeof callback === 'function') {
              callback();
            }
          } else {
            console.error('Failed to get estimates data:', response.data?.message);
            this.updateEstimatesState(false);
            if (typeof callback === 'function') {
              callback();
            }
          }
        },
        error: (xhr, status, error) => {
          console.error('AJAX error:', status, error);
          this.updateEstimatesState(false);
          if (typeof callback === 'function') {
            callback();
          }
        }
      });
    }

    /**
     * Refresh estimates list
     * @param {Function} callback - Optional callback function
     */
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

            // Update hasEstimates based on the content
            this.updateEstimatesState(this.$estimatesList.find('.estimate-section').length > 0);

            // Hide other views
            this.$estimateSelection.hide();
            this.$newEstimateForm.hide();
            this.$newRoomForm.hide();

            // Re-initialize accordion after content update
            this.setupAccordion();

            // After the content is updated, check and update suggestion visibility for all rooms
            this.updateAllSuggestionsVisibility();
          } else {
            console.error('Failed to refresh estimates list:', response.data?.message);
            console.log('Failed to refresh estimates list: ' + (response.data?.message || 'Unknown error'));
          }
        },
        error: (xhr, status, error) => {
          console.error('AJAX error:', status, error);
          console.log('Error refreshing estimates list. Please try again.');
        },
        complete: () => {
          this.hideLoading();
          if (typeof callback === 'function') {
            callback();
          }
        }
      });
    }

    /**
     * Show new estimate form
     */
    showNewEstimateForm() {
      this.$estimatesList.hide();
      this.$estimateSelection.hide();
      this.$newEstimateForm.show();
    }

    /**
     * Show new room form
     * @param {string} estimateId - Estimate ID
     */
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

    /**
     * Navigate back to a previous view
     * @param {string} target - Target view
     */
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

    /**
     * Cancel a form and return to previous view
     * @param {string} formType - Form type ('estimate' or 'room')
     */
    cancelForm(formType) {
      switch (formType) {
        case 'estimate':
          this.$newEstimateForm.hide();

          // If we have a product ID, go back to estimate selection if it exists
          if (this.$modal.attr('data-product-id') && this.hasEstimates) {
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

    /**
     * Confirm deletion
     * @param {string} type - Item type ('estimate', 'room', or 'product')
     * @param {string} estimateId - Estimate ID
     * @param {string} roomId - Room ID (optional)
     * @param {number} productIndex - Product index (optional)
     */
    confirmDelete(type, estimateId, roomId, productIndex) {
      let message = '';
      let title = '';

      switch (type) {
        case 'estimate':
          title = 'Delete Estimate';
          message = 'Are you sure you want to delete this estimate and all its rooms?';
          break;
        case 'room':
          title = 'Delete Room';
          message = 'Are you sure you want to delete this room and all its products?';
          break;
        case 'product':
          title = 'Remove Product';
          message = 'Are you sure you want to remove this product from the room?';
          break;
      }

      // Show confirmation dialog
      this.showConfirmationDialog(title, message, () => {
        switch (type) {
          case 'estimate':
            this.handleEstimateRemoval(estimateId);
            break;
          case 'room':
            this.handleRoomRemoval(estimateId, roomId);
            break;
          case 'product':
            this.handleProductRemoval(estimateId, roomId, productIndex);
            break;
        }
      });
    }

    /**
     * Handle product removal
     * @param {string} estimateId - Estimate ID
     * @param {string} roomId - Room ID
     * @param {number} productIndex - Product index
     */
    handleProductRemoval(estimateId, roomId, productIndex) {
      this.showLoading();

      $.ajax({
        url: productEstimatorVars.ajax_url,
        type: 'POST',
        data: {
          action: 'remove_product_from_room',
          nonce: productEstimatorVars.nonce,
          estimate_id: estimateId,
          room_id: roomId,
          product_index: productIndex
        },
        success: (response) => {
          if (response.success) {
            // Refresh estimates list and update suggestion visibility
            this.refreshEstimatesList(() => {
              // After refreshing the list, check if we should hide suggestions
              this.updateSuggestionVisibility(estimateId, roomId);
            });
          } else {
            // Show error
            console.error('Error removing product:', response.data?.message);
            console.log('Error removing product: ' + (response.data?.message || 'Unknown error'));
          }
        },
        error: (xhr, status, error) => {
          console.error('AJAX error:', status, error);
          console.log('Error removing product. Please try again.');
        },
        complete: () => {
          this.hideLoading();
        }
      });
    }

    /**
     * Handle room removal
     * @param {string} estimateId - Estimate ID
     * @param {string} roomId - Room ID
     */
    handleRoomRemoval(estimateId, roomId) {
      this.showLoading();

      $.ajax({
        url: productEstimatorVars.ajax_url,
        type: 'POST',
        data: {
          action: 'remove_room',
          nonce: productEstimatorVars.nonce,
          estimate_id: estimateId,
          room_id: roomId
        },
        success: (response) => {
          if (response.success) {
            // Refresh estimates list
            this.refreshEstimatesList();
          } else {
            // Show error
            console.error('Error removing room:', response.data?.message);
            console.log('Error removing room: ' + (response.data?.message || 'Unknown error'));
          }
        },
        error: (xhr, status, error) => {
          console.error('AJAX error:', status, error);
          console.log('Error removing room. Please try again.');
        },
        complete: () => {
          this.hideLoading();
        }
      });
    }

    /**
     * Handle estimate removal
     * @param {string} estimateId - Estimate ID
     */
    handleEstimateRemoval(estimateId) {
      this.showLoading();

      $.ajax({
        url: productEstimatorVars.ajax_url,
        type: 'POST',
        data: {
          action: 'remove_estimate',
          nonce: productEstimatorVars.nonce,
          estimate_id: estimateId
        },
        success: (response) => {
          if (response.success) {
            // After removing the estimate, check if we have any estimates left
            this.updateEstimatesState().then(hasEstimates => {
              // Refresh estimates list
              this.refreshEstimatesList();

              // If no estimates left, update UI to show a message
              if (!hasEstimates && this.$estimatesList.is(':visible')) {
                this.$estimatesList.html('<div class="no-estimates"><p>' +
                  (productEstimatorVars.i18n.no_estimates || 'You don\'t have any estimates yet.') +
                  '</p><button id="create-estimate-btn" class="button">' +
                  (productEstimatorVars.i18n.create_estimate || 'Create New Estimate') +
                  '</button></div>');
              }
            });
          } else {
            // Show error
            console.error('Error removing estimate:', response.data?.message);
            console.log('Error removing estimate: ' + (response.data?.message || 'Unknown error'));
          }
        },
        error: (xhr, status, error) => {
          console.error('AJAX error:', status, error);
          console.log('Error removing estimate. Please try again.');
        },
        complete: () => {
          this.hideLoading();
        }
      });
    }

    /**
     * Show confirmation dialog
     * @param {string} title - Dialog title
     * @param {string} message - Dialog message
     * @param {Function} onConfirm - Function to call on confirmation
     */
    showConfirmationDialog(title, message, onConfirm) {
      // Remove any existing dialogs
      $('.confirmation-dialog-overlay, .confirmation-dialog').remove();

      // Create overlay
      const $overlay = $('<div class="confirmation-dialog-overlay"></div>');

      // Create dialog
      const $dialog = $(`
        <div class="confirmation-dialog">
          <h3>${title}</h3>
          <p>${message}</p>
          <div class="confirmation-dialog-actions">
            <button class="confirmation-dialog-cancel">${productEstimatorVars.i18n.cancel || 'Cancel'}</button>
            <button class="confirmation-dialog-confirm">${productEstimatorVars.i18n.confirm || 'Confirm'}</button>
          </div>
        </div>
      `);

      // Add to body
      $('body').append($overlay).append($dialog);

      // Handle cancel
      $('.confirmation-dialog-cancel').on('click', () => {
        $overlay.remove();
        $dialog.remove();
      });

      // Handle confirm
      $('.confirmation-dialog-confirm').on('click', () => {
        $overlay.remove();
        $dialog.remove();
        onConfirm();
      });

      // Handle click outside dialog
      $overlay.on('click', () => {
        $overlay.remove();
        $dialog.remove();
      });

      // Handle escape key
      $(document).one('keyup', (e) => {
        if (e.key === 'Escape') {
          $overlay.remove();
          $dialog.remove();
        }
      });
    }

    /**
     * Update product suggestion visibility based on room contents
     * @param {string} estimateId - Estimate ID
     * @param {string} roomId - Room ID
     */
    updateSuggestionVisibility(estimateId, roomId) {
      // Find the room element
      const $room = $(`.accordion-item[data-room-id="${roomId}"]`);

      // Check if this room has any products
      const hasProducts = $room.find('.product-item').not('.product-note-item').length > 0;

      // Find the product suggestions section
      const $suggestions = $room.find('.product-suggestions');

      // Toggle visibility based on whether there are products in the room
      if (hasProducts) {
        $suggestions.show();
      } else {
        $suggestions.hide();
      }
    }

    /**
     * Update visibility of suggestions for all rooms
     */
    updateAllSuggestionsVisibility() {
      $('.accordion-item').each((_, room) => {
        const $room = $(room);
        const roomId = $room.data('room-id');
        const estimateId = $room.closest('.estimate-section').data('estimate-id');

        // Check if this room has any products (excluding note items)
        const hasProducts = $room.find('.product-item').not('.product-note-item').length > 0;

        // Find the product suggestions section
        const $suggestions = $room.find('.product-suggestions');

        // Skip if there are no suggestions in this room
        if ($suggestions.length === 0) return;

        // Toggle visibility based on whether there are products in the room
        if (hasProducts) {
          $suggestions.show();
        } else {
          $suggestions.hide();
        }
      });
    }

    /**
     * Show loading overlay
     */
    showLoading() {
      this.$loading.show();
    }

    /**
     * Hide loading overlay
     */
    hideLoading() {
      this.$loading.hide();
    }
  }

  // Initialize on document ready
  $(document).ready(function() {
    // Only initialize once when document is ready
    if (!window.productEstimatorModalInstance) {
      console.log('Creating new ProductEstimatorModal instance');
      window.productEstimatorModalInstance = new ProductEstimatorModal();
    }

    // Clean up event handlers before adding new ones
    $(document).off('click', '.open-estimator-modal, .single_add_to_estimator_button, .product-estimator-button');
    $(document).off('click', '.product-estimator-menu-item a, a.product-estimator-menu-item');

    // Set up product-specific buttons (not menu links)
    $(document).on('click', '.open-estimator-modal, .single_add_to_estimator_button, .product-estimator-button:not(.product-estimator-menu-item a, a.product-estimator-menu-item)', function(e) {
      e.preventDefault();
      e.stopPropagation(); // Stop event from bubbling up

      const productId = $(this).data('product-id') || null;
      console.log('Product button clicked with product ID:', productId);

      if (window.productEstimatorModalInstance) {
        const forceListView = !productId;

        window.productEstimatorModalInstance.openModal(productId, forceListView);
      }
    });

    // Set up global menu links - with more specific selector
    $(document).on('click', '.product-estimator-menu-item a, a.product-estimator-menu-item', function(e) {
      e.preventDefault();
      e.stopPropagation(); // Stop event from bubbling up

      console.log('Menu link clicked - using global handler');

      if (window.productEstimatorModalInstance) {
        // Force list view (no product ID)
        window.productEstimatorModalInstance.openModal(null, true);
      }
    });
  });

  // Expose class globally
  window.ProductEstimatorModal = ProductEstimatorModal;

})(jQuery);
