console.log("Starting boot ...");

import ActionDispatcher from "./action-dispatcher.ts";

var startLogging = new ActionDispatcher<void>();
var stopLogging = new ActionDispatcher<void>();
var clearDataLog = new ActionDispatcher<void>();
var newReading = new ActionDispatcher<any>();

// The actions class acts as the dispatcher in a fluc architecture
// It also acts as the actions interface that is put on top of the dispatcher
// Stores are not registered generally as there is only two stores the datalogger and the uplink
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
}

var actions = new Actions();

import Uplink from "./uplink.ts";

if (Uplink.getChannelName()) {
  var uplink = new Uplink({key: Uplink.getUplinkKey(), channelName: Uplink.getChannelName()});
}

import Events from "./gator.js";

// Interfaces are where user interaction is transformed to domain interactions
// There is only one interface in this application, this one the avionics interface
// It can therefore be set up to run on the document element
class AvionicsInterface {
  private $root;
  private actions;
  constructor ($root, actions) {
    this.$root = $root;
    this.actions = actions;
    var events = Events($root, null);
    events.on("click", "[data-command~=start]", function (evt: Event) {
      actions.startLogging();
    });
    events.on("click", "[data-command~=stop]", function (evt: Event) {
      actions.stopLogging();
    });
    events.on("click", "[data-command~=reset]", function (evt: Event) {
      actions.clearDataLog();
    });
  }
}

import DataLogger from "./data-logger.ts";
var dataLogger = new DataLogger(uplink);

startLogging.addListener(dataLogger.start.bind(dataLogger));
stopLogging.addListener(dataLogger.stop.bind(dataLogger));
clearDataLog.addListener(dataLogger.reset.bind(dataLogger));
newReading.addListener(dataLogger.newReading.bind(dataLogger));

import DataLoggerDisplay from "./data-logger-display.ts";

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
