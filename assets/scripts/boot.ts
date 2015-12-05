console.log("Starting boot ...");

import * as Action from "./action.ts";
import * as Logger from "./logger.ts";

var Actions = {
  newReading: Action.create(function(a: any){ return a; }, Logger.create("New Reading")),
  reset: Action.create(function(){ null; }, Logger.create("Reset")),
  submitFlightLog: Action.create(function(){ null; }, Logger.create("Submit Flight log")),
  failedConnection: Action.create(function(reason: any){ return reason; }, Logger.create("Failed Connection")),
};
import * as Dispatcher from "./dispatcher.ts";
import * as State from "./state.ts";

function StateStore(){
  var state;
  var dispatcher = Dispatcher.create();

  function dispatch(store){
    dispatcher.dispatch(store);
  }

  return {
    reset: function(){
      state = State.handleReset(state);
      dispatch(this);
    },
    newReading: function(reading){
      state = State.handleNewReading(reading, state);
      dispatch(this);
    },
    getState: function(){
      return state;
    },
    register: function(callback){
      dispatcher = dispatcher.register(callback);
    }
  };
}

export default Actions;
export var store = StateStore();
