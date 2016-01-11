var Lob = (function () { 'use strict';

  /* jshint esnext: true */

  // Router makes use of current location
  // Router should always return some value of state it does not have the knowledge to regard it as invalid
  // Router is currently untested
  // Router does not follow modifications to the application location.
  // Router is generic for tracker and flyer at the moment
  // location is a size cause and might make sense to be lazily applied
  function Router(location){
    if ( !(this instanceof Router) ) { return new Router(location); }
    var router = this;
    router.location = location;

    function getState(){
      return {
        token: getQueryParameter('token', router.location.search),
        channelName: getQueryParameter('channel-name', router.location.search)
      };
    }

    Object.defineProperty(router, 'state', {
      get: getState
    });
  }

  function getQueryParameter(name, queryString) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec(queryString);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
  }

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

  function Projection(rawState){

    Object.defineProperty(this, "maxFlightTime", {
      get: function(){
        var flights = rawState.flightHistory.concat([rawState.currentFlight]);
        var flightDurations = flights.map(readingsDuration);
        var time =  Math.max.apply(null, flightDurations);
        return time;
      }
    });

    Object.defineProperty(this, "maxAltitude", {
      get: function(){
        var flightDurations = rawState.flightHistory.map(readingsDuration);
        var max = Math.max.apply(null, [0].concat(flightDurations));
        return round(altitudeForFreefallDuration(max));
      }
    });

    Object.defineProperty(this, "latestReading", {
      get: function(){
        return rawState.latestReading;
      }
    });

    Object.defineProperty(this, "hasThrow", {
      get: function(){
        return this.maxAltitude !== 0;
      }
    });

    Object.defineProperty(this, "uplinkStatus", {
      get: function(){
        return rawState.uplinkStatus;
      }
    });
    Object.defineProperty(this, "channelName", {
      get: function(){
        return rawState.uplinkDetails.channelName;
      }
    });
    Object.defineProperty(this, "alert", {
      get: function(){
        return rawState.alert;
      }
    });
  }

  function project(app){
    return new Projection(app);
  }

  /* jshint esnext: true */
  function isRational(x, other) {
    if (typeof x !== "number"){
      return false;
    }
    if (!isFinite(x)){
      return false;
    }
    var rest = Array.prototype.slice.call(arguments, 1);
    if (rest.length > 0) {
      return isRational.apply(this, rest);
    }
    return true;
  }

  function roundtoFour(number) {
    return parseFloat(number.toFixed(4));
  }

  function Reading(raw){
    if ( !(this instanceof Reading) ) { return new Reading(raw); }

    this.x = raw.x;
    this.y = raw.y;
    this.z = raw.z;
    this.timestamp = raw.timestamp;

    if (!isRational(this.x, this.y, this.z, this.timestamp)) {
      throw new TypeError("Reading should have numerical values for x, y, z & timestamp");
    }
  }

  Object.defineProperty(Reading.prototype, "magnitude", {
    get: function(){
      return roundtoFour(Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z));
    }
  });

  var FLYER_STATE_DEFAULTS = {
    uplinkStatus: "UNKNOWN",
    uplinkDetails: {},
    latestReading: null, // DEBT best place a null object here
    currentFlight: [],
    flightHistory: [],
    alert: ""
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
      // alert(e); DEBT throws in tests
      throw new TypeError(INVALID_STATE_MESSAGE);
    }

    var flyer = this;
    flyer.state = state;

    flyer.uplinkAvailable = function(details){
      // Set state action can cause projection to exhibit new state
      flyer.state = flyer.state.set("uplinkStatus", "AVAILABLE");
      flyer.state = flyer.state.set("uplinkDetails", details);
      // call log change. test listeners that the state has changed.
      // stateChange({state: state, action: "Uplink Available", log: debug});
      logInfo("Uplink Available", details);
      showcase(flyer.state);
    };
    this.startTransmitting = function(){
      // TODO test and handle case when uplink not available.
      flyer.state = flyer.state.set("uplinkStatus", "TRANSMITTING");
      showcase(flyer.state);
    };
    flyer.newReading = function(raw){
      try {
        raw.timestamp = Date.now();
        var reading = Reading(raw);
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
      } catch (err) {
        // Debt change to invalid reading
        if (err instanceof TypeError) {
          flyer.state = flyer.state.set("alert", "Accelerometer not found for this device. Please try again on a different mobile");
          showcase(flyer.state);
          logInfo("Bad reading", raw); // Untested
        } else {
          throw err;
        }
      }
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
      transmitResetReadings();
      showcase(flyer.state); // Untested
      logInfo("Reset readings"); // Untested
    };

    flyer.uplinkFailed = function(){
      flyer.state = flyer.state.set("uplinkStatus", "FAILED");
      showcase(flyer.state);
      logInfo("[Uplink Failed]");
    };

    flyer.closeAlert = function(){
      // DEBT untested
      flyer.state = flyer.state.set("alert", "");
      showcase(flyer.state);
      logInfo("Alert closed");
    };

    // DEBT what to do before other values are set
    function transmitReading(reading){
      if (flyer.state.uplinkStatus === "TRANSMITTING") {
        flyer.uplink.transmitReading(reading);
      }
    }
    function transmitResetReadings(){
      if (flyer.state.uplinkStatus === "TRANSMITTING") {
        flyer.uplink.transmitResetReadings();
      }
    }
    function showcase(state){
      flyer.view.render(project(state));
    }
    function logInfo() {
      flyer.logger.info.apply(flyer.logger, arguments);
    }
    // DEBT should be set separatly for Testing
    flyer.clock = window.Date;
  }
  Flyer.State = FlyerState;

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

  /* jshint esnext: true */

  function format(i){
    var fixed = i.toFixed(2);
    var signed = i < 0 ? fixed : "+" + fixed;
    var short = "+00.00".length - signed.length;
    var padded = (short == 1) ? signed.replace(/[\+\-]/, function(sign){ return sign + "0"; }) : signed;
    return padded;
  }

  function Presenter(projection){

    Object.defineProperty(this, "maxFlightTime", {
      get: function(){
        return projection.maxFlightTime + " s";
      }
    });

    Object.defineProperty(this, "maxAltitude", {
      get: function(){
        return projection.maxAltitude + " m";
      }
    });

    Object.defineProperty(this, "currentReadout", {
      get: function(){
        // DEBT replace with reading toString method
        if (!projection.latestReading) {
          return "Waiting.";
        }
        var acceleration = projection.latestReading;
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
        return projection.uplinkStatus.toLowerCase();
      }
    });
    Object.defineProperty(this, "channelName", {
      get: function(){
        return projection.channelName;
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

  /* jshint esnext: true */

  function Display$1($root){
    var $message = $root.querySelector("[data-display~=message]");
    return Object.create({}, {
      active: {
        set: function(active){
          var ACTIVE = "active";
          if (active) {
            $root.classList.add(ACTIVE);
          } else {
            $root.classList.remove(ACTIVE);
          }
        },
        enumerable: true
      },
      message: {
        set: function(message){
          console.log(message);
          $message.innerHTML = message;
        }
      }
    });
  }

  function throttle(fn, threshhold, scope) {
    threshhold = threshhold;
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

  var readingPublishLimit = 250; // ms

  try {


  var flyer = new Flyer();
  flyer.logger = window.console;
  flyer.view = {
    render: function(projection){
      var presentation = present(projection);
      var $avionics = document.querySelector("[data-interface~=avionics]");
      var $alert = document.querySelector("[data-display~=alert]");
      var display = new Display($avionics);
      for (var attribute in display) {
        if (display.hasOwnProperty(attribute)) {
          display[attribute] = presentation[attribute];
        }
      }
      var alertDisplay = Display$1($alert);
      var alertMessage = projection.alert;
      if (alertMessage) {
        alertDisplay.message = alertMessage;
        alertDisplay.active = true;
      } else {
        alertDisplay.active = false;
      }
    }
  };

  var DEVICEMOTION = "devicemotion";
  function AccelerometerController(global, flyer){
    global.addEventListener(DEVICEMOTION, function(deviceMotionEvent){
      flyer.newReading(deviceMotionEvent.accelerationIncludingGravity);
    });
  }

  var accelerometerController = new AccelerometerController(window, flyer);

  // import FlyerUplinkController from "./flyer/flyer-uplink-controller";
  function FlyerUplinkController(options, flyer){
    var channelName = options.channelName;
    var token = options.token;
    var realtime = new Ably.Realtime({ token: token });
    realtime.connection.on("connected", function(err) {
      // If we keep explicitly passing channel data to the controller we should pass it to the main app here
      flyer.uplinkAvailable({token: token, channelName: channelName});
    });
    realtime.connection.on("failed", function(err) {
      flyer.uplinkFailed();
      console.log(err.reason.message);
    });
    var channel = realtime.channels.get(channelName);
    function transmitReading(reading){
      channel.publish("newReading", reading, function(err) {
        // DEBT use provided console for messages
        // i.e. have message successful as app actions
        if(err) {
          console.warn("Unable to publish message; err = " + err.message);
        } else {
          console.info("Reding Message successfully sent", reading);
        }
      });
    }

    console.log('readingPublishLimit', readingPublishLimit, 'ms');
    flyer.uplink = {
      transmitReading: throttle(transmitReading, readingPublishLimit),
      transmitResetReadings: function(){
        channel.publish("resetReadings", {}, function(err) {
          // DEBT use provided console for messages
          // i.e. have message successful as app actions
          if(err) {
            window.console.warn("Unable to publish message; err = " + err.message);
          } else {
            // TODO comment to ably that if error here then no information released at all.
            window.console.info("Message successfully sent");
          }
        });
      }
    };
  }


  var router = Router(window.location);
  console.log('Router:', 'Started with initial state:', router.state);

  var uplinkController = FlyerUplinkController({
    token: router.state.token,
    channelName: router.state.channelName
  }, flyer);
  } catch (e) {
    alert(e);
    throw e;
  } finally {

  }

  return flyer;

})();
//# sourceMappingURL=flyer.js.map