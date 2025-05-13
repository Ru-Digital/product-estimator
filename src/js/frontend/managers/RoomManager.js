/**
 * RoomManager.js
 *
 * Handles all operations related to rooms:
 * - Rendering rooms in estimates
 * - Creating new rooms
 * - Removing rooms
 * - Updating room totals
 */

import { format, createLogger } from '@utils';

import { loadEstimateData, saveEstimateData, addRoom, removeRoom } from '../EstimateStorage';
import TemplateEngine from '../TemplateEngine';

const logger = createLogger('RoomManager');

class RoomManager {
  /**
   * Initialize the RoomManager
   * @param {object} config - Configuration options
   * @param {object} dataService - The data service instance
   * @param {object} modalManager - Reference to the parent modal manager
   */
  constructor(config = {}, dataService, modalManager) {
    this.config = config;
    this.dataService = dataService;
    this.modalManager = modalManager;
    
    // References to DOM elements (can be accessed via modalManager)
    this.newRoomForm = null;
    this.roomSelectionForm = null;
    
    // State
    this.currentEstimateId = null;
    this.currentProductId = null;
    
    // Bind methods to preserve 'this' context
    this.showRoomSelectionForm = this.showRoomSelectionForm.bind(this);
    this.loadRoomsForEstimate = this.loadRoomsForEstimate.bind(this);
    this.showNewRoomForm = this.showNewRoomForm.bind(this);
    this.bindNewRoomFormEvents = this.bindNewRoomFormEvents.bind(this);
    this.handleRoomRemoval = this.handleRoomRemoval.bind(this);
    this.updateRoomTotals = this.updateRoomTotals.bind(this);
    this.renderRoom = this.renderRoom.bind(this);
    this.onModalClosed = this.onModalClosed.bind(this);
  }
  
  /**
   * Initialize the room manager
   */
  init() {
    // Get references to DOM elements from the modal manager
    this.newRoomForm = this.modalManager.newRoomForm;
    this.roomSelectionForm = this.modalManager.roomSelectionForm;
    
    this.bindEvents();
    
    logger.log('RoomManager initialized');
  }
  
  /**
   * Bind event listeners related to rooms
   */
  bindEvents() {
    // We'll implement this later when we move the room-specific bindings
    logger.log('RoomManager events bound');
  }
  
  /**
   * Show the room selection form
   * @param {string} estimateId - The estimate ID
   * @param {string|null} productId - Optional product ID to add
   */
  showRoomSelectionForm(estimateId, productId = null) {
    logger.log('Showing room selection form', { estimateId, productId });
    
    // Save the current estimate and product IDs
    this.currentEstimateId = estimateId;
    this.currentProductId = productId;
    
    // Get the room selection form container from the modal manager
    const roomSelectionForm = this.modalManager.roomSelectionForm;
    
    if (!roomSelectionForm) {
      logger.error('Room selection form container not found in modal');
      this.modalManager.showError('Modal structure incomplete. Please contact support.');
      this.modalManager.hideLoading();
      return;
    }
    
    // Use ModalManager's utility to ensure the element is visible
    this.modalManager.forceElementVisibility(roomSelectionForm);
    
    // Show loading indicator while we prepare the form
    this.modalManager.showLoading();
    
    // Fetch the estimate details to get the estimate name
    this.dataService.getEstimate(estimateId)
      .then(estimate => {
        if (!estimate) {
          throw new Error(`Estimate with ID ${estimateId} not found`);
        }
        
        // Use TemplateEngine to insert the template
        try {
          // Clear existing content first in case it was loaded before
          roomSelectionForm.innerHTML = '';
          
          // Insert the template with the estimate name
          TemplateEngine.insert('room-selection-form-template', {
            estimateName: estimate.name || `Estimate #${estimate.id}`
          }, roomSelectionForm);
          
          logger.log('Room selection form template inserted into wrapper.');
          
          // Find the form element
          const formElement = roomSelectionForm.querySelector('form');
          if (formElement) {
            // Store estimate ID and product ID as data attributes on the form
            formElement.dataset.estimateId = estimateId;
            
            if (productId) {
              formElement.dataset.productId = productId;
            } else {
              delete formElement.dataset.productId;
            }
            
            // Load the rooms for this estimate
            this.loadRoomsForSelection(estimateId, formElement)
              .then(() => {
                // Bind events to the form
                this.bindRoomSelectionFormEvents(formElement, estimateId, productId);
                this.modalManager.hideLoading();
              })
              .catch(error => {
                logger.error('Error loading rooms for selection:', error);
                this.modalManager.showError('Error loading rooms. Please try again.');
                this.modalManager.hideLoading();
              });
          } else {
            logger.error('Form element not found inside the template after insertion!');
            this.modalManager.showError('Error rendering form template. Please try again.');
            this.modalManager.hideLoading();
          }
        } catch (error) {
          logger.error('Error inserting room selection form template:', error);
          this.modalManager.showError('Error loading form template. Please try again.');
          this.modalManager.hideLoading();
        }
      })
      .catch(error => {
        logger.error('Error fetching estimate details:', error);
        this.modalManager.showError('Error loading estimate details. Please try again.');
        this.modalManager.hideLoading();
      });
  }
  
