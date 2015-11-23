import Readings from "./readings.ts";
import { Reading } from "./readings.ts";
import { round } from "./utils.ts";

class DataLogger {
  private displays = [];
  readings = new Readings();
  status = "READY";
  registerDisplay(display) {
    this.displays.push(display);
    display.update(this);
  }
  start(){
    this.status = "READING";
    this.updateDisplays();
  }
  newReading(reading: Reading) {
    if (this.status == "READING") {
      this.readings = this.readings.addReading(reading);
      this.updateDisplays();
    }
  }
  stop() {
    this.status = "COMPLETED";
    this.updateDisplays();
  }
  reset() {
    this.status = "READY";
    this.readings = new Readings();
    this.updateDisplays();
  }
  updateDisplays() {
    var self = this;
    this.displays.forEach(function (view) {
      view.update(self);
    });
  }
  get maxAltitude(){
    // Altitude Calculation

    // SUVAT
    // s = vt - 0.5 * a * t^2
    // input
    // s = s <- desired result
    // u = ? <- not needed
    // v = 0 <- stationary at top
    // a = - 9.81 <- local g
    // t = flightTime/2 time to top of arc

    // s = 9.81 * 1/8 t^2

    if (this.status == "COMPLETED") {
      var t = this.readings.flightTime;
      return round(2)(9.81/8 * t * t);
    } else {
      return 0;
    }
  }
  static READY = "READY";
  static READING = "READING";
  static COMPLETED = "COMPLETED";
}

export default DataLogger;
