/* jshint esnext: true */
import { createTranscriptLogger, createTranscriptFunction } from "../support";

import Flyer from "../../client/flyer";

describe("Reset Readings", function(){
  describe("for flyer with flight date", function(){
    beforeEach(function(){
      flyer = Flyer({
        uplinkStatus: "TRANSMITTING",
        currentFlight: [{}],
        flightHistory: [{}],
      });
      flyer.logger = createTranscriptLogger();
      flyer.view = {render: function(){}};
      flyer.uplink = {
        transmitReading: createTranscriptFunction(),
        transmitResetReadings: createTranscriptFunction()
      };
      flyer.resetReadings();
    });
    it("should clear latest reading", function(){
      expect(flyer.state.latestReading).toBe(null);
    });
    it("should clear current flight", function(){
      expect(flyer.state.currentFlight).toEqual([]);
    });
    it("should clear flight history", function(){
      expect(flyer.state.flightHistory).toEqual([]);
    });
    it("should transmit the reset message", function(){
      expect(flyer.uplink.transmitResetReadings.transcript.length).toEqual(1);
    });
    // DEBT these two can be separated with inteligent setter
    // log reset
    // render view
  });
});
