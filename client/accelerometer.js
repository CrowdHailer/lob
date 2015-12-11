/* jshint esnext: true */

var DEVICEMOTION = "devicemotion";
var THROTTLE_RATE = 100; // ms

import { throttle } from "./utils/utils";

export default function Accelerometer(app){
  function reportDeviceMotionEvent (deviceMotionEvent) {
    var raw = deviceMotionEvent.accelerationIncludingGravity;
    if (typeof raw.x === "number") {
      app.newReading({acceleration: {x: raw.x, y: raw.y, z: raw.z}, timestamp: Date.now()});
    }
    else {
      app.badReading(raw);
    }
  }

  var throttledReport = throttle(reportDeviceMotionEvent, THROTTLE_RATE);

  return {
    start: function(){
      window.addEventListener(DEVICEMOTION, throttledReport);
    }
  };
}
