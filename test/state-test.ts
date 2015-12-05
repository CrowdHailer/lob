import * as State from "../assets/scripts/state.ts";
import { freefallReading, stationaryReading } from "./support.ts";

describe("State", function(){
  describe("reset", function(){
    it("should return initial state if given undefined state", function(){
      var newState = State.handleReset(undefined);
      expect(newState.currentFlightReadings).toEqual([]);
      expect(newState.currentReading).toEqual(null);
      expect(newState.flightRecords).toEqual([]);
    });
  });

  describe("new reading", function(){
    it("should add reading as currentReading", function(){
      var reading = stationaryReading();
      var newState = State.handleNewReading(reading, State.DEFAULT);

      expect(newState.currentReading).toEqual(reading);
      expect(newState.currentFlightReadings).toEqual([]);
      expect(newState.flightRecords).toEqual([]);
    });

    it("should add to current flight if in freefall", function(){
      var reading = freefallReading();
      var newState = State.handleNewReading(reading, State.DEFAULT);
      expect(newState.currentFlightReadings[0]).toEqual(reading);
    });

    xit("should should move current flight to past flightS", function(){
      var readings = [freefallReading(), freefallReading()];
      var reading = stationaryReading();
      var state = State.DEFAULT;
      state.currentFlightReadings = readings;
      var newState = State.handleNewReading(reading, state);
      expect(newState.currentFlightReadings).toEqual([]);
      expect(newState.flightRecords[0]).toEqual(readings);
    });
  });
});
