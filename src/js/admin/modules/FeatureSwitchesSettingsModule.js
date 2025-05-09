/**
 * Feature Switches Settings JavaScript
 *
 * Handles functionality specific to the feature switches settings tab.
 */
import { createLogger } from '@utils';
const logger = createLogger('FeatureSwitchSettingsModule');

class FeatureSwitchesSettingsModule {
  /**
   * Initialize the module
   */
  constructor() {
    // Access localized data (defined in PHP and localized)
    const settingsData = window.featureSwitchesSettings || {}; // Assumes JS variable name convention

    // Create a safe reference to the settings object
    this.settings = {
      tab_id: settingsData.tab_id || 'feature_switches'
      // Include other data like ajaxUrl, nonce, i18n if needed for specific AJAX calls
    };

    // Initialize when document is ready
    jQuery(document).ready(() => this.init());
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
