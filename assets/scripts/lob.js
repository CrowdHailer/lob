/*jshint esnext: true */

import { lookupAccelerationVectorRectifyForDevice } from "./lob/acceleration";

console.log("Starting Lob script");
var rectifyAcceleration = lookupAccelerationVectorRectifyForDevice(navigator.userAgent, window.console);

import { throttle } from "./lob/util";

var deviceMotionHandler = (function (rectifier) {
  return function (deviceMotionEvent) {
    var vector = rectifier(deviceMotionEvent.accelerationIncludingGravity);
    console.log(vector);
  };
})(rectifyAcceleration);

deviceMotionHandler = throttle(deviceMotionHandler, 500);

import { querySelector, ready } from "./lob/dom";
import Flyer from "./lob/features/flyer";

ready(function () {

  var $flyer = querySelector("#orientation-generator", document);
  var flyer = Flyer($flyer);

  // if (window.DeviceMotionEvent) {
  //   window.addEventListener("devicemotion", deviceMotionHandler);
  // }
});


function stopAccelerationHandler(argument) {
    window.removeEventListener("devicemotion", deviceMotionHandler);
}

window.stop = stopAccelerationHandler;

import connection from "./lob/connection";
