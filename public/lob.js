(function (exports) { 'use strict';

    function create$1(prefix) {
        prefix = "[" + prefix + "]";
        var notices = [prefix];
        return {
            info: function () {
                var _ = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _[_i - 0] = arguments[_i];
                }
                var args = Array.prototype.slice.call(arguments);
                console.info.apply(console, notices.concat(args));
            },
            warn: function () {
                var _ = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _[_i - 0] = arguments[_i];
                }
                var args = Array.prototype.slice.call(arguments);
                console.warn.apply(console, notices.concat(args));
            },
            error: function () {
                var _ = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _[_i - 0] = arguments[_i];
                }
                var args = Array.prototype.slice.call(arguments);
                console.error.apply(console, notices.concat(args));
            }
        };
    }
    var NullLogger = {
        info: function () {
            var a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                a[_i - 0] = arguments[_i];
            }
            null;
        },
        warn: function () {
            var a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                a[_i - 0] = arguments[_i];
            }
            null;
        },
        error: function () {
            var a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                a[_i - 0] = arguments[_i];
            }
            null;
        }
    };

    // Raise Error for circular calls
    function Dispatcher(handlers, world) {
        this.dispatch = function () {
            var args = arguments;
            handlers.forEach(function (handler) {
                try {
                    handler.apply({}, args);
                }
                catch (e) {
                    world.error(e);
                }
            });
            if (handlers.length == 0) {
                world.warn.apply(world, args);
            }
            else {
                world.info.apply(world, args);
            }
        };
        this.register = function (handler) {
            return new Dispatcher(handlers.concat(handler), world);
        };
    }
    ;
    function create$2(world) {
        if (world === void 0) { world = NullLogger; }
        return new Dispatcher([], world);
    }
    ;

    function create(filter, logger) {
        if (logger === void 0) { logger = NullLogger; }
        var action;
        var dispatcher = create$2(logger);
        action = function (minutiae) {
            var noDetailWithAction = arguments.length == 0;
            try {
                if (noDetailWithAction) {
                    dispatcher.dispatch();
                }
                else {
                    dispatcher.dispatch(filter(minutiae));
                }
            }
            catch (e) {
                logger.error(e);
            }
        };
        action.register = function (handler) {
            dispatcher = dispatcher.register(handler);
        };
        return action;
    }
    ;

    var FREEFALL_LIMIT = 4;
    var Reading = {
        freefall: function (reading) {
            var a = reading.acceleration;
            var magnitude = Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z);
            return magnitude < FREEFALL_LIMIT;
        }
    };
    var DEFAULT = {
        currentFlightReadings: [],
        currentReading: null,
        flightRecords: []
    };
    function handleReset(_state) {
        if (_state === void 0) { _state = DEFAULT; }
        return DEFAULT;
    }
    ;
    function handleNewReading(reading, state) {
        if (state === void 0) { state = DEFAULT; }
        var flightRecords = state.flightRecords;
        var currentFlightReadings = state.currentFlightReadings;
        if (Reading.freefall(reading)) {
            currentFlightReadings = currentFlightReadings.concat(reading);
        }
        else if (currentFlightReadings[0]) {
            flightRecords = flightRecords.concat([currentFlightReadings]);
            currentFlightReadings = [];
        }
        return {
            currentFlightReadings: currentFlightReadings,
            currentReading: reading,
            flightRecords: flightRecords
        };
    }
    ;

    console.log("Starting boot ...");
    var Actions = {
        newReading: create(function (a) { return a; }, create$1("New Reading")),
        reset: create(function () { null; }, create$1("Reset")),
        submitFlightLog: create(function () { null; }, create$1("Submit Flight log")),
        failedConnection: create(function (reason) { return reason; }, create$1("Failed Connection")),
    };
    function StateStore() {
        var state;
        var dispatcher = create$2();
        function dispatch(store) {
            dispatcher.dispatch(store);
        }
        return {
            reset: function () {
                state = handleReset(state);
                dispatch(this);
            },
            newReading: function (reading) {
                state = handleNewReading(reading, state);
                dispatch(this);
            },
            getState: function () {
                return state;
            },
            register: function (callback) {
                dispatcher = dispatcher.register(callback);
            }
        };
    }
    var store = StateStore();

    exports['default'] = Actions;
    exports.store = store;

})((this.Lob = {}));
//# sourceMappingURL=lob.js.map