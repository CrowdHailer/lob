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

  describe("notification", function(){
    it("should have a message after a bad reading", function(){
      client.badReading();
      expect(client.notices).toEqual(["Could not read the data from this device. Please try again on a mobile with working accelerometer."]);
    });
    it("should notify listeners of a bad reading", function(){
      client.onBadReading(listener);
      client.badReading();
      expect(listener.lastCall).toEqual([]);
    });
    it("should have no notices after a call to close notices", function(){
      client.badReading();
      client.closeNotices();
      expect(client.notices).toEqual([]);
    });
    it("should notify listeners of close notice command", function(){
      client.onCloseNotices(listener);
      client.badReading();
      client.closeNotices();
      expect(listener.lastCall).toEqual([]);
    });
  });

  describe("uplink", function(){
    it("should start with an unknown uplink status", function(){
      expect(client.uplinkStatus).toEqual("UNKNOWN");
    });
    it("should have ready status after uplinkAvailable", function(){
      client.uplinkAvailable();
      expect(client.uplinkStatus).toEqual("AVAILABLE");
    });
    it("should have transmitting status after startTransmitting", function(){
      client.uplinkAvailable();
      client.startTransmitting();
      expect(client.uplinkStatus).toEqual("TRANSMITTING");
    });
    it("should have failed status after uplinkFailed", function(){
      client.uplinkFailed();
      expect(client.uplinkStatus).toEqual("FAILED");
    });
    // test combinations to -> from state in state tests
  });

});
