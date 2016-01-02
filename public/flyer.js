var Lob = (function () { 'use strict';

  /* jshint esnext: true */

  function KeyError(key) {
    this.name = "KeyError";
    this.message = "key \"" + key + "\" not found";
    this.stack = (new Error()).stack;
  }
  KeyError.prototype = Object.create(Error.prototype);
  KeyError.prototype.constructor = KeyError;

  function Struct(defaults, source){
    "use strict";
    if ( !(this instanceof Struct) ) { return new Struct(defaults, source); }

    Object.assign(this, defaults);
    for (var key in source) {
      if (source.hasOwnProperty(key)) {
        if (!this.hasOwnProperty(key)) {
          throw new KeyError(key);
        }
        this[key] = source[key];
      }
    }
    Object.freeze(this);
  }

  Struct.prototype.hasKey = function (key) {
    return Object.keys(this).indexOf(key) !== -1;
  };

  Struct.prototype.fetch = function (key) {
    if (this.hasKey(key)) {
      return this[key];
    } else {
      throw new KeyError(key);
    }
  };

  Struct.prototype.set = function (key, value) {
    if (this[key] === value) {
      return this;
    }
    var tmp = {};
    tmp[key] = value;
    return this.merge(tmp);
  };

  Struct.prototype.update = function (key, operation) {
    return this.set(key, operation(this[key]));
  };

  Struct.prototype.merge = function (other) {
    return Struct(this, other);
  };

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

  var FLYER_STATE_DEFAULTS = {
    uplinkStatus: "UNKNOWN",
    latestReading: null, // DEBT best place a null object here
    currentFlight: [],
    flightHistory: [],
  };
  // DEBT not quite sure why this can't just be named state;
  function FlyerState(raw){
    if ( !(this instanceof FlyerState) ) { return new FlyerState(raw); }

    // DEBT with return statement is not an instance of FlyerState.
    // without return statement does not work at all.
    return Struct.call(this, FLYER_STATE_DEFAULTS, raw);
  }

  FlyerState.prototype = Object.create(Struct.prototype);
  FlyerState.prototype.constructor = FlyerState;

  var INVALID_STATE_MESSAGE = "Flyer did not recieve valid initial state";

  function Flyer(state){
    if ( !(this instanceof Flyer) ) { return new Flyer(state); }
    try {
      state = FlyerState(state || {});
    } catch (e) {
      throw new TypeError(INVALID_STATE_MESSAGE);
    }

    var flyer = this;
    flyer.state = state;

    flyer.uplinkAvailable = function(){
      // Set state action can cause projection to exhibit new state
      flyer.state = flyer.state.set("uplinkStatus", "AVAILABLE");
      // call log change. test listeners that the state has changed.
      // stateChange({state: state, action: "Uplink Available", log: debug});
      logInfo("[Uplink Available]");
      showcase(flyer.state);
    };
    this.startTransmitting = function(){
      // TODO test and handle case when uplink not available.
      flyer.state = flyer.state.set("uplinkStatus", "TRANSMITTING");
      showcase(flyer.state);
    };
    flyer.newReading = function(reading){
      var state = flyer.state.set("latestReading", reading);
      var currentFlight = state.currentFlight;
      var flightHistory = state.flightHistory;
      if (reading.magnitude < 4) {
        currentFlight =  currentFlight.concat(reading);
      } else if(currentFlight[0]) {
        // DEBT concat splits array so we double wrap the flight
        flightHistory = flightHistory.concat([currentFlight]);
        currentFlight = [];
      }
      state = state.set("currentFlight", currentFlight);
      state = state.set("flightHistory", flightHistory);
      flyer.state = state;
      transmitReading(reading);
      // logInfo("[New reading]", reading); DONT log this
      showcase(flyer.state);
    };
    flyer.resetReadings = function(){
      flyer.state = flyer.state.merge({
        latestReading: null,
        currentFlight: [],
        flightHistory: []
      });
      // transmit
      logInfo("[Reset readings]");
      showcase(flyer.state);
    };

    this.uplinkFailed = function(){
      flyer.state = flyer.state.set("uplinkStatus", "FAILED");
      showcase(flyer.state);
      logInfo("[Uplink Failed]");
    };

    // DEBT what to do before other values are set
    function transmitReading(reading){
      if (flyer.state.uplinkStatus === "TRANSMITTING") {
        flyer.uplink.transmitReading(reading);
      }
    }
    function showcase(state){
      flyer.view.render(present$1(state));
    }
    function logInfo() {
      flyer.logger.info.apply(flyer.logger, arguments);
    }
  }
  Flyer.State = FlyerState;

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
      var $avionics = document.querySelector("[data-interface~=avionics]");
      var display = new Display($avionics);
      for (var attribute in display) {
        if (display.hasOwnProperty(attribute)) {
          display[attribute] = presentation[attribute];
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

  return flyer;

})();
//# sourceMappingURL=flyer.js.map