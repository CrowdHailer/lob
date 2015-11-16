function deviceUsesInvertedAcceleration(userAgent) {
  if (userAgent.match(/Windows/i)) {
    return true;
  } else if (userAgent.match(/Android/i)) {
    return false;
  } else {
    return true;
  }
}

function lookupAccelerationVectorRectifyForDevice(userAgent, console) {
  var invert = deviceUsesInvertedAcceleration(userAgent);

  if (invert) {
    console.log("Device uses inverted acceleration. UserAgent: \"" + userAgent + "\"");
    return function invertVector(vector) {
      return {
        x: - 1 * vector.x,
        y: - 1 * vector.y,
        z: - 1 * vector.z,
      };
    };
  } else {
    console.log("Device uses standard acceleration. UserAgent: \"" + userAgent + "\"");
    return function identity(vector) { return vector; };
  }
}

console.log("Starting Lob script");
var rectifyAcceleration = lookupAccelerationVectorRectifyForDevice(navigator.userAgent, window.console);

var deviceMotionHandler = (function (rectifier) {
  return function (deviceMotionEvent) {
    var vector = rectifier(deviceMotionEvent.accelerationIncludingGravity);
    console.log(vector);
  };
})(rectifyAcceleration);

if (window.DeviceMotionEvent) {
  window.addEventListener("devicemotion", deviceMotionHandler);
}

function stopAccelerationHandler(argument) {
    window.removeEventListener("devicemotion", deviceMotionHandler);
}

window.stop = stopAccelerationHandler;

import connection from "./lob/connection";

connection.publish("hello");
