console.log("Starting boot ...");

import * as Action from "./action.ts";
import * as Logger from "./logger.ts";

var actions = {
  newReading: Action.create(function(a: any){ return a; }, Logger.create("New Reading")),
  resetReadings: Action.create(function(){ null; }, Logger.create("Reset")),
  submitFlightLog: Action.create(function(){ null; }, Logger.create("Submit Flight log")),
  failedConnection: Action.create(function(reason: any){ return reason; }, Logger.create("Failed Connection")),
};

import Store from "./store.ts";

var store = Store();

store.resetReadings();

actions.resetReadings.register(store.resetReadings);
actions.newReading.register(store.newReading);

var App = {
  actions: actions,
  store: store
};

import Avionics from "./avionics/component.ts";
import { ready } from "./dom.ts";

ready(function () {
  var $avionics = document.querySelector("[data-interface~=avionics]");
  var avionics = Avionics($avionics, App);
});
export default App;

function reportDeviceMotionEvent (deviceMotionEvent) {
  var raw = deviceMotionEvent.accelerationIncludingGravity;
  if (typeof raw.x === "number") {
    App.actions.newReading({acceleration: {x: raw.x, y: raw.y, z: raw.z}, timestamp: Date.now()});
  }
  else {
    console.warn("Device accelerometer returns null data");
  }
}

import { throttle } from "./utils.ts";

var throttledReport = throttle(reportDeviceMotionEvent, 50, {});

// Accelerometer events are continually fired
// DEBT the accelerometer is not isolated as a store that can be observed.
// Implementation as a store will be necessary so that it can be observed and error messages when the accelerometer returns improper values can be
window.addEventListener("devicemotion", throttledReport);
