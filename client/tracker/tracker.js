/* jshint esnext: true */

import State from "./state";

function isInFlight(reading){
  // DEBT magic number
  return reading.magnitude < 4;
}

function lastInArray(array){
  return array[array.length - 1];
}

function lastNInArray(n, array){
  return array.slice(Math.max(array.length - n, 0));
}

var TRACKER_INVALID_STATE_MESSAGE = "Tracker did not recieve valid initial state";

function Tracker(state, world){
  if ( !(this instanceof Tracker) ) { return new Tracker(state, world); }
  try {
    state = State(state || {});
  } catch (e) {
    // alert(e); DEBT throws in tests
    throw new TypeError(TRACKER_INVALID_STATE_MESSAGE);
    // return; // Will be needed if we move the error handling to logger
  }
  var tracker = this;
  tracker.state = state;
  // DEBT return to external assignment
  world = world || {};
  tracker.logger = world.logger // Or error causing of silent version;

  tracker.uplinkAvailable = function(channelName){
    // Set state action can cause projection to exhibit new state
    tracker.state = tracker.state.set("uplinkStatus", "AVAILABLE");
    tracker.state = tracker.state.set("uplinkChannelName", channelName);
    // call log change. test listeners that the state has changed.
    logInfo("Uplink available on channel:", channelName);
    showcase(tracker.state);
  };

  tracker.uplinkFailed = function(err){
    console.log(err);
    // Set state action can cause projection to exhibit new state
    tracker.state = tracker.state.set("uplinkStatus", "FAILED");
    // tracker.state = tracker.state.set("uplinkChannelName", channelName);
    // // call log change. test listeners that the state has changed.
    logInfo("Uplink failed to connect", err);
    showcase(tracker.state);
  };

  tracker.newReading = function(reading){
    var wasInFlight = lastInArray(tracker.state.liveFlight) && isInFlight(lastInArray(tracker.state.liveFlight));
    var isNowGrounded = !isInFlight(reading);
    if (wasInFlight && isNowGrounded) {
      setTimeout(function () {
        console.log('pause the reading');
        // pause the reading
      }, 1000);
    }

    var state = tracker.state.update("liveFlight", function(readings){
      readings = readings.concat(reading);
      return lastNInArray(5, readings);
    });
    // simplest is to just start timer
    // here to add timer controller
    tracker.state = state; // Assign at end to work as transaction
    showcase(state);
    logEvent("New reading");
  };

  tracker.takeSnapshot = function(){
    // Only if not locked live
    // Only if current flight has content
    var state = tracker.state.set('flightSnapshot', tracker.state.liveFlight);
    // ONLY if in tracking flight status
    var state = tracker.state.set('flightOutputStatus', 'HOLDING_SNAPSHOT');

    tracker.state = state; // Assign at end to work as transaction
    showcase(state);
    logEvent("Taken snapshot");
  };

  tracker.watchLiveTracking = function(){
    var state = tracker.state.set('flightOutputStatus', 'FOLLOWING_FLIGHT');

    tracker.state = state;
    showcase(state);
    logEvent("Watching live tracking");
  };
  tracker.lockLiveTracking = function(){
    console.warn("try to lock live tracking");
  };
  tracker.unlockLiveTracking = function(){
    console.warn("try to unlock live tracking");
  };

  // watchlivetracking
  // locklivetracking
  // unlocklivetracking
  function logEvent() {
    tracker.logger.debug.apply(tracker.logger, arguments);
  }
  function logInfo() {
    tracker.logger.info.apply(tracker.logger, arguments);
  }
  function showcase(state) {
    tracker.showcase.update(state);
  }

  function projectState(state){
    return state;
  }

  // The tracker application has an internal state.
  // All observers know that the can watch a given projection of that state
  // project and present overloaded verbs.
  // options showcase or exhibit
  // function showcase(state){
  //   // The tracker just cares that its state is shown somewhere
  //   tracker.showcase.dispatch(state);
  // }



  tracker.resetReadings = function(){
  };
}

export default Tracker;