  /**
   * Load rooms for selection form
   * @param {string} estimateId - The estimate ID
   * @param {HTMLFormElement} formElement - The form element
   * @returns {Promise} - Promise that resolves when rooms are loaded
   */
  loadRoomsForSelection(estimateId, formElement) {
    logger.log('Loading rooms for selection form', { estimateId });
    
    const selectElement = formElement.querySelector('select');
    if (!selectElement) {
      return Promise.reject(new Error('Select element not found in form'));
    }
    
    // Load rooms from storage or API
    return this.dataService.getRoomsForEstimate(estimateId)
      .then(rooms => {
        // Clear existing options
        selectElement.innerHTML = '';
        
        // Add default option
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '-- Select a room --';
        selectElement.appendChild(defaultOption);
        
        // Add options for each room
        if (rooms && rooms.length > 0) {
          rooms.forEach(room => {
            const option = document.createElement('option');
            option.value = room.id;
            option.textContent = room.name || `Room #${room.id}`;
            selectElement.appendChild(option);
          });
          
          // Enable the select element and form buttons
          selectElement.disabled = false;
          const submitButton = formElement.querySelector('button[type="submit"]');
          if (submitButton) submitButton.disabled = false;
        } else {
          // No rooms available, show message
          const option = document.createElement('option');
          option.value = '';
          option.textContent = 'No rooms available';
          selectElement.appendChild(option);
          
          // Disable the select element but keep buttons enabled for "Create New Room"
          selectElement.disabled = true;
        }
        
        return rooms;
      });
  }
  
