var Lob = (function () { 'use strict';

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

  var Accelerometer$1 = Accelerometer;

  /*jshint esnext: true */

  function Dispatcher(stores) {
    return {
      dispatch: function (action) {
        stores.forEach(function (store) { store.dispatch(action); });
      }
    };
  }

  /*jshint esnext: true */

  function Actions(dispatcher) {
    return {
      accelerometerReading: function (reading) {
        return dispatcher.dispatch({
          type: Actions.ACCELEROMETER_READING,
          reading: reading
        });
      }
    };
  }

  Actions.ACCELEROMETER_READING = "ACCELEROMETER_READING";

  var accelerometer = Accelerometer$1({}, window);

  var dummyStore = {
    dispatch: function (action) {
      console.log(action);
    }
  };

  var dispatcher = Dispatcher([dummyStore]);

  var app = Actions(dispatcher);
  console.log("Finished Boot");

  return app;

})();