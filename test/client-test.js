/* jshint esnext: true */

import { createTranscriptLogger } from "./support";

import * as Client from "../client/client";

// READING -> single acceleration vector and timestamp in milliseconds
// FLIGHT -> Array of Readings all with less than threshold acceleration
// FLIGHT HISTORY -> Array of flights not including the current flight

describe("Client", function() {
  var client, console;

  beforeEach(function(){
    console = createTranscriptLogger();
    client = Client.start({
      console: console
    });
  });
  describe("after reset", function(){
    beforeEach(function(){
      client.resetReadings();
    });

    it("should have a null current reading", function(){
      expect(client.currentReading).toBe(null);
    });
    it("should have an empty current flight", function(){
      expect(client.currentFlight).toEqual([]);
    });
    it("should have an empty flight history", function(){
      expect(client.flightHistory).toEqual([]);
    });
    it("should have logged the reset event", function(){
      expect(console.warn.lastCall).toEqual(["[Reset readings]"]);
    });
  });

});
