/**
 * EventBus.js
 *
 * Centralized event bus for component communication
 * Provides a pub/sub mechanism to decouple components
 */

import { createLogger } from '@utils';
const logger = createLogger('EventBus');

class EventBus {
  constructor() {
    this.events = {};
    this.debug = false;
  }

  /**
   * Set debug mode for the event bus
   * @param {boolean} value - Whether to enable debug mode
   * @returns {EventBus} This instance for chaining
   */
  setDebug(value) {
    this.debug = !!value;
    return this;
  }

  /**
   * Subscribe to an event
   * @param {string} event - Event name
   * @param {Function} callback - Event handler
   * @param {object} context - Optional context for the callback
   * @returns {Function} Unsubscribe function
   */
  on(event, callback, context = null) {
    if (!this.events[event]) {
      this.events[event] = [];
    }

    // Store the subscription with optional context
    const subscription = { callback, context };
    this.events[event].push(subscription);

    if (this.debug) {
      logger.log(`Subscribed to event "${event}"`, { 
        totalSubscribers: this.events[event].length 
      });
    }

    // Return unsubscribe function
    return () => {
      this.off(event, callback, context);
    };
  }

  /**
   * Unsubscribe from an event
   * @param {string} event - Event name
   * @param {Function} callback - Event handler to remove
   * @param {object} context - Context object for the callback
   * @returns {EventBus} This instance for chaining
   */
  off(event, callback, context = null) {
    if (!this.events[event]) return this;

    // Filter out the matching subscription
    this.events[event] = this.events[event].filter(subscription => {
      return subscription.callback !== callback || 
             (context !== null && subscription.context !== context);
    });

    // Clean up empty event arrays
    if (this.events[event].length === 0) {
      delete this.events[event];
    }

    if (this.debug) {
      logger.log(`Unsubscribed from event "${event}"`, { 
        remainingSubscribers: this.events[event]?.length || 0 
      });
    }

    return this;
  }

  /**
   * Subscribe to an event and auto-unsubscribe after it fires once
   * @param {string} event - Event name
   * @param {Function} callback - Event handler
   * @param {object} context - Optional context for the callback
   * @returns {Function} Unsubscribe function
   */
  once(event, callback, context = null) {
    // Create a wrapper that will remove itself after execution
    const wrapper = (...args) => {
      this.off(event, wrapper, context);
      return callback.apply(context || this, args);
    };

    // Store the original callback for potential manual unsubscription
    wrapper.originalCallback = callback;

    return this.on(event, wrapper, context);
  }

  /**
   * Emit an event
   * @param {string} event - Event name
   * @param {...any} args - Arguments to pass to handlers
   * @returns {EventBus} This instance for chaining
   */
  emit(event, ...args) {
    if (!this.events[event]) {
      if (this.debug) {
        logger.log(`Event "${event}" emitted but has no subscribers`);
      }
      return this;
    }

    if (this.debug) {
      logger.log(`Emitting event "${event}" to ${this.events[event].length} subscribers`, { 
        args: args.length ? args : 'none' 
      });
    }

    // Execute each callback with proper context and arguments
    this.events[event].forEach(subscription => {
      try {
        const { callback, context } = subscription;
        callback.apply(context || this, args);
      } catch (error) {
        logger.error(`Error in event handler for "${event}":`, error);
        // Continue with other handlers even if one fails
      }
    });

    return this;
  }

  /**
   * Clear all events or events of a specific type
   * @param {string} event - Optional event name to clear
   * @returns {EventBus} This instance for chaining
   */
  clear(event) {
    if (event) {
      delete this.events[event];
      if (this.debug) {
        logger.log(`Cleared all handlers for event "${event}"`);
      }
    } else {
      this.events = {};
      if (this.debug) {
        logger.log('Cleared all event handlers');
      }
    }
    return this;
  }

  /**
   * Get the number of subscribers for an event
   * @param {string} event - Event name
   * @returns {number} Number of subscribers
   */
  subscriberCount(event) {
    return this.events[event]?.length || 0;
  }

  /**
   * Check if an event has subscribers
   * @param {string} event - Event name
   * @returns {boolean} True if the event has subscribers
   */
  hasSubscribers(event) {
    return this.subscriberCount(event) > 0;
  }

  /**
   * Get information about all registered events
   * @returns {object} Event statistics
   */
  getStats() {
    const stats = {
      totalEvents: Object.keys(this.events).length,
      totalSubscribers: 0,
      events: {}
    };

    Object.entries(this.events).forEach(([event, subscribers]) => {
      stats.events[event] = subscribers.length;
      stats.totalSubscribers += subscribers.length;
    });

    return stats;
  }
}

// Export a singleton instance
const eventBus = new EventBus();
export default eventBus;