/*jshint esnext: true */

import Actions from "./actions";
import Dispatcher from "./dispatcher";

import Accelerometer from "./accelerometer";

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

var accelerometer = Accelerometer(app, window);
stores.push(accelerometer);

console.log("Finished Boot");

import * as $ from "./dom";

$.ready(function () {
  console.log("starting dom");
  // FLYER PAGE 1
  var $flyerPage1 = $.component("flyer-page-1", window.document);
  if ($flyerPage1) {
    var $button = $.querySelector("button", $flyerPage1);
    console.log($button);
    $button.addEventListener("click", function (e) {
      console.log("clicked");
    });
  }

});

export default app;
