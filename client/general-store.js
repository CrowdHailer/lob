/* jshint esnext: true */

// State will never be assigned if evolver throws error
// - no need for rollback;
// Handle errors in logger?
// - if wanted then the evolver should push errors to logger
// Advance function to return instance of store?
// Option to instantiate store with state
export function GeneralStore(state, handlers){
  var store = this;

  function advance(evolver){
    state = evolver(state);
  }

  this.advance = advance;

  function wrapHandler(handler){
    return function(){
      var args = Array.prototype.slice.call(arguments);
      state = handler.apply({}, [state].concat(args));
    };
  }

  for (var name in handlers) {
    this[name] = wrapHandler(handlers[name]);
  }

  Object.defineProperty(this, "state", {
    get: function(){ return state; }
  });

}

export function enhance(handlers){
  return {
    start: function(state){
      return new GeneralStore(state, handlers);
    }
  };
}

export function start(state){
  return new GeneralStore(state, {});
}
