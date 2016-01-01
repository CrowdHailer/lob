/* jshint esnext: true */
import Flyer from "./flyer/flyer";

var flyer = new Flyer();
flyer.logger = window.console;

var DEVICEMOTION = "devicemotion";
function AccelerometerController(global, flyer){
  global.addEventListener(DEVICEMOTION, function(deviceMotionEvent){
    console.debug("AccelerometerController", deviceMotionEvent);
    flyer.newReading({
      acceleration: deviceMotionEvent.accelerationIncludingGravity,
      timestamp: Date.now()
    });
  });
}

var accelerometerController = new AccelerometerController(window, flyer);
