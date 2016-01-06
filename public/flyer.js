var Lob = (function () { 'use strict';

	function __commonjs(fn, module) { return module = { exports: {} }, fn(module, module.exports), module.exports; }

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

	var index$2 = __commonjs(function (module) {
	'use strict';
	module.exports = function (str) {
		return encodeURIComponent(str).replace(/[!'()*]/g, function (c) {
			return '%' + c.charCodeAt(0).toString(16);
		});
	};
	});

	var require$$0 = (index$2 && typeof index$2 === 'object' && 'default' in index$2 ? index$2['default'] : index$2);

	var index = __commonjs(function (module, exports) {
	'use strict';
	var strictUriEncode = require$$0;

	exports.extract = function (str) {
		return str.split('?')[1] || '';
	};

	exports.parse = function (str) {
		if (typeof str !== 'string') {
			return {};
		}

		str = str.trim().replace(/^(\?|#|&)/, '');

		if (!str) {
			return {};
		}

		return str.split('&').reduce(function (ret, param) {
			var parts = param.replace(/\+/g, ' ').split('=');
			// Firefox (pre 40) decodes `%3D` to `=`
			// https://github.com/sindresorhus/query-string/pull/37
			var key = parts.shift();
			var val = parts.length > 0 ? parts.join('=') : undefined;

			key = decodeURIComponent(key);

			// missing `=` should be `null`:
			// http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
			val = val === undefined ? null : decodeURIComponent(val);

			if (!ret.hasOwnProperty(key)) {
				ret[key] = val;
			} else if (Array.isArray(ret[key])) {
				ret[key].push(val);
			} else {
				ret[key] = [ret[key], val];
			}

			return ret;
		}, {});
	};

	exports.stringify = function (obj) {
		return obj ? Object.keys(obj).sort().map(function (key) {
			var val = obj[key];

			if (val === undefined) {
				return '';
			}

			if (val === null) {
				return key;
			}

			if (Array.isArray(val)) {
				return val.sort().map(function (val2) {
					return strictUriEncode(key) + '=' + strictUriEncode(val2);
				}).join('&');
			}

			return strictUriEncode(key) + '=' + strictUriEncode(val);
		}).filter(function (x) {
			return x.length > 0;
		}).join('&') : '';
	};
	});

	var parse = index.parse;

	var URI_DEFAULTS = {
	  path: [],
	  query: {},
	};

	function URI(raw){
	  if ( !(this instanceof URI) ) { return new URI(raw); }

	  return Struct.call(this, URI_DEFAULTS, raw);
	}

	URI.prototype = Object.create(Struct.prototype);
	URI.prototype.constructor = URI;

	function parseLocation(location){
	  var query = parse(location.search);
	  var path = location.pathname.substring(1).split("/");
	  return new URI({path: path, query: query});
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

	function Projection(raw){

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
	      return raw.uplinkDetails.channelName;
	    }
	  });
	  Object.defineProperty(this, "alert", {
	    get: function(){
	      return raw.alert;
	    }
	  });
	}

	function project(app){
	  return new Projection(app);
	}

	/* jshint esnext: true */

	function roundtoFour(number) {
	  return parseFloat(number.toFixed(4));
	}

	function Reading(raw, clock){
	  if ( !(this instanceof Reading) ) { return new Reading(raw, clock); }

	  this.x = raw.x;
	  this.y = raw.y;
	  this.z = raw.z;
	  this.timestamp = clock.now();

	  if (typeof this.x !== "number") {
	    throw new TypeError("Reading should have numerical values for x, y, z");
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
	    alert(e);
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
	      var reading = Reading(raw, flyer.clock);
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
	function FlyerUplinkController(options, tracker){
	  var channelName = options.channel;
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
	  tracker.uplink = {
	    transmitReading: function(reading){
	      channel.publish("newReading", reading, function(err) {
	        // DEBT use provided console for messages
	        // i.e. have message successful as app actions
	        if(err) {
	          console.warn("Unable to publish message; err = " + err.message);
	        } else {
	          console.info("Message successfully sent", reading);
	        }
	      });
	    },
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


	var uri = parseLocation(window.location);

	var uplinkController = FlyerUplinkController({
	  token: uri.query.token,
	  channel: uri.query.channel
	}, flyer);
	} catch (e) {
	  alert(e);
	  throw e;
	} finally {

	}

	return flyer;

})();
//# sourceMappingURL=flyer.js.map