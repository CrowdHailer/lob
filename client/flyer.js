/* jshint esnext: true */

import Projection from "./flyer/projection";
import Reading from "./lib/reading";
import FlyerState from './flyer/state'

export default function Flyer(state){
  if ( !(this instanceof Flyer) ) { return new Flyer(state); }
  state = FlyerState(state || {});

  var flyer = this;
  flyer.state = state;

  flyer.uplinkAvailable = function(details){
    flyer.state = flyer.state.merge({
      "uplinkStatus": "AVAILABLE",
      "uplinkDetails": details
    });
    logInfo("Uplink Available", details);
    showcase(flyer.state);
  };
  this.startTransmitting = function(){
    // TODO test and handle case when uplink not available.
    flyer.state = flyer.state.set("uplinkStatus", "TRANSMITTING");
    showcase(flyer.state);
  };
  flyer.newReading = function(raw){
    try {
      raw.timestamp = Date.now();
      var reading = Reading(raw);
      var state = flyer.state.set("latestReading", reading);
      var currentFlight = state.currentFlight;
      var flightHistory = state.flightHistory;
      if (reading.magnitude < 4) {
        currentFlight =  currentFlight.concat(reading);
      } else if(currentFlight[0]) {
        // DEBT concat splits array so we double wrap the flight
        flightHistory = flightHistory.concat([currentFlight]);
        currentFlight = [];
      }
      state = state.set("currentFlight", currentFlight);
      state = state.set("flightHistory", flightHistory);
      flyer.state = state;
      transmitReading(reading);
    } catch (err) {
      // Debt change to invalid reading
      if (err instanceof TypeError) {
        flyer.state = flyer.state.set("alert", "Accelerometer not found for this device. Please try again on a different mobile");
        showcase(flyer.state);
        logInfo("Bad reading", raw); // Untested
      } else {
        throw err;
      }
    }
    // logInfo("[New reading]", reading); DONT log this
    showcase(flyer.state);
  };
  flyer.resetReadings = function(){
    flyer.state = flyer.state.merge({
      latestReading: null,
      currentFlight: [],
      flightHistory: []
    });
    // transmit
    transmitResetReadings();
    showcase(flyer.state); // Untested
    logInfo("Reset readings"); // Untested
  };

  flyer.uplinkFailed = function(){
    flyer.state = flyer.state.set("uplinkStatus", "FAILED");
    showcase(flyer.state);
    logInfo("[Uplink Failed]");
  };

  flyer.updateIdentity = function(newIdentity){
    flyer.state = flyer.state.set('identity', newIdentity);
    logInfo('Updated identity', newIdentity);
    transmitIdentity(newIdentity);
    localStorage.setItem('lobIdentity', newIdentity);
    showcase(flyer.state);
  }

  flyer.closeAlert = function(){
    // DEBT untested
    flyer.state = flyer.state.set("alert", "");
    showcase(flyer.state);
    logInfo("Alert closed");
  };

  // DEBT what to do before other values are set
  function transmitReading(reading){
    if (flyer.state.uplinkStatus === "TRANSMITTING") {
      flyer.uplink.transmitReading(reading);
    }
  }
  function transmitResetReadings(){
    if (flyer.state.uplinkStatus === "TRANSMITTING") {
      flyer.uplink.transmitResetReadings();
    }
  }
  function transmitIdentity(identity){
    flyer.uplink.transmitIdentity(identity);
  }
  function showcase(state){
    flyer.view.render(Projection(state));
  }
  function logInfo() {
    flyer.logger.info.apply(flyer.logger, arguments);
  }
  // DEBT should be set separatly for Testing
  flyer.clock = window.Date;
}
Flyer.State = FlyerState;
