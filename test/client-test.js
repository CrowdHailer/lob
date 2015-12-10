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
      expect(console.info.lastCall).toEqual(["[Reset readings]"]);
    });
  });

  describe("recording flights", function(){
    beforeEach(function(){
      client.resetReadings();
      client.newReading({acceleration: {x: 0, y: 0, z: 0}, timestamp: 1000});
      client.newReading({acceleration: {x: 0, y: 0, z: 0}, timestamp: 1200});
      client.newReading({acceleration: {x: 0, y: 0, z: 0}, timestamp: 1400});
      client.newReading({acceleration: {x: 0, y: 0, z: 10}, timestamp: 1600});
      client.newReading({acceleration: {x: 0, y: 0, z: 0}, timestamp: 1800});
      client.newReading({acceleration: {x: 0, y: 0, z: 1}, timestamp: 2000});
    });
    it("should have a current reading", function(){
      expect(client.currentReading).toEqual({acceleration: {x: 0, y: 0, z: 1}, timestamp: 2000});
    });
    it("should have a current flight", function(){
      expect(client.currentFlight).toEqual([
        {acceleration: {x: 0, y: 0, z: 0}, timestamp: 1800},
        {acceleration: {x: 0, y: 0, z: 1}, timestamp: 2000}
      ]);
    });
    it("should have a flight history", function(){
      expect(client.flightHistory).toEqual([[
        {acceleration: {x: 0, y: 0, z: 0}, timestamp: 1000},
        {acceleration: {x: 0, y: 0, z: 0}, timestamp: 1200},
        {acceleration: {x: 0, y: 0, z: 0}, timestamp: 1400}
      ]]);
    });
  });

});
