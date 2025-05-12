/**
 * Label Settings JavaScript
 *
 * Handles functionality specific to the label settings tab.
 * Extends VerticalTabbedModule for common vertical tab and form handling.
 */
import VerticalTabbedModule from '../common/VerticalTabbedModule'; // Adjust path as needed
import { validation } from '@utils'; // Assuming @utils provides these

// Note: showFieldError, clearFieldError, showNotice are inherited or use global ProductEstimatorSettings
import { createLogger } from '@utils';
const logger = createLogger('LabelSettings'); // Corrected logger name for consistency
class LabelSettingsModule extends VerticalTabbedModule {
  constructor() {
    super({
      mainTabId: 'labels',
      defaultSubTabId: 'labels-general', // Default vertical tab for labels
      ajaxActionPrefix: 'save_labels',   // Results in 'save_labels_settings'
      localizedDataName: 'labelsSettings' // CORRECTED: Was 'labelSettings', now matches PHP context name
    });
    // Specific properties for LabelSettingsModule can be initialized here if needed
    logger.log('LabelSettingsModule instance created.');
  }

  /**
   * Override to bind module-specific events.
   * Common events are bound by the parent class.
   */
  bindModuleSpecificEvents() {
    super.bindModuleSpecificEvents(); // Call parent if it ever has common specific events

    if (!this.$container || !this.$container.length) {
      logger.warn('LabelSettingsModule: $container not available in bindModuleSpecificEvents.');
      return;
    }
    // const $ = jQuery; // Already available via this.$ from ProductEstimatorSettings

    // Example: Email validation if labels module had email fields directly
    // this.$container.on('change', 'input[type="email"]', this.handleEmailValidation.bind(this));
    logger.log('LabelSettingsModule specific events bound (if any).');
  }

  /**
   * Override for actions when the main "Labels" tab is activated.
   */
  onMainTabActivated() {
    super.onMainTabActivated(); // Good practice to call parent
    // Any specific setup for Labels when its main tab is shown,
    // e.g., initializing a specific type of editor if one was used for labels.
    logger.log('Labels main tab activated - specific setup can go here.');
  }

  // Example of a module-specific handler, if needed:
  // handleEmailValidation(e) {
  //   const $field = this.$(e.target); // Use this.$
  //   if (!$field.closest(this.$container).length) return;

  //   const email = $field.val().trim();
  //   // Access i18n from this.settings, which is initialized by the base class
  //   const i18n = (this.settings && this.settings.i18n) || {};
  //   if (email && !validation.validateEmail(email)) {
  //     this.showFieldError($field, i18n.validationErrorEmail || 'Please enter a valid email address.');
  //     return false;
  //   }
  //   this.clearFieldError($field);
  //   return true;
  // }
}

// Initialize the module
jQuery(document).ready(function($) { // Pass $ to use it directly
                                     // Ensure the main container for this module exists before instantiating
  if ($('#labels').length) { // Use $ directly
    // Ensure only one instance is created
    if (!window.ProductEstimatorLabelSettingsModuleInstance) {
      try {
        window.ProductEstimatorLabelSettingsModuleInstance = new LabelSettingsModule();
        logger.log('LabelSettingsModule instance successfully created and assigned to window.');
      } catch (error) {
        logger.error('Error instantiating LabelSettingsModule:', error);
        if (window.ProductEstimatorSettingsInstance && typeof window.ProductEstimatorSettingsInstance.showNotice === 'function') {
          window.ProductEstimatorSettingsInstance.showNotice('Failed to initialize Label Settings. Check console for errors.', 'error');
        }
      }
    }
  } else {
    logger.warn('Main container #labels not found. LabelSettingsModule will not be initialized.');
  }
});

export default LabelSettingsModule;
