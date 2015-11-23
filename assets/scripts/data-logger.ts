import Readings from "./readings.ts";
import { Reading } from "./readings.ts";

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
  reset() {
    this.status = "READY";
    this.readings = new Readings();
  }
  updateDisplays() {
    var self = this;
    this.displays.forEach(function (view) {
      view.update(self);
    });
  }
  static READY = "READY";
  static READING = "READING";
}

export default DataLogger;
