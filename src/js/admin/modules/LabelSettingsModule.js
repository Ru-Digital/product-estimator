/**
 * Label Settings JavaScript
 *
 * Handles functionality specific to the label settings tab.
 * Extends VerticalTabbedModule for common vertical tab and form handling.
 *
 * This module relies on abstract base classes for common functionality,
 * selectors, and internationalization strings.
 */
import VerticalTabbedModule from '../common/VerticalTabbedModule';

class LabelSettingsModule extends VerticalTabbedModule {
  constructor() {
    super({
      mainTabId: 'labels',
      defaultSubTabId: 'buttons',
      ajaxActionPrefix: 'save_labels',
      localizedDataName: 'labelSettings'
    });
  }

  /**
   * Override to bind module-specific events.
   * Common events are bound by the parent class.
   */
  bindModuleSpecificEvents() {
    super.bindModuleSpecificEvents();

    if (!this.$container || !this.$container.length) {
      return;
    }

    // Make sure we properly handle form submissions
    // The issue was that the tab forms weren't properly being handled

    // Add custom event debugging for form submission
    // this.$container.on('submit.debug', 'form.pe-vtabs-tab-form', (e) => {
    //   logger.log('Form submitted via custom debug handler', e.currentTarget);
    //   // Don't call preventDefault here, just monitoring
    // });
  }


  /**
   * Override for actions when the main "Labels" tab is activated.
   */
  onMainTabActivated() {
    super.onMainTabActivated();

    // Add additional initialization to ensure the module is working correctly


    // Make sure our localizedData is loaded first (for context sharing)

  }

}

// Initialize the module
jQuery(document).ready(function() {
  if (jQuery('#labels').length) {
    window.LabelSettingsModuleInstance = new LabelSettingsModule();
  }
});

export default LabelSettingsModule;
