import Readings from "./readings.ts";
import { Reading } from "./readings.ts";
import { round } from "./utils.ts";

// The data logger is implemented as a flux style store.
// It does not have a dispatch method and currently the application knows directly which methods to call on the data logger
// Views/Displays are registered with by registerDisplay
// At the moment after each change of state action a call to updateDisplays must be made manually.
// DEBT uplink untested
class DataLogger {
  private displays = [];
  readings = new Readings();
  status = "READY";
  uplink;

  constructor(uplink){
    this.uplink = uplink;
  }
  // Responses to external actions
  start(){
    this.status = "READING";
    this.updateDisplays();
  }
  newReading(reading: Reading) {
    if (this.status == "READING") {
      this.readings = this.readings.addReading(reading);
      this.uplink.publish("accelerometerReading", reading);
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
    this.uplink.publish("reset", null);
    this.updateDisplays();
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
  updateDisplays() {
    var self = this;
    this.displays.forEach(function (view) {
      view.update(self);
    });
  }
  registerDisplay(display) {
    this.displays.push(display);
    display.update(this);
  }
  static READY = "READY";
  static READING = "READING";
  static COMPLETED = "COMPLETED";
}

export default DataLogger;
