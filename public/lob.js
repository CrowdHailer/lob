var Lob = (function () { 'use strict';

    /* jshint esnext: true */
    function argsToArray(args) {
        return Array.prototype.slice.call(args);
    }
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

    function wrap(logger, settings) {
        var prefix;
        var notices = [];
        if (settings.prefix) {
            prefix = "[" + settings.prefix + "]";
            notices = notices.concat(prefix);
        }
        function debug() {
            logger.debug.apply(logger, notices.concat(argsToArray(arguments)));
        }
        function info() {
            logger.info.apply(logger, notices.concat(argsToArray(arguments)));
        }
        function warn(a) {
            var args = argsToArray(arguments);
            logger.warn.apply(logger, notices.concat(args));
        }
        function error(e) {
            var args = argsToArray(arguments);
            logger.error.apply(logger, notices.concat(args));
        }
        return {
            debug: debug,
            info: info,
            warn: warn,
            error: error,
        };
    }
    var silent = {
        debug: function () { },
        info: function () { },
        warn: function () { },
        // error logging should be used for errors and in development these should be thrown
        error: function (e) { throw e; }
    };
    var development = {
        debug: function () {
            var args = argsToArray(arguments);
            console.debug.apply(console, args);
        },
        info: function () {
            var args = argsToArray(arguments);
            console.info.apply(console, args);
        },
        warn: function () {
            var args = argsToArray(arguments);
            console.warn.apply(console, args);
        },
        error: function (e) {
            var args = argsToArray(arguments);
            var error = args[args.length - 1];
            console.info.apply(console, args);
            throw error;
        }
    };

    // Raise Error for circular calls
    function Dispatcher(handlers, logger) {
        this.dispatch = function () {
            var args = arguments;
            handlers.forEach(function (handler) {
                try {
                    handler.apply({}, args);
                }
                catch (e) {
                    logger.error(e);
                }
            });
            if (handlers.length === 0) {
                logger.warn.apply(logger, args);
            }
            else {
                logger.info.apply(logger, args);
            }
        };
        this.register = function (handler) {
            return new Dispatcher(handlers.concat(handler), logger);
        };
    }
    function create$2(logger) {
        if (logger == void 0) {
            logger = silent;
        }
        return new Dispatcher([], logger);
    }

    // Simply a stateful dispatcher
    function start$1(logger) {
        if (logger == void 0) {
            logger = silent;
        }
        var dispatcher = create$2(logger);
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
        state = state || {};
        var readings = state.readings || EMPTY_READINGS;
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
    function badReading(state) {
        var MESSAGE = "Could not read the data from this device. Please try again on a mobile with working accelerometer.";
        state = state || {};
        var notices = state.notices || [];
        notices = notices.concat(MESSAGE);
        return Object.assign({}, state, { notices: notices });
    }
    function closeNotices(state) {
        state = state || {};
        var notices = [];
        return Object.assign({}, state, { notices: notices });
    }


    var StateUpdates = Object.freeze({
        resetReadings: resetReadings,
        newReading: newReading,
        badReading: badReading,
        closeNotices: closeNotices
    });

    var Store = enhance(StateUpdates);

    /* jshint esnext: true */
    var DEVICEMOTION = "devicemotion";
    var THROTTLE_RATE = 100; function Accelerometer(app) {
        function reportDeviceMotionEvent(deviceMotionEvent) {
            var raw = deviceMotionEvent.accelerationIncludingGravity;
            if (typeof raw.x === "number") {
                app.newReading({ acceleration: { x: raw.x, y: raw.y, z: raw.z }, timestamp: Date.now() });
            }
            else {
                app.badReading(raw);
            }
        }
        var throttledReport = throttle(reportDeviceMotionEvent, THROTTLE_RATE);
        return {
            start: function () {
                window.addEventListener(DEVICEMOTION, throttledReport);
            }
        };
    }

    function Client(world) {
        var logger = world.console;
        var events = {
            resetReadings: start$1(wrap(logger, { prefix: "Reset readings" })),
            newReading: start$1(wrap(logger, { prefix: "New reading" })),
            badReading: start$1(wrap(logger, { prefix: "Bad reading" })),
            closeNotices: start$1(wrap(logger, { prefix: "Close Notices" }))
        };
        var store = Store.start();
        events.resetReadings.register(store.resetReadings);
        events.newReading.register(store.newReading);
        events.badReading.register(store.badReading);
        events.closeNotices.register(store.closeNotices);
        this.accelerometer = Accelerometer(this);
        this.resetReadings = function () {
            events.resetReadings();
        };
        this.onResetReadings = function (listener) {
            events.resetReadings.register(listener);
        };
        this.newReading = function (reading) {
            // Validate here
            events.newReading(reading);
        };
        this.onNewReading = function (listener) {
            events.newReading.register(listener);
        };
        this.badReading = function () {
            events.badReading();
        };
        this.onBadReading = function (listener) {
            events.badReading.register(listener);
        };
        this.closeNotices = function () {
            events.closeNotices();
        };
        this.onCloseNotices = function (listener) {
            events.closeNotices.register(listener);
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
        Object.defineProperty(this, "notices", {
            get: function () {
                return store.state.notices;
            }
        });
        // DEBT do not start here or enuse that components read first time on starting.
        // events.resetReadings();
    }
    function start(world) {
        return new Client(world);
    }

    /* jshint esnext: true */
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        }
        else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    /**
     * Copyright 2014 Craig Campbell
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     * http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     *
     * GATOR.JS
     * Simple Event Delegation
     *
     * @version 1.2.4
     *
     * Compatible with IE 9+, FF 3.6+, Safari 5+, Chrome
     *
     * Include legacy.js for compatibility with older browsers
     *
     *             .-._   _ _ _ _ _ _ _ _
     *  .-''-.__.-'00  '-' ' ' ' ' ' ' ' '-.
     * '.___ '    .   .--_'-' '-' '-' _'-' '._
     *  V: V 'vv-'   '_   '.       .'  _..' '.'.
     *    '=.____.=_.--'   :_.__.__:_   '.   : :
     *            (((____.-'        '-.  /   : :
     *                              (((-'\ .' /
     *                            _____..'  .'
     *                           '-._____.-'
     */
    var _matcher;
    var _level = 0;
    var _id = 0;
    var _handlers = {};
    var _gatorInstances = {};
    function _addEvent(gator, type, callback) {
        // blur and focus do not bubble up but if you use event capturing
        // then you will get them
        var useCapture = type == 'blur' || type == 'focus';
        gator.element.addEventListener(type, callback, useCapture);
    }
    function _cancel(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    /**
     * returns function to use for determining if an element
     * matches a query selector
     *
     * @returns {Function}
     */
    function _getMatcher(element) {
        if (_matcher) {
            return _matcher;
        }
        if (element.matches) {
            _matcher = element.matches;
            return _matcher;
        }
        if (element.webkitMatchesSelector) {
            _matcher = element.webkitMatchesSelector;
            return _matcher;
        }
        if (element.mozMatchesSelector) {
            _matcher = element.mozMatchesSelector;
            return _matcher;
        }
        if (element.msMatchesSelector) {
            _matcher = element.msMatchesSelector;
            return _matcher;
        }
        if (element.oMatchesSelector) {
            _matcher = element.oMatchesSelector;
            return _matcher;
        }
        // if it doesn't match a native browser method
        // fall back to the gator function
        _matcher = Gator.matchesSelector;
        return _matcher;
    }
    /**
     * determines if the specified element matches a given selector
     *
     * @param {Node} element - the element to compare against the selector
     * @param {string} selector
     * @param {Node} boundElement - the element the listener was attached to
     * @returns {void|Node}
     */
    function _matchesSelector(element, selector, boundElement) {
        // no selector means this event was bound directly to this element
        if (selector == '_root') {
            return boundElement;
        }
        // if we have moved up to the element you bound the event to
        // then we have come too far
        if (element === boundElement) {
            return;
        }
        // if this is a match then we are done!
        if (_getMatcher(element).call(element, selector)) {
            return element;
        }
        // if this element did not match but has a parent we should try
        // going up the tree to see if any of the parent elements match
        // for example if you are looking for a click on an <a> tag but there
        // is a <span> inside of the a tag that it is the target,
        // it should still work
        if (element.parentNode) {
            _level++;
            return _matchesSelector(element.parentNode, selector, boundElement);
        }
    }
    function _addHandler(gator, event, selector, callback) {
        if (!_handlers[gator.id]) {
            _handlers[gator.id] = {};
        }
        if (!_handlers[gator.id][event]) {
            _handlers[gator.id][event] = {};
        }
        if (!_handlers[gator.id][event][selector]) {
            _handlers[gator.id][event][selector] = [];
        }
        _handlers[gator.id][event][selector].push(callback);
    }
    function _removeHandler(gator, event, selector, callback) {
        // if there are no events tied to this element at all
        // then don't do anything
        if (!_handlers[gator.id]) {
            return;
        }
        // if there is no event type specified then remove all events
        // example: Gator(element).off()
        if (!event) {
            for (var type in _handlers[gator.id]) {
                if (_handlers[gator.id].hasOwnProperty(type)) {
                    _handlers[gator.id][type] = {};
                }
            }
            return;
        }
        // if no callback or selector is specified remove all events of this type
        // example: Gator(element).off('click')
        if (!callback && !selector) {
            _handlers[gator.id][event] = {};
            return;
        }
        // if a selector is specified but no callback remove all events
        // for this selector
        // example: Gator(element).off('click', '.sub-element')
        if (!callback) {
            delete _handlers[gator.id][event][selector];
            return;
        }
        // if we have specified an event type, selector, and callback then we
        // need to make sure there are callbacks tied to this selector to
        // begin with.  if there aren't then we can stop here
        if (!_handlers[gator.id][event][selector]) {
            return;
        }
        // if there are then loop through all the callbacks and if we find
        // one that matches remove it from the array
        for (var i = 0; i < _handlers[gator.id][event][selector].length; i++) {
            if (_handlers[gator.id][event][selector][i] === callback) {
                _handlers[gator.id][event][selector].splice(i, 1);
                break;
            }
        }
    }
    function _handleEvent(id, e, type) {
        if (!_handlers[id][type]) {
            return;
        }
        var target = e.target || e.srcElement, selector, match, matches = {}, i = 0, j = 0;
        // find all events that match
        _level = 0;
        for (selector in _handlers[id][type]) {
            if (_handlers[id][type].hasOwnProperty(selector)) {
                match = _matchesSelector(target, selector, _gatorInstances[id].element);
                if (match && Gator.matchesEvent(type, _gatorInstances[id].element, match, selector == '_root', e)) {
                    _level++;
                    _handlers[id][type][selector].match = match;
                    matches[_level] = _handlers[id][type][selector];
                }
            }
        }
        // stopPropagation() fails to set cancelBubble to true in Webkit
        // @see http://code.google.com/p/chromium/issues/detail?id=162270
        e.stopPropagation = function () {
            e.cancelBubble = true;
        };
        for (i = 0; i <= _level; i++) {
            if (matches[i]) {
                for (j = 0; j < matches[i].length; j++) {
                    if (matches[i][j].call(matches[i].match, e) === false) {
                        Gator.cancel(e);
                        return;
                    }
                    if (e.cancelBubble) {
                        return;
                    }
                }
            }
        }
    }
    /**
     * binds the specified events to the element
     *
     * @param {string|Array} events
     * @param {string} selector
     * @param {Function} callback
     * @param {boolean=} remove
     * @returns {Object}
     */
    function _bind(events, selector, callback, remove) {
        // fail silently if you pass null or undefined as an alement
        // in the Gator constructor
        if (!this.element) {
            return;
        }
        if (!(events instanceof Array)) {
            events = [events];
        }
        if (!callback && typeof (selector) == 'function') {
            callback = selector;
            selector = '_root';
        }
        var id = this.id, i;
        function _getGlobalCallback(type) {
            return function (e) {
                _handleEvent(id, e, type);
            };
        }
        for (i = 0; i < events.length; i++) {
            if (remove) {
                _removeHandler(this, events[i], selector, callback);
                continue;
            }
            if (!_handlers[id] || !_handlers[id][events[i]]) {
                Gator.addEvent(this, events[i], _getGlobalCallback(events[i]));
            }
            _addHandler(this, events[i], selector, callback);
        }
        return this;
    }
    /**
     * Gator object constructor
     *
     * @param {Node} element
     */
    function Gator(element, id) {
        // called as function
        if (!(this instanceof Gator)) {
            // only keep one Gator instance per node to make sure that
            // we don't create a ton of new objects if you want to delegate
            // multiple events from the same node
            //
            // for example: Gator(document).on(...
            for (var key in _gatorInstances) {
                if (_gatorInstances[key].element === element) {
                    return _gatorInstances[key];
                }
            }
            _id++;
            _gatorInstances[_id] = new Gator(element, _id);
            return _gatorInstances[_id];
        }
        this.element = element;
        this.id = id;
    }
    /**
     * adds an event
     *
     * @param {string|Array} events
     * @param {string} selector
     * @param {Function} callback
     * @returns {Object}
     */
    Gator.prototype.on = function (events, selector, callback) {
        return _bind.call(this, events, selector, callback);
    };
    /**
     * removes an event
     *
     * @param {string|Array} events
     * @param {string} selector
     * @param {Function} callback
     * @returns {Object}
     */
    Gator.prototype.off = function (events, selector, callback) {
        return _bind.call(this, events, selector, callback, true);
    };
    Gator.matchesSelector = function () { };
    Gator.cancel = _cancel;
    Gator.addEvent = _addEvent;
    Gator.matchesEvent = function () {
        return true;
    };
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = Gator;
    }
    var Events = Gator;

    function Controller($root, app) {
        var events = Events($root);
        events.on("click", "[data-command~=reset]", function (evt) {
            app.resetReadings();
        });
        events.on("click", "[data-command~=start-transmitting]", function (evt) {
            app.startTransmitting();
        });
    }

    /* jshint esnext: true */
    function Display($root) {
        var $maxFlightTime = $root.querySelector("[data-hook~=flight-time]");
        var $maxAltitude = $root.querySelector("[data-hook~=max-altitude]");
        var $currentReadout = $root.querySelector("[data-hook~=current-reading]");
        var $instruction = $root.querySelector("[data-display~=instruction]");
        return Object.create({}, {
            maxFlightTime: {
                set: function (maxFlightTime) {
                    $maxFlightTime.innerHTML = maxFlightTime;
                },
                enumerable: true
            },
            maxAltitude: {
                set: function (maxAltitude) {
                    $maxAltitude.innerHTML = maxAltitude;
                },
                enumerable: true
            },
            currentReadout: {
                set: function (currentReadout) {
                    $currentReadout.innerHTML = currentReadout;
                },
                enumerable: true
            },
            instruction: {
                set: function (instruction) {
                    $instruction.innerHTML = instruction;
                },
                enumerable: true
            },
        });
    }

    /* jshint esnext: true */
    function readingsDuration(readings) {
        if (!readings[0]) {
            return 0;
        }
        var last = readings.length;
        var t0 = readings[0].timestamp;
        var t1 = readings[last - 1].timestamp;
        // DEBT Magic number that make sense when sample rate is every 250ms
        return (t1 + 250 - t0) / 1000;
    }
    function altitudeForFreefallDuration(duration) {
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
        return 9.81 / 8 * t * t;
    }
    function format(i) {
        var fixed = i.toFixed(2);
        var signed = i < 0 ? fixed : "+" + fixed;
        var short = "+00.00".length - signed.length;
        var padded = (short == 1) ? signed.replace(/[\+\-]/, function (sign) { return sign + "0"; }) : signed;
        return padded;
    }
    function Presenter(raw) {
        Object.defineProperty(this, "maxFlightTime", {
            get: function () {
                var flights = raw.flightHistory.concat([raw.currentFlight]);
                var flightDurations = flights.map(readingsDuration);
                var time = Math.max.apply(null, flightDurations);
                return time.toFixed(2) + " s";
            }
        });
        Object.defineProperty(this, "maxAltitude", {
            get: function () {
                var flightDurations = raw.flightHistory.map(readingsDuration);
                var max = Math.max.apply(null, [0].concat(flightDurations));
                return altitudeForFreefallDuration(max).toFixed(2) + " m";
            }
        });
        Object.defineProperty(this, "currentReadout", {
            get: function () {
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
            get: function () {
                if (this.maxAltitude == "0.00 m") {
                    return "Lob phone to get started";
                }
                return "OK! can you lob any higher";
            }
        });
    }
    function present(app) {
        return new Presenter(app);
    }

    function create($root, app) {
        app.accelerometer.start();
        // fetch uplink so that it starts connecting;
        // app.fetchService("uplink");
        var controller = Controller($root, app);
        var display = Display($root);
        var presenter = present(app);
        function update() {
            for (var attribute in display) {
                if (display.hasOwnProperty(attribute)) {
                    display[attribute] = presenter[attribute];
                }
            }
        }
        app.onResetReadings(update);
        app.onNewReading(update);
        return {
            update: update
        };
    }

    function Controller$1($root, app) {
        var events = Events($root);
        events.on("click", function (evt) {
            app.closeNotices();
        });
    }

    /* jshint esnext: true */
    function Display$1($root) {
        var $message = $root.querySelector("[data-display~=message]");
        return Object.create({}, {
            active: {
                set: function (active) {
                    var ACTIVE = "active";
                    if (active) {
                        $root.classList.add(ACTIVE);
                    }
                    else {
                        $root.classList.remove(ACTIVE);
                    }
                },
                enumerable: true
            },
            message: {
                set: function (message) {
                    $message.innerHTML = message;
                }
            }
        });
    }

    function Notice($root, app) {
        var display = Display$1($root);
        var controller = Controller$1($root, app);
        function update() {
            var message = app.notices[0];
            if (message) {
                display.message = message;
                display.active = true;
            }
            else {
                display.active = false;
            }
        }
        app.onBadReading(update);
        app.onCloseNotices(update);
        return {
            update: update
        };
    }

    var client = start({
        console: wrap(development, { prefix: "Lob client" })
    });
    ready(function () {
        var $avionics = document.querySelector("[data-interface~=avionics]");
        window.avionics = create($avionics, client);
        var $notices = document.querySelector("[data-component~=notices]");
        window.notices = Notice($notices, client);
    });

    return client;

})();
//# sourceMappingURL=lob.js.map