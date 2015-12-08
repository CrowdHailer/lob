/* jshint esnext: true */
// import Store from "./store";

export default function App(actions){
  var services = {};
  var components = {};
  // var store = Store();
  // actions.newReading.register(store.newReading);
  // actions.startStreaming.register(store.startStreaming);

  return {
    registerService: function(name, factory){
      services[name] ={factory: factory};
    },
    fetchService: function(name){
      var service = services[name];
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
      console.log(components)
      return component.factory(element, this);
    },
    actions: actions,
    // store: store
  };
}
