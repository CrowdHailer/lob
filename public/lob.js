var Lob = (function () { 'use strict';

    /* jshint esnext: true */
    function create(prefix) {
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
    function Development(options, logger) {
        var prefix;
        var notices = [];
        if (options.prefix) {
            prefix = "[" + options.prefix + "]";
            notices = notices.concat(prefix);
        }
        var argsToArray = function (args) {
            return Array.prototype.slice.call(args);
        };
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
            throw e;
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
    var NullLogger = {
        info: function (a) { },
        warn: function (a) { },
        error: function (a) { },
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
            if (handlers.length === 0) {
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
    function create$3(world) {
        if (world == void 0) {
            world = DEFAULT;
        }
        return new Dispatcher([], world);
    }
    ;

    function create$2(filter, logger) {
        if (logger == void 0) {
            logger = NullLogger;
        }
        var action;
        var dispatcher = create$3(logger);
        action = function (minutiae) {
            var noDetailWithAction = arguments.length === 0;
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
    Function.I = function (a) {
        return a;
    };

    var Actions = {
        newReading: create$2(Function.I, create("New Reading")),
        resetReadings: create$2(Function.I, create("Reset")),
        badReading: create$2(Function.I, create("Bad Reading")),
        uplinkAvailable: create$2(Function.I, create("Uplink Available")),
        startTransmitting: create$2(Function.I, create("Start Transmitting")),
        failedConnection: create$2(Function.I, create("Failed Connection")),
        closeNotice: create$2(Function.I, create("Notice Closed")),
    };

    function App(actions, logger) {
        if (logger == void 0) {
            logger = DEFAULT;
        }
        var services = {};
        var components = {};
        // var store = Store();
        // actions.newReading.register(store.newReading);
        // actions.startStreaming.register(store.startStreaming);
        return {
            registerService: function (name, factory) {
                if (services[name]) {
                    logger.error(new TypeError("Service name already registered: " + name));
                    return;
                }
                services[name] = {
                    factory: factory
                };
            },
            fetchService: function (name) {
                var service = services[name];
                if (!service) {
                    logger.error(new TypeError("Service not found: " + name));
                    return;
                }
                if (service.instance) {
                    return service.instance;
                }
                service.instance = service.factory(this);
                return service.instance;
            },
            registerComponent: function (name, factory) {
                components[name] = { factory: factory };
            },
            // name optional get from element data attribute
            startComponent: function (element, name) {
                var component = components[name];
                return component.factory(element, this);
            },
            actions: actions,
            logger: logger
        };
    }

    /* jshint esnext: true */
    function default_1(app) {
        var uplink = {
            startTransmission: function () {
            }
        };
        app.actions.startTransmitting.register(uplink.startTransmission);
        return uplink;
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
    function create$1($root, app) {
        app.fetchService("accelerometer").start();
        // fetch uplink so that it starts connecting;
        app.fetchService("uplink");
        console.log("mounting avionics component");
        var controller = Controller($root, app.actions);
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

    /* jshint esnext: true */
    console.log("starting Client");
    var MyApp = App(Actions, Development({ prefix: "Lob" }, window.console));
    MyApp.registerService("accelerometer", function (app) {
        return {
            start: function () {
                app.logger.warn("accelerometer");
            }
        };
    });
    MyApp.registerService("uplink", default_1);
    MyApp.registerComponent("avionics", create$1);
    ready(function () {
        var $avionics = document.querySelector("[data-interface]");
        var avionics = MyApp.startComponent($avionics, "avionics");
    });

    return MyApp;

})();
//# sourceMappingURL=lob.js.map