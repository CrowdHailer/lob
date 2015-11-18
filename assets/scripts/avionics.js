/*jshint esnext: true */

function Avionics() {
  var available = false;

  return {
    isAvailable: function () {
      return available;
    },
    accelerometerWaiting: function () {
      available = true;
    }
  };
}

export default Avionics;
