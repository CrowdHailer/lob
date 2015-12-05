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

  return {
    resetReadings: function(){
      state = State.handleReset(state);
      dispatch(this);
      return this;
    },
    newReading: function(reading){
      state = State.handleNewReading(reading, state);
      dispatch(this);
      return this;
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

store.resetReadings();
import { round } from "./utils.ts";

Actions.resetReadings.register(store.resetReadings);

function AvionicsPresenter(state){
  var state = state.getState();
  return Object.create({},{
    flightTime: {
      get: function(){
        var flights = state.flightRecords.concat([state.currentFlightReadings]);
        var flightDurations = flights.map(function(flightRecord){
          var last = flightRecord.length;
          var t0 = flightRecord[0].timestamp;
          var t1 = flightRecord[last - 1].timestamp;
          return (t1 + 250 - t0) / 1000;
        });
        var flightDuration = Math.max.apply(null, flightDurations);
        return Math.max(0, flightDuration);
      }
    },
    maxAltitude: {
      get: function(){
        // Altitude Calculation

        // SUVAT
        // s = vt - 0.5 * a * t^2
        // input
        // s = s <- desired result
        // u = ? <- not needed
        // v = 0 <- stationary at top
        // a = - 9.81 <- local g
        // t = flightTime/2 time to top of arc

        // s = 9.81 * 1/8 t^2

        var flights = state.flightRecords;
        console.log(flights);
        var flightDurations = flights.map(function(flightRecord){
          var last = flightRecord.length;
          console.log("flightRecord", flightRecord)
          var t0 = flightRecord[0].timestamp;
          var t1 = flightRecord[last - 1].timestamp;
          return (t1 + 250 - t0) / 1000;
        });
        var flightDuration = Math.max.apply(null, flightDurations);
        flightDuration =  Math.max(0, flightDuration);
        var t = flightDuration;
        return round(2)(9.81/8 * t * t);
      }
    }
  });
}

function Display($root){
  var presenter;
  function render(){
    null;
  };
  return {
    update: function(state){
      presenter = AvionicsPresenter(state);
      console.log("p", presenter);
      console.log("ft", presenter.flightTime);
      console.log(presenter.maxAltitude);
    }
  };
}

var display = Display(null);

store.register(display.update);
