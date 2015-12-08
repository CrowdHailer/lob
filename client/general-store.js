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

GeneralStore.addReducer = function(name, handler){
  this.prototype[name] = function(event){
    var args = Array.prototype.slice.call(arguments);
    this.advance(function(state){
      return handler.apply({}, [state].concat(args));
    });
    return this;
  };
};

export function create(state){
  return new GeneralStore(state);
}
export default create;

export function factory(reducers){
  var Constructor = function my(initialState){
    GeneralStore.call(this, initialState);
  };

  for (var name in reducers) {
    GeneralStore.addReducer.call(Constructor, name, reducers[name]);
  }

  return function(initialState){
    return new Constructor(initialState);
  };
}
