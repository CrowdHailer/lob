(function () { 'use strict';

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
    function default_1() {
        return new MyStore();
    }

    function App(actions) {
        var services = {};
        var components = {};
        var store = default_1();
        // actions.newReading.register(store.newReading);
        // actions.startStreaming.register(store.startStreaming);
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
            // name optional get from element data attribute
            getComponent: function (element, name) {
                var component = components[name];
                return component.factory(element, this);
            },
            actions: actions,
            store: store
        };
    }

    /* jshint esnext: true */
    console.log("starting Client");
    var MyApp = App();
    MyApp.registerComponent("avionics", function (element, enviroment) {
        // could pass on reading / on error into start
        enviroment.getService("accelerometer").start();
        console.log("mounting avionics component");
    });
    var avionics = MyApp.getComponent("avionics");

})();
//# sourceMappingURL=lob.js.map