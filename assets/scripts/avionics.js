/*jshint esnext: true */

import Actions from "./actions.js";

function Avionics() {
  var available = false;
  var recording = false;
  var components = [];

  return {
    isAvailable: function () {
      return available;
    },
    isRecording: function () {
      return recording;
    },
    accelerometerWaiting: function () {
      available = true;
      var self = this;
      components.forEach(function (c) { c.update(self); });
    },
    startRecording: function () {
      recording = true;
      var self = this;
      components.forEach(function (c) { c.update(self); });
    },
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
        default:

      }
    }
  };
}

export default Avionics;
