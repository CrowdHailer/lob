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
MyApp.registerComponent("avionics", function(element, enviroment){
  // could pass on reading / on error into start
  enviroment.fetchService("accelerometer").start();
  console.log("mounting avionics component");
});

import { ready } from "./utils/dom";

ready(function(){
  var $avionics = document.querySelector("[data-interface]");
  var avionics = MyApp.startComponent($avionics, "avionics");
});
