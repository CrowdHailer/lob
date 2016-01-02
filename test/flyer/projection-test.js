/* jshint esnext: true */

import { freefallReading, stationaryReading } from "../support";
import Projection from "../../client/flyer/projection";

describe("Flyer Projection", function(){

  describe("of reset state", function (){
    var appState = {
      currentReading: null,
      currentFlight: [],
      flightHistory: []
    };
    var projection = Projection(appState);

    it("should have a maxFlightTime of 0", function(){
      expect(projection.maxFlightTime).toBe(0.00);
    });
    it("should have a maxAltitude of 0", function(){
      expect(projection.maxAltitude).toBe(0.00);
    });
    it("should instruct user to lob", function(){
      expect(projection.hasThrow).toBe(false);
    });
    it("should have a current Reading as null", function(){
      expect(projection.currentReading).toEqual(null);
    });
  });

  describe("of app early flight state", function(){
    var reading = freefallReading(1000);
    var appState = {
      currentFlight: [reading],
      flightHistory: [],
      currentReading: reading
    };
    var projection = Projection(appState);

    it("should have a maxFlightTime of .250", function(){
      expect(projection.maxFlightTime).toBe(0.25);
    });
    it("should have a maxAltitude of 0", function(){
      expect(projection.maxAltitude).toBe(0.00);
    });
    it("should have a current Reading of with details", function(){
      expect(projection.currentReading).toEqual(reading);
    });
  });
  describe("in mid flight state", function(){
    var appState = {
      currentFlight: [freefallReading(100), freefallReading(200)],
      flightHistory: [],
      currentReading: freefallReading(200)
    };
    var projection = Projection(appState);
    it("should have a maxFlightTime of .250", function(){
      expect(projection.maxFlightTime).toBe(0.35);
    });
    it("should have a maxAltitude of 0", function(){
      expect(projection.maxAltitude).toBe(0.00);
    });
  });
  describe("after flight state", function(){
    var appState = {
      currentFlight: [],
      currentReading: null,
      flightHistory: [
        [freefallReading(100), freefallReading(200)],
        [freefallReading(100), freefallReading(300)],
        [freefallReading(100), freefallReading(200)]
      ]
    };
    var projection = Projection(appState);
    it("should have a maxFlightTime of .450", function(){
      expect(projection.maxFlightTime).toBe(0.45);
    });
    it("should have a maxAltitude of 0.25", function(){
      expect(projection.maxAltitude).toBe(0.25);
    });
    it("should instruct user to lob", function(){
      expect(projection.hasThrow).toBe(true);
    });
  });
  describe("uplink", function(){
    it("should have a uplinkStatus of unknown", function(){
      var appState = {
          uplinkStatus: "UNKNOWN"
      };
      var projection = Projection(appState);
      expect(projection.uplinkStatus).toEqual("UNKNOWN");
    });
    it("should have a uplinkStatus of unknown", function(){
      var appState = {
          uplinkStatus: "AVAILABLE"
      };
      var projection = Projection(appState);
      expect(projection.uplinkStatus).toEqual("AVAILABLE");
    });
  });
});
