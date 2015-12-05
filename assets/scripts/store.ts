import * as Dispatcher from "./dispatcher.ts";
import * as State from "./state.ts";
import { DefaultLogger } from "./logger.ts";

function StateStore(logger=DefaultLogger){
  var state;
  var dispatcher = Dispatcher.create(logger);

  function dispatch(store){
    dispatcher.dispatch(store);
  }

  var store = {
    resetReadings: function(){
      state = State.handleReset(state);
      dispatch(store);
      return store;
    },
    newReading: function(reading){
      state = State.handleNewReading(reading, state);
      dispatch(store);
      return store;
    },
    getState: function(){
      return state;
    },
    register: function(callback){
      dispatcher = dispatcher.register(callback);
      dispatch(store);
      return store;
    }
  };

  return store;
}

export default StateStore;