  /**
   * Bind events to the room selection form
   * @param {HTMLFormElement} formElement - The form element
   * @param {string} estimateId - The estimate ID
   * @param {string|null} productId - Optional product ID
   */
  bindRoomSelectionFormEvents(formElement, estimateId, productId = null) {
    logger.log('Binding events to room selection form', { estimateId, productId });
    
    if (!formElement) {
      logger.error('Form element not available for binding events');
      return;
    }
    
    // Remove any existing event listeners to prevent duplicates
    if (formElement._submitHandler) {
      formElement.removeEventListener('submit', formElement._submitHandler);
    }
    
    // Create new submit handler
    formElement._submitHandler = (e) => {
      e.preventDefault();
      
      // Show loading indicator
      this.modalManager.showLoading();
      
      // Get the selected room ID
      const selectElement = formElement.querySelector('select');
      const roomId = selectElement.value;
      
      if (!roomId) {
        this.modalManager.showError('Please select a room or create a new one.');
        this.modalManager.hideLoading();
        return;
      }
      
      // If a product ID is provided, add it to the room
      if (productId) {
        // Delegate to the ProductManager to add product to the selected room
        if (this.modalManager.productManager) {
          this.modalManager.productManager.addProductToRoom(estimateId, roomId, productId)
            .then(() => {
              // Show success message
              this.modalManager.hideLoading();
              
              // Show a confirmation dialog
              if (window.productEstimator && window.productEstimator.dialog) {
                window.productEstimator.dialog.alert(
                  'Product Added',
                  'The product has been added to the selected room.',
                  () => {
                    // Close the modal or show the estimates list
                    this.modalManager.closeModal();
                  }
                );
              } else {
                alert('The product has been added to the selected room.');
                this.modalManager.closeModal();
              }
            })
            .catch(error => {
              logger.error('Error adding product to room:', error);
              this.modalManager.showError('Error adding product to room. Please try again.');
              this.modalManager.hideLoading();
            });
        } else {
          logger.error('ProductManager not available for addProductToRoom');
          this.modalManager.hideLoading();
        }
      } else {
        // No product ID, just close the form or navigate to room details
        this.modalManager.hideLoading();
        
        // Switch view to show the estimate with the selected room expanded
        if (this.modalManager.estimateManager) {
          this.modalManager.estimateManager.showEstimatesList(roomId, estimateId);
        } else {
          this.modalManager.closeModal();
        }
      }
    };
    
    // Add the submit handler
    formElement.addEventListener('submit', formElement._submitHandler);
    
    // Add event handler for "Create New Room" button
    const newRoomButton = formElement.querySelector('.create-new-room-button');
    if (newRoomButton) {
      if (newRoomButton._clickHandler) {
        newRoomButton.removeEventListener('click', newRoomButton._clickHandler);
      }
      
      newRoomButton._clickHandler = (e) => {
        e.preventDefault();
        this.showNewRoomForm(estimateId, productId);
      };
      
      newRoomButton.addEventListener('click', newRoomButton._clickHandler);
    }
    
    // Add event handler for cancel button
    const cancelButton = formElement.querySelector('.cancel-button');
    if (cancelButton) {
      if (cancelButton._clickHandler) {
        cancelButton.removeEventListener('click', cancelButton._clickHandler);
      }
      
      cancelButton._clickHandler = (e) => {
        e.preventDefault();
        
        // Go back to estimate selection or close the modal
        if (productId && this.modalManager.estimateManager) {
          this.modalManager.estimateManager.showEstimateSelection(productId);
        } else {
          this.modalManager.closeModal();
        }
      };
      
      cancelButton.addEventListener('click', cancelButton._clickHandler);
    }
    
    // Add event handler for back button
    const backButton = formElement.querySelector('.back-button');
    if (backButton) {
      if (backButton._clickHandler) {
        backButton.removeEventListener('click', backButton._clickHandler);
      }
      
      backButton._clickHandler = (e) => {
        e.preventDefault();
        
        // Go back to estimate selection
        if (this.modalManager.estimateManager) {
          this.modalManager.estimateManager.showEstimateSelection(productId);
        } else {
          this.modalManager.closeModal();
        }
      };
      
      backButton.addEventListener('click', backButton._clickHandler);
    }
  }
  
  /**
   * Load and display rooms for an estimate in the estimates list view
   * @param {string} estimateId - The estimate ID
   * @param {HTMLElement} container - The container to render rooms in
   * @param {string|null} expandRoomId - Optional room ID to expand
   * @returns {Promise} - Promise that resolves when rooms are loaded
   */
  loadRoomsForEstimate(estimateId, container, expandRoomId = null) {
    logger.log('Loading rooms for estimate', { estimateId, expandRoomId });
    
    if (!container) {
      return Promise.reject(new Error('Container not provided for loading rooms'));
    }
    
    // Show loading indicator
    const loadingPlaceholder = container.querySelector('.loading-placeholder');
    if (loadingPlaceholder) {
      loadingPlaceholder.style.display = 'block';
    }
    
    // Create rooms container if it doesn't exist
    let roomsContainer = container.querySelector('.estimate-rooms-container');
    if (!roomsContainer) {
      roomsContainer = document.createElement('div');
      roomsContainer.className = 'estimate-rooms-container';
      container.appendChild(roomsContainer);
    }
    
    // Load rooms from storage or API
    return this.dataService.getRoomsForEstimate(estimateId)
      .then(rooms => {
        // Clear existing content
        roomsContainer.innerHTML = '';
        
        if (!rooms || rooms.length === 0) {
          // No rooms, show empty state
          roomsContainer.innerHTML = `
            <div class="empty-state">
              <p>No rooms in this estimate yet. Add a room to get started.</p>
            </div>
          `;
        } else {
          // Render each room
          const roomPromises = rooms.map(room => {
            // Check if this room should be expanded
            const shouldExpand = expandRoomId === room.id;
            
            // Render the room
            return this.renderRoom(room, room.id, estimateId, roomsContainer, shouldExpand);
          });
          
          return Promise.all(roomPromises);
        }
        
        // Hide loading placeholder
        if (loadingPlaceholder) {
          loadingPlaceholder.style.display = 'none';
        }
        
        return rooms;
      })
      .catch(error => {
        logger.error('Error loading rooms for estimate:', error);
        
        // Show error message
        roomsContainer.innerHTML = `
          <div class="error-state">
            <p>Error loading rooms. Please try again.</p>
          </div>
        `;
        
        // Hide loading placeholder
        if (loadingPlaceholder) {
          loadingPlaceholder.style.display = 'none';
        }
        
        throw error;
      });
  }
  
