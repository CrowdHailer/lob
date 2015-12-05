import * as State from "../assets/scripts/state.ts";
import { freefallReading, stationaryReading } from "./support.ts";

var Presenter = {
  create: function(state){
    return Object.create({}, {
      maxFlightTime: {
        get: function(){
          var readings = state.currentFlightReadings
          if (!readings[0]) { return 0; }
          var last = readings.length;
          var t0 = readings[0].timestamp;
          var t1 = readings[last - 1].timestamp;
          return (t1 + 250 - t0) / 1000;
        }
      },
      maxAltitude: {
        get: function(){
          return 0;
        }
      }
    });
  }
};

describe("Avionics Presenter", function(){
  describe("default state", function (){
    var state = State.DEFAULT;
    var presenter = Presenter.create(state);
    it("should have a maxFlightTime of 0", function(){
      expect(presenter.maxFlightTime).toBe(0);
    });
    it("should have a maxAltitude of 0", function(){
      expect(presenter.maxAltitude).toBe(0);
    });
  });

  describe("in early flight state", function(){
    var state = {
      currentFlightReadings: [freefallReading()]
    };
    var presenter = Presenter.create(state);
    it("should have a maxFlightTime of .250", function(){
      expect(presenter.maxFlightTime).toBe(0.250);
    });
    it("should have a maxAltitude of 0", function(){
      expect(presenter.maxAltitude).toBe(0);
    });
  });
  describe("in mid flight state", function(){
    var state = {
      currentFlightReadings: [freefallReading(100), freefallReading(200)]
    };
    var presenter = Presenter.create(state);
    it("should have a maxFlightTime of .250", function(){
      expect(presenter.maxFlightTime).toBe(0.350);
    });
    it("should have a maxAltitude of 0", function(){
      expect(presenter.maxAltitude).toBe(0);
    });
  // describe("after flight state", function(){
  //   var state = {
  //     flightRecords: [
  //       [freefallReading(100), freefallReading(200)],
  //       [freefallReading(100), freefallReading(300)],
  //       [freefallReading(100), freefallReading(200)]
  //     ]
  //   };
  //   var presenter = Presenter.create(state);
  //   it("should have a maxFlightTime of .250", function(){
  //     expect(presenter.maxFlightTime).toBe(0.450);
  //   });
  //   it("should have a maxAltitude of 0", function(){
  //     expect(presenter.maxAltitude).not.toBe(0);
  //   });
  });
});
