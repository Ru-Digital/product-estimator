
  // Create a global array to store console logs
  window.__testLogs = [];
  
  // Create a global array to store errors
  window.__e2eErrors = [];
  
  // Override console methods to store logs
  const originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error,
    info: console.info
  };
  
  // Store original methods
  console.log = function() {
    window.__testLogs.push({type: 'log', message: Array.from(arguments).join(' '), timestamp: new Date().toISOString()});
    originalConsole.log.apply(console, arguments);
  };
  
  console.warn = function() {
    window.__testLogs.push({type: 'warn', message: Array.from(arguments).join(' '), timestamp: new Date().toISOString()});
    originalConsole.warn.apply(console, arguments);
  };
  
  console.error = function() {
    window.__testLogs.push({type: 'error', message: Array.from(arguments).join(' '), timestamp: new Date().toISOString()});
    window.__e2eErrors.push({message: Array.from(arguments).join(' '), timestamp: new Date().toISOString()});
    originalConsole.error.apply(console, arguments);
  };
  
  console.info = function() {
    window.__testLogs.push({type: 'info', message: Array.from(arguments).join(' '), timestamp: new Date().toISOString()});
    originalConsole.info.apply(console, arguments);
  };
  
  // Add window error handler
  window.addEventListener('error', function(e) {
    window.__e2eErrors.push({
      message: e.message,
      source: e.filename,
      lineno: e.lineno,
      colno: e.colno,
      stack: e.error ? e.error.stack : null,
      timestamp: new Date().toISOString()
    });
    return false;
  });
  
  console.log('[E2E Test] Debug script initialized');
  