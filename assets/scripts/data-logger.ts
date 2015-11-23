import Readings from "./readings.ts";
import { Reading } from "./readings.ts";

class DataLogger {
  private displays = [];
  readings = new Readings();
  registerDisplay (display) {
    this.displays.push(display);
    display.update(this);
  }
  newReading (reading: Reading) {
    this.readings = this.readings.addReading(reading);
    this.updateDisplays();
  }
  reset () {
    this.readings = new Readings();
  }
  updateDisplays () {
    var self = this;
    this.displays.forEach(function (view) {
      view.update(self);
    });
  }
}

export default DataLogger;
