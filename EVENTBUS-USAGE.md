# EventBus Usage Guide

The EventBus provides a centralized communication system for the Product Estimator plugin, allowing components to interact without direct coupling.

## Basic Usage

### Importing the EventBus
```javascript
import eventBus from './core/EventBus';
```

### Subscribing to Events
```javascript
// Basic subscription
eventBus.on('modal:opened', (data) => {
  console.log('Modal was opened with:', data);
});

// With context for 'this'
eventBus.on('estimate:created', this.handleEstimateCreated, this);

// One-time subscription
eventBus.once('product:added', (product) => {
  console.log('Product added (this listener will be auto-removed):', product);
});
```

### Emitting Events
```javascript
// Simple event
eventBus.emit('modal:closed');

// With data
eventBus.emit('product:selected', { id: 123, name: 'Product Name' });

// With multiple parameters
eventBus.emit('room:updated', roomId, updatedData, userId);
```

### Unsubscribing from Events
```javascript
// Method 1: Store and use the unsubscribe function
const unsubscribe = eventBus.on('event:name', callback);
// Later:
unsubscribe();

// Method 2: Use the off method directly
eventBus.off('event:name', callback, context);
```

### Debugging
```javascript
// Enable debug mode to see detailed logs
eventBus.setDebug(true);

// Get event statistics
const stats = eventBus.getStats();
console.log(`${stats.totalEvents} events with ${stats.totalSubscribers} subscribers`);
```

## Standard Event Naming Conventions

We use the following event naming convention: `category:action[:detail]`

### Modal Events
- `modal:before:open` - Emitted before the modal begins opening
- `modal:opened` - Emitted when the modal is fully opened
- `modal:before:close` - Emitted before the modal begins closing
- `modal:closed` - Emitted when the modal is fully closed
- `modal:loading:started` - Emitted when the loading indicator is shown
- `modal:loading:ended` - Emitted when the loading indicator is hidden
- `modal:loading:safety` - Emitted when the loader is forcibly hidden by safety mechanisms

### Estimate Events
- `estimate:created` - Emitted when a new estimate is created
- `estimate:updated` - Emitted when an estimate is updated
- `estimate:deleted` - Emitted when an estimate is deleted
- `estimate:selected` - Emitted when an estimate is selected
- `estimate:loaded` - Emitted when estimates are loaded

### Room Events
- `room:created` - Emitted when a new room is created
- `room:updated` - Emitted when a room is updated
- `room:deleted` - Emitted when a room is deleted
- `room:selected` - Emitted when a room is selected

### Product Events
- `product:added` - Emitted when a product is added to a room
- `product:removed` - Emitted when a product is removed from a room
- `product:updated` - Emitted when a product in a room is updated
- `product:selected` - Emitted when a product is selected
- `product:replaced` - Emitted when a product is replaced with another

### UI Events
- `ui:carousel:initialized` - Emitted when a carousel is initialized
- `ui:toggle:expanded` - Emitted when a toggle element is expanded
- `ui:toggle:collapsed` - Emitted when a toggle element is collapsed

### Core Events
- `core:initialized` - Emitted when the core system has initialized
- `core:eventsbound` - Emitted when global events are bound

## Migration from Direct DOM Events

Previously, we relied on DOM events for component communication:

```javascript
// Old approach - DOM events
const event = new CustomEvent('productEstimatorModalClosed');
document.dispatchEvent(event);

// Old approach - DOM event listeners
document.addEventListener('productEstimatorModalClosed', this.handleModalClosed);
```

The EventBus approach is superior for several reasons:
1. Better decoupling of components
2. No reliance on DOM for non-UI concerns
3. Easier debugging and testing
4. Support for multiple parameters
5. Built-in error handling

When migrating code:
1. Replace DOM event dispatches with `eventBus.emit()`
2. Replace DOM event listeners with `eventBus.on()`
3. Update event naming to follow the convention
4. Consider context when binding event handlers

## Best Practices

1. **Use specific event names** - `estimate:room:product:added` is better than `product:added` if it's specifically about adding a product to a room in an estimate.

2. **Unsubscribe when done** - Always unsubscribe from events when components are removed to prevent memory leaks.

3. **Don't overuse** - Not everything needs to be an event. For direct parent-child communication, props/callbacks may be clearer.

4. **Document events** - Keep this documentation updated with new events.

5. **Error handling** - The EventBus catches errors in handlers, but you should still handle errors in your event callbacks.

6. **Backwards compatibility** - When replacing DOM events, maintain compatibility by dispatching both for a transition period.