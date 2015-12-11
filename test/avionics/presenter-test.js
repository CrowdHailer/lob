/* jshint esnext: true */

import { freefallReading, stationaryReading } from "../support";
import Presenter from "../../client/avionics/presenter";
import { format } from "../../client/avionics/presenter";

describe("Avionics Presenter", function(){
  describe("formatting numbers", function(){
    it("should format 0 as '+00.00'", function(){
      expect(format(0)).toBe("+00.00");
    });
    it("should format -1 as '-01.00'", function(){
      expect(format(-1)).toBe("-01.00");
    });
  });

  describe("of refreshed app", function (){
    var appState = {
      currentReading: null,
      currentFlight: [],
      flightHistory: []
    };
    var presenter = Presenter(appState);

    it("should have a maxFlightTime of 0", function(){
      expect(presenter.maxFlightTime).toBe("0.00 s");
    });
    it("should have a maxAltitude of 0", function(){
      expect(presenter.maxAltitude).toBe("0.00 m");
    });
    it("should instruct user to lob", function(){
      expect(presenter.instruction).toBe("Lob phone to get started");
    });
    it("should have a current Reading of waiting", function(){
      expect(presenter.currentReadout).toEqual("Waiting.");
    });
  });

  describe("of app early flight state", function(){
    var reading = freefallReading(1000);
    var appState = {
      currentFlight: [reading],
      flightHistory: [],
      currentReading: reading
    };
    var presenter = Presenter(appState);

    it("should have a maxFlightTime of .250", function(){
      expect(presenter.maxFlightTime).toBe("0.25 s");
    });
    it("should have a maxAltitude of 0", function(){
      expect(presenter.maxAltitude).toBe("0.00 m");
    });
    it("should have a current Reading of with details", function(){
      expect(presenter.currentReadout).toEqual("[+00.00, +00.00, -01.00]");
    });
  });
  describe("in mid flight state", function(){
    var appState = {
      currentFlight: [freefallReading(100), freefallReading(200)],
      flightHistory: [],
      currentReading: freefallReading(200)
    };
    var presenter = Presenter(appState);
    it("should have a maxFlightTime of .250", function(){
      expect(presenter.maxFlightTime).toBe("0.35 s");
    });
    it("should have a maxAltitude of 0", function(){
      expect(presenter.maxAltitude).toBe("0.00 m");
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
    var presenter = Presenter(appState);
    it("should have a maxFlightTime of .450", function(){
      expect(presenter.maxFlightTime).toBe("0.45 s");
    });
    it("should have a maxAltitude of 0.25", function(){
      expect(presenter.maxAltitude).toBe("0.25 m");
    });
    it("should instruct user to lob", function(){
      expect(presenter.instruction).toBe("OK! can you lob any higher");
    });
  });
});
