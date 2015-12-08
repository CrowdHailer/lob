/* jshint esnext: true */

// State will never be assigned if evolver throws error
// - no need for rollback;
// Handle errors in logger?
// - if wanted then the evolver should push errors to logger
// Advance function to return instance of store?
// Option to instantiate store with state
export function GeneralStore(state){

  this.advance = function(evolver){
    state = evolver(state);
    return this;
  };

  Object.defineProperty(this, "state", {
    get: function(){ return state; }
  });
}

export function create(state){
  return new GeneralStore(state);
}
export default create;

export function factory(reducers){
  var Constructor = function(state){
    GeneralStore.call(this, state);
  };

  var handlers = Object.keys(reducers);
  for (var i = 0; i < handlers.length; i++) {
    var handler = handlers[i];
    var reducer = reducers[handler];
    Constructor.prototype[handler] = function(){
      var args = Array.prototype.slice.call(arguments);
      var partial = function(state){
        return reducer.apply({}, args.concat(state));
      };
      this.advance(partial);
    };
  };

  return function(x){
    return new Constructor(x);
  };
}
