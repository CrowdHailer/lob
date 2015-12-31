(function () { 'use strict';

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

	var uri = parseLocation(window.location);

	var State = {
	  fromUri: function(uri){
	    return {
	      token: uri.query["token"],
	      channelName: uri.query["channel"]
	    }
	  }
	}

	function Tracker(){
	  var state;
	  var tracker = this;
	  function updateProjection(state){
	    tracker.projection.update(state);
	  }
	  this.applyState = function(newState){
	    state = newState;
	    updateProjection(state);
	  }
	}

	function ConsoleView(logger){
	  function wrap(projection){
	    return "listening on: " + projection.channel + " with token: " + projection.token
	    // returns presentation
	  }

	  this.render = function(projection){
	    logger.info(wrap(projection));
	  }
	}

	function Projection(){
	  // Could be past console
	  var views = [];
	  var projection;
	  this.update = function(state){
	    // return projection
	    projection = {
	      channel: state.channelName,
	      token: state.token.slice(0, 4) + "..."
	    }
	  }
	  this.watch = function(view){
	    view(projection);
	    views.push(view);
	  }
	}

	var tracker = new Tracker();
	tracker.projection = new Projection();
	tracker.applyState(State.fromUri(uri));

	var consoleView = new ConsoleView(window.console);
	tracker.projection.watch(consoleView.render)

})();
//# sourceMappingURL=tracker.js.map