var Lob = (function () { 'use strict';

  // function Accelerometer() {
  //   console.log("Initializing Accelerometer");
  //   if(window.DeviceMotionEvent) {
  //   }
  // }

  function Accelerometer(context) {
    context = context || window;
    var state = Accelerometer.PENDING;

    if(context.DeviceMotionEvent) {
      // TODO test and remove from global
      context.addEventListener("devicemotion", function (deviceMotionEvent) {
        var x = deviceMotionEvent.accelerationIncludingGravity.x;
        if (typeof x === "number") {
          state = Accelerometer.WAITING;
          context.Lob.accelerometerWaiting();
        } else {
          state = Accelerometer.FAILED;
          context.Lob.accelerometerFailed();
        }
      });
    // ENDOF untested
    } else {
      state = Accelerometer.FAILED;
      context.Lob.accelerometerFailed();
    }

    return Object.create({}, {
      state: {
        get: function () { return state; }
      }
    });
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

  var accelerometer = Accelerometer$1();

  var dummyStore = {
    dispatch: function (action) {
      console.log(action);
    }
  };

  var dispatcher = Dispatcher([dummyStore]);

  console.log("Finished Boot");
  var boot = Actions(dispatcher);

  return boot;

})();