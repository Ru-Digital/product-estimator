/**
 * Feature Switches Settings JavaScript
 *
 * Handles functionality specific to the feature switches settings tab.
 */
import ProductEstimatorSettings from '../common/ProductEstimatorSettings'; // Adjust path as needed

class FeatureSwitchesSettingsModule extends ProductEstimatorSettings {
  /**
   * Initialize the module
   */
  constructor() {
    super({
      isModule: true,
      settingsObjectName: 'featureSwitchesSettings',
      defaultTabId: 'feature_switches',
      // loggerName: 'FeatureSwitchesSettingsModule' // Base class now uses constructor.name
    });
    // Properties like this.$ and this.settings are initialized by super()
  }

  /**
   * Module-specific initialization, called by the base class constructor on document.ready.
   */
  moduleInit() {
    this.bindEvents();
    // Add any initial setup logic for feature switch fields here if needed
  }

  /**
   * Bind event handlers specific to this module
   */
  bindEvents() {
    // Listen for tab changes to activate module logic when this tab is shown
    this.$(document).on('product_estimator_tab_changed', this.handleTabChanged.bind(this));

    // Add any specific event handlers for interactions within the Feature Switches tab
    // Example: this.$('#enable_example_feature').on('change', this.handleFeatureSwitchChange.bind(this));
  }

  /**
   * Handle tab changed event
   * @param {Event} e Tab changed event
   * @param {string} tabId The newly active tab ID
   */
  handleTabChanged(e, tabId) {
    // If our tab becomes active, perform any necessary re-initialization or setup
    if (tabId === this.settings.tab_id) {
      // You can call setup functions here if needed when the tab becomes visible
      // this.setupFeatureSwitchFields();
    }
    this.clearSubTabFromUrl(); // Call common URL clearing logic from base
  }

  // Add other methods as needed for client-side functionality
  // Example:
  // setupFeatureSwitchFields() {
  //
  //   // Add logic to set initial states, attach event listeners, etc.
  // }
}

// Initialize the module when the DOM is ready.
// The base class constructor handles calling moduleInit at the right time.
jQuery(document).ready(function() {
  // Check if the tab's container element exists before initializing
  // This ensures the module is only instantiated if its corresponding UI is present.
  if (jQuery('#feature_switches').length) {
    // Make it available globally for debugging or if other scripts need to interact with it
    window.FeatureSwitchesSettingsModuleInstance = new FeatureSwitchesSettingsModule();
  }
});

export default FeatureSwitchesSettingsModule;
