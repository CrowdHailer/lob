/* jshint esnext: true */
import * as Event from "./framework/event";
import * as Logger from "./framework/logger";

function Client(world){
  var console = world.console;
  var events = {
    resetReadings: Event.start(Logger.wrap(world.console, {prefix: "Reset readings"}))
  };

  this.resetReadings = function(){
    events.resetReadings();
  };

  Object.defineProperty(this, "currentReading", {
    get: function(){
      return null;
    }
  });

  Object.defineProperty(this, "currentFlight", {
    get: function(){
      return [];
    }
  });
  Object.defineProperty(this, "flightHistory", {
    get: function(){
      return [];
    }
  });
}

export function start(world){
  return new Client(world);
}
