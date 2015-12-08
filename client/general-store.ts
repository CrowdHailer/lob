export interface GeneralStore<State> {
  advance: (evolver: (a: State) => State) => any;
  state: State;
}
export function GeneralStore<State>(): GeneralStore<State>

// State will never be assigned if evolver throws error
// - no need for rollback;
// Handle errors in logger?
// - if wanted then the evolver should push errors to logger
// Advance function to return instance of store?
// Option to instantiate store with state
export function GeneralStore(){
  var store: any;
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

export default GeneralStore
