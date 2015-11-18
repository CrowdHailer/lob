/*jshint esnext: true */

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
    }
  };
}

export default Avionics;
