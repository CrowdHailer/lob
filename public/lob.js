var Lob = (function () { 'use strict';

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
      },
      // DEBT untested
      accelerometerFailed: function (error) {
        return dispatcher.dispatch({
          type: Actions.ACCELEROMETER_FAILED,
          error: error
        });
      }
    };
  }

  Actions.ACCELEROMETER_READING = "ACCELEROMETER_READING";
  Actions.ACCELEROMETER_FAILED = "ACCELEROMETER_FAILED";

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
      dispatch: {
        get: function () {
          return function (action) {
            console.log("accelerometer dispatching");
            console.log(action);
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

    function handleEvent(deviceMotionEvent) {
      var x = deviceMotionEvent.accelerationIncludingGravity.x;
      if (typeof x === "number") {
        state = Accelerometer.WAITING;
        actions.accelerometerWaiting();
      } else {
        error = new AccelerometerError("Device accelerometer returns null data");
        state = Accelerometer.FAILED;
        actions.accelerometerFailed(error);
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

  var dummyStore = {
    dispatch: function (action) {
      if (action.error) {
        console.warn(action);
      } else {
        console.info(action);
      }
    }
  };

  var stores = [dummyStore];
  var dispatcher = Dispatcher(stores);

  var app = Actions(dispatcher);

  var accelerometer = Accelerometer$1(app, window);
  stores.push(accelerometer);
  console.log(stores);

  console.log("Finished Boot");

  return app;

})();