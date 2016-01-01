/* jshint esnext: true */

import * as State from "./state";

export default function Flyer(world){
  if ( !(this instanceof Flyer) ) { return new Flyer(world); }
  var flyer = this;

  flyer.uplink = {
    transmitReading: function(reading){
    }
  };

  var state;
  this.state = {
    uplinkStatus: "UNKNOWN"
  };
  function logInfo() {
    flyer.logger.info.apply(flyer.logger, arguments);
  }
  function transmitReading(reading){
    flyer.uplink.transmitReading(reading);
  }

  this.resetReadings = function(){
    state = State.resetReadings(state);
    logInfo("[Reset readings]");
  };
  this.newReading = function(reading){
    state = State.newReading(state, reading);
    transmitReading(reading);
    logInfo("[New reading]", reading);
  };
  this.uplinkAvailable = function(){
    flyer.state.uplinkStatus = "AVAILABLE";
  };
  this.uplinkFailed = function(){
    flyer.state.uplinkStatus = "FAILED";
  };
  this.startTransmitting = function(){
    flyer.state.uplinkStatus = "TRANSMITTING";
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
