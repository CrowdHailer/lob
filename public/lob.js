var Lob = (function () { 'use strict';

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
            // error: function(..._){
            //   var args = Array.prototype.slice.call(arguments);
            //   console.error.apply(console, notices.concat(args));
            // }
            error: function (e) { throw e; }
        };
    }
    var DefaultLogger = {
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
        // error logging should be used for errors and in development these should be thrown
        error: function (e) { throw e; }
    };
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
        },
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
        if (world === void 0) { world = DefaultLogger; }
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

    var actions = {
        newReading: create(function (a) { return a; }, create$1("New Reading")),
        resetReadings: create(function () { null; }, create$1("Reset")),
        badReading: create(function (reading) { return reading; }, create$1("Bad Reading")),
        uplinkAvailable: create(function () { null; }, create$1("Uplink Available")),
        startStreaming: create(function () { null; }, create$1("Start Streaming")),
        failedConnection: create(function (reason) { return reason; }, create$1("Failed Connection")),
        closeNotice: create(function (reading) { return reading; }, create$1("Notice Closed")),
    };

    // Abstract store
    function AStore() {
        var state = {};
        return {
            advance: function (evolver) {
                console.log("advance");
                state = evolver(state);
            },
            getState: function () {
                return state;
            }
        };
    }
    ;
    var o;
    o = Object;
    function newReading(state) {
        console.log(state);
        var i = state.i || 0;
        return o.assign({}, state, { i: i + 1 });
    }
    ;
    function startStreaming(state) {
        if (state.isTransmitting) {
            return state;
        }
        return o.assign({}, state, { isTransmitting: true });
    }
    function MyStore() {
        var myStore = this;
        this.newReading = function () {
            myStore.advance(newReading);
        };
        this.startStreaming = function () {
            myStore.advance(startStreaming);
        };
    }
    var a = AStore();
    MyStore.prototype = a;
    function default_1$1() {
        return new MyStore();
    }

    function App(actions) {
        var services = {};
        var components = {};
        var store = default_1$1();
        actions.newReading.register(store.newReading);
        actions.startStreaming.register(store.startStreaming);
        return {
            registerService: function (name, factory) {
                services[name] = { factory: factory };
            },
            getService: function (name) {
                var service = services[name];
                if (service.instance) {
                    return service.instance;
                }
                return service.instance = service.factory(this);
            },
            registerComponent: function (name, factory) {
                components[name] = { factory: factory };
            },
            getComponent: function (name, element) {
                var component = components[name];
                return component.factory(element, this);
            },
            actions: actions,
            store: store
        };
    }

    // TODO currently untested
    function throttle(fn, threshhold, scope) {
        threshhold = threshhold || 250;
        var last, deferTimer;
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
            }
            else {
                last = now;
                fn.apply(context, args);
            }
        };
    }

    var DEVICEMOTION = "devicemotion";
    var THROTTLE_RATE = 100; function Accelerometer(app) {
        var actions = app.actions;
        function reportDeviceMotionEvent(deviceMotionEvent) {
            var raw = deviceMotionEvent.accelerationIncludingGravity;
            if (typeof raw.x === "number") {
                actions.newReading({ acceleration: { x: raw.x, y: raw.y, z: raw.z }, timestamp: Date.now() });
            }
            else {
                actions.badReading(raw);
            }
        }
        var throttledReport = throttle(reportDeviceMotionEvent, THROTTLE_RATE);
        return {
            start: function () {
                window.addEventListener(DEVICEMOTION, throttledReport);
            }
        };
    }

    function default_1(app) {
        // validate app
        console.log(app);
        return {
            start: function () {
                console.log("start connection");
                setTimeout(function () {
                    app.actions.failedConnection();
                }, 1000);
            },
            publish: function () {
                console.log("publishing");
            }
        };
    }
    ;

    console.log("starting client");
    var app = App(actions);
    app.registerService("accelerometer", Accelerometer);
    app.registerService("connection", default_1);
    // import Store from "./store.ts";
    // app.store = Store();
    app.getService("accelerometer").start();
    app.registerComponent("uplink", function ($root, app) {
        console.log($root);
        app.getService("connection").start();
        app.actions.newReading.register(function (r) {
            console.log(app.store.getState());
            console.log("uplink");
        });
    });
    app.getComponent("uplink", "dummy element");
    // store.newReading();
    // store.newReading();
    // store.newReading();
    app.actions.startStreaming();
    app.actions.newReading();

    return app;

})();
//# sourceMappingURL=lob.js.map