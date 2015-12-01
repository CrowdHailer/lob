var Lob = (function () { 'use strict';

    // TODO test
    var ActionDispatcher = (function () {
        function ActionDispatcher() {
            this.listeners = [];
        }
        ActionDispatcher.prototype.addListener = function (listener) {
            this.listeners = this.listeners.concat(listener);
        };
        ActionDispatcher.prototype.dispatch = function (action) {
            if (this.listeners.length == 0) {
                console.warn("no listeners", action);
            }
            else {
                this.listeners.forEach(function (listener) { listener(action); });
            }
        };
        return ActionDispatcher;
    })();

    function getParameterByName(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"), results = regex.exec(location.search);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }
    // Uplink represents a single channel
    var Uplink = (function () {
        function Uplink(options) {
            var token = options["token"];
            var channelName = options["channelName"];
            var realtime = new Ably.Realtime({ token: token });
            realtime.connection.on("failed", function () {
                alert("failed to connect");
            });
            this.channel = realtime.channels.get(channelName);
        }
        Uplink.prototype.publish = function (eventName, vector) {
            this.channel.publish(eventName, vector, function (err) {
                if (err) {
                    console.log("Unable to publish message; err = " + err.message);
                }
                else {
                    console.log("Message successfully sent");
                }
            });
        };
        Uplink.prototype.subscribe = function (eventName, callback) {
            this.channel.subscribe(eventName, callback);
        };
        Uplink.getUplinkToken = function () {
            return getParameterByName("token");
        };
        ;
        Uplink.getChannelName = function () {
            return getParameterByName("channel");
        };
        ;
        return Uplink;
    })();

    function streak(predicate, collection) {
        var current_streak = [];
        var output = [];
        collection.forEach(function (item) {
            if (predicate(item)) {
                current_streak.push(item);
            }
            else {
                if (current_streak.length !== 0) {
                    output.push(current_streak);
                }
                current_streak = [];
            }
        });
        if (current_streak.length !== 0) {
            output.push(current_streak);
        }
        return output;
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
    // TODO currently untested
    function round(precision) {
        return function (value) {
            return parseFloat(value.toPrecision(precision));
        };
    }

    var Readings = (function () {
        function Readings(readings) {
            if (readings === void 0) { readings = []; }
            this.readings = readings;
        }
        Object.defineProperty(Readings.prototype, "duration", {
            get: function () {
                if (this.readings.length === 0) {
                    return 0;
                }
                var last = this.readings.length;
                var t0 = this.readings[0].timestamp;
                var t1 = this.readings[last - 1].timestamp;
                return (t1 - t0) / 1000;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Readings.prototype, "flightTime", {
            get: function () {
                var streaks = streak(function (reading) {
                    var a = reading.acceleration;
                    var magnitude = Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z);
                    return magnitude < 4;
                }, this.readings);
                var flightDurations = streaks.map(function (list) {
                    var last = list.length;
                    var t0 = list[0].timestamp;
                    var t1 = list[last - 1].timestamp;
                    // DEBT remove magic numbers
                    return (t1 + 250 - t0) / 1000;
                });
                var flightDuration = Math.max.apply(null, flightDurations);
                return Math.max(0, flightDuration);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Readings.prototype, "length", {
            get: function () {
                return this.readings.length;
            },
            enumerable: true,
            configurable: true
        });
        Readings.prototype.addReading = function (newReading) {
            return new Readings(this.readings.concat(newReading));
        };
        return Readings;
    })();

    // The data logger is implemented as a flux style store.
    // It does not have a dispatch method and currently the application knows directly which methods to call on the data logger
    // Views/Displays are registered with by registerDisplay
    // At the moment after each change of state action a call to updateDisplays must be made manually.
    // DEBT uplink untested
    var DataLogger = (function () {
        function DataLogger(uplink) {
            this.displays = [];
            this.readings = new Readings();
            this.status = "READY";
            this.uplink = uplink;
        }
        // Responses to external actions
        DataLogger.prototype.start = function () {
            this.status = "READING";
            this.updateDisplays();
        };
        DataLogger.prototype.newReading = function (reading) {
            if (this.status == "READING") {
                this.readings = this.readings.addReading(reading);
                this.uplink.publish("accelerometerReading", reading);
                this.updateDisplays();
            }
        };
        DataLogger.prototype.stop = function () {
            this.status = "COMPLETED";
            this.updateDisplays();
        };
        DataLogger.prototype.reset = function () {
            this.status = "READY";
            this.readings = new Readings();
            this.uplink.publish("reset", null);
            this.updateDisplays();
        };
        Object.defineProperty(DataLogger.prototype, "maxAltitude", {
            get: function () {
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
                if (this.status == "COMPLETED") {
                    var t = this.readings.flightTime;
                    return round(2)(9.81 / 8 * t * t);
                }
                else {
                    return 0;
                }
            },
            enumerable: true,
            configurable: true
        });
        DataLogger.prototype.updateDisplays = function () {
            var self = this;
            this.displays.forEach(function (view) {
                view.update(self);
            });
        };
        DataLogger.prototype.registerDisplay = function (display) {
            this.displays.push(display);
            display.update(this);
        };
        DataLogger.READY = "READY";
        DataLogger.READING = "READING";
        DataLogger.COMPLETED = "COMPLETED";
        return DataLogger;
    })();

    // All code relating to manipulations requiring a document, element or window node.
    // DEBT untested
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

    // Interfaces are where user interaction is transformed to domain interactions
    // There is only one interface in this application, this one the avionics interface
    // It can therefore be set up to run on the document element
    var AvionicsInterface = (function () {
        function AvionicsInterface($root, actions) {
            this.$root = $root;
            this.actions = actions;
            var events = Events($root, null);
            events.on("click", "[data-command~=start]", function (evt) {
                actions.startLogging();
            });
            events.on("click", "[data-command~=stop]", function (evt) {
                actions.stopLogging();
            });
            events.on("click", "[data-command~=reset]", function (evt) {
                actions.clearDataLog();
            });
            // events.on("submit", "[data-command~=submit]", function (evt: Event) {
            //   evt.preventDefault();
            //   var input: any = evt.srcElement.querySelector("input");
            //   actions.submitFlightLog(input.value);
            // });
        }
        return AvionicsInterface;
    })();

    // Display elements are updated with the state of a store when they are registered to the store.
    // DEBT the data logger display will cause an error if the elements are not present, this error should be caught by the dispatcher when it is registered
    // TODO currently untested
    var DataLoggerDisplay = (function () {
        function DataLoggerDisplay($root) {
            this.$root = $root;
            this.$flightTime = $root.querySelector("[data-hook~=flight-time]");
            this.$maxAltitude = $root.querySelector("[data-hook~=max-altitude]");
            this.$startButton = $root.querySelector("[data-command~=start]");
            this.$stopButton = $root.querySelector("[data-command~=stop]");
            this.$resetButton = $root.querySelector("[data-command~=reset]");
            this.$submitButton = $root.querySelector("[data-command~=submit]");
            this.$flightTimeInput = $root.querySelector("[name~=flight-time]");
            this.$maxAltitudeInput = $root.querySelector("[name~=max-altitude]");
            var regex = /^\/([^\/]+)/;
            var channel = window.location.pathname.match(regex)[1];
            var $channelName = $root.querySelector("[data-hook~=channel-name]");
            $channelName.innerHTML = "Watch on channel '" + channel + "'";
        }
        DataLoggerDisplay.prototype.update = function (state) {
            this.$flightTime.innerHTML = state.readings.flightTime + "s";
            this.$flightTimeInput.value = state.readings.flightTime;
            this.$maxAltitude.innerHTML = state.maxAltitude + "m";
            this.$maxAltitudeInput.value = state.maxAltitude;
            if (state.status == DataLogger.READY) {
                this.$startButton.hidden = false;
            }
            else {
                this.$startButton.hidden = true;
            }
            if (state.status == DataLogger.READING) {
                this.$stopButton.hidden = false;
            }
            else {
                this.$stopButton.hidden = true;
            }
            if (state.status == DataLogger.COMPLETED) {
                this.$resetButton.hidden = false;
                this.$submitButton.style.display = "";
            }
            else {
                this.$resetButton.hidden = true;
                this.$submitButton.style.display = "none";
            }
        };
        return DataLoggerDisplay;
    })();

    console.log("Starting boot ...");
    var startLogging = new ActionDispatcher();
    var stopLogging = new ActionDispatcher();
    var clearDataLog = new ActionDispatcher();
    var newReading = new ActionDispatcher();
    var submitFlightLog = new ActionDispatcher();
    // The actions class acts as the dispatcher in a flux architecture
    // It is the top level interface for the application
    var Actions = (function () {
        function Actions() {
        }
        Actions.prototype.startLogging = function () {
            startLogging.dispatch();
        };
        Actions.prototype.stopLogging = function () {
            stopLogging.dispatch();
        };
        Actions.prototype.newReading = function (reading) {
            newReading.dispatch(reading);
        };
        Actions.prototype.clearDataLog = function () {
            clearDataLog.dispatch();
        };
        Actions.prototype.submitFlightLog = function (name) {
            submitFlightLog.dispatch(name);
        };
        return Actions;
    })();
    var actions = new Actions();
    // DEBT will fail if there is no key.
    // Need to return null uplink and warning if failed
    if (Uplink.getChannelName()) {
        var uplink = new Uplink({ token: Uplink.getUplinkToken(), channelName: Uplink.getChannelName() });
    }
    var dataLogger = new DataLogger(uplink);
    startLogging.addListener(dataLogger.start.bind(dataLogger));
    stopLogging.addListener(dataLogger.stop.bind(dataLogger));
    clearDataLog.addListener(dataLogger.reset.bind(dataLogger));
    newReading.addListener(dataLogger.newReading.bind(dataLogger));
    var FlightLogUploader = (function () {
        function FlightLogUploader(dataLogger) {
            this.dataLogger = dataLogger;
        }
        FlightLogUploader.prototype.submit = function (name) {
            var request = new XMLHttpRequest();
            request.open("POST", "/submit", true);
            request.onload = function () {
                if (request.status >= 200 && request.status < 400) {
                    // Success!
                    var resp = request.responseText;
                }
                else {
                }
            };
            request.onerror = function () {
                console.log("some error");
                // There was a connection error of some sort
            };
            console.log(this.dataLogger.readings);
            console.log(name);
            request.send({ name: name, readings: this.dataLogger.readings.readings });
        };
        return FlightLogUploader;
    })();
    var flightLogUploader = new FlightLogUploader(dataLogger);
    submitFlightLog.addListener(flightLogUploader.submit.bind(flightLogUploader));
    function reportDeviceMotionEvent(deviceMotionEvent) {
        var raw = deviceMotionEvent.accelerationIncludingGravity;
        if (typeof raw.x === "number") {
            actions.newReading({ acceleration: { x: raw.x, y: raw.y, z: raw.z }, timestamp: Date.now() });
        }
        else {
            console.warn("Device accelerometer returns null data");
        }
    }
    var throttledReport = throttle(reportDeviceMotionEvent, 250, {});
    // Accelerometer events are continually fired
    // DEBT the accelerometer is not isolated as a store that can be observed.
    // Implementation as a store will be necessary so that it can be observed and error messages when the accelerometer returns improper values can be
    window.addEventListener("devicemotion", throttledReport);
    ready(function () {
        var $dataLoggerDisplay = document.querySelector("[data-display~=data-logger]");
        if ($dataLoggerDisplay) {
            var dataLoggerDisplay = new DataLoggerDisplay($dataLoggerDisplay);
            dataLogger.registerDisplay(dataLoggerDisplay);
        }
        var $avionics = document.querySelector("[data-interface~=avionics]");
        var avionicsInterface = new AvionicsInterface($avionics, actions);
    });
    ready(function () {
        var $tracker = document.querySelector("[data-display~=tracker]");
        // Procedual handling of canvas drawing
        if ($tracker) {
            var canvas = document.querySelector("#myChart");
            var ctx = canvas.getContext("2d");
            var myNewChart = new Chart(ctx);
            var data = {
                labels: [],
                datasets: [{
                        label: "My First dataset",
                        fillColor: "rgba(220,220,220,0)",
                        strokeColor: "limegreen",
                        pointColor: "limegreen",
                        data: []
                    }, {
                        label: "My First dataset",
                        fillColor: "rgba(220,220,220,0)",
                        strokeColor: "green",
                        pointColor: "green",
                        data: []
                    }, {
                        label: "My First dataset",
                        fillColor: "rgba(220,220,220,0)",
                        strokeColor: "teal",
                        pointColor: "teal",
                        data: []
                    }, {
                        label: "My First dataset",
                        fillColor: "rgba(220,220,220,0)",
                        strokeColor: "orange",
                        pointColor: "orange",
                        data: []
                    }]
            };
            var myLineChart = new Chart(ctx).Line(data, { animation: false, animationSteps: 4, pointDot: false });
            var i = 0.0;
            uplink.subscribe("accelerometerReading", function (message) {
                var x = message.data.acceleration.x;
                var y = message.data.acceleration.y;
                var z = message.data.acceleration.z;
                console.log(message.data);
                var m = Math.sqrt(x * x + y * y + z * z);
                myLineChart.addData([x, y, z, m], i);
                i = i + 0.25;
            });
            uplink.subscribe("reset", function (message) {
                console.log("bananas");
                myLineChart.destroy();
                i = 0.0;
                data.labels = [];
                // labels array is mutated by adding data.
                myLineChart = new Chart(ctx).Line(data, { animation: false, animationSteps: 4, pointDot: false });
            });
        }
    });

    return actions;

})();
//# sourceMappingURL=lob.js.map