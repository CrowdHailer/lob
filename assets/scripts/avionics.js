/*jshint esnext: true */

import Actions from "./actions.js";

function Avionics() {
  var state = "PENDING";
  var components = [];
  var initialTimestamp;

  return {
    accelerometerWaiting: function () {
      this.state = "READY";
      var self = this;
      components.forEach(function (c) { c.update(self); });
    },
    startRecording: function () {
      this.state = "RECORDING";
      var self = this;
      components.forEach(function (c) { c.update(self); });
    },
    accelerometerReading: function (reading) {
      if (!initialTimestamp) {
        initialTimestamp = reading.timestamp;
        this.remainingTime = 20;
      } else {
        var duration = (reading.timestamp - initialTimestamp) / 1000;
        if (duration > 20) {
          this.remainingTime = 0;
          this.state = Avionics.COMPLETED;
        } else {
          this.remainingTime = 20 - duration;
        }
      }
      // TODO test updates
      var self = this;
      components.forEach(function (c) { c.update(self); });
    },
    resetAvionics: function () {
      this.remainingTime = null;
      this.state = Avionics.READY;
      var self = this;
      components.forEach(function (c) { c.update(self); });
    },
    remainingTime: null,
    mount: function (component) {
      component.update(this);
      components.push(component);
    },
    dispatch: function (action) {
      // TODO test dispatch
      switch (action.type) {
        case Actions.START_RECORDING:
          this.startRecording();
          break;
        case Actions.ACCELEROMETER_WAITING:
          this.accelerometerWaiting();
          break;
        case Actions.ACCELEROMETER_READING:
          this.accelerometerReading(action.reading);
          break;
        case Actions.RESET_AVIONICS:
          this.resetAvionics();
          break;
        default:

      }
    },
    state: "PENDING"
  };
}

Avionics.PENDING = "PENDING";
Avionics.READY = "READY";
Avionics.RECORDING = "RECORDING";
Avionics.COMPLETED = "COMPLETED";

export default Avionics;
