/* jshint esnext: true */

import * as State from "../client/state";
import { freefallReading, stationaryReading } from "./support.js";

describe("Client State", function(){
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

  // xdescribe("new reading", function(){
  //   it("should add reading as currentReading", function(){
  //     var reading = stationaryReading();
  //     var newState = State.handleNewReading(reading, State.DEFAULT);
  //
  //     expect(newState.currentReading).toEqual(reading);
  //     expect(newState.currentFlightReadings).toEqual([]);
  //     expect(newState.flightRecords).toEqual([]);
  //   });
  //
  //   it("should add to current flight if in freefall", function(){
  //     var reading = freefallReading();
  //     var newState = State.handleNewReading(reading, State.DEFAULT);
  //     expect(newState.currentFlightReadings[0]).toEqual(reading);
  //   });
  //
  //   it("should should move current flight to past flightS", function(){
  //     var readings = [freefallReading(), freefallReading()];
  //     var reading = stationaryReading();
  //     var state = {
  //       currentFlightReadings: readings,
  //       flightRecords: [],
  //       currentReading: null
  //     };
  //     var newState = State.handleNewReading(reading, state);
  //     expect(newState.currentFlightReadings).toEqual([]);
  //     expect(newState.flightRecords[0]).toEqual(readings);
  //   });
  // });
});
