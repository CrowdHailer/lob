console.log("Starting boot ...");

import * as Action from "./action.ts";
import * as Logger from "./logger.ts";

var actions = {
  newReading: Action.create(function(a: any){ return a; }, Logger.create("New Reading")),
  resetReadings: Action.create(function(){ null; }, Logger.create("Reset")),
  submitFlightLog: Action.create(function(){ null; }, Logger.create("Submit Flight log")),
  failedConnection: Action.create(function(reason: any){ return reason; }, Logger.create("Failed Connection")),
  badReading: Action.create(function(reading: any){ return reading; }, Logger.create("Bad Reading")),
};


import Store from "./store.ts";

var store = Store();
actions.resetReadings.register(store.resetReadings);
actions.newReading.register(store.newReading);


import Accelerometer from "./accelerometer.ts";
var accelerometer = Accelerometer(actions);

var App = {
  actions: actions,
  store: store,
  getAccelerometer: function(){
    return accelerometer;
  }
};


import Avionics from "./avionics/component.ts";
import { ready } from "./dom.ts";

ready(function () {
  var $avionics = document.querySelector("[data-interface~=avionics]");
  var avionics = Avionics($avionics, App);
});
export default App;
