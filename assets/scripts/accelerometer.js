/*jshint esnext: true */
"use strict";

// function Accelerometer() {
//   console.log("Initializing Accelerometer");
//   if(window.DeviceMotionEvent) {
//   }
// }

function Accelerometer(context) {
  context = context || window;
  var state = Accelerometer.PENDING;

  if(context.DeviceMotionEvent) {
    // TODO test and remove from global
    context.addEventListener("devicemotion", function (deviceMotionEvent) {
      var x = deviceMotionEvent.accelerationIncludingGravity.x;
      if (typeof x === "number") {
        state = Accelerometer.WAITING;
        context.Lob.accelerometerWaiting();
      } else {
        state = Accelerometer.FAILED;
        context.Lob.accelerometerFailed();
      }
    });
  // ENDOF untested
  } else {
    state = Accelerometer.FAILED;
    context.Lob.accelerometerFailed();
  }

  return Object.create({}, {
    state: {
      get: function () { return state; }
    }
  });
}

Accelerometer.PENDING = "PENDING";
Accelerometer.FAILED = "FAILED";
Accelerometer.WAITING = "WAITING";

export default Accelerometer;
