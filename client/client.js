/* jshint esnext: true */
console.log("starting Client");

import App from "./app";
import { Development } from "./utils/logger";

var MyApp = App({}, Development({prefix: "Lob"}, window.console));
MyApp.registerService("accelerometer", function(app){
  return {
    start: function(){
      app.logger.warn("accelerometer");
    }
  };
});

MyApp.registerService("uplink", function(app){
  return {
    startTransmission: function(){
      app.logger.debug("Started Transmission");
    }
  };
});

import Avionics from "./avionics/avionics";
MyApp.registerComponent("avionics", Avionics);

import { ready } from "./utils/dom";

ready(function(){
  var $avionics = document.querySelector("[data-interface]");
  var avionics = MyApp.startComponent($avionics, "avionics");
});
