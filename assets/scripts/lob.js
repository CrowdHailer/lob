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

  document.addEventListener("startReporting", function (event) {
    if (window.DeviceMotionEvent) {
      window.addEventListener("devicemotion", deviceMotionHandler);
    }
  });
  document.addEventListener("stopReporting", function (event) {
    window.removeEventListener("devicemotion", deviceMotionHandler);
  });
  document.addEventListener("refreshReporting", function (event) {
    console.log("refresh");
  });
});

import connection from "./lob/connection";
