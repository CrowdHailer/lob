/* jshint esnext: true */

import { createTranscriptLogger, createTranscriptFunction } from "../support";

import Struct from "../../client/carbide/struct";
var STATE_DEFAULTS = {
  uplinkStatus: "UNKNOWN"
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
    logInfo("[Uplink Available]");
  };
}

describe("Tracker with unknown uplink status", function(){
  var tracker, logger;
  beforeEach(function(){
    tracker = new Tracker({uplinkStatus: "UNKNOWN"});
    tracker.logger = createTranscriptLogger();
  });
  describe("responding to uplinkAvailable", function(){
    beforeEach(function(){
      tracker.uplinkAvailable();
    });
    it("should have uplink status available", function(){
      expect(tracker.state.uplinkStatus).toBe("AVAILABLE");
    });
    it("should have reported the change as info", function(){
      expect(tracker.logger.info.lastCall).toEqual(["[Uplink Available]"]);
    });
  });
});
