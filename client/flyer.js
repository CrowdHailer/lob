/* jshint esnext: true */

import Projection from "./flyer/projection";
import Reading from "./lib/reading";
import Audio from "./lib/Audio";
import FlyerState from './flyer/state'

export default function Flyer(state){
  if ( !(this instanceof Flyer) ) { return new Flyer(state); }
  state = FlyerState(state || {});

  var flyer = this;
  flyer.state = state;
  flyer.audio = new Audio();

  /* Keep track of when it appears a flight is starting
     and ending so that we can record the flights */
  var lastFlightCompleted = false;

  flyer.uplinkAvailable = function(channelName) {
    if (flyer.state.uplinkStatus === 'INCOMPATIBLE') { return; }

    flyer.state = flyer.state.merge({
      "uplinkStatus": "TRANSMITTING",
      "uplinkDetails": channelName
    });
    logInfo("Uplink available, transmission will resume", channelName);
    showcase(flyer.state);
  };

  flyer.uplinkFailed = function() {
    if (flyer.state.uplinkStatus === 'INCOMPATIBLE') { return; }

    flyer.state = flyer.state.set("uplinkStatus", "FAILED");
    showcase(flyer.state);
    logInfo("[Uplink Failed]");
  };

  flyer.uplinkDisconnected = function() {
    if (flyer.state.uplinkStatus === 'INCOMPATIBLE') { return; }

    flyer.state = flyer.state.set("uplinkStatus", "DISCONNECTED");
    showcase(flyer.state);
    logInfo("[Uplink Disconnected]");
  };

  flyer.newReading = function(raw) {
    raw.timestamp = Date.now();
    var reading = Reading(raw);

    if (isNaN(parseInt(raw.x))) {
      flyer.state = flyer.state.merge({
        "alert": "Accelerometer not found for this device. Please try again on a different mobile",
        "uplinkStatus": "INCOMPATIBLE"
      });
      showcase(flyer.state);
      return;
    }

    transmitReading(reading);
    flyer.view.renderPhoneMovement(raw);

    /* If flight has just completed, don't start a new one for 1.5s */
    if (lastFlightCompleted && (lastFlightCompleted.getTime() > new Date().getTime() - 1500)) {
      return;
    }

    var state = flyer.state.set("latestReading", reading);
    var currentFlight = state.currentFlight;
    var flightHistory = state.flightHistory;
    var flightCompleted = false;

    if (reading.magnitude < 4) {
      currentFlight.push(reading);
    } else if(currentFlight[0]) {
      flightHistory.push(currentFlight);
      currentFlight = [];
      flightCompleted = true;
      lastFlightCompleted = new Date();
    }

    state = state.set("currentFlight", currentFlight);
    state = state.set("flightHistory", flightHistory);
    flyer.state = state;

    if (flightCompleted) {
      /* Don't always update state UI for every movement cycle, hugely CPU intensive */
      showcase(state);
      this.audio.playDropSound();
    }
  };

  flyer.newOrientation = function(position) {
    position.timestamp = Date.now();
    transmitOrientation(position);
    flyer.view.renderPhoneOrientation(position);
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
  function transmitOrientation(position){
    if (flyer.state.uplinkStatus === "TRANSMITTING") {
      flyer.uplink.transmitOrientation(position);
    }
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
