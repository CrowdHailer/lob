console.log("Starting boot ...");

import * as Action from "./action.ts";
import * as Logger from "./logger.ts";

var Actions = {
  newReading: Action.create(function(a: any){ return a; }, Logger.create("New Reading")),
  resetReadings: Action.create(function(){ null; }, Logger.create("Reset")),
  submitFlightLog: Action.create(function(){ null; }, Logger.create("Submit Flight log")),
  failedConnection: Action.create(function(reason: any){ return reason; }, Logger.create("Failed Connection")),
};

import * as Dispatcher from "./dispatcher.ts";
import * as State from "./state.ts";

function StateStore(logger){
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


export default Actions;
var logger = Logger.create("State Store");
export var store = StateStore(logger);

store.resetReadings();

Actions.resetReadings.register(store.resetReadings);


var App = {
  actions: Actions,
  store: store
};

import Avionics from "./avionics/component.ts";
import { ready } from "./dom.ts";
ready(function () {
  var $avionics = document.querySelector("[data-interface~=avionics]");
  var avionics = Avionics($avionics, App);
});
