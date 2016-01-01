/* jshint esnext: true */

import Struct from "../carbide/struct";
var STATE_DEFAULTS = {
  uplinkStatus: "UNKNOWN",
  latestReading: null, // DEBT best place a null object here
  currentFlight: [],
  flightHistory: [],
};
function State(raw){
  if ( !(this instanceof State) ) { return new State(raw); }

  return Struct.call(this, STATE_DEFAULTS, raw);
}

State.prototype = Object.create(Struct.prototype);
State.prototype.constructor = State;

function Tracker(raw_state){
  var tracker = this;
  tracker.state = State(raw_state);

  function logInfo() {
    tracker.logger.info.apply(tracker.logger, arguments);
  }

  tracker.uplinkAvailable = function(){
    tracker.state = tracker.state.set("uplinkStatus", "AVAILABLE");
    // call log change. test listeners that the state has changed.
    logInfo("[Uplink Available]");
  };

  tracker.newReading = function(reading){
    var state = tracker.state.set("latestReading", reading);
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
    tracker.state = state;
    // DEBT might want to log this action too
  };

  tracker.resetReadings = function(){
    tracker.state = tracker.state.merge({
      latestReading: null,
      currentFlight: [],
      flightHistory: []
    });
  };
}

export default Tracker;
