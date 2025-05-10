/**
 * Feature Switches Settings JavaScript
 *
 * Handles functionality specific to the feature switches settings tab.
 */
import { createLogger } from '@utils';
const logger = createLogger('FeatureSwitchSettings');

class FeatureSwitchesSettingsModule {
  /**
   * Initialize the module
   */
  constructor() {
    $ = jQuery; // Make jQuery available as this.$

    // before this script runs or at least before init() is called.
    const localizedSettings = window.featureSwitchesSettings || {};

    this.settings = {
      ajaxUrl: localizedSettings.ajaxUrl || (typeof ajaxurl !== 'undefined' ? ajaxurl : '/wp-admin/admin-ajax.php'),
      nonce: localizedSettings.nonce || '', // Fallback
      i18n: localizedSettings.i18n || {},   // Fallback
      tab_id: localizedSettings.tab_id || 'feature_switches', // Fallback
    };

    // Defer initialization to document.ready to ensure DOM is loaded
    $(document).ready(() => {
      // Re-check localizedSettings in case they are defined by another script in document.ready
      const updatedLocalizedSettingsOnReady = window.featureSwitchesSettings || {};
      if (updatedLocalizedSettingsOnReady.nonce) {
        this.settings.nonce = updatedLocalizedSettingsOnReady.nonce;
      }

      this.init();
    });
  }

  /**
   * Initialize the module
   */
  init() {
    logger.log('Initializing Feature Switches Settings Module');
    this.bindEvents();
    // Add any initial setup logic for feature switch fields here if needed
  }

  /**
   * Bind event handlers
   */
  bindEvents() {
    const $ = jQuery;

    // Listen for tab changes to activate module logic when this tab is shown
    $(document).on('product_estimator_tab_changed', this.handleTabChanged.bind(this));

    // Add any specific event handlers for interactions within the Feature Switches tab
    // Example: $('#enable_example_feature').on('change', this.handleFeatureSwitchChange.bind(this));
  }

  /**
   * Handle tab changed event
   * @param {Event} e Tab changed event
   * @param {string} tabId The newly active tab ID
   */
  handleTabChanged(e, tabId) {
    // If our tab becomes active, perform any necessary re-initialization or setup
    if (tabId === this.settings.tab_id) {
      logger.log('Feature Switches tab activated');
      // You can call setup functions here if needed when the tab becomes visible
      // this.setupFeatureSwitchFields();
    }
  }

  // Add other methods as needed for client-side functionality
  // Example:
  // setupFeatureSwitchFields() {
  //   log('FeatureSwitchesSettingsModule', 'Setting up feature switch fields');
  //   // Add logic to set initial states, attach event listeners, etc.
  // }
}

// Initialize the module when the DOM is ready.
// It will activate fully when its tab is displayed due to the tab change listener.
jQuery(document).ready(function() {
  // Check if the tab's container element exists before initializing
  if (jQuery('#feature_switches').length) {
    const module = new FeatureSwitchesSettingsModule();
    // Optional: Make it available globally for debugging
    // window.FeatureSwitchesSettingsModule = module;
  }
});

// Export the module if using ES modules
export default FeatureSwitchesSettingsModule;
