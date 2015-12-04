console.log("Starting boot ...");

// SETUP ACTIONS FOR THIS application

import * as Dispatcher from "./dispatcher.ts";

function Action(func?, world?){
  // The default behaviour is to simply dispatch the call through to the dispatcher
  func = func || function(a){ this.dispatch(a); };

  // Set as any to allow adding methods to function
  var action: any;
  var dispatcher = Object.create(Dispatcher.create(world));
  action = func.bind(dispatcher);

  // Dispatcher is immutable so it is wrapped in a mutable object
  action.register = function(handler){
    dispatcher.__proto__ = dispatcher.register(handler);
  };
  return action;
};

function ErrorAction(func?, world?){
  func = func || function(a){ return a; };

  var dispatcher = Dispatcher.create(world);
  var action: any = function(action){
    dispatcher.dispatch(func(action));
  };
  action.register = function(handler){
    dispatcher = dispatcher.register(handler);
  };
  return action;
}

// The actions class acts as the dispatcher in a flux architecture
// It is the top level interface for the application
var Actions = {
  startLogging: Action(),
  stopLogging: Action(),
  newReading: Action(),
  clearDataLog: Action(),
  submitFlightLog: Action()
};

// SETUP SERVICES WITHOUT REQUIREMENT ON THE DOM

import Uplink from "./uplink.ts";

// DEBT will fail if there is no key.
// Need to return null uplink and warning if failed

if (Uplink.getChannelName()) {
  var uplink = new Uplink({token: Uplink.getUplinkToken(), channelName: Uplink.getChannelName()});
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
