console.log("Starting boot ...");

// SETUP ACTIONS FOR THIS application

import ActionDispatcher from "./action-dispatcher.ts";

var startLogging = new ActionDispatcher<void>();
var stopLogging = new ActionDispatcher<void>();
var clearDataLog = new ActionDispatcher<void>();
var newReading = new ActionDispatcher<any>();
var submitFlightLog = new ActionDispatcher<any>();

// The actions class acts as the dispatcher in a flux architecture
// It is the top level interface for the application
class Actions {
  startLogging(){
    startLogging.dispatch();
  }
  stopLogging(){
    stopLogging.dispatch();
  }
  newReading(reading) {
    newReading.dispatch(reading);
  }
  clearDataLog(){
    clearDataLog.dispatch();
  }
  submitFlightLog(){
    submitFlightLog.dispatch();
  }
}

var actions = new Actions();


// SETUP SERVICES WITHOUT REQUIREMENT ON THE DOM

import Uplink from "./uplink.ts";

// DEBT will fail if there is no key.
// Need to return null uplink and warning if failed

if (Uplink.getChannelName()) {
  var uplink = new Uplink({key: Uplink.getUplinkKey(), channelName: Uplink.getChannelName()});
}


import DataLogger from "./data-logger.ts";
var dataLogger = new DataLogger(uplink);

startLogging.addListener(dataLogger.start.bind(dataLogger));
stopLogging.addListener(dataLogger.stop.bind(dataLogger));
clearDataLog.addListener(dataLogger.reset.bind(dataLogger));
newReading.addListener(dataLogger.newReading.bind(dataLogger));




function reportDeviceMotionEvent (deviceMotionEvent) {
  var raw = deviceMotionEvent.accelerationIncludingGravity;
  if (typeof raw.x === "number") {
    actions.newReading({acceleration: {x: raw.x, y: raw.y, z: raw.z}, timestamp: Date.now()});
  }
  else {
    console.warn("Device accelerometer returns null data");
  }
}

import { throttle } from "./utils.ts";

var throttledReport = throttle(reportDeviceMotionEvent, 250, {});

// Accelerometer events are continually fired
// DEBT the accelerometer is not isolated as a store that can be observed.
// Implementation as a store will be necessary so that it can be observed and error messages when the accelerometer returns improper values can be
window.addEventListener("devicemotion", throttledReport);

import AvionicsInterface from "./avionics-interface.ts";
import DataLoggerDisplay from "./data-logger-display.ts";

import { ready } from "./dom.ts";
ready(function () {
  var $dataLoggerDisplay = document.querySelector("[data-display~=data-logger]");
  if ($dataLoggerDisplay) {
    var dataLoggerDisplay = new DataLoggerDisplay($dataLoggerDisplay);
    dataLogger.registerDisplay(dataLoggerDisplay);
  }


  var $avionics = document.querySelector("[data-interface~=avionics]");
  var avionicsInterface = new AvionicsInterface($avionics, actions);
});

export default actions;





declare var Chart: any;

ready(function () {
  var $tracker = document.querySelector("[data-display~=tracker]");
  // Procedual handling of canvas drawing
  if ($tracker) {
    var canvas: any = document.querySelector("#myChart");
    var ctx = canvas.getContext("2d");
    var myNewChart = new Chart(ctx);
    var data = {
      labels: [],
      datasets: [{
        label: "My First dataset",
        fillColor: "rgba(220,220,220,0)",
        strokeColor: "limegreen",
        pointColor: "limegreen",
        data: []
      }, {
        label: "My First dataset",
        fillColor: "rgba(220,220,220,0)",
        strokeColor: "green",
        pointColor: "green",
        data: []
      }, {
        label: "My First dataset",
        fillColor: "rgba(220,220,220,0)",
        strokeColor: "teal",
        pointColor: "teal",
        data: []
      }, {
        label: "My First dataset",
        fillColor: "rgba(220,220,220,0)",
        strokeColor: "orange",
        pointColor: "orange",
        data: []
      }]
    };
    var myLineChart = new Chart(ctx).Line(data, {animation: false, animationSteps: 4, pointDot : false});
    var i = 0.0;
    uplink.subscribe("accelerometerReading", function(message) {
      var x = message.data.acceleration.x;
      var y = message.data.acceleration.y;
      var z = message.data.acceleration.z;
      console.log(message.data);
      var m = Math.sqrt(x*x + y*y + z*z);
      myLineChart.addData([x, y, z, m], i);
      i = i + 0.25;
    });
    uplink.subscribe("reset", function(message) {
      console.log("bananas");
      myLineChart.destroy();
      i = 0.0;
      data.labels = [];
      // labels array is mutated by adding data.
      myLineChart = new Chart(ctx).Line(data, {animation: false, animationSteps: 4, pointDot : false});
    });
  }
});
