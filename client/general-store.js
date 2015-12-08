/* jshint esnext: true */

// State will never be assigned if evolver throws error
// - no need for rollback;
// Handle errors in logger?
// - if wanted then the evolver should push errors to logger
// Advance function to return instance of store?
// Option to instantiate store with state
export function GeneralStore(){
  var store;
  var state = {};

  function advance(evolver){
    state = evolver(state);
  }

  store = {
    advance: advance
  };

  Object.defineProperty(store, "state", {
    get: function(){ return state; }
  });

  return store;
}

export default GeneralStore;
