/* jshint esnext: true */
console.log("starting Client");

import App from "./app";

var MyApp = App();
MyApp.registerComponent("avionics", function(element, enviroment){
  // could pass on reading / on error into start
  enviroment.getService("accelerometer").start();
  console.log("mounting avionics component");
});

import { ready } from "./utils/dom";

ready(function(){
  var $avionics = document.querySelector("[data-interface]");
  var avionics = MyApp.startComponent($avionics, "avionics");
});