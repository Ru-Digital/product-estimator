// product-estimator-modal.js

// Check if ProductEstimatorModal is already defined
if (typeof window.ProductEstimatorModal === 'undefined') {
  class ProductEstimatorModal {
    constructor() {
      this.$modal = jQuery('.product-estimator-modal');


      this.$overlay = this.$modal.find('.product-estimator-modal-overlay');
      this.$closeButton = this.$modal.find('.product-estimator-modal-close');
      this.$newRoomButton = this.$modal.find('.add-room');
      this.$cancelRoomButton = this.$modal.find('.cancel-btn');
      this.$newRoomFormContainer = this.$modal.find('.room-form-container');


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

      this.$newRoomButton.on('click', function () {
        self.showRoomForm();
      })

      this.$cancelRoomButton.on('click', function (event) {
        self.hideRoomForm(event);
      })
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

    openModal(productId = null) {
      this.loadRoomSelection();
      if (this.$modal.length) {
        if (productId) {
          this.$modal.attr('data-product-id', productId); // Set product ID on modal
          jQuery('#estimates').hide(); // Hide estimates section
          jQuery('#room-selection-form-wrapper').show(); // Show room selection form
        } else {
          jQuery('#estimates').show(); // Show estimates section
          jQuery('#room-selection-form-wrapper').hide(); // Hide room selection form
        }
      } else {
        console.error('ProductEstimatorModal: Cannot open modal.');
      }
    }

    closeModal() {
      this.$modal.hide();
      this.$modal.removeAttr('data-product-id'); // Clear product ID when closing
    }

    showRoomForm() {
      this.$newRoomFormContainer.slideDown(300);
    }

    hideRoomForm(event) {
      event.preventDefault();
      this.$newRoomFormContainer.slideUp(300);
    }
  }

  // Assign to global scope
  window.ProductEstimatorModal = ProductEstimatorModal;
}

jQuery(document).ready(function($) {
//
//   $('.add-room').on('click', function(e) {
//     $(".room-form-container").slideToggle(300); // Slide effect
//   });
//
//   $('.cancel-room').on('click', function(e) {
//       $(".room-form-container").hide(300); // Hide form when clicking "Cancel"
//   });

  if (!window.productEstimatorModalInstance) {
    window.productEstimatorModalInstance = new ProductEstimatorModal();
  }

  $('.open-estimator-modal').on('click', function(e) {
    // Get the product ID from the clicked button
    let productId = $(this).data('product-id') || null; // Default to null if not present

    // Open the modal and pass the product ID
    window.productEstimatorModalInstance.openModal(productId);
  });

  $(document).on('click', '.product-estimator-modal-close, .product-estimator-modal-overlay', function(e) {
    e.preventDefault();
    window.productEstimatorModalInstance.closeModal();
  });
});

document.querySelectorAll(".product-estimator-modal .accordion-header").forEach(button => {
  button.addEventListener("click", () => {
    const content = button.nextElementSibling;
    const isActive = content.style.display === "block";

    document.querySelectorAll(".product-estimator-modal .accordion-content").forEach(item => {
      item.style.display = "none"; // Hide all sections
    });

    content.style.display = isActive ? "none" : "block"; // Toggle current section
  });
});
