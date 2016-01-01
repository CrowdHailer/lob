/* jshint esnext: true */

import { createTranscriptLogger, createTranscriptFunction } from "../support";

import Struct from "../../client/carbide/struct";
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

  tracker.newReadingReceived = function(reading){
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

describe("Tracker currently tracking flight", function(){
  var tracker, logger;
  beforeEach(function(){
    tracker = new Tracker({
      uplinkStatus: "AVAILABLE",
      currentFlight: [{}],
      flightHistory: [{}],
    });
    tracker.logger = createTranscriptLogger();
  });
  describe("responding to new freefall reading", function(){
    var reading;
    beforeEach(function(){
      reading = {magnitude: 0};
      tracker.newReadingReceived(reading);
    });
    it("should replace latest reading", function(){
      expect(tracker.state.latestReading).toBe(reading);
    });
    it("should add reading to current flight", function(){
      expect(tracker.state.currentFlight[1]).toEqual(reading);
    });
  });
  describe("responding to new grounded reading", function(){
    var reading;
    beforeEach(function(){
      reading = {};
      tracker.newReadingReceived(reading);
    });
    // it("should replace latest reading", function(){
    //   expect(tracker.state.latestReading).toBe(reading);
    // });
    it("should clear current flight", function(){
      expect(tracker.state.currentFlight).toEqual([]);
    });
    it("should add current flight to flight history", function(){
      expect(tracker.state.flightHistory[1]).toEqual([{}]);
    });
  });
});

describe("Tracker currently tracking grounded flyer", function(){
  var tracker, logger;
  beforeEach(function(){
    tracker = new Tracker({
      uplinkStatus: "AVAILABLE",
      currentFlight: [],
      flightHistory: [{}],
    });
    tracker.logger = createTranscriptLogger();
  });
  describe("responding to new freefall reading", function(){
    var reading;
    beforeEach(function(){
      reading = {magnitude: 0};
      tracker.newReadingReceived(reading);
    });
    // it("should replace latest reading", function(){
    //   expect(tracker.state.latestReading).toBe(reading);
    // });
    // it("should add reading to current flight", function(){
    //   expect(tracker.state.currentFlight[1]).toEqual(reading);
    // });
  });
  describe("responding to new grounded reading", function(){
    var reading;
    beforeEach(function(){
      reading = {};
      tracker.newReadingReceived(reading);
    });
    // it("should replace latest reading", function(){
    //   expect(tracker.state.latestReading).toBe(reading);
    // });
    // it("should clear current flight", function(){
    //   expect(tracker.state.currentFlight).toEqual([]);
    // });
    it("should not add current flight to flight history", function(){
      expect(tracker.state.flightHistory[1]).toEqual(undefined);
    });
  });
});
