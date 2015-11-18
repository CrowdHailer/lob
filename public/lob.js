var Lob = (function () { 'use strict';

  /*jshint esnext: true */

  function Accelerometer() {
    console.log("Initializing Accelerometer");
    if(window.DeviceMotionEvent) {
      window.addEventListener("devicemotion", function (deviceMotionEvent) {
        console.log(deviceMotionEvent);
        console.log(deviceMotionEvent.accelerationIncludingGravity.x);
      });
    }
  }

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

  var accelerometer = Accelerometer();

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