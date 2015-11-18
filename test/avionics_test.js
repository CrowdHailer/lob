/*jshint esnext: true */

import Avionics from "../assets/scripts/avionics.js";


describe("Avionics", function() {

  it("should start unavailable", function () {
    var avionics = Avionics();
    expect(avionics.isAvailable()).toBeFalsy();
  });

  it("should be available after accelerometer waiting", function () {
    var avionics = Avionics();
    // DEBT accelerometer ready or online
    avionics.accelerometerWaiting();
    expect(avionics.isAvailable()).toBeTruthy();
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
