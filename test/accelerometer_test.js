/*jshint esnext: true */

// import Accelerometer from "../assets/scripts/accelerometer.js";
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
    error = new AccelerometerError("DeviceMotionEvent event is not supported");
    actions.accelerometer_failed(error);
    state = Accelerometer.FAILED;
    return accelerometer;
  }

  function handleEvent(deviceMotionEvent) {

  }

  return accelerometer;
}

Accelerometer.PENDING = "PENDING";
Accelerometer.FAILED = "FAILED";
Accelerometer.WAITING = "WAITING";

describe("Accelerometer", function() {

  var last_action;
  var actions = {
    accelerometer_failed: function (error) {
      last_action = {
        type: "ACCELEROMETER_FAILED",
        error: error
      };
    }
  };

  it("should have a current state", function () {
    // Assumes tests in modern browser
    var context = window;
    accelerometer = Accelerometer(actions, context);
    expect(accelerometer.state).toBeDefined();
  });

  it("should start in a pending state if device motion event found", function () {
    var context = {DeviceMotionEvent: function () { }};
    accelerometer = Accelerometer(actions, context);
    expect(accelerometer.state).toBe(Accelerometer.PENDING);
  });

  it("should not be possible to set state value", function () {
    var context = window;
    accelerometer = Accelerometer(actions, context);
    expect(function () {
      accelerometer.state = "MUTATED";
    }).toThrowError(TypeError, "setting a property that has only a getter");
  });

  it("should be in a failed state if no DeviceMotionEvent defined", function () {
    var context = {};
    accelerometer = Accelerometer(actions, context);
    expect(accelerometer.state).toBe(Accelerometer.FAILED);
  });

  it("should be have an error if no DeviceMotionEvent defined", function () {
    var context = {};
    accelerometer = Accelerometer(actions, context);
    expect(accelerometer.error.constructor).toEqual(AccelerometerError);
  });

  it("should report failure as action if no DeviceMotionEvent defined", function () {
    var context = {};
    accelerometer = Accelerometer(actions, context);
    expect(last_action.type).toEqual("ACCELEROMETER_FAILED");
  });

  it("starting a pending accelerometer should raise an error", function () {
    var context = {DeviceMotionEvent: function () { }};
    accelerometer = Accelerometer(actions, context);
    expect(accelerometer.start).toThrowError(AccelerometerError);
  });

  it("starting a failed accelerometer should throw the appropriate error", function () {
    var context = {};
    accelerometer = Accelerometer(actions, context);
    var error = accelerometer.error;
    expect(accelerometer.start).toThrow(error);
  });

});
