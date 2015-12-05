console.log("Starting boot ...");

import * as Action from "./action.ts";
import * as Logger from "./logger.ts";

var Actions = {
  newReading: Action.create(function(a: any){ return a; }, Logger.create("New Reading")),
  resetReadings: Action.create(function(){ null; }, Logger.create("Reset")),
  submitFlightLog: Action.create(function(){ null; }, Logger.create("Submit Flight log")),
  failedConnection: Action.create(function(reason: any){ return reason; }, Logger.create("Failed Connection")),
};

import AvionicsInterface from "./avionics-interface.ts";

import { ready } from "./dom.ts";
ready(function () {
  var $avionics = document.querySelector("[data-interface~=avionics]");
  var avionicsInterface = new AvionicsInterface($avionics, Actions);
});

import * as Dispatcher from "./dispatcher.ts";
import * as State from "./state.ts";

function StateStore(){
  var state;
  var logger = Logger.create("State Store");
  logger.error = function(e){ throw e; };
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
    }
  };

  return store;
}


export default Actions;
export var store = StateStore();

store.resetReadings();
import { round } from "./utils.ts";

Actions.resetReadings.register(store.resetReadings);

import * as AvionicsPresenter from "./avionics-presenter.ts";
function Display($root){
  var presenter;
  function render(){
    null;
  };
  return {
    update: function(store){
      var state = store.getState();
      presenter = AvionicsPresenter.create(state);
    }
  };
}

var display = Display(null);

store.register(display.update);
