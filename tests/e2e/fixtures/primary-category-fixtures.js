const primaryCategoryFixtures = {
  // Primary category products
  primaryProducts: {
    flooringA: {
      id: '6147',
      name: 'Flooring A',
      category: 'Flooring',
      categoryId: 123,
      price: 100,
      image: 'flooring-a.jpg',
      is_primary_category: true
    },
    flooringB: {
      id: '13540',
      name: 'Flooring B',
      category: 'Flooring',
      categoryId: 123,
      price: 150,
      image: 'flooring-b.jpg',
      is_primary_category: true
    }
  },
  
  // Non-primary category products
  accessoryProducts: {
    underlay: {
      id: '14994',
      name: 'Underlay',
      category: 'Accessories',
      categoryId: 456,
      price: 50,
      image: 'underlay.jpg',
      is_primary_category: false
    },
    trim: {
      id: '15001',
      name: 'Trim',
      category: 'Accessories',
      categoryId: 456,
      price: 25,
      image: 'trim.jpg',
      is_primary_category: false
    }
  },
  
  // Test estimates and rooms
  testEstimates: {
    homeReno: {
      id: 'estimate_home-reno-123',
      name: 'Home Reno',
      rooms: {
        livingRoom: {
          id: 'room_living-room-456',
          name: 'Living Room',
          width: 4,
          length: 5,
          products: {}
        },
        bedroom: {
          id: 'room_bedroom-789',
          name: 'Bedroom',
          width: 3,
          length: 4,
          products: {}
        }
      }
    }
  },
  
  // Settings configuration
  settings: {
    primary_product_categories: [123], // Flooring category ID
    feature_switches: {
      suggested_products_enabled: true,
      product_upgrades_enabled: true
    }
  },
  
  // Helper functions for setting up test data
  setupLocalStorage: function(estimates = {}) {
    const storageData = {
      estimates: estimates
    };
    localStorage.setItem('productEstimatorEstimateData', JSON.stringify(storageData));
  },
  
  addProductToRoom: function(estimateId, roomId, product) {
    const data = JSON.parse(localStorage.getItem('productEstimatorEstimateData') || '{}');
    if (data.estimates && data.estimates[estimateId] && data.estimates[estimateId].rooms[roomId]) {
      data.estimates[estimateId].rooms[roomId].products = 
        data.estimates[estimateId].rooms[roomId].products || {};
      data.estimates[estimateId].rooms[roomId].products[product.id] = product;
      localStorage.setItem('productEstimatorEstimateData', JSON.stringify(data));
    }
  }
};

module.exports = primaryCategoryFixtures;