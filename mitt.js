/** --------------------------------------------------------------
  * Mitt: Tiny functional event emitter / pubsub.
  *
  * Changes (by Anoesj Sadraee):
  * - Ported to a true ES6 module, so use 'new mitt()' now.
  * - Full wildcard support (e.g. 'debug*' matches 'debug' and 'debug-verbose'). Turn off by initializing mitt with 'new mitt(false)'.
  ------------------------------------------------------------- **/
export default class mitt {
  
  constructor (fullWildcardsSupport = true) {
    this.fullWildcardsSupport = fullWildcardsSupport;
    this.handlers = new Map();
    if (this.fullWildcardsSupport) this.wildcardHandlers = new Map();
  }

  /** --------------------------------------------------------------
    * Register an event handler for the given type.
    * @param  {String} type:        Type of event to listen for. Can contain wildcard ('*').
    * @param  {Function} handler:   Function to call in response to given event
    ------------------------------------------------------------- **/
  on (type, handler) {
    if (typeof type !== 'string' || typeof handler !== 'function') return;

    // Save types with wildcards as a RegExp
    if (this.fullWildcardsSupport && type.includes('*')) {
      this.wildcardHandlers.set(type, {
        regexp: new RegExp(`^${type.replace(/\*/g, '.*')}$`, 'ig'),
        handler: handler
      });
    }

    else {
      this.handlers.set(type, handler);
    }
  }

  /** --------------------------------------------------------------
    * Remove an event handler for the given type.
    * @param  {String} type:  Type of event to unregister handler from. Can contain wildcard ('*').
    ------------------------------------------------------------- **/
  off (type) {
    if (typeof type !== 'string') return;
    this.handlers.delete(type);
    if (this.fullWildcardsSupport) this.wildcardHandlers.delete(type);
  }

  /** --------------------------------------------------------------
    * Invoke all handlers for the given type.
    * If present, wildcard handlers (containing a '*') are invoked after type-matched handlers.
    * @param  {String} type:        The event type to invoke
    * @param  {Any} fn (optional):  Any value (object is recommended and powerful), passed to each handler
    ------------------------------------------------------------- **/
  emit (type, fn) {
    if (typeof type !== 'string') return;
    
    // Fire regular handler
    if (this.handlers.has(type)) this.handlers.get(type)(fn);
    
    // Fire matching wildcard handlers
    if (this.fullWildcardsSupport) {
      this.wildcardHandlers.forEach(handlerObj => {
        if (handlerObj.regexp.test(type)) handlerObj.handler(type, fn);
      });      
    }
    
    // Or fire all handlers
    else if (this.handlers.has('*')) {
      this.handlers.get('*')(type, fn);
    }
  }

}
