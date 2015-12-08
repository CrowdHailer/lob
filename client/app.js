/* jshint esnext: true */
// import Store from "./store";

import { DEFAULT } from "./utils/logger";

export default function App(actions, logger){
  if (logger == void 0){ logger = DEFAULT; }
  var services = {};
  var components = {};
  // var store = Store();
  // actions.newReading.register(store.newReading);
  // actions.startStreaming.register(store.startStreaming);

  return {
    registerService: function(name, factory){
      if (services[name]) {
        logger.error(new TypeError("Service name already registered: " + name));
        return;
      }

      services[name] = {
        factory: factory
      };
    },
    fetchService: function(name){
      var service = services[name];
      if (!service){
        logger.error(new TypeError("Service not found: " + name));
        return;
      }

      if (service.instance) { return service.instance; }

      service.instance = service.factory(this);
      return service.instance;
    },
    registerComponent: function(name, factory){
      components[name] ={factory: factory};
    },
    // name optional get from element data attribute
    startComponent: function(element, name){
      var component = components[name];
      return component.factory(element, this);
    },
    actions: actions,
    logger: logger
    // store: store
  };
}
