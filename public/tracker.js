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

	var STATE_DEFAULTS = {
	  uplinkStatus: "UNKNOWN",
	  liveFlight: [],
	  flightSnapshot: null,
	  lockedToLiveTracking: false
	};

	function State(raw){
	  if ( !(this instanceof State) ) { return new State(raw); }

	  return Struct.call(this, STATE_DEFAULTS, raw);
	}

	State.prototype = Object.create(Struct.prototype);
	State.prototype.constructor = State;

	function isInFlight(reading){
	  // DEBT magic number
	  return reading.magnitude < 4;
	}

	function lastInArray(array){
	  return array[array.length - 1];
	}

	function lastNInArray(n, array){
	  return array.slice(Math.max(array.length - n, 0));
	}

	var TRACKER_INVALID_STATE_MESSAGE = "Tracker did not recieve valid initial state";

	function Tracker(state, world){
	  if ( !(this instanceof Tracker) ) { return new Tracker(state, world); }
	  try {
	    state = State(state || {});
	  } catch (e) {
	    // alert(e); DEBT throws in tests
	    throw new TypeError(TRACKER_INVALID_STATE_MESSAGE);
	    // return; // Will be needed if we move the error handling to logger
	  }
	  var tracker = this;
	  tracker.state = state;
	  // DEBT return to external assignment
	  world = world || {};
	  tracker.logger = world.logger // Or error causing of silent version;

	  tracker.uplinkAvailable = function(){
	    // Set state action can cause projection to exhibit new state
	    tracker.state = tracker.state.set("uplinkStatus", "AVAILABLE");
	    // call log change. test listeners that the state has changed.
	    logInfo("[Uplink Available]");
	    showcase(tracker.state);
	  };

	  tracker.newReading = function(reading){
	    var wasInFlight = lastInArray(tracker.state.liveFlight) && isInFlight(lastInArray(tracker.state.liveFlight));
	    var isNowGrounded = !isInFlight(reading);
	    if (wasInFlight && isNowGrounded) {
	      setTimeout(function () {
	        console.log('pause the reading');
	        // pause the reading
	      }, 1000);
	    }

	    var state = tracker.state.update("liveFlight", function(readings){
	      readings = readings.concat(reading);
	      return lastNInArray(5, readings);
	    });
	    // simplest is to just start timer
	    // here to add timer controller
	    tracker.state = state; // Assign at end to work as transaction
	    showcase(state);
	    logEvent("New reading");
	  };

	  tracker.takeSnapshot = function(){
	    // Only if not locked live
	    // Only if current flight has content
	    var state = tracker.state.set('flightSnapshot', tracker.state.liveFlight);

	    tracker.state = state; // Assign at end to work as transaction
	    showcase(state);
	    logEvent("Taken snapshot");
	  };

	  // watchlivetracking
	  // locklivetracking
	  // unlocklivetracking
	  function logEvent() {
	    tracker.logger.debug.apply(tracker.logger, arguments);
	  }
	  function logInfo() {
	    tracker.logger.info.apply(tracker.logger, arguments);
	  }
	  function showcase(state) {
	    tracker.showcase.update(state);
	  }

	  function projectState(state){
	    return state;
	  }

	  // The tracker application has an internal state.
	  // All observers know that the can watch a given projection of that state
	  // project and present overloaded verbs.
	  // options showcase or exhibit
	  // function showcase(state){
	  //   // The tracker just cares that its state is shown somewhere
	  //   tracker.showcase.dispatch(state);
	  // }



	  tracker.resetReadings = function(){
	  };
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

	/* jshint esnext: true */

	function TrackerShowcase(window){
	  if ( !(this instanceof TrackerShowcase) ) { return new TrackerShowcase(window); }

	  this.update = function(projection){
	    console.log('projection', projection);
	  };
	}

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

	// Pass in window not location in case state is needed
	// Router should always return some value of state it does not have the knowledge to regard it as invalid
	function Router(window){
	  if ( !(this instanceof Router) ) { return new Router(window); }
	  var router = this;
	  router.location = window.location;

	  function getState(){
	    var query = parse(router.location.search);
	    return {
	      token: query.token,
	      channel: query.channel
	    };
	  }

	  Object.defineProperty(router, 'state', {
	    get: getState
	  });
	}

	window.Tracker = Tracker;
	window.Tracker.Reading = Reading;

	var tracker = new Tracker();
	tracker.logger = window.console;
	tracker.showcase = TrackerShowcase(window);

	var router = Router(window);

	console.log(router.state);


	// Dom views should be initialized with the ready on certain selectors library

	return tracker;

})();
//# sourceMappingURL=tracker.js.map