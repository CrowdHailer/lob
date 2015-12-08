(function () { 'use strict';

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
    var MyApp = App({}, Development({ prefix: "Lob" }, window.console));
    MyApp.registerService("accelerometer", function (app) {
        return {
            start: function () {
                app.logger.warn("accelerometer");
            }
        };
    });
    MyApp.registerComponent("avionics", function (element, enviroment) {
        // could pass on reading / on error into start
        enviroment.fetchService("accelerometer").start();
        console.log("mounting avionics component");
    });
    ready(function () {
        var $avionics = document.querySelector("[data-interface]");
        var avionics = MyApp.startComponent($avionics, "avionics");
    });

})();
//# sourceMappingURL=lob.js.map