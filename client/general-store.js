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
