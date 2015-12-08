var DEVICEMOTION = "devicemotion";
var THROTTLE_RATE = 100; // ms

import { throttle } from "./utils.ts";

export default function Accelerometer(app){
  var actions = app.actions;
  function reportDeviceMotionEvent (deviceMotionEvent) {
    var raw = deviceMotionEvent.accelerationIncludingGravity;
    if (typeof raw.x === "number") {
      actions.newReading({acceleration: {x: raw.x, y: raw.y, z: raw.z}, timestamp: Date.now()});
    }
    else {
      actions.badReading(raw);
    }
  }

  var throttledReport = throttle(reportDeviceMotionEvent, THROTTLE_RATE);

  return {
    start: function(){
      window.addEventListener(DEVICEMOTION, throttledReport);
    }
  };
}