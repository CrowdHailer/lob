var Lob = (function () { 'use strict';

    /* jshint esnext: true */
    function wrap(console, settings) {
        var prefix;
        var notices = [];
        if (settings.prefix) {
            prefix = "[" + settings.prefix + "]";
            notices = notices.concat(prefix);
        }
        var argsToArray = function (args) {
            return Array.prototype.slice.call(args);
        };
        function debug() {
            console.debug.apply(console, notices.concat(argsToArray(arguments)));
        }
        function info() {
            console.info.apply(console, notices.concat(argsToArray(arguments)));
        }
        function warn(a) {
            var args = argsToArray(arguments);
            console.warn.apply(console, notices.concat(args));
        }
        function error(e) {
            var args = argsToArray(arguments);
            console.error.apply(console, notices.concat(args));
        }
        return {
            debug: debug,
            info: info,
            warn: warn,
            error: error,
        };
    }
    var DEFAULT = {
        info: function () { },
        warn: function () { },
        // error logging should be used for errors and in development these should be thrown
        error: function (e) { throw e; }
    };

    // Raise Error for circular calls
    function Dispatcher(handlers, console) {
        this.dispatch = function () {
            var args = arguments;
            handlers.forEach(function (handler) {
                try {
                    handler.apply({}, args);
                }
                catch (e) {
                    console.error(e);
                }
            });
            if (handlers.length === 0) {
                console.warn.apply(console, args);
            }
            else {
                console.info.apply(console, args);
            }
        };
        this.register = function (handler) {
            return new Dispatcher(handlers.concat(handler), console);
        };
    }
    function create(console) {
        if (console == void 0) {
            console = DEFAULT;
        }
        return new Dispatcher([], console);
    }

    /* jshint esnext: true */
    function argsToArray(args) {
        return Array.prototype.slice.call(args);
    }

    // Simply a stateful dispatcher
    // DEBT should be start not create
    function start$1(logger) {
        if (logger == void 0) {
            logger = DEFAULT;
        }
        var dispatcher = create(logger);
        var action = function () {
            var args = argsToArray(arguments);
            dispatcher.dispatch.apply({}, args);
        };
        action.register = function (handler) {
            dispatcher = dispatcher.register(handler);
        };
        return action;
    }

    /* jshint esnext: true */
    // State will never be assigned if evolver throws error
    // - no need for rollback;
    // Handle errors in logger?
    // - if wanted then the evolver should push errors to logger
    // Advance function to return instance of store?
    // Option to instantiate store with state
    function GeneralStore(state, handlers) {
        var store = this;
        function advance(evolver) {
            state = evolver(state);
        }
        this.advance = advance;
        function wrapHandler(handler) {
            return function () {
                var args = Array.prototype.slice.call(arguments);
                state = handler.apply({}, [state].concat(args));
            };
        }
        for (var name in handlers) {
            this[name] = wrapHandler(handlers[name]);
        }
        Object.defineProperty(this, "state", {
            get: function () { return state; }
        });
    }
    function enhance(handlers) {
        return {
            start: function (state) {
                return new GeneralStore(state, handlers);
            }
        };
    }

    if (!Object.assign) {
        Object.defineProperty(Object, 'assign', {
            enumerable: false,
            configurable: true,
            writable: true,
            value: function (target) {
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

    function lens(key) {
        return function (func) {
            return function (obj) {
                obj = obj || key;
                var update = {};
                update[key] = func(obj[key]);
                return Object.assign({}, obj, update);
            };
        };
    }
    var FREEFALL_LIMIT = 4;
    var Reading = {
        freefall: function (reading) {
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
        reset: function (_readings) {
            return EMPTY_READINGS;
        },
    };
    var resetReadings = lens("readings")(readings.reset);
    function newReading(state, current) {
        var readings = state.readings;
        var currentFlight = readings.currentFlight;
        var flightHistory = readings.flightHistory;
        if (Reading.freefall(current)) {
            currentFlight = currentFlight.concat(current);
        }
        else if (currentFlight[0]) {
            flightHistory = flightHistory.concat([currentFlight]);
            currentFlight = [];
        }
        readings = { current: current, currentFlight: currentFlight, flightHistory: flightHistory };
        return Object.assign({}, state, { readings: readings });
    }


    var StateUpdates = Object.freeze({
        resetReadings: resetReadings,
        newReading: newReading
    });

    var Store = enhance(StateUpdates);

    function Client(world) {
        var logger = world.console;
        var events = {
            resetReadings: start$1(wrap(logger, { prefix: "Reset readings" })),
            newReading: start$1(wrap(logger, { prefix: "New reading" }))
        };
        var store = Store.start();
        events.resetReadings.register(store.resetReadings);
        events.newReading.register(store.newReading);
        this.resetReadings = function () {
            events.resetReadings();
        };
        this.newReading = function (reading) {
            // Validate here
            events.newReading(reading);
        };
        Object.defineProperty(this, "currentReading", {
            get: function () {
                return store.state.readings.current;
            }
        });
        Object.defineProperty(this, "currentFlight", {
            get: function () {
                return store.state.readings.currentFlight;
            }
        });
        Object.defineProperty(this, "flightHistory", {
            get: function () {
                return store.state.readings.flightHistory;
            }
        });
        // events.resetReadings();
    }
    function start(world) {
        return new Client(world);
    }

    var logger = Object.assign({}, window.console, { error: function (e) {
            var args = argsToArray(arguments);
            var error = args[args.length - 1];
            console.info.apply(console, args);
            throw error;
        } });
    var client = start({
        console: wrap(logger, { prefix: "Lob client" })
    });

    return client;

})();
//# sourceMappingURL=lob.js.map