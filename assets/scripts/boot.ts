console.log("Starting boot ...");

import * as Action from "./action.ts";
import * as Logger from "./logger.ts";

var Actions = {
  startLogging: Action.create(function(){ null; }, Logger.create("Start Logging")),
  stopLogging: Action.create(function(){ null; }, Logger.create("Stop Logging")),
  newReading: Action.create(function(a: any){ return a; }, Logger.create("new Reading")),
  clearDataLog: Action.create(function(){ null; }, Logger.create("Clear Datalog")),
  submitFlightLog: Action.create(function(){ null; }, Logger.create("Submit Flight log")),
  failedConnection: Action.create(function(reason: any){ return reason; }, Logger.create("Failed Connection")),
};
// These Actions are the top level interface for the application

// SETUP SERVICES WITHOUT REQUIREMENT ON THE DOM

import Uplink from "./uplink.ts";

// DEBT will fail if there is no key.
// Need to return null uplink and warning if failed

import { getParameterByName } from "./utils.ts";
var token = getParameterByName("token");
// i.e. channel name
var name = getParameterByName("channel");

if (name) {
  var uplink = new Uplink({token: token, channelName: name}, Actions);
}


import DataLogger from "./data-logger.ts";
var dataLogger = new DataLogger(uplink);

Actions.startLogging.register(dataLogger.start.bind(dataLogger));
Actions.stopLogging.register(dataLogger.stop.bind(dataLogger));
Actions.clearDataLog.register(dataLogger.reset.bind(dataLogger));
Actions.newReading.register(dataLogger.newReading.bind(dataLogger));


class FlightLogUploader {
  dataLogger;
  constructor(dataLogger){
    this.dataLogger = dataLogger;
  }
  submit(name){
    var request = new XMLHttpRequest();
    request.open("POST", "/submit", true);

    request.onload = function() {
      if (request.status >= 200 && request.status < 400) {
        // Success!
        var resp = request.responseText;
      } else {
        // We reached our target server, but it returned an error

      }
    };

    request.onerror = function() {
      console.log("some error");
      // There was a connection error of some sort
    };

    console.log(this.dataLogger.readings);
    console.log(name);
    request.send({name: name, readings: this.dataLogger.readings.readings});
  }
}

var flightLogUploader = new FlightLogUploader(dataLogger);
Actions.submitFlightLog.register(flightLogUploader.submit.bind(flightLogUploader));


function reportDeviceMotionEvent (deviceMotionEvent) {
  var raw = deviceMotionEvent.accelerationIncludingGravity;
  if (typeof raw.x === "number") {
    Actions.newReading({acceleration: {x: raw.x, y: raw.y, z: raw.z}, timestamp: Date.now()});
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
  var avionicsInterface = new AvionicsInterface($avionics, Actions);
});

export default Actions;





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
