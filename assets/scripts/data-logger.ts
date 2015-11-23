class DataLogger {
  private displays = [];
  readings = [];
  registerDisplay (display) {
    this.displays.push(display);
    display.update(this);
  }
  newReading (reading) {
    this.readings.push(reading);
    this.updateDisplays();
  }
  reset () {
    this.readings = [];
  }
  updateDisplays () {
    var self = this;
    this.displays.forEach(function (view) {
      view.update(self);
    });
  }
}

export default DataLogger;
