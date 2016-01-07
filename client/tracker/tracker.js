/* jshint esnext: true */

import State from "./state";

function Tracker(raw_state){
  var tracker = this;
  tracker.state = State(raw_state);

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

  tracker.uplinkAvailable = function(){
    // Set state action can cause projection to exhibit new state
    tracker.state = tracker.state.set("uplinkStatus", "AVAILABLE");
    // call log change. test listeners that the state has changed.
    logInfo("[Uplink Available]");
    showcase(tracker.state);
  };

  tracker.newReading = function(reading){
  };

  tracker.resetReadings = function(){
  };
}

export default Tracker;
