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
import { round } from "./utils.ts";

Actions.resetReadings.register(store.resetReadings);

import * as AvionicsPresenter from "./avionics-presenter.ts";
function Display($root){
  var $flightTime = $root.querySelector("[data-hook~=flight-time]");
  var $maxAltitude = $root.querySelector("[data-hook~=max-altitude]");
  function render(presentation){
    $flightTime.innerHTML = presentation.maxFlightTime + "s";
    $maxAltitude.innerHTML = presentation.maxAltitude + "m";
  };
  return {
    update: function(store){
      var state = store.getState();
      var presenter = AvionicsPresenter.create(state);
      render(presenter);
    }
  };
}
import AvionicsInterface from "./avionics-interface.ts";

var App = {
  actions: Actions,
  store: store
};

function Avionics($root, world){
  var ui = new AvionicsInterface($root, world.actions);

  var display = Display($root);
  world.store.register(display.update);

  return {
    display: display,
    ui: ui
  };
};

import { ready } from "./dom.ts";
ready(function () {
  var $avionics = document.querySelector("[data-interface~=avionics]");
  var avionics = Avionics($avionics, App);
  // var avionicsInterface = new AvionicsInterface($avionics, Actions);
  // var display = Display($avionics);
  //
  // store.register(display.update);
});
