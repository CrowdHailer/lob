/*jshint esnext: true */
"use strict";

function AccelerometerError(message) {
  this.name = 'AccelerometerError';
  this.message = message || 'Unspecified error communicating with device accelerometer';
  this.stack = (new Error()).stack;
}
AccelerometerError.prototype = Object.create(Error.prototype);
AccelerometerError.prototype.constructor = AccelerometerError;

function Accelerometer(actions, context) {
  // Assume context is window TODO upgrade
  var state = Accelerometer.PENDING;
  var error;

  // var userAgent = context.navigator.userAgent;

  var accelerometer =  Object.create({}, {
    state: {
      get: function () { return state; }
    },
    error: {
      get: function () { return error; }
    },
    start: {
      get: function () {
        return function () {
          if (state == Accelerometer.PENDING) {
            throw new AccelerometerError("Accelerometer is not yet available");
          }
          if (state == Accelerometer.FAILED) {
            throw error;
          }
        };
      }
    },
    stop: function () {

    },
    dispatch: function (action) {

    }
  });

  if(!context.DeviceMotionEvent) {
    // TODO report error
    error = new AccelerometerError("DeviceMotionEvent event is not supported");
    actions.accelerometer_failed(error);
    state = Accelerometer.FAILED;
    return accelerometer;
  }

  function handleEvent(deviceMotionEvent) {
    var x = deviceMotionEvent.accelerationIncludingGravity.x;
    if (typeof x === "number") {
      state = Accelerometer.WAITING;
      actions.accelerometer_waiting();
    } else {
      error = new AccelerometerError("Device accelerometer returns null data");
      state = Accelerometer.FAILED;
      actions.accelerometer_failed(error);
    }
  }

  // TODO handle event once
  context.addEventListener("devicemotion", handleEvent);

  return accelerometer;
}

Accelerometer.PENDING = "PENDING";
Accelerometer.FAILED = "FAILED";
Accelerometer.WAITING = "WAITING";

export { AccelerometerError };
export default Accelerometer;
