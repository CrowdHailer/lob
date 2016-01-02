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
	    logInfo("[Reset readings]"); // Untested
	    showcase(flyer.state); // Untested
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
	  });
	  var channel = realtime.channels.get(channelName);
	}

	var uri = parseLocation(window.location);

	var uplinkController = FlyerUplinkController({
	  token: uri.query.token,
	  channel: uri.query.channel
	}, flyer);

	return flyer;

})();
//# sourceMappingURL=flyer.js.map