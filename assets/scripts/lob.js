/*jshint esnext: true */

import { lookupAccelerationVectorRectifyForDevice } from "./lob/acceleration";
import { throttle } from "./lob/util";
import connection from "./lob/connection";

// Set up Acceleration External Service
var rectifyAcceleration = lookupAccelerationVectorRectifyForDevice(navigator.userAgent, window.console);

var deviceMotionHandler = (function (rectifier) {
  return function (deviceMotionEvent) {
    var vector = rectifier(deviceMotionEvent.accelerationIncludingGravity);
    console.log(vector);
    // DEBT must be a simple JS object error if passed a deviceAcceleration object
    connection.publish("accelerationEvent", vector);
  };
})(rectifyAcceleration);

deviceMotionHandler = throttle(deviceMotionHandler, 500);


// Setup Dom features
import { querySelector, ready } from "./lob/dom";
import Flyer from "./lob/features/flyer";
import Tracker from "./lob/features/tracker";

ready(function () {

  var $flyer = querySelector("#orientation-generator", document);
  var $tracker = querySelector("#orientation-tracker", document);

  if ($flyer) {
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
      connection.publish("refreshEvent", {});
    });
  }

  if ($tracker) {
    var tracker = Tracker($tracker);

    connection.subscribe("accelerationEvent", function (evt) {
      tracker.accelerationEvent(evt);
    });
    connection.subscribe("refreshEvent", function (evt) {
      tracker.refreshEvent(evt);
    });
  }
});
