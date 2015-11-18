/*jshint esnext: true */

function Accelerometer() {
  console.log("Initializing Accelerometer");
  if(window.DeviceMotionEvent) {
    window.addEventListener("devicemotion", function (deviceMotionEvent) {
      console.log(deviceMotionEvent);
      console.log(deviceMotionEvent.accelerationIncludingGravity.x);
    });
  }
}

export default Accelerometer;
