/**
 * EstimateStorage.js
 *
 * Handles synchronizing PHP session data with browser localStorage.
 * This module provides methods to store and retrieve session data,
 * particularly for estimates and rooms.
 */

const STORAGE_KEY = 'productEstimatorEstimateData';

/**
 * Load session data from localStorage
 * @returns {Object} Estimate data object with estimates, etc.
 */
export function loadEstimateData() {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      return JSON.parse(storedData);
    } else {
      const sessionDetails = sessionStorage.getItem(STORAGE_KEY);
      return sessionDetails ? JSON.parse(sessionDetails) : {};
    }
  } catch (error) {
    console.error('Error loading estimate data from localStorage:', error);
    return {};  // Return empty object on error
  }
}

/**
 * Save session data to localStorage
 * @param {Object} data - Estimate data to save
 */
export function saveEstimateData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (localStorageError) {
    console.warn('localStorage not available, using sessionStorage:', localStorageError);
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (sessionStorageError) {
      console.error('sessionStorage not available:', sessionStorageError);
      // If neither is available, details won't persist, but we can continue
    }
  }
}

/**
 * Clear session data from localStorage
 */
export function clearEstimateData() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (localStorageError) {
    console.warn('localStorage not available:', localStorageError);
  }
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch (sessionStorageError) {
    console.warn('sessionStorage not available:', sessionStorageError);
  }
}


/**
 * Get specific estimate data from localStorage
 * @param {string} estimateId - The estimate ID to retrieve
 * @returns {Object|null} The estimate data or null if not found
 */
export function getEstimate(estimateId) {
  const storedData = loadEstimateData();
  return storedData.estimates && storedData.estimates[estimateId]
    ? storedData.estimates[estimateId]
    : null;
}

/**
 * Save a specific estimate to localStorage
 * @param {string} estimateId - The estimate ID
 * @param {Object} estimateData - The estimate data to save
 */
export function saveEstimate(estimateId, estimateData) {
  const storedData = loadEstimateData();

  if (!storedData.estimates) {
    storedData.estimates = {};
  }

  storedData.estimates[estimateId] = estimateData;
  saveEstimateData(storedData);
}

/**
 * Add a new estimate to localStorage
 * @param {Object} estimateData - Estimate data to add
 * @returns {string} The new estimate ID
 */
export function addEstimate(estimateData) {
  const storedData = loadEstimateData();

  if (!storedData.estimates) {
    storedData.estimates = {};
  }

  // Generate a unique ID if not provided
  let estimateId = estimateData.id;
  if (!estimateId) {
    estimateId = `estimate_${Date.now()}`;
  }

  storedData.estimates[estimateId] = estimateData;
  saveEstimateData(storedData);

  return estimateId;
}

/**
 * Remove an estimate from localStorage
 * @param {string} estimateId - Estimate ID to remove
 * @returns {boolean} Success or failure
 */
export function removeEstimate(estimateId) {
  const storedData = loadEstimateData();

  if (!storedData.estimates || !storedData.estimates[estimateId]) {
    return false;
  }

  delete storedData.estimates[estimateId];
  saveEstimateData(storedData);

  return true;
}

/**
 * Add a room to an estimate in localStorage
 * @param {string} estimateId - Estimate ID
 * @param {Object} roomData - Room data to add
 * @returns {string} The new room ID
 */
export function addRoom(estimateId, roomData) {
  const storedData = loadEstimateData();

  if (!storedData.estimates || !storedData.estimates[estimateId]) {
    return false;
  }

  const estimate = storedData.estimates[estimateId];

  if (!estimate.rooms) {
    estimate.rooms = {};
  }

  // Generate a unique ID if not provided
  let roomId = roomData.id;
  if (!roomId) {
    roomId = `room_${Date.now()}`;
  }

  estimate.rooms[roomId] = roomData;
  saveEstimateData(storedData);

  return roomId;
}

/**
 * Add suggestions to a room in localStorage
 * @param {string} estimateId - Estimate ID
 * @param {string} roomId - Room ID
 * @param {Array} suggestions - Array of suggestion products
 * @returns {boolean} Success or failure
 */
export function addSuggestionsToRoom(estimateId, roomId, suggestions) {
  const storedData = loadEstimateData();

  if (!storedData.estimates ||
    !storedData.estimates[estimateId] ||
    !storedData.estimates[estimateId].rooms ||
    !storedData.estimates[estimateId].rooms[roomId]) {
    return false;
  }

  const room = storedData.estimates[estimateId].rooms[roomId];

  // Store suggestions directly in the room
  room.product_suggestions = suggestions;
  saveEstimateData(storedData);

  return true;
}

/**
 * Get suggestions for a room from localStorage
 * @param {string} estimateId - Estimate ID
 * @param {string} roomId - Room ID
 * @returns {Array|null} Array of suggestion products or null if not found
 */
export function getSuggestionsForRoom(estimateId, roomId) {
  const storedData = loadEstimateData();

  if (!storedData.estimates ||
    !storedData.estimates[estimateId] ||
    !storedData.estimates[estimateId].rooms ||
    !storedData.estimates[estimateId].rooms[roomId]) {
    return null;
  }

  return storedData.estimates[estimateId].rooms[roomId].product_suggestions || null;
}

/**
 * Remove a room from an estimate in localStorage
 * @param {string} estimateId - Estimate ID
 * @param {string} roomId - Room ID to remove
 * @returns {boolean} Success or failure
 */
