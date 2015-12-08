function GeneralStore(): {
  advance: any;
  state: any;
};

function GeneralStore(){
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
