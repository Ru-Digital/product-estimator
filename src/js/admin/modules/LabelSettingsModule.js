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
    logger.log('LabelSettingsModule instance created.');
  }

  /**
   * Override to bind module-specific events.
   * Common events are bound by the parent class.
   */
  bindModuleSpecificEvents() {
    super.bindModuleSpecificEvents();

    if (!this.$container || !this.$container.length) {
      logger.warn('LabelSettingsModule: $container not available in bindModuleSpecificEvents.');
      return;
    }

    logger.log('LabelSettingsModule specific events bound (if any).');
  }

  /**
   * Override for actions when the main "Labels" tab is activated.
   */
  onMainTabActivated() {
    super.onMainTabActivated();
    logger.log('Labels main tab activated - specific setup can go here.');
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
