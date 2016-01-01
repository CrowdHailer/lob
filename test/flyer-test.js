/* jshint esnext: true */

import { createTranscriptLogger, createTranscriptFunction } from "./support";

import Flyer from "../client/flyer/flyer";

// READING -> single acceleration vector and timestamp in milliseconds
// FLIGHT -> Array of Readings all with less than threshold acceleration
// FLIGHT HISTORY -> Array of flights not including the current flight

describe("Flyer", function() {
  var flyer, console, listener;

  beforeEach(function(){
    console = createTranscriptLogger();
    listener = createTranscriptFunction();
    flyer = Flyer({
      console: console
    });
  });
  describe("after reset", function(){
    beforeEach(function(){
      // client.onResetReadings(listener);
      flyer.resetReadings();
    });

    it("should have a null current reading", function(){
      expect(flyer.currentReading).toBe(null);
    });
    it("should have an empty current flight", function(){
      expect(flyer.currentFlight).toEqual([]);
    });
    it("should have an empty flight history", function(){
      expect(flyer.flightHistory).toEqual([]);
    });
    xit("should have logged the reset event", function(){
      expect(console.info.lastCall).toEqual(["[Reset readings]"]);
    });
    xit("should have notified the listener", function(){
      expect(listener.lastCall).toEqual([]);
    });
  });

  describe("recording flights", function(){
    beforeEach(function(){
      // flyer.onNewReading(listener);
      flyer.resetReadings();
      flyer.newReading({acceleration: {x: 0, y: 0, z: 0}, timestamp: 1000});
      flyer.newReading({acceleration: {x: 0, y: 0, z: 0}, timestamp: 1200});
      flyer.newReading({acceleration: {x: 0, y: 0, z: 0}, timestamp: 1400});
      flyer.newReading({acceleration: {x: 0, y: 0, z: 10}, timestamp: 1600});
      flyer.newReading({acceleration: {x: 0, y: 0, z: 0}, timestamp: 1800});
      flyer.newReading({acceleration: {x: 0, y: 0, z: 1}, timestamp: 2000});
    });
    it("should have a current reading", function(){
      expect(flyer.currentReading).toEqual({acceleration: {x: 0, y: 0, z: 1}, timestamp: 2000});
    });
    it("should have a current flight", function(){
      expect(flyer.currentFlight).toEqual([
        {acceleration: {x: 0, y: 0, z: 0}, timestamp: 1800},
        {acceleration: {x: 0, y: 0, z: 1}, timestamp: 2000}
      ]);
    });
    it("should have a flight history", function(){
      expect(flyer.flightHistory).toEqual([[
        {acceleration: {x: 0, y: 0, z: 0}, timestamp: 1000},
        {acceleration: {x: 0, y: 0, z: 0}, timestamp: 1200},
        {acceleration: {x: 0, y: 0, z: 0}, timestamp: 1400}
      ]]);
    });
    xit("should have logged the reading events", function(){
      expect(console.info.transcript.length).toEqual(7);
    });
    xit("should have notified the listener", function(){
      expect(listener.lastCall).toEqual([{acceleration: {x: 0, y: 0, z: 1}, timestamp: 2000}]);
    });
  });

  xdescribe("notification", function(){
    it("should have a message after a bad reading", function(){
      flyer.badReading();
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

  xdescribe("uplink", function(){
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
    it("should show notice of failed connection", function(){
      client.uplinkFailed();
      client.startTransmitting();
      expect(client.notices).toEqual(["Could not start a connection. Please refresh the page to try again."]);
    });
  });


});
