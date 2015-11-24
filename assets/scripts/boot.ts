console.log("Starting boot ...");

import Events from "./gator.js";

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
class Actions {
  dataLogger: DataLogger;
  uplink: Uplink;
  startLogging(){
    this.dataLogger.start();
  }
  stopLogging(){
    this.dataLogger.stop();
  }
  newReading(reading) {
    this.dataLogger.newReading(reading);
    if (this.dataLogger.status == "READING") {
      this.uplink.publish("accelerometerReading", reading);
    }
  }
  clearDataLog(){
    this.dataLogger.reset();
    this.uplink.publish("reset", null);
  }
}

var actions = new Actions();

var dataLogger = new DataLogger();

actions.dataLogger = dataLogger;

class DataLoggerDisplay {
  $root: Element;
  $flightTime: any;
  $maxAltitude;
  $startButton;
  $stopButton;
  $resetButton;
  constructor($root){
    this.$root = $root;
    this.$flightTime = $root.querySelector("[data-hook~=flight-time]");
    this.$maxAltitude = $root.querySelector("[data-hook~=max-altitude]");
    this.$startButton = $root.querySelector("[data-command~=start]");
    this.$stopButton = $root.querySelector("[data-command~=stop]");
    this.$resetButton = $root.querySelector("[data-command~=reset]");
  }
  update (state) {
    this.$flightTime.innerHTML = state.readings.flightTime + "s";
    console.log(state);
    this.$maxAltitude.innerHTML = state.maxAltitude + "m";

    if (state.status == DataLogger.READY) {
      this.$startButton.hidden = false;
    } else {
      this.$startButton.hidden = true;
    }
    if (state.status == DataLogger.READING) {
      this.$stopButton.hidden = false;
    } else {
      this.$stopButton.hidden = true;
    }
    if (state.status == DataLogger.COMPLETED) {
      this.$resetButton.hidden = false;
    } else {
      this.$resetButton.hidden = true;
    }
  }
}

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

var regex = /^\/([^\/]+)/;
var channel = window.location.pathname.match(regex)[1];
var key = window.location.hash.match(/#(.+)/)[1];
console.info(channel);
console.info(key);

declare var Ably: any;
declare var Chart: any;
class Uplink {
  channel: any;
  constructor(options) {
    var key = options["key"];
    var channelName = options["channelName"];
    var realtime = new Ably.Realtime({ key: key });
    this.channel = realtime.channels.get(channelName);
  }
  publish(eventName, vector){
    this.channel.publish(eventName, vector, function(err) {
      if(err) {
        console.log("Unable to publish message; err = " + err.message);
      } else {
        console.log("Message successfully sent");
      }
    });
  }
  subscribe(eventName, callback) {
    this.channel.subscribe(eventName, callback);
  }
}

var uplink = new Uplink({key: key, channelName: channel});
actions.uplink = uplink;


ready(function () {
  var $tracker = document.querySelector("[data-display~=tracker]");
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
