(function () { 'use strict';

    /* jshint esnext: true */
    // import Store from "./store";
    function App(actions) {
        var services = {};
        var components = {};
        // var store = Store();
        // actions.newReading.register(store.newReading);
        // actions.startStreaming.register(store.startStreaming);
        return {
            registerService: function (name, factory) {
                // TODO throw error if preRegistered
                services[name] = { factory: factory };
            },
            fetchService: function (name) {
                // TODO throw error if not present
                var service = services[name];
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
                console.log(components);
                return component.factory(element, this);
            },
            actions: actions,
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
    var MyApp = App();
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