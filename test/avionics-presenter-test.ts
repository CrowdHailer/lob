import * as State from "../assets/scripts/state.ts";
import { freefallReading, stationaryReading } from "./support.ts";
import * as AvionicsPresenter from "../assets/scripts/avionics/presenter.ts";

describe("Avionics AvionicsPresenter", function(){
  describe("default state", function (){
    var state = State.DEFAULT;
    var presenter = AvionicsPresenter.create(state);
    it("should have a maxFlightTime of 0", function(){
      expect(presenter.maxFlightTime).toBe(0);
    });
    it("should have a maxAltitude of 0", function(){
      expect(presenter.maxAltitude).toBe(0);
    });
    it("should have a current Reading of waiting", function(){
      expect(presenter.currentReading).toEqual("Waiting.")
    });
  });

  describe("in early flight state", function(){
    var reading = freefallReading()
    var state = {
      currentFlightReadings: [reading],
      flightRecords: [],
      currentReading: reading
    };
    var presenter = AvionicsPresenter.create(state);
    it("should have a maxFlightTime of .250", function(){
      expect(presenter.maxFlightTime).toBe(0.250);
    });
    it("should have a maxAltitude of 0", function(){
      expect(presenter.maxAltitude).toBe(0);
    });
    it("should have a current Reading of with details", function(){
      expect(presenter.currentReading).toEqual("[00.00, 00.00, -1.00]")
    });
  });
  describe("in mid flight state", function(){
    var state = {
      currentFlightReadings: [freefallReading(100), freefallReading(200)],
      flightRecords: [],
      currentReading: null
    };
    var presenter = AvionicsPresenter.create(state);
    it("should have a maxFlightTime of .250", function(){
      expect(presenter.maxFlightTime).toBe(0.350);
    });
    it("should have a maxAltitude of 0", function(){
      expect(presenter.maxAltitude).toBe(0);
    });
  });
  describe("after flight state", function(){
    var state = {
      currentFlightReadings: [],
      currentReading: null,
      flightRecords: [
        [freefallReading(100), freefallReading(200)],
        [freefallReading(100), freefallReading(300)],
        [freefallReading(100), freefallReading(200)]
      ]
    };
    var presenter = AvionicsPresenter.create(state);
    it("should have a maxFlightTime of .450", function(){
      expect(presenter.maxFlightTime).toBe(0.450);
    });
    it("should have a maxAltitude of 0", function(){
      expect(presenter.maxAltitude).not.toBe(0);
    });
  });
});
