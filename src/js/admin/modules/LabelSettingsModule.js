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
import { validation } from '@utils';
import { createLogger } from '@utils';

const logger = createLogger('LabelSettings');

class LabelSettingsModule extends VerticalTabbedModule {
  constructor() {
    super({
      mainTabId: 'labels',
      defaultSubTabId: 'labels-general',
      ajaxActionPrefix: 'save_labels',
      localizedDataName: 'labelsSettings'
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

  }

  /**
   * Override for actions when the main "Labels" tab is activated.
   */
  onMainTabActivated() {
    super.onMainTabActivated();
  }
}

// Initialize the module
jQuery(document).ready(function($) { // Pass $ to use it directly
                                     // Ensure the main container for this module exists before instantiating
  if ($('#labels').length) { // Use $ directly
    // Ensure only one instance is created
    if (!window.ProductEstimatorLabelSettingsModuleInstance) {
      try {
        window.ProductEstimatorLabelSettingsModuleInstance = new LabelSettingsModule();
      } catch (error) {
        if (window.ProductEstimatorSettingsInstance && typeof window.ProductEstimatorSettingsInstance.showNotice === 'function') {
          window.ProductEstimatorSettingsInstance.showNotice('Failed to initialize Label Settings. Check console for errors.', 'error');
        }
      }
    }
  } else {
  }
});

export default LabelSettingsModule;
