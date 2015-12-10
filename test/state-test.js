/* jshint esnext: true */

import * as State from "../client/state";
import { freefallReading, stationaryReading } from "./support.js";

describe("Random State", function(){
  var state, oldState;
  beforeEach(function(){
    oldState = {readings: "anything", other: "app state"};
  });

  describe("after reset readings", function(){
    beforeEach(function(){
      state = State.resetReadings(oldState);
    });
    it("should not have a current value", function(){
      expect(state.readings.current).toBe(null);
    });
    it("should have an empty current flight", function(){
      expect(state.readings.currentFlight).toEqual([]);
    });
    it("should have an empty flight history", function(){
      expect(state.readings.flightHistory).toEqual([]);
    });
    it("should leave the remaining app state intact", function(){
      expect(state.other).toEqual("app state");
    });
  });
});

describe("Grounded State", function(){
  var state, oldState;
  beforeEach(function(){
    oldState = {
      readings: {
        current: {acceleration: {x: 0, y: 0, z: 10}, timestamp: 1600},
        currentFlight: [],
        flightHistory: [
          {acceleration: {x: 0, y: 0, z: 0}, timestamp: 1000},
          {acceleration: {x: 0, y: 0, z: 0}, timestamp: 1200},
          {acceleration: {x: 0, y: 0, z: 0}, timestamp: 1400}
        ]
      },
      other: "app state"
    };
  });

  describe("after new grounded reading", function(){
    var reading = {acceleration: {x: 0, y: 0, z: 10}, timestamp: 1800};
    beforeEach(function(){
      state = State.newReading(oldState, reading);
    });
    it("should have new current value", function(){
      expect(state.readings.current).toBe(reading);
    });
    it("should have an empty current flight", function(){
      expect(state.readings.currentFlight).toEqual([]);
    });
    it("should have existing flight history", function(){
      expect(state.readings.flightHistory).toEqual(oldState.readings.flightHistory);
    });
    it("should leave the remaining app state intact", function(){
      expect(state.other).toEqual("app state");
    });
  });

});

describe("Flying State", function(){
  var state, oldState;
  beforeEach(function(){
    oldState = {
      readings: {
        current: {acceleration: {x: 0, y: 0, z: 0}, timestamp: 1400},
        currentFlight: [
          {acceleration: {x: 0, y: 0, z: 0}, timestamp: 1000},
          {acceleration: {x: 0, y: 0, z: 0}, timestamp: 1200},
          {acceleration: {x: 0, y: 0, z: 0}, timestamp: 1400}
        ],
        flightHistory: []
      },
      other: "app state"
    };
  });

  describe("after new grounded reading", function(){
    var reading = {acceleration: {x: 0, y: 0, z: 10}, timestamp: 1600};
    beforeEach(function(){
      state = State.newReading(oldState, reading);
    });
    it("should have new current value", function(){
      expect(state.readings.current).toBe(reading);
    });
    it("should have an empty current flight", function(){
      expect(state.readings.currentFlight).toEqual([]);
    });
    it("should have new flight in history", function(){
      expect(state.readings.flightHistory[0]).toEqual(oldState.readings.currentFlight);
    });
    it("should leave the remaining app state intact", function(){
      expect(state.other).toEqual("app state");
    });
  });

  describe("after new flying reading", function(){
    var reading = {acceleration: {x: 0, y: 0, z: 0}, timestamp: 1600};
    beforeEach(function(){
      state = State.newReading(oldState, reading);
    });
    it("should have new current value", function(){
      expect(state.readings.current).toBe(reading);
    });
    it("should add reading to currentFlight", function(){
      expect(state.readings.currentFlight).toEqual(oldState.readings.currentFlight.concat(reading));
    });
    it("should have existing flight history", function(){
      expect(state.readings.flightHistory).toEqual(oldState.readings.flightHistory);
    });
    it("should leave the remaining app state intact", function(){
      expect(state.other).toEqual("app state");
    });
  });

});
