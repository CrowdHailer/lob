/* jshint esnext: true */

// import * as State from "./state";
import Projection from "./projection";
import Reading from "../lib/reading";

import Struct from "../carbide/struct";

var FLYER_STATE_DEFAULTS = {
  uplinkStatus: "UNKNOWN",
  uplinkDetails: {},
  latestReading: null, // DEBT best place a null object here
  currentFlight: [],
  flightHistory: [],
  alert: ""
};
// DEBT not quite sure why this can't just be named state;
function FlyerState(raw){
  if ( !(this instanceof FlyerState) ) { return new FlyerState(raw); }

  // DEBT with return statement is not an instance of FlyerState.
  // without return statement does not work at all.
  return Struct.call(this, FLYER_STATE_DEFAULTS, raw);
}

FlyerState.prototype = Object.create(Struct.prototype);
FlyerState.prototype.constructor = FlyerState;

var INVALID_STATE_MESSAGE = "Flyer did not recieve valid initial state";

export default function Flyer(state){
  if ( !(this instanceof Flyer) ) { return new Flyer(state); }
  try {
    state = FlyerState(state || {});
  } catch (e) {
    throw new TypeError(INVALID_STATE_MESSAGE);
  }

  var flyer = this;
  flyer.state = state;

  flyer.uplinkAvailable = function(details){
    // Set state action can cause projection to exhibit new state
    flyer.state = flyer.state.set("uplinkStatus", "AVAILABLE");
    flyer.state = flyer.state.set("uplinkDetails", details);
    // call log change. test listeners that the state has changed.
    // stateChange({state: state, action: "Uplink Available", log: debug});
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
      var reading = Reading(raw, flyer.clock);
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
    logInfo("[Reset readings]"); // Untested
    showcase(flyer.state); // Untested
  };

  flyer.uplinkFailed = function(){
    flyer.state = flyer.state.set("uplinkStatus", "FAILED");
    showcase(flyer.state);
    logInfo("[Uplink Failed]");
  };

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
