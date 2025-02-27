// product-estimator-modal.js

// Check if ProductEstimatorModal is already defined
if (typeof window.ProductEstimatorModal === 'undefined') {
  class ProductEstimatorModal {
    constructor() {
      this.$modal = jQuery('.product-estimator-modal');

      this.$overlay = this.$modal.find('.product-estimator-modal-overlay');
      this.$closeButton = this.$modal.find('.product-estimator-modal-close');

      this.initEvents();

      if (!this.$modal.length) {
        console.error('ProductEstimatorModal: .product-estimator-modal element not found.');
      }
    }

    initEvents() {
      let self = this;
      this.$closeButton.on('click', function () {
        self.closeModal();
      });
      this.$overlay.on('click', function () {
        self.closeModal();
      });
      jQuery(document).on('keydown', function (e) {
        if (e.key === 'Escape') {
          self.closeModal();
        }
      });
    }

    showLoading() {
      if (this.$modal.length) {
        this.$modal.show();
      } else {
        console.error('ProductEstimatorModal: modal element is undefined.');
      }
    }

    loadRoomSelection() {
      this.showLoading();
    }

    openModal() {
      this.loadRoomSelection();
      if (this.$modal.length) {
        this.$modal.show();
      } else {
        console.error('ProductEstimatorModal: Cannot open modal.');
      }
    }

    closeModal() {
      this.$modal.hide();
    }
  }

  // Assign to global scope
  window.ProductEstimatorModal = ProductEstimatorModal;
}

jQuery(document).ready(function($) {
  if (!window.productEstimatorModalInstance) {
    window.productEstimatorModalInstance = new ProductEstimatorModal();
  }

  $('.open-estimator-modal').on('click', function(e) {
    e.preventDefault();
    window.productEstimatorModalInstance.openModal();
  });

  $(document).on('click', '.product-estimator-modal-close, .product-estimator-modal-overlay', function(e) {
    e.preventDefault();
    window.productEstimatorModalInstance.closeModal();
  });
});
