/*jshint esnext: true */

// SETUP APPLICATION

import Actions from "./actions";
import Dispatcher from "./dispatcher";

var dummyStore = {
  dispatch: function (action) {
    if (action.error) {
      console.warn(action);
    } else {
      console.info(action);
    }
  }
};

var stores = [dummyStore];
var dispatcher = Dispatcher(stores);

var app = Actions(dispatcher);

// SETUP UTILITIES

import Accelerometer from "./accelerometer";

var accelerometer = Accelerometer(app, window);
stores.push(accelerometer);

// SETUP COMPONENTS

import Avionics from "./avionics";
var avionics = Avionics();
// DEBT
stores.push(avionics);
window.avionics = avionics;

console.log("Finished Boot");

import * as $ from "./dom";
import AvionicsConsole from "./avionics_console";

$.ready(function () {
  var $avionicsConsole = $.component("avionics-console", window.document);
  var avionicsConsole = AvionicsConsole($avionicsConsole);
  avionics.mount(avionicsConsole);

  document.addEventListener("startRecording", function (event) {
    app.startRecording();
  });

});

export default app;
