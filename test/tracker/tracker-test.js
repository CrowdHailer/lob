/* jshint esnext: true */

import { createTranscriptLogger, createTranscriptFunction } from "../support";

import Tracker from "../../client/tracker/tracker";

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
      tracker.newReading(reading);
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
      tracker.newReading(reading);
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
  describe("responding to reset readings", function(){
    beforeEach(function(){
      tracker.resetReadings();
    });
    it("should clear latest reading", function(){
      expect(tracker.state.latestReading).toBe(null);
    });
    it("should clear current flight", function(){
      expect(tracker.state.currentFlight).toEqual([]);
    });
    it("should clear flight history", function(){
      expect(tracker.state.flightHistory).toEqual([]);
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
      tracker.newReading(reading);
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
      tracker.newReading(reading);
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
