/*jshint esnext: true */

function Avionics() {
  var available = false;
  var components = [];

  return {
    isAvailable: function () {
      return available;
    },
    accelerometerWaiting: function () {
      available = true;
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
