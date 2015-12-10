/* jshint esnext: true */
import * as Event from "./framework/event";
import * as Logger from "./framework/logger";
import Store from "./store";

function Client(world){
  var logger = world.console;
  var events = {
    resetReadings: Event.start(Logger.wrap(logger, {prefix: "Reset readings"}))
  };

  var store = Store.start();
  store.resetReadings();

  this.resetReadings = function(){
    store.resetReadings();
    events.resetReadings();
  };
  this.newReading = function(reading){
    store.newReading(reading);
  };

  Object.defineProperty(this, "currentReading", {
    get: function(){
      return store.state.readings.current;
    }
  });

  Object.defineProperty(this, "currentFlight", {
    get: function(){
      return store.state.readings.currentFlight;
    }
  });
  Object.defineProperty(this, "flightHistory", {
    get: function(){
      return store.state.readings.flightHistory;
    }
  });
}

export function start(world){
  return new Client(world);
}
