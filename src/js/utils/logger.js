export function closeMainPluginLogGroup() {
  if (window.productEstimatorVars?.debug) {
    console.log('%cAttempting to close main plugin group. Flag is: ' + pluginLogGroupHasStarted, 'color: red');
    if (pluginLogGroupHasStarted) {
      console.groupEnd();
      pluginLogGroupHasStarted = false;
      console.log('%cMain plugin group closed. Flag set to: ' + pluginLogGroupHasStarted, 'color: purple');
    } else {
      console.warn('%cClose called, but logger flag indicates no main group was started or it was already closed.', 'color: orange');
    }
  }
}

let pluginLogGroupHasStarted = false;

function ensureMainPluginLogGroupIsStarted(startCollapsed = true) {
  // (Keep the version with diagnostic logs from above for testing)
  if (!pluginLogGroupHasStarted && window.productEstimatorVars?.debug) {
    if (startCollapsed) {
      console.groupCollapsed(`[ProductEstimator] Logs`);
    } else {
      console.group(`[ProductEstimator] Logs`);
    }
    pluginLogGroupHasStarted = true;
  } else if (window.productEstimatorVars?.debug) {
  }
}

// --- MODIFIED STANDALONE LOG FUNCTIONS ---
// These will now also log within the main plugin group.

export function log(component, ...args) {
  if (window.productEstimatorVars?.debug) {
    ensureMainPluginLogGroupIsStarted();
    console.log(`[${component}]`, ...args);
  }
}

export function warn(component, ...args) {
  if (window.productEstimatorVars?.debug) {
    ensureMainPluginLogGroupIsStarted();
    console.warn(`[${component}]`, ...args);
  }
}

export function error(component, ...args) {
  if (window.productEstimatorVars?.debug) {
    ensureMainPluginLogGroupIsStarted(false); // Attempt to expand main group on error
    console.error(`[${component}]`, ...args);
  }
}

// --- MODIFIED createLogger FUNCTION ---
/**
 * Logger Factory Function
 * Creates a logger instance pre-configured with a component name,
 * and manages logging within the main plugin console group.
 * @param {string} componentName - The name of the component for log prefixing.
 * @returns {object} An object with log, warn, error, group, and groupEnd methods.
 */
export function createLogger(componentName) {
  const componentLabel = `[${componentName}]`;

  // Option 1: Ensure group is started when logger is created.
  // if (window.productEstimatorVars?.debug) { // This initial call is fine
  //   ensureMainPluginLogGroupIsStarted();
  // }

  return {
    log: (...args) => {
      if (window.productEstimatorVars?.debug) {
        ensureMainPluginLogGroupIsStarted(); // This ensures it for any log call
        console.log(componentLabel, ...args);
        if (window.debug && window.debug.trace) {
          console.trace();
        }
      }
    },
    warn: (...args) => {
      if (window.productEstimatorVars?.debug) {
        ensureMainPluginLogGroupIsStarted();
        console.warn(componentLabel, ...args);
        if (window.debug && window.debug.trace) {
          console.trace();
        }
      }
    },
    error: (...args) => {
      if (window.productEstimatorVars?.debug) {
        ensureMainPluginLogGroupIsStarted(false);
        console.error(componentLabel, ...args);
        if (window.debug && window.debug.trace) {
          console.trace();
        }
      }
    },
    group: (groupName = 'Details', collapsed = true) => {
      if (window.productEstimatorVars?.debug) {
        ensureMainPluginLogGroupIsStarted();
        const fullGroupLabel = `${componentLabel} ${groupName}`;
        if (collapsed) {
          console.groupCollapsed(fullGroupLabel);
        } else {
          console.group(fullGroupLabel);
        }
      }
    },
    groupEnd: () => {
      if (window.productEstimatorVars?.debug && pluginLogGroupHasStarted) {
        console.groupEnd();
      }
    },
  };
}