export function removeRoom(estimateId, roomId) {
  const storedData = loadEstimateData();

  if (!storedData.estimates ||
    !storedData.estimates[estimateId] ||
    !storedData.estimates[estimateId].rooms ||
    !storedData.estimates[estimateId].rooms[roomId]) {
    return false;
  }

  delete storedData.estimates[estimateId].rooms[roomId];
  saveEstimateData(storedData);

  return true;
}

/**
 * Add a product to a room in an estimate in localStorage
 * @param {string} estimateId - Estimate ID
 * @param {string} roomId - Room ID
 * @param {Object} productData - Product data to add
 * @returns {boolean} Success or failure
 */
export function addProductToRoom(estimateId, roomId, productData) {
  const storedData = loadEstimateData();

  if (!storedData.estimates ||
    !storedData.estimates[estimateId] ||
    !storedData.estimates[estimateId].rooms ||
    !storedData.estimates[estimateId].rooms[roomId]) {
    return false;
  }

  const room = storedData.estimates[estimateId].rooms[roomId];

  if (!room.products) {
    room.products = [];
  }

  room.products.push(productData);
  saveEstimateData(storedData);

  return true;
}

/**
 * Remove a product from a room in localStorage
 * @param {string} estimateId - Estimate ID
 * @param {string} roomId - Room ID
 * @param {number} productIndex - Index of the product in the products array
 * @returns {boolean} Success or failure
 */
export function removeProductFromRoom(estimateId, roomId, productIndex) {
  const storedData = loadEstimateData();

  if (!storedData.estimates ||
    !storedData.estimates[estimateId] ||
    !storedData.estimates[estimateId].rooms ||
    !storedData.estimates[estimateId].rooms[roomId] ||
    !storedData.estimates[estimateId].rooms[roomId].products ||
    !storedData.estimates[estimateId].rooms[roomId].products[productIndex]) {
    return false;
  }

  // Remove the product at the specified index
  storedData.estimates[estimateId].rooms[roomId].products.splice(productIndex, 1);
  saveEstimateData(storedData);

  return true;
}

/**
 * Update customer details in localStorage
 * @param {Object} customerDetails - Customer details to save
 */
export function updateCustomerDetails(customerDetails) {
  const storedData = loadEstimateData();

  // Store customer details at the top level
  storedData.customerDetails = customerDetails;
  saveEstimateData(storedData);
}

/**
 * Get all estimates from localStorage
 * @returns {Object} All estimates
 */
export function getEstimates() {
  const storedData = loadEstimateData();
  return storedData.estimates || {};
}

/**
 * Replace an existing product with a new one in localStorage
 * @param {string} estimateId - Estimate ID
 * @param {string} roomId - Room ID
 * @param {string} oldProductId - ID of product to replace
 * @param {string} newProductId - ID of new product
 * @param {Object} newProductData - New product data
 * @param {string} replaceType - Type of replacement ('main' or 'additional_products')
 * @returns {boolean} Success or failure
 */
export function replaceProductInRoom(estimateId, roomId, oldProductId, newProductId, newProductData, replaceType = 'main') {
  const storedData = loadEstimateData();

  if (!storedData.estimates ||
    !storedData.estimates[estimateId] ||
    !storedData.estimates[estimateId].rooms ||
    !storedData.estimates[estimateId].rooms[roomId]) {
    return false;
  }

  const room = storedData.estimates[estimateId].rooms[roomId];

  if (!room.products) {
    return false;
  }

  // If replacing an additional product
  if (replaceType === 'additional_products') {
    // Look for the parent product containing the additional product to replace
    for (let i = 0; i < room.products.length; i++) {
      const product = room.products[i];

      if (product.additional_products && Array.isArray(product.additional_products)) {
        for (let j = 0; j < product.additional_products.length; j++) {
          const addProduct = product.additional_products[j];

          // Check if this is the product to replace
          if (addProduct.id == oldProductId ||
            (addProduct.replacement_chain && addProduct.replacement_chain.includes(oldProductId))) {

            // Create replacement chain if it doesn't exist
            if (!addProduct.replacement_chain) {
              addProduct.replacement_chain = [];
            }

            // Add current ID to chain if not already present
            if (!addProduct.replacement_chain.includes(addProduct.id)) {
              addProduct.replacement_chain.push(addProduct.id);
            }

            // Update the product data with the replacement chain
            newProductData.replacement_chain = addProduct.replacement_chain;

            // Replace the product
            room.products[i].additional_products[j] = newProductData;
            saveEstimateData(storedData);
            return true;
          }
        }
      }
    }

    return false;
  } else {
    // For main products
    let found = false;
    let productIndex = -1;

    // Find the product to replace
    for (let i = 0; i < room.products.length; i++) {
      if (room.products[i].id == oldProductId) {
        found = true;
        productIndex = i;
        break;
      }
    }

    if (found && productIndex >= 0) {
      // Remove the old product
      room.products.splice(productIndex, 1);

      // Add the new product
      room.products.push(newProductData);

      saveEstimateData(storedData);
      return true;
    }

    return false;
  }
}

export default {
  loadEstimateData,
  saveEstimateData,
  clearEstimateData,
  getEstimate,
  saveEstimate,
  addEstimate,
  removeEstimate,
  addRoom,
  removeRoom,
  addProductToRoom,
  removeProductFromRoom,
  updateCustomerDetails,
  getEstimates,
  replaceProductInRoom,
  addSuggestionsToRoom,
  getSuggestionsForRoom
};
