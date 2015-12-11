/* jshint esnext: true */
import * as Event from "./framework/event";
import * as Logger from "./framework/logger";
import Store from "./store";

function Client(world){
  var logger = world.console;
  var events = {
    resetReadings: Event.start(Logger.wrap(logger, {prefix: "Reset readings"})),
    newReading: Event.start(Logger.wrap(logger, {prefix: "New reading"})),
    badReading: Event.start(Logger.wrap(logger, {prefix: "Bad reading"}))
  };

  var store = Store.start();
  events.resetReadings.register(store.resetReadings);
  events.newReading.register(store.newReading);
  events.badReading.register(store.badReading);

  this.resetReadings = function(){
    events.resetReadings();
  };
  this.onResetReadings = function(listener){
    events.resetReadings.register(listener);
  };
  this.newReading = function(reading){
    // Validate here
    events.newReading(reading);
  };
  this.onNewReading = function(listener){
    events.newReading.register(listener);
  };
  this.badReading = function(){
    events.badReading();
  };
  this.onBadReading = function(listener){
    events.badReading.register(listener);
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
  Object.defineProperty(this, "notices", {
    get: function(){
      return store.state.notices;
    }
  });
  // events.resetReadings();
}

export function start(world){
  return new Client(world);
}
