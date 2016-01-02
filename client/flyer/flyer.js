/* jshint esnext: true */

import * as State from "./state";
import Projection from "./projection";

export default function Flyer(world){
  if ( !(this instanceof Flyer) ) { return new Flyer(world); }
  var flyer = this;

  flyer.uplink = {
    transmitReading: function(reading){
    }
  };
  flyer.view = {
    render: function(){
      console.log("old view");
    }
  };

  var state;
  this.state = {
    uplinkStatus: "UNKNOWN"
  };
  function showcase(state){
    flyer.view.render(Projection(state));
  }
  function transmitReading(reading){
    flyer.uplink.transmitReading(reading);
  }
  function logInfo() {
    flyer.logger.info.apply(flyer.logger, arguments);
  }

  this.resetReadings = function(){
    state = State.resetReadings(state);
    logInfo("[Reset readings]");
    showcase(flyer.state);
  };
  this.newReading = function(reading){
    state = State.newReading(state, reading);
    transmitReading(reading);
    logInfo("[New reading]", reading);
    showcase(flyer.state);
  };
  this.uplinkAvailable = function(){
    flyer.state.uplinkStatus = "AVAILABLE";
    showcase(flyer.state);
  };
  this.uplinkFailed = function(){
    flyer.state.uplinkStatus = "FAILED";
    showcase(flyer.state);
  };
  this.startTransmitting = function(){
    // try {
    //   flyer.state.update("uplinkStatus", Uplink.startTransmitting)
    // } catch (e) {
    //   view.alert(uplink unavailable)
    // }
    flyer.state.uplinkStatus = "TRANSMITTING";
    showcase(flyer.state);
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
