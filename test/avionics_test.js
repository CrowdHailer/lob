/*jshint esnext: true */

import Avionics from "../assets/scripts/avionics.js";


describe("Avionics", function() {

  it("should start pending", function () {
    var avionics = Avionics();
    expect(avionics.state).toBe(Avionics.PENDING);
  });

  it("should be ready after accelerometer waiting", function () {
    var avionics = Avionics();
    avionics.accelerometerWaiting();
    expect(avionics.state).toBe(Avionics.READY);
  });

  it("should be recording after start recording", function () {
    var avionics = Avionics();
    // DEBT accelerometer ready or online
    avionics.accelerometerWaiting();
    avionics.startRecording();
    expect(avionics.state).toBe(Avionics.RECORDING);
  });

  describe("when active", function () {
    var avionics;
    beforeEach(function () {
      avionics = Avionics();
      // DEBT accelerometer ready or online
      avionics.accelerometerWaiting();
      avionics.startRecording();
    });

    it("should have a remaining time of 20s after first accelerometer reading", function () {
      avionics.accelerometerReading({timestamp: 10000, acceleration: {x: 1, y: 1, z: 1}});
      expect(avionics.remainingTime).toEqual(20.0);
    });

    it("should have a diminished remaining time after second accelerometer reading", function () {
      avionics.accelerometerReading({timestamp: 10000, acceleration: {x: 1, y: 1, z: 1}});
      avionics.accelerometerReading({timestamp: 10500, acceleration: {x: 1, y: 1, z: 1}});
      expect(avionics.remainingTime).toEqual(19.5);
    });
  });

  // DEBT these tests are not part of the avionics and are generic store behaviour.
  it("should pass itself to a mounted component", function () {
    var avionics = Avionics();
    var version;
    var component = {update: function (facade) { version = facade; }};
    avionics.mount(component);
    expect(version).toBe(avionics);
  });

  it("should pass itself to a mounted component when updating", function () {
    var avionics = Avionics();
    var version;
    var component = {update: function (facade) { version = facade; }};
    avionics.mount(component);
    version = undefined;
    avionics.accelerometerWaiting();
    expect(version).toBe(avionics);
  });
});
