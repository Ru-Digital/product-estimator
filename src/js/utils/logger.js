let pluginLogGroupHasStarted = false;

// Setup global log capture system
if (typeof window !== 'undefined' && !window._logCapture) {
  // Initialize log capture array
  window._logCapture = [];
  
  // Save original console methods
  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;
  const originalInfo = console.info;
  
  // Override console methods to capture logs
  console.log = function() {
    window._logCapture.push({
      type: 'log', 
      time: new Date().toISOString(), 
      args: Array.from(arguments).map(arg => {
        // Handle circular objects and DOM nodes gracefully
        try {
          if (arg instanceof HTMLElement) {
            return `[HTMLElement: ${arg.tagName}${arg.id ? '#'+arg.id : ''}${arg.className ? '.'+arg.className.replace(/\s+/g, '.') : ''}]`;
          }
          
          // Safely stringify objects
          if (typeof arg === 'object' && arg !== null) {
            try {
              return JSON.parse(JSON.stringify(arg));
            } catch (e) {
              return String(arg);
            }
          }
          
          return arg;
        } catch (e) {
          return String(arg);
        }
      })
    });
    
    originalLog.apply(console, arguments);
  };
  
  console.error = function() {
    window._logCapture.push({
      type: 'error', 
      time: new Date().toISOString(), 
      args: Array.from(arguments).map(arg => {
        try {
          if (arg instanceof Error) {
            return {
              message: arg.message,
              stack: arg.stack,
              name: arg.name
            };
          }
          return arg;
        } catch (e) {
          return String(arg);
        }
      })
    });
    
    originalError.apply(console, arguments);
  };
  
  console.warn = function() {
    window._logCapture.push({
      type: 'warn', 
      time: new Date().toISOString(), 
      args: Array.from(arguments).map(arg => {
        try {
          if (typeof arg === 'object' && arg !== null) {
            try {
              return JSON.parse(JSON.stringify(arg));
            } catch (e) {
              return String(arg);
            }
          }
          return arg;
        } catch (e) {
          return String(arg);
        }
      })
    });
    
    originalWarn.apply(console, arguments);
  };
  
  console.info = function() {
    window._logCapture.push({
      type: 'info', 
      time: new Date().toISOString(), 
      args: Array.from(arguments).map(arg => {
        try {
          if (typeof arg === 'object' && arg !== null) {
            try {
              return JSON.parse(JSON.stringify(arg));
            } catch (e) {
              return String(arg);
            }
          }
          return arg;
        } catch (e) {
          return String(arg);
        }
      })
    });
    
    originalInfo.apply(console, arguments);
  };
  
  // Add export function to window
  window.exportLogs = function(filename = null, maxSize = 5000) {
    if (!window._logCapture || !window._logCapture.length) {
      console.error('No logs to export');
      return;
    }
    
    if (!filename) {
      // Generate filename with date and component id
      filename = `product-estimator-logs-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    }
    
    // Limit log size if needed
    let logs = window._logCapture;
    if (logs.length > maxSize) {
      const truncated = logs.length - maxSize;
      logs = logs.slice(-maxSize);
      logs.unshift({
        type: 'warn',
        time: new Date().toISOString(),
        args: [`Log file truncated. ${truncated} earliest entries removed.`]
      });
    }
    
    // Create blob and download
    const data = JSON.stringify(logs, null, 2);
    const blob = new Blob([data], {type: 'application/json'});
    const e = document.createEvent('MouseEvents');
    const a = document.createElement('a');
    
    a.download = filename;
    a.href = window.URL.createObjectURL(blob);
    a.dataset.downloadurl = ['application/json', a.download, a.href].join(':');
    e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    a.dispatchEvent(e);
    
    console.log(`Logs exported to ${filename}`);
    return filename;
  };
  
  // Add clear function to window
  window.clearLogs = function() {
    const count = window._logCapture.length;
    window._logCapture = [];
    console.log(`Log buffer cleared. ${count} entries removed.`);
  };
  
  // Log initialization
  console.info('Debug: Log capture system initialized');
  console.info('Available commands:\n - window.exportLogs() - Export logs to file\n - window.clearLogs() - Clear log buffer');
}

/**
 * Closes the main plugin log group if it was started.
 * Used to properly group related log messages in the console.
 * Only has an effect when debug mode is enabled.
 */
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

/**
 * Ensures that the main plugin log group is started if not already.
 * Creates a console group for all plugin logs to be organized under.
 * @param {boolean} startCollapsed - Whether to start the group as collapsed (true) or expanded (false)
 * @private
 */
function ensureMainPluginLogGroupIsStarted(startCollapsed = false) {
  // (Keep the version with diagnostic logs from above for testing)
  if (!pluginLogGroupHasStarted && window.productEstimatorVars?.debug) {
    if (startCollapsed) {
      console.groupCollapsed(`[ProductEstimator] Logs`);
    } else {
      console.group(`[ProductEstimator] Logs`);
    }
    pluginLogGroupHasStarted = true;
  } else if (window.productEstimatorVars?.debug) {
    // Debug is on, but plugin log group is already started - no action needed
  }
}

// --- MODIFIED STANDALONE LOG FUNCTIONS ---
// These will now also log within the main plugin group.

/**
 * Logs a message to the console with the component name as prefix.
 * Only logs when debug mode is enabled.
 * @param {string} component - The name of the component for log prefixing
 * @param {...any} args - Arguments to pass to console.log
 */
export function log(component, ...args) {
  if (window.productEstimatorVars?.debug) {
    ensureMainPluginLogGroupIsStarted();
    console.log(`[${component}]`, ...args);
  }
}

/**
 * Logs a warning message to the console with the component name as prefix.
 * Only logs when debug mode is enabled.
 * @param {string} component - The name of the component for log prefixing
 * @param {...any} args - Arguments to pass to console.warn
 */
export function warn(component, ...args) {
  if (window.productEstimatorVars?.debug) {
    ensureMainPluginLogGroupIsStarted();
    console.warn(`[${component}]`, ...args);
  }
}

/**
 * Logs an error message to the console with the component name as prefix.
 * Only logs when debug mode is enabled. Always expands the main group for better visibility.
 * @param {string} component - The name of the component for log prefixing
 * @param {...any} args - Arguments to pass to console.error
 */
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
