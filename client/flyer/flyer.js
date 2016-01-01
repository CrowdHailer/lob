/* jshint esnext: true */

import * as State from "./state";

export default function Flyer(world){
  if ( !(this instanceof Flyer) ) { return new Flyer(world); }
  var flyer = this;

  var state;
  function logInfo() {
    flyer.logger.info.apply(flyer.logger, arguments);
  }

  this.resetReadings = function(){
    state = State.resetReadings(state);
    logInfo("[Reset readings]");
  };
  this.newReading = function(reading){
    state = State.newReading(state, reading);
    logInfo("[New reading]", reading);
  };

  // DEBT these properties belong on a projection
  Object.defineProperty(this, "currentReading", {
    get: function(){
      var readings = state.readings || {};
      return readings.current;
    }
  });
  Object.defineProperty(this, "currentFlight", {
    get: function(){
      var readings = state.readings || {};
      return readings.currentFlight || [];
    }
  });
  Object.defineProperty(this, "flightHistory", {
    get: function(){
      var readings = state.readings || {};
      return readings.flightHistory || [];
    }
  });
}
