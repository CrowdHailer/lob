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

  /* jshint esnext: true */

  function readingsDuration(readings){
    if (!readings[0]) { return 0; }
    var last = readings.length;
    var t0 = readings[0].timestamp;
    var t1 = readings[last - 1].timestamp;
    // DEBT Magic number that make sense when sample rate is every 250ms
    return (t1 + 250 - t0) / 1000;
  }
  function altitudeForFreefallDuration(duration){
    // Altitude Calculation

    // SUVAT
    // s = vt - 0.5 * a * t^2
    // input
    // s = s <- desired result
    // u = ? <- not needed
    // v = 0 <- stationary at top
    // a = - 9.81 <- local g
    // t = flightTime/2 time to top of arc

    // s = 9.81 * 1/8 t^2
    var t = duration;
    return 9.81/8 * t * t;
  }

  function round(number){
    return parseFloat(number.toFixed(2));
  }

  function Presenter$1(raw){

    Object.defineProperty(this, "maxFlightTime", {
      get: function(){
        var flights = raw.flightHistory.concat([raw.currentFlight]);
        var flightDurations = flights.map(readingsDuration);
        var time =  Math.max.apply(null, flightDurations);
        return time;
      }
    });

    Object.defineProperty(this, "maxAltitude", {
      get: function(){
        var flightDurations = raw.flightHistory.map(readingsDuration);
        var max = Math.max.apply(null, [0].concat(flightDurations));
        return round(altitudeForFreefallDuration(max));
      }
    });

    Object.defineProperty(this, "currentReading", {
      get: function(){
        return raw.currentReading;
      }
    });

    Object.defineProperty(this, "hasThrow", {
      get: function(){
        return this.maxAltitude !== 0;
      }
    });

    Object.defineProperty(this, "uplinkStatus", {
      get: function(){
        return raw.uplinkStatus;
      }
    });
    Object.defineProperty(this, "channelName", {
      get: function(){
        return raw.channelName;
      }
    });
  }

  function present$1(app){
    return new Presenter$1(app);
  }

  function Flyer(world){
    if ( !(this instanceof Flyer) ) { return new Flyer(world); }
    var flyer = this;

    flyer.uplink = {
      transmitReading: function(reading){
      }
    };
    flyer.view = {
      render: function(){
        console.log("old view");
      }
    };

    var state;
    this.state = {
      uplinkStatus: "UNKNOWN"
    };
    function showcase(state){
      flyer.view.render(present$1(state));
    }
    function transmitReading(reading){
      flyer.uplink.transmitReading(reading);
    }
    function logInfo() {
      flyer.logger.info.apply(flyer.logger, arguments);
    }

    this.resetReadings = function(){
      state = resetReadings(state);
      logInfo("[Reset readings]");
      showcase(flyer.state);
    };
    this.newReading = function(reading){
      state = newReading(state, reading);
      transmitReading(reading);
      logInfo("[New reading]", reading);
      showcase(flyer.state);
    };
    this.uplinkAvailable = function(){
      flyer.state.uplinkStatus = "AVAILABLE";
      showcase(flyer.state);
    };
    this.uplinkFailed = function(){
      flyer.state.uplinkStatus = "FAILED";
      showcase(flyer.state);
    };
    this.startTransmitting = function(){
      // try {
      //   flyer.state.update("uplinkStatus", Uplink.startTransmitting)
      // } catch (e) {
      //   view.alert(uplink unavailable)
      // }
      flyer.state.uplinkStatus = "TRANSMITTING";
      showcase(flyer.state);
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

  /* jshint esnext: true */

  function format(i){
    var fixed = i.toFixed(2);
    var signed = i < 0 ? fixed : "+" + fixed;
    var short = "+00.00".length - signed.length;
    var padded = (short == 1) ? signed.replace(/[\+\-]/, function(sign){ return sign + "0"; }) : signed;
    return padded;
  }

  function Presenter(raw){

    Object.defineProperty(this, "maxFlightTime", {
      get: function(){
        return raw.maxFlightTime + " s";
      }
    });

    Object.defineProperty(this, "maxAltitude", {
      get: function(){
        return raw.maxAltitude + " m";
      }
    });

    Object.defineProperty(this, "currentReadout", {
      get: function(){
        // DEBT replace with reading toString method
        if (!raw.currentReading) {
          return "Waiting.";
        }
        var acceleration = raw.currentReading.acceleration;
        var x = acceleration.x;
        var y = acceleration.y;
        var z = acceleration.z;
        return "[" + [format(x), format(y), format(z)].join(", ") + "]";
      }
    });

    Object.defineProperty(this, "instruction", {
      get: function(){
        if (!this.hasThrow) {
          return "Lob phone to get started";
        }
        return "OK! can you lob any higher";
      }
    });

    Object.defineProperty(this, "uplinkStatus", {
      get: function(){
        return raw.uplinkStatus.toLowerCase();
      }
    });
    Object.defineProperty(this, "channelName", {
      get: function(){
        return raw.channelName;
      }
    });
  }

  function present(app){
    return new Presenter(app);
  }

  /* jshint esnext: true */

  function Display($root){
    var $maxFlightTime = $root.querySelector("[data-hook~=flight-time]");
    var $maxAltitude = $root.querySelector("[data-hook~=max-altitude]");
    var $currentReadout = $root.querySelector("[data-hook~=current-reading]");
    var $instruction = $root.querySelector("[data-display~=instruction]");
    var $uplink = $root.querySelector("[data-display~=uplink]");
    var $channel = $root.querySelector("[data-display~=channel]");

    return Object.create({}, {
      maxFlightTime: {
        set: function(maxFlightTime){
          $maxFlightTime.innerHTML = maxFlightTime;
        },
        enumerable: true
      },
      maxAltitude: {
        set: function(maxAltitude){
          $maxAltitude.innerHTML = maxAltitude;
        },
        enumerable: true
      },
      currentReadout: {
        set: function(currentReadout){
          $currentReadout.innerHTML = currentReadout;
        },
        enumerable: true
      },
      instruction: {
        set: function(instruction){
          $instruction.innerHTML = instruction;
        },
        enumerable: true
      },
      channelName: {
        set: function(channel){
          var content = "Watch on channel '" + channel + "'";
          $channel.innerHTML = content;
        },
        enumerable: true
      },
      uplinkStatus: {
        set: function(status){
          console.log("setting status");
          $uplink.classList.remove("unknown");
          $uplink.classList.remove("available");
          $uplink.classList.remove("transmitting");
          $uplink.classList.remove("failed");
          $uplink.classList.add(status);
        },
        enumerable: true
      }
    });

  }

  var flyer = new Flyer();
  flyer.logger = window.console;
  flyer.view = {
    render: function(projection){
      var presentation = present(projection);
      console.log("ola", presentation);
      var $avionics = document.querySelector("[data-interface~=avionics]");
      var display = new Display($avionics);
      console.log($avionics);
      for (var attribute in display) {
          console.log(presentation[attribute])
        if (display.hasOwnProperty(attribute)) {
          // display[attribute] = presenter[attribute];
        }
      }
    }
  };

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