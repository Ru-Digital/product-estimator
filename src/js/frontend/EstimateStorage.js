/**
 * EstimateStorage.js
 *
 * Handles synchronizing PHP session data with browser localStorage.
 * This module provides methods to store and retrieve session data,
 * particularly for estimates and rooms.
 */

import { v4 as uuidv4 } from 'uuid';

import { createLogger } from '@utils';

const STORAGE_KEY = 'productEstimatorEstimateData';
const logger = createLogger('EstimateStorage');

/**
 * Generate a unique ID using UUID v4 with an optional prefix
 * @param {string} prefix - Optional prefix for the ID (e.g., 'estimate', 'room')
 * @returns {string} A unique ID in the format prefix_uuid or just uuid if no prefix
 */
function generateUniqueId(prefix) {
  const uuid = uuidv4();
  return prefix ? `${prefix}_${uuid}` : uuid;
}

/**
 * Load session data from localStorage
 * @returns {object} Estimate data object with estimates, etc.
 */
export function loadEstimateData() {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      const data = JSON.parse(storedData);
      
      // Handle the case where estimates is an array (from PHP session)
      if (data.estimates && Array.isArray(data.estimates)) {
        logger.log("loadEstimateData - Converting estimates array to object");
        
        // Convert array to an object with array indices as keys
        const estimatesObject = {};
        
        data.estimates.forEach((estimate, index) => {
          // Use array index as key if no ID is present
          const key = estimate.id || String(index);
          
          // If it doesn't have an ID field, add one
          if (!estimate.id) {
            estimate.id = key;
          }
          
          estimatesObject[key] = estimate;
        });
        
        // Replace the array with the new object
        data.estimates = estimatesObject;
        
        // Save back to localStorage
        saveEstimateData(data);
        logger.log("loadEstimateData - Converted array to object structure");
      }
      
      logger.log("loadEstimateData - Data loaded:", data);
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
 * @param {object} data - Estimate data to save
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
 * @returns {object | null} The estimate data or null if not found
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
 * @param {object} estimateData - The estimate data to save
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
 * @param {object} estimateData - Estimate data to add
 * @returns {string} The new estimate ID
 */
export function addEstimate(estimateData) {
  const storedData = loadEstimateData();

  if (!storedData.estimates) {
    storedData.estimates = {};
  }

  // Generate a unique ID using UUID v4 or use the provided ID
  let estimateId;
  
  // If the estimate data already has an ID field, use it
  if (estimateData.id) {
    estimateId = estimateData.id;
  } else {
    // No ID provided, generate a UUID with 'estimate' prefix
    estimateId = generateUniqueId('estimate');
    // Set the ID in the estimate data object
    estimateData.id = estimateId;
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
 * @param {object} roomData - Room data to add
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

  // Generate a unique ID using UUID v4 or use the provided ID
  let roomId;
  
  // If the room data already has an ID field, use it
  if (roomData.id) {
    roomId = roomData.id;
  } else {
    // No ID provided, generate a UUID with 'room' prefix
    roomId = generateUniqueId('room');
    // Set the ID in the room data object
    roomData.id = roomId;
  }

  estimate.rooms[roomId] = roomData;
  saveEstimateData(storedData);

  return roomId;
}

/**
 * Get suggestions for a room from localStorage
 * @param {string} estimateId - Estimate ID
 * @param {string} roomId - Room ID
 * @returns {Array|null|Promise<null>} Array of suggestion products, null if not found, or a Promise resolving to null if feature is disabled
 */
export function getSuggestionsForRoom(estimateId, roomId) {
  if (!window.productEstimatorVars.featureSwitches.suggested_products_enabled) {
    logger.log(`[getSuggestionsForRoom] Suggestions feature is disabled. Returning null for room ${roomId}.`);
    return Promise.resolve(null); // Or Promise.resolve([])
  }
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
 * @param {Array} suggestedProducts - Suggested Products Array to set
 * @param {string} estimateId - Estimate ID
 * @param {string} roomId - Room ID
 * @returns {Array|null|Promise<null>} Array of suggestion products added to room, null if not found, or a Promise resolving to null if feature is disabled
 */
export function addSuggestionsToRoom(suggestedProducts, estimateId, roomId) {
  if (!window.productEstimatorVars.featureSwitches.suggested_products_enabled) {
    logger.log(`[addSuggestionsToRoom] Suggestions feature is disabled. Returning null for room ${roomId}.`);
    return Promise.resolve(null); // Or Promise.resolve([])
  }
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

/**
 * Add a product to a room in localStorage
 * @param {string} estimateId - Estimate ID
 * @param {string} roomId - Room ID
 * @param {object} productData - Product data to add
 * @returns {boolean} Success or failure
 */
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

  // Convert room.products from array to object if needed
  if (Array.isArray(room.products)) {
    // Convert existing array to object with product ID as key
    const productsObject = {};
    room.products.forEach(product => {
      if (product && product.id) {
        productsObject[product.id] = product;
      }
    });
    room.products = productsObject;
  } else if (!room.products || typeof room.products !== 'object') {
    // Initialize as empty object if not already an object
    room.products = {};
  }
  
  // Ensure room.product_suggestions array exists (important for DataService flow)
  if (!Array.isArray(room.product_suggestions)) {
    room.product_suggestions = [];
  }

  // Check if product with the same ID already exists in the room's products object
  if (room.products[productData.id]) {
    logger.warn(` Product with ID ${productData.id} already exists in room ${roomId}. Aborting add to room.products.`);
    return false; // Indicate failure because product already exists
  }

  // Add product to room.products using product ID as key
  room.products[productData.id] = productData;
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

  // Check if the basic path and products object exist.
  if (!storedData.estimates ||
    !storedData.estimates[estimateId] ||
    !storedData.estimates[estimateId].rooms ||
    !storedData.estimates[estimateId].rooms[roomId]) {
    logger.warn('[removeProductFromRoom] Attempted to remove product: Path to products is invalid.', { estimateId, roomId, receivedProductId: productId });
    return false;
  }

  const room = storedData.estimates[estimateId].rooms[roomId];
  
  // Convert room.products from array to object if needed (for backward compatibility)
  if (Array.isArray(room.products)) {
    // Convert existing array to object with product ID as key
    const productsObject = {};
    room.products.forEach(product => {
      if (product && product.id) {
        productsObject[product.id] = product;
      }
    });
    room.products = productsObject;
  } else if (!room.products || typeof room.products !== 'object') {
    // Initialize as empty object if not already an object
    room.products = {};
  }

  // Check if the product exists in the room
  const productIdStr = String(productId);
  if (!room.products[productIdStr]) {
    logger.warn(`[removeProductFromRoom] Product with ID '${productId}' not found in room '${roomId}' for estimate '${estimateId}'. Cannot remove.`);
    return false; // Product not found by ID
  }

  // Remove the product by deleting its key
  delete room.products[productIdStr];
  saveEstimateData(storedData);
  logger.log(`[removeProductFromRoom] Product with ID '${productId}' successfully removed from localStorage for room '${roomId}', estimate '${estimateId}'.`);
  return true; // Successfully removed by ID
}

/**
 * Update customer details in localStorage
 * @param {object} customerDetails - Customer details to save
 */
export function updateCustomerDetails(customerDetails) {
  const storedData = loadEstimateData();

  // Store customer details at the top level
  storedData.customerDetails = customerDetails;
  saveEstimateData(storedData);
}

/**
 * Get all estimates from localStorage
 * @returns {object} All estimates
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
 * @param {object} newProductData - New product data
 * @param {string} replaceType - Type of replacement ('main' or 'additional_products')
 * @param {string|null} parentProductId - ID of the parent product (if replacing additional product)
 * @returns {boolean} Success or failure
 */
export function replaceProductInRoom(estimateId, roomId, oldProductId, newProductId, newProductData, replaceType = 'main', parentProductId = null) {
  const storedData = loadEstimateData();

  // Check if estimate or room exists
  if (!storedData.estimates ||
      !storedData.estimates[estimateId] ||
      !storedData.estimates[estimateId].rooms ||
      !storedData.estimates[estimateId].rooms[roomId]) {
    logger.warn("Estimate or room not found in storedData.");
    return false;
  }

  const room = storedData.estimates[estimateId].rooms[roomId];
  
  // Check if the room has products
  if (!room.products || typeof room.products !== 'object') {
    logger.warn("Room products not found or not an object.");
    return false;
  }

  // Convert IDs to strings for consistent comparison
  const oldProductIdStr = String(oldProductId);
  const newProductIdStr = String(newProductId);

  // Handle replacement based on type
  if (replaceType === 'additional_products' && parentProductId !== null) {
    const parentProductIdStr = String(parentProductId);
    
    // Get the parent product directly
    const parentProduct = room.products[parentProductIdStr];
    
    if (!parentProduct) {
      logger.warn(`Parent product with ID ${parentProductIdStr} not found.`);
      return false;
    }
    
    // Check if the parent product has additional products
    if (!parentProduct.additional_products || !Array.isArray(parentProduct.additional_products)) {
      logger.warn(`Parent product with ID ${parentProductIdStr} has no additional products.`);
      return false;
    }
    
    // Find the additional product to replace
    for (let j = 0; j < parentProduct.additional_products.length; j++) {
      const addProduct = parentProduct.additional_products[j];
      
      // Check if this is the product to replace
      if (addProduct.id == oldProductIdStr ||
          (addProduct.replacement_chain && addProduct.replacement_chain.includes(oldProductIdStr))) {
        
        logger.log(`Found product to replace: ${oldProductIdStr} under parent ${parentProductIdStr}`);
        
        // Handle replacement chain
        if (!addProduct.replacement_chain) {
          addProduct.replacement_chain = [];
        }
        if (!addProduct.replacement_chain.includes(addProduct.id)) {
          addProduct.replacement_chain.push(addProduct.id);
        }
        newProductData.replacement_chain = addProduct.replacement_chain;
        
        // Replace the product
        room.products[parentProductIdStr].additional_products[j] = newProductData;
        
        // Save and return
        saveEstimateData(storedData);
        return true;
      }
    }
    
    logger.warn(`Additional product with ID ${oldProductIdStr} not found under parent ${parentProductIdStr}.`);
    return false;
    
  } else if (replaceType === 'main') {
    // Check if the product exists
    if (!room.products[oldProductIdStr]) {
      logger.warn(`Main product with ID ${oldProductIdStr} not found in room.`);
      return false;
    }
    
    // Remove the old product
    delete room.products[oldProductIdStr];
    
    // Add the new product
    room.products[newProductIdStr] = newProductData;
    
    // Save and return
    saveEstimateData(storedData);
    return true;
  }
  
  logger.warn(`Invalid replaceType: ${replaceType}`);
  return false;
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
