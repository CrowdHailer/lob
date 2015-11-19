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
      },
      // DEBT untested
      accelerometerWaiting: function () {
        return dispatcher.dispatch({
          type: Actions.ACCELEROMETER_WAITING,
        });
      },
      // DEBT untested
      startRecording: function () {
        return dispatcher.dispatch({
          type: Actions.START_RECORDING,
        });
      },
      // DEBT untested
      stopRecording: function () {
        return dispatcher.dispatch({
          type: Actions.STOP_RECORDING,
        });
      },
      // DEBT untested
      resetAvionics: function () {
        return dispatcher.dispatch({
          type: Actions.RESET_AVIONICS,
        });
      }
    };
  }

  Actions.ACCELEROMETER_READING = "ACCELEROMETER_READING";
  Actions.ACCELEROMETER_FAILED = "ACCELEROMETER_FAILED";
  Actions.ACCELEROMETER_WAITING = "ACCELEROMETER_WAITING";
  Actions.START_RECORDING = "START_RECORDING";
  Actions.STOP_RECORDING = "STOP_RECORDING";
  Actions.RESET_AVIONICS = "RESET_AVIONICS";

  /*jshint esnext: true */

  // TODO currently untested
  function throttle(fn, threshhold, scope) {
    threshhold = threshhold || 250;
    var last,
    deferTimer;
    return function () {
      var context = scope || this;
      var now = Date.now(), args = arguments;

      if (last && now < last + threshhold) {
        // hold on to it
        clearTimeout(deferTimer);
        deferTimer = setTimeout(function () {
          last = now;
          fn.apply(context, args);
        }, threshhold);
      } else {
        last = now;
        fn.apply(context, args);
      }
    };
  }

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
    var random = "RANDOM"; // Use to filter overrun events

    // var userAgent = context.navigator.userAgent;
    function handleReading(deviceMotionEvent) {
      var acceleration = {
        x: deviceMotionEvent.accelerationIncludingGravity.x,
        y: deviceMotionEvent.accelerationIncludingGravity.y,
        z: deviceMotionEvent.accelerationIncludingGravity.z
      };
      var timestamp = Date.now();

      actions.accelerometerReading({timestamp: timestamp, acceleration: acceleration});
      console.log(random);
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
              // TODO Untested case
              state = Accelerometer.RECORDING;
              context.addEventListener("devicemotion", throttledHandleReading);
            }
          };
        }
      },
      stop: {
        get: function () {
          // TODO untested function
          return function () {
            console.log(random);
            context.removeEventListener("devicemotion", throttledHandleReading);
          };
        }
      },
      dispatch: {
        get: function () {
          return function (action) {
            switch (action.type) {
              case Actions.START_RECORDING:
                this.start();
                break;
              case Actions.STOP_RECORDING:
                this.stop();
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

  var Accelerometer$1 = Accelerometer;

  function Avionics() {
    var state = "PENDING";
    var components = [];
    var initialTimestamp;

    return {
      accelerometerWaiting: function () {
        this.state = "READY";
        var self = this;
        components.forEach(function (c) { c.update(self); });
      },
      startRecording: function () {
        this.state = "RECORDING";
        var self = this;
        components.forEach(function (c) { c.update(self); });
      },
      accelerometerReading: function (reading) {
        if (!initialTimestamp) {
          initialTimestamp = reading.timestamp;
          this.remainingTime = 20;
        } else {
          var duration = (reading.timestamp - initialTimestamp) / 1000;
          if (duration > 20) {
            this.remainingTime = 0;
            this.state = Avionics.COMPLETED;
          } else {
            this.remainingTime = 20 - duration;
          }
        }
        // TODO test updates
        var self = this;
        components.forEach(function (c) { c.update(self); });
      },
      resetAvionics: function () {
        this.remainingTime = null;
        this.state = Avionics.READY;
        this.initialTimestamp = null;
        var self = this;
        components.forEach(function (c) { c.update(self); });
      },
      remainingTime: null,
      mount: function (component) {
        component.update(this);
        components.push(component);
      },
      dispatch: function (action) {
        // TODO test dispatch
        switch (action.type) {
          case Actions.START_RECORDING:
            this.startRecording();
            break;
          case Actions.ACCELEROMETER_WAITING:
            this.accelerometerWaiting();
            break;
          case Actions.ACCELEROMETER_READING:
            this.accelerometerReading(action.reading);
            break;
          case Actions.RESET_AVIONICS:
            this.resetAvionics();
            break;
          default:

        }
      },
      state: "PENDING"
    };
  }

  Avionics.PENDING = "PENDING";
  Avionics.READY = "READY";
  Avionics.RECORDING = "RECORDING";
  Avionics.COMPLETED = "COMPLETED";

  /*jshint esnext: true */

  function querySelector(selector, element) {
    return element.querySelector(selector);
  }

  function component(componentName, element) {
    return querySelector("[data-component~=" + componentName + "]", element);
  }

  function ready(fn) {
    if (document.readyState != 'loading'){
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function AvionicsConsole($root) {
    var $startButton = querySelector("[data-hook~=start]", $root);
    var $stopButton = querySelector("[data-hook~=stop]", $root);
    var $resetButton = querySelector("[data-hook~=reset]", $root);
    var $countdown = querySelector("[data-hook~=countdown]", $stopButton);

    $startButton.addEventListener("click", function (e) {
      var startEvent = new CustomEvent('startRecording', {bubbles: true});
      $root.dispatchEvent(startEvent);
    });
    $resetButton.addEventListener("click", function (e) {
      var resetEvent = new CustomEvent('resetAvionics', {bubbles: true});
      $root.dispatchEvent(resetEvent);
    });

    return Object.create({
      update: function (avionics) {
        if (avionics.state == "PENDING") {
          $startButton.disabled = true;
        } else {
          $startButton.disabled = false;
        }

        if (avionics.state == "RECORDING" || avionics.state == "COMPLETED") {
          $startButton.hidden = true;
        } else {
          $startButton.hidden = false;
        }

        if (avionics.state == "RECORDING") {
          $stopButton.hidden = false;
        } else {
          $stopButton.hidden = true;
        }

        if (avionics.state == "COMPLETED") {
          $resetButton.hidden = false;
        } else {
          $resetButton.hidden = true;
        }

        if (avionics.remainingTime) {
          $countdown.innerHTML = avionics.remainingTime + "s";
        }
      }
    }, {

    });
  }

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

  var avionics = Avionics();
  // DEBT
  stores.push(avionics);
  window.avionics = avionics;

  console.log("Finished Boot");

  ready(function () {
    var $avionicsConsole = component("avionics-console", window.document);
    var avionicsConsole = AvionicsConsole($avionicsConsole);
    avionics.mount(avionicsConsole);

    document.addEventListener("startRecording", function (event) {
      app.startRecording();
    });
    document.addEventListener("resetAvionics", function (event) {
      app.resetAvionics();
    });

  });

  return app;

})();