  /**
   * Render a single room in the estimate
   * @param {object} room - The room data
   * @param {string} roomId - The room ID
   * @param {string} estimateId - The estimate ID
   * @param {HTMLElement} container - The container to render the room in
   * @param {boolean} expand - Whether to expand the room
   * @returns {Promise} - Promise that resolves when the room is rendered
   */
  renderRoom(room, roomId, estimateId, container, expand = false) {
    logger.log('Rendering room', { roomId, estimateId, expand });
    
    if (!container) {
      return Promise.reject(new Error('Container not provided for rendering room'));
    }
    
    // Create room element
    const roomElement = document.createElement('div');
    roomElement.className = 'room-item';
    roomElement.dataset.roomId = roomId;
    roomElement.dataset.estimateId = estimateId;
    
    // Render room header and basic structure
    roomElement.innerHTML = `
      <div class="room-header ${expand ? 'expanded' : ''}">
        <h4>${room.name || `Room #${roomId}`}</h4>
        <div class="room-actions">
          <button class="edit-room-button button button-small">Edit</button>
          <button class="remove-room-button button button-small button-danger">Remove</button>
        </div>
        <div class="accordion-indicator"></div>
      </div>
      <div class="room-content" style="display: ${expand ? 'block' : 'none'};">
        <div class="room-products-container">
          <div class="loading-placeholder">Loading products...</div>
        </div>
        <div class="room-total">
          <span class="total-label">Total:</span>
          <span class="total-value">${format.currency(room.total || 0)}</span>
        </div>
        <div class="room-actions-footer">
          <button class="add-product-button button button-small button-primary">Add Product</button>
        </div>
      </div>
    `;
    
    // Add the room to the container
    container.appendChild(roomElement);
    
    // Bind event handlers for this room
    this.bindRoomEvents(roomElement, estimateId, roomId);
    
    // If the room is expanded, load its products
    if (expand && roomElement.querySelector('.room-content').style.display === 'block') {
      const productsContainer = roomElement.querySelector('.room-products-container');
      
      // Delegate to ProductManager to load products for this room
      if (this.modalManager.productManager) {
        return this.modalManager.productManager.loadProductsForRoom(estimateId, roomId, productsContainer);
      }
    }
    
    return Promise.resolve(roomElement);
  }
  
  /**
   * Bind events to a room element
   * @param {HTMLElement} roomElement - The room element
   * @param {string} estimateId - The estimate ID
   * @param {string} roomId - The room ID
   */
  bindRoomEvents(roomElement, estimateId, roomId) {
    logger.log('Binding events to room element', { estimateId, roomId });
    
    if (!roomElement) {
      logger.error('Room element not available for binding events');
      return;
    }
    
    // Bind header click for accordion toggle
    const header = roomElement.querySelector('.room-header');
    if (header) {
      if (header._clickHandler) {
        header.removeEventListener('click', header._clickHandler);
      }
      
      header._clickHandler = (e) => {
        // Don't toggle if clicking on a button
        if (e.target.closest('button')) {
          return;
        }
        
        const content = roomElement.querySelector('.room-content');
        if (!content) return;
        
        // Toggle expanded state
        const isExpanded = header.classList.contains('expanded');
        
        if (isExpanded) {
          header.classList.remove('expanded');
          content.style.display = 'none';
        } else {
          header.classList.add('expanded');
          content.style.display = 'block';
          
          // Load products if not already loaded
          const productsContainer = content.querySelector('.room-products-container');
          if (productsContainer && !productsContainer.dataset.loaded) {
            productsContainer.dataset.loaded = 'true';
            
            // Delegate to ProductManager to load products
            if (this.modalManager.productManager) {
              this.modalManager.productManager.loadProductsForRoom(estimateId, roomId, productsContainer);
            }
          }
        }
      };
      
      header.addEventListener('click', header._clickHandler);
    }
    
    // Bind remove button
    const removeButton = roomElement.querySelector('.remove-room-button');
    if (removeButton) {
      if (removeButton._clickHandler) {
        removeButton.removeEventListener('click', removeButton._clickHandler);
      }
      
      removeButton._clickHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.handleRoomRemoval(estimateId, roomId);
      };
      
      removeButton.addEventListener('click', removeButton._clickHandler);
    }
    
    // Bind edit button
    const editButton = roomElement.querySelector('.edit-room-button');
    if (editButton) {
      if (editButton._clickHandler) {
        editButton.removeEventListener('click', editButton._clickHandler);
      }
      
      editButton._clickHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // This will be implemented in a later phase
        logger.log('Edit room button clicked for room ID:', roomId);
      };
      
      editButton.addEventListener('click', editButton._clickHandler);
    }
    
    // Bind add product button
    const addProductButton = roomElement.querySelector('.add-product-button');
    if (addProductButton) {
      if (addProductButton._clickHandler) {
        addProductButton.removeEventListener('click', addProductButton._clickHandler);
      }
      
      addProductButton._clickHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Delegate to ProductManager to show product selection
        if (this.modalManager.productManager) {
          this.modalManager.productManager.showProductSelection(estimateId, roomId);
        } else {
          logger.error('ProductManager not available for showProductSelection');
        }
      };
      
      addProductButton.addEventListener('click', addProductButton._clickHandler);
    }
  }
  
  /**
   * Show the new room form
   * @param {string} estimateId - The estimate ID to add the room to
   * @param {string|null} productId - Optional product ID to add to the new room
   */
  showNewRoomForm(estimateId, productId = null) {
    logger.log('Showing new room form', { estimateId, productId });
    
    // Save the current estimate and product IDs
    this.currentEstimateId = estimateId;
    this.currentProductId = productId;
    
    // Get the new room form container from the modal manager
    const newRoomForm = this.modalManager.newRoomForm;
    
    if (!newRoomForm) {
      logger.error('New room form container not found in modal');
      this.modalManager.showError('Modal structure incomplete. Please contact support.');
      this.modalManager.hideLoading();
      return;
    }
    
    // Use ModalManager's utility to ensure the element is visible
    this.modalManager.forceElementVisibility(newRoomForm);
    
    // Show loading indicator while we prepare the form
    this.modalManager.showLoading();
    
    // Use TemplateEngine to insert the template
    try {
      // Clear existing content first in case it was loaded before
      newRoomForm.innerHTML = '';
      TemplateEngine.insert('new-room-form-template', {}, newRoomForm);
      logger.log('New room form template inserted into wrapper.');
      
      // Find the form element
      const formElement = newRoomForm.querySelector('form');
      if (formElement) {
        // Store estimate ID and product ID as data attributes on the form
        formElement.dataset.estimateId = estimateId;
        
        if (productId) {
          formElement.dataset.productId = productId;
        } else {
          delete formElement.dataset.productId;
        }
        
        // Delegate form binding to the FormManager or bind events ourselves
        if (this.modalManager.formManager) {
          this.modalManager.formManager.bindNewRoomFormEvents(formElement, estimateId, productId);
        } else {
          this.bindNewRoomFormEvents(formElement, estimateId, productId);
        }
        
        this.modalManager.hideLoading();
      } else {
        logger.error('Form element not found inside the template after insertion!');
        this.modalManager.showError('Error rendering form template. Please try again.');
        this.modalManager.hideLoading();
      }
    } catch (error) {
      logger.error('Error inserting new room form template:', error);
      this.modalManager.showError('Error loading form template. Please try again.');
      this.modalManager.hideLoading();
    }
  }
  
  /**
   * Bind events to the new room form
   * @param {HTMLFormElement} formElement - The form element
   * @param {string} estimateId - The estimate ID
   * @param {string|null} productId - Optional product ID
   */
  bindNewRoomFormEvents(formElement, estimateId, productId = null) {
    logger.log('Binding events to new room form', { estimateId, productId });
    
    if (!formElement) {
      logger.error('Form element not available for binding events');
      return;
    }
    
    // Remove any existing event listeners to prevent duplicates
    if (formElement._submitHandler) {
      formElement.removeEventListener('submit', formElement._submitHandler);
    }
    
    // Create new submit handler
    formElement._submitHandler = (e) => {
      e.preventDefault();
      
      // Show loading indicator
      this.modalManager.showLoading();
      
      // Get the form data
      const formData = new FormData(formElement);
      const roomName = formData.get('room_name');
      
      if (!roomName) {
        this.modalManager.showError('Please enter a room name.');
        this.modalManager.hideLoading();
        return;
      }
      
      // Create the room
      this.dataService.createRoom(estimateId, {
        name: roomName
      })
        .then(newRoom => {
          logger.log('Room created successfully:', newRoom);
          
          // If a product ID is provided, add it to the new room
          if (productId) {
            // Delegate to the ProductManager to add product to the new room
            if (this.modalManager.productManager) {
              return this.modalManager.productManager.addProductToRoom(estimateId, newRoom.id, productId)
                .then(() => {
                  // Show success message
                  this.modalManager.hideLoading();
                  
                  // Show a confirmation dialog
                  if (window.productEstimator && window.productEstimator.dialog) {
                    window.productEstimator.dialog.alert(
                      'Room Created',
                      'The room has been created and the product has been added.',
                      () => {
                        // Close the modal or show the estimates list
                        this.modalManager.closeModal();
                      }
                    );
                  } else {
                    alert('The room has been created and the product has been added.');
                    this.modalManager.closeModal();
                  }
                });
            } else {
              logger.error('ProductManager not available for addProductToRoom');
              this.modalManager.hideLoading();
              
              // Still show success for room creation
              if (window.productEstimator && window.productEstimator.dialog) {
                window.productEstimator.dialog.alert(
                  'Room Created',
                  'The room has been created.',
                  () => {
                    this.modalManager.closeModal();
                  }
                );
              } else {
                alert('The room has been created.');
                this.modalManager.closeModal();
              }
            }
          } else {
            // No product ID, just show success message
            this.modalManager.hideLoading();
            
            // Switch view to show the estimate with the new room expanded
            if (this.modalManager.estimateManager) {
              this.modalManager.estimateManager.showEstimatesList(newRoom.id, estimateId);
            } else {
              // Show success message and close
              if (window.productEstimator && window.productEstimator.dialog) {
                window.productEstimator.dialog.alert(
                  'Room Created',
                  'The room has been created.',
                  () => {
                    this.modalManager.closeModal();
                  }
                );
              } else {
                alert('The room has been created.');
                this.modalManager.closeModal();
              }
            }
          }
        })
        .catch(error => {
          logger.error('Error creating room:', error);
          this.modalManager.showError('Error creating room. Please try again.');
          this.modalManager.hideLoading();
        });
    };
    
    // Add the submit handler
    formElement.addEventListener('submit', formElement._submitHandler);
    
    // Add event handler for cancel button
    const cancelButton = formElement.querySelector('.cancel-button');
    if (cancelButton) {
      if (cancelButton._clickHandler) {
        cancelButton.removeEventListener('click', cancelButton._clickHandler);
      }
      
      cancelButton._clickHandler = (e) => {
        e.preventDefault();
        
        // Go back to room selection
        this.showRoomSelectionForm(estimateId, productId);
      };
      
      cancelButton.addEventListener('click', cancelButton._clickHandler);
    }
    
    // Add event handler for back button
    const backButton = formElement.querySelector('.back-button');
    if (backButton) {
      if (backButton._clickHandler) {
        backButton.removeEventListener('click', backButton._clickHandler);
      }
      
      backButton._clickHandler = (e) => {
        e.preventDefault();
        
        // Go back to room selection
        this.showRoomSelectionForm(estimateId, productId);
      };
      
      backButton.addEventListener('click', backButton._clickHandler);
    }
  }
  
  /**
   * Handle room removal
   * @param {string} estimateId - The estimate ID
   * @param {string} roomId - The room ID to remove
   */
  handleRoomRemoval(estimateId, roomId) {
    logger.log('Handling room removal', { estimateId, roomId });
    
    // Show a confirmation dialog
    if (window.productEstimator && window.productEstimator.dialog) {
      window.productEstimator.dialog.confirm(
        'Remove Room',
        'Are you sure you want to remove this room? All products in this room will also be removed. This action cannot be undone.',
        () => {
          // User confirmed, remove the room
          this.modalManager.showLoading();
          
          this.dataService.removeRoom(estimateId, roomId)
            .then(() => {
              logger.log('Room removed successfully');
              
              // Find and remove the room element from the DOM
              const roomElement = document.querySelector(`.room-item[data-room-id="${roomId}"][data-estimate-id="${estimateId}"]`);
              if (roomElement) {
                roomElement.remove();
              }
              
              // Update estimate totals
              this.dataService.getEstimate(estimateId)
                .then(estimate => {
                  // Update the estimate total in the UI
                  const estimateItem = document.querySelector(`.estimate-item[data-estimate-id="${estimateId}"]`);
                  if (estimateItem) {
                    const totalElement = estimateItem.querySelector('.estimate-total-value');
                    if (totalElement) {
                      totalElement.textContent = format.currency(estimate.total || 0);
                    }
                  }
                })
                .catch(error => {
                  logger.error('Error updating estimate totals after room removal:', error);
                })
                .finally(() => {
                  this.modalManager.hideLoading();
                });
            })
            .catch(error => {
              logger.error('Error removing room:', error);
              this.modalManager.showError('Error removing room. Please try again.');
              this.modalManager.hideLoading();
            });
        },
        () => {
          // User cancelled, do nothing
          logger.log('Room removal cancelled by user');
        }
      );
    } else {
      // No dialog service available, use native confirm
      if (confirm('Are you sure you want to remove this room? All products in this room will also be removed. This action cannot be undone.')) {
        // User confirmed, remove the room
        this.modalManager.showLoading();
        
        this.dataService.removeRoom(estimateId, roomId)
          .then(() => {
            logger.log('Room removed successfully');
            
            // Find and remove the room element from the DOM
            const roomElement = document.querySelector(`.room-item[data-room-id="${roomId}"][data-estimate-id="${estimateId}"]`);
            if (roomElement) {
              roomElement.remove();
            }
            
            // Update estimate totals
            this.dataService.getEstimate(estimateId)
              .then(estimate => {
                // Update the estimate total in the UI
                const estimateItem = document.querySelector(`.estimate-item[data-estimate-id="${estimateId}"]`);
                if (estimateItem) {
                  const totalElement = estimateItem.querySelector('.estimate-total-value');
                  if (totalElement) {
                    totalElement.textContent = format.currency(estimate.total || 0);
                  }
                }
              })
              .catch(error => {
                logger.error('Error updating estimate totals after room removal:', error);
              })
              .finally(() => {
                this.modalManager.hideLoading();
              });
          })
          .catch(error => {
            logger.error('Error removing room:', error);
            this.modalManager.showError('Error removing room. Please try again.');
            this.modalManager.hideLoading();
          });
      }
    }
  }
  
  /**
   * Update room totals in the UI
   * @param {string} estimateId - The estimate ID
   * @param {string} roomId - The room ID
   * @param {object} totals - The totals data
   */
  updateRoomTotals(estimateId, roomId, totals) {
    logger.log('Updating room totals', { estimateId, roomId, totals });
    
    // Find the room element
    const roomElement = document.querySelector(`.room-item[data-room-id="${roomId}"][data-estimate-id="${estimateId}"]`);
    if (!roomElement) {
      logger.error('Room element not found for updating totals');
      return;
    }
    
    // Update the total value
    const totalElement = roomElement.querySelector('.total-value');
    if (totalElement) {
      totalElement.textContent = format.currency(totals.total || 0);
    }
    
    // Update estimate totals if needed
    this.dataService.getEstimate(estimateId)
      .then(estimate => {
        // Update the estimate total in the UI
        const estimateItem = document.querySelector(`.estimate-item[data-estimate-id="${estimateId}"]`);
        if (estimateItem) {
          const estimateTotalElement = estimateItem.querySelector('.estimate-total-value');
          if (estimateTotalElement) {
            estimateTotalElement.textContent = format.currency(estimate.total || 0);
          }
        }
      })
      .catch(error => {
        logger.error('Error updating estimate totals:', error);
      });
  }
  
  /**
   * Called when the modal is closed
   */
  onModalClosed() {
    logger.log('RoomManager: Modal closed');
    // Clean up any resources or state as needed
    this.currentEstimateId = null;
    this.currentProductId = null;
  }
}

export default RoomManager;