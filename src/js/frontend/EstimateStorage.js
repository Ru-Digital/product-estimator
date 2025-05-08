/**
 * EstimateStorage.js
 *
 * Handles synchronizing PHP session data with browser localStorage.
 * This module provides methods to store and retrieve session data,
 * particularly for estimates and rooms.
 */

const STORAGE_KEY = 'productEstimatorEstimateData';

import { createLogger } from '@utils';
const logger = createLogger('CustomerStorage');

/**
 * Load session data from localStorage
 * @returns {Object} Estimate data object with estimates, etc.
 */
export function loadEstimateData() {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      const data = JSON.parse(storedData);
      logger.log("loadEstimateData - Data loaded:", data); // Add this log
      return data;
    } else {
      const sessionDetails = sessionStorage.getItem(STORAGE_KEY);
      return sessionDetails ? JSON.parse(sessionDetails) : {};
    }
  } catch (error) {
    logger.error('Error loading estimate data from localStorage:', error);
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
    logger.warn('localStorage not available, using sessionStorage:', localStorageError);
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (sessionStorageError) {
      logger.error('sessionStorage not available:', sessionStorageError);
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
    logger.warn('localStorage not available:', localStorageError);
  }
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch (sessionStorageError) {
    logger.warn('sessionStorage not available:', sessionStorageError);
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
 * Add suggestions to a room in localStorage
 * @param {array} suggestedProducts - Suggested Products Array to set
 * @param {string} estimateId - Estimate ID
 * @param {string} roomId - Room ID
 * @returns {Array|null} Array of suggestion products added to room or null
 */
export function addSuggestionsToRoom(suggestedProducts, estimateId, roomId) {
  const storedData = loadEstimateData(); //

  if (!storedData.estimates ||
    !storedData.estimates[estimateId] ||
    !storedData.estimates[estimateId].rooms ||
    !storedData.estimates[estimateId].rooms[roomId]) { //
    return null; //
  }

  const room = storedData.estimates[estimateId].rooms[roomId];

  // Ensure suggestedProducts is an array
  if (!Array.isArray(suggestedProducts)) {
    logger.error('Error: suggestedProducts must be an array.');
    return null;
  }

  room.product_suggestions = suggestedProducts;
  saveEstimateData(storedData);

  return room.product_suggestions;
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

export function addProductToRoom(estimateId, roomId, productData) {
  const storedData = loadEstimateData();

  if (!storedData.estimates ||
    !storedData.estimates[estimateId] ||
    !storedData.estimates[estimateId].rooms ||
    !storedData.estimates[estimateId].rooms[roomId]) {
    logger.error(`Estimate or Room not found. E: ${estimateId}, R: ${roomId}`);
    return false;
  }

  const room = storedData.estimates[estimateId].rooms[roomId];

  // Ensure room.products array exists
  if (!Array.isArray(room.products)) {
    room.products = [];
  }
  // Ensure room.product_suggestions array exists (important for DataService flow)
  if (!Array.isArray(room.product_suggestions)) {
    room.product_suggestions = [];
  }

  // Check if product with the same ID already exists in the room's products array
  const existingProduct = room.products.find(product => product.id === productData.id);
  if (existingProduct) {
    logger.warn(` Product with ID ${productData.id} already exists in room ${roomId}. Aborting add to room.products.`);
    return false; // Indicate failure because product already exists
  }

  // ** CORRECTED LINE: Add to room.products **
  room.products.push(productData);
  saveEstimateData(storedData);

  logger.log(` Product ${productData.id} added to room ${roomId}. products:`, room.products);
  return true; // Indicate success
}

// EstimateStorage.js - Replace the existing function with this
/**
 * Remove a product from a room in localStorage based on Product ID.
 * @param {string} estimateId - Estimate ID
 * @param {string} roomId - Room ID
 * @param {number} productIndex - Index (Received but not used for removal logic)
 * @param {string|number} productId - ProductId of the product to remove. This is used for localStorage removal.
 * @returns {boolean} Success or failure
 */
export function removeProductFromRoom(estimateId, roomId, productIndex, productId) {
  const storedData = loadEstimateData();

  // Check if the basic path and products array exist.
  if (!storedData.estimates ||
    !storedData.estimates[estimateId] ||
    !storedData.estimates[estimateId].rooms ||
    !storedData.estimates[estimateId].rooms[roomId] ||
    !Array.isArray(storedData.estimates[estimateId].rooms[roomId].products)) {
    logger.warn('[removeProductFromRoom] Attempted to remove product: Path to products array is invalid or products array is missing.', { estimateId, roomId, receivedProductId: productId });
    return false;
  }

  const productsInRoom = storedData.estimates[estimateId].rooms[roomId].products;

  // Find the index of the product to remove using productId.
  // Comparing as strings for safety (e.g., '6677' === String(6677)).
  const actualProductIndexToRemove = productsInRoom.findIndex(product => String(product.id) === String(productId));

  if (actualProductIndexToRemove === -1) {
    logger.warn(`[removeProductFromRoom] Product with ID '<span class="math-inline">\{productId\}' not found in room '</span>{roomId}' for estimate '${estimateId}'. Cannot remove.`);
    return false; // Product not found by ID
  }

  // Remove the product at the found index
  productsInRoom.splice(actualProductIndexToRemove, 1);
  saveEstimateData(storedData);
  logger.log(`[removeProductFromRoom] Product with ID '<span class="math-inline">\{productId\}' successfully removed from localStorage for room '</span>{roomId}', estimate '${estimateId}'.`);
  return true; // Successfully removed by ID
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
 * @param {string} newProductId - ID of new product
 * @param {Object} newProductData - New product data
 * @param {string} replaceType - Type of replacement ('main' or 'additional_products')
 * @param {string|null} parentProductId - ID of the parent product (if replacing additional product)
 * @returns {boolean} Success or failure
 */
export function replaceProductInRoom(estimateId, roomId, oldProductId, newProductId, newProductData, replaceType = 'main', parentProductId = null) {
  const storedData = loadEstimateData(); // Load the current data from localStorage

  // Check if estimate or room exists
  if (!storedData.estimates ||
    !storedData.estimates[estimateId] || // Accessing with estimateId
    !storedData.estimates[estimateId].rooms || // Accessing rooms with estimateId
    !storedData.estimates[estimateId].rooms[roomId]) {

    logger.warn("Estimate or room not found in storedData."); // Original log
    return false; // Return false if estimate or room is not found
  }

  const room = storedData.estimates[estimateId].rooms[roomId]; // Get the specific room object
  logger.log("Debugging: State of room.products:", room.products, `(Type: ${typeof room.products})`, `(Is Array: ${Array.isArray(room.products)})`);

  // Check if the room has a 'products' array
  if (!room.products) {
    return false; // Return false if there are no products in the room
  }

  logger.log("Debugging: Value of replaceType before check:", replaceType, `(Type: ${typeof replaceType})`);

  // If replacing an additional product
  if (replaceType === 'additional_products' && parentProductId !== null) { // Ensure parentProductId is available
    logger.log("Starting outer loop for main products..."); // Added log

    let parentProduct = null;

    // Find the parent main product first
    for (let i = 0; i < room.products.length; i++) {
      const product = room.products[i];
      if (product.id == parentProductId) {
        parentProduct = product;
        logger.log("Found parent product:", parentProduct);
        break; // Found the parent, no need to continue searching main products
      }
    }

    // If the parent product is found and has additional products
    if (parentProduct && parentProduct.additional_products && Array.isArray(parentProduct.additional_products)) {
      logger.log(`Searching additional products for parent product ID: ${parentProductId}`);

      // Iterate through the additional products associated with this specific parent product
      for (let j = 0; j < parentProduct.additional_products.length; j++) {
        const addProduct = parentProduct.additional_products[j];

        // --- CONDITION TO IDENTIFY THE ADDITIONAL PRODUCT TO REPLACE ---
        // Check if the current additional product's ID matches the oldProductId
        // OR if the oldProductId is present in the additional product's replacement chain (if it exists)
        if (addProduct.id == oldProductId ||
          (addProduct.replacement_chain && addProduct.replacement_chain.includes(oldProductId))) {
          logger.log(`  Match found for oldProductId ${oldProductId} under parent ${parentProductId}! Replacing...`);

          // --- REPLACEMENT CHAIN LOGIC ---
          if (!addProduct.replacement_chain) {
            addProduct.replacement_chain = [];
          }
          if (!addProduct.replacement_chain.includes(addProduct.id)) {
            addProduct.replacement_chain.push(addProduct.id);
          }
          newProductData.replacement_chain = addProduct.replacement_chain;
          // --- END REPLACEMENT CHAIN LOGIC ---

          // === THE ACTUAL REPLACEMENT STEP ===
          // Replace the old additional product object at index 'j'
          // within the additional_products array of the correct parent product.
          room.products.find(p => p.id == parentProductId).additional_products[j] = newProductData;


          // === SAVE THE MODIFIED DATA TO LOCAL STORAGE ===
          saveEstimateData(storedData);

          return true; // Product found and replaced
        }
      }
      logger.warn(`Additional product with oldProductId ${oldProductId} not found under parent product ID ${parentProductId}.`);

    } else {
      logger.warn(`Parent product with ID ${parentProductId} not found or has no additional products.`);
    }



    logger.warn(`Additional product with oldProductId ${oldProductId} not found in any additional_products array.`); // Log if not found

    // If the loops finish without finding the additional product to replace
    return false;
  } else if (replaceType === 'main') {
    // --- LOGIC FOR REPLACING MAIN PRODUCTS ---
    let found = false;
    let productIndex = -1;

    // Find the index of the main product to replace
    for (let i = 0; i < room.products.length; i++) {
      if (room.products[i].id == oldProductId) {
        found = true;
        productIndex = i;
        break; // Exit loop once the product is found
      }
    }

    // If the main product was found
    if (found && productIndex >= 0) {
      // Remove the old main product from the array at the found index
      room.products.splice(productIndex, 1);

      // Add the new product to the end of the main products array
      room.products.push(newProductData);

      // === SAVE THE MODIFIED DATA TO LOCAL STORAGE ===
      // Call saveEstimateData with the updated storedData object
      saveEstimateData(storedData);

      // Return true to indicate successful replacement
      return true;
    }

    // If the main product was not found
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
  getSuggestionsForRoom,
  addSuggestionsToRoom
};
