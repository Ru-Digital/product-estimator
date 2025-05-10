/**
 * Label Settings JavaScript
 *
 * Handles functionality specific to the label settings tab.
 * Extends VerticalTabbedModule for common vertical tab and form handling.
 */
import VerticalTabbedModule from './VerticalTabbedModule'; // Adjust path as needed
import { validation } from '@utils'; // Assuming @utils provides these

// Note: showFieldError, clearFieldError, showNotice are inherited or use global ProductEstimatorSettings
import { createLogger } from '@utils';
const logger = createLogger('LabelSettings');
class LabelSettingsModule extends VerticalTabbedModule {
  constructor() {

    super({
      mainTabId: 'labels',
      defaultSubTabId: 'labels-general', // Default vertical tab for labels
      ajaxActionPrefix: 'save_labels',   // Results in 'save_labels_settings'
      localizedDataName: 'labelSettingsData' // Global object with nonce, i18n etc. for labels
    });
    // Specific properties for LabelSettingsModule can be initialized here if needed
  }

  /**
   * Override to bind module-specific events.
   * Common events are bound by the parent class.
   */
  bindModuleSpecificEvents() {
    super.bindModuleSpecificEvents(); // Call parent if it ever has common specific events

    if (!this.$container || !this.$container.length) return;
    const $ = jQuery;

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
  //   const $field = jQuery(e.target);
  //   if (!$field.closest(this.$container).length) return;

  //   const email = $field.val().trim();
  //   const i18n = (this.localizedData && this.localizedData.i18n) || {};
  //   if (email && !validation.validateEmail(email)) { // Assuming global validation.validateEmail
  //     this.showFieldError($field, i18n.validationErrorEmail || 'Please enter a valid email address.');
  //     return false;
  //   }
  //   this.clearFieldError($field);
  //   return true;
  // }
}

// Initialize the module
jQuery(document).ready(function() {
  // Ensure the main container for this module exists before instantiating
  if (jQuery('#labels').length) {
    window.ProductEstimatorLabelSettingsModule = new LabelSettingsModule();
  }
});

export default LabelSettingsModule;
