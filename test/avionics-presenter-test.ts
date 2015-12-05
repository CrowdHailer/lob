import * as State from "../assets/scripts/state.ts";
import { freefallReading, stationaryReading } from "./support.ts";


function readingsDuration(readings){
  if (!readings[0]) { return 0; }
  var last = readings.length;
  var t0 = readings[0].timestamp;
  var t1 = readings[last - 1].timestamp;
  return (t1 + 250 - t0) / 1000;
}
import { round } from "../assets/scripts/utils.ts";
function altitudeForFreefallDuration(duration){
  // Altitude Calculation

  // SUVAT
  // s = vt - 0.5 * a * t^2
  // input
  // s = s <- desired result
  // u = ? <- not needed
  // v = 0 <- stationary at top
  // a = - 9.81 <- local g
  // t = flightTime/2 time to top of arc

  // s = 9.81 * 1/8 t^2
  var t = duration;
  return round(2)(9.81/8 * t * t);
}

var Presenter = {
  create: function(state){
    return Object.create({}, {
      maxFlightTime: {
        get: function(){
          var flights = state.flightRecords.concat([state.currentFlightReadings]);
          var flightDurations = flights.map(readingsDuration);
          return Math.max.apply(null, flightDurations);
        }
      },
      maxAltitude: {
        get: function(){
          var flightDurations = state.flightRecords.map(readingsDuration);
          var max = Math.max.apply(null, [0].concat(flightDurations));
          return altitudeForFreefallDuration(max);
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
      currentFlightReadings: [freefallReading()],
      flightRecords: []
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
      currentFlightReadings: [freefallReading(100), freefallReading(200)],
      flightRecords: []
    };
    var presenter = Presenter.create(state);
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
      flightRecords: [
        [freefallReading(100), freefallReading(200)],
        [freefallReading(100), freefallReading(300)],
        [freefallReading(100), freefallReading(200)]
      ]
    };
    var presenter = Presenter.create(state);
    it("should have a maxFlightTime of .450", function(){
      expect(presenter.maxFlightTime).toBe(0.450);
    });
    it("should have a maxAltitude of 0", function(){
      expect(presenter.maxAltitude).not.toBe(0);
    });
  });
});
