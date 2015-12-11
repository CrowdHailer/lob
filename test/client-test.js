/* jshint esnext: true */

import { createTranscriptLogger, createTranscriptFunction } from "./support";

import * as Client from "../client/client";

// READING -> single acceleration vector and timestamp in milliseconds
// FLIGHT -> Array of Readings all with less than threshold acceleration
// FLIGHT HISTORY -> Array of flights not including the current flight

describe("Client", function() {
  var client, console, listener;

  beforeEach(function(){
    console = createTranscriptLogger();
    listener = createTranscriptFunction();
    client = Client.start({
      console: console
    });
  });
  describe("after reset", function(){
    beforeEach(function(){
      client.onResetReadings(listener);
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
    it("should have notified the listener", function(){
      expect(listener.lastCall).toEqual([]);
    });
  });

  describe("recording flights", function(){
    beforeEach(function(){
      client.onNewReading(listener);
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
    it("should have logged the reading events", function(){
      expect(console.info.transcript.length).toEqual(7);
    });
    it("should have notified the listener", function(){
      expect(listener.lastCall).toEqual([{acceleration: {x: 0, y: 0, z: 1}, timestamp: 2000}]);
    });
  });

});
