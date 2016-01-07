/* jshint esnext: true */

import State from "./state";

var TRACKER_INVALID_STATE_MESSAGE = "Tracker did not recieve valid initial state";

function Tracker(state){
  if ( !(this instanceof Tracker) ) { return new Tracker(state); }
  try {
    state = State(state || {});
  } catch (e) {
    // alert(e); DEBT throws in tests
    throw new TypeError(TRACKER_INVALID_STATE_MESSAGE);
    // return; // Will be needed if we move the error handling to logger
  }
  var tracker = this;
  tracker.state = state;

  tracker.uplinkAvailable = function(){
    // Set state action can cause projection to exhibit new state
    tracker.state = tracker.state.set("uplinkStatus", "AVAILABLE");
    // call log change. test listeners that the state has changed.
    logInfo("[Uplink Available]");
    showcase(tracker.state);
  };

  tracker.newReading = function(reading){
    var state = tracker.state.update("liveFlight", function(readings){
      return readings.concat(reading);
    });

    tracker.state = state; // Assign at end to work as transaction
  };
  function logInfo() {
    tracker.logger.info.apply(tracker.logger, arguments);
  }

  function projectState(state){
    return state;
  }
  var view;
  tracker.showcase = {
    dispatch: function(state){
      // var projection = new Projection(state);
      if(view){
        view(projectState(state));
      }
    },
    register: function(newView){
      newView(projectState(tracker.state));
      view = newView;
    }
  };

  // The tracker application has an internal state.
  // All observers know that the can watch a given projection of that state
  // project and present overloaded verbs.
  // options showcase or exhibit
  function showcase(state){
    // The tracker just cares that its state is shown somewhere
    tracker.showcase.dispatch(state);
  }



  tracker.resetReadings = function(){
  };
}

export default Tracker;
