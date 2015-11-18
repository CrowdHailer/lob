/*jshint esnext: true */
"use strict";

import Actions from "./actions.js";
import { throttle } from "./utils";

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
  function handleReading(deviceMotionEvent) {
    actions.accelerometerReading(deviceMotionEvent.accelerationIncludingGravity.x);
  }
  var throttledHandleReading = throttle(handleReading, 5000);

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
          if (state == Accelerometer.WAITING) {
            // Untested case
            state = Accelerometer.RECORDING;
            context.addEventListener("devicemotion", throttledHandleReading);
          }
        };
      }
    },
    stop: function () {

    },
    dispatch: {
      get: function () {
        return function (action) {
          switch (action.type) {
            case Actions.START_RECORDING:
              this.start();
              break;
            default:

          }
        };
      }
    }
  });

  if(!context.DeviceMotionEvent) {
    // TODO report error
    error = new AccelerometerError("DeviceMotionEvent event is not supported");
    actions.accelerometerFailed(error);
    state = Accelerometer.FAILED;
    return accelerometer;
  }

  function handleTestReading(deviceMotionEvent) {
    var x = deviceMotionEvent.accelerationIncludingGravity.x;
    if (typeof x === "number") {
      state = Accelerometer.WAITING;
      actions.accelerometerWaiting();
    } else {
      error = new AccelerometerError("Device accelerometer returns null data");
      state = Accelerometer.FAILED;
      actions.accelerometerFailed(error);
    }
    // TODO test calls once
    context.removeEventListener("devicemotion", handleTestReading);
  }

  // TODO handle event once
  context.addEventListener("devicemotion", handleTestReading);

  return accelerometer;
}

Accelerometer.PENDING = "PENDING";
Accelerometer.FAILED = "FAILED";
Accelerometer.WAITING = "WAITING";
Accelerometer.RECORDING = "RECORDING";

export { AccelerometerError };
export default Accelerometer;
