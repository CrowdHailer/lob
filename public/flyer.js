(function () { 'use strict';

  if (!Object.assign) {
    Object.defineProperty(Object, 'assign', {
      enumerable: false,
      configurable: true,
      writable: true,
      value: function(target) {
        'use strict';
        if (target === undefined || target === null) {
          throw new TypeError('Cannot convert first argument to object');
        }

        var to = Object(target);
        for (var i = 1; i < arguments.length; i++) {
          var nextSource = arguments[i];
          if (nextSource === undefined || nextSource === null) {
            continue;
          }
          nextSource = Object(nextSource);

          var keysArray = Object.keys(nextSource);
          for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
            var nextKey = keysArray[nextIndex];
            var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
            if (desc !== undefined && desc.enumerable) {
              to[nextKey] = nextSource[nextKey];
            }
          }
        }
        return to;
      }
    });
  }

  function lens(key){
    return function(func){
      return function(obj){
        obj = obj || key;
        var update = {};
        update[key] = func(obj[key]);
        return Object.assign({}, obj, update);
      };
    };
  }

  var FREEFALL_LIMIT = 4;

  var Reading = {
    freefall: function(reading){
      var a = reading.acceleration;
      var magnitude = Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z);
      return magnitude < FREEFALL_LIMIT;
    }
  };

  var EMPTY_READINGS = Object.freeze({
    currentFlight: [],
    current: null,
    flightHistory: []
  });

  var readings = {
    reset: function(_readings){
      return EMPTY_READINGS;
    },
    // new: function(readings, reading){
    //   return Object.assign({}, readings, {current: reading});
    // }
  };

  var resetReadings = lens("readings")(readings.reset);

  function newReading(state, current){
    state = state || {};
    var readings = state.readings || EMPTY_READINGS;
    var currentFlight = readings.currentFlight;
    var flightHistory = readings.flightHistory;
    if (Reading.freefall(current)) {
      currentFlight = currentFlight.concat(current);
    } else if(currentFlight[0]) {
      flightHistory = flightHistory.concat([currentFlight]);
      currentFlight = [];
    }
    readings = {current: current, currentFlight: currentFlight, flightHistory: flightHistory};
    return Object.assign({}, state, {readings: readings});
  }

  function Flyer(world){
    if ( !(this instanceof Flyer) ) { return new Flyer(world); }
    var flyer = this;

    flyer.uplink = {
      transmitReading: function(reading){
      }
    };

    var state;
    this.state = {
      uplinkStatus: "UNKNOWN"
    };
    function logInfo() {
      flyer.logger.info.apply(flyer.logger, arguments);
    }
    function transmitReading(reading){
      flyer.uplink.transmitReading(reading);
    }

    this.resetReadings = function(){
      state = resetReadings(state);
      logInfo("[Reset readings]");
    };
    this.newReading = function(reading){
      state = newReading(state, reading);
      transmitReading(reading);
      logInfo("[New reading]", reading);
    };
    this.uplinkAvailable = function(){
      flyer.state.uplinkStatus = "AVAILABLE";
    };
    this.uplinkFailed = function(){
      flyer.state.uplinkStatus = "FAILED";
    };
    this.startTransmitting = function(){
      flyer.state.uplinkStatus = "TRANSMITTING";
    };

    // DEBT these properties belong on a projection
    Object.defineProperty(this, "currentReading", {
      get: function(){
        var readings = state.readings || {};
        return readings.current;
      }
    });
    Object.defineProperty(this, "currentFlight", {
      get: function(){
        var readings = state.readings || {};
        return readings.currentFlight || [];
      }
    });
    Object.defineProperty(this, "flightHistory", {
      get: function(){
        var readings = state.readings || {};
        return readings.flightHistory || [];
      }
    });
  }

  var flyer = new Flyer();
  flyer.logger = window.console;

  var DEVICEMOTION = "devicemotion";
  function AccelerometerController(global, flyer){
    global.addEventListener(DEVICEMOTION, function(deviceMotionEvent){
      console.debug("AccelerometerController", deviceMotionEvent);
      flyer.newReading({
        acceleration: deviceMotionEvent.accelerationIncludingGravity,
        timestamp: Date.now()
      });
    });
  }

  var accelerometerController = new AccelerometerController(window, flyer);

})();
//# sourceMappingURL=flyer.js.map