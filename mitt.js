/** --------------------------------------------------------------
  * Mitt: Tiny functional event emitter / pubsub.
  *
  * Changes (by Anoesj Sadraee):
  * - Ported to a true ES6 module, so use 'new mitt()' now.
  * - 'start-with' and 'ends-with' support (e.g. 'starts-with:debug' matches events named 'debug' and 'debug-verbose').
  ------------------------------------------------------------- **/
export default class mitt {
  
  constructor () {
    this.handlers = new Map();
    this.specialHandlers = new Map();
  }

  /** --------------------------------------------------------------
    * Register an event handler for the given event name.
    * @param {String} eventName: Name of event to listen for. Can begin with 'starts-with' or 'end-with' to match grouped events.
    * @param {Function} handler: Function to call in response to given event
    ------------------------------------------------------------- **/
  on (eventName, handler) {
    if (typeof eventName !== 'string' || typeof handler !== 'function') return;

    if (eventName.startsWith('starts-with:')) {
      this.specialHandlers.set(eventName, {
        handler: handler,
        test: typeToTest => typeToTest.startsWith(eventName.substring(12))
      });
    }

    else if (eventName.startsWith('ends-with:')) {
      this.specialHandlers.set(eventName, {
        handler: handler,
        test: typeToTest => typeToTest.endsWith(eventName.substring(10))
      });
    }

    else {
      this.handlers.set(eventName, handler);
    }
  }

  /** --------------------------------------------------------------
    * Remove an event handler for the given type.
    * @param {String} eventName: Name of event to unregister (special) handler from.
    ------------------------------------------------------------- **/
  off (eventName) {
    if (typeof eventName !== 'string') return;
    this.handlers.delete(eventName);
    this.specialHandlers.delete(eventName);
  }

  /** --------------------------------------------------------------
    * Invoke all handlers for the given type.
    * If present, special handlers (starting with 'starts-with' or 'ends-with') and wildcard handlers (containing a '*') are invoked after type-matched handlers.
    * @param {String} eventName:  Name of the event to invoke
    * @param {Any} fn (optional): Any value (object is recommended and powerful), passed to each handler
    ------------------------------------------------------------- **/
  emit (eventName, fn) {
    if (typeof eventName !== 'string') return;
    
    // Fire regular handler
    if (this.handlers.has(eventName)) this.handlers.get(eventName)(fn);
    
    // Fire special handlers
    this.specialHandlers.forEach((specialHandler, specialHandlerEventName) => {
      if (specialHandler.test(eventName)) specialHandler.handler(eventName, fn);
    });   
    
    // Or fire all handlers if a '*' handler has been set
    if (this.handlers.has('*')) {
      this.handlers.get('*')(eventName, fn);
    }
  }

}