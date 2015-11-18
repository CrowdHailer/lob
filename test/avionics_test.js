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

});
