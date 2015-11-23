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
  startLogging(){
    // this.dataLogger.start();
  }
  stopLogging(){
    console.info("stopLogging");
  }
  newReading(reading) {
    this.dataLogger.newReading(reading);
  }
  clearDataLog(){
    this.dataLogger.reset();
  }
}

var actions = new Actions();

var dataLogger = new DataLogger();

actions.dataLogger = dataLogger;

class DataLoggerDisplay {
  $root: Element;
  $flightTime: any;
  constructor($root){
    this.$root = $root;
    this.$flightTime = $root.querySelector("[data-hook~=flight-time]");
  }
  update (state) {
    this.$flightTime.innerHTML = state.readings.flightTime;
    console.log(state.readings.duration);
    console.log(state.readings.length);
  }
}

window.addEventListener("devicemotion", function (deviceMotionEvent) {
  var raw = deviceMotionEvent.accelerationIncludingGravity;
  if (typeof raw.x === "number") {
    actions.newReading({acceleration: {x: raw.x, y: raw.y, z: raw.z}, timestamp: Date.now()});
  }
  else {
    console.warn("Device accelerometer returns null data");
  }
});
import { ready } from "./dom.ts";
ready(function () {
  var $dataLoggerDisplay = document.querySelector("[data-display~=data-logger]");
  var dataLoggerDisplay = new DataLoggerDisplay($dataLoggerDisplay);

  dataLogger.registerDisplay(dataLoggerDisplay);

  var $avionics = document.querySelector("[data-interface~=avionics]");
  var avionicsInterface = new AvionicsInterface($avionics, actions);
});

export default actions;
