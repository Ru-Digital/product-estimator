/**
 * Admin JavaScript functionality
 *
 * General admin functionality for the Product Estimator plugin
 * Note: Tab management functionality has been moved to ProductEstimatorSettings.js
 */
import { showNotice, showFieldError, clearFieldError, validateEmail } from '@utils';

class ProductEstimatorAdmin {
  /**
   * Initialize the admin functionality
   */
  constructor() {
    // Initialize when document is ready
    jQuery(document).ready(() => {
      this.initializeVariables();
      this.bindEvents();

      // Only initialize tabs if we're not on the settings page
      if (!this.isSettingsPage()) {
        this.initializeTabs();
      }
    });
  }

  /**
   * Check if we're on the settings page to avoid conflicts
   * @returns {boolean} Whether this is the settings page
   */
  isSettingsPage() {
    // Check if URL contains settings page identifier
    const urlParams = new URLSearchParams(window.location.search);
    const page = urlParams.get('page');
    return page && page.indexOf('-settings') > -1;
  }

  /**
   * Initialize class variables
   */
  initializeVariables() {
    this.formChanged = false;
    this.currentTab = '';
    this.reportData = null;
    this.chart = null;
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    const $ = jQuery;

    // Only bind tab events if not on settings page
    if (!this.isSettingsPage()) {
      // Tab switching
      $('.nav-tab-wrapper').on('click', '.nav-tab', this.handleTabClick.bind(this));
    }

    // Real-time validation
    this.initializeValidation();

    // Window beforeunload
    $(window).on('beforeunload', this.handleBeforeUnload.bind(this));
  }

  /**
   * Initialize tab functionality
   */
  initializeTabs() {
    const $ = jQuery;

    // Get first tab if none is active
    const $firstTab = $('.nav-tab:first');
    const firstTabId = $firstTab.data('tab') || 'tab-1';

    $('.tab-content').hide();
    $(`#${firstTabId}`).show();
    $firstTab.addClass('nav-tab-active');
    this.currentTab = firstTabId;

    // Check for URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');

    if (tab) {
      this.switchTab(tab);
    }
  }

  /**
   * Handle tab clicks
   * @param {Event} e - Click event
   */
  handleTabClick(e) {
    e.preventDefault();
    const $ = jQuery;
    const tab = $(e.currentTarget).data('tab');

    if (this.formChanged) {
      if (confirm(productEstimatorAdmin.i18n.unsavedChanges)) {
        this.switchTab(tab);
      }
    } else {
      this.switchTab(tab);
    }
  }

  /**
   * Switch to specified tab
   * @param {string} tab - Tab identifier
   */
  switchTab(tab) {
    const $ = jQuery;

    $('.nav-tab').removeClass('nav-tab-active');
    $(`.nav-tab[data-tab="${tab}"]`).addClass('nav-tab-active');

    $('.tab-content').hide();
    $(`#${tab}`).show();

    this.currentTab = tab;

    // Update URL without reload
    const url = new URL(window.location);
    url.searchParams.set('tab', tab);
    window.history.pushState({}, '', url);

    // Load tab-specific content
    if (tab === 'reports' && !this.reportData) {
      this.loadInitialReport();
    }
  }

  /**
   * Initialize form validation
   */
  initializeValidation() {
    // Skip this if we're on the settings page
    if (this.isSettingsPage()) {
      return;
    }

    const $ = jQuery;
    const $form = $('.product-estimator-form');

    // Real-time email validation
    $form.find('input[type="email"]').on('change', (e) => {
      const $input = $(e.currentTarget);
      const email = $input.val();

      if (email && !validateEmail(email)) {
        showFieldError($input, productEstimatorAdmin.i18n.invalidEmail);
      } else {
        clearFieldError($input);
      }
    });

    // Number range validation
    $form.find('input[type="number"]').on('change', (e) => {
      const $input = $(e.currentTarget);
      const value = parseInt($input.val());
      const min = parseInt($input.attr('min'));
      const max = parseInt($input.attr('max'));

      if (value < min || value > max) {
        showFieldError($input, productEstimatorAdmin.i18n.numberRange
          .replace('%min%', min)
          .replace('%max%', max));
      } else {
        clearFieldError($input);
      }
    });
  }

  /**
   * Handle window beforeunload event
   * @param {Event} e - BeforeUnload event
   */
  handleBeforeUnload(e) {
    if (this.formChanged) {
      e.preventDefault();
      return productEstimatorAdmin.i18n.unsavedChanges;
    }
  }

  /**
   * Load initial report data (placeholder for report functionality)
   */
  loadInitialReport() {
    // This would load report data from the server via AJAX
    console.log('Loading initial report data');
  }
}

// Create instance and make globally available
const admin = new ProductEstimatorAdmin();

// Export for module use
export default ProductEstimatorAdmin;
