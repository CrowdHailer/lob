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
window.avionics = avionics;

console.log("Finished Boot");

function FlyerPage1($root) {
  var $button = $.querySelector("button", $root);
  console.log($button);
  $button.addEventListener("click", function (e) {
    console.log("clicked");
  });

  return {
    update: function (avionics) {
      if (avionics.isAvailable()) {
        $button.disabled = false;
      } else {
        $button.disabled = true;
      }

      if (avionics.isRecording()) {
        $root.classList.add("hidden");
      } else {
      }
    }
  };

}

import * as $ from "./dom";

$.ready(function () {
  console.log("starting dom");
  // FLYER PAGE 1
  var $flyerPage1 = $.component("flyer-page-1", window.document);
  if ($flyerPage1) {
    var flyerPage1 = FlyerPage1($flyerPage1);
    avionics.mount(flyerPage1);
  }

});

export default app;
