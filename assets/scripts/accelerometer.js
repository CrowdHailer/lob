/*jshint esnext: true */

// function Accelerometer() {
//   console.log("Initializing Accelerometer");
//   if(window.DeviceMotionEvent) {
//     window.addEventListener("devicemotion", function (deviceMotionEvent) {
//       console.log(deviceMotionEvent);
//       console.log(deviceMotionEvent.accelerationIncludingGravity.x);
//     });
//   }
// }

function Accelerometer(context) {
  context = context || window;
  var state = Accelerometer.PENDING;

  if(!context.DeviceMotionEvent) {
    state = Accelerometer.FAILED;
  }

  return Object.create({}, {
    state: {
      get: function () { return state; }
    }
  });
}

Accelerometer.PENDING = "PENDING";
Accelerometer.FAILED = "FAILED";

export default Accelerometer;